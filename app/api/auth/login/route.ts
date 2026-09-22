import { NextResponse } from "next/server";
import { createSessionToken, sessionCookie, verifyCredentials } from "@/app/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");
  if (!username || !password) return NextResponse.json({ error: "Username dan password wajib diisi." }, { status: 400 });

  try {
    if (!await verifyCredentials(username, password)) return NextResponse.json({ error: "Username atau password salah." }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", sessionCookie(createSessionToken(username)));
    return response;
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json({ error: "Login belum dapat memeriksa tabel user. Jalankan schema Supabase terlebih dahulu." }, { status: 500 });
  }
}
