import { business } from "../config";
import { Home, Workspace, profileSchema } from "./schema";
const common = {
  source: "demo" as const,
  imageKind: "illustration" as const,
  comparables: [],
  provenance: Object.fromEntries(
    [
      "address",
      "price",
      "beds",
      "baths",
      "sqft",
      "year",
      "hoa",
      "taxAnnual",
      "description",
      "features",
      "concerns",
      "disclosures",
      "history",
    ].map((k) => [k, "fictional" as const]),
  ),
};
export const demoHomes: Home[] = [
  {
    ...common,
    id: "demo-provo",
    address: "128 Juniper Court, Unit 204",
    city: "Provo",
    zip: "84604",
    price: 329000,
    beds: 2,
    baths: 2,
    sqft: 1240,
    type: "Condo",
    year: 2006,
    hoa: 285,
    taxAnnual: 1980,
    image: "/images/home-1.png",
    latitude: 40.25,
    longitude: -111.66,
    description:
      "A fictional second-floor condo with an open living area, a covered balcony, and one assigned covered parking space. No private yard. The sample HOA includes exterior maintenance and snow removal; exact coverage would need verification.",
    features: [
      "Covered balcony",
      "Assigned covered parking",
      "Second-floor access",
      "Exterior maintenance in sample HOA",
    ],
    concerns: [
      "Sample HOA minutes mention a roof reserve review; no special assessment has been approved in this fictional scenario.",
      "Water heater is described as approximately 12 years old.",
      "No private yard; elevator availability is not documented.",
    ],
    disclosures: [
      "Fictional disclosure: prior bathroom supply-line leak repaired in 2022; no inspection or receipts supplied.",
      "HOA reserve study and insurance coverage are not provided.",
    ],
    sellerScenario:
      "Fictional seller is relocating. Timing and willingness to negotiate are unknown; this is not evidence of leverage.",
    history: [
      {
        date: "2026-09-01",
        price: 339000,
        note: "Fictional initial asking price",
      },
      { date: "2026-10-15", price: 329000, note: "Fictional price change" },
    ],
  },
  {
    ...common,
    id: "demo-orem",
    address: "246 Meadowlark Row",
    city: "Orem",
    zip: "84058",
    price: 439000,
    beds: 3,
    baths: 2.5,
    sqft: 1780,
    type: "Townhome",
    year: 2017,
    hoa: 165,
    taxAnnual: 2350,
    image: "/images/home-1.png",
    latitude: 40.29,
    longitude: -111.69,
    description:
      "A fictional three-bedroom townhome with a two-car garage, an upstairs laundry area, and a small fenced patio. A sample community rule limits changes to exterior landscaping. Rental rules are not supplied.",
    features: [
      "Two-car garage",
      "Fenced patio",
      "Upstairs laundry",
      "Three bedrooms",
    ],
    concerns: [
      "Sample HVAC service note recommends inspection of an intermittent cooling issue.",
      "HOA rental restrictions and reserve balances are not provided.",
      "A patio is available, but it is not a full private yard.",
    ],
    disclosures: [
      "Fictional disclosure: cooling system serviced in 2025; repair scope is not documented.",
      "No structural inspection has been supplied.",
    ],
    sellerScenario:
      "Fictional seller prefers a flexible closing timeline. No competing offers are known.",
    history: [
      {
        date: "2026-10-02",
        price: 439000,
        note: "Fictional initial asking price",
      },
    ],
  },
  {
    ...common,
    id: "demo-springville",
    address: "372 Aspen Hollow Lane",
    city: "Springville",
    zip: "84663",
    price: 489000,
    beds: 3,
    baths: 2,
    sqft: 1940,
    type: "Single family",
    year: 1998,
    hoa: 0,
    taxAnnual: 2620,
    image: "/images/home-2.png",
    latitude: 40.17,
    longitude: -111.6,
    description:
      "A fictional starter house with a fenced backyard, a two-car garage, and a finished lower-level flex room. Roof age and replacement history are not documented. The sample seller disclosure notes seasonal moisture near a basement window.",
    features: [
      "Fenced backyard",
      "Two-car garage",
      "Flex room",
      "No HOA in fictional listing",
    ],
    concerns: [
      "Seasonal moisture near a basement window is noted in the fictional disclosure.",
      "Roof age is unknown.",
      "Older construction warrants professional review of major systems.",
    ],
    disclosures: [
      "Fictional disclosure: moisture observed after heavy rain near one lower-level window. Cause and repair status are unknown.",
      "No radon test, roof report, or foundation inspection supplied.",
    ],
    sellerScenario:
      "Fictional seller has not disclosed a required moving date or willingness to make repairs.",
    history: [
      {
        date: "2026-09-10",
        price: 505000,
        note: "Fictional initial asking price",
      },
      { date: "2026-10-20", price: 489000, note: "Fictional price adjustment" },
    ],
  },
  {
    ...common,
    id: "demo-lehi",
    address: "684 Sagewood Crossing",
    city: "Lehi",
    zip: "84043",
    price: 729000,
    beds: 5,
    baths: 3.5,
    sqft: 3260,
    type: "Single family",
    year: 2020,
    hoa: 85,
    taxAnnual: 3860,
    image: "/images/home-0.png",
    latitude: 40.39,
    longitude: -111.84,
    description:
      "A fictional larger family home with an office, an open kitchen/living area, a fenced yard, and a three-car garage. The basement includes unfinished storage. The sample landscaping plan includes a drainage swale that should be reviewed.",
    features: [
      "Fenced yard",
      "Dedicated office",
      "Three-car garage",
      "Five bedrooms",
    ],
    concerns: [
      "Sample landscaping plan shows a drainage swale; maintenance responsibilities are unknown.",
      "HOA rules and transfer fees are not supplied.",
      "Higher purchase price increases upfront and ongoing costs.",
    ],
    disclosures: [
      "Fictional disclosure: builder warranty paperwork exists in the scenario but is not provided.",
      "No appraisal or recent comparable sales supplied.",
    ],
    sellerScenario:
      "Fictional seller has a target closing window of 45–60 days. This does not establish negotiation leverage.",
    history: [
      {
        date: "2026-10-08",
        price: 729000,
        note: "Fictional initial asking price",
      },
    ],
  },
];
export const emptyProfile = () => profileSchema.parse({});
export function freshWorkspace(): Workspace {
  return {
    version: 2,
    aiConsent: [],
    profile: emptyProfile(),
    homes: [],
    saved: [],
    recent: [],
    compare: [],
    conversations: {},
    propertyProfiles: {},
    assumptions: {},
    offers: {},
    reviews: [],
    activeHome: "demo-provo",
    completedTasks: [],
    role: "buyer",
    fee: business.flatFee,
    messages: [],
  };
}
export const sourceLabel = (p: Home) =>
  p.source === "demo"
    ? "Demo property — fictional"
    : p.source === "licensed"
      ? "Licensed provider data"
      : "User-supplied — unverified";
