import type { APIRoute } from "astro";
import { ok } from "@lib/api";

export const GET: APIRoute = async () => ok({ status: "ok", service: "kokonut-foundation" });
