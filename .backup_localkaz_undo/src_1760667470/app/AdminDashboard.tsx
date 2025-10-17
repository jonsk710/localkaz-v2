import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- Supabase client (reads env from NEXT_PUBLIC_...)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [listings, setListings] = useState([])
  const [bookings, setBookings] = useState([])
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    refreshAll()
    // subscribe to realtime changes (optional)
    // return () => supabase.removeAllSubscriptions()
  }, [])

  async function refreshAll() {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([fetchUsers(), fetchListings(), fetchBookings(), fetchLogs()])
    } catch (err) {
      console.error(err)
      setError('Erreur lors du chargement des données')
    }
    setLoading(false)
  }

  // ---------- FETCHERS
  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, is_verified, created_at, user:auth.users(email)')
      .order('created_at', { ascending: false })

    if (error) throw error
    setUsers(data || [])
  }

  async function fetchListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price, currency, is_active, is_approved, created_at, host:profiles!host_id(user:auth.users(email))')
      .order('created_at', { ascending: false })

    if (error) throw error
    setListings(data || [])
  }

  async function fetchBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, listing_id, start_date, end_date, total, status, guest:auth.users(email), created_at')
      .order('start_date', { ascending: false })

    if (error) throw error
    setBookings(data || [])
  }

  async function fetchLogs() {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('id, action, details, created_at, admin:auth.users(email)')
      .order('created_at', { ascending: false })

    if (error) throw error
    setLogs(data || [])
  }

  // ---------- ACTIONS (mutations)
  async function updateUserRole(userId, newRole) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    if (error) return setError(error.message)
    await refreshAll()
  }

  async function toggleVerify(userId, isVerified) {
    const { error } = await supabase.from('profiles').update({ is_verified: !isVerified }).eq('id', userId)
    if (error) return setError(error.message)
    await refreshAll()
  }

  async function toggleListingActive(listingId, current) {
    const { error } = await supabase.from('listings').update({ is_active: !current }).eq('id', listingId)
    if (error) return setError(error.message)
    await refreshAll()
  }

  async function toggleListingApprove(listingId, current) {
    const { error } = await supabase.from('listings').update({ is_approved: !current }).eq('id', listingId)
    if (error) return setError(error.message)
    // log the action
    await supabase.from('admin_logs').insert([{ admin_id: (await getMyAdminId()), action: 'toggle_listing_approve', target_id: listingId, details: { previous: current, now: !current } }])
    await refreshAll()
  }

  async function toggleBookingStatus(bookingId, current) {
    const newStatus = current === 'confirmed' ? 'cancelled' : 'confirmed'
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId)
    if (error) return setError(error.message)
    // optional log
    await supabase.from('admin_logs').insert([{ admin_id: (await getMyAdminId()), action: 'change_booking_status', target_id: bookingId, details: { previous: current, now: newStatus } }])
    await refreshAll()
  }

  // helper: get current user's profile id (admin). In a real app use session.
  async function getMyAdminId() {
    const user = supabase.auth.getUser ? (await supabase.auth.getUser()).data.user : null
    if (!user) return users?.find(u => u.role === 'admin')?.id || null
    return user.id
  }

  // ---------- UI
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard — LocalKaz</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">Erreur: {error}</div>
      )}

      <div className="mb-6">
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded mr-2"
          onClick={() => refreshAll()}
        >
          Rafraîchir
        </button>
        <span className="text-sm text-gray-600 ml-2">{loading ? 'Chargement...' : 'Données à jour'}</span>
      </div>

      {/* Users */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Utilisateurs</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Rôle</th>
                <th className="p-2 text-left">Vérifié</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.user?.email ?? '—'}</td>
                  <td className="p-2">{u.full_name}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">{u.is_verified ? 'Oui' : 'Non'}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => updateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}>Changer rôle</button>
                      <button className="px-2 py-1 border rounded" onClick={() => toggleVerify(u.id, u.is_verified)}>{u.is_verified ? 'Dévérifier' : 'Vérifier'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Listings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Annonces</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Titre</th>
                <th className="p-2 text-left">Prix</th>
                <th className="p-2 text-left">Hôte</th>
                <th className="p-2 text-left">Actif</th>
                <th className="p-2 text-left">Approuvé</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.title}</td>
                  <td className="p-2">{l.price} {l.currency}</td>
                  <td className="p-2">{l.host?.user?.email ?? '—'}</td>
                  <td className="p-2">{l.is_active ? 'Oui' : 'Non'}</td>
                  <td className="p-2">{l.is_approved ? 'Oui' : 'Non'}</td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button className="px-2 py-1 border rounded" onClick={() => toggleListingActive(l.id, l.is_active)}>Activer/Désactiver</button>
                      <button className="px-2 py-1 border rounded" onClick={() => toggleListingApprove(l.id, l.is_approved)}>Approuver</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bookings */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Réservations</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Listing</th>
                <th className="p-2 text-left">Guest</th>
                <th className="p-2 text-left">Début</th>
                <th className="p-2 text-left">Fin</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Statut</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.listing_id}</td>
                  <td className="p-2">{b.guest?.email ?? '—'}</td>
                  <td className="p-2">{b.start_date}</td>
                  <td className="p-2">{b.end_date}</td>
                  <td className="p-2">{b.total} €</td>
                  <td className="p-2">{b.status}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 border rounded" onClick={() => toggleBookingStatus(b.id, b.status)}>Confirmer/Annuler</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Logs */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Logs Admin</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Admin</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Détails</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.admin?.email ?? '—'}</td>
                  <td className="p-2">{l.action}</td>
                  <td className="p-2">{JSON.stringify(l.details)}</td>
                  <td className="p-2">{l.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
