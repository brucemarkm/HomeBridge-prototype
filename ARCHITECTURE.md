# Architecture — connected buyer workflow

## Existing strengths retained

Next.js App Router, React, strict TypeScript, original Homebridge wordmark/identity, bundled fonts and generated illustrations, proposed fee, responsive design, and the existing repository/deployment structure remain. This upgrade replaces the disconnected route-driven demo shell with modular buyer workflow components; v1 UI/data modules remain as reference and legacy test coverage, not an active second application. The v1 browser key is not deleted.

## Modules

- `components/beta/`: shell, homepage, discovery/map, import, property workspace/advisor/profile, mortgage, offer wizard, draft viewer, handoff, reviewer simulation, My Homes/comparison, My Purchase, account, and pricing/integrations.
- `lib/homebridge/schema.ts`: Zod domain and API contracts, bounded input shapes, null for missing property fields, provenance.
- `demo.ts`: four differentiated fictional scenarios and fresh guest state.
- `finance.ts`, `analysis.ts`: deterministic amortization and grounded observations/scripted response provider. No invented comparables or fit scores.
- `documents.ts`: one shared original six-document representation used by both HTML preview and PDF export.
- `workflow.ts`: context changes invalidate document revisions without rewriting proposed terms.
- `storage.ts`: versioned guest/account browser persistence and compatible v1 imports.
- `server/listings.ts`, `import.ts`: RESO provider abstraction, normalization, fixed authorized resolver, URL security.
- `server/ai.ts`: server-held OpenAI key, structured output, grounded calculation context and prompt-injection boundaries.
- `server/auth.ts`, `auth-client.ts`: established Supabase SSR/PKCE clients; server-verified identities.
- `server/provenance.ts`: HMAC binding of provider records; tampered/expired client facts are not accepted as provider-reported model context.
- `server/http.ts`: same-origin checks compatible with host/proxy routing, custom request header, streamed size limits, validated JSON, safe API errors, bounded per-instance burst limiting.

A root `WorkspaceProvider` preserves client state across Next route changes and explicitly isolates guest and per-user storage keys. Public pages can render seed content; property-specific persisted content waits for browser restoration. Async connection status loads once; unavailable services do not erase local work. Production never sees a secret through a `NEXT_PUBLIC_*` variable; the Supabase public anon key is intentionally public and requires RLS.

## Route/API contracts

| Endpoint                 | Contract                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `GET /api/config`        | Non-secret configured flags and verified current account identity; no-store                                             |
| `GET /api/listings`      | Bounded search filters → normalized licensed provider records, or explicit not-connected state                          |
| `POST /api/import`       | Validated public listing URL → authorized normalized record or honest manual-entry fallback                             |
| `POST /api/assistant`    | One property's facts, consented preferences/assumptions, bounded conversation → schema-validated live/scripted response |
| `POST /api/pdf`          | Validated property/draft/profile/assumptions → original, labeled PDF bytes; no persistence or external upload           |
| `GET/PUT /api/workspace` | Verified session → owner's RLS-protected JSON workspace only                                                            |
| `GET /auth/callback`     | Real provider authorization code exchange; no fake sign-in                                                              |

No endpoint accepts a caller-selected owner ID. There is no endpoint to send an offer, contact a seller, transfer money, sign a form, or mark an actual agreement executed.

## Data model and evolution

Current validated domain entities support:

| Concept                          | Current representation / next normalized entity                                        |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| Users                            | Supabase `auth.users`, verified session                                                |
| BuyerProfiles                    | Per-property preferences, optional cross-property memory; `buyer_profiles` / workspace |
| Properties / ListingSources      | Normalized `Home`, source URL, provider, per-field provenance, data signature          |
| SavedHomes                       | Property ID references in owner's workspace                                            |
| PropertyAnalyses                 | Grounded observations computed from facts/profile/assumptions; snapshot at handoff     |
| ChatConversations / ChatMessages | Bounded message arrays keyed by property ID                                            |
| OfferDrafts                      | Confirmed terms, current question, revision, generated revision, timestamps            |
| DraftDocuments                   | Six deterministic sections / PDF bytes on request; no private uploaded blobs           |
| ReviewRequests                   | Buyer-approved immutable context and proposed-term snapshots, statuses/history         |
| AgentComments                    | Explicit local reviewer/buyer messages within each request                             |
| PurchaseMilestones               | Preparation/review status, personal checklist, target closing date                     |

The migration implements owner-isolated `buyer_workspaces` JSONB, optional `buyer_profiles`, and durable quota tables. This is a pragmatic beta persistence adapter, **not a claim that every future entity already has a normalized SQL table**. The Zod contracts and ID relationships define the next normalization boundary. Move properties, conversations/messages, drafts/documents, review requests/comments, participants, and milestones into relational tables when adding real multi-party collaboration; preserve existing IDs and snapshot semantics.

## Authorization and professional review

Guest and reviewer simulation operate over local data. The reviewer switch is not authentication, verified licensing, or access to another user's account. With Supabase configured, authenticated sync is protected both by `auth.getUser()` and owner-only RLS; users cannot choose another owner's row. Live AI quota consumption is tied to that same verified identity and enforced atomically in PostgreSQL.

Actual professionals, verified credentials/brokerage affiliation, role assignments, agent-client membership, private shared document storage, and server-authorized real review actions are not implemented. They must be added before genuine professional collaboration. Never treat the local status history as an immutable production audit trail.

A review request copies the property, confirmed terms, relevant preferences, calculator assumptions, analysis, and document revision only after the buyer approves. Later changes create a different revision and require regeneration/re-sharing. Old snapshots remain fixed; reviewer comments/status history persist. No legally operative agreement exists.

## Reliability and limits

Rate limits and body caps bound API work. Live AI additionally requires persistent daily request quotas and an authenticated/consented session; it fails closed when quotas cannot be checked. Model timeouts/errors switch explicitly to scripted mode. Financial calculations are deterministic and provided to the model. No model write tools exist.

Provider base/resolver/image hosts are explicit allowlists; user listing URLs are never direct fetch targets. Redirects are rejected. Different resolver hosts require separate credentials. Unknown fields remain null, and no active feed is implied by fixtures or configuration presence.

Tests cover financial known values, URL/SSRF validation, source normalization/signatures, malformed storage and account isolation, deterministic analysis, request-origin/body behavior, real PDF bytes, and mobile/desktop end-to-end workflows. External identity, live model output, MLS licensing, and multi-user RLS operation require separate configured tests. See VALIDATION.md for actual results.
