const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const identifier = process.argv[2]    // email OU user_id
  const newPassword = process.argv[3]   // nouveau mot de passe

  if (!url || !serviceKey) {
    console.error('❌ SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant.\n   export SUPABASE_URL=... && export SUPABASE_SERVICE_ROLE_KEY=...')
    process.exit(1)
  }
  if (!identifier || !newPassword) {
    console.error('Usage: node scripts/resetPassword.js <email|user_id> <newPassword>')
    process.exit(1)
  }

  // client admin (service role)
  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  // Essaie d’interpréter l’identifiant comme un UUID (user_id). Sinon, recherche par email.
  let userId = null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (uuidRe.test(identifier)) {
    userId = identifier
  } else {
    // Pas d’endpoint direct getUserByEmail, on liste et on filtre (page 1..N au besoin)
    let found = null
    let page = 1
    const perPage = 1000
    while (!found) {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
      if (error) { console.error('❌ listUsers error:', error.message); process.exit(1) }
      if (!data?.users?.length) break
      found = data.users.find(u => (u.email || '').toLowerCase() === identifier.toLowerCase())
      if (found) { userId = found.id; break }
      if (data.users.length < perPage) break
      page++
    }
    if (!userId) {
      console.error(`❌ Utilisateur introuvable pour l'email: ${identifier}`)
      process.exit(1)
    }
  }

  const { data: updated, error: updErr } = await supabase.auth.admin.updateUserById(userId, { password: newPassword })
  if (updErr) { console.error('❌ updateUserById error:', updErr.message); process.exit(1) }

  console.log(`✅ Mot de passe mis à jour pour l'utilisateur ${userId}`)
}
main()
