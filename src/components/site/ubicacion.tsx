import { MapPin, Navigation, Phone, Clock } from "lucide-react";
import { siteConfig } from "@/config/site";
import { IconoWhatsApp } from "@/components/icons";
import { BotonLink } from "@/components/ui/button";
import { Aviso } from "@/components/ui/primitives";
import { enlaceComoLlegar, enlaceLlamar, enlaceMapa, enlaceMapaEmbebido, enlaceWhatsApp } from "@/lib/whatsapp";

/** Bloque de ubicación con mapa interactivo y accesos directos. */
export function Ubicacion({ compacto = false }: { compacto?: boolean }) {
  const porConfirmar = [siteConfig.direccion, siteConfig.telefono, siteConfig.horario].some((d) => d.estado !== "confirmado");
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <dl className="space-y-7">
          <div>
            <dt className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] opacity-60"><MapPin className="h-4 w-4 text-oro-oscuro" />Dirección</dt>
            <dd className="mt-2 font-display text-3xl leading-tight">{siteConfig.direccion.valor}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] opacity-60"><Phone className="h-4 w-4 text-oro-oscuro" />Teléfono y WhatsApp</dt>
            <dd className="mt-2 text-lg"><a href={enlaceLlamar()} className="underline-offset-4 hover:underline">{siteConfig.telefono.valor}</a></dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] opacity-60"><Clock className="h-4 w-4 text-oro-oscuro" />Horario</dt>
            <dd className="mt-2 text-lg">{siteConfig.horario.valor} <span className="text-sm opacity-60">(por confirmar)</span></dd>
          </div>
        </dl>
        <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <BotonLink href={enlaceComoLlegar()} variante="verde" tamaño="md"><Navigation className="h-4 w-4" />Cómo llegar</BotonLink>
          <BotonLink href={enlaceLlamar()} variante="oscuro" tamaño="md"><Phone className="h-4 w-4" />Llamar</BotonLink>
          <BotonLink href={enlaceWhatsApp("ubicacion")} variante="oscuro" tamaño="md"><IconoWhatsApp className="h-4 w-4" />WhatsApp</BotonLink>
        </div>
        {porConfirmar && !compacto && (
          <Aviso className="mt-8 text-carbon/80">
            Dirección, teléfono y horario provienen de fuentes públicas y están pendientes de validación por el club. Antes de tu visita, confírmalos por WhatsApp.
          </Aviso>
        )}
      </div>
      <div className="lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-carbon/10 bg-marfil-2 shadow-[0_40px_80px_-50px_rgb(17_23_20/0.6)] lg:aspect-auto lg:h-full lg:min-h-[440px]">
          <iframe
            title={`Mapa de ubicación de ${siteConfig.nombreCorto}`}
            src={enlaceMapaEmbebido()}
            className="absolute inset-0 h-full w-full grayscale-[35%] contrast-[1.05]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <a href={enlaceMapa()} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs underline-offset-4 opacity-60 hover:underline">
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
}
