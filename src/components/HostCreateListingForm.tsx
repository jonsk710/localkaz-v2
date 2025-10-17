'use client'
import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function HostCreateListingForm() {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [currency, setCurrency] = useState<'EUR'|'USD'|'XPF'>('EUR')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setOk(null); setLoading(true)
    try {
      // 1) user
      const { data: auth } = await supabase.auth.getUser()
      const user = auth.user
      if (!user) throw new Error('Vous devez être connecté.')

      // 2) upload image (optionnel) dans listing-images sous {userId}/...
      let cover_url: string | null = null
      if (file) {
        const path = `${user.id}/${Date.now()}-${file.name}`
        const { error: upErr } = await supabase
          .storage.from('listing-images')
          .upload(path, file, { cacheControl: '3600', upsert: false })
        if (upErr) throw upErr
        const { data: pub } = supabase.storage.from('listing-images').getPublicUrl(path)
        cover_url = pub.publicUrl
      }

      // 3) insert dans listings (RLS: host_id doit être auth.uid())
      const { error: insErr } = await supabase.from('listings').insert({
        title,
        price: price === '' ? null : Number(price),
        currency,
        description,
        cover_url,
        host_id: user.id,
        is_active: true,
        is_approved: false
      })
      if (insErr) throw insErr

      setOk('Annonce créée ✅')
      setTitle(''); setPrice(''); setDescription(''); setFile(null)
    } catch (e:any) {
      setErr(e.message ?? 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 p-4 border rounded">
      <h3 className="font-semibold text-lg">Créer une annonce</h3>

      {err && <div className="p-3 rounded bg-red-100 text-red-700">{err}</div>}
      {ok && <div className="p-3 rounded bg-green-100 text-green-700">{ok}</div>}

      <div>
        <label className="block text-sm mb-1">Titre</label>
        <input className="w-full border rounded px-3 py-2" value={title} onChange={e=>setTitle(e.target.value)} required />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block text-sm mb-1">Prix</label>
          <input className="w-full border rounded px-3 py-2" type="number" min="0" step="1"
            value={price} onChange={e=>setPrice(e.target.value === '' ? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-sm mb-1">Devise</label>
          <select className="border rounded px-3 py-2" value={currency} onChange={e=>setCurrency(e.target.value as any)}>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="XPF">XPF</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description</label>
        <textarea className="w-full border rounded px-3 py-2" rows={4} value={description} onChange={e=>setDescription(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm mb-1">Image (optionnel)</label>
        <input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
      </div>

      <button disabled={loading} className="px-3 py-2 rounded bg-black text-white">
        {loading ? 'Création…' : 'Créer l’annonce'}
      </button>
    </form>
  )
}
