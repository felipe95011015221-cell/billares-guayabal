"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { fotos } from "@/config/images";
import { estiloBoton } from "@/components/ui/button";
import { Logo } from "@/components/logo";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const ref = useRef<HTMLElement>(null);
  const reducir = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reducir ? "0%" : "18%"]);
  const opacidad = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const palabras = titulo.split(" ");

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-carbon pb-20 pt-32 sm:items-center sm:pb-0">
      <motion.div style={{ y }} className="absolute inset-0 -z-10">
        <motion.div
          initial={reducir ? false : { scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease }}
          className="absolute inset-0"
        >
          <Image src={fotos.heroSalon.src} alt={fotos.heroSalon.alt} fill priority sizes="100vw" className="object-cover object-[60%_center]" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/40 to-carbon/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-carbon/85 via-carbon/30 to-transparent" />
      </motion.div>

      <motion.div style={{ opacity: opacidad }} className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14 lg:px-12">
        <div>
        {/* Escudo del club: arriba del título en celular */}
        <motion.div
          initial={reducir ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.1, ease }}
          className="mb-8 lg:hidden"
        >
          <Logo priority sizes="160px" className="h-32 w-auto drop-shadow-[0_12px_30px_rgb(0_0_0/0.6)] sm:h-40" />
        </motion.div>
        <motion.p
          initial={reducir ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease }}
          className="eyebrow mb-8"
        >
          Club de Billares Guayabal · Medellín
        </motion.p>

        <h1 className="max-w-5xl font-display text-[clamp(3rem,9vw,7rem)] font-medium uppercase leading-[0.88] tracking-[-0.02em]">
          {palabras.map((p, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className={i === palabras.length - 1 ? "inline-block italic text-oro normal-case" : "inline-block"}
                initial={reducir ? false : { y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.35 + i * 0.08, ease }}
              >
                {p}
              </motion.span>
              {i < palabras.length - 1 && " "}
            </span>
          ))}
        </h1>

        <motion.p
          initial={reducir ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.95, ease }}
          className="mt-8 max-w-xl text-base leading-relaxed text-marfil/80 sm:text-lg"
        >
          {subtitulo}
        </motion.p>

        <motion.div
          initial={reducir ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.15, ease }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
        >
          <Link href="/reservas" className={estiloBoton("oro", "lg")}>Reservar una mesa</Link>
          <Link href="/club" className={estiloBoton("contorno", "lg")}>Explorar el club</Link>
        </motion.div>
        </div>

        {/* Escudo del club: columna derecha en escritorio */}
        <motion.div
          initial={reducir ? false : { opacity: 0, scale: 0.92, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease }}
          className="relative hidden lg:block"
        >
          <div className="absolute inset-8 -z-10 rounded-full bg-oro/15 blur-3xl" aria-hidden />
          <Logo priority sizes="420px" className="h-auto w-[clamp(300px,30vw,420px)] drop-shadow-[0_30px_60px_rgb(0_0_0/0.7)]" />
        </motion.div>
      </motion.div>

      <motion.a
        href="#club"
        aria-label="Bajar a la presentación del club"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-[0.62rem] uppercase tracking-[0.3em] text-marfil/50 sm:flex"
      >
        Descubrir
        <ArrowDown className="h-4 w-4 animate-bounce text-oro" />
      </motion.a>

      <span className="pointer-events-none absolute bottom-3 right-4 text-[0.58rem] uppercase tracking-[0.16em] text-marfil/40">Foto de referencia</span>
    </section>
  );
}
