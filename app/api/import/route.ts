import { attestListing } from "../../../lib/homebridge/server/provenance";
import { z } from "zod";
import { identifyListingUrl } from "../../../lib/homebridge/import";
import { resolveAuthorizedUrl } from "../../../lib/homebridge/server/listings";
import {
  apiError,
  readJson,
  sameOrigin,
  limit,
  requestKey,
  HttpError,
} from "../../../lib/homebridge/server/http";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit("import:" + requestKey(request), 15);
    const { url } = await readJson(
      request,
      z.object({ url: z.string().min(1).max(2048) }),
      4096,
    );
    let source;
    try {
      source = identifyListingUrl(url);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }
    if (!source.supported)
      return Response.json({
        status: "manual",
        ...source,
        reason:
          "Automatic import is not supported for this website. You can still add the address and details yourself. No page has been fetched.",
      });
    try {
      const property = await resolveAuthorizedUrl(source.url);
      if (property)
        return Response.json({
          status: "resolved",
          ...source,
          property: attestListing(property),
        });
    } catch {
      return Response.json({
        status: "manual",
        ...source,
        reason:
          "The authorized import service is unavailable. Your URL has been kept; add or paste the details below. No listing details were extracted.",
      });
    }
    return Response.json({
      status: "manual",
      ...source,
      reason: `${source.source} link recognized. No authorized import API is connected, so we have not fetched this page. Paste the listing description or enter the details below.`,
    });
  } catch (e) {
    return apiError(e);
  }
}
