import { createHmac, pbkdf2Sync, timingSafeEqual } from "node:crypto";

export const sessionCookieName = "campucino_session";
const sessionTtlSeconds = 60 * 60 * 24 * 7;

type SessionPayload = { username: string; exp: number };

type AppUser = {
  username: string;
  password_hash: string;
  password_salt: string;
  active: boolean;
};

function authSecret() {
  const secret = process.env.CAMPUSINO_AUTH_SECRET;
  if (!secret) throw new Error("CAMPUSINO_AUTH_SECRET is not configured.");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("base64url");
}

export function createSessionToken(username: string) {
  const payload: SessionPayload = { username, exp: Math.floor(Date.now() / 1000) + sessionTtlSeconds };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString()) as SessionPayload;
    return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  const token = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${sessionCookieName}=`))?.slice(sessionCookieName.length + 1);
  return Boolean(verifySessionToken(token));
}

export function hashPassword(password: string, salt: string) {
  return pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("hex");
}

export async function verifyCredentials(username: string, password: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase server environment is not configured.");
  const response = await fetch(`${url}/rest/v1/app_users?username=eq.${encodeURIComponent(username)}&select=username,password_hash,password_salt,active&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`User lookup failed with status ${response.status}.`);
  const users = await response.json() as AppUser[];
  const user = users[0];
  if (!user || !user.active) return false;
  const actual = hashPassword(password, user.password_salt);
  return actual.length === user.password_hash.length && timingSafeEqual(Buffer.from(actual), Buffer.from(user.password_hash));
}

export function sessionCookie(token: string) {
  return `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${sessionTtlSeconds}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}

export function clearedSessionCookie() {
  return `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
