"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";
import type { EstadoAccion } from "@/app/admin/acciones";

type Accion = (prev: EstadoAccion, f: FormData) => Promise<EstadoAccion>;

/** Formulario de administración con mensaje de resultado (éxito/error) del servidor. */
export function FormAccion({ accion, children, className, confirmar }: { accion: Accion; children: ReactNode; className?: string; confirmar?: string }) {
  const [estado, ejecutar] = useActionState(accion, null);
  return (
    <form
      action={ejecutar}
      className={className}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      {children}
      {estado && (
        <p role="status" className={cn("mt-2 text-xs", estado.ok ? "text-[#8fd0ad]" : "text-[#e09080]")}>{estado.mensaje}</p>
      )}
    </form>
  );
}

export function BotonEnviar({ children, variante = "oro", className, name, value }: { children: ReactNode; variante?: "oro" | "sutil" | "peligro" | "verde"; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  const estilos = {
    oro: "bg-oro text-carbon hover:bg-oro-claro",
    verde: "bg-verde text-marfil hover:bg-verde-2",
    sutil: "border border-marfil/15 text-marfil/80 hover:border-oro hover:text-oro",
    peligro: "border border-error/40 text-[#e09080] hover:bg-error/10",
  };
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={cn("inline-flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[0.68rem] font-semibold uppercase tracking-[0.1em] transition disabled:opacity-50", estilos[variante], className)}>
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
