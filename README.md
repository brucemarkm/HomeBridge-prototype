# Homebridge — buyer beta

**Buy a home. Skip the complexity.** Homebridge connects a listing the buyer has already found to property-specific guidance, affordability, confirmed draft terms, downloadable preparation PDFs, and a simulated professional review.

Built on the existing Next.js / React / strict TypeScript project, preserving the Homebridge identity, bundled fonts, and architectural imagery. No production deployment is performed by this upgrade. Work is on `upgrade/property-advisor`, not `main`.

## See and try the upgrade

```sh
npm ci
npm run dev -- --port 3100
```

Open port **3100** in your development environment's browser/port viewer. A cloud-local address is not a public website link. All core guest features run **without environment variables, paid APIs, or a database**.

For a production-build rehearsal:

```sh
npm run build
npm start -- --port 3100
```

Use only one server on that port. Node.js 24 is recommended; Node 22 is supported. Keep credentials out of Git. The old `.cloud/preview.mjs` helper remains available for a background production preview on port 3000; rebuild before using it after source changes.

## A complete demo journey

1. On the homepage click **Try a demo purchase**. Choose one of four fictional homes: a Provo condo, Orem townhome, Springville starter house, or larger Lehi house.
2. Open **Ask Homebridge AI about this home**. On mobile this is a sticky button that opens the advisor sheet. Answer optional questions about a monthly comfort budget, first-home status, a yard, and preapproval.
3. Ask about concerns, affordability, price, or offer preparation. Each property has its own conversation and context. The response mode is always labeled. Without live configuration, answers are a **scripted property-aware demo**, not a language model.
4. Explore **Affordability** and change the down payment, rate, taxes, insurance, HOA, PMI, and closing-cost assumptions. The monthly breakdown and modeled cash requirement update immediately.
5. Open **Prepare an offer**. Confirm proposed terms one question at a time. Skip unknown answers and edit them later. The assistant cannot silently set terms.
6. Create the draft package. Preview its six original worksheets and download one or all as a real PDF.
7. Open **Agent review**. Inspect the shared categories and explicitly approve sharing before clicking **Request agent review**.
8. Choose **Simulate agent review**, enter the local reviewer simulation, comment, and request changes. Return to **My Purchase** to see the response and next action.
9. Edit terms, regenerate the package, and request a new review. Earlier review snapshots keep the original answers. Refresh to confirm persistence.

No signatures, real offers, brokerage relationships, tours, actual professional approvals, or external messages are created. Every document is prominently marked **DEMO DRAFT — NOT A VALID PURCHASE AGREEMENT — NOT FOR SUBMISSION**. These are not official Utah REPC forms.

## Import a listing

Use **Analyze a home** or the homepage link input. Paste an HTTPS Zillow, Redfin, Realtor.com, or other public website URL. The backend validates the URL and identifies the source. It **never fetches or scrapes the pasted page**.

If an authorized resolver is not configured or cannot resolve the link, enter known fields and optionally paste the listing description. Only the address is required. Missing details stay unknown. Preview/correct the record, save it, and open its advisor. The original listing link stays visible. User-supplied records, provider-reported facts, fictional demo data, assumptions, and unknowns are distinct.

## Main routes

| Route                                          | Purpose                                                                                   |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                                            | Clear product introduction, listing-link entry, interactive demo links                    |
| `/import`                                      | Source validation, manual/authorized import, confirmation                                 |
| `/homes`                                       | Four demo homes or an authorized live provider, filters, sorting, map                     |
| `/homes/[id]`                                  | Property details, analysis, advisor, preferences, affordability, offer, documents, review |
| `/my-homes`                                    | Saved/imported/recent homes, conversations, draft offers                                  |
| `/compare`                                     | Two or three homes with facts, payment assumptions, reasoned fit observations             |
| `/purchase`                                    | Active preparation, next action, documents, checklist, messages, milestones               |
| `/agent`                                       | Explicitly labeled reviewer simulation over shared snapshots                              |
| `/account`                                     | Honest guest/account states, optional sign-in/sync, backup, reset                         |
| `/pricing`                                     | Adjustable proposed flat-fee comparison with compensation caveats                         |
| `/how-it-works`, `/integrations`, `/resources` | Process, connection status, education                                                     |

Common original `/dashboard/*`, `/login`, and `/get-started` links redirect into the new workflow. Seller functionality and enterprise admin navigation are omitted from this buyer beta.

## What works without credentials

- Four rich fictional property scenarios with HOA/disclosure/maintenance context and explicit provenance.
- Browsing, ZIP/city/address search, price range, beds/baths, size/type filters, sorting, saving, comparing, and recent homes.
- Secure URL identification, manual entry with unknown fields, confirmation, original links, and description paste.
- Per-property scripted conversations, editable buyer discovery, opt-in cross-property preference memory, grounded structured observations.
- Interactive amortization, monthly cost breakdown, cash-to-close assumptions, and educational budget comparisons.
- Conversational draft preparation, explicit answer confirmations, autosave, editing, missing-answer tracking, regeneration, six-document previews and PDF downloads.
- Buyer-approved fixed review snapshots, reviewer comments/revision requests/completion/next steps, buyer messages, personal tasks, and refresh persistence.
- Guest mode, local backup/reset, and separate storage keys for signed-in accounts.

## Optional integrations: implemented paths, not claimed live connections

| Integration               | Implementation                                                                    | Required to operate                                                                          |
| ------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| OpenAI                    | Server SDK, structured output, grounded context, no write tools                   | `OPENAI_API_KEY`, authenticated Supabase session, quota migration, per-property consent      |
| Supabase                  | Real email/Google auth path, server session validation, owner-only workspace sync | Public URL/anon key, supplied SQL migration, callback URLs; Google provider setup for Google |
| Licensed listings         | RESO/OData search + normalization + field provenance + signed records             | Licensed data rights and the `LISTING_*` settings described in INTEGRATIONS.md               |
| Authorized URL resolution | Fixed trusted resolver endpoint; no arbitrary URL fetching                        | Licensed resolver compatible with the Home schema and relevant settings                      |
| Maps                      | MapLibre with OpenStreetMap raster tiles when Map view is selected                | Internet access to OSM tiles; accessible area-link fallback when tiles/WebGL fail            |
| Draft PDFs                | Server-side `pdf-lib`, embedded bundled fonts                                     | Nothing external                                                                             |
| Agent review              | Local simulation in the buyer's own workspace                                     | No real professional service is connected                                                    |

No API keys or licensed feed are available in this development environment. Consequently, live LLM responses, actual Supabase login/sync/RLS execution, and live listing access cannot be claimed as tested. Presence of configuration is labeled **configured**, not verified. See [INTEGRATIONS.md](INTEGRATIONS.md) for exact setup and operational limits.

## Persistence and privacy

Guest work uses `homebridge-workspace-v2` in the current browser and origin. Different devices and preview domains have different storage. Original v1 data is left untouched; compatible manually entered homes, the name, and fee can migrate into a fresh v2 guest workspace. Original seeded transactions/conversations are not rewritten into fabricated new workflows.

When configured, a real account uses a separate local key. Account sync is explicit: save the current account copy, load its private cloud copy, or consciously copy guest work into the account. Authenticated server operations derive ownership from the verified session, never a caller-supplied user ID. PostgreSQL RLS rejects other users. Do not upload real financial documents into the prototype.

Review sharing is also explicit. A request stores a fixed property/profile/terms/assumptions/analysis snapshot. Changing current answers does not alter what was already shared. Changes to calculator/profile context invalidate document revisions without changing proposed purchase terms.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Playwright defaults to a development server on **3100**. To test another running server, set `HB_TEST_BASE_URL`, for example `HB_TEST_BASE_URL=http://127.0.0.1:3100 npm run test:e2e`. System Chromium is used if present; otherwise run `npx playwright install chromium`. Linux CI uses `npx playwright install --with-deps chromium`.

Tests cover the mobile buyer journey through an actual downloaded PDF and simulated review, draft editing/snapshots, URL errors and fallback, comparison, guest access restrictions, model behavior without credentials, provenance signatures, storage isolation, and known financial values. External services require separate integration validation.

## Preview deployment — keep production unchanged

The existing Vercel site follows `main`. Do **not** merge this branch or run a production deployment without approval.

1. Push `upgrade/property-advisor` to the same repository, leaving `main` untouched.
2. With the existing Vercel Git integration enabled, that branch should receive a **Preview** deployment. In Vercel, open HomeBridge-prototype → Deployments and select this branch. Branch preview behavior and URL availability must be confirmed in the account.
3. Keep preview variables empty to test the entire guest demo. Optional integration credentials belong in the **Preview** environment and should point to separate test projects/data.
4. Open the Vercel-generated preview URL and follow the demo journey above. A generated URL is not assumed or invented by this repository.
5. After review and explicit approval, merging to the production branch can update the public website.

You can keep giving Codex plain-language change requests. To edit defaults directly: brand/fee `lib/config.ts`, property scenarios `lib/homebridge/demo.ts`, screen components `components/beta/`, styling `app/beta.css`, provider settings `.env.example`. Default fee changes affect a new/reset workspace; an existing workspace keeps its local value.

## Next steps and limits

Connect a licensed source and a separate test Supabase/OpenAI project; verify multi-user RLS and provider-specific attribution/filters before using real data. Broker-reviewed forms, verified professional identities/assignments, private production documents, e-signatures, real delivery, audited approvals, normalized database entities, production observability, and scalable map infrastructure remain future work. No actual seller services are implemented.

See ARCHITECTURE.md, INTEGRATIONS.md, BUSINESS_ASSUMPTIONS.md, PRODUCT_ROADMAP.md, and VALIDATION.md.
