import { attestListing } from "../../../lib/homebridge/server/provenance";
import {
  ResoProvider,
  listingConfigured,
} from "../../../lib/homebridge/server/listings";
import {
  apiError,
  limit,
  requestKey,
  HttpError,
} from "../../../lib/homebridge/server/http";
export async function GET(request: Request) {
  try {
    limit("list:" + requestKey(request), 30);
    if (!listingConfigured())
      return Response.json({
        configured: false,
        homes: [],
        message:
          "No licensed live listing feed is connected. Explore four fictional demo homes or import information you provide.",
      });
    const p = new URL(request.url).searchParams;
    const numeric = (key: string) => {
      const n = Number(p.get(key) || 0);
      if (!Number.isFinite(n) || n < 0 || n > 100000000)
        throw new HttpError(400, "A search filter is invalid.");
      return n;
    };
    const q = (p.get("q") || "").slice(0, 120);
    const homes = await new ResoProvider().search({
      q,
      min: numeric("min"),
      max: numeric("max"),
      beds: numeric("beds"),
      baths: numeric("baths"),
      sqft: numeric("sqft"),
      type: (p.get("type") || "").slice(0, 80),
    });
    return Response.json(
      {
        configured: true,
        homes: homes.map(attestListing),
        message:
          "Provider-reported information. Availability and accuracy require confirmation.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
