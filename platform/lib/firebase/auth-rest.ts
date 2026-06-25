import "server-only";
import jwt from "jsonwebtoken";

const PROJECT_ID = () => process.env.FIREBASE_ADMIN_PROJECT_ID!;
const CLIENT_EMAIL = () => process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const PRIVATE_KEY = () =>
  (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

// ─── Service account access token ───────────────────────────────────────────

let _accessToken: string | null = null;
let _accessTokenExpiry = 0;

export async function getAccessToken(): Promise<string> {
  if (_accessToken && Date.now() < _accessTokenExpiry) return _accessToken;

  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: CLIENT_EMAIL(),
    sub: CLIENT_EMAIL(),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: [
      "https://www.googleapis.com/auth/firebase",
      "https://www.googleapis.com/auth/identitytoolkit",
      "https://www.googleapis.com/auth/datastore",
    ].join(" "),
  };

  const signedJwt = jwt.sign(claim, PRIVATE_KEY(), { algorithm: "RS256" });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get access token: ${text}`);
  }

  const data = await res.json() as { access_token: string; expires_in: number };
  _accessToken = data.access_token;
  _accessTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return _accessToken;
}

// ─── Firebase ID token verification ─────────────────────────────────────────

let _certs: Record<string, string> | null = null;
let _certsExpiry = 0;

async function getFirebaseCerts(): Promise<Record<string, string>> {
  if (_certs && Date.now() < _certsExpiry) return _certs;
  const res = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com"
  );
  const maxAge = parseInt(
    res.headers.get("Cache-Control")?.match(/max-age=(\d+)/)?.[1] ?? "3600"
  );
  _certsExpiry = Date.now() + maxAge * 1000;
  _certs = (await res.json()) as Record<string, string>;
  return _certs;
}

export async function verifyIdToken(idToken: string): Promise<jwt.JwtPayload> {
  const [headerB64] = idToken.split(".");
  const header = JSON.parse(Buffer.from(headerB64, "base64url").toString()) as { kid: string };
  const certs = await getFirebaseCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error("Firebase ID token: unknown kid");

  const decoded = jwt.verify(idToken, cert, {
    algorithms: ["RS256"],
    audience: PROJECT_ID(),
    issuer: `https://securetoken.google.com/${PROJECT_ID()}`,
  }) as jwt.JwtPayload;

  if (!decoded.sub) throw new Error("Firebase ID token: missing sub");

  return decoded;
}

// ─── Session cookie (custom JWT) ─────────────────────────────────────────────

const SESSION_SECRET = () => {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET env var não configurado");
  return s;
};

export interface DecodedSession {
  uid: string;
  email?: string;
  email_verified?: boolean;
  role?: string;
}

export function createSessionCookieSync(
  payload: DecodedSession,
  expiresInMs: number
): string {
  return jwt.sign(payload, SESSION_SECRET(), {
    expiresIn: Math.floor(expiresInMs / 1000),
  });
}

export function verifySessionCookieSync(cookie: string): DecodedSession {
  return jwt.verify(cookie, SESSION_SECRET(), { algorithms: ["HS256"] }) as DecodedSession;
}

// ─── Firebase Auth REST API ──────────────────────────────────────────────────

async function authRequest(
  path: string,
  body?: Record<string, unknown>
): Promise<unknown> {
  const token = await getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID()}${path}`;
  const res = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firebase Auth REST error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getUser(uid: string): Promise<{ disabled: boolean; email?: string; role?: string }> {
  const data = await authRequest("/accounts:lookup", { localId: [uid] }) as {
    users?: Array<{ disabled?: boolean; email?: string; customAttributes?: string }>;
  };
  const user = data.users?.[0];
  if (!user) throw new Error(`User ${uid} not found`);
  let role: string | undefined;
  try {
    if (user.customAttributes) {
      role = (JSON.parse(user.customAttributes) as { role?: string }).role;
    }
  } catch { /* ignore */ }
  return { disabled: Boolean(user.disabled), email: user.email, role };
}

export async function deleteUser(uid: string): Promise<void> {
  await authRequest("/accounts:delete", { localId: uid });
}

export async function updateUser(
  uid: string,
  opts: { disabled?: boolean }
): Promise<void> {
  await authRequest("/accounts:update", { localId: uid, ...opts });
}

export async function revokeRefreshTokens(uid: string): Promise<void> {
  await authRequest("/accounts:update", {
    localId: uid,
    validSince: String(Math.floor(Date.now() / 1000)),
  });
}

export async function listUsers(maxResults = 1000): Promise<
  Array<{ uid: string; email?: string; displayName?: string; disabled: boolean; role?: string; metadata: { creationTime?: string } }>
> {
  const token = await getAccessToken();
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID()}/accounts:query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ returnUserInfo: true, maxResults }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`listUsers error ${res.status}: ${text}`);
  }
  const data = await res.json() as {
    userInfo?: Array<{
      localId: string;
      email?: string;
      displayName?: string;
      disabled?: boolean;
      createdAt?: string;
      customAttributes?: string;
    }>;
  };
  return (data.userInfo ?? []).map((u) => {
    let role: string | undefined;
    try {
      if (u.customAttributes) {
        role = (JSON.parse(u.customAttributes) as { role?: string }).role;
      }
    } catch { /* ignore */ }
    return {
      uid: u.localId,
      email: u.email,
      displayName: u.displayName,
      disabled: Boolean(u.disabled),
      role,
      metadata: { creationTime: u.createdAt },
    };
  });
}
