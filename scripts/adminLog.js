const client = require('./_client')
const supabase = client()

async function main() {
  const adminName = process.argv[2]
  const action = process.argv[3] || 'manual_log'
  const details = process.argv[4] || '{}'
  if (!adminName) return console.error('Usage: node scripts/adminLog.js <adminName> [action] [detailsJson]')

  const { data: u, error: e1 } = await supabase.from('profiles').select('id').ilike('full_name', `%${adminName}%`).single()
  if (e1 || !u) return console.error('❌ Admin introuvable :', e1?.message || 'no admin')

  let parsed
  try { parsed = JSON.parse(details) } catch { parsed = { note: details } }

  const { error: e2 } = await supabase.from('admin_logs').insert([{ admin_id: u.id, action, details: parsed }])
  if (e2) return console.error('❌ Erreur ajout log :', e2.message)

  console.log(`✅ Log ajouté : ${action} (${adminName})`)
}
main()
