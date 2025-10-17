'use client'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type Listing = {
  id: string
  title: string | null
  price: number | null
  currency: string | null
  is_active: boolean
  is_approved: boolean
  cover_url: string | null
  created_at: string
}

function pathFromPublicUrl(url: string) {
  // public URL ressemble à: https://.../object/public/listing-images/<path>
  const marker = '/object/public/listing-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export default function HostMyListings() {
  const [items, setItems] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  async function load() {
    setErr(null); setLoading(true)
    const { data: auth } = await supabase.auth.getUser()
    const user = auth.user
    if (!user) { setErr('Non connecté'); setLoading(false); return }

    const { data, error } = await supabase
      .from('listings')
      .select('id,title,price,currency,is_active,is_approved,cover_url,created_at')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })

    if (error) { setErr(error.message); setLoading(false); return }
    setItems((data as Listing[]) || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleActive(id: string, current: boolean) {
    setErr(null)
    const { error } = await supabase.from('listings').update({ is_active: !current }).eq('id', id)
    if (error) { setErr(error.message); return }
    await load()
  }

  async function removeListing(l: Listing) {
    if (!confirm('Supprimer cette annonce ?')) return
    setErr(null)

    // 1) supprimer l'image si présente
    if (l.cover_url) {
      const path = pathFromPublicUrl(l.cover_url)
      if (path) {
        const { error: delErr } = await supabase.storage.from('listing-images').remove([path])
        if (delErr) {
          // non bloquant : on affiche l’erreur mais on tente quand même le delete DB
          console.warn('Erreur suppression image:', delErr.message)
        }
      }
    }

    // 2) supprimer la ligne DB
    const { error } = await supabase.from('listings').delete().eq('id', l.id)
    if (error) { setErr(error.message); return }
    await load()
  }

  if (loading) return <div className="p-4">Chargement…</div>
  if (err) return <div className="p-4 text-red-600">Erreur : {err}</div>

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Mes annonces</h3>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Titre</th>
              <th className="p-2 text-left">Prix</th>
              <th className="p-2 text-left">Devise</th>
              <th className="p-2 text-left">Actif</th>
              <th className="p-2 text-left">Approuvé</th>
              <th className="p-2 text-left">Créée</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(l => (
              <tr key={l.id} className="border-t">
                <td className="p-2">{l.title ?? '—'}</td>
                <td className="p-2">{l.price ?? '—'}</td>
                <td className="p-2">{l.currency ?? '—'}</td>
                <td className="p-2">{l.is_active ? 'Oui' : 'Non'}</td>
                <td className="p-2">{l.is_approved ? 'Oui' : 'Non'}</td>
                <td className="p-2">{new Date(l.created_at).toLocaleString()}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => toggleActive(l.id, l.is_active)}>
                      {l.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button className="px-2 py-1 border rounded" onClick={() => removeListing(l)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-4 text-gray-600" colSpan={7}>Aucune annonce pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Note : une annonce non approuvée par l’admin n’apparaîtra pas publiquement.</p>
    </div>
  )
}
