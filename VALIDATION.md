# Validation report

Validated in the selected cloud workspace with Node.js 24.22.1, npm 11.9.0, Next.js 16.4.6, and system Chromium.

- Clean frozen-lockfile installation: `bash .cloud/install.sh` completed, including `npm ci`, strict type checking, unit tests, and production build.
- `npm run lint`: passed.
- `npm test`: **5 passed**, 0 failed, 0 skipped. Covers known amortization values, zero interest, mortgage insurance, discovery parsing, seed relationships, and storage/reset behavior.
- `npm run build`: passed. Public and workspace routes compile successfully.
- `npm start`: started successfully on port 3000 after stopping the development server.
- `npm run test:e2e` against the production server: **4 passed**, 0 failed, 0 skipped, in 7.5 seconds. Covers discovery, saves, comparison, manual import, purchase creation, refresh persistence, personal tasks, scripted assistant, messaging, agent milestones, admin navigation restrictions, fee edits, reset, onboarding, uploads/acknowledgment, calculator interactivity, search URL persistence, secondary navigation, and schematic map links.
- Mobile checks at 390 × 844: homepage, property search, buyer dashboard, purchase tracker, and assistant had no horizontal overflow. Desktop and mobile screenshots were visually inspected; a final buyer-dashboard screenshot was captured after data restoration completed.
- Production asset check: all homepage images loaded, no browser page errors, and observed request hosts consisted only of the local application host. Fonts and illustrations are bundled.

The initial browser tests failed during a development-server configuration restart and before page hydration completed. They were diagnosed and rerun successfully against a stable development server, then against the production server. A selected-purchase persistence issue and cross-route search-state loss were fixed and covered by browser tests.

The application has not been pushed to GitHub or deployed to public hosting. No new-task snapshot restoration, provider publication, real authentication, database/Row Level Security, live listing feed, or live AI integration was validated because these are not implemented/configured in this self-contained demo.

The cloud configuration service failed to read the draft and could not confirm saving `install_script` / `start_skill`. Reusable instructions are preserved in `.cloud/install.sh` and `.cloud/START.md`; automatic platform persistence/publication is unconfirmed. Current-instance installation and runtime validation succeeded independently.
