#!/usr/bin/env bash
set -euo pipefail

# Deploy to Render using GitHub integration
# This script pushes the current branch to the remote; Render will automatically deploy if the
# repo is connected and a Web Service is configured for this branch.
# Optional: if you want to use Render's CLI to trigger a deploy, install @render/cli and use
# render deploy --service <service-id>.

BRANCH=${1:-release/render-deploy}

echo "Pushing branch ${BRANCH} to origin..."
git push -u origin "${BRANCH}"

echo "Branch pushed. Render (if linked to this repo/branch) should start deploying automatically."
echo "If you want to trigger a deploy with Render CLI, install @render/cli and run:"
echo "  npm i -g @render/cli"
echo "  RENDER_TOKEN=your_token render services deploy <service-id> --env production"
