"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Link2,
  ArrowRight,
  Map,
  LayoutGrid,
} from "lucide-react";
import { Home, propertySchema } from "../../lib/homebridge/schema";
import { useWorkspace } from "./workspace-provider";
import HomeCard from "./property-card";
import AreaMap from "./area-map";
export default function Explore() {
  const { config, all, update } = useWorkspace();
  const [filters, setFilters] = useState({
    q: "",
    min: "",
    max: "",
    beds: "",
    baths: "",
    type: "",
    sqft: "",
  });
  const [mode, setMode] = useState("demo");
  const [live, setLive] = useState<Home[]>([]);
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState("list");
  const [sort, setSort] = useState("Recommended");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const base = mode === "demo" ? all.filter((h) => h.source === "demo") : live;
  const matches = base
    .filter(
      (h) =>
        (mode === "live" ||
          !filters.q ||
          `${h.address} ${h.city} ${h.zip}`
            .toLowerCase()
            .includes(filters.q.toLowerCase())) &&
        (!filters.min ||
          (h.price !== null && h.price >= Number(filters.min))) &&
        (!filters.max ||
          (h.price !== null && h.price <= Number(filters.max))) &&
        (!filters.beds ||
          (h.beds !== null && h.beds >= Number(filters.beds))) &&
        (!filters.baths ||
          (h.baths !== null && h.baths >= Number(filters.baths))) &&
        (!filters.type || h.type === filters.type) &&
        (!filters.sqft || (h.sqft !== null && h.sqft >= Number(filters.sqft))),
    )
    .sort((a, b) =>
      sort === "Price: low to high"
        ? (a.price ?? Infinity) - (b.price ?? Infinity)
        : sort === "Price: high to low"
          ? (b.price ?? 0) - (a.price ?? 0)
          : sort === "Most space"
            ? (b.sqft ?? 0) - (a.sqft ?? 0)
            : 0,
    );
  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (mode !== "live") return;
    setBusy(true);
    setError("");
    setSearched(true);
    try {
      const p = new URLSearchParams(filters);
      const response = await fetch(`/api/listings?${p}`);
      const data = await response.json();
      if (!response.ok) throw Error(data.error);
      const homes = (data.homes || []).map((h: unknown) =>
        propertySchema.parse(h),
      );
      setLive(homes);
      update((s) => ({
        ...s,
        homes: [
          ...s.homes.filter((p) => !homes.some((h: Home) => h.id === p.id)),
          ...homes,
        ],
      }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="hb-page">
      <div className="hb-page-heading hb-row hb-between">
        <div>
          <span className="hb-eyebrow">
            FIND A HOME. UNDERSTAND WHAT’S NEXT.
          </span>
          <h1>Find or analyze a home.</h1>
          <p>
            Try a detailed demo scenario, search a connected provider, or bring
            your own listing.
          </p>
        </div>
        <Link href="/import" className="hb-btn hb-primary">
          <Link2 size={17} /> Import a listing
        </Link>
      </div>
      <div className="hb-tabs" role="tablist" aria-label="Listing source">
        <button
          role="tab"
          aria-selected={mode === "demo"}
          onClick={() => setMode("demo")}
        >
          Demo homes <span>4</span>
        </button>
        <button
          role="tab"
          aria-selected={mode === "live"}
          onClick={() => setMode("live")}
        >
          Live listing search{" "}
          {config.listings ? (
            <i className="hb-green-dot" />
          ) : (
            <small>Not connected</small>
          )}
        </button>
      </div>
      {mode === "live" && !config.listings ? (
        <div className="hb-empty hb-panel">
          <Search size={30} />
          <h2>No licensed live feed is connected.</h2>
          <p>
            We don’t fabricate listings or scrape real estate websites. You can
            paste a link and supply the property details, or explore four
            fictional demo homes.
          </p>
          <div className="hb-row">
            <Link className="hb-btn hb-primary" href="/import">
              Bring a listing link <ArrowRight size={16} />
            </Link>
            <button
              className="hb-btn hb-outline"
              onClick={() => setMode("demo")}
            >
              Try with a demo home
            </button>
          </div>
          <Link href="/integrations" className="hb-text-link">
            See integration requirements
          </Link>
        </div>
      ) : (
        <>
          <form className="hb-search-controls" onSubmit={search}>
            <div className="hb-search-main">
              <Search size={19} />
              <input
                aria-label="City, address, or ZIP"
                placeholder="City, address, or ZIP code"
                value={filters.q}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, q: e.target.value }))
                }
              />
            </div>
            <select
              aria-label="Maximum price"
              value={filters.max}
              onChange={(e) =>
                setFilters((f) => ({ ...f, max: e.target.value }))
              }
            >
              <option value="">Any price</option>
              {[350000, 450000, 500000, 600000, 800000].map((n) => (
                <option key={n} value={n}>
                  Up to ${n / 1000}k
                </option>
              ))}
            </select>
            <select
              aria-label="Bedrooms"
              value={filters.beds}
              onChange={(e) =>
                setFilters((f) => ({ ...f, beds: e.target.value }))
              }
            >
              <option value="">Any beds</option>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}+ beds
                </option>
              ))}
            </select>
            <button
              type="button"
              className="hb-btn hb-outline"
              onClick={() => setAdvanced(!advanced)}
            >
              <SlidersHorizontal size={15} />
              Filters
            </button>
            {mode === "live" && (
              <button className="hb-btn hb-primary" disabled={busy}>
                {busy ? "Searching…" : "Search"}
              </button>
            )}
            {advanced && (
              <div className="hb-advanced-filters">
                {[
                  ["min", "Minimum price ($)"],
                  ["sqft", "Minimum square feet"],
                  ["baths", "Minimum bathrooms"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min="0"
                      step={key === "baths" ? ".5" : "1"}
                      value={filters[key as keyof typeof filters]}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  </label>
                ))}
                <label>
                  Property type
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option value="">All types</option>
                    <option>Condo</option>
                    <option>Townhome</option>
                    <option>Single family</option>
                  </select>
                </label>
              </div>
            )}
          </form>
          {error && (
            <div className="hb-error" role="alert">
              {error}
            </div>
          )}
          <div className="hb-results-row">
            <span>
              <strong>{matches.length} homes</strong> ·{" "}
              {mode === "demo"
                ? "All fictional demo scenarios"
                : "Provider-reported information"}
            </span>
            <div className="hb-row">
              <select
                aria-label="Sort homes"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {[
                  "Recommended",
                  "Price: low to high",
                  "Price: high to low",
                  "Most space",
                ].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <div className="hb-view-toggle">
                <button
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  aria-label="Map view"
                  aria-pressed={view === "map"}
                  onClick={() => setView("map")}
                >
                  <Map size={16} />
                </button>
              </div>
            </div>
          </div>
          {view === "map" && <AreaMap homes={matches} />}
          <div className="hb-home-grid">
            {matches.map((home) => (
              <HomeCard key={home.id} home={home} />
            ))}
          </div>
          {!matches.length && !busy && (
            <div className="hb-empty">
              <h2>
                {mode === "live" && !searched
                  ? "Search your connected provider."
                  : "No homes match these filters."}
              </h2>
              <p>
                {mode === "live"
                  ? "Try another city or ZIP, or bring a listing link."
                  : "Try fewer filters to see all four demo scenarios."}
              </p>
              <button
                className="hb-btn hb-outline"
                onClick={() =>
                  setFilters({
                    q: "",
                    min: "",
                    max: "",
                    beds: "",
                    baths: "",
                    type: "",
                    sqft: "",
                  })
                }
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
