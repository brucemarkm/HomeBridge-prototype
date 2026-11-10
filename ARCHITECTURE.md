# Architecture

## Current runtime

Next.js App Router serves an optional catch-all route (`app/[[...path]]/page.tsx`) so all documented public, buyer, agent, and admin URLs resolve directly and can be refreshed. `Homebridge` dispatches the route to connected demo screens. `Homepage` and `PropertyCard` are reusable components. Custom responsive CSS provides the visual system; fonts and generated images are served locally. No external runtime request is necessary.

`lib/model.ts` defines typed records, deterministic seed data, mortgage calculations, criteria parsing, and scripted guidance. `lib/config.ts` holds defaults. `lib/providers.ts` separates the local repository and provider contracts from the interface. Replacing a provider requires implementation work, not just credentials.

The demo repository serializes version-1 state to local storage. Missing, incompatible, or malformed root records restore defaults. Browser quota failures display a message rather than claiming success silently. Uploaded files are stored as data URLs, capped at 2 MB each; large or numerous files may exhaust the browser quota. Reset discards local changes and returns fresh seed objects.

Property searches initiated from the homepage encode criteria in the URL. Purchase selection is persisted with transaction records. Browser-only state is restored after hydration, so the server never reads browser storage. Public pages have seeded server-rendered content; workspaces show a short restore state while loading local data.

## Data relationships

- `Property.id` is referenced by saved IDs, comparison IDs, and `Transaction.propertyId`.
- Transactions carry a fictional buyer, assigned demo agent, stage index, completed personal tasks, closing target, and offer worksheet.
- The shared demo conversation demonstrates buyer/agent messaging in one browser.
- Documents and activity are workspace-wide demo records; they are not private transaction files.
- The fee default comes from config, then can be overridden in local demo settings.

There is no SQL database, authentication, production user isolation, RLS migration, real audit trail, or backend authorization in this local prototype. UI role guards organize fictional content and require explicit switching to agent/admin areas. They cannot protect real data. Local history is editable browser state and is not a legally reliable audit log.

## Business calculations

Mortgage principal and interest use the standard fixed-rate amortization formula, with a separate zero-interest branch. Estimated total payment adds annual tax/insurance divided by 12, HOA, and an illustrative 0.5% annual mortgage-insurance assumption when down payment is below 20%. These are inputs, not live lending terms.

The fee tool separates comparison compensation, proposed Homebridge fee, seller contribution to that fee, and hypothetical concessions. The fee difference is never described as an automatic cash refund. No actual lender eligibility or concession cap has been established.

## Future production boundaries

A production adapter must introduce authenticated server requests and authorization on every operation, using stable user IDs and assigned-agent relations. Add proper tables and foreign keys for profiles/roles, preferences, properties/images, saves/comparisons/imports, transactions/tasks/stage histories, agent assignments, conversations/participants/messages, notifications, documents, pricing settings, and audit events. Supabase is an option, not installed infrastructure.

Before real client use: implement and test database migrations, deny-by-default RLS, private document storage and signed access, session security, upload validation/scanning, retention controls, and server-authorized professional actions. A real provider must preserve the difference between buyer checklist actions and professionally confirmed contract milestones.

An AI provider needs an authenticated server endpoint, server-held key, grounded property/transaction context, input limits, rate/cost limits, and clear fallback states. `AssistantProvider` currently supports only the local scripted mode; a live mode must explicitly extend this contract. Never call a model with client-exposed credentials.

`AuthorizedListingProvider` defines a future authorized URL-import boundary. It has no current implementation and no scraper. Likewise, `MessageTransport` marks a future delivery boundary; local messages never leave the browser. A real geographic map, signatures, emails, and brokerage procedures remain separate integrations.

## Validation

Node's test runner through `tsx` covers business rules and storage behavior. Playwright runs full browser journeys with isolated contexts, checks persistence, role navigation, editable transactions, messages, documents, fee settings, reset, onboarding, and mobile layout. Production build and strict TypeScript are required. CI uses a real Chromium browser.
