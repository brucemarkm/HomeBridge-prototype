"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  GitCompareArrows,
  BedDouble,
  Bath,
  Maximize,
} from "lucide-react";
import { Home } from "../../lib/homebridge/schema";
import { sourceLabel } from "../../lib/homebridge/demo";
import {
  dollars,
  calculatePayment,
  defaultAssumptions,
} from "../../lib/homebridge/finance";
import { useWorkspace } from "./workspace-provider";
export default function HomeCard({ home }: { home: Home }) {
  const { state, update, saveHome, notify } = useWorkspace();
  const saved = state.saved.includes(home.id),
    compared = state.compare.includes(home.id);
  return (
    <article className="hb-home-card">
      <Link href={`/homes/${home.id}`} className="hb-card-image">
        <img
          src={home.image}
          alt={
            home.imageKind === "illustration"
              ? "Generated architectural illustration, not a photograph of this address"
              : `Provider-supplied image for ${home.address}`
          }
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "/images/home-0.png";
          }}
        />
        <span>
          {home.imageKind === "illustration"
            ? "Illustrative architecture"
            : "Provider image"}
        </span>
      </Link>
      <button
        className={`hb-heart ${saved ? "is-saved" : ""}`}
        aria-label={`${saved ? "Unsave" : "Save"} ${home.address}`}
        onClick={() =>
          saved
            ? update((s) => ({
                ...s,
                saved: s.saved.filter((id) => id !== home.id),
              }))
            : saveHome(home)
        }
      >
        <Heart size={18} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="hb-card-content">
        <span className={`hb-source ${home.source}`}>{sourceLabel(home)}</span>
        <div className="hb-row hb-between">
          <h3>{dollars(home.price)}</h3>
          <span className="hb-card-type">{home.type}</span>
        </div>
        <Link href={`/homes/${home.id}`} className="hb-card-address">
          {home.address} <ArrowUpRight size={14} />
        </Link>
        <p>
          {home.city}, UT {home.zip}
        </p>
        <div className="hb-card-facts">
          <span>
            <BedDouble size={14} />
            {home.beds ?? "—"} beds
          </span>
          <span>
            <Bath size={14} />
            {home.baths ?? "—"} baths
          </span>
          <span>
            <Maximize size={13} />
            {home.sqft?.toLocaleString() ?? "—"} sqft
          </span>
        </div>
        <div className="hb-card-bottom">
          <span>
            {home.price
              ? `${dollars(calculatePayment(state.assumptions[home.id] || defaultAssumptions(home)).total)}/mo estimated`
              : "Payment needs price"}
          </span>
          <button
            aria-label={`Compare ${home.address}`}
            aria-pressed={compared}
            onClick={() => {
              if (!compared && state.compare.length === 3) {
                notify("Compare up to three homes. Remove one to add another.");
                return;
              }
              update((s) => ({
                ...s,
                compare: compared
                  ? s.compare.filter((id) => id !== home.id)
                  : [...s.compare, home.id],
                homes:
                  home.source === "demo"
                    ? s.homes
                    : [...s.homes.filter((h) => h.id !== home.id), home],
              }));
            }}
          >
            <GitCompareArrows size={14} />
            {compared ? "Added" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  );
}
