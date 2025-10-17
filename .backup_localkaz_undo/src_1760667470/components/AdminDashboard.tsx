'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type UserRow = { id:string; email:string|null; full_name:string|null; role:string|null; is_verified:boolean; created_at:string }
type ListingRow = { id:string; title:string|null; price:number|null; currency:string; is_active:boolean; is_approved:boolean; created_at:string; host_id:string|null; host_email:string|null; host_name:string|null }
type BookingRow = { id:string; listing_id:string; listing_title:string|null; host_id:string|null; host_email:string|null; host_name:string|null; guest_id:string|null; guest_email:string|null; start_date:string; end_date:string; total:number|null; status:string; created_at:string }
type LogRow = { id:string; admin_id:string|null; action:string|null; details:any; created_at:string }

export default function AdminDashboard() {
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState<string|null>(null)
  const [users,setUsers]=useState<UserRow[]>([])
  const [listings,setListings]=useState<ListingRow[]>([])
  const [bookings,setBookings]=useState<BookingRow[]>([])
  const [logs,setLogs]=useState<LogRow[]>([])
  const [isAdmin,setIsAdmin]=useState(false)

  async function loadAll() {
    setErr(null); setLoading(true)
    try {
      // garde d’accès côté client (middleware désactivé en dev)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setIsAdmin(false); setLoading(false); return }
      const { data: role, error: roleErr } = await supabase.rpc('get_my_role')
      if (roleErr) throw roleErr
      setIsAdmin(role === 'admin')

      const [u, l, b, lg] = await Promise.all([
        supabase.rpc('admin_user_overview'),
        supabase.rpc('admin_listing_overview'),
        supabase.rpc('admin_booking_overview'),
        supabase.from('admin_logs').select('*').order('created_at', { ascending:false }).limit(100)
      ])

      if (u.error) throw u.error
      if (l.error) throw l.error
      if (b.error) throw b.error
      if (lg.error) throw lg.error

      setUsers(u.data || [])
      setListings(l.data || [])
      setBookings(b.data || [])
      setLogs((lg.data as any) || [])
    } catch(e:any) {
      console.error(e)
      setErr(e?.message ?? String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ loadAll() }, [])

  async function signOut(){
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard — LocalKaz</h1>
        <div className="flex gap-2">
          <button onClick={loadAll} className="px-3 py-2 rounded border">Rafraîchir</button>
          <button onClick={signOut} className="px-3 py-2 rounded bg-black text-white">Se déconnecter</button>
        </div>
      </div>

      {err && <div className="mb-4 p-3 rounded bg-red-100 text-red-700">{err}</div>}
      <span className="text-sm text-gray-600 block mb-4">{loading ? 'Chargement…' : 'Prêt'}</span>
      {!isAdmin && <div className="mb-4 p-3 rounded bg-yellow-100">Accès réservé aux admins (connecte-toi avec le compte admin).</div>}

      {/* UTILISATEURS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Utilisateurs</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Nom</th>
                <th className="p-2 text-left">Rôle</th>
                <th className="p-2 text-left">Vérifié</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id} className="border-t">
                  <td className="p-2">{u.id.slice(0,8)}…</td>
                  <td className="p-2">{u.email ?? '—'}</td>
                  <td className="p-2">{u.full_name ?? '—'}</td>
                  <td className="p-2">{u.role ?? '—'}</td>
                  <td className="p-2">{u.is_verified ? '✅' : '—'}</td>
                </tr>
              ))}
              {users.length===0 && <tr><td className="p-2" colSpan={5}>Aucun utilisateur</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* ANNONCES */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Annonces</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Titre</th>
                <th className="p-2 text-left">Prix</th>
                <th className="p-2 text-left">Devise</th>
                <th className="p-2 text-left">Hôte</th>
                <th className="p-2 text-left">Actif</th>
                <th className="p-2 text-left">Approuvé</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l=>(
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.title ?? '—'}</td>
                  <td className="p-2">{l.price ?? '—'}</td>
                  <td className="p-2">{l.currency}</td>
                  <td className="p-2">{l.host_email ?? l.host_name ?? (l.host_id ? l.host_id.slice(0,8)+'…' : '—')}</td>
                  <td className="p-2">{l.is_active ? '✅' : '—'}</td>
                  <td className="p-2">{l.is_approved ? '✅' : '—'}</td>
                </tr>
              ))}
              {listings.length===0 && <tr><td className="p-2" colSpan={6}>Aucune annonce</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* RÉSERVATIONS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Réservations</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Listing</th>
                <th className="p-2 text-left">Hôte</th>
                <th className="p-2 text-left">Guest</th>
                <th className="p-2 text-left">Début</th>
                <th className="p-2 text-left">Fin</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Statut</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b=>(
                <tr key={b.id} className="border-t">
                  <td className="p-2">{b.listing_title ?? (b.listing_id?.slice(0,8)+'…')}</td>
                  <td className="p-2">{b.host_email ?? b.host_name ?? (b.host_id ? b.host_id.slice(0,8)+'…' : '—')}</td>
                  <td className="p-2">{b.guest_email ?? (b.guest_id ? b.guest_id.slice(0,8)+'…' : '—')}</td>
                  <td className="p-2">{b.start_date}</td>
                  <td className="p-2">{b.end_date}</td>
                  <td className="p-2">{b.total ?? '—'}</td>
                  <td className="p-2">{b.status}</td>
                </tr>
              ))}
              {bookings.length===0 && <tr><td className="p-2" colSpan={7}>Aucune réservation</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {/* LOGS */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Logs Admin</h2>
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Admin</th>
                <th className="p-2 text-left">Action</th>
                <th className="p-2 text-left">Détails</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l=>(
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.admin_id ? l.admin_id.slice(0,8)+'…' : '—'}</td>
                  <td className="p-2">{l.action ?? '—'}</td>
                  <td className="p-2"><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(l.details)}</pre></td>
                  <td className="p-2">{l.created_at}</td>
                </tr>
              ))}
              {logs.length===0 && <tr><td className="p-2" colSpan={4}>Aucun log</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
