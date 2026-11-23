/**
 * Videos reales del club. Para agregar otro evento, copie el .mp4 a /public/videos,
 * cree una portada (un cuadro del video en .webp) y agréguelo aquí.
 */
export interface VideoClub {
  id: string;
  src: string;
  portada: string;
  ancho: number;
  alto: number;
  fecha: string; // texto visible
  titulo: string;
  descripcion: string;
}

export const videoEventoNoviembre: VideoClub = {
  id: "evento-2026-11-21",
  src: "/videos/evento-2026-11-21.mp4",
  portada: "/videos/evento-2026-11-21-portada.webp",
  ancho: 478,
  alto: 850,
  fecha: "Sábado 21 de noviembre de 2026",
  titulo: "Así se vivió nuestro último evento",
  descripcion:
    "Buena comida, partidas en todas las mesas, la barra llena y mucha gente compartiendo. Ese es el ambiente del Club de Billares Guayabal: respeto, buena actitud y amor por el billar.",
};
