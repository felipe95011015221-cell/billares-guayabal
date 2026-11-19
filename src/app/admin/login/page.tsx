import type { Metadata } from "next";
import { Monograma } from "@/components/icons";
import { FormLogin } from "./form-login";
import { estadoAuth } from "@/lib/auth";

export const metadata: Metadata = { title: "Acceso administración", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const estado = estadoAuth();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-carbon px-5 py-16 text-marfil">
      <div className="w-full max-w-sm">
        <Monograma className="mx-auto h-14 w-14 text-oro" />
        <h1 className="mt-6 text-center font-display text-4xl">Administración</h1>
        <p className="mt-2 text-center text-sm text-marfil/50">Billares Guayabal</p>
        {estado.disponible ? (
          <>
            {estado.metodo === "demo" && <p className="mt-6 rounded-lg border border-alerta/40 bg-alerta/10 p-3 text-xs text-alerta">Modo demostración local. Las credenciales están en su archivo .env.local.</p>}
            <FormLogin />
          </>
        ) : (
          <div className="mt-8 rounded-xl border border-alerta/40 bg-alerta/10 p-4 text-sm">
            <p className="font-semibold text-alerta">Acceso no configurado</p>
            <p className="mt-2 text-marfil/70">{estado.motivo}</p>
            <p className="mt-2 text-marfil/50">Consulte el README para la configuración.</p>
          </div>
        )}
      </div>
    </main>
  );
}
