"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { IconoWhatsApp } from "@/components/icons";
import { enlaceComoLlegar, enlaceWhatsApp, type ContextoWhatsApp } from "@/lib/whatsapp";

function contextoDeRuta(p: string): ContextoWhatsApp {
  if (p.startsWith("/reservas")) return "reservas";
  if (p.startsWith("/escuela")) return "clases";
  if (p.startsWith("/torneos")) return "torneos";
  if (p.startsWith("/eventos")) return "eventos";
  if (p.startsWith("/contacto")) return "ubicacion";
  return "general";
}

/** Botón flotante de WhatsApp (mensaje según la sección) + barra inferior móvil con reservas y ubicación. */
export function AccionesFlotantes() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const ctx = contextoDeRuta(pathname);
  const enReservas = pathname.startsWith("/reservas");

  return (
    <>
      <a
        href={enlaceWhatsApp(ctx)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escríbenos por WhatsApp"
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1f8f55] text-white shadow-[0_12px_30px_-8px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:scale-105 lg:bottom-8 lg:right-8"
      >
        <IconoWhatsApp className="h-7 w-7" />
      </a>

      {/* Barra inferior: solo móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-marfil/10 bg-carbon/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex gap-3">
          <a
            href={enlaceComoLlegar()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-14 shrink-0 items-center justify-center rounded-full border border-marfil/20 text-oro"
            aria-label="Cómo llegar"
          >
            <MapPin className="h-5 w-5" />
          </a>
          {enReservas ? (
            <Link href="/reservas/consultar" className="flex h-12 flex-1 items-center justify-center rounded-full border border-oro/50 text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-oro">
              Consultar mi reserva
            </Link>
          ) : (
            <Link href="/reservas" className="flex h-12 flex-1 items-center justify-center rounded-full bg-oro text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-carbon">
              Reservar una mesa
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
