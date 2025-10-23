#!/usr/bin/env bash
set -e
msg="${1:-"save: $(date +'%Y-%m-%d %H:%M:%S')"}"
git add -A
git commit -m "$msg" || echo "Rien à committer (déjà à jour)."
git status -sb
echo "✅ Sauvegarde locale créée."
