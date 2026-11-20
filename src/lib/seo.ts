import type { Metadata } from "next";
import { siteConfig, esConfirmado } from "@/config/site";
import { fotos } from "@/config/images";

export function metadatos({ titulo, descripcion, ruta, imagen = fotos.heroSalon.src }: { titulo: string; descripcion: string; ruta: string; imagen?: string }): Metadata {
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: ruta,
      siteName: siteConfig.nombreCorto,
      title: `${titulo} · ${siteConfig.nombreCorto}`,
      description: descripcion,
      images: [{ url: imagen, width: 2400, height: 1600, alt: "Fotografía de referencia de billar" }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: descripcion, images: [imagen] },
  };
}

/**
 * Datos estructurados LocalBusiness.
 * SOLO incluye datos con estado "confirmado" en src/config/site.ts.
 * Mientras dirección, teléfono y horario estén "por confirmar", no se publican aquí.
 */
export function jsonLdNegocio() {
  const c = siteConfig;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name: c.nombre.valor,
    url: c.url,
    areaServed: { "@type": "City", name: "Medellín" },
    sport: "Billiards",
    logo: `${c.url.replace(/\/$/, "")}/images/logo.png`,
  };
  if (esConfirmado(c.direccion))
    data.address = { "@type": "PostalAddress", streetAddress: c.direccion.valor, addressLocality: c.ciudad.valor, addressRegion: c.region, addressCountry: c.pais };
  else if (esConfirmado(c.ciudad))
    data.address = { "@type": "PostalAddress", addressLocality: c.ciudad.valor, addressRegion: c.region, addressCountry: c.pais };
  if (esConfirmado(c.telefono)) data.telephone = c.telefono.valor;
  if (esConfirmado(c.horario))
    data.openingHoursSpecification = [{
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00", closes: "02:00",
    }];
  if (esConfirmado(c.correo) && c.correo.valor) data.email = c.correo.valor;
  return data;
}
