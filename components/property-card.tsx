"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  Heart,
  GitCompareArrows,
  BedDouble,
  Bath,
  Maximize,
} from "lucide-react";
import { State, Property, money, mortgage } from "../lib/model";
type Props = {
  p: Property;
  state: State;
  toggle: (id: string, key: "saved" | "compare") => void;
};
export default function PropertyCard({ p, state, toggle }: Props) {
  return (
    <article className="property" key={p.id}>
      <Link href={`/homes/${p.id}`} className="property-photo">
        <img
          src={p.image}
          alt={`Illustrative architectural illustration for ${p.address}`}
        />
        <span className="photo-tag">{p.status}</span>
        <span className="photo-note">SIMULATED LISTING · AI ILLUSTRATION</span>
      </Link>
      <button
        aria-label={`${state.saved.includes(p.id) ? "Unsave" : "Save"} ${p.address}`}
        className={`save ${state.saved.includes(p.id) ? "active" : ""}`}
        onClick={() => toggle(p.id, "saved")}
      >
        <Heart
          size={18}
          fill={state.saved.includes(p.id) ? "currentColor" : "none"}
        />
      </button>
      <div className="property-info">
        <div className="row between">
          <Link href={`/homes/${p.id}`}>
            <h3>{money(p.price)}</h3>
          </Link>
          <button
            className={`compare-button ${state.compare.includes(p.id) ? "selected" : ""}`}
            onClick={() => toggle(p.id, "compare")}
            aria-label={`Compare ${p.address}`}
          >
            <GitCompareArrows size={15} /> Compare
          </button>
        </div>
        <Link href={`/homes/${p.id}`} className="address">
          {p.address}
        </Link>
        <p>{p.city}, UT · Utah County</p>
        <div className="facts">
          <span>
            <BedDouble size={15} />
            {p.beds} beds
          </span>
          <span>
            <Bath size={15} />
            {p.baths} baths
          </span>
          <span>
            <Maximize size={14} />
            {p.sqft.toLocaleString()} sqft
          </span>
        </div>
        <div className="property-bottom">
          <span>
            <span className="dot" /> {p.type}
          </span>
          <span>
            Est. {money(mortgage(p.price, 20, 6.5, 30, 2400, 1200, 0).total)}
            /mo
          </span>
        </div>
      </div>
    </article>
  );
}
