import { contentBlocks } from "@lib/schema";
import { eq } from "drizzle-orm";

/**
 * The addressable content store.
 *
 * Content blocks are key/value records: `home:lede` for the homepage
 * introduction, `baseline:adelphi` for a farm's Common Data Schema baseline.
 * A block's body is either plain text or a JSON document.
 */
export interface ContentBlock {
  id: string;
  key: string;
  title: string | null;
  body: string;
  updatedAt: string;
}

export interface ParsedBody {
  kind: "text" | "json";
  text: string;
  json: Record<string, unknown> | null;
}

export function parseBlockBody(body: string): ParsedBody {
  const trimmed = (body ?? "").trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return { kind: "json", text: trimmed, json: parsed as Record<string, unknown> };
      }
    } catch {
      // Not valid JSON after all — fall through to text.
    }
  }
  return { kind: "text", text: body ?? "", json: null };
}

/** Reads one content block by key, or null when it does not exist. */
export async function getContentBlock(db: any, key: string): Promise<ContentBlock | null> {
  if (!db || !key) return null;
  try {
    const row = await db.select().from(contentBlocks).where(eq(contentBlocks.key, key)).get();
    return row ?? null;
  } catch {
    return null;
  }
}

/** Reads every content block, newest first. */
export async function listContentBlocks(db: any): Promise<ContentBlock[]> {
  if (!db) return [];
  try {
    return await db.select().from(contentBlocks).all();
  } catch {
    return [];
  }
}

/** Splits a plain-text body into paragraphs. */
export function toParagraphs(text: string): string[] {
  return (text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Turns a JSON body into readable label/value pairs. */
export function toFields(json: Record<string, unknown>): { label: string; value: string }[] {
  return Object.entries(json).map(([key, value]) => ({
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value:
      value === null || value === undefined
        ? "—"
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value),
  }));
}
