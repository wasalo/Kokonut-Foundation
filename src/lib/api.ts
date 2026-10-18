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
