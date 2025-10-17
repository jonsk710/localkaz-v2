'use client'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function HostOnly({ children }: PropsWithChildren) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [allowed, setAllowed] = useState<boolean>(false)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true); setErr(null)
      const { data } = await supabase.auth.getUser()
      const u = data.user ?? null
      setUser(u)
      if (!u) { setAllowed(false); setLoading(false); return }
      const { data: role, error } = await supabase.rpc('get_my_role')
      if (error) { setErr(error.message); setAllowed(false) }
      else setAllowed(role === 'host' || role === 'admin')
      setLoading(false)
    })()
  }, [])

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); setLoading(false); return }
    setUser(data.user)
    const { data: role, error: rErr } = await supabase.rpc('get_my_role')
    if (rErr) { setErr(rErr.message); setAllowed(false) }
    else setAllowed(role === 'host' || role === 'admin')
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setAllowed(false)
    router.push('/login')
  }

  if (loading) return <div className="p-4">Chargement…</div>

  // Pas connecté → formulaire host
  if (!user) {
    return (
      <div className="p-6 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Espace hôte — Connexion</h1>
        {err && <div className="mb-3 p-3 rounded bg-red-100 text-red-700">{err}</div>}
        <form onSubmit={signIn} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input className="w-full border rounded px-3 py-2" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm mb-1">Mot de passe</label>
            <input className="w-full border rounded px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button disabled={loading} className="px-3 py-2 rounded bg-black text-white w-full">
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    )
  }

  // Connecté : petite barre d’actions avec Déconnexion (visible même si accès refusé)
  const Toolbar = (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm text-gray-600">Connecté</span>
      <button onClick={signOut} className="px-3 py-2 rounded bg-black text-white">Se déconnecter</button>
    </div>
  )

  if (!allowed) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        {Toolbar}
        <h1 className="text-2xl font-bold mb-2">Espace hôte</h1>
        <p>Accès réservé aux hôtes.</p>
        {err && <p className="text-red-600 mt-2">Détail : {err}</p>}
      </div>
    )
  }

  // OK (host/admin) → contenu + barre
  return (
    <div className="p-6">
      {Toolbar}
      {children}
    </div>
  )
}
