#!/usr/bin/env bash
set -euo pipefail
cd /workspace/HomeBridge-prototype
npm ci --cache /workspace/.npm-cache
npm run typecheck
npm test
npm run build
