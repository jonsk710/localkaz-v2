
import Link from "next/link";

function pickImage(it:any): string | null {
  const keys = ["cover_url","image_url","cover","coverUrl","thumbnail_url","thumbnail","image"];
  for (const k of keys) if (it?.[k]) return String(it[k]);
  if (Array.isArray(it?.photos) && it.photos[0]) return String(it.photos[0]);
  return null;
}

type Props = { item: any; hrefBase?: string };
export default function ListingCard({ item, hrefBase = "/annonce" }: Props) {
  const id = item?.id ?? "#";
  const title = item?.title ?? "Annonce";
  const price = item?.price ?? null; const currency = item?.currency ?? "EUR";
  const img = pickImage(item);
  return (
    <Link href={`${hrefBase}/${id}`} className="block rounded-2xl border shadow-sm hover:shadow-md transition p-3 bg-white">
      {img ? (<img src={img} alt={title} className="w-full h-40 object-cover rounded-xl mb-3"/>) : (
        <div className="w-full h-40 rounded-xl bg-gray-100 mb-3 flex items-center justify-center text-gray-400">Aperçu</div>
      )}
      <div className="font-semibold text-gray-900 truncate">{title}</div>
      <div className="text-sm text-gray-600 mt-1">{price!=null? `${price} ${currency}` : "Prix sur demande"}</div>
    </Link>
  );
}
