import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Monograma } from "@/components/icons";
import { Contenedor } from "@/components/ui/primitives";
import { enlaceComoLlegar, enlaceLlamar, enlaceWhatsApp } from "@/lib/whatsapp";
import { NAV } from "@/config/nav";

export function Footer() {
  const pendiente = (estado: string) => (estado === "confirmado" ? null : <span className="ml-1 text-[0.65rem] uppercase tracking-[0.14em] text-oro/70">(por confirmar)</span>);
  return (
    <footer className="relative border-t border-marfil/10 bg-carbon pb-28 pt-20 text-marfil lg:pb-12">
      <Contenedor>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <Monograma className="h-11 w-11 text-oro" />
              <span className="font-display text-3xl">Billares Guayabal</span>
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-marfil/60">
              Carambola a tres bandas y pool en Guayabal, Medellín. Un lugar para jugar, competir, aprender y compartir.
            </p>
          </div>

          <nav aria-label="Pie de página" className="lg:col-span-3">
            <p className="eyebrow mb-5">Explora</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-marfil/70">
              {NAV.map((n) => (
                <li key={n.href}><Link href={n.href} className="transition-colors hover:text-oro">{n.label}</Link></li>
              ))}
              <li><Link href="/reservas/consultar" className="transition-colors hover:text-oro">Mi reserva</Link></li>
            </ul>
          </nav>

          <address className="not-italic lg:col-span-4">
            <p className="eyebrow mb-5">Visítanos</p>
            <ul className="space-y-4 text-sm text-marfil/75">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />
                <a href={enlaceComoLlegar()} target="_blank" rel="noopener noreferrer" className="hover:text-oro">
                  {siteConfig.direccion.valor}{pendiente(siteConfig.direccion.estado)}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />
                <span>
                  <a href={enlaceLlamar()} className="hover:text-oro">{siteConfig.telefono.valor}</a> ·{" "}
                  <a href={enlaceWhatsApp()} target="_blank" rel="noopener noreferrer" className="hover:text-oro">WhatsApp</a>
                  {pendiente(siteConfig.telefono.estado)}
                </span>
              </li>
              <li className="flex gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />
                <span>{siteConfig.horario.valor}{pendiente(siteConfig.horario.estado)}</span>
              </li>
            </ul>
          </address>
        </div>

        <div className="linea-oro my-12" />
        <div className="flex flex-col gap-4 text-xs text-marfil/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.nombreCorto}. Medellín, Colombia.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacidad" className="hover:text-oro">Tratamiento de datos</Link>
            <Link href="/creditos" className="hover:text-oro">Créditos fotográficos</Link>
            <Link href="/admin" className="hover:text-oro" rel="nofollow">Acceso administración</Link>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-[0.7rem] leading-relaxed text-marfil/35">
          Las fotografías del sitio son imágenes de referencia de bancos gratuitos (Unsplash y Pexels) y no corresponden a las instalaciones del club.
        </p>
      </Contenedor>
    </footer>
  );
}
