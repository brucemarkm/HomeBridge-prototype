"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Link2,
  Sparkles,
  Users,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { useWorkspace } from "./workspace-provider";
import { dollars } from "../../lib/homebridge/finance";
export function Pricing() {
  const { state, update } = useWorkspace();
  const [price, setPrice] = useState(500000),
    [percent, setPercent] = useState(2.5),
    [contribution, setContribution] = useState(0),
    [concession, setConcession] = useState(0),
    [cap, setCap] = useState(15000);
  const traditional = (price * percent) / 100;
  function input(
    label: string,
    value: number,
    set: (n: number) => void,
    max = 100000000,
    step = "1",
  ) {
    return (
      <label>
        {label}
        <input
          type="number"
          min="0"
          max={max}
          step={step}
          value={value}
          onChange={(e) =>
            set(Math.max(0, Math.min(max, Number(e.target.value) || 0)))
          }
        />
      </label>
    );
  }
  return (
    <div className="hb-page hb-pricing-page">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">
          EFFICIENCY. TRANSPARENCY. PROFESSIONAL OVERSIGHT.
        </span>
        <h1>
          A proposed flat fee.
          <br />A clearer way to understand it.
        </h1>
        <p>
          AI helps you handle more of the preparation. Licensed professionals
          would focus on representation, strategy, negotiation, and approved
          agreements.
        </p>
      </div>
      <div className="hb-pricing-grid">
        <section className="hb-panel">
          <h2>Explore a compensation comparison.</h2>
          <p>
            Every assumption is adjustable. There is no standard or required
            commission percentage.
          </p>
          <div className="hb-form-grid">
            {input("Purchase price ($)", price, setPrice)}
            {input(
              "Illustrative comparison fee (%)",
              percent,
              setPercent,
              10,
              ".1",
            )}
            {input(
              "Proposed Homebridge fee ($)",
              state.fee,
              (n) => update((s) => ({ ...s, fee: n })),
              100000,
            )}
            {input(
              "Assumed seller compensation contribution ($)",
              contribution,
              setContribution,
            )}
          </div>
          <details className="hb-details">
            <summary>Explore potential concessions separately</summary>
            {input("Requested concessions ($)", concession, setConcession)}
            {input("Illustrative lender-permitted cap ($)", cap, setCap)}
            <p>
              The cap is a user-entered assumption, not a lender determination.
              Concessions are separate from representation compensation and are
              not automatically available.
            </p>
          </details>
        </section>
        <section className="hb-payment-card">
          <span className="hb-eyebrow">
            ILLUSTRATIVE COMPENSATION DIFFERENCE
          </span>
          <div className="hb-payment-total">
            {dollars(traditional - state.fee)}
          </div>
          {[
            ["Percentage-based comparison fee", traditional],
            ["Proposed Homebridge fee", state.fee],
            [
              "Buyer-paid comparison remainder",
              Math.max(0, traditional - contribution),
            ],
            [
              "Buyer-paid Homebridge remainder",
              Math.max(0, state.fee - contribution),
            ],
            [
              "Capped potential concessions (separate)",
              Math.min(concession, cap),
            ],
          ].map(([label, value]) => (
            <div className="hb-cost-row" key={label}>
              <span>{label}</span>
              <strong>{dollars(Number(value))}</strong>
            </div>
          ))}
          <div className="hb-callout">
            <CheckCircle2 size={18} />
            <p>
              A fee difference is not automatically cash savings, a refund, or a
              seller credit. Buyer-broker compensation is negotiable. Seller
              contributions depend on agreements; concessions require lender
              approval. The same contribution is modeled in both scenarios only
              for comparison.
            </p>
          </div>
          <Link href="/homes?demo=1" className="hb-btn hb-primary">
            Try the buyer experience <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <p className="hb-muted">
        {dollars(state.fee)} is a proposed buyer representation fee subject to
        future licensing, service design, and brokerage arrangements. This is
        not a legally operative brokerage offering. Changes to this calculator
        are local to your workspace.
      </p>
    </div>
  );
}
export function Integrations() {
  const { config } = useWorkspace();
  return (
    <div className="hb-page hb-integrations">
      <div className="hb-page-heading">
        <span className="hb-eyebrow">CLEAR ABOUT WHAT’S CONNECTED</span>
        <h1>Data & integrations</h1>
        <p>
          The guest journey works without external accounts. Connections below
          enable additional capabilities only when configured and authorized.
        </p>
      </div>
      <div className="hb-integration-grid">
        {[
          [
            "Property search",
            config.listings,
            "RESO Web API / authorized provider",
            "A permitted active listing feed, provider access token, HTTPS API base URL, host allowlist, and required attribution. A Bridge Interactive endpoint can be used only with the appropriate MLS and provider authorization.",
          ],
          [
            "Property URL import",
            Boolean(config.resolver),
            "Optional authorized resolver",
            "Pasted URLs are validated and identified, never scraped. Automatic resolution requires a configured licensed resolver. Otherwise manual entry and description paste work.",
          ],
          [
            "Live property AI",
            config.ai,
            "OpenAI via server-side endpoint",
            "Server-only API key, authenticated Supabase account, atomic daily quota migration, and per-property user consent. Responses use structured output. Guests use the labeled scripted guide.",
          ],
          [
            "Accounts & private sync",
            config.auth,
            "Supabase Auth + PostgreSQL RLS",
            "Project URL, public anon key, allowed callback URLs, and the supplied database migration. Google sign-in also needs an enabled Google provider.",
          ],
          [
            "Draft documents",
            true,
            "Local generation through PDF endpoint",
            "Six original preparation worksheets with no external document API, official legal forms, or signature service. All downloads are marked nonbinding demo drafts.",
          ],
          [
            "Professional review",
            false,
            "Local prototype simulation",
            "No actual agent is assigned or contacted. Reviewer role switching is a sandbox over the buyer-approved snapshot, not production professional access.",
          ],
        ].map(([title, on, provider, text]) => (
          <section key={String(title)} className="hb-panel">
            <div className="hb-row hb-between">
              <h2>{String(title)}</h2>
              <span className={on ? "hb-status" : "hb-demo-pill"}>
                {on ? "Configured" : "Not connected"}
              </span>
            </div>
            <h3>{String(provider)}</h3>
            <p>{String(text)}</p>
            {on && (
              <small>
                Configuration presence does not verify remote access.
                Operational failures are shown when the feature is used.
              </small>
            )}
          </section>
        ))}
      </div>
      <section className="hb-panel">
        <h2>Listing data is not automatically verified.</h2>
        <p>
          We distinguish fictional demo facts, user-supplied information,
          provider-reported data, calculated estimates, and unknowns. Provider
          reports still require current availability and accuracy checks. No
          source makes AI opinions a valuation, inspection, or professional
          approval.
        </p>
        <p>
          Environment variable setup and provider requirements are documented in
          the project’s README and INTEGRATIONS.md. Enter credentials securely
          in your hosting environment, never in chat or the repository.
        </p>
      </section>
    </div>
  );
}
export function HowItWorks() {
  return (
    <div className="hb-page">
      <div className="hb-page-heading hb-how-heading">
        <span className="hb-eyebrow">
          THE HOME YOU FOUND. A PATH YOU UNDERSTAND.
        </span>
        <h1>
          One homebuying workspace.
          <br />
          One clear next step.
        </h1>
        <p>
          Homebridge brings research, affordability, draft preparation, and
          professional handoff into one connected experience.
        </p>
      </div>
      <div className="hb-steps">
        {[
          [
            Link2,
            "01",
            "Find your home",
            "Paste a listing URL, supply information you know, or choose a fictional demo property. Original links and data sources stay visible.",
          ],
          [
            Sparkles,
            "02",
            "Get guidance and prepare",
            "Discuss property facts, explore payments, save your priorities, and explicitly confirm proposed offer terms one question at a time.",
          ],
          [
            Users,
            "03",
            "Move forward with a professional",
            "Preview your draft PDFs and approve the exact snapshot shared for review. Try both sides of the simulated handoff.",
          ],
        ].map(([Icon, n, title, text]) => {
          const I = Icon as typeof Link2;
          return (
            <article key={String(n)}>
              <div className="hb-row hb-between">
                <I size={25} />
                <span>{String(n)}</span>
              </div>
              <h2>{String(title)}</h2>
              <p>{String(text)}</p>
            </article>
          );
        })}
      </div>
      <section className="hb-info-split">
        <div className="hb-panel">
          <h2>Technology helps with preparation.</h2>
          <p>
            The advisor organizes supplied facts, explains estimates, asks
            useful questions, and helps you prepare a nonbinding discussion
            package.
          </p>
        </div>
        <div className="hb-panel">
          <h2>Professionals handle the real decisions.</h2>
          <p>
            Actual representation, strategy, negotiations, approved agreements,
            and official transaction oversight require appropriately licensed
            professionals and verified brokerage arrangements.
          </p>
        </div>
      </section>
      <div className="hb-final-cta">
        <h2>Try the whole journey.</h2>
        <p>No account, payment, or real transaction required.</p>
        <Link href="/homes?demo=1" className="hb-btn hb-cream">
          Choose a demo home <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
export function Resources() {
  return (
    <div className="hb-page">
      <div className="hb-page-heading">
        <h1>Homebuying, in plain language.</h1>
        <p>
          Educational starting points. Actual rights and costs depend on
          approved agreements and professional advice.
        </p>
      </div>
      <div className="hb-integration-grid">
        {[
          [
            "Earnest money",
            "A proposed deposit showing intent to buy. Handling, deadlines, and refund rights depend on the signed agreement. No money moves in this prototype.",
          ],
          [
            "Contingencies",
            "Conditions that may need to be met for a purchase to proceed, such as financing or inspection review. Never assume a right to cancel without professional review.",
          ],
          [
            "Closing costs",
            "Costs beyond the down payment, such as lender/title services, prepaid taxes, and insurance. Obtain actual estimates; a percentage is only a planning assumption.",
          ],
          [
            "Appraisals",
            "A lender-related value assessment that may differ from asking or offer price. Ask how a shortfall would affect financing before agreeing to terms.",
          ],
        ].map(([title, text]) => (
          <section className="hb-panel" key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
      </div>
      <Link href="/homes/demo-provo" className="hb-btn hb-primary">
        Ask about a demo property <ArrowRight size={16} />
      </Link>
    </div>
  );
}
