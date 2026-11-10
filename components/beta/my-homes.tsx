"use client";
import { useState } from "react";
import Link from "next/link";
import { Link2, ArrowRight, Heart, GitCompareArrows } from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import HomeCard from "./property-card";
import { analyze } from "../../lib/homebridge/analysis";
import {
  defaultAssumptions,
  calculatePayment,
  dollars,
} from "../../lib/homebridge/finance";
export function CompareHomes() {
  const { state, all, profileFor, update } = useWorkspace();
  const homes = all.filter((h) => state.compare.includes(h.id));
  return (
    <div className="hb-page">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">MAKE A MORE INFORMED SHORTLIST</span>
        <h1>Compare homes.</h1>
        <p>
          Up to three homes, using supplied facts and clearly labeled
          assumptions.
        </p>
      </div>
      {homes.length ? (
        <>
          <div className="hb-comparison">
            {homes.map((home) => (
              <article className="hb-panel" key={home.id}>
                <HomeCard home={home} />
                <div>
                  {[
                    ["Asking price", dollars(home.price)],
                    [
                      "Modeled monthly payment",
                      dollars(
                        calculatePayment(
                          state.assumptions[home.id] ||
                            defaultAssumptions(home),
                        ).total,
                      ),
                    ],
                    [
                      "Size",
                      home.sqft
                        ? home.sqft.toLocaleString() + " sqft"
                        : "Unknown",
                    ],
                    [
                      "Bedrooms / bathrooms",
                      `${home.beds ?? "Unknown"} / ${home.baths ?? "Unknown"}`,
                    ],
                    ["Monthly HOA", dollars(home.hoa)],
                  ].map(([name, value]) => (
                    <div className="hb-cost-row" key={name}>
                      <span>{name}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                  <h3>Fit with your priorities</h3>
                  {analyze(
                    home,
                    profileFor(home.id),
                    state.assumptions[home.id] || defaultAssumptions(home),
                  )
                    .filter(
                      (o) =>
                        o.title === "Bedroom fit" ||
                        o.title === "Your yard priority" ||
                        o.title === "Monthly budget comparison",
                    )
                    .map((o, i) => (
                      <p key={i}>{o.text}</p>
                    ))}
                  {!profileFor(home.id).monthlyBudget &&
                    profileFor(home.id).minBeds === null &&
                    profileFor(home.id).yard === "Not shared" && (
                      <p>
                        Share your priorities on this property’s page to get a
                        reasoned fit comparison. We don’t assign arbitrary
                        scores.
                      </p>
                    )}
                  <Link
                    className="hb-btn hb-outline hb-full"
                    href={`/homes/${home.id}`}
                  >
                    Open analysis <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          <p className="hb-muted">
            Payments use each home’s current editable assumptions, not live
            rates or loan offers. Comparables are not inferred from this
            shortlist.
          </p>
          <button
            className="hb-btn hb-outline"
            onClick={() => update((s) => ({ ...s, compare: [] }))}
          >
            Clear shortlist
          </button>
        </>
      ) : (
        <div className="hb-empty hb-panel">
          <GitCompareArrows size={28} />
          <h2>Add homes to compare.</h2>
          <p>
            Use the Compare button on a home card. Your shortlist stays in this
            workspace.
          </p>
          <Link href="/homes" className="hb-btn hb-primary">
            Choose homes
          </Link>
        </div>
      )}
    </div>
  );
}
export default function MyHomes() {
  const { state, all, ready, config } = useWorkspace();
  const [tab, setTab] = useState("Saved");
  const tabs = [
    "Saved",
    "Imported",
    "Recently viewed",
    "Conversations",
    "Draft offers",
  ];
  const ids =
    tab === "Saved"
      ? state.saved
      : tab === "Imported"
        ? state.homes
            .filter((h) => h.source === "user" || h.sourceUrl)
            .map((h) => h.id)
        : tab === "Recently viewed"
          ? state.recent
          : tab === "Conversations"
            ? Object.keys(state.conversations).filter(
                (id) => state.conversations[id].length,
              )
            : Object.keys(state.offers);
  const homes = all.filter((h) => ids.includes(h.id));
  return (
    <div className="hb-page">
      <div className="hb-page-heading hb-row hb-between">
        <div>
          <span className="hb-eyebrow">YOUR HOMES. YOUR DECISIONS.</span>
          <h1>My Homes</h1>
          <p>
            {config.user
              ? "Your signed-in workspace. Use Account to sync your progress."
              : "Guest workspace — saved in this browser. Sign in when you’re ready to sync."}
          </p>
        </div>
        <div className="hb-row">
          <Link href="/compare" className="hb-btn hb-outline">
            <GitCompareArrows size={16} />
            Compare ({state.compare.length})
          </Link>
          <Link href="/import" className="hb-btn hb-primary">
            <Link2 size={16} />
            Add a home
          </Link>
        </div>
      </div>
      <div className="hb-tabs" role="tablist" aria-label="My Homes categories">
        {tabs.map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {!ready ? (
        <div className="hb-skeleton">
          <div />
          <div />
        </div>
      ) : homes.length ? (
        <div className="hb-home-grid">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      ) : (
        <div className="hb-empty hb-panel">
          <Heart size={28} />
          <h2>
            {tab === "Saved"
              ? "Your shortlist starts with one home."
              : `No ${tab.toLowerCase()} yet.`}
          </h2>
          <p>Bring a home you’ve found or explore a fictional demo scenario.</p>
          <div className="hb-row">
            <Link href="/import" className="hb-btn hb-primary">
              Import a listing
            </Link>
            <Link href="/homes?demo=1" className="hb-btn hb-outline">
              Try a demo home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
