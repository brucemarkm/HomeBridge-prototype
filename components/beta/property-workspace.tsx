"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BedDouble,
  Bath,
  Maximize,
  X,
  ShieldCheck,
} from "lucide-react";
import { Home } from "../../lib/homebridge/schema";
import { sourceLabel } from "../../lib/homebridge/demo";
import { analyze } from "../../lib/homebridge/analysis";
import { defaultAssumptions, dollars } from "../../lib/homebridge/finance";
import { useWorkspace } from "./workspace-provider";
import Advisor from "./advisor";
import Mortgage from "./mortgage";
import OfferWizard from "./offer-wizard";
import DraftDocuments from "./documents";
import AgentHandoff from "./review";
import BuyerProfileForm from "./buyer-profile";
function PropertyContent({ home }: { home: Home }) {
  const { state, update, profileFor, saveHome } = useWorkspace();
  const params = useSearchParams();
  const tab = params.get("tab") || "analysis";
  const [mobileAdvisor, setMobileAdvisor] = useState(false);
  const [showAdvisor, setShowAdvisor] = useState(true);
  const profile = profileFor(home.id),
    a = state.assumptions[home.id] || defaultAssumptions(home),
    observations = analyze(home, profile, a);
  const draft = state.offers[home.id],
    review = state.reviews.find((r) => r.propertyId === home.id),
    decided = state.completedTasks.includes(`decide:${home.id}`);
  const stage = review ? 4 : draft ? 3 : decided ? 2 : 1;
  useEffect(() => {
    update((s) => ({
      ...s,
      activeHome: home.id,
      recent: [home.id, ...s.recent.filter((id) => id !== home.id)].slice(
        0,
        30,
      ),
    }));
  }, [home.id, update]);
  useEffect(() => {
    if (!mobileAdvisor) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const previous = document.activeElement as HTMLElement | null;
    const panel = document.getElementById("hb-advisor-drawer");
    panel?.querySelector<HTMLElement>("button")?.focus();
    function keys(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileAdvisor(false);
      if (e.key === "Tab") {
        const controls = Array.from(
          panel?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),a[href],input,select,textarea",
          ) || [],
        ).filter((e) => e.offsetParent !== null);
        const first = controls[0],
          last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", keys);
      previous?.focus();
    };
  }, [mobileAdvisor]);
  return (
    <div className="hb-property-page">
      <div className="hb-property-top">
        <Link href="/homes" className="hb-text-link">
          <ArrowLeft size={15} />
          Explore homes
        </Link>
        <div className="hb-row">
          <button
            className="hb-btn hb-outline hb-small"
            onClick={() =>
              state.saved.includes(home.id)
                ? update((s) => ({
                    ...s,
                    saved: s.saved.filter((id) => id !== home.id),
                  }))
                : saveHome(home)
            }
          >
            <Heart
              size={15}
              fill={state.saved.includes(home.id) ? "currentColor" : "none"}
            />
            {state.saved.includes(home.id) ? "Saved" : "Save home"}
          </button>
          <button
            className="hb-btn hb-outline hb-small hb-advisor-toggle"
            onClick={() => setShowAdvisor(!showAdvisor)}
          >
            <Sparkles size={15} />
            {showAdvisor ? "Hide advisor" : "Show advisor"}
          </button>
        </div>
      </div>
      <nav className="hb-journey" aria-label="Your homebuying progress">
        {[
          "Find a home",
          "Analyze",
          "Decide",
          "Prepare draft",
          "Agent review",
        ].map((label, i) => (
          <Link
            key={label}
            href={
              i === 0
                ? "/homes"
                : `/homes/${home.id}?tab=${i === 3 ? "offer" : i === 4 ? "review" : "analysis"}`
            }
            className={i === stage ? "active" : i < stage ? "complete" : ""}
          >
            <span>{i < stage ? <CheckCircle2 size={14} /> : i + 1}</span>
            {label}
          </Link>
        ))}
      </nav>
      <div
        className={`hb-property-layout ${!showAdvisor ? "advisor-hidden" : ""}`}
      >
        <div className="hb-property-main">
          <div className="hb-property-hero">
            <img
              src={home.image}
              alt={
                home.imageKind === "illustration"
                  ? "Generated architecture illustration; does not depict this address"
                  : `Provider-supplied property image for ${home.address}`
              }
            />
            <span>
              {home.imageKind === "illustration"
                ? "AI-GENERATED ILLUSTRATION · NOT A LISTING PHOTO"
                : "PROVIDER-SUPPLIED IMAGE"}
            </span>
          </div>
          <div className="hb-property-title">
            <span className={`hb-source ${home.source}`}>
              {sourceLabel(home)}
            </span>
            <div className="hb-row hb-between">
              <h1>{home.address}</h1>
              <strong>{dollars(home.price)}</strong>
            </div>
            <p>
              {home.city}, UT {home.zip} · {home.type}
            </p>
            <div className="hb-detail-facts">
              <span>
                <BedDouble size={17} />
                {home.beds ?? "Unknown"} beds
              </span>
              <span>
                <Bath size={17} />
                {home.baths ?? "Unknown"} baths
              </span>
              <span>
                <Maximize size={16} />
                {home.sqft?.toLocaleString() ?? "Unknown"} sqft
              </span>
              <span>Built {home.year ?? "unknown"}</span>
            </div>
            {home.sourceUrl && (
              <a
                className="hb-source-link"
                href={home.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open original listing <ExternalLink size={13} />
              </a>
            )}
            {home.attribution && (
              <p className="hb-attribution">
                {home.attribution}
                {home.updatedAt ? " · Provider updated " + home.updatedAt : ""}
              </p>
            )}
          </div>
          <nav className="hb-property-tabs" aria-label="Property workspace">
            {[
              ["analysis", "Analysis"],
              ["payment", "Affordability"],
              ["offer", "Prepare an offer"],
              ["documents", "Draft documents"],
              ["review", "Agent review"],
            ].map(([key, title]) => (
              <Link
                key={key}
                href={`/homes/${home.id}?tab=${key}`}
                aria-current={tab === key ? "page" : undefined}
              >
                {title}
              </Link>
            ))}
          </nav>
          <div className="hb-property-tab-content">
            {tab === "payment" ? (
              <Mortgage home={home} />
            ) : tab === "offer" ? (
              <OfferWizard home={home} />
            ) : tab === "documents" ? (
              <DraftDocuments home={home} />
            ) : tab === "review" ? (
              <AgentHandoff
                key={`${draft?.revision}-${review?.id}`}
                home={home}
              />
            ) : tab === "profile" ? (
              <BuyerProfileForm home={home} />
            ) : (
              <>
                <div className="hb-section-heading">
                  <div>
                    <span className="hb-eyebrow">
                      KNOWN FACTS. USEFUL QUESTIONS.
                    </span>
                    <h2>Understand this home.</h2>
                  </div>
                  <Link
                    className="hb-text-link"
                    href={`/homes/${home.id}?tab=profile`}
                  >
                    Edit your priorities <ArrowRight size={14} />
                  </Link>
                </div>
                <p>
                  These observations use supplied property details and your
                  preferences. They are not an inspection, appraisal, or
                  professional opinion of value.
                </p>
                <div className="hb-analysis-cards">
                  {observations.map((o, i) => (
                    <article className={`hb-analysis-card ${o.kind}`} key={i}>
                      <div>
                        {o.kind === "positive" ? (
                          <CheckCircle2 size={18} />
                        ) : o.kind === "concern" ? (
                          <AlertCircle size={18} />
                        ) : (
                          <HelpCircle size={18} />
                        )}
                        <span>
                          {o.kind === "positive"
                            ? "Positive factor"
                            : o.kind === "concern"
                              ? "Potential concern"
                              : "Information needed"}
                        </span>
                      </div>
                      <h3>{o.title}</h3>
                      <p>{o.text}</p>
                      <small>{o.evidence}</small>
                    </article>
                  ))}
                </div>
                <div className="hb-decision-card">
                  <h3>Is this one worth pursuing?</h3>
                  <p>
                    Save it to your shortlist, explore the monthly costs, or
                    start preparing questions and proposed terms for review.
                  </p>
                  <div className="hb-row">
                    <Link
                      className="hb-btn hb-primary"
                      href={`/homes/${home.id}?tab=offer`}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          completedTasks: [
                            ...new Set([
                              ...s.completedTasks,
                              `decide:${home.id}`,
                            ]),
                          ],
                          saved: s.saved.includes(home.id)
                            ? s.saved
                            : [...s.saved, home.id],
                        }))
                      }
                    >
                      Prepare an offer <ArrowRight size={16} />
                    </Link>
                    <Link
                      className="hb-btn hb-outline"
                      href={`/homes/${home.id}?tab=payment`}
                    >
                      Explore affordability
                    </Link>
                  </div>
                </div>
                <details className="hb-details hb-property-details" open>
                  <summary>Property description & supplied features</summary>
                  <p>
                    {home.description ||
                      "No description was supplied. Add verified details before making decisions."}
                  </p>
                  <div className="hb-feature-tags">
                    {home.features.map((f) => (
                      <span key={f}>
                        <CheckCircle2 size={13} />
                        {f}
                      </span>
                    ))}
                  </div>
                </details>
                <details className="hb-details hb-property-details">
                  <summary>Disclosures, HOA & known concerns</summary>
                  <p>
                    Monthly HOA: {dollars(home.hoa)} · Annual property tax:{" "}
                    {dollars(home.taxAnnual)}
                  </p>
                  {[...home.disclosures, ...home.concerns].map((text, i) => (
                    <p key={i}>{text}</p>
                  ))}
                  {!home.disclosures.length && !home.concerns.length && (
                    <p>
                      No disclosures or condition findings were supplied.
                      Missing data is not evidence that no issues exist.
                    </p>
                  )}
                  {home.sellerScenario && <p>{home.sellerScenario}</p>}
                </details>
                <details className="hb-details hb-property-details">
                  <summary>Price history, comparable data & sources</summary>
                  {home.history.map((h, i) => (
                    <div key={i} className="hb-cost-row">
                      <span>
                        {h.date} · {h.note}
                      </span>
                      <strong>{dollars(h.price)}</strong>
                    </div>
                  ))}
                  {home.comparables.length ? (
                    home.comparables.map((c, i) => (
                      <p key={i}>
                        {c.address}: {dollars(c.price)} · {c.sqft} sqft ·{" "}
                        {c.soldDate} · Source: {c.source}
                      </p>
                    ))
                  ) : (
                    <p>
                      No verified comparable sales are available. Price per
                      square foot{" "}
                      {home.price && home.sqft
                        ? `(${dollars(home.price / home.sqft)}) `
                        : ""}
                      is a descriptive metric, not a valuation.
                    </p>
                  )}
                  <div className="hb-provenance-list">
                    {Object.entries(home.provenance).map(([field, source]) => (
                      <span key={field}>
                        {field}
                        <strong>{source}</strong>
                      </span>
                    ))}
                  </div>
                </details>
                <Link
                  className="hb-btn hb-outline hb-mobile-inline-ai"
                  href="#property-advisor"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileAdvisor(true);
                  }}
                >
                  <Sparkles size={16} />
                  Ask Homebridge AI about this home
                </Link>
              </>
            )}
          </div>
        </div>
        {(showAdvisor || mobileAdvisor) && (
          <>
            {mobileAdvisor && (
              <button
                className="hb-advisor-backdrop"
                aria-label="Close advisor"
                onClick={() => setMobileAdvisor(false)}
              />
            )}
            <aside
              id="hb-advisor-drawer"
              className={`hb-advisor-column ${mobileAdvisor ? "mobile-open" : ""}`}
              role={mobileAdvisor ? "dialog" : undefined}
              aria-modal={mobileAdvisor || undefined}
              aria-label="Property advisor"
            >
              <div className="hb-mobile-advisor-header">
                <strong>Ask about this home</strong>
                <button
                  aria-label="Close advisor"
                  onClick={() => setMobileAdvisor(false)}
                >
                  <X size={21} />
                </button>
              </div>
              <Advisor home={home} />
            </aside>
          </>
        )}
      </div>
      <button
        className="hb-mobile-ai-button"
        onClick={() => setMobileAdvisor(true)}
      >
        <Sparkles size={18} />
        Ask Homebridge AI about this home <ArrowRight size={15} />
      </button>
    </div>
  );
}
export default function PropertyWorkspace({ id }: { id: string }) {
  const { all, ready } = useWorkspace();
  if (!ready)
    return (
      <div
        className="hb-page hb-skeleton"
        aria-label="Loading property workspace"
      >
        <div />
        <div />
        <div />
      </div>
    );
  const home = all.find((h) => h.id === id);
  if (!home)
    return (
      <div className="hb-page hb-empty">
        <h1>This home isn’t in this workspace.</h1>
        <p>
          Guest imports stay in the browser where you saved them. Sync an
          account to open your saved homes on another device.
        </p>
        <Link href="/import" className="hb-btn hb-primary">
          Import a home
        </Link>
        <Link href="/homes" className="hb-btn hb-outline">
          Explore demo homes
        </Link>
      </div>
    );
  return <PropertyContent key={home.id} home={home} />;
}
