/**
 * Registro de fotografías de referencia.
 * IMPORTANTE: son fotografías de bancos gratuitos y NO muestran las instalaciones reales
 * de Billares Guayabal. La web las identifica como "Fotografía de referencia".
 * Reemplácelas por fotos reales desde /admin/galeria cuando estén disponibles.
 */
export type CategoriaFoto = "pool" | "carambola" | "ambiente" | "detalle";

export interface FotoReferencia {
  id: string;
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  categoria: CategoriaFoto;
  autor: string;
  fuente: "Unsplash" | "Pexels";
  urlFuente: string;
  licencia: string;
  urlLicencia: string;
}

const UNSPLASH = { licencia: "Licencia Unsplash", urlLicencia: "https://unsplash.com/license", fuente: "Unsplash" as const };
const PEXELS = { licencia: "Licencia Pexels", urlLicencia: "https://www.pexels.com/license/", fuente: "Pexels" as const };

export const fotos = {
  heroSalon: {
    id: "hero-salon", src: "/images/hero-salon.webp", ancho: 2400, alto: 1600, categoria: "ambiente",
    alt: "Salón de billar en penumbra con bolas y un taco sobre el paño",
    autor: "Wecko Helios", urlFuente: "https://unsplash.com/photos/DObE_YU6oks", ...UNSPLASH,
  },
  jugadorPool: {
    id: "jugador-pool", src: "/images/jugador-pool.webp", ancho: 2400, alto: 1600, categoria: "pool",
    alt: "Jugador preparando un tiro sobre una mesa de pool",
    autor: "Klara Kulikova", urlFuente: "https://unsplash.com/photos/DUcVepObkXk", ...UNSPLASH,
  },
  bolasBokeh: {
    id: "bolas-bokeh", src: "/images/bolas-bokeh.webp", ancho: 2400, alto: 1600, categoria: "pool",
    alt: "Bolas de pool en primer plano con luces cálidas al fondo",
    autor: "Christian Wiediger", urlFuente: "https://unsplash.com/photos/QnDhG4nNCVQ", ...UNSPLASH,
  },
  tresBolas: {
    id: "tres-bolas", src: "/images/tres-bolas.webp", ancho: 1600, alto: 2387, categoria: "detalle",
    alt: "Tres bolas junto a la buchaca de una mesa de fieltro verde",
    autor: "Maximilian Bungart", urlFuente: "https://unsplash.com/photos/S4iH6Yso6cs", ...UNSPLASH,
  },
  tiroMesaVerde: {
    id: "tiro-mesa-verde", src: "/images/tiro-mesa-verde.webp", ancho: 2400, alto: 1600, categoria: "pool",
    alt: "Vista cenital de un tiro con taco sobre una mesa verde",
    autor: "cal gao", urlFuente: "https://unsplash.com/photos/yV5awvq2hiI", ...UNSPLASH,
  },
  manoTaco: {
    id: "mano-taco", src: "/images/mano-taco.webp", ancho: 1600, alto: 2413, categoria: "detalle",
    alt: "Mano formando el puente con el taco frente a la bola blanca",
    autor: "Valeria Kodra", urlFuente: "https://unsplash.com/photos/2SiUvKOT6Cg", ...UNSPLASH,
  },
  trianguloBolas: {
    id: "triangulo-bolas", src: "/images/triangulo-bolas.webp", ancho: 2400, alto: 1600, categoria: "detalle",
    alt: "Bolas numeradas ordenadas dentro de un triángulo de madera",
    autor: "gladys rovetta", urlFuente: "https://unsplash.com/photos/Xpo7AhoJdNM", ...UNSPLASH,
  },
  mesaAzulTacos: {
    id: "mesa-azul-tacos", src: "/images/mesa-azul-tacos.webp", ancho: 2400, alto: 1800, categoria: "detalle",
    alt: "Mesa de paño azul con dos tacos y el triángulo armado",
    autor: "Saint Rambo", urlFuente: "https://unsplash.com/photos/BhvoOhQMv5I", ...UNSPLASH,
  },
  trianguloTacos: {
    id: "triangulo-tacos", src: "/images/triangulo-tacos.webp", ancho: 2400, alto: 1537, categoria: "detalle",
    alt: "Tacos cruzados sobre el triángulo de bolas listo para el saque",
    autor: "Marcelo Leal", urlFuente: "https://unsplash.com/photos/6UeBe2HqziA", ...UNSPLASH,
  },
  salonMesas: {
    id: "salon-mesas", src: "/images/salon-mesas.webp", ancho: 2400, alto: 1600, categoria: "ambiente",
    alt: "Hilera de mesas de billar iluminadas en un salón oscuro",
    autor: "Vazha Despotashvili", urlFuente: "https://www.pexels.com/photo/blue-billiard-tables-6032656/", ...PEXELS,
  },
  jugadorSalon: {
    id: "jugador-salon", src: "/images/jugador-salon.webp", ancho: 2400, alto: 1600, categoria: "ambiente",
    alt: "Jugador apuntando en una mesa grande bajo lámparas colgantes",
    autor: "Tima Miroshnichenko", urlFuente: "https://www.pexels.com/photo/a-man-playing-billiard-6254197/", ...PEXELS,
  },
} satisfies Record<string, FotoReferencia>;

export const listaFotos: FotoReferencia[] = Object.values(fotos);
