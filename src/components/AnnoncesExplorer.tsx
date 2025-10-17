import Image from "next/image";
import Link from "next/link";
import React from "react";

export type Annonce = {
  id: string;
  title: string;
  price: number;
  commune: string;
  photos?: string[];
  tags?: string[];
};

type Props = { annonces: Annonce[] };

export default function AnnoncesExplorer({ annonces }: Props) {
  if (!annonces?.length) {
    return <p className="text-gray-500">Aucune annonce pour le moment.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {annonces.map((a) => {
        const cover =
          a.photos?.[0] ||
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

        return (
          <Link
            key={a.id}
            href={`/logement/${a.id}`}
            className="group rounded-2xl border overflow-hidden hover:shadow-md transition"
          >
            <div className="relative h-48 w-full">
              <Image
                src={cover}
                alt={a.title}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                priority={false}
              />
            </div>

            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium leading-tight line-clamp-1">{a.title}</h3>
                <span className="text-sm font-semibold whitespace-nowrap">
                  {a.price} € / nuit
                </span>
              </div>
              <p className="text-sm text-gray-500">{a.commune}</p>
              {a.tags?.length ? (
                <div className="flex flex-wrap gap-1 pt-1">
                  {a.tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
