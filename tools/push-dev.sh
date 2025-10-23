#!/usr/bin/env bash
set -e
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" != "dev" ]; then
  echo "⚠️  Tu n'es pas sur la branche 'dev' (branche actuelle: $branch)."
  echo "    Fais:   git checkout dev"
  exit 1
fi
git push -u origin dev
echo "✅ Poussé sur GitHub (branche dev). Vercel ne déploiera pas."
