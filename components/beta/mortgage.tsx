"use client";
import { invalidateDocuments } from "../../lib/homebridge/workflow";
import { Home, Assumptions } from "../../lib/homebridge/schema";
import {
  calculatePayment,
  defaultAssumptions,
  dollars,
} from "../../lib/homebridge/finance";
import { useWorkspace } from "./workspace-provider";
export default function Mortgage({ home }: { home: Home }) {
  const { state, update, profileFor } = useWorkspace();
  const a = state.assumptions[home.id] || defaultAssumptions(home),
    m = calculatePayment(a),
    profile = profileFor(home.id);
  function patch(key: keyof Assumptions, value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    const max =
      key === "downPercent"
        ? 100
        : key === "rate"
          ? 30
          : key === "years"
            ? 40
            : key === "pmiRate"
              ? 5
              : key === "closingPercent"
                ? 15
                : 100000000;
    update((s) => ({
      ...s,
      offers: invalidateDocuments(s, [home.id]),
      assumptions: {
        ...s.assumptions,
        [home.id]: {
          ...a,
          [key]: Math.max(key === "years" ? 1 : 0, Math.min(max, n)),
        },
      },
    }));
  }
  function field(key: keyof Assumptions, label: string, step = "1") {
    return (
      <label>
        {label}
        <input
          type="number"
          min={key === "years" ? 1 : 0}
          step={step}
          value={a[key]}
          onChange={(e) => patch(key, e.target.value)}
        />
      </label>
    );
  }
  return (
    <section className="hb-mortgage" id="affordability">
      <div className="hb-section-heading">
        <div>
          <span className="hb-eyebrow">YOUR ASSUMPTIONS. CLEARER NUMBERS.</span>
          <h2>What could this home cost?</h2>
        </div>
        <span className="hb-demo-pill">ILLUSTRATIVE ESTIMATE</span>
      </div>
      <p>
        Adjust the inputs to explore a monthly payment. Rates and insurance are
        assumptions, not quotes.{" "}
        {home.price === null
          ? "The asking price is unknown; the initial purchase price below is a modeling assumption."
          : ""}
      </p>
      <div className="hb-mortgage-grid">
        <div className="hb-panel">
          <div className="hb-form-grid">
            {field("price", "Purchase price ($)")}
            {field("downPercent", "Down payment (%)", ".5")}
            {field("rate", "Illustrative interest rate (%)", ".125")}
            <label>
              Loan term
              <select
                value={a.years}
                onChange={(e) => patch("years", e.target.value)}
              >
                {[10, 15, 20, 25, 30, 40].map((n) => (
                  <option key={n} value={n}>
                    {n} years
                  </option>
                ))}
              </select>
            </label>
            {field("hoa", "Monthly HOA ($)")}
            {field("taxAnnual", "Annual property taxes ($)")}
          </div>
          <small>
            HOA and tax defaults:{" "}
            {home.hoa === null || home.taxAnnual === null
              ? "some inputs are unknown and use editable assumptions"
              : home.source === "demo"
                ? "fictional demo facts"
                : home.source === "user"
                  ? "user-supplied, unverified"
                  : "provider-reported, subject to verification"}
            .
          </small>
          <details className="hb-details">
            <summary>Insurance, PMI, and other assumptions</summary>
            <div className="hb-form-grid">
              {field("insuranceAnnual", "Annual insurance ($)")}
              {field("pmiRate", "Illustrative annual PMI (%)", ".1")}
              {field("otherMonthly", "Other monthly costs ($)")}
              {field("closingPercent", "Assumed closing costs (%)", ".1")}
            </div>
          </details>
        </div>
        <div className="hb-payment-card">
          <span className="hb-eyebrow">ESTIMATED MONTHLY TOTAL</span>
          <div className="hb-payment-total" aria-live="polite">
            {dollars(m.total)}
            <small>/mo</small>
          </div>
          <div className="hb-payment-chart">
            {[
              m.pi,
              a.taxAnnual / 12,
              a.insuranceAnnual / 12,
              a.hoa + m.pmi + a.otherMonthly,
            ].map((v, i) => (
              <i
                key={i}
                style={{ width: `${m.total ? (v / m.total) * 100 : 0}%` }}
              />
            ))}
          </div>
          {[
            ["Principal & interest", m.pi],
            ["Property taxes", a.taxAnnual / 12],
            ["Insurance", a.insuranceAnnual / 12],
            ["HOA", a.hoa],
            ["Estimated PMI", m.pmi],
            ["Other monthly", a.otherMonthly],
          ].map(([name, value]) => (
            <div className="hb-cost-row" key={name}>
              <span>{name}</span>
              <strong>{dollars(Number(value))}</strong>
            </div>
          ))}
          <div className="hb-cash-close">
            <span>Modeled cash to close</span>
            <strong>{dollars(m.cashToClose)}</strong>
            <small>
              {dollars(m.down)} down + {dollars(m.closing)} assumed closing
              costs
            </small>
          </div>
          {profile.monthlyBudget && (
            <p className="hb-budget-check">
              {m.total <= profile.monthlyBudget ? "Within" : "Above"} your
              stated {dollars(profile.monthlyBudget)}/month comfort budget. This
              is not a lending decision.
            </p>
          )}
          <details className="hb-details">
            <summary>What this estimate leaves out</summary>
            <p>
              Exact prepaid items, deposits, credits, lender limits, title
              charges, and the proposed Homebridge representation fee require
              confirmation. Earnest money may be credited toward closing; it is
              not automatically an extra cost. Actual PMI terms vary. Total
              modeled interest: {dollars(m.totalInterest)}.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
