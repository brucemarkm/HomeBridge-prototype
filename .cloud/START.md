# Start the Homebridge buyer beta

Each cloud task is already isolated. Use the existing checkout at `/workspace/HomeBridge-prototype`; do not create a Git worktree unless explicitly requested. The upgrade lives on `upgrade/property-advisor`, while `main` remains the original deployed site until approval.

1. Use Node.js 24. If dependencies are missing or the lockfile changed, run `npm ci --cache /workspace/.npm-cache` as the ordinary user.
2. Start `npm run dev -- --port 3100` in a persistent terminal for editing. For a production rehearsal, stop that server, run `npm run build`, then `npm start -- --port 3100`.
3. Use local HTTP requests and `npm run test:e2e` (defaults to port 3100) to verify readiness. System Chromium is at `/usr/bin/chromium`. A PID/open port is not sufficient.
4. In a cloud browser/viewer, choose port 3100. Localhost inside the cloud is not a public website link. If the viewer is unavailable, use an actual Vercel Preview deployment of this branch; do not guess its URL or publish to production.
5. Click **Try a demo purchase**, choose the Springville scenario, ask the property advisor a question, explore affordability, confirm offer questions, create/download the draft PDF package, and explicitly approve the simulated review snapshot. Then use **Simulate agent review** to comment or request changes and return to **My Purchase**.

The entire guest workflow needs no environment variables, paid API, or database. Live provider/auth/model credentials are optional and require their documented permissions, test services, migrations, and network access. Never print secret values, disable TLS verification, or assume configuration presence proves external readiness. See README.md and INTEGRATIONS.md.

Browser changes are saved locally under `homebridge-workspace-v2`; original v1 data is preserved. Real configured accounts use separate local keys and explicit owner-authorized sync. No actual professional, seller, signature, money transfer, or offer submission is connected.

Processes do not survive environment suspension. Restart after resuming. Do not push to `main`, merge, deploy to production, or modify production data without the user's permission. A preview branch push is not proof a Vercel preview finished successfully.
