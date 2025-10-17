'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';

function parseCSV(input: string): string[] {
  return (input || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

export default function NewListingClient() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [commune, setCommune] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // >>> ETAPE 7 : récupérer l'utilisateur et ajouter host_id
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      alert(userErr.message);
      setLoading(false);
      return;
    }
    if (!user) {
      alert('Session expirée — reconnecte-toi.');
      setLoading(false);
      return;
    }

    const payload = {
      title,
      price: Number(price),
      commune: commune || null,
      description: description || null,
      tags: parseCSV(tags),
      photos: parseCSV(photos),
      is_published: false,
      host_id: user.id, // <<< IMPORTANT pour passer les politiques RLS
    };

    const { error } = await supabase.from('annonces').insert(payload);
    setLoading(false);
    if (error) alert(error.message);
    else router.push('/espace-hote/annonces');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 max-w-xl">
      <input className="w-full border rounded px-3 py-2" placeholder="Titre *"
        value={title} onChange={(e) => setTitle(e.target.value)} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Prix par nuit (€) *" type="number" min={0}
        value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')} required />
      <input className="w-full border rounded px-3 py-2" placeholder="Commune"
        value={commune} onChange={(e) => setCommune(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2" placeholder="Description"
        value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Tags (séparés par des virgules)" 
        value={tags} onChange={(e) => setTags(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Photos (URLs séparées par des virgules)"
        value={photos} onChange={(e) => setPhotos(e.target.value)} />
      <button className="rounded bg-black text-white px-4 py-2" disabled={loading}>
        {loading ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  );
}
