import {
  Home,
  BuyerProfile,
  Assumptions,
  AssistantResult,
  OfferTerms,
} from "./schema";
import { calculatePayment, dollars } from "./finance";
export type Observation = {
  kind: "positive" | "concern" | "missing";
  title: string;
  text: string;
  evidence: string;
};
export function analyze(
  home: Home,
  profile: BuyerProfile,
  a: Assumptions,
): Observation[] {
  const m = calculatePayment(a);
  const data =
    home.source === "demo"
      ? "Fictional listing"
      : home.source === "licensed"
        ? "Provider-reported listing"
        : "User-supplied listing";
  const out: Observation[] = [];
  if (home.features.length)
    out.push({
      kind: "positive",
      title: "Supplied features",
      text:
        home.features.slice(0, 3).join("; ") +
        ". Confirm condition and suitability independently.",
      evidence: `${data}: features`,
    });
  if (home.beds !== null && profile.minBeds !== null)
    out.push({
      kind: home.beds >= profile.minBeds ? "positive" : "concern",
      title: "Bedroom fit",
      text: `${home.beds} bedrooms compared with your preference for at least ${profile.minBeds}.`,
      evidence: `${data}: bedrooms; your confirmed preference`,
    });
  if (profile.yard === "Important")
    out.push({
      kind: home.features.some((f) => /fenced (yard|backyard)/i.test(f))
        ? "positive"
        : "concern",
      title: "Your yard priority",
      text: home.features.some((f) => /fenced (yard|backyard)/i.test(f))
        ? "The supplied features describe a fenced yard. Verify its boundaries and condition."
        : "A full private yard is not documented. Confirm whether the outdoor space meets your needs.",
      evidence: `${data}: features; your yard preference`,
    });
  if (profile.monthlyBudget)
    out.push({
      kind: m.total <= profile.monthlyBudget ? "positive" : "concern",
      title: "Monthly budget comparison",
      text: `The modeled ${dollars(m.total)}/month is ${m.total <= profile.monthlyBudget ? "within" : "above"} your stated ${dollars(profile.monthlyBudget)} monthly comfort budget. This is not a lending decision.`,
      evidence: "Calculator assumptions and your stated comfort budget",
    });
  out.push({
    kind: "concern",
    title: "Known items to investigate",
    text:
      home.concerns[0] ||
      "Condition, repair history, and disclosures have not been independently verified.",
    evidence: home.concerns.length
      ? `${data}: stated concern`
      : "Missing verified condition information",
  });
  out.push({
    kind: "missing",
    title: "Market value needs evidence",
    text: home.comparables.length
      ? "Provider-supplied comparable records are available below; relevance and condition adjustments still require professional review."
      : "No verified comparable sales are available. Asking price and price per square foot do not establish fair market value.",
    evidence: home.comparables.length
      ? "Supplied comparable records"
      : "No comparable sales supplied",
  });
  out.push({
    kind: "missing",
    title: "Before you decide",
    text: "Obtain current disclosures, HOA documents where applicable, insurance estimates, and professional inspection guidance.",
    evidence: "Documents not verified in this prototype",
  });
  return out;
}
export function demoResponse(
  question: string,
  home: Home,
  profile: BuyerProfile,
  a: Assumptions,
): AssistantResult {
  const q = question.toLowerCase(),
    m = calculatePayment(a);
  let focus: AssistantResult["focus"] = "general",
    answer = "";
  let followUp = "What is your comfortable monthly housing budget?";
  if (profile.monthlyBudget)
    followUp =
      profile.firstHome === "Not shared"
        ? "Is this your first home?"
        : profile.yard === "Not shared"
          ? "How important is a private yard to you?"
          : profile.preapproved === "Not shared"
            ? "Are you already preapproved for a mortgage?"
            : "Would you like to review concerns or prepare proposed offer terms?";
  if (/afford|month|payment|budget|down payment/.test(q)) {
    focus = "affordability";
    answer = `For ${home.address}, your selected ${a.downPercent}% down and ${a.rate}% illustrative rate over ${a.years} years produce ${dollars(m.pi)} principal and interest, ${dollars(a.taxAnnual / 12)} taxes, ${dollars(a.insuranceAnnual / 12)} insurance, ${dollars(a.hoa)} HOA, ${dollars(m.pmi)} estimated PMI, and ${dollars(a.otherMonthly)} other costs per month. Total: ${dollars(m.total)}. Modeled cash to close is ${dollars(m.cashToClose)} before credits, deposits, and actual lender/title adjustments. ${profile.monthlyBudget ? `Your comfort budget is ${dollars(profile.monthlyBudget)}; the modeled payment is ${m.total <= profile.monthlyBudget ? "within" : "above"} it.` : "I do not yet know your comfort budget."} These estimates do not establish loan eligibility.`;
  } else if (/concern|risk|inspect|disclos|worr/.test(q)) {
    focus = "concerns";
    answer = `Items to investigate for ${home.address}:\n${home.concerns.length ? home.concerns.map((x, i) => `${i + 1}. ${x}`).join("\n") : "Property condition and disclosures have not been supplied."}\n${home.disclosures.join("\n")}\n${home.source === "demo" ? "These are fictional scenario details." : "These supplied details have not been independently verified."} Ask an inspector and your licensed professional what evidence and follow-up are needed.`;
  } else if (/price|value|reasonable|compar/.test(q)) {
    focus = "value";
    answer = `${home.address} has a supplied asking price of ${dollars(home.price)}${home.price && home.sqft ? `, or approximately ${dollars(home.price / home.sqft)} per square foot` : ""}. ${home.comparables.length ? "Comparable records supplied by the provider can support a professional discussion, but differences in condition and terms matter." : "There are no verified comparable sales in this workspace, so I cannot determine whether the asking price is reasonable."} ${home.history.length ? "The displayed asking-price history is " + (home.source === "demo" ? "fictional demo history" : "supplied history") + ", not closed-sale evidence." : ""} A licensed professional should review market context before an offer.`;
  } else if (/offer|earnest|contingen|closing|appraisal/.test(q)) {
    focus = "offer";
    answer = `We can prepare a nonbinding discussion package for ${home.address}. Start with your proposed price and financing, then work through down payment, earnest money, timing, inspections, financing and appraisal preferences, and requested contributions. Earnest money is a proposed deposit; actual handling and refund rights depend on an approved agreement. Contingencies are conditions to discuss with your licensed professional. I will not select or change terms automatically. Use “Prepare an offer” and explicitly confirm each answer. Nothing is submitted to a seller.`;
  } else if (/ask|question/.test(q)) {
    focus = "questions";
    answer = `Before deciding on ${home.address}, ask:\n• What documentation addresses ${home.concerns[0] || "condition and repair history"}?\n• Can I review current disclosures and any HOA reserves, rules, insurance, and assessment notices?\n• What are the actual lender/title estimates and inspection deadlines?\n• Which verified comparable sales are relevant, and why?\nSeller motivations and competing offers are not known unless explicitly documented.`;
  } else {
    focus = "fit";
    answer = `Here is a practical starting point for ${home.address}: ${home.beds ?? "Unknown"} bedrooms, ${home.baths ?? "unknown"} bathrooms, ${home.sqft?.toLocaleString() ?? "unknown"} square feet, and ${home.hoa === null ? "unknown HOA fees" : dollars(home.hoa) + "/month HOA"}. ${home.features.slice(0, 3).join("; ")}. ${analyze(
      home,
      profile,
      a,
    )
      .filter((o) => o.title !== "Before you decide")
      .slice(0, 3)
      .map((o) => o.text)
      .join(
        " ",
      )} I can discuss observable features and your priorities; I do not infer neighborhood demographics or make protected-class recommendations.`;
  }
  return { mode: "demo", answer, followUp, focus };
}
export const offerQuestions: {
  key: keyof OfferTerms;
  title: string;
  help: string;
  kind: "money" | "percent" | "date" | "select" | "text";
  options?: string[];
}[] = [
  {
    key: "amount",
    title: "What purchase price would you like to propose?",
    help: "This is your starting point for professional review, not a recommended market value.",
    kind: "money",
  },
  {
    key: "financing",
    title: "How do you plan to finance the purchase?",
    help: "Choose what you know now. Your lender will need to confirm eligibility.",
    kind: "select",
    options: ["Not decided", "Conventional", "FHA", "VA", "Cash"],
  },
  {
    key: "downPercent",
    title: "What down payment percentage are you considering?",
    help: "This is separate from closing costs and earnest money.",
    kind: "percent",
  },
  {
    key: "earnest",
    title: "How much earnest money would you like to propose?",
    help: "Earnest money is a deposit. Handling, deadlines, and refund rights depend on the approved agreement. No money moves here.",
    kind: "money",
  },
  {
    key: "closingDate",
    title: "When would you like to close?",
    help: "Choose a target date to discuss, not a contractual commitment.",
    kind: "date",
  },
  {
    key: "inspection",
    title: "What inspection protections do you want to discuss?",
    help: "Describe your preferences. A professional must explain actual rights and deadlines.",
    kind: "text",
  },
  {
    key: "financingContingency",
    title: "What financing contingency would you like to discuss?",
    help: "A financing condition may protect a buyer if financing is not obtained under agreed terms. Ask for professional advice before waiving protections.",
    kind: "text",
  },
  {
    key: "appraisal",
    title: "What should your agent know about appraisal concerns?",
    help: "An appraisal may differ from the price. Do not assume a gap is affordable or that a lender will approve it.",
    kind: "text",
  },
  {
    key: "concessions",
    title: "Any seller contribution you would like to request?",
    help: "A request is not an entitlement. Agreement and lender limits apply; zero is a valid answer.",
    kind: "money",
  },
  {
    key: "personalProperty",
    title: "Any items you would like included?",
    help: "For example, specific appliances. Ownership and inclusion must be confirmed.",
    kind: "text",
  },
  {
    key: "notes",
    title: "What else should a professional review?",
    help: "Share remaining questions, preferred timing, and missing information. Avoid sensitive personal data.",
    kind: "text",
  },
];
export function missingTerms(t: OfferTerms) {
  return offerQuestions
    .filter(
      (q) => t[q.key] === null || t[q.key] === "" || t[q.key] === "Not decided",
    )
    .map((q) => q.title);
}
