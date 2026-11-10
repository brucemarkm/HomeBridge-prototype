import { publicHttpsUrl } from "./import";
import { workspaceSchema, Workspace } from "./schema";
import { freshWorkspace } from "./demo";
export const GUEST_KEY = "homebridge-workspace-v2";
export function loadWorkspace(
  storage: Pick<Storage, "getItem">,
  key = GUEST_KEY,
): Workspace {
  try {
    const raw = storage.getItem(key);
    if (raw) {
      try {
        const result = workspaceSchema.safeParse(JSON.parse(raw));
        if (result.success) return result.data;
      } catch {
        /* Try the preserved v1 data below if v2 is malformed. */
      }
    }
    if (key === GUEST_KEY) {
      const old = storage.getItem("homebridge-demo-v1");
      if (old) {
        const data = JSON.parse(old);
        const migrated = freshWorkspace();
        if (typeof data.fee === "number") migrated.fee = Math.max(0, data.fee);
        if (typeof data.name === "string") migrated.profile.name = data.name;
        migrated.homes = (data.imported || [])
          .filter((p: { address?: string }) => typeof p.address === "string")
          .map((p: Record<string, unknown>) => ({
            id: String(p.id),
            address: String(p.address),
            city: String(p.city || ""),
            zip: "",
            price: typeof p.price === "number" ? p.price : null,
            beds: typeof p.beds === "number" ? p.beds : null,
            baths: typeof p.baths === "number" ? p.baths : null,
            sqft: typeof p.sqft === "number" ? p.sqft : null,
            type: String(p.type || "Not supplied"),
            year: typeof p.year === "number" ? p.year : null,
            hoa: null,
            taxAnnual: null,
            description: String(
              p.description || "Previously manually entered property.",
            ),
            features: [],
            concerns: [],
            disclosures: [],
            history: [],
            source: "user",
            sourceUrl: (() => {
              try {
                return typeof p.url === "string"
                  ? publicHttpsUrl(p.url).href
                  : undefined;
              } catch {
                return undefined;
              }
            })(),
            image: "/images/home-0.png",
            imageKind: "illustration",
            latitude: null,
            longitude: null,
            provenance: { address: "user-supplied" },
            comparables: [],
          }));
        const checked = workspaceSchema.safeParse(migrated);
        if (checked.success) return checked.data;
      }
    }
  } catch {}
  return freshWorkspace();
}
export function saveWorkspace(
  storage: Pick<Storage, "setItem">,
  state: Workspace,
  key = GUEST_KEY,
) {
  storage.setItem(key, JSON.stringify(workspaceSchema.parse(state)));
}
