"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Aparición suave al hacer scroll. Usa transform/opacity (GPU) y respeta prefers-reduced-motion. */
export function Reveal({
  children, delay = 0, y = 24, className, as = "div",
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "article" }) {
  const reducir = useReducedMotion();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={reducir ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
