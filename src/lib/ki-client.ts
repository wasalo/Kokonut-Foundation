// Kokonut Intelligence client.
//
// KI is mid-refactor: the currently published contract is a Directus REST
// surface (/items/{collection}, Directus filter syntax, Bearer auth), and the
// refactor branch moves toward a "kernel" HTTP surface. This client therefore
// supports both styles and probes automatically, so wiring the final contract
// becomes a configuration change rather than a code change.

export interface KiConfig {
  baseUrl: string;
  apiKey?: string;
  email?: string;
  password?: string;
  /**
   * - "directus": /items/{collection} with Directus filter syntax
   * - "rest": /api/{collection} with simple query params
   * - "auto" (default): probe /items/{collection}, fall back to /api/{collection}
   */
  pathStyle?: "directus" | "rest" | "auto";
}

export interface KiListOptions {
  filter?: Record<string, unknown>;
  sort?: string[];
  fields?: string[];
  limit?: number;
  offset?: number;
  search?: string;
}

export interface KiListResult<T> {
  data: T[];
  total: number;
}

export class KiClient {
  private baseUrl: string;
  private apiKey?: string;
  private email?: string;
  private password?: string;
  private pathStyle: "directus" | "rest" | "auto";
  private resolvedStyle: "directus" | "rest" | null = null;
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor(config: KiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.apiKey = config.apiKey;
    this.email = config.email;
    this.password = config.password;
    this.pathStyle = config.pathStyle ?? "auto";
  }

  private async authHeader(): Promise<Record<string, string>> {
    if (this.apiKey) return { Authorization: `Bearer ${this.apiKey}` };
    if (this.email && this.password) {
      if (!this.accessToken || Date.now() > this.tokenExpiry) {
        const res = await fetch(`${this.baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });
        if (!res.ok) throw new Error(`KI login failed: ${res.status}`);
        const body = (await res.json()) as any;
        this.accessToken = body?.data?.access_token ?? body?.access_token;
        this.tokenExpiry = Date.now() + 10 * 60 * 1000;
      }
      return { Authorization: `Bearer ${this.accessToken}` };
    }
    throw new Error("KI credentials not configured (KI_API_KEY or KI_API_EMAIL/KI_API_PASSWORD)");
  }

  private collectionUrl(collection: string, style: "directus" | "rest"): string {
    return style === "directus"
      ? `${this.baseUrl}/items/${collection}`
      : `${this.baseUrl}/api/${collection}`;
  }

  private buildParams(opts: KiListOptions, style: "directus" | "rest"): URLSearchParams {
    const params = new URLSearchParams();
    if (style === "directus") {
      if (opts.filter) params.set("filter", JSON.stringify(opts.filter));
    } else {
      for (const [k, v] of Object.entries(opts.filter ?? {})) {
        if (v === undefined || v === null) continue;
        params.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
      }
    }
    if (opts.sort?.length) params.set("sort", opts.sort.join(","));
    if (opts.fields?.length) params.set("fields", opts.fields.join(","));
    if (opts.limit) params.set("limit", String(opts.limit));
    if (opts.offset) params.set("offset", String(opts.offset));
    if (opts.search) params.set("search", opts.search);
    return params;
  }

  /** Resolves the path style once and caches it for the client's lifetime. */
  private async resolveStyle(headers: Record<string, string>): Promise<"directus" | "rest"> {
    if (this.resolvedStyle) return this.resolvedStyle;
    if (this.pathStyle !== "auto") {
      this.resolvedStyle = this.pathStyle;
      return this.resolvedStyle;
    }
    for (const style of ["directus", "rest"] as const) {
      const url = `${this.collectionUrl("__probe__", style)}?limit=1`;
      try {
        const res = await fetch(url, { headers });
        // 401/403 still prove the route exists.
        if (res.status !== 404) {
          this.resolvedStyle = style;
          return style;
        }
      } catch {
        // try the next style
      }
    }
    this.resolvedStyle = "directus";
    return this.resolvedStyle;
  }

  async list<T = any>(collection: string, opts: KiListOptions = {}): Promise<KiListResult<T>> {
    const headers = await this.authHeader();
    const style = await this.resolveStyle(headers);
    const params = this.buildParams(opts, style);
    const url = `${this.collectionUrl(collection, style)}?${params.toString()}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`KI GET ${collection} failed: ${res.status} ${text.slice(0, 200)}`);
    }
    const raw = (await res.json()) as any;
    const data = (Array.isArray(raw) ? raw : raw?.data ?? []) as T[];
    const total = Number(res.headers.get("X-Total-Count") ?? data.length);
    return { data, total };
  }

  async getById<T = any>(collection: string, id: string | number): Promise<T | null> {
    const headers = await this.authHeader();
    const style = await this.resolveStyle(headers);
    const url =
      style === "directus"
        ? `${this.baseUrl}/items/${collection}/${id}`
        : `${this.baseUrl}/api/${collection}/${id}`;
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`KI GET ${collection}/${id} failed: ${res.status}`);
    const body = (await res.json()) as any;
    return (body?.data ?? body) as T;
  }

  /** Paginate through a collection, following X-Total-Count when present. */
  async listAll<T = any>(collection: string, pageSize = 200, max = 5000): Promise<T[]> {
    const out: T[] = [];
    let offset = 0;
    for (;;) {
      const page = await this.list<T>(collection, { limit: pageSize, offset });
      out.push(...page.data);
      offset += page.data.length;
      if (page.data.length === 0 || offset >= Math.min(page.total, max)) break;
    }
    return out;
  }
}

export function getKiClient(env: any): KiClient | null {
  const baseUrl = env.KI_API_URL;
  if (!baseUrl) return null;
  return new KiClient({
    baseUrl,
    apiKey: env.KI_API_KEY,
    email: env.KI_API_EMAIL,
    password: env.KI_API_PASSWORD,
    pathStyle: (env.KI_PATH_STYLE as any) ?? "auto",
  });
}
