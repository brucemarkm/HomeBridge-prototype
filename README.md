# Homebridge

**A smarter, simpler way home.** A polished, interactive homebuying concept built with Next.js App Router, React, strict TypeScript, Lucide icons, and custom responsive CSS. Everything runs in demo mode without paid APIs, accounts, a database, or external runtime services.

This is a demonstration, not an operating brokerage. All addresses, agents, purchases, metrics, and pricing histories are fictional. The bundled AI-generated architectural illustrations do not depict the fictional addresses. Nothing submits offers, schedules real tours, sends emails, signs agreements, or moves money.

## Preview in this cloud workspace

The application is in `/workspace/HomeBridge-prototype`.

1. Open a terminal for this cloud workspace.
2. Run `cd /workspace/HomeBridge-prototype`.
3. Run `npm run preview`. It starts the demo in the background on port 3000 or reuses the running Homebridge server. Run it again if the cloud resumes and the server has stopped.
4. Open the cloud **Desktop** panel if your Codex interface offers it. In the cloud browser's address bar, enter `http://localhost:3000`.
5. Click **Explore demo**, then **Enter buyer demo**. Try Agent and Brokerage Administrator from the same menu.

`localhost` means the machine running the application: use the cloud browser to access the cloud server. Entering that address in your own computer's browser will not reach the cloud workspace. If your interface lacks a Desktop or port preview, use the deployment instructions below to get a shareable website address.

Your computer does not host this workspace. It can be switched off. The temporary cloud workspace may eventually stop; a deployed website runs independently. Start instructions for future cloud tasks are in `.cloud/START.md`.

## Run on your own computer (optional)

Install Node.js 24 LTS and Git. Download/clone the project, open its folder in a terminal, then run:

```sh
npm ci
npm run dev
```

Enter `http://localhost:3000` in your browser. No `.env` file is required. Stop the server with Ctrl+C.

## A five-minute demonstration

1. On the homepage, search for **3 bedrooms in Provo under $550,000**.
2. Save a home with the heart. Add two or three homes to **Compare**, then open the comparison tray.
3. Open **Bring a home**. Enter a fictional address and details. A URL is optional and is never scraped or fetched.
4. From a property, click **Start a demo purchase**. Complete personal checklist items and edit the offer discussion worksheet.
5. Ask **Homebridge AI** about earnest money or what happens next. Responses are local, scripted demonstrations, not a live language model.
6. Send a message in **Messages**. Switch to **Agent**, open Messages, and reply. Changes are shared among roles only in this browser.
7. In Agent → Transactions, choose the purchase and confirm a simulated milestone. Buyers cannot use those controls from the buyer interface.
8. Explore **Documents**, upload a non-sensitive sample TXT/PDF, view/download a sample, and acknowledge it. This is not a signature.
9. Open **Financial tools** to adjust mortgage assumptions. Open **Pricing** to compare fees. A fee difference is not an automatic buyer refund.
10. Switch to Administrator to see the pipeline and team, or change the fee in Business settings. Buyer Account settings offers **Reset demonstration data**.

## What works

- Responsive public homepage, process, story, pricing, resources, contact demonstration, and coming-soon seller preview.
- 28 fictional properties across seven Utah County cities; search, advanced filters, sorting, saved homes, comparison, and a schematic clickable area map.
- Detail galleries, facts, fictional price history/comparables, approximate area coordinates, payment estimates, demo tour requests, and purchase creation.
- Manual property entry with optional validated source URL; imported details are explicitly unverified.
- Buyer onboarding, preferences, saved homes, assistant conversation, purchase checklists, editable offer discussion notes, local messages, and notifications.
- Three seeded transactions, 11 milestones, agent-side milestone controls, assignments, and activity history.
- Local sample documents, TXT/PDF uploads up to 2 MB, sample download, and acknowledgment.
- Agent/client workspaces; administrator pipeline, team, illustrative analytics, and configurable fee.
- Mortgage amortization (including zero-rate loans), mortgage insurance assumption, debt-to-income exploration, and fee comparison.
- Browser persistence and one-click reset. Three generated illustrations and bundled open-source fonts work without a photo/font host.

## What is simulated or intentionally not connected

Demo roles are a navigation model, **not authentication or a security boundary**. All data is in local storage on the same browser and origin. A visitor can switch to any demo role. There is no shared server database or private account data, and no cross-device synchronization. Never use the demo for real client documents or sensitive financial data.

The assistant is a deterministic local guide with supported topics, not a live AI model. Maps are schematic, not navigable geographic basemaps. Listing URLs are not fetched. Email/contact/tour requests are local activity events. Agent profiles and business metrics are fictional. e-signatures, MLS/IDX, live market rates, operational seller services, lender approvals, and real representation are not implemented.

Secondary business controls such as workflow-template editing, package management, arbitrary team-member creation, and editable homepage copy are roadmap items. The demo supports the core customer journey, not all features in the full master specification.

## Make changes

You can ask Codex to change text, colors, layouts, or features in plain language. Useful files:

| Change                                                         | File                           |
| -------------------------------------------------------------- | ------------------------------ |
| Homepage copy and sections                                     | `components/homepage.tsx`      |
| Colors, spacing, mobile layouts                                | `app/globals.css`              |
| Default fee and business assumptions                           | `lib/config.ts`                |
| Sample properties, transactions, messages, assistant responses | `lib/model.ts`                 |
| Property cards                                                 | `components/property-card.tsx` |
| Workspace screens and interactions                             | `components/homebridge.tsx`    |
| Persistence and integration boundaries                         | `lib/providers.ts`             |
| Website title and description                                  | `app/layout.tsx`               |

The development server refreshes after saved edits. Existing browser data takes precedence over new seed defaults; reset the demo to see seed/default changes. Admin pricing edits affect only that browser, not everyone visiting the deployed site. For a site-wide default, edit `lib/config.ts` and redeploy.

## Checks

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

The unit tests cover known mortgage values, zero interest, insurance assumptions, natural-language parsing, data relationships, and storage recovery. Playwright exercises buyer, agent, admin, documents, onboarding, search persistence, and mobile overflow checks.

Playwright uses system Chromium when available. On a machine without it, run `npx playwright install chromium` first. `CHROMIUM_PATH` can select another Chromium executable. Linux CI can use `npx playwright install --with-deps chromium`.

Production rehearsal: `npm run build`, then `npm start`. Tests default to port 3000. `.github/workflows/ci.yml` runs the checks on GitHub once the code is pushed.

## Deploy and get a shareable website address

The easiest route is a Next.js hosting provider such as Vercel. A provider account and GitHub authorization are required; no application API keys are needed. Check the provider's current terms, usage limits, and plan eligibility for your intended use.

1. First save this new application's files to your GitHub repository. In the cloud terminal, from `/workspace/HomeBridge-prototype`, run:

   ```sh
   git add .
   git commit -m "Build interactive Homebridge demonstration"
   git branch -M main
   git push -u origin main
   ```

   These instructions assume the repository is still empty, as it was when this project was created. If someone has since pushed code to `main`, stop and reconcile those changes before pushing. Do not use force push. If Git asks for identity, configure your name/email locally for this repository. If the cloud cannot push, use the interface's code export/download, open the project in a local Git tool such as GitHub Desktop, and publish it to the intended repository.

2. Sign in at Vercel with GitHub.
3. Choose **Add New → Project** and import `brucemarkm/HomeBridge-prototype`.
4. Keep the Next.js framework preset, repository root directory, and default build settings. Choose Node.js 24 if asked. Leave environment variables empty.
5. Click **Deploy**. After the build succeeds, Vercel provides a public HTTPS address.
6. Open that address and test **Explore demo → Buyer**. Send that address to people you want to show the prototype.
7. Later pushes to the connected branch trigger updated deployments. Browser demo data is separate for each visitor and each domain.

Deployment has not been performed by this implementation. The cloud development server is not a permanent public website. A local CLI deployment is also possible with your own authorized provider account, but no provider credentials have been configured here.

## Optional integrations

**Supabase is not connected.** Connecting it is a separate engineering step: provision a project, implement authenticated server sessions, SQL migrations/foreign keys, per-user and assigned-agent Row Level Security, and private storage policies. Keep service-role credentials server-side. Adding environment variables alone will not enable it.

**OpenAI is not connected.** A future implementation needs a server-only API key, an authenticated server endpoint, a provider implementation, request validation, rate limits, budget/token limits, and professional-review constraints. Do not put keys in frontend code. Until then, the working scripted guide remains free and local.

Authorized MLS/IDX data, email, scheduling, mapping, and signatures require their own providers, permissions, and production review. There are no dormant API calls or hidden paid dependencies.

See `ARCHITECTURE.md`, `PRODUCT_ROADMAP.md`, and `BUSINESS_ASSUMPTIONS.md` for the next stages.
