"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Phone, MapPin } from "lucide-react";
import { Monograma, IconoWhatsApp } from "@/components/icons";
import { estiloBoton } from "@/components/ui/button";
import { cn } from "@/lib/format";
import { enlaceComoLlegar, enlaceLlamar, enlaceWhatsApp } from "@/lib/whatsapp";

import { NAV } from "@/config/nav";

export function Header() {
  const pathname = usePathname();
  const [scroll, setScroll] = useState(false);
  const [abierto, setAbierto] = useState(false);

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

  const solido = scroll || abierto;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[var(--ease-club)]",
        solido ? "border-b border-marfil/10 bg-carbon/80 backdrop-blur-xl" : "bg-gradient-to-b from-carbon/70 to-transparent",
      )}
    >
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-oro focus:px-4 focus:py-2 focus:text-carbon">
        Saltar al contenido
      </a>
      <div className={cn("mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 sm:px-8 lg:px-12", solido ? "h-16" : "h-20 lg:h-24")}>
        <Link href="/" className="flex items-center gap-3 text-marfil" aria-label="Billares Guayabal, inicio">
          <Monograma className="h-9 w-9 text-oro" />
          <span className="whitespace-nowrap leading-none">
            <span className="block font-display text-xl tracking-wide">Billares Guayabal</span>
            <span className="block text-[0.6rem] uppercase tracking-[0.32em] text-marfil/55">Club · Medellín</span>
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

      <AnimatePresence>
        {abierto && (
          <motion.div
            id="menu-movil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-carbon xl:hidden"
          >
            <nav aria-label="Menú móvil" className="flex min-h-full flex-col px-6 pb-10 pt-6">
              <ul className="divide-y divide-marfil/10 border-y border-marfil/10">
                {NAV.map((n, i) => (
                  <motion.li key={n.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * i, duration: 0.4 }}>
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
    </header>
  );
}
