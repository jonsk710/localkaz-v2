const client = require('./_client')
const supabase = client()

async function main() {
  const listingId = process.argv[2]
  const field = process.argv[3] || 'is_active' // ou 'is_approved'
  if (!listingId) return console.error('Usage: node scripts/toggleListing.js <listingId> [is_active|is_approved]')

  const { data: l, error: e1 } = await supabase.from('listings').select('id, is_active, is_approved').eq('id', listingId).single()
  if (e1 || !l) return console.error('❌ Annonce introuvable :', e1?.message || 'no listing')

  const newValue = !l[field]
  const { error: e2 } = await supabase.from('listings').update({ [field]: newValue }).eq('id', listingId)
  if (e2) return console.error('❌ Erreur mise à jour :', e2.message)

  console.log(`✅ ${field} pour ${listingId} : ${l[field]} → ${newValue}`)
}
main()
