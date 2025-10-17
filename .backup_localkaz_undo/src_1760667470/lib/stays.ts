export type Stay = {
  id: string;
  title: string;
  commune: string;
  scoreTags: string[];
  perks: string[];
  price: number;
};

export const STAYS: Stay[] = [
  { id: "villa-lagon",   title: "Villa Lagon Azul",        commune: "Sainte-Anne",  scoreTags: ["plage","famille"],              perks: ["Clim","Piscine","5 mn plage"],            price: 110 },
  { id: "case-creole",   title: "Case Creole en foret",    commune: "Basse-Terre",  scoreTags: ["rando","aventure","nature"],    perks: ["Vue foret","Proche cascade"],              price: 85  },
  { id: "studio-mer",    title: "Studio Pied dans l Eau",  commune: "Deshaies",     scoreTags: ["plage","calme"],               perks: ["Acces direct plage"],                     price: 95  },
  { id: "famille-zen",   title: "Family Zen House",        commune: "Le Moule",     scoreTags: ["famille","culture"],           perks: ["Jardin","Lit bebe","Cuisine equipee"],    price: 100 },
  { id: "kite-breeze",   title: "Kite Breeze Lodge",       commune: "Saint-Francois", scoreTags: ["aventure","plage"],          perks: ["Local matos","Parking"],                  price: 120 }
];

export function getStayById(id: string): Stay | undefined {
  return STAYS.find(s => s.id === id);
}
