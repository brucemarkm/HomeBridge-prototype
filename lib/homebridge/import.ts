export function publicHttpsUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Enter a complete listing URL beginning with https://.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  )
    throw new Error(
      "Use an HTTPS listing URL without a username, password, or custom port.",
    );
  const host = url.hostname.toLowerCase();
  if (
    !host.includes(".") ||
    /^[\d.]+$/.test(host) ||
    host.includes(":") ||
    /(^|\.)(localhost|local|internal|test|invalid)$/.test(host) ||
    /\.(localhost|local|internal|test|invalid)$/.test(host)
  )
    throw new Error(
      "Local, private-network, and IP-address URLs are not supported.",
    );
  url.hash = "";
  return url;
}
export function identifyListingUrl(raw: string) {
  const url = publicHttpsUrl(raw);
  const host = url.hostname.replace(/^www\./, "");
  const source =
    host === "zillow.com" || host.endsWith(".zillow.com")
      ? "Zillow"
      : host === "redfin.com" || host.endsWith(".redfin.com")
        ? "Redfin"
        : host === "realtor.com" || host.endsWith(".realtor.com")
          ? "Realtor.com"
          : "Other website";
  return { url: url.href, source, supported: source !== "Other website" };
}
