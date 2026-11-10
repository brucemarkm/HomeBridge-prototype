"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Link2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { Home, propertySchema } from "../../lib/homebridge/schema";
import { sourceLabel } from "../../lib/homebridge/demo";
import { dollars } from "../../lib/homebridge/finance";
import { postJson, useWorkspace } from "./workspace-provider";
type ImportResult = {
  status: string;
  url: string;
  source: string;
  reason?: string;
  property?: Home;
};
export default function ImportHome() {
  const params = useSearchParams();
  const router = useRouter();
  const { saveHome } = useWorkspace();
  const [url, setUrl] = useState(params.get("url") || "");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Home | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({
    address: "",
    city: "",
    zip: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    year: "",
    hoa: "",
    taxAnnual: "",
    type: "Not supplied",
    description: "",
    concerns: "",
    disclosures: "",
  });
  function populate(p: Home) {
    setDraft({
      address: p.address,
      city: p.city,
      zip: p.zip,
      price: p.price === null ? "" : String(p.price),
      beds: p.beds === null ? "" : String(p.beds),
      baths: p.baths === null ? "" : String(p.baths),
      sqft: p.sqft === null ? "" : String(p.sqft),
      year: p.year === null ? "" : String(p.year),
      hoa: p.hoa === null ? "" : String(p.hoa),
      taxAnnual: p.taxAnnual === null ? "" : String(p.taxAnnual),
      type: p.type,
      description: p.description,
      concerns: p.concerns.join("\n"),
      disclosures: p.disclosures.join("\n"),
    });
  }
  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await postJson("/api/import", { url });
      const data: ImportResult = await response.json();
      setResult(data);
      if (data.property) populate(data.property);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function makePreview(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const numeric = (key: string) =>
        draft[key].trim() === "" ? null : Number(draft[key]);
      const fromProvider = result?.property;
      const changed =
        fromProvider &&
        Object.entries(draft).some(([k, v]) => {
          const original = fromProvider[k as keyof Home];
          return (
            (Array.isArray(original)
              ? original.join("\n")
              : String(original ?? "")) !== v
          );
        });
      if (fromProvider && !changed) {
        setPreview(propertySchema.parse(fromProvider));
        return;
      }
      const p = propertySchema.parse({
        id: fromProvider?.id || `import-${crypto.randomUUID()}`,
        address: draft.address.trim(),
        city: draft.city.trim(),
        zip: draft.zip.trim(),
        price: numeric("price"),
        beds: numeric("beds"),
        baths: numeric("baths"),
        sqft: numeric("sqft"),
        year: numeric("year"),
        hoa: numeric("hoa"),
        taxAnnual: numeric("taxAnnual"),
        type: draft.type,
        description: draft.description,
        concerns: draft.concerns.split("\n").filter(Boolean),
        disclosures: draft.disclosures.split("\n").filter(Boolean),
        features: fromProvider?.features || [],
        history: fromProvider?.history || [],
        source: fromProvider && !changed ? "licensed" : "user",
        sourceUrl: result?.url,
        provider: fromProvider?.provider,
        attribution: fromProvider?.attribution,
        image: fromProvider?.image || "/images/home-0.png",
        imageKind: fromProvider?.imageKind || "illustration",
        latitude: fromProvider?.latitude ?? null,
        longitude: fromProvider?.longitude ?? null,
        provenance: Object.fromEntries(
          Object.keys(draft).map((k) => [
            k,
            draft[k] === ""
              ? "unknown"
              : fromProvider && !changed
                ? "provider-reported"
                : "user-supplied",
          ]),
        ),
        comparables: fromProvider?.comparables || [],
      });
      setPreview(p);
    } catch {
      setError(
        "Check the address and numeric fields. Numbers must be non-negative, and an address is required.",
      );
    }
  }
  return (
    <div className="hb-page hb-import-page">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">START WITH THE HOME YOU FOUND</span>
        <h1>Bring a home into Homebridge.</h1>
        <p>
          Keep the original listing. Add what you know. Get a clear next step.
        </p>
      </div>
      <div className="hb-import-progress">
        <span className={!result ? "active" : ""}>1. Add a link</span>
        <span className={result && !preview ? "active" : ""}>
          2. Confirm details
        </span>
        <span className={preview ? "active" : ""}>3. Open your analysis</span>
      </div>
      {!result ? (
        <>
          <form className="hb-panel" onSubmit={lookup}>
            <h2>Found a home somewhere else? Paste the link here.</h2>
            <label>
              Original listing URL
              <div className="hb-input-icon">
                <Link2 size={18} />
                <input
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.zillow.com/homedetails/…"
                  maxLength={2048}
                />
              </div>
            </label>
            <p className="hb-muted">
              We recognize Zillow, Redfin, and Realtor.com links. Automatic
              extraction requires a permitted provider. We do not scrape listing
              pages.
            </p>
            {error && (
              <div className="hb-error" role="alert">
                {error}
              </div>
            )}
            <button className="hb-btn hb-primary" disabled={busy}>
              {busy ? "Checking source…" : "Continue with this link"}
              <ArrowRight size={16} />
            </button>
            <button
              className="hb-btn hb-quiet"
              type="button"
              onClick={() =>
                setResult({
                  status: "manual",
                  url: "",
                  source: "Manual entry",
                  reason:
                    "Enter only what you know. Missing details stay unknown.",
                })
              }
            >
              Enter details without a link
            </button>
          </form>
          <div className="hb-import-alternative">
            <span>Just exploring?</span>
            <Link href="/homes?demo=1" className="hb-text-link">
              Try with a demo home <ArrowRight size={15} />
            </Link>
          </div>
        </>
      ) : preview ? (
        <section className="hb-panel">
          <span className={`hb-source ${preview.source}`}>
            {sourceLabel(preview)}
          </span>
          <h2>Does this look right?</h2>
          <h3>{preview.address}</h3>
          <p>
            {preview.city} {preview.zip} · {dollars(preview.price)} ·{" "}
            {preview.beds ?? "Unknown"} beds ·{" "}
            {preview.sqft?.toLocaleString() ?? "Unknown"} sqft
          </p>
          <p>{preview.description || "No listing description was supplied."}</p>
          {preview.sourceUrl && (
            <a
              className="hb-source-link"
              href={preview.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Original {result.source} listing <ExternalLink size={14} />
            </a>
          )}
          <div className="hb-callout">
            <ShieldCheck size={20} />
            <p>
              Unknown fields remain unknown. Estimates will be labeled
              separately. The architectural illustration is not a photograph of
              this home.
            </p>
          </div>
          <div className="hb-row">
            <button
              className="hb-btn hb-outline"
              onClick={() => setPreview(null)}
            >
              <ArrowLeft size={15} /> Correct details
            </button>
            <button
              className="hb-btn hb-primary"
              onClick={() => {
                saveHome(preview);
                router.push(`/homes/${preview.id}`);
              }}
            >
              Confirm & open analysis <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <>
          <div className="hb-callout">
            <CheckCircle2 size={20} />
            <div>
              <strong>
                {result.source}{" "}
                {result.status === "resolved"
                  ? "information received"
                  : "source identified"}
              </strong>
              <p>
                {result.reason ||
                  "Review the provider-supplied details. Any corrections you make will be treated as user-supplied information."}
              </p>
              {result.url && (
                <a href={result.url} target="_blank" rel="noopener noreferrer">
                  Open original listing <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
          <form className="hb-panel" onSubmit={makePreview}>
            <h2>Confirm the details you know.</h2>
            <p>
              Only the address is required. Leave anything you don’t know blank.
            </p>
            <div className="hb-form-grid">
              {[
                ["address", "Property address", "text"],
                ["city", "City", "text"],
                ["zip", "ZIP code", "text"],
                ["price", "Asking price ($)", "number"],
                ["beds", "Bedrooms", "number"],
                ["baths", "Bathrooms", "number"],
                ["sqft", "Square feet", "number"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    name={key}
                    required={key === "address"}
                    type={type}
                    min="0"
                    step={key === "baths" ? ".5" : "1"}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                    maxLength={200}
                  />
                </label>
              ))}
              <label>
                Property type
                <select
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, type: e.target.value }))
                  }
                >
                  <option>Not supplied</option>
                  <option>Condo</option>
                  <option>Townhome</option>
                  <option>Single family</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label>
              Paste the listing description (optional)
              <textarea
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                maxLength={8000}
                placeholder="Use information you are allowed to share. We won’t infer missing facts from the URL."
              />
            </label>
            <details className="hb-details">
              <summary>Additional facts, concerns, or disclosures</summary>
              <div className="hb-form-grid">
                {[
                  ["year", "Year built"],
                  ["hoa", "Monthly HOA ($)"],
                  ["taxAnnual", "Annual property taxes ($)"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min="0"
                      value={draft[key]}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, [key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
              </div>
              <label>
                Known concerns (one per line)
                <textarea
                  value={draft.concerns}
                  maxLength={5000}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, concerns: e.target.value }))
                  }
                />
              </label>
              <label>
                Disclosure information (one per line)
                <textarea
                  value={draft.disclosures}
                  maxLength={5000}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, disclosures: e.target.value }))
                  }
                />
              </label>
            </details>
            {error && (
              <div className="hb-error" role="alert">
                {error}
              </div>
            )}
            <div className="hb-row">
              <button
                type="button"
                className="hb-btn hb-quiet"
                onClick={() => setResult(null)}
              >
                <ArrowLeft size={15} /> Change link
              </button>
              <button className="hb-btn hb-primary">
                Preview property <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
