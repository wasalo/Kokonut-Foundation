export async function verifyTurnstile(
  token: string | undefined,
  secret: string | undefined,
  ip?: string,
  environment = "development",
): Promise<boolean> {
  // Fail closed in production: a missing secret must never silently allow submissions.
  if (!secret) return environment !== "production";
  if (!token) return false;
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(ip ? { remoteip: ip } : {}),
      }),
    });
    const data = (await res.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}
