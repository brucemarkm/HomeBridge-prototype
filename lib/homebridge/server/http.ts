import { z } from "zod";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readJson<T>(
  request: Request,
  schema: z.ZodType<T>,
  limit = 65000,
): Promise<T> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > limit)
    throw new HttpError(413, "The request is too large.");
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Send JSON data.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Request body is required.");
  let size = 0;
  const parts: Uint8Array[] = [];
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    size += r.value.length;
    if (size > limit) {
      await reader.cancel();
      throw new HttpError(413, "The request is too large.");
    }
    parts.push(r.value);
  }
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const p of parts) {
      bytes.set(p, offset);
      offset += p.length;
    }
    return schema.parse(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    throw new HttpError(
      400,
      "Some information is invalid or missing. Please review your inputs.",
    );
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host") || url.host;
  const protocol =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(":", "");
  if (origin && origin !== `${protocol}://${host}`)
    throw new HttpError(403, "Cross-site requests are not allowed.");
  if (request.headers.get("x-homebridge-request") !== "1")
    throw new HttpError(
      403,
      "Use the Homebridge application to make this request.",
    );
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  return Response.json(
    {
      error:
        "This service is temporarily unavailable. Your local work has been kept. Please try again.",
    },
    { status: 503 },
  );
}
const rates = new Map<string, { count: number; reset: number }>();
/** Per-instance burst protection. Persistent paid AI quotas are enforced separately in PostgreSQL. */
export function limit(key: string, max = 20, window = 60000) {
  const now = Date.now();
  if (rates.size > 3000) {
    for (const [k, v] of rates) if (v.reset < now) rates.delete(k);
    if (rates.size > 3000)
      throw new HttpError(
        429,
        "The service is busy. Please try again shortly.",
      );
  }
  let item = rates.get(key);
  if (!item || item.reset < now) {
    item = { count: 0, reset: now + window };
    rates.set(key, item);
  }
  if (item.count++ >= max)
    throw new HttpError(
      429,
      "You have made several requests. Please wait a minute and try again.",
    );
}
export function requestKey(request: Request) {
  return (
    request.headers
      .get("x-forwarded-for")
      ?.split(",")[0]
      ?.trim()
      .slice(0, 100) || "local"
  );
}
