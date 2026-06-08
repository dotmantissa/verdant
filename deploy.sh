#!/usr/bin/env bash
set -e

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_ROOT"

DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT" | tail -20

DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE 'https://verdant-[a-z0-9]+-mantissas-projects\.vercel\.app' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "Could not determine deployment URL — alias not updated."
  exit 1
fi

echo "Deployed: $DEPLOY_URL"
vercel alias set "$DEPLOY_URL" verdant-footprint.vercel.app
echo "Alias updated: https://verdant-footprint.vercel.app/ -> $DEPLOY_URL"
