export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseJson<T>(v: string | null | undefined, fallback: T): T {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function id(prefix = ""): string {
  return `${prefix}${crypto.randomUUID()}`;
}

// Strips control characters and caps length for user-submitted values.
export function sanitize(value: unknown, maxLength = 1000): string {
  if (value == null) return "";
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

// RFC 4180 CSV field escaping.
export function csvField(value: unknown): string {
  if (value == null) return "";
  const s = String(value).replace(/[\r\n]+/g, " ").trim();
  if (/[",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function csvRow(values: unknown[]): string {
  return values.map(csvField).join(",");
}
