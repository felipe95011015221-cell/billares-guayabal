import Link from "next/link";
import { estiloBoton } from "@/components/ui/button";

export default function NoEncontrado() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-carbon px-6 text-center text-marfil">
      <p className="eyebrow mb-6">Error 404</p>
      <h1 className="font-display text-6xl sm:text-8xl">Bola fuera de la mesa.</h1>
      <p className="mt-6 max-w-md text-marfil/65">La página que buscas no existe o cambió de lugar.</p>
      <Link href="/" className={estiloBoton("oro", "lg", "mt-10")}>Volver al inicio</Link>
    </main>
  );
}
