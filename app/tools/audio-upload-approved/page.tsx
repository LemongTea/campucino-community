"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AudioLines,
  CheckCircle2,
  Download,
  Gauge,
  Link2,
  UploadCloud,
  UserRound,
  Volume2,
} from "lucide-react";

type AudioHistory = {
  id: string;
  created_at: string;
  original_title: string | null;
  generated_name: string | null;
  status: string;
  roblox_asset_id: string | null;
  error_message: string | null;
};

export default function AudioUploadApprovedPage() {
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState<AudioHistory[]>([]);
  const [cookieBrowser, setCookieBrowser] = useState("chrome");
  const [cookieStatus, setCookieStatus] = useState("");
  const profileIdInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileIdInput.current) profileIdInput.current.value = window.localStorage.getItem("roblox-profile-id") ?? "";
  }, []);

  useEffect(() => {
    fetch("/api/audio-jobs")
      .then((response) => response.ok ? response.json() : [])
      .then((jobs: AudioHistory[]) => setHistory(jobs))
      .catch(() => setHistory([]));
  }, []);

  const handleDownloadCookies = async () => {
    setCookieStatus("Mengambil cookies dari browser...");
    try {
      const response = await fetch("/api/youtube-cookies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ browser: cookieBrowser }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error ?? "Cookies gagal diambil.");
      }
      const blobUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "youtube-cookies.txt";
      link.click();
      URL.revokeObjectURL(blobUrl);
      setCookieStatus("Cookies berhasil diunduh. Simpan di folder aman.");
    } catch (error) {
      setCookieStatus(error instanceof Error ? error.message : "Cookies gagal diambil.");
    }
  };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setStatus("Menyimpan konfigurasi audio...");

    try {
      const response = await fetch("/api/audio-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          robloxProfileId: String(formData.get("robloxProfileId") ?? ""),
          youtubeUrls: String(formData.get("youtubeUrls") ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean),
          amplifierDb: Number(formData.get("amplifierDb") ?? 0),
          bassBoostDb: Number(formData.get("bassBoostDb") ?? 0),
          playbackSpeed: Number(formData.get("playbackSpeed") ?? 1),
          format: String(formData.get("format") ?? "mp3"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan job audio.");
      setStatus(`${result.count} job diproses. Riwayat diperbarui.`);
      const historyResponse = await fetch("/api/audio-jobs");
      if (historyResponse.ok) setHistory(await historyResponse.json());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal menyimpan job audio.");
    }
  };
  return (
    <main className="min-h-screen bg-[#1c1512] px-5 py-8 text-[#fff4e4] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        <Link href="/#tools" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-[#cbbcaf] hover:text-[#ffd08a]">
          <ArrowLeft size={15} /> Back to tools
        </Link>

        <div className="mt-16 grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-24">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.22em] text-[#e7a071]">
              <AudioLines size={15} /> tool / audio pipeline
            </div>
            <h1 className="mt-6 max-w-xl text-5xl font-black uppercase leading-[.9] tracking-[-.06em] sm:text-7xl">
              Audio Upload
              <br />
              <span className="font-serif font-normal normal-case text-[#e7a071]">Approved.</span>
            </h1>
            <p className="mt-8 max-w-md leading-7 text-[#cbbcaf]">
              Siapkan audio dari YouTube, proses dengan FFmpeg, lalu kirim ke Roblox dengan profil dan kredensial yang kamu tentukan.
            </p>

            <div className="mt-10 grid gap-3 text-xs text-[#cbbcaf]">
              {[
                [Download, "1. Download source", "yt-dlp mengambil audio dari URL YouTube."],
                [Volume2, "2. Process audio", "FFmpeg mengatur amplifier dan speed."],
                [UploadCloud, "3. Upload approved", "Server mengirim hasil ke Roblox API."],
              ].map(([Icon, title, text]) => {
                const StepIcon = Icon as typeof Download;
                return (
                  <div key={title as string} className="flex gap-4 border-l border-[#c77b4f] py-2 pl-4">
                    <StepIcon size={17} className="mt-0.5 shrink-0 text-[#e7a071]" />
                    <div>
                      <p className="font-bold uppercase tracking-[.12em] text-[#fff4e4]">{title as string}</p>
                      <p className="mt-1">{text as string}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border border-white/10 bg-[#241813] p-6 sm:p-8">
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7a071]">Upload configuration</p>
                <p className="mt-2 text-sm text-[#cbbcaf]">Isi parameter pipeline audio.</p>
              </div>
              <Gauge className="text-[#e7a071]" size={24} />
            </div>

            <div className="grid gap-5">
              <div className="border border-[#e7a071]/20 bg-[#302019] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e7a071]">Local YouTube cookies</p>
                <p className="mt-2 text-xs leading-5 text-[#cbbcaf]">Tutup browser yang dipilih, pastikan sudah login YouTube, lalu unduh cookie file untuk dipakai yt-dlp.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <select value={cookieBrowser} onChange={(event) => setCookieBrowser(event.target.value)} className="border border-white/10 bg-[#1c1512] px-3 py-2 text-xs text-[#fff4e4] outline-none focus:border-[#e7a071]">
                    <option value="chrome">Chrome</option>
                    <option value="edge">Edge</option>
                    <option value="firefox">Firefox</option>
                    <option value="brave">Brave</option>
                  </select>
                  <button type="button" onClick={handleDownloadCookies} className="flex items-center gap-2 border border-[#e7a071] px-3 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#e7a071] hover:bg-[#e7a071] hover:text-[#241813]"><Download size={15} /> Download cookies</button>
                </div>
                {cookieStatus && <p role="status" className="mt-3 text-xs text-[#ffd08a]">{cookieStatus}</p>}
              </div>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                Roblox profile ID
                <span className="relative">
                  <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7a071]" size={16} />
                  <input name="robloxProfileId" ref={profileIdInput} inputMode="numeric" onChange={(event) => window.localStorage.setItem("roblox-profile-id", event.target.value)} placeholder="Contoh: 123456789" className="w-full border border-white/10 bg-[#1c1512] py-3 pl-10 pr-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none placeholder:text-[#79675d] focus:border-[#e7a071]" />
                </span>
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                YouTube URLs <span className="font-normal normal-case tracking-normal text-[#e7a071]">(satu per baris)</span>
                <span className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#e7a071]" size={16} />
                  <textarea name="youtubeUrls" required rows={5} placeholder="https://youtube.com/watch?v=...&#10;https://youtu.be/..." className="w-full resize-y border border-white/10 bg-[#1c1512] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none placeholder:text-[#79675d] focus:border-[#e7a071]" />
                </span>
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                  Amplifier <span className="font-normal normal-case tracking-normal text-[#e7a071]">(dB)</span>
                  <input name="amplifierDb" type="number" min="-12" max="12" step="0.5" defaultValue="0" className="border border-white/10 bg-[#1c1512] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none focus:border-[#e7a071]" />
                </label>
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                  Bass boost <span className="font-normal normal-case tracking-normal text-[#e7a071]">(dB)</span>
                  <input name="bassBoostDb" type="number" min="0" max="18" step="0.5" defaultValue="8" className="border border-white/10 bg-[#1c1512] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none focus:border-[#e7a071]" />
                </label>
                <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                  Playback speed <span className="font-normal normal-case tracking-normal text-[#e7a071]">(0.5–2.5x)</span>
                  <input name="playbackSpeed" type="number" min="0.5" max="2.5" step="0.1" defaultValue="2.5" className="border border-white/10 bg-[#1c1512] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none focus:border-[#e7a071]" />
                </label>
              </div>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[.12em] text-[#cbbcaf]">
                Output format
                <select name="format" defaultValue="mp3" className="border border-white/10 bg-[#1c1512] px-3 py-3 text-sm font-normal normal-case tracking-normal text-[#fff4e4] outline-none focus:border-[#e7a071]">
                  <option value="mp3">MP3</option>
                  <option value="wav">WAV</option>
                  <option value="ogg">OGG</option>
                </select>
              </label>
              <button type="submit" className="mt-3 flex items-center justify-center gap-3 bg-[#e7a071] px-5 py-4 text-xs font-bold uppercase tracking-[.14em] text-[#241813] transition hover:bg-[#ffd08a]">
                <CheckCircle2 size={17} /> Prepare audio upload
              </button>
              {status && <p role="status" className="border border-[#e7a071]/30 bg-[#302019] p-4 text-sm text-[#ffd08a]">{status}</p>}
            </div>

            <p className="mt-6 text-[11px] leading-5 text-[#79675d]">
              API key hanya dibaca dari environment server. Audio diproses dengan yt-dlp dan FFmpeg sebelum dikirim ke Roblox Open Cloud.
            </p>
          </form>
        </div>
        <section className="mt-16 border-t border-white/10 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e7a071]">Upload history</p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-.04em]">Processed audio</h2>
            </div>
            <span className="text-xs text-[#79675d]">{history.length} records</span>
          </div>
          <div className="mt-6 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-[#302019] text-[10px] uppercase tracking-[.16em] text-[#cbbcaf]"><tr><th className="px-4 py-3">Original title</th><th className="px-4 py-3">Generated name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Roblox asset</th><th className="px-4 py-3">Created</th></tr></thead>
              <tbody>
                {history.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-[#79675d]">Belum ada riwayat upload.</td></tr>}
                {history.map((job) => <tr key={job.id} className="border-t border-white/10 text-[#cbbcaf]"><td className="max-w-xs truncate px-4 py-4 text-[#fff4e4]">{job.original_title || "Menunggu metadata..."}</td><td className="px-4 py-4">{job.generated_name || "—"}</td><td className="px-4 py-4"><span className={job.status === "uploaded" ? "text-[#9bd7a5]" : job.status === "failed" ? "text-[#e98787]" : "text-[#ffd08a]"}>{job.status}</span>{job.error_message && <p className="mt-1 max-w-xs text-[10px] text-[#e98787]">{job.error_message}</p>}</td><td className="px-4 py-4">{job.roblox_asset_id || "—"}</td><td className="whitespace-nowrap px-4 py-4">{new Date(job.created_at).toLocaleString("id-ID")}</td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}