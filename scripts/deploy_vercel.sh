#!/usr/bin/env bash
set -euo pipefail

# Deploy frontend using Vercel CLI
# Prereqs: export VERCEL_TOKEN in your environment (vercel token)
if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "VERCEL_TOKEN not set. Use: export VERCEL_TOKEN=your_token" >&2
  exit 1
fi

echo "Deploying frontend to Vercel..."
npx vercel --prod --token "$VERCEL_TOKEN"

echo "Frontend deployed. Check Vercel output above for the URL." 
