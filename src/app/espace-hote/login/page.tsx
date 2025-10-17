'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

export default function HostLoginPage() {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password: pwd });
        if (error) throw error;
        alert('Compte créé. Tu peux te connecter.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
        router.push('/espace-hote');
      }
    } catch (err:any) {
      alert(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-4">
      <h1 className="text-2xl font-bold">{mode === 'login' ? 'Connexion hôte' : 'Créer un compte hôte'}</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email}
               onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe (min. 6)"
               value={pwd} onChange={e=>setPwd(e.target.value)} required />
        <button className="rounded bg-black text-white px-4 py-2" disabled={loading}>
          {loading ? '...' : (mode === 'login' ? 'Se connecter' : 'Créer le compte')}
        </button>
      </form>
      <button className="text-sm underline" onClick={() => setMode(mode==='login'?'signup':'login')}>
        {mode === 'login' ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Se connecter"}
      </button>
    </main>
  );
}
