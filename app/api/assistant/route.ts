import { trustedListing } from "../../../lib/homebridge/server/provenance";
import { assistantRequestSchema } from "../../../lib/homebridge/schema";
import { demoHomes } from "../../../lib/homebridge/demo";
import { demoResponse } from "../../../lib/homebridge/analysis";
import { liveAnswer } from "../../../lib/homebridge/server/ai";
import { serverAuth } from "../../../lib/homebridge/server/auth";
import {
  apiError,
  readJson,
  sameOrigin,
  limit,
  requestKey,
  HttpError,
} from "../../../lib/homebridge/server/http";
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit("chat:" + requestKey(request), 12);
    const input = await readJson(request, assistantRequestSchema, 65000);
    const canonical = demoHomes.find((p) => p.id === input.property.id);
    if (canonical) input.property = canonical;
    else if (!trustedListing(input.property)) {
      input.property = {
        ...input.property,
        source: "user",
        provider: undefined,
        comparables: [],
        provenance: Object.fromEntries(
          Object.keys(input.property.provenance).map((k) => [
            k,
            "user-supplied" as const,
          ]),
        ),
      };
    }
    const fallback = () =>
      demoResponse(
        input.messages.at(-1)!.text,
        input.property,
        input.profile,
        input.assumptions,
      );
    if (!process.env.OPENAI_API_KEY || !input.useLive)
      return Response.json(fallback());
    // Live AI is opt-in per request. Browsing or imports never send data to a model.
    const auth = await serverAuth();
    const result = auth ? await auth.auth.getUser() : null;
    const user = result?.data.user;
    if (!auth || !user)
      return Response.json({
        ...fallback(),
        notice:
          "Guest mode uses the scripted guide. Sign in to use live AI when the service is configured.",
      });
    // Durable quota is atomic in PostgreSQL; fail closed if the migration/quota service is missing.
    const { data: allowed, error } = await auth.rpc("consume_ai_quota");
    if (error)
      throw new HttpError(
        503,
        "Live AI spending controls are unavailable. Your question was not sent. Try the scripted guide or contact the administrator.",
      );
    if (!allowed)
      throw new HttpError(
        429,
        "The daily AI request allowance has been reached. No model request was made.",
      );
    try {
      return Response.json(await liveAnswer(input));
    } catch {
      return Response.json({
        ...fallback(),
        notice:
          "The live AI service did not complete this request. This response is from the scripted demo guide.",
      });
    }
  } catch (e) {
    return apiError(e);
  }
}
