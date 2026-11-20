import type { Metadata } from "next";
import Link from "next/link";
import { LogOut, ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";
import { NavAdmin } from "@/components/admin/nav-admin";
import { requerirAdmin } from "@/lib/auth";
import { modoDatos } from "@/lib/env";
import { accionLogout } from "../acciones";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const sesion = await requerirAdmin(); // segunda barrera (además del middleware)
  const modo = modoDatos();
  return (
    <div className="min-h-dvh bg-carbon text-marfil">
      {modo === "demo" && (
        <div className="bg-alerta/15 px-4 py-2 text-center text-xs text-alerta">Modo demostración · datos ficticios guardados en .data/demo-db.json</div>
      )}
      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[230px_1fr] lg:gap-10 lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
          <div className="flex items-center justify-between lg:block">
            <Link href="/admin" className="flex items-center gap-3">
              <Logo className="h-11 w-auto" sizes="80px" />
              <span className="font-display text-xl leading-none">Guayabal<span className="block text-[0.6rem] font-sans uppercase tracking-[0.24em] text-marfil/45">Administración</span></span>
            </Link>
            <form action={accionLogout} className="lg:hidden">
              <button className="flex items-center gap-2 text-xs text-marfil/60"><LogOut className="h-4 w-4" />Salir</button>
            </form>
          </div>
          <div className="mt-6 lg:mt-10"><NavAdmin /></div>
          <div className="mt-10 hidden space-y-3 border-t border-marfil/10 pt-6 text-xs text-marfil/50 lg:block">
            <p>{sesion.nombre}</p>
            <Link href="/" target="_blank" className="flex items-center gap-2 hover:text-oro"><ExternalLink className="h-3.5 w-3.5" />Ver sitio</Link>
            <form action={accionLogout}><button className="flex items-center gap-2 hover:text-oro"><LogOut className="h-3.5 w-3.5" />Cerrar sesión</button></form>
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
