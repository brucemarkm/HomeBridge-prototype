import { business } from "./config";
export type Property = {
  id: string;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  year: number;
  garage: number;
  lot: number;
  image: string;
  description: string;
  features: string[];
  status: string;
  lat: number;
  lng: number;
  url?: string;
};
export const cities = [
  "Provo",
  "Orem",
  "Springville",
  "Spanish Fork",
  "American Fork",
  "Lehi",
  "Pleasant Grove",
];
export const photo = (n: number) => `/images/home-${n % 3}.png`;
export const properties: Property[] = Array.from({ length: 28 }, (_, i) => ({
  id: `home-${i + 1}`,
  address: `${128 + i * 37} ${["Juniper Lane", "Meadowlark Way", "Aspen Grove", "Willow Bend", "Canyon View Drive", "Sagewood Court", "Orchard Lane"][i % 7]}`,
  city: cities[i % 7],
  price:
    [485000, 529000, 419000, 465000, 615000, 749000, 559000][i % 7] +
    Math.floor(i / 7) * 17000,
  beds: 3 + (i % 3),
  baths: 2 + (i % 3) * 0.5,
  sqft: 1840 + i * 63,
  type: i % 5 === 2 ? "Townhome" : i % 9 === 0 ? "Condo" : "Single family",
  year: 1998 + i,
  garage: i % 3,
  lot: 0.08 + (i % 6) * 0.04,
  image: photo(i),
  description:
    "A little more room to live. This fictional Utah County home pairs welcoming, light-filled spaces with thoughtful everyday details. Imagine slow weekend mornings, room to gather, and the mountains just beyond your doorstep.",
  features: [
    "Open living spaces",
    "Mountain outlook",
    "Private outdoor space",
    "Dedicated laundry",
  ],
  status: i % 6 === 0 ? "New this week" : "Available",
  lat: 40.23 + (i % 7) * 0.025,
  lng: -111.66 - (i % 4) * 0.025,
}));
export const stages = [
  "Getting Started",
  "Property Selected",
  "Agent Consultation",
  "Offer Preparation",
  "Offer Submitted",
  "Under Contract",
  "Due Diligence",
  "Financing and Appraisal",
  "Final Walkthrough",
  "Closing",
  "Completed",
];
export type Transaction = {
  id: string;
  propertyId: string;
  buyer: string;
  stage: number;
  tasks: string[];
  offer: number;
  earnest: number;
  financing: string;
  closing: string;
  notes: string;
  agent: string;
};
export type Message = {
  id: string;
  sender: string;
  text: string;
  time: string;
};
export type Doc = {
  id: string;
  name: string;
  category: string;
  status: string;
  content: string;
};
export type State = {
  version: 1;
  activePurchaseId: string;
  role: "buyer" | "agent" | "admin" | null;
  name: string;
  saved: string[];
  compare: string[];
  imported: Property[];
  transactions: Transaction[];
  messages: Message[];
  docs: Doc[];
  activity: string[];
  fee: number;
  preferences: Record<string, string>;
  notifications: boolean;
  chat: { role: string; text: string }[];
};
export function initialState(): State {
  return {
    version: 1,
    activePurchaseId: "purchase-1",
    role: null,
    name: "Alex",
    saved: ["home-1", "home-2", "home-5"],
    compare: [],
    imported: [],
    transactions: [
      {
        id: "purchase-1",
        propertyId: "home-1",
        buyer: "Alex Morgan",
        stage: 6,
        tasks: ["Share preapproval"],
        offer: 480000,
        earnest: 5000,
        financing: "Conventional",
        closing: "2026-12-18",
        notes: "Ask about inspection timing.",
        agent: "Jordan Ellis",
      },
      {
        id: "purchase-2",
        propertyId: "home-4",
        buyer: "Taylor Reed",
        stage: 3,
        tasks: [],
        offer: 460000,
        earnest: 4000,
        financing: "FHA",
        closing: "2027-01-08",
        notes: "",
        agent: "Jordan Ellis",
      },
      {
        id: "purchase-3",
        propertyId: "home-6",
        buyer: "Sam Parker",
        stage: 8,
        tasks: [],
        offer: 740000,
        earnest: 8000,
        financing: "Conventional",
        closing: "2026-12-04",
        notes: "",
        agent: "Casey Brooks",
      },
    ],
    messages: [
      {
        id: "m1",
        sender: "Jordan Ellis · Demo agent",
        text: "Hi Alex! Your sample inspection checklist is ready. Take a look and send me any questions before our consultation.",
        time: "9:41 AM",
      },
    ],
    docs: [
      {
        id: "d1",
        name: "Buyer representation overview.txt",
        category: "Representation agreement",
        status: "Under Review",
        content:
          "FICTIONAL DEMONSTRATION DOCUMENT — NOT A CONTRACT\nThis sample explains the proposed scope of buyer support. The illustrative fee is $2,995. No representation is established. A licensed professional must review any real agreement.",
      },
      {
        id: "d2",
        name: "Inspection planning checklist.txt",
        category: "Inspection documents",
        status: "Approved",
        content:
          "FICTIONAL DEMO CHECKLIST\nDiscuss inspection scope and deadlines with your licensed professional. Ask about roof, foundation, plumbing, electrical, and recommended specialist reviews. No property condition has been verified.",
      },
    ],
    activity: [
      "Demo workspace created",
      "Jordan shared an inspection checklist",
    ],
    fee: business.flatFee,
    preferences: {
      location: "Provo",
      budget: "550000",
      beds: "3",
      baths: "2",
      timeline: "3–6 months",
      type: "Single family",
      financing: "Exploring options",
      agent: "No",
      found: "No",
    },
    notifications: true,
    chat: [],
  };
}
export const money = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(v);
export function mortgage(
  price: number,
  down: number,
  rate: number,
  years: number,
  tax: number,
  insurance: number,
  hoa: number,
) {
  const principal = price * (1 - down / 100),
    r = rate / 1200,
    n = years * 12;
  const pi =
    r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
  const pmi = down < 20 ? (principal * 0.005) / 12 : 0;
  return {
    pi,
    pmi,
    total: pi + tax / 12 + insurance / 12 + hoa + pmi,
    interest: pi * n - principal,
    principal,
    down: (price * down) / 100,
  };
}
export function parseSearch(q: string) {
  const lower = q.toLowerCase();
  const city = cities.find((c) => lower.includes(c.toLowerCase())) || "";
  const budget = lower.match(
    /(?:under|max|below|budget)\s*\$?([\d,]+)\s*(k|m)?/,
  );
  const beds = lower.match(/(\d+)\s*[- ]?(?:bed|br)/);
  return {
    city,
    max: budget
      ? Number(budget[1].replaceAll(",", "")) *
        (budget[2] === "k" ? 1000 : budget[2] === "m" ? 1000000 : 1)
      : 0,
    beds: beds ? Number(beds[1]) : 0,
  };
}
export function demoAnswer(q: string, homes: Property[], tx?: Transaction) {
  const l = q.toLowerCase();
  if (/earnest/.test(l))
    return "Earnest money is a deposit that shows your intent to buy. How it is held, applied, or refunded depends on the signed agreement and its deadlines. Ask your licensed agent to review the terms before sending any money. No money moves in this demo.";
  if (/closing cost/.test(l))
    return "Closing costs can include lender charges, title services, prepaid taxes, and insurance. They are separate from your down payment and vary by loan and transaction. Use your lender’s Loan Estimate for actual figures; all amounts here are illustrative.";
  if (/next|transaction|purchase/.test(l) && tx)
    return `Your demo purchase is at “${stages[tx.stage]}”. Next: ${stages[Math.min(tx.stage + 1, 10)]}. Review your checklist and ask your demo agent about deadlines. Only the agent demo workspace can confirm milestone changes.`;
  if (/compare/.test(l))
    return (
      homes
        .slice(0, 3)
        .map(
          (p) =>
            `${p.address}, ${p.city}: ${money(p.price)}, ${p.beds} beds, ${p.sqft.toLocaleString()} sq ft (${money(p.price / p.sqft)}/sq ft).`,
        )
        .join("\n") +
      "\nThese fictional examples do not establish market value. Compare HOA costs, condition, commute, and financing with your professional."
    );
  if (/preapprov/.test(l))
    return "Preapproval is a lender’s preliminary review of your finances. It can help clarify a shopping range, but it is not a final loan commitment. Ask about loan terms, required documents, and what could change before closing.";
  if (/contingen|due diligence|inspection/.test(l))
    return "Contingencies are conditions in an agreement, such as financing or inspection review. Due diligence is time to investigate the property under the contract’s terms. Deadlines and cancellation rights depend on the actual agreement. Have your licensed professional explain them.";
  if (/offer/.test(l))
    return "To prepare for an offer discussion, gather your proposed price, financing type, down payment, earnest money, closing timeline, contingencies, and requested concessions. Save these in My Purchase for agent review. This demo does not prepare or submit a binding offer.";
  const s = parseSearch(q);
  const matches = homes.filter(
    (p) =>
      (!s.city || p.city === s.city) &&
      (!s.max || p.price <= s.max) &&
      p.beds >= s.beds,
  );
  if (s.city || s.max || s.beds)
    return matches.length
      ? `I found ${matches.length} fictional homes matching those criteria. Start with ${matches
          .slice(0, 3)
          .map((p) => `${p.address} in ${p.city} (${money(p.price)})`)
          .join(
            "; ",
          )}. Use Explore Homes to filter and compare them. Location and pricing are simulated.`
      : "No fictional homes match all those criteria. Try a higher budget or a nearby city in Explore Homes.";
  return "I can help you explore our fictional Utah County homes, compare saved properties, explain earnest money and closing costs, or understand your next purchase step. Try “3 bedrooms in Provo under $550,000.” This is a local, scripted demo guide—not a live AI service or licensed professional.";
}
