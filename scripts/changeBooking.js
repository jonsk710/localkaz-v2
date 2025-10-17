const client = require('./_client')
const supabase = client()

async function main() {
  const bookingId = process.argv[2]
  const newStatus = process.argv[3] || 'confirmed'
  if (!bookingId) return console.error('Usage: node scripts/changeBooking.js <bookingId> [status]')

  const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
  if (error) return console.error('❌ Erreur mise à jour réservation :', error.message)

  console.log(`✅ Réservation ${bookingId} => ${newStatus}`)
}
main()
