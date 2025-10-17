export default function LoadingAnnonce() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded" />
      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <div className="aspect-[16/10] rounded-2xl bg-gray-200" />
          <div className="grid grid-cols-5 gap-2 mt-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>
        </div>
        <aside className="md:col-span-2 space-y-3">
          <div className="h-6 bg-gray-200 rounded" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded-2xl" />
        </aside>
      </div>
      <div className="h-40 bg-gray-200 rounded-2xl" />
    </main>
  );
}
