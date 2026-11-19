"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { accionLogin } from "../acciones";

function Enviar() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-oro text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-carbon disabled:opacity-60">
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}Ingresar
    </button>
  );
}

export function FormLogin() {
  const [estado, accion] = useActionState(accionLogin, null);
  return (
    <form action={accion} className="mt-8 space-y-4">
      <div>
        <label htmlFor="correo" className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-marfil/60">Correo</label>
        <input id="correo" name="correo" type="email" autoComplete="username" required className="campo" />
      </div>
      <div>
        <label htmlFor="clave" className="mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-marfil/60">Contraseña</label>
        <input id="clave" name="clave" type="password" autoComplete="current-password" required className="campo" />
      </div>
      {estado && !estado.ok && <p role="alert" className="text-sm text-[#e09080]">{estado.mensaje}</p>}
      <Enviar />
    </form>
  );
}
