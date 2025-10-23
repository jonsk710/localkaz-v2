"use client";
export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <section style={{padding:20,border:"1px solid #fca5a5",background:"#fef2f2",fontFamily:"system-ui"}}>
      <h2 style={{fontWeight:700}}>Erreur dans /espace-hote/messages/[id]</h2>
      <pre style={{whiteSpace:"pre-wrap"}}>{error?.message || String(error)}</pre>
      {error?.digest && <div>Digest: {error.digest}</div>}
    </section>
  );
}
