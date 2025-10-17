const { createClient } = require('@supabase/supabase-js')

function client() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('❌ SUPABASE_URL / SUPABASE_ANON_KEY manquants (exporte-les avant de lancer un script).')
    process.exit(1)
  }
  return createClient(url, key)
}

module.exports = client
