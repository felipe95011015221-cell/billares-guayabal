import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/format";

type Variante = "oro" | "contorno" | "fantasma" | "verde" | "oscuro";
type Tamaño = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[0.08em] uppercase transition-all duration-300 ease-[var(--ease-club)] disabled:opacity-50 disabled:pointer-events-none select-none";

const variantes: Record<Variante, string> = {
  oro: "bg-oro text-carbon hover:bg-oro-claro shadow-[0_10px_30px_-12px_rgb(197_163_106/0.6)] hover:shadow-[0_14px_40px_-12px_rgb(197_163_106/0.8)] hover:-translate-y-0.5",
  contorno: "border border-marfil/35 text-marfil hover:border-oro hover:text-oro backdrop-blur-sm",
  fantasma: "text-marfil/80 hover:text-oro",
  verde: "bg-verde text-marfil hover:bg-verde-2 hover:-translate-y-0.5",
  oscuro: "bg-carbon text-marfil hover:bg-carbon-3 hover:-translate-y-0.5",
};

const tamaños: Record<Tamaño, string> = {
  sm: "h-10 px-5 text-[0.7rem]",
  md: "h-12 px-7 text-[0.74rem]",
  lg: "h-14 px-9 text-[0.78rem]",
};

export function estiloBoton(variante: Variante = "oro", tamaño: Tamaño = "md", extra?: string) {
  return cn(base, variantes[variante], tamaños[tamaño], extra);
}

export function Boton({ variante, tamaño, className, ...p }: ComponentProps<"button"> & { variante?: Variante; tamaño?: Tamaño }) {
  return <button className={estiloBoton(variante, tamaño, className)} {...p} />;
}

export function BotonLink({
  href, variante, tamaño, className, children, externo, ...p
}: { href: string; variante?: Variante; tamaño?: Tamaño; className?: string; children: ReactNode; externo?: boolean } & Omit<ComponentProps<"a">, "href">) {
  if (externo || href.startsWith("http") || href.startsWith("tel:"))
    return (
      <a href={href} className={estiloBoton(variante, tamaño, className)} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...p}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={estiloBoton(variante, tamaño, className)} {...p}>
      {children}
    </Link>
  );
}
