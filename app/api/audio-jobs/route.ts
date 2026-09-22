import { randomBytes } from "node:crypto";
import { mkdtemp, readdir, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { isAuthenticated } from "@/app/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 300;

const youtubeHosts = new Set(["youtube.com", "www.youtube.com", "youtu.be", "m.youtube.com"]);
const mimeTypes = { mp3: "audio/mpeg", ogg: "audio/ogg", wav: "audio/wav" } as const;
const ytDlpArgs = () => [
  "--js-runtimes", process.env.YT_DLP_JS_RUNTIME || "node",
  "--extractor-args", "youtube:player_client=web_embedded,android_vr",
  ...(process.env.YT_DLP_COOKIES_FILE ? ["--cookies", process.env.YT_DLP_COOKIES_FILE] : []),
];
type OutputFormat = keyof typeof mimeTypes;

type AudioJob = {
  id: string;
  roblox_profile_id: string;
  youtube_url: string;
  amplifier_db: number;
  bass_boost_db: number;
  playback_speed: number;
  output_format: OutputFormat;
};

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server environment is not configured.");
  return { url, key };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, key } = supabaseConfig();
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  headers.set("Content-Type", "application/json");
  return fetch(`${url}/rest/v1/${path}`, { ...init, headers });
}

async function updateJob(id: string, values: Record<string, unknown>) {
  await supabaseFetch(`audio_jobs?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(values),
  });
}

function runCommand(command: string, args: string[], cwd: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} exited with code ${code}: ${stderr.slice(-1200)}`));
    });
  });
}

function randomText() {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return {
    name: `Campucino Audio ${suffix}`,
    description: `Processed audio approved by Campucino Community · batch ${suffix}`,
  };
}

function audioFilter(job: AudioJob) {
  const speed = Number(job.playback_speed);
  const tempo = speed > 2 ? `atempo=2.0,atempo=${(speed / 2).toFixed(3)}` : `atempo=${speed.toFixed(3)}`;
  return `bass=g=${Number(job.bass_boost_db).toFixed(2)}:f=90:w=0.7,volume=${Number(job.amplifier_db).toFixed(2)}dB,${tempo}`;
}

async function processJob(job: AudioJob) {
  const apiKey = process.env.ROBLOX_API_KEY;
  if (!apiKey) throw new Error("ROBLOX_API_KEY server environment is not configured.");

  const workdir = await mkdtemp(join(tmpdir(), "campucino-audio-"));
  try {
    await updateJob(job.id, { status: "processing" });
    const metadata = await runCommand("yt-dlp", [...ytDlpArgs(), "--dump-single-json", "--no-warnings", "--no-playlist", "--skip-download", job.youtube_url], workdir);
    const sourceMetadata = JSON.parse(metadata.stdout) as { title?: string; duration?: number };
    const originalTitle = sourceMetadata.title?.trim() || "Untitled YouTube audio";
    if (sourceMetadata.duration && sourceMetadata.duration > 420) throw new Error("Audio melebihi batas Roblox 7 menit.");
    await updateJob(job.id, { original_title: originalTitle });

    await runCommand("yt-dlp", [...ytDlpArgs(), "--no-playlist", "--format", "bestaudio/best", "--extract-audio", "--audio-format", "wav", "--output", join(workdir, "source.%(ext)s"), job.youtube_url], workdir);
    const files = await readdir(workdir);
    const sourceFile = files.find((file) => file.startsWith("source."));
    if (!sourceFile) throw new Error("File audio hasil download tidak ditemukan.");

    const outputFormat = job.output_format || "mp3";
    const outputFile = join(workdir, `processed.${outputFormat}`);
    const codecArgs = outputFormat === "mp3"
      ? ["-c:a", "libmp3lame", "-b:a", "192k"]
      : outputFormat === "ogg"
        ? ["-c:a", "libvorbis", "-q:a", "5"]
        : ["-c:a", "pcm_s16le"];
    await runCommand("ffmpeg", ["-y", "-i", join(workdir, sourceFile), "-af", audioFilter(job), "-ar", "44100", "-ac", "2", ...codecArgs, outputFile], workdir);
    const outputStats = await stat(outputFile);
    if (outputStats.size > 20 * 1024 * 1024) throw new Error("File hasil edit melebihi batas Roblox 20 MB.");

    const generated = randomText();
    await updateJob(job.id, { status: "uploading", generated_name: generated.name, generated_description: generated.description });
    const form = new FormData();
    form.append("request", JSON.stringify({
      assetType: "Audio",
      displayName: generated.name,
      description: generated.description,
      creationContext: { creator: { userId: job.roblox_profile_id } },
    }));
    form.append("fileContent", new Blob([await readFile(outputFile)], { type: mimeTypes[outputFormat] }), `processed.${outputFormat}`);

    const uploadResponse = await fetch("https://apis.roblox.com/assets/v1/assets", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
    });
    const uploadResult = await uploadResponse.json() as { path?: string; message?: string };
    if (!uploadResponse.ok || !uploadResult.path) throw new Error(uploadResult.message || "Roblox upload gagal.");

    const operationPath = uploadResult.path.replace(/^\//, "");
    await updateJob(job.id, { status: "moderating", roblox_operation_path: operationPath });
    let operation: { done?: boolean; response?: { assetId?: string }; error?: { message?: string } } = {};
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const operationResponse = await fetch(`https://apis.roblox.com/assets/v1/${operationPath}`, { headers: { "x-api-key": apiKey } });
      operation = await operationResponse.json();
      if (operation.done) break;
    }
    if (!operation.done) throw new Error("Roblox masih memproses audio. Cek operation status dari riwayat.");
    if (operation.error) throw new Error(operation.error.message || "Roblox menolak audio.");
    await updateJob(job.id, { status: "uploaded", roblox_asset_id: operation.response?.assetId ?? null, completed_at: new Date().toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Pipeline audio gagal.";
    await updateJob(job.id, { status: "failed", error_message: message, completed_at: new Date().toISOString() });
  } finally {
    await rm(workdir, { recursive: true, force: true });
  }
}

export async function GET(request: Request) {
  if (!isAuthenticated(request)) return errorResponse("Login diperlukan.", 401);
  try {
    const response = await supabaseFetch("audio_jobs?select=*&order=created_at.desc&limit=100");
    if (!response.ok) return errorResponse("Gagal mengambil riwayat audio.", 502);
    return Response.json(await response.json());
  } catch {
    return errorResponse("Supabase server environment is not configured.", 503);
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) return errorResponse("Login diperlukan.", 401);
  try {
    const body = await request.json();
    const profileId = String(body.robloxProfileId || process.env.ROBLOX_PROFILE_ID || "");
    const youtubeUrls = Array.isArray(body.youtubeUrls)
      ? body.youtubeUrls.map((url: unknown) => String(url).trim()).filter(Boolean)
      : [String(body.youtubeUrl ?? "").trim()].filter(Boolean);
    const amplifierDb = Number(body.amplifierDb ?? 0);
    const bassBoostDb = Number(body.bassBoostDb ?? 0);
    const playbackSpeed = Number(body.playbackSpeed ?? 1);
    const format = String(body.format ?? "mp3") as OutputFormat;

    if (youtubeUrls.length === 0 || youtubeUrls.length > 20) return errorResponse("Masukkan 1 sampai 20 URL YouTube.", 400);
    for (const youtubeUrl of youtubeUrls) {
      const parsedUrl = new URL(youtubeUrl);
      if (!youtubeHosts.has(parsedUrl.hostname) || !["http:", "https:"].includes(parsedUrl.protocol)) return errorResponse("Semua URL harus berupa URL YouTube yang valid.", 400);
    }
    if (!/^\d+$/.test(profileId)) return errorResponse("Roblox Profile ID harus berupa angka.", 400);
    if (!Number.isFinite(amplifierDb) || amplifierDb < -12 || amplifierDb > 12) return errorResponse("Amplifier harus berada di antara -12 dan 12 dB.", 400);
    if (!Number.isFinite(bassBoostDb) || bassBoostDb < 0 || bassBoostDb > 18) return errorResponse("Bass boost harus berada di antara 0 dan 18 dB.", 400);
    if (!Number.isFinite(playbackSpeed) || playbackSpeed < 0.5 || playbackSpeed > 2.5) return errorResponse("Playback speed harus berada di antara 0.5x dan 2.5x.", 400);
    if (!Object.hasOwn(mimeTypes, format)) return errorResponse("Format audio tidak didukung.", 400);

    const insertResponse = await supabaseFetch("audio_jobs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(youtubeUrls.map((youtubeUrl: string) => ({
        roblox_profile_id: profileId,
        youtube_url: youtubeUrl,
        amplifier_db: amplifierDb,
        bass_boost_db: bassBoostDb,
        playback_speed: playbackSpeed,
        output_format: format,
        status: "queued",
      }))),
    });
    if (!insertResponse.ok) return errorResponse("Gagal membuat job audio di database.", 502);
    const jobs = await insertResponse.json() as AudioJob[];
    for (const job of jobs) await processJob(job);
    return Response.json({ count: jobs.length, ids: jobs.map((job) => job.id) }, { status: 201 });
  } catch (error) {
    console.error("Audio job request failed:", error);
    return errorResponse("Data audio tidak valid atau pipeline gagal.", 400);
  }
}