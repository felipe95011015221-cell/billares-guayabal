"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { IconoWhatsApp } from "@/components/icons";
import { Logo } from "@/components/logo";
import { estiloBoton } from "@/components/ui/button";
import { cn } from "@/lib/format";
import { enlaceComoLlegar, enlaceLlamar, enlaceWhatsApp } from "@/lib/whatsapp";

import { NAV } from "@/config/nav";

export function Header() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const reducir = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScroll(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setAbierto(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  // El tamaño de la barra depende solo del scroll: abrir el menú NO debe cambiarlo
  // (antes el logo y la altura se animaban al abrir y causaban un salto visible).
  const compacto = scroll;

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        abierto
          ? "border-b border-marfil/10 bg-carbon" // opaco al instante, sin transición ni desenfoque
          : cn(
              "transition-[background-color,border-color] duration-500 ease-[var(--ease-club)]",
              scroll ? "border-b border-marfil/10 bg-carbon/80 backdrop-blur-xl" : "border-b border-transparent bg-gradient-to-b from-carbon/70 to-transparent",
            ),
      )}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-oro focus:px-4 focus:py-2 focus:text-carbon">
        Saltar al contenido
      </a>
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between px-5 transition-[height] duration-500 sm:px-8 lg:px-12", compacto ? "h-16" : "h-20 lg:h-24")}>
        <Link href="/" className="flex items-center gap-3 text-marfil" aria-label="Club de Billares Guayabal, inicio">
          <Logo priority sizes="96px" className={cn("w-auto drop-shadow-[0_4px_12px_rgb(0_0_0/0.5)] transition-[height] duration-500", compacto ? "h-11" : "h-14 lg:h-16")} />
          <span className="whitespace-nowrap leading-none">
            <span className="block text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-oro">Club de Billares</span>
            <span className="mt-0.5 block font-display text-2xl tracking-wide">Guayabal</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="hidden xl:block">
          <ul className="flex items-center gap-7">
            {NAV.map((n) => {
              const activo = pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={activo ? "page" : undefined}
                    className={cn(
                      "relative whitespace-nowrap py-2 text-[0.78rem] font-medium uppercase tracking-[0.16em] transition-colors",
                      activo ? "text-oro" : "text-marfil/75 hover:text-marfil",
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-oro after:transition-transform after:duration-500 hover:after:scale-x-100",
                      activo && "after:scale-x-100",
                    )}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/reservas" className={estiloBoton("oro", "sm", "hidden whitespace-nowrap sm:inline-flex")}>
            Reservar mesa
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-marfil/20 text-marfil xl:hidden"
            aria-expanded={abierto}
            aria-controls="menu-movil"
            aria-label={abierto ? "Cerrar menú" : "Abrir menú"}
          >
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </header>

      {/* El panel va FUERA del <header>: el desenfoque (backdrop-filter) del encabezado
          convertiría al encabezado en el contenedor del panel fijo y lo dejaría con altura 0. */}
      <AnimatePresence>
        {abierto && (
          // Panel 100% opaco desde el primer cuadro: baja como una cortina (recorte), sin
          // fundido de opacidad, para que nunca se vea la página "a través" del menú.
          <motion.div
            id="menu-movil"
            initial={reducir ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={reducir ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reducir ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[45] overflow-y-auto overscroll-contain bg-carbon will-change-[clip-path] xl:hidden"
          >
            <nav aria-label="Menú móvil" className="flex min-h-full flex-col px-6 pb-10 pt-24">
              <ul className="divide-y divide-marfil/10 border-y border-marfil/10">
                {NAV.map((n, i) => (
                  <motion.li key={n.href} initial={reducir ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + 0.035 * i, duration: 0.35 }}>
                    <Link href={n.href} className={cn("flex items-center justify-between py-4 font-display text-3xl", pathname.startsWith(n.href) ? "text-oro" : "text-marfil")}>
                      {n.label}
                      <span className="text-xs font-sans tracking-[0.2em] text-marfil/40">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-8 grid gap-3">
                <Link href="/reservas" className={estiloBoton("oro", "lg", "w-full")}>Reservar una mesa</Link>
                <div className="grid grid-cols-3 gap-3">
                  <a href={enlaceWhatsApp("general")} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 rounded-xl border border-marfil/15 py-4 text-xs uppercase tracking-[0.14em] text-marfil/80">
                    <IconoWhatsApp className="h-5 w-5 text-oro" /> WhatsApp
                  </a>
                  <a href={enlaceLlamar()} className="flex flex-col items-center gap-2 rounded-xl border border-marfil/15 py-4 text-xs uppercase tracking-[0.14em] text-marfil/80">
                    <Phone className="h-5 w-5 text-oro" /> Llamar
                  </a>
                  <a href={enlaceComoLlegar()} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 rounded-xl border border-marfil/15 py-4 text-xs uppercase tracking-[0.14em] text-marfil/80">
                    <MapPin className="h-5 w-5 text-oro" /> Llegar
                  </a>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
