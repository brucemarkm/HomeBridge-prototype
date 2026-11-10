import { z } from "zod";
import { Home, propertySchema } from "../schema";
import { publicHttpsUrl } from "../import";
import { HttpError } from "./http";
export type ListingQuery = {
  q: string;
  min: number;
  max: number;
  beds: number;
  baths: number;
  type: string;
  sqft: number;
};
export interface ListingProvider {
  search(query: ListingQuery): Promise<Home[]>;
}
export function listingConfigured() {
  return Boolean(
    process.env.LISTING_API_BASE_URL &&
    process.env.LISTING_API_TOKEN &&
    process.env.LISTING_ATTRIBUTION &&
    process.env.LISTING_LICENSE_CONFIRMED === "true",
  );
}
function endpoint(raw: string) {
  const u = publicHttpsUrl(raw);
  const hosts = (process.env.LISTING_ALLOWED_HOSTS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase());
  if (!hosts.includes(u.hostname))
    throw new HttpError(
      503,
      "The listing provider hostname must be explicitly configured.",
    );
  return u;
}
async function providerFetch(url: URL, body?: string, tokenOverride?: string) {
  const token = tokenOverride || process.env.LISTING_API_TOKEN;
  if (!token)
    throw new HttpError(503, "A licensed listing provider is not configured.");
  const r = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
    redirect: "error",
    signal: AbortSignal.timeout(12000),
    cache: "no-store",
  });
  if (!r.ok)
    throw new HttpError(
      502,
      "The authorized listing provider could not complete the request. Try manual entry or demo properties.",
    );
  const text = await r.text();
  if (text.length > 2000000)
    throw new HttpError(502, "The listing provider response is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(
      502,
      "The provider did not return valid property data.",
    );
  }
}
export function normalizePropertyType(raw: string) {
  const t = raw.toLowerCase();
  return t === "condominium" || t === "condo"
    ? "Condo"
    : t === "townhouse" || t === "townhome"
      ? "Townhome"
      : t === "single family residence" || t === "single family"
        ? "Single family"
        : raw || "Not supplied";
}
const nullableNumber = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null;
const string = (v: unknown) => (typeof v === "string" ? v : "");
export function normalizeReso(raw: Record<string, unknown>): Home {
  const id = string(raw.ListingKey) || string(raw.ListingId);
  if (!id) throw new Error("Provider record lacks a listing identifier.");
  const lat = nullableNumber(raw.Latitude);
  const lng = typeof raw.Longitude === "number" ? raw.Longitude : null;
  const fields: Record<string, "provider-reported" | "unknown"> = {};
  for (const [key, value] of Object.entries({
    price: raw.ListPrice,
    beds: raw.BedroomsTotal,
    baths: raw.BathroomsTotalDecimal,
    sqft: raw.LivingArea,
    year: raw.YearBuilt,
    hoa: raw.AssociationFee,
    taxAnnual: raw.TaxAnnualAmount,
    description: raw.PublicRemarks,
  }))
    fields[key] =
      value === undefined || value === null ? "unknown" : "provider-reported";
  let hoa = nullableNumber(raw.AssociationFee);
  const freq = string(raw.AssociationFeeFrequency);
  if (hoa !== null && freq) {
    if (freq === "Annually") hoa /= 12;
    else if (freq === "Quarterly") hoa /= 3;
    else if (freq !== "Monthly") {
      hoa = null;
      fields.hoa = "unknown";
    }
  } else if (hoa !== null) {
    hoa = null;
    fields.hoa = "unknown";
  }
  let image = "/images/home-0.png";
  let imageKind: "illustration" | "provider" = "illustration";
  const media = Array.isArray(raw.Media) ? raw.Media : [];
  for (const m of media) {
    try {
      const u = publicHttpsUrl(string(m.MediaURL));
      if (
        (process.env.LISTING_IMAGE_HOSTS || "")
          .split(",")
          .map((s) => s.trim())
          .includes(u.hostname)
      ) {
        image = u.href;
        imageKind = "provider";
        break;
      }
    } catch {}
  }
  return propertySchema.parse({
    id: `live-${id}`,
    address:
      string(raw.UnparsedAddress) ||
      [raw.StreetNumber, raw.StreetName, raw.StreetSuffix]
        .filter(Boolean)
        .join(" ") ||
      "Address withheld by provider",
    city: string(raw.City),
    zip: string(raw.PostalCode),
    price: nullableNumber(raw.ListPrice),
    beds: nullableNumber(raw.BedroomsTotal),
    baths: nullableNumber(raw.BathroomsTotalDecimal),
    sqft: nullableNumber(raw.LivingArea),
    type: normalizePropertyType(
      string(raw.PropertySubType) || string(raw.PropertyType),
    ),
    year: nullableNumber(raw.YearBuilt),
    hoa,
    taxAnnual: nullableNumber(raw.TaxAnnualAmount),
    description: string(raw.PublicRemarks).slice(0, 8000),
    features: [],
    concerns: [],
    disclosures: [],
    history: [],
    source: "licensed",
    provider: process.env.LISTING_PROVIDER_NAME || "Authorized RESO provider",
    attribution: [process.env.LISTING_ATTRIBUTION, string(raw.ListOfficeName)]
      .filter(Boolean)
      .join(" · "),
    updatedAt: string(raw.ModificationTimestamp) || undefined,
    image,
    imageKind,
    latitude: lat,
    longitude: lng,
    provenance: fields,
    comparables: [],
  });
}
export class ResoProvider implements ListingProvider {
  async search(q: ListingQuery) {
    const base = endpoint(process.env.LISTING_API_BASE_URL || "");
    const url = new URL(
      "Property",
      base.href.endsWith("/") ? base.href : base.href + "/",
    );
    const escape = (s: string) => s.replaceAll("'", "''");
    const filters = ["StandardStatus eq 'Active'"];
    if (q.q) {
      if (/^\d{5}$/.test(q.q)) filters.push(`PostalCode eq '${q.q}'`);
      else
        filters.push(
          `(contains(City,'${escape(q.q)}') or contains(UnparsedAddress,'${escape(q.q)}'))`,
        );
    }
    if (q.min) filters.push(`ListPrice ge ${q.min}`);
    if (q.max) filters.push(`ListPrice le ${q.max}`);
    if (q.beds) filters.push(`BedroomsTotal ge ${q.beds}`);
    if (q.baths) filters.push(`BathroomsTotalDecimal ge ${q.baths}`);
    if (q.sqft) filters.push(`LivingArea ge ${q.sqft}`);
    if (q.type)
      filters.push(
        `PropertySubType eq '${escape(({ Condo: "Condominium", Townhome: "Townhouse", "Single family": "Single Family Residence" } as Record<string, string>)[q.type] || q.type)}'`,
      );
    url.searchParams.set("$filter", filters.join(" and "));
    url.searchParams.set("$top", "40");
    url.searchParams.set("$expand", "Media");
    const result = await providerFetch(url);
    const parsed = z
      .object({ value: z.array(z.record(z.string(), z.unknown())).max(100) })
      .parse(result);
    return parsed.value.map(normalizeReso);
  }
}
export async function resolveAuthorizedUrl(url: string) {
  if (!listingConfigured() || !process.env.LISTING_IMPORT_API_URL) return null;
  const resolver = endpoint(process.env.LISTING_IMPORT_API_URL);
  const provider = endpoint(process.env.LISTING_API_BASE_URL!);
  if (
    resolver.hostname !== provider.hostname &&
    !process.env.LISTING_IMPORT_API_TOKEN
  )
    throw new HttpError(
      503,
      "A separate credential is required for this authorized resolver host.",
    );
  const result = await providerFetch(
    resolver,
    JSON.stringify({ url }),
    process.env.LISTING_IMPORT_API_TOKEN,
  );
  const home = propertySchema.parse(result);
  if (home.source !== "licensed")
    throw new HttpError(
      502,
      "The resolver did not identify licensed property information.",
    );
  return {
    ...home,
    sourceUrl: url,
    attribution: process.env.LISTING_ATTRIBUTION || home.attribution,
  };
}
