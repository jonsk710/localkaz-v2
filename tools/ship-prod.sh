#!/usr/bin/env bash
set -e
# s'assure que dev est à jour sur GitHub (facultatif)
git checkout dev
git pull --rebase origin dev || true

# merge vers main
git checkout main
git pull --rebase origin main || true
git merge --no-ff dev -m "merge: ship dev -> main"

# pousse en prod
git push -u origin main
echo "🚀 Expédié en production (branche main). Vercel va déployer."
