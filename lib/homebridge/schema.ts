import { z } from "zod";
import { publicHttpsUrl } from "./import";
const number = z.number().finite().nonnegative();
export const propertySchema = z.object({
  id: z.string().min(1).max(150),
  address: z.string().min(1).max(200),
  city: z.string().max(100),
  zip: z.string().max(15).default(""),
  price: number.nullable(),
  beds: number.max(100).nullable(),
  baths: number.max(100).nullable(),
  sqft: number.nullable(),
  type: z.string().max(80),
  year: number.max(2200).nullable(),
  hoa: number.nullable(),
  taxAnnual: number.nullable(),
  description: z.string().max(8000),
  features: z.array(z.string().max(200)).max(30),
  concerns: z.array(z.string().max(500)).max(20),
  disclosures: z.array(z.string().max(1000)).max(20),
  sellerScenario: z.string().max(1000).optional(),
  history: z
    .array(z.object({ date: z.string(), price: number, note: z.string() }))
    .max(20),
  source: z.enum(["demo", "user", "licensed"]),
  sourceUrl: z
    .string()
    .max(2048)
    .refine((value) => {
      try {
        publicHttpsUrl(value);
        return true;
      } catch {
        return false;
      }
    }, "A public HTTPS source URL is required.")
    .optional(),
  provider: z.string().max(150).optional(),
  attribution: z.string().max(500).optional(),
  updatedAt: z.string().optional(),
  image: z.string().max(2048),
  imageKind: z.enum(["illustration", "provider"]),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  attestation: z.string().max(200).optional(),
  provenance: z.record(
    z.string(),
    z.enum(["fictional", "user-supplied", "provider-reported", "unknown"]),
  ),
  comparables: z
    .array(
      z.object({
        address: z.string(),
        price: number,
        sqft: number,
        soldDate: z.string(),
        source: z.string(),
      }),
    )
    .max(10)
    .default([]),
});
export type Home = z.infer<typeof propertySchema>;
export const profileSchema = z.object({
  name: z.string().max(60).default(""),
  monthlyBudget: number.max(100000).nullable().default(null),
  firstHome: z.enum(["Yes", "No", "Not shared"]).default("Not shared"),
  yard: z
    .enum(["Important", "Nice to have", "Not needed", "Not shared"])
    .default("Not shared"),
  stay: z.enum(["Under 5 years", "5+ years", "Not sure"]).default("Not sure"),
  preapproved: z
    .enum(["Yes", "No", "In progress", "Not shared"])
    .default("Not shared"),
  locations: z.string().max(200).default(""),
  minBeds: number.max(20).nullable().default(null),
  remember: z.boolean().default(false),
});
export type BuyerProfile = z.infer<typeof profileSchema>;
export const assumptionsSchema = z.object({
  price: number.max(100000000).default(500000),
  downPercent: number.max(100).default(10),
  rate: number.max(30).default(6.5),
  years: z.number().int().min(1).max(40).default(30),
  taxAnnual: number.max(1000000).default(2400),
  insuranceAnnual: number.max(100000).default(1200),
  hoa: number.max(100000).default(0),
  pmiRate: number.max(5).default(0.5),
  otherMonthly: number.max(100000).default(0),
  closingPercent: number.max(15).default(3),
});
export type Assumptions = z.infer<typeof assumptionsSchema>;
export const termsSchema = z.object({
  amount: number.max(100000000).nullable().default(null),
  financing: z
    .enum(["Conventional", "FHA", "VA", "Cash", "Not decided"])
    .default("Not decided"),
  downPercent: number.max(100).nullable().default(null),
  earnest: number.max(100000000).nullable().default(null),
  closingDate: z.string().max(30).default(""),
  inspection: z.string().max(1000).default(""),
  financingContingency: z.string().max(1000).default(""),
  appraisal: z.string().max(1000).default(""),
  concessions: number.max(10000000).nullable().default(null),
  personalProperty: z.string().max(1000).default(""),
  notes: z.string().max(2000).default(""),
});
export type OfferTerms = z.infer<typeof termsSchema>;
export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1).max(6000),
  mode: z.enum(["demo", "live"]).optional(),
});
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export const assistantRequestSchema = z.object({
  property: propertySchema,
  profile: profileSchema,
  assumptions: assumptionsSchema,
  messages: z.array(chatMessageSchema).min(1).max(16),
  useLive: z.boolean().default(false),
});
export const assistantResponseSchema = z.object({
  answer: z.string().min(1).max(6000),
  followUp: z.string().max(500),
  focus: z.enum([
    "fit",
    "affordability",
    "concerns",
    "value",
    "questions",
    "offer",
    "general",
  ]),
});
export type AssistantResult = z.infer<typeof assistantResponseSchema> & {
  mode: "demo" | "live";
  notice?: string;
};
export const offerSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  terms: termsSchema,
  revision: z.number().int().min(1),
  step: z.number().int().min(0).max(11),
  generatedRevision: z.number().nullable(),
  editing: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OfferDraft = z.infer<typeof offerSchema>;
export const reviewSchema = z.object({
  property: propertySchema,
  id: z.string(),
  propertyId: z.string(),
  offerId: z.string(),
  revision: z.number(),
  status: z.enum([
    "requested",
    "reviewing",
    "changes_requested",
    "review_complete",
    "next_steps",
  ]),
  sharedAt: z.string(),
  terms: termsSchema,
  profile: profileSchema,
  assumptions: assumptionsSchema,
  analysis: z.array(z.string()),
  comments: z.array(
    z.object({
      id: z.string(),
      author: z.enum(["Buyer", "Demo reviewer"]),
      text: z.string().max(2000),
      time: z.string(),
    }),
  ),
  history: z.array(z.object({ status: z.string(), time: z.string() })),
  sharedSections: z.array(z.string()),
});
export type ReviewRequest = z.infer<typeof reviewSchema>;
export const workspaceSchema = z.object({
  version: z.literal(2),
  aiConsent: z.array(z.string()).default([]),
  profile: profileSchema,
  homes: z.array(propertySchema).max(100),
  saved: z.array(z.string()).max(100),
  recent: z.array(z.string()).max(30),
  compare: z.array(z.string()).max(3),
  conversations: z.record(z.string(), z.array(chatMessageSchema).max(200)),
  propertyProfiles: z.record(z.string(), profileSchema),
  assumptions: z.record(z.string(), assumptionsSchema),
  offers: z.record(z.string(), offerSchema),
  reviews: z.array(reviewSchema).max(100),
  activeHome: z.string(),
  completedTasks: z.array(z.string()).max(100),
  role: z.enum(["buyer", "demo-agent"]),
  fee: number.max(100000),
  messages: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().max(2000),
        sender: z.string(),
        time: z.string(),
      }),
    )
    .max(200),
});
export type Workspace = z.infer<typeof workspaceSchema>;
