const { createClient } = require('@supabase/supabase-js')

// On lit les valeurs depuis les variables d'environnement (sécurisé)
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ SUPABASE_URL ou SUPABASE_ANON_KEY manquante. Exporte-les avant de lancer le script.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

module.exports = supabase
