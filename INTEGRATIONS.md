# Optional integration setup

The full guest workflow works with no keys. Never paste secret values into chat or commit `.env.local`. Vercel Preview and Production environments are separate; use test services for this upgrade's preview and do not modify production data.

## Supabase authentication and private sync

1. Create a separate Supabase test project.
2. Apply `supabase/migrations/202611100001_buyer_workspace.sql` once using its SQL editor or your migration tooling. The migration creates `buyer_workspaces`, `buyer_profiles`, owner-only RLS policies, and durable AI quota tables/function. It does not seed real users, agents, or documents.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the local or Preview environment. The anon/public key is intentionally browser-visible; authorization comes from verified sessions and RLS. **Do not supply a service-role key.**
4. In Supabase Auth URL settings, allow your exact local callback (`http://localhost:3100/auth/callback` when browsing localhost) and each permitted preview callback. Use the actual origin you browse, including `127.0.0.1` if applicable. Configure site URL, email delivery, and redirect allowlists appropriately.
5. Email sign-in uses the SDK's OTP/magic-link flow; the callback exchanges a real PKCE code. Google OAuth additionally requires enabling/configuring Google's provider and consent/redirect details in Supabase. No success is shown unless the provider completes.
6. Sign in with two separate test accounts. Save different workspaces; verify account A cannot select/update account B's row, signed-out requests return 401/503, and switching accounts never loads another local storage key. This live multi-user check requires your configured service and was not performed without credentials.

`/api/workspace` uses `auth.getUser()` server-side and filters by that verified user's ID; the request cannot choose another owner. RLS uses `user_id = auth.uid()` for both visibility and writes. There are no real agent roles in this prototype. The reviewer switch is an explicit local sandbox inside the same user's own data, never an escalation to another client's records.

## OpenAI property advisor

Set server-only `OPENAI_API_KEY`; optionally set `OPENAI_MODEL` (default `gpt-4.1-mini`, chosen for structured output support). Also configure Supabase and apply the migration. A key alone does not expose a public, anonymous paid endpoint.

Visitors get a labeled scripted guide. Signed-in users must separately enable OpenAI processing for each property. A question sends only its supplied property facts, confirmed relevant preferences, current calculator assumptions/results, and up to 16 recent messages. Names, source URL, image URL, and provider attestation are omitted from model context. No private document blobs are uploaded or sent. OpenAI `store: false` is used; provider account retention policies still apply.

The system prompt treats descriptions, disclosures, imported text, and conversation content as untrusted data; source content cannot override instructions. The model has no write/submit tools. It cannot change draft terms, contact sellers, or approve contracts. Structured answers are validated with Zod. Math comes from the server calculator, not model arithmetic. Without comparables it must acknowledge uncertainty.

Controls:

- 65 KB input-body cap, bounded property fields, up to 16 bounded messages.
- Per-instance short-term rate limiting and bounded limiter storage.
- **Durable, atomic PostgreSQL quota**: default 20 requests/user/day and 200 requests/project/day, allocated under a transaction lock. Requests fail closed if quota enforcement is unavailable. Failed provider requests can consume a quota slot, conservatively.
- Maximum 1,100 output tokens, 20-second SDK timeout, no automatic retries.
- On model/provider failure, the response explicitly switches to the scripted guide; it never pretends fallback text is a live model response.

Request quotas bound activity, not exact currency spending. Review the selected model's current pricing, lower the migration's limits for your budget, and configure provider budget alerts/controls. Public production use needs abuse monitoring and a dedicated cost gateway/operational limits as appropriate. Model quality, fair-housing behavior, and adversarial prompts require live testing before launch.

## Licensed RESO / MLS listing search

RESO is a technical standard, **not a listing-data license**. Bridge Interactive and other RESO-compatible providers require appropriate data agreements, MLS/brokerage authorization, and credentials. Do not assume a Utah County feed or public consumer display is automatically included. Discuss coverage, sold-comparable rights, attribution, refresh/deletion duties, public display, images, and caching with the relevant MLS/provider. Zillow, Realtor.com, and Redfin are not treated as free APIs.

Configure:

| Variable                         | Purpose                                                                                       |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `LISTING_LICENSE_CONFIRMED=true` | Administrator attests the required rights are in place; not proof supplied by this software   |
| `LISTING_API_BASE_URL`           | HTTPS OData service root, ending before `Property`                                            |
| `LISTING_API_TOKEN`              | Server-only bearer token scoped to that feed                                                  |
| `LISTING_PROVIDER_NAME`          | Human-readable provider name                                                                  |
| `LISTING_ATTRIBUTION`            | Provider/MLS-required attribution text; also includes supplied listing office where available |
| `LISTING_ALLOWED_HOSTS`          | Comma-separated exact feed and optional resolver hostnames                                    |
| `LISTING_IMAGE_HOSTS`            | Exact permitted hosts for publicly displayable provider image URLs                            |
| `LISTING_DATA_SIGNING_SECRET`    | At least 32 random characters to attest provider facts sent back to the advisor               |

The adapter requests `Property` with active status, city/address/ZIP, min/max price, bedrooms/bathrooms, size/type filters, a 40-record limit, and Media expansion. It normalizes standard fields; missing values remain null/unknown. HOA fees are converted to monthly only when frequency is documented as Monthly, Quarterly, or Annually. Photos are used only on explicitly permitted hosts; otherwise the labeled generated illustration remains.

Providers differ in field support, search/case behavior, expansions, authentication conventions, attribution requirements, and rights. The adapter must be validated and, where needed, adapted to your actual contract/endpoint. **Fixture tests are not live provider certification.** Search examples are not a claim that any current feed is connected.

Record signatures last 30 minutes and bind the property content. Tampered, expired, or unsigned client records are treated as user-supplied by the AI endpoint; canonical demo IDs are always replaced with server seed facts. Refresh the provider search/import to revalidate a record. A signature establishes that the app received a record from its configured provider, not independent verification of the home's condition, accuracy, availability, or value.

## Authorized URL resolution

Pasted URLs are never fetched directly by the application. Source identification supports public HTTPS Zillow/Redfin/Realtor.com links; other sites get manual entry. Credentials, IP addresses, local/internal names, unsafe schemes, and custom ports are rejected. Unsupported sources remain useful through manual entry.

If your licensed provider offers a permitted resolver, set `LISTING_IMPORT_API_URL`. It must be an HTTPS endpoint on an exact configured allowed host. The app posts `{ "url": "https://..." }` there with authorization; the resolver must return a `Home` record matching `lib/homebridge/schema.ts` with `source: "licensed"`. This is a documented adapter contract, not an invented third-party endpoint.

Use `LISTING_IMPORT_API_TOKEN` for a separate resolver credential. It is **required** if the resolver is on a different host; the listing-feed token is never silently sent to a different resolver host. Redirects are rejected, requests time out, and failures fall back to manual entry without claiming extraction. Configure `LISTING_DATA_SIGNING_SECRET` so authorized results retain provenance in model requests.

No unofficial scraper, anti-bot bypass, or generic arbitrary-page metadata fetch is included. The URL security boundary is structural: user URLs are data sent only to your explicitly trusted authorized resolver, never fetch targets in this app.

## Maps and PDFs

MapLibre requests OpenStreetMap raster tiles only when Map view is opened. Attribution remains visible. Follow OpenStreetMap's tile usage policy; replace public demonstration tiles with an appropriate hosted/self-hosted tile service before scaling. If WebGL or tiles fail, the map explains the problem and provides external area links. Demo coordinates are approximate city locations and never claim actual listing positions.

PDFs use `pdf-lib` and the embedded SIL-licensed DM Sans font locally on the server. No document API key, proprietary form, e-signature provider, or official legal template is involved. Six editable-answer-derived sections can be downloaded individually or together. The display and every PDF page carry prominent demo/not-for-submission identification. The current export uses an ASCII-safe text representation; uncommon characters may be replaced. International typography is a follow-up improvement.

## Current verification boundary

No external provider credentials were present during implementation. Local demo routes, request validation, signature handling, rate/body controls, calculator math, generated PDF structure/content, and browser journeys can be tested here. Actual Supabase login/delivery/RLS execution, live model output, licensed feed availability, provider attribution compliance, and external map tile service behavior require configured integration validation. Do not label those integrations operational merely because environment variables are present.

For integration checks inside a restricted cloud environment, outbound access must permit `api.openai.com`, your exact Supabase project hostname, the feed/resolver/image hosts you contracted for, and any map tile host you use. Vercel's hosting network is separate from the Codex workspace policy; allowing a domain in one does not configure the other. Keep TLS verification enabled.
