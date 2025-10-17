const supabase = require('./supabaseClient')

async function test() {
  const { data, error } = await supabase.from('profiles').select('*')
  if (error) {
    console.error('❌ Erreur Supabase :', error)
  } else {
    console.log('✅ Données récupérées :', data)
  }
}

test()
