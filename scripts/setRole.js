const client = require('./_client')
const supabase = client()

async function main() {
  const email = process.argv[2]
  const newRole = process.argv[3] || 'user'
  if (!email) return console.error('Usage: node scripts/setRole.js <email> <role>')

  const { data: u, error: e1 } = await supabase.from('profiles').select('id').ilike('full_name', `%${email}%`).single()
  if (e1 || !u) return console.error('❌ Utilisateur introuvable :', e1?.message || 'no user')

  const { error: e2 } = await supabase.from('profiles').update({ role: newRole }).eq('id', u.id)
  if (e2) return console.error('❌ Erreur modification rôle :', e2.message)

  console.log(`✅ Rôle modifié : ${email} => ${newRole}`)
}
main()
