"use client";
/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Link2,
  Sparkles,
  Check,
  FileCheck2,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import { demoHomes } from "../../lib/homebridge/demo";
import { useWorkspace } from "./workspace-provider";
import { dollars } from "../../lib/homebridge/finance";
export default function Landing() {
  const [url, setUrl] = useState("");
  const router = useRouter();
  const { state } = useWorkspace();
  return (
    <>
      <section className="hb-hero">
        <div className="hb-hero-copy">
          <span className="hb-eyebrow">
            <i /> YOUR HOME. YOUR DECISIONS. ONE CLEAR PATH.
          </span>
          <h1>
            Buy a home.
            <br />
            Skip the <em>complexity.</em>
          </h1>
          <p>
            Find homes, get AI-powered guidance, prepare your offer, and work
            with a real estate professional — all in one place.
          </p>
          <div className="hb-hero-buttons">
            <Link className="hb-btn hb-primary" href="/import">
              Find or analyze a home <ArrowUpRight size={17} />
            </Link>
            <Link className="hb-btn hb-quiet" href="/homes?demo=1">
              Try a demo purchase <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hb-hero-fee">
            <span className="hb-check">
              <Check size={15} />
            </span>
            <div>
              <strong>{dollars(state.fee)} proposed flat buyer fee</strong>
              <span>
                Technology-assisted preparation. Professional oversight.
                <br />
                Subject to future brokerage arrangements. No guaranteed savings.
              </span>
            </div>
          </div>
        </div>
        <div className="hb-hero-visual">
          <img
            src="/images/home-0.png"
            alt="Original generated illustration of a warm contemporary Utah-style home"
          />
          <span className="hb-illustration-caption">
            AI-GENERATED ARCHITECTURE · FICTIONAL HOME
          </span>
          <div className="hb-hero-advisor">
            <div className="hb-row">
              <span className="hb-ai-symbol">
                <Sparkles size={19} />
              </span>
              <div>
                <strong>One home. A clearer decision.</strong>
                <small>Homebridge property advisor</small>
              </div>
              <span className="hb-demo-pill">DEMO</span>
            </div>
            <div className="hb-mini-observation">
              <Check size={15} />
              <span>A fenced yard matches your priorities</span>
            </div>
            <div className="hb-mini-observation warning">
              <Plus size={15} />
              <span>Ask about the roof and disclosure history</span>
            </div>
            <Link href="/homes/demo-lehi" className="hb-advisor-link">
              Explore this home with the advisor <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="hb-link-entry">
        <div>
          <span className="hb-eyebrow">START WITH THE HOME YOU FOUND</span>
          <h2>Found a home somewhere else?</h2>
          <p>Paste the link here. We’ll help you organize what comes next.</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(
              `/import${url ? "?url=" + encodeURIComponent(url) : ""}`,
            );
          }}
        >
          <Link2 size={19} />
          <input
            aria-label="Listing link"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a Zillow, Redfin, or Realtor.com link"
          />
          <button className="hb-btn hb-primary">
            Analyze home <ArrowRight size={16} />
          </button>
        </form>
        <small>
          Links stay visible. Automatic extraction requires an authorized
          provider; manual entry always works.
        </small>
      </section>
      <section className="hb-section">
        <div className="hb-section-heading">
          <div>
            <span className="hb-eyebrow">FROM FOUND IT TO WHAT’S NEXT</span>
            <h2>One workspace. Three simple steps.</h2>
          </div>
          <Link href="/how-it-works" className="hb-text-link">
            See the process <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="hb-steps">
          {[
            [
              Link2,
              "01",
              "Find your home",
              "Bring a listing link or choose a demo home. Keep the details and their sources together.",
            ],
            [
              Sparkles,
              "02",
              "Understand & prepare",
              "Explore affordability and concerns, ask questions, and prepare proposed offer terms.",
            ],
            [
              Users,
              "03",
              "Move forward with a professional",
              "Approve what you share, request review, and resolve questions before any actual action.",
            ],
          ].map(([Icon, n, title, text]) => {
            const I = Icon as typeof Link2;
            return (
              <article key={String(n)}>
                <div className="hb-row hb-between">
                  <I size={24} />
                  <span>{String(n)}</span>
                </div>
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="hb-product-preview">
        <div>
          <span className="hb-eyebrow">TRY IT BEFORE YOU SIGN UP</span>
          <h2>
            More than a listing.
            <br />A way to move forward.
          </h2>
          <p>
            Meet the Springville starter home. Explore its fictional disclosure,
            adjust the numbers, and prepare a draft purchase package.
          </p>
          <div className="hb-preview-benefits">
            <span>
              <Check size={15} />
              Questions grounded in property details
            </span>
            <span>
              <Check size={15} />
              Editable affordability assumptions
            </span>
            <span>
              <Check size={15} />
              Downloadable draft PDFs
            </span>
          </div>
          <Link href="/homes/demo-springville" className="hb-btn hb-primary">
            Try with a demo home <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="hb-preview-card">
          <div className="hb-row hb-between">
            <span className="hb-demo-pill">DEMO PROPERTY — FICTIONAL</span>
            <FileCheck2 size={20} />
          </div>
          <h3>{demoHomes[2].address}</h3>
          <p>Springville · 3 beds · 2 baths · {dollars(demoHomes[2].price)}</p>
          <Link
            href="/homes/demo-springville?ask=concerns"
            className="hb-preview-question"
          >
            <Sparkles size={17} />
            <span>What should I be concerned about?</span>
            <ArrowRight size={15} />
          </Link>
          <p className="hb-preview-response">
            The fictional disclosure notes seasonal moisture near a basement
            window. Ask for repair documentation and professional inspection
            guidance. The cause is not known.
          </p>
          <Link href="/homes/demo-springville" className="hb-text-link">
            Ask your own question <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section className="hb-fee-section">
        <span className="hb-eyebrow">CLEAR SUPPORT. TRANSPARENT PRICING.</span>
        <h2>
          AI handles more of the preparation.
          <br />
          People handle the decisions that matter.
        </h2>
        <div className="hb-fee-row">
          <strong>
            {dollars(state.fee)}
            <small>proposed flat buyer representation fee</small>
          </strong>
          <div>
            <p>
              Licensed professionals would focus on representation, strategy,
              negotiation, and approved agreements. This prototype demonstrates
              that proposed model.
            </p>
            <Link href="/pricing" className="hb-text-link">
              Explore the fee comparison <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
        <small>
          Compensation is negotiable. Seller contributions vary. A fee
          difference is not automatically a buyer cash saving.
        </small>
      </section>
      <section className="hb-final-cta">
        <span className="hb-eyebrow">FIND. UNDERSTAND. PREPARE.</span>
        <h2>Your next home starts here.</h2>
        <p>Try the whole journey. No account or payment required.</p>
        <Link href="/homes?demo=1" className="hb-btn hb-cream">
          Choose a demo home <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}
