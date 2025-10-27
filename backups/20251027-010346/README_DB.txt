SUPABASE_DB_URL est vide dans le shell. Deux options :

A) Depuis Supabase > SQL Editor :
   - Exécuter:  SELECT now();
   - Ou exporter via "Backups" / "Connection string" (selon ton plan).

B) En terminal, définis la chaîne de connexion psql, ex. :
   export SUPABASE_DB_URL='postgresql://postgres:***@db.XXX.supabase.co:5432/postgres?sslmode=require'
   Puis relance: scripts/backup_all.sh
