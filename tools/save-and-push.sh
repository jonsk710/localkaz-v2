#!/usr/bin/env bash
set -e
msg="${1:-"save: $(date +'%Y-%m-%d %H:%M:%S')"}"
git add -A
git commit -m "$msg" || true
git push -u origin "$(git rev-parse --abbrev-ref HEAD)"
echo "✅ Pushed: $msg"
