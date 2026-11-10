import { Home, OfferDraft, BuyerProfile, Assumptions } from "./schema";
import { calculatePayment, dollars } from "./finance";
import { missingTerms, analyze } from "./analysis";
export const DRAFT_NOTICE =
  "DEMO DRAFT — NOT A VALID PURCHASE AGREEMENT — NOT FOR SUBMISSION";
export function documentSections(
  home: Home,
  draft: OfferDraft,
  profile: BuyerProfile,
  a: Assumptions,
) {
  const t = draft.terms;
  const payment = calculatePayment({
    ...a,
    price: t.amount ?? a.price,
    downPercent:
      t.financing === "Cash" ? 100 : (t.downPercent ?? a.downPercent),
  });
  const value = (v: unknown) =>
    v === null || v === "" || v === undefined
      ? "Not provided — professional follow-up required"
      : String(v);
  return [
    {
      id: "summary",
      title: "Buyer offer summary",
      lines: [
        `Property: ${home.address}, ${home.city} ${home.zip}`,
        `Data source: ${home.source === "demo" ? "Fictional demonstration property" : home.source === "licensed" ? "Licensed provider-reported information" : "User-supplied, unverified information"}`,
        `Original listing URL: ${home.sourceUrl || "Not supplied"}`,
        `Buyer name: ${profile.name || "Guest buyer"}`,
        `Proposed purchase price: ${dollars(t.amount)}`,
        `Financing preference: ${t.financing}`,
        `Draft revision: ${draft.revision}`,
        `Missing answers: ${missingTerms(t).length}`,
        `No representation, agreement, or actual offer submission is established.`,
      ],
    },
    {
      id: "terms",
      title: "Proposed purchase terms worksheet",
      lines: [
        `Proposed price: ${dollars(t.amount)}`,
        `Financing: ${t.financing}`,
        `Down payment: ${t.downPercent === null ? "Not provided" : t.downPercent + "%"}`,
        `Earnest money: ${dollars(t.earnest)}`,
        `Desired closing date: ${value(t.closingDate)}`,
        `Inspection preferences: ${value(t.inspection)}`,
        `Financing contingency preferences: ${value(t.financingContingency)}`,
        `Appraisal considerations: ${value(t.appraisal)}`,
        `Requested seller contributions: ${dollars(t.concessions)}`,
        `Requested personal property: ${value(t.personalProperty)}`,
        `Other questions and terms: ${value(t.notes)}`,
      ],
    },
    {
      id: "finances",
      title: "Financing and affordability summary",
      lines: [
        `Illustrative purchase price used: ${dollars(t.amount ?? a.price)}`,
        `Loan term: ${a.years} years; illustrative rate: ${a.rate}%`,
        `Down payment used: ${t.financing === "Cash" ? 100 : (t.downPercent ?? a.downPercent)}%`,
        `Principal and interest: ${dollars(payment.pi)}/month`,
        `Property taxes: ${dollars(a.taxAnnual / 12)}/month`,
        `Insurance: ${dollars(a.insuranceAnnual / 12)}/month`,
        `HOA: ${dollars(a.hoa)}/month`,
        `Estimated PMI: ${dollars(payment.pmi)}/month at ${a.pmiRate}% annual assumption when applicable`,
        `Other monthly costs: ${dollars(a.otherMonthly)}`,
        `Estimated total: ${dollars(payment.total)}/month`,
        `Modeled cash to close: ${dollars(payment.cashToClose)} including ${a.closingPercent}% assumed closing costs. Earnest deposits, credits, prepaid items, the proposed representation fee, and exact lender/title adjustments are not resolved.`,
        `Budget comparison: ${profile.monthlyBudget ? dollars(profile.monthlyBudget) + "/month stated comfort budget" : "No comfort budget provided."}`,
        "This is not a loan approval, rate quote, or guaranteed cash requirement.",
      ],
    },
    {
      id: "questions",
      title: "Property due-diligence questions",
      lines: [
        ...home.concerns.map((c) => `Investigate: ${c}`),
        ...home.disclosures.map((d) => `Disclosure context: ${d}`),
        ...analyze(home, profile, a)
          .filter((o) => o.kind === "missing")
          .map((o) => o.text),
        "Ask for current seller disclosures, inspection findings, HOA reserves/rules/insurance where applicable, title information, and actual lender estimates.",
        "No verified comparable sales establish value unless explicitly supplied and professionally reviewed.",
      ],
    },
    {
      id: "timeline",
      title: "Proposed timeline",
      lines: [
        "1. Buyer confirms proposed terms and missing information.",
        "2. Buyer explicitly approves sharing this draft package in the local review simulation.",
        "3. Demo reviewer reads the snapshot and requests changes or marks simulated review complete.",
        "4. Buyer resolves open items with appropriately licensed professionals before any actual action.",
        `Desired closing target: ${value(t.closingDate)}`,
        "These are planning steps only. Contractual dates, contingencies, inspection rights, and closing obligations require approved agreements and professional review.",
      ],
    },
    {
      id: "checklist",
      title: "Agent review checklist",
      lines: [
        "Verify property identity, listing source, data rights, and current availability.",
        "Verify actual agent identity, licensing, brokerage affiliation, and representation arrangements before real service.",
        "Review buyer-confirmed price, financing, deposits, contributions, contingencies, and proposed dates.",
        "Obtain relevant verified comparable sales and property-condition information.",
        "Confirm lender limits, financial assumptions, and title/closing estimates.",
        "Use only authorized broker-approved forms for actual agreements and disclosures.",
        "Never treat this worksheet as an official Utah REPC, signature-ready contract, or submitted offer.",
        ...missingTerms(t).map((x) => `Outstanding buyer answer: ${x}`),
      ],
    },
  ];
}
