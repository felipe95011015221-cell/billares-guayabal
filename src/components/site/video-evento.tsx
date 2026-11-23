"use client";

import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { VideoClub } from "@/config/videos";
import { cn } from "@/lib/format";

/**
 * Video vertical con portada. No descarga el video (≈24 MB) hasta que la persona
 * pulsa «play» (preload="none"), para que la página siga cargando rápido en el celular.
 */
export function VideoEvento({ video, className }: { video: VideoClub; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reproduciendo, setReproduciendo] = useState(false);

  const reproducir = () => {
    setReproduciendo(true);
    void ref.current?.play();
  };

  return (
    <div
      className={cn("relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-oro/25 bg-carbon shadow-[0_40px_80px_-40px_rgb(0_0_0/0.8)]", className)}
      style={{ aspectRatio: `${video.ancho} / ${video.alto}` }}
    >
      <video
        ref={ref}
        src={video.src}
        poster={video.portada}
        preload="none"
        playsInline
        controls={reproduciendo}
        onPlay={() => setReproduciendo(true)}
        className="absolute inset-0 h-full w-full object-cover"
        aria-label={`${video.titulo} · ${video.fecha}`}
      />
      {!reproduciendo && (
        <button
          type="button"
          onClick={reproducir}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-t from-carbon/80 via-carbon/10 to-carbon/20 text-marfil"
          aria-label="Reproducir el video del evento"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-oro text-carbon shadow-[0_10px_40px_-8px_rgb(197_163_106/0.8)] transition-transform duration-300 group-hover:scale-105">
            <Play className="ml-1 h-8 w-8 fill-current" />
          </span>
          <span className="absolute inset-x-0 bottom-5 text-center text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-marfil/85">
            Ver video · 1:52
          </span>
        </button>
      )}
    </div>
  );
}
