# Start Homebridge in the cloud

Each cloud task is already isolated. Use the existing checkout at `/workspace/HomeBridge-prototype`; do not create a Git worktree unless the user explicitly requests one.

1. Use Node.js 24 (Node 22 is also supported). Run commands as the ordinary user.
2. If dependencies are missing or the lockfile changed, run `npm ci --cache /workspace/.npm-cache` in that checkout. No secrets or external services are needed. Keep TLS verification enabled.
3. For a demonstration, run `npm run preview` from the checkout. It reuses a responding Homebridge server or starts the production server in the background on `0.0.0.0:3000`, building first if no production build exists. Logs are in `.next/preview.log`. Run this again after the cloud resumes: background processes do not survive environment suspension. For code changes, use `npm run dev` in a persistent terminal instead; do not run two servers on port 3000. After code changes, stop only the server you started, rebuild, and restart the production preview.
4. Check `curl -fsS http://127.0.0.1:3000` internally, then run `npm run test:e2e`. The cloud has Chromium at `/usr/bin/chromium`. The browser suite verifies real interactions, not just an open port.
5. Open the cloud's Desktop browser and enter `http://localhost:3000` in its address bar, when that viewer is available. Onboarding does not provide a public localhost preview URL. Do not present loopback addresses as externally accessible preview links.
6. Click **Explore demo → Enter buyer demo**. Demo changes live in that browser's local storage. Use Agent and Administrator roles in the same browser to see those changes. Settings → Reset demonstration data restores seed records.

Bundled fonts and generated illustrations require no network at runtime. Dependency installation uses `registry.npmjs.org`. No database, API keys, email, MLS, map service, or paid API is needed.

Processes do not survive environment snapshots. Restart the server for a new task. The filesystem contains the application and dependencies, not a public deployment. Do not claim deployment or publication until performed and verified.
