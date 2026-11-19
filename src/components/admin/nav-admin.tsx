"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, GraduationCap, Image as ImageIcon, LayoutDashboard, PartyPopper, Settings, Table2, Trophy } from "lucide-react";
import { cn } from "@/lib/format";

const ITEMS = [
  { href: "/admin", t: "Panel", i: LayoutDashboard },
  { href: "/admin/reservas", t: "Reservas", i: CalendarDays },
  { href: "/admin/mesas", t: "Mesas", i: Table2 },
  { href: "/admin/escuela", t: "Escuela", i: GraduationCap },
  { href: "/admin/torneos", t: "Torneos", i: Trophy },
  { href: "/admin/eventos", t: "Eventos y mensajes", i: PartyPopper },
  { href: "/admin/galeria", t: "Galería", i: ImageIcon },
  { href: "/admin/configuracion", t: "Configuración", i: Settings },
];

export function NavAdmin() {
  const p = usePathname();
  return (
    <nav aria-label="Administración" className="-mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {ITEMS.map((x) => {
        const activo = x.href === "/admin" ? p === "/admin" : p.startsWith(x.href);
        return (
          <Link
            key={x.href}
            href={x.href}
            aria-current={activo ? "page" : undefined}
            className={cn("flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition", activo ? "bg-oro/15 text-oro" : "text-marfil/65 hover:bg-marfil/5 hover:text-marfil")}
          >
            <x.i className="h-4 w-4" />{x.t}
          </Link>
        );
      })}
    </nav>
  );
}
