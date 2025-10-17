'use client'
import React from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ForbiddenPage() {
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-2">Accès refusé</h1>
      <p className="mb-6">Vous n’avez pas les droits pour accéder à cette page.</p>
      <div className="flex gap-2 justify-center">
        <button onClick={() => router.push('/')}
                className="px-3 py-2 rounded border">Retour à l’accueil</button>
        <button onClick={signOut}
                className="px-3 py-2 rounded bg-black text-white">Se déconnecter</button>
      </div>
    </div>
  )
}
