# Buyer beta validation

Validated locally with Node.js 24.22.1, Next.js 16.4.6, and system Chromium. The production website at `home-bridge-prototype.vercel.app` was not deployed to or modified. Its public URL could not be inspected from this restricted cloud network (HTTP 403); the existing checkout/routes/models/components were inspected directly.

## Passed

- `npm run lint` — passed.
- `npm run typecheck` — passed, strict TypeScript.
- `npm test` — **17 passed**, 0 failed, 0 skipped. New beta tests cover four rich scenarios, extended mortgage known values/zero interest/cash/PMI, grounded analysis, URL/SSRF-shaped input rejection, RESO normalization/missing values, guest/account storage isolation and malformed recovery, honest import fallback, canonical demo context, six document sections and real PDF bytes, provider data signatures/tampering, document invalidation, request size/origin/proxy-host checks. The five original business-rule tests remain included.
- `npm run build` — passed. All page, API, and callback routes compiled. The generated PDF function's file trace explicitly includes both bundled font files for server deployment.
- `npm start -- --port 3200` — production rehearsal started successfully.
- `HB_TEST_BASE_URL=http://127.0.0.1:3200 npm run test:e2e` — **7 passed**, 0 failed, 0 skipped, **11.1 seconds** against that production build.

## Browser coverage

1. Mobile homepage → demo selection → property advisor → confirmed discovery answers → property-specific concern response → editable affordability → all proposed terms with a skipped answer → real downloaded PDF → explicit sharing approval → simulated reviewer comment/change request → buyer next action → refresh persistence.
2. Edit proposed price, regenerate/share a new revision, and verify the new review snapshot differs while the old snapshot retains its original price.
3. Supported URL recognition, honest no-extraction fallback, manual information/unknown values, preview, source link, saving, and refresh persistence.
4. ZIP filtering, comparison, reasoned fit rather than numerical scores, honest guest account state, integration status, original-route redirects, and unauthenticated workspace rejection.
5. Invalid URLs/private hosts/embedded credentials, unsupported domains, and missing required address handling.
6. Forced map-tile network failure with accessible external area links; listings remain usable.
7. Authorized-resolver **contract fixture only**: unchanged provider information keeps provenance, buyer corrections become user-supplied. This is not a live-provider test.
8. Preference memory remains property-local until permission is enabled; guest reset restores an empty workspace.

Additional browser inspection at 390 × 844 found no horizontal overflow on discovery, import, My Homes, purchase, account, pricing, property analysis, or affordability. Desktop homepage/property workspace and mobile chat were visually inspected. There were no browser page errors in the screenshot/overflow run.

## PDF inspection

A sample six-section PDF package was generated, parsed, text-extracted, and visually rendered. It includes the proposed price and property-specific moisture question, marks missing answers, and repeats the nonbinding/not-for-submission notice on every page. Visual inspection found font-substitution issues in the initial standard-font export; embedding the bundled SIL-licensed DM Sans font resolved them. The sample now renders cleanly. ASCII-safe text export remains a documented internationalization limitation.

## Diagnosed and corrected during validation

- Same-origin checks initially compared the internal server URL with the browser origin, blocking valid local/proxied API calls. They now validate the request host/protocol with the custom request header; cross-site inputs remain rejected.
- Malformed v2 JSON initially bypassed compatible preserved-v1 migration. Recovery now continues safely without deleting v1 data.
- Editing one existing offer answer initially continued through subsequent questions. Confirming an edit now returns to the answer summary.
- Calculator/profile changes invalidate generated document revisions without silently changing proposed terms; shared snapshots remain fixed.
- Provider corrections retain conservative provenance; unchanged resolver records retain their signed original data.

## Not externally validated / not operational claims

No live provider credentials were available. Actual Supabase email/Google delivery, authenticated cross-device sync, two-account RLS enforcement in a running database, durable quota RPC execution, live OpenAI model quality, licensed RESO/MLS data access, real attribution obligations, and successful external map tile rendering require configured integration tests. The SQL migration was supplied but not applied to any external database. No production data was modified.

Real licensed-agent identities/assignments, approved legal forms, actual offer submission, external messaging, e-signatures, and seller functionality are not implemented. Reviewer switching is a local simulation, not a real role-based professional service.

GitHub branch push and any Vercel Preview outcome must be reported separately after their actual results. A local production build is not evidence of a hosted deployment.

## Branch / hosting evidence

- Upgrade code was pushed to `upgrade/property-advisor` at `e53c8ab4765bb6d055d1f82763bbee1ad81a1277`.
- Remote `main` remains `673584952f1c95bd92ee6ecd3affe1eee15750c3`; no merge or production deployment was requested or performed.
- GitHub Actions run `https://github.com/brucemarkm/HomeBridge-prototype/actions/runs/42909815249` reported **Success** for the upgrade commit.
- Vercel's public GitHub check linked feedback for the actual branch preview host `home-bridge-prototype-git-upgrade-property-advisor-brucemarkm.vercel.app`.
- Direct verification of that hosted URL from this workspace was blocked by the cloud egress proxy (CONNECT 403), not an observed application response. Local production-build validation remains the runtime evidence; hosted availability and any Vercel sign-in protection are not independently verified here.
