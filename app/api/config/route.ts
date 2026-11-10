import {
  authConfigured,
  serverAuth,
} from "../../../lib/homebridge/server/auth";
import { listingConfigured } from "../../../lib/homebridge/server/listings";
export async function GET() {
  let user: null | { id: string; email?: string } = null;
  try {
    const auth = await serverAuth();
    if (auth) {
      const result = await auth.auth.getUser();
      if (result.data.user)
        user = { id: result.data.user.id, email: result.data.user.email };
    }
  } catch {}
  return Response.json(
    {
      auth: authConfigured(),
      ai: Boolean(process.env.OPENAI_API_KEY),
      listings: listingConfigured(),
      resolver:
        listingConfigured() && Boolean(process.env.LISTING_IMPORT_API_URL),
      user,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
