import { createHmac, timingSafeEqual } from "node:crypto";
import { Home, propertySchema } from "../schema";
function payload(home: Home, expires: string) {
  const parsed = propertySchema.parse(home);
  return JSON.stringify({ ...parsed, attestation: undefined }) + "|" + expires;
}
/** A server-issued record can retain provider provenance in subsequent model requests. */
export function attestListing(home: Home): Home {
  const key = process.env.LISTING_DATA_SIGNING_SECRET;
  if (!key || key.length < 32) return home;
  const expires = String(Date.now() + 30 * 60 * 1000);
  const sig = createHmac("sha256", key)
    .update(payload(home, expires))
    .digest("hex");
  return { ...home, attestation: `${expires}.${sig}` };
}
export function trustedListing(home: Home) {
  const key = process.env.LISTING_DATA_SIGNING_SECRET;
  if (!key || !home.attestation || home.source !== "licensed") return false;
  const [expires, hex] = home.attestation.split(".");
  if (
    !/^\d+$/.test(expires) ||
    Number(expires) < Date.now() ||
    !hex ||
    !/^[a-f0-9]{64}$/.test(hex)
  )
    return false;
  const expected = createHmac("sha256", key)
    .update(payload(home, expires))
    .digest();
  const actual = Buffer.from(hex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
