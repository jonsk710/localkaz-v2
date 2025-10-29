#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="backups/$TS"
mkdir -p "$OUT"

# --- Construire SUPABASE_DB_URL si absent ---
if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  # Charger .env.local pour NEXT_PUBLIC_SUPABASE_URL
  set +u
  [[ -f .env.local ]] && set -a && . ./.env.local && set +a
  set -u

  if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
    echo "❌ NEXT_PUBLIC_SUPABASE_URL introuvable. Ajoute-le dans .env.local" | tee "$OUT/README_DB.txt"
    exit 1
  fi

  # Project ref → host DB
  REF="$(node -p "new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host.split('.')[0]")"
  HOST="db.${REF}.supabase.co"

  # Si .co ne résout pas, bascule en .net (rare)
  if command -v dig >/dev/null 2>&1; then
    dig +short "$HOST" @1.1.1.1 | grep -q . || HOST="db.${REF}.supabase.net"
  elif command -v nslookup >/dev/null 2>&1; then
    nslookup "$HOST" 1.1.1.1 >/dev/null 2>&1 || HOST="db.${REF}.supabase.net"
  fi

  # Mot de passe : prend PGPASSWORD si défini, sinon "Jonquille1"
  PW="${PGPASSWORD:-Jonquille1}"

  export SUPABASE_DB_URL="postgresql://postgres:${PW}@${HOST}:5432/postgres?sslmode=require"
fi

echo "➡️  Using SUPABASE_DB_URL=${SUPABASE_DB_URL}"

# --- Test connexion ---
psql "$SUPABASE_DB_URL" -c "select current_user, current_database(), now();" > "$OUT/test-psql.txt"

# --- Dump BDD (format compressé) ---
pg_dump -d "$SUPABASE_DB_URL" -Fc -f "$OUT/db.dump"

# --- Snapshot du projet (sans node_modules/.next/backups) ---
tar -czf "$OUT/project-snapshot.tgz" --exclude node_modules --exclude .next --exclude backups .

# --- Git status si repo ---
git rev-parse --is-inside-work-tree >/dev/null 2>&1 && {
  git status -sb > "$OUT/git-status.txt" || true
}

echo "✅ Backup OK → $OUT"
