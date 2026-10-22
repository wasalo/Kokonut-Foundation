export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function ok(data: unknown, meta?: Record<string, unknown>) {
  return json({ data, meta: meta ?? {} });
}

export function err(message: string, status = 400) {
  return json({ error: message }, status);
}

/**
 * Builds a partial update object from a request payload.
 *
 * Only the keys actually present in `data` are included, so editing one field
 * never blanks out the rest of the record. Numeric fields are coerced, and
 * empty strings are preserved as empty rather than dropped.
 */
export function pickFields<T extends Record<string, unknown>>(
  data: Record<string, unknown>,
  fields: { name: string; type?: "text" | "number" | "boolean" | "json" }[],
): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    if (!(field.name in data)) continue;
    const raw = data[field.name];
    if (field.type === "number") {
      if (raw === "" || raw === null || raw === undefined) continue;
      out[field.name] = Number(raw);
    } else if (field.type === "boolean") {
      out[field.name] = raw === true || raw === "true" || raw === "1" ? 1 : 0;
    } else if (field.type === "json") {
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (trimmed === "") {
          out[field.name] = "[]";
        } else if (trimmed.startsWith("[")) {
          try {
            out[field.name] = JSON.stringify(JSON.parse(trimmed));
          } catch {
            out[field.name] = trimmed;
          }
        } else {
          // Comma-separated list: "1, 2, 3" -> [1, 2, 3]
          out[field.name] = JSON.stringify(
            trimmed.split(",").map((x) => x.trim()).filter(Boolean).map((x) => (/^-?\d+(\.\d+)?$/.test(x) ? Number(x) : x)),
          );
        }
      } else {
        out[field.name] = JSON.stringify(raw ?? []);
      }
    } else {
      out[field.name] = raw === null ? null : String(raw);
    }
  }
  return out as Partial<T>;
}

/** Parses a request body as JSON or form-encoded, whichever was sent. */
export async function readBody(request: Request): Promise<Record<string, any>> {
  const data: Record<string, any> = {};
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    Object.assign(data, await request.json());
  } else {
    const fd = await request.formData();
    fd.forEach((v, k) => { data[k] = String(v); });
  }
  return data;
}
