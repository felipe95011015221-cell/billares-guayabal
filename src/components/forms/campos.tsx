"use client";

import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/format";

export function Campo({ etiqueta, error, ayuda, children, id, className }: { etiqueta: string; error?: string; ayuda?: string; children: ReactNode; id: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] opacity-70">{etiqueta}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-[#e09080]">{error}</p>
      ) : ayuda ? (
        <p className="mt-1.5 text-xs opacity-55">{ayuda}</p>
      ) : null}
    </div>
  );
}

export const Entrada = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalido?: boolean }>(function Entrada({ className, invalido, ...p }, ref) {
  return <input ref={ref} className={cn("campo", className)} aria-invalid={invalido || undefined} aria-describedby={invalido ? `${p.id}-error` : undefined} {...p} />;
});

export const AreaTexto = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & { invalido?: boolean }>(function AreaTexto({ className, invalido, ...p }, ref) {
  return <textarea ref={ref} className={cn("campo min-h-32 resize-y", className)} aria-invalid={invalido || undefined} {...p} />;
});

export const Selector = forwardRef<HTMLSelectElement, ComponentProps<"select"> & { invalido?: boolean }>(function Selector({ className, invalido, ...p }, ref) {
  return <select ref={ref} className={cn("campo appearance-none", className)} aria-invalid={invalido || undefined} {...p} />;
});

export const Casilla = forwardRef<HTMLInputElement, ComponentProps<"input"> & { etiqueta: ReactNode; error?: string }>(function Casilla({ etiqueta, error, id, ...p }, ref) {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer gap-3 text-sm leading-relaxed opacity-80">
        <input ref={ref} id={id} type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[#c5a36a]" {...p} />
        <span>{etiqueta}</span>
      </label>
      {error && <p role="alert" className="mt-1.5 text-sm text-[#e09080]">{error}</p>}
    </div>
  );
});

/** Campo trampa para bots: oculto a personas y lectores de pantalla. */
export function Trampa(p: ComponentProps<"input">) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>No llenar <input tabIndex={-1} autoComplete="off" {...p} /></label>
    </div>
  );
}

export async function enviarJson<T>(url: string, cuerpo: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; campos?: Record<string, string> }> {
  try {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    return await r.json();
  } catch {
    return { ok: false, error: "Sin conexión. Revisa tu internet e intenta de nuevo." };
  }
}
