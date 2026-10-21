// Cloudflare Access JWT verification.
// Validates the `cf-access-jwt-assertion` header: RS256 signature against the
// team certs, `aud` tag, and expiry. A header that merely exists is not enough —
// an attacker can set arbitrary headers on a direct-to-Workers request.

interface AccessJwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

export interface AccessClaims {
  aud?: string | string[];
  email?: string;
  exp?: number;
  sub?: string;
  [key: string]: unknown;
}

export interface AccessVerifyOptions {
  teamDomain: string; // e.g. "myteam.cloudflareaccess.com"
  audience: string; // Access application AUD tag
  certs?: Record<string, string>; // kid -> PEM
}

function decodeSegment(seg: string): any {
  const normalized = seg.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----BEGIN CERTIFICATE-----/g, "").replace(/-----END CERTIFICATE-----/g, "").replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function fetchTeamCerts(teamDomain: string): Promise<Record<string, string>> {
  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Failed to fetch Access certs: ${res.status}`);
  const data = (await res.json()) as { keys?: { kid: string; n: string; e: string }[] };
  const certs: Record<string, string> = {};
  for (const key of data.keys ?? []) {
    const pem = `-----BEGIN CERTIFICATE-----\n${key.n}\n-----END CERTIFICATE-----\n`;
    certs[key.kid] = pem;
  }
  return certs;
}

export async function verifyAccessJwt(
  token: string,
  opts: AccessVerifyOptions,
): Promise<{ valid: boolean; reason?: string; claims?: AccessClaims }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { valid: false, reason: "malformed token" };
    const header = JSON.parse(decodeSegment(parts[0])) as AccessJwtHeader;
    const claims = JSON.parse(decodeSegment(parts[1])) as AccessClaims;
    if (header.alg !== "RS256") return { valid: false, reason: `unsupported alg ${header.alg}` };
    if (!header.kid) return { valid: false, reason: "missing kid" };

    const certs = opts.certs ?? (await fetchTeamCerts(opts.teamDomain));
    const pem = certs[header.kid];
    if (!pem) return { valid: false, reason: "unknown kid" };

    const key = await crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(pem),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signed = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), (c) => c.charCodeAt(0));
    const valid = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, key, signature, signed);
    if (!valid) return { valid: false, reason: "bad signature" };

    const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!auds.includes(opts.audience)) return { valid: false, reason: "aud mismatch" };
    if (typeof claims.exp === "number" && claims.exp * 1000 < Date.now()) {
      return { valid: false, reason: "expired" };
    }
    return { valid: true, claims };
  } catch (e) {
    return { valid: false, reason: String(e) };
  }
}
