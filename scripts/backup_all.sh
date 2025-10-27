#!/usr/bin/env bash
set -euo pipefail

STAMP="$(date +%Y%m%d-%H%M%S)"
BACK="backups/$STAMP"
mkdir -p "$BACK"

echo "=== 1) Git snapshot ==="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  BR="snapshot-$STAMP"
  git add -A
  git commit -m "snapshot: $STAMP" || true
  git branch "$BR" 2>/dev/null || true
  git tag -f "snapshot-$STAMP" >/dev/null 2>&1 || true
  echo "Git branch/tag: $BR / snapshot-$STAMP"
else
  echo "⚠ Pas de repo git ici (ok, on continue quand même)."
fi

echo
echo "=== 2) Env & diagnostic ==="
[ -f .env.local ] && cp .env.local "$BACK/.env.local.bak" || echo "⚠ .env.local introuvable (ok)"
if [ -x scripts/localkaz_doctor.sh ]; then
  scripts/localkaz_doctor.sh > "$BACK/doctor.txt" 2>&1 || true
fi
git status -sb > "$BACK/git-status.txt" 2>/dev/null || true

echo
echo "=== 3) Dump BDD (si SUPABASE_DB_URL présent) ==="
if [ -n "${SUPABASE_DB_URL:-}" ]; then
  # Dump binaire (restaurable avec pg_restore)
  pg_dump "$SUPABASE_DB_URL" -Fc -f "$BACK/db.dump"
  # Schéma complet (lecture)
  pg_dump "$SUPABASE_DB_URL" -s -f "$BACK/schema.sql"
  # Données utiles (tables clés)
  pg_dump "$SUPABASE_DB_URL" -a \
    -t public.listings \
    -t public.listing_photos \
    -t public.conversations \
    -t public.messages \
    -t public.favorites \
    -t public.admins \
    -t storage.objects \
    -f "$BACK/data.sql"
  echo "→ Dumps écrits dans $BACK/"
else
  cat > "$BACK/README_DB.txt" <<'TXT'
SUPABASE_DB_URL est vide dans le shell. Deux options :

A) Depuis Supabase > SQL Editor :
   - Exécuter:  SELECT now();
   - Ou exporter via "Backups" / "Connection string" (selon ton plan).

B) En terminal, définis la chaîne de connexion psql, ex. :
   export SUPABASE_DB_URL='postgresql://postgres:***@db.XXX.supabase.co:5432/postgres?sslmode=require'
   Puis relance: scripts/backup_all.sh
TXT
  echo "⚠ SUPABASE_DB_URL est vide — README_DB.txt créé avec les instructions."
fi

echo
echo "=== 4) Snapshot du projet (sans node_modules/.next/backups) ==="
tar --exclude=node_modules --exclude=.next --exclude=backups -czf "$BACK/project-snapshot.tgz" .
echo "→ Archive : $BACK/project-snapshot.tgz"

echo
echo "=== 5) Récapitulatif ==="
ls -lh "$BACK"
echo "OK. Sauvegarde complète dans: $BACK"
