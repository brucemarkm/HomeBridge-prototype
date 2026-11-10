import { authenticated } from "../../../lib/homebridge/server/auth";
import { workspaceSchema } from "../../../lib/homebridge/schema";
import {
  apiError,
  readJson,
  sameOrigin,
  limit,
  HttpError,
} from "../../../lib/homebridge/server/http";
export async function GET() {
  try {
    const { client, user } = await authenticated();
    const { data, error } = await client
      .from("buyer_workspaces")
      .select("state,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error)
      throw new HttpError(
        503,
        "Workspace sync is unavailable. Check that the database migration has been applied.",
      );
    return Response.json(
      { state: data?.state || null, updatedAt: data?.updated_at || null },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function PUT(request: Request) {
  try {
    sameOrigin(request);
    const { client, user } = await authenticated();
    limit("sync:" + user.id, 30);
    const state = await readJson(request, workspaceSchema, 500000);
    const { error } = await client.from("buyer_workspaces").upsert(
      {
        user_id: user.id,
        state: { ...state, role: "buyer" },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error)
      throw new HttpError(
        503,
        "Your workspace could not sync. Local changes are still saved.",
      );
    return Response.json({ saved: true });
  } catch (e) {
    return apiError(e);
  }
}
