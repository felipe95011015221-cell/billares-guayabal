import { siteConfig } from "@/config/site";

export type ContextoWhatsApp = "general" | "reservas" | "clases" | "torneos" | "eventos" | "ubicacion";

const MENSAJES: Record<ContextoWhatsApp, string> = {
  general: "Hola, Billares Guayabal. Quisiera más información sobre el club.",
  reservas: "Hola, Billares Guayabal. Quisiera reservar una mesa. ¿Me ayudan con la disponibilidad?",
  clases: "Hola, Billares Guayabal. Me interesan las clases de billar. ¿Qué programas y horarios tienen?",
  torneos: "Hola, Billares Guayabal. Quisiera información sobre los próximos torneos y cómo inscribirme.",
  eventos: "Hola, Billares Guayabal. Quisiera cotizar un evento en el club.",
  ubicacion: "Hola, Billares Guayabal. ¿Me confirman la dirección y cómo llegar?",
};

export function enlaceWhatsApp(contexto: ContextoWhatsApp = "general", textoExtra?: string): string {
  const texto = textoExtra ? `${MENSAJES[contexto]}\n\n${textoExtra}` : MENSAJES[contexto];
  return `https://wa.me/${siteConfig.telefonoE164}?text=${encodeURIComponent(texto)}`;
}

/** Enlace para COMPARTIR (sin destinatario): el usuario elige a quién enviarlo. */
export function enlaceCompartirWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

export const enlaceLlamar = () => `tel:+${siteConfig.telefonoE164}`;
export const enlaceMapa = () => `https://www.google.com/maps/search/?api=1&query=${siteConfig.mapaConsulta}`;
export const enlaceComoLlegar = () => `https://www.google.com/maps/dir/?api=1&destination=${siteConfig.mapaConsulta}`;
export const enlaceMapaEmbebido = () => `https://www.google.com/maps?q=${siteConfig.mapaConsulta}&output=embed`;
