import Image from "next/image";
import { cn } from "@/lib/format";

/** Escudo oficial del Club de Billares Guayabal (fondo transparente, proporción 1404×1182). */
export function Logo({ className, priority, sizes = "160px" }: { className?: string; priority?: boolean; sizes?: string }) {
  return (
    <Image
      src="/images/logo.webp"
      alt="Club de Billares Guayabal"
      width={900}
      height={758}
      priority={priority}
      sizes={sizes}
      className={cn("h-auto w-auto select-none", className)}
      draggable={false}
    />
  );
}
