import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { isAuthenticated } from "@/app/lib/auth";

export const runtime = "nodejs";

const browsers = new Set(["chrome", "edge", "firefox", "brave"]);

function runYtDlp(args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn("yt-dlp", args, { cwd, windowsHide: true });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr.slice(-1600))));
  });
}

export async function POST(request: Request) {
  if (!isAuthenticated(request)) return Response.json({ error: "Login diperlukan." }, { status: 401 });
  if (process.env.NODE_ENV !== "development") {
    return Response.json({ error: "Cookie export hanya tersedia di local development." }, { status: 403 });
  }

  let workdir = "";
  try {
    const body = await request.json().catch(() => ({}));
    const browser = String(body.browser ?? "chrome");
    if (!browsers.has(browser)) return Response.json({ error: "Browser tidak didukung." }, { status: 400 });

    workdir = await mkdtemp(join(tmpdir(), "campucino-cookies-"));
    const cookieFile = join(workdir, "youtube-cookies.txt");
    await runYtDlp([
      "--js-runtimes", process.env.YT_DLP_JS_RUNTIME || "node",
      "--cookies-from-browser", browser,
      "--cookies", cookieFile,
      "--skip-download",
      "--no-warnings",
      "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    ], workdir);

    const file = await readFile(cookieFile);
    return new Response(file, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": 'attachment; filename="youtube-cookies.txt"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Cookie export failed:", error);
    const message = error instanceof Error ? error.message : String(error);
    const databaseLocked = /Could not copy .*cookie database|PermissionError|Permission denied/i.test(message);

    return Response.json({
      error: databaseLocked
        ? "Database cookies sedang dikunci browser. Tutup semua jendela dan proses background browser, lalu coba lagi."
        : "Cookies gagal diambil. Pastikan browser sudah login dan sudah ditutup.",
    }, { status: 500 });
  } finally {
    if (workdir) await rm(workdir, { recursive: true, force: true });
  }
}