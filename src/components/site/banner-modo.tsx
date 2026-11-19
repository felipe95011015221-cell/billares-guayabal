import { modoDatos } from "@/lib/env";
import { Contenedor } from "@/components/ui/primitives";

/** Indica claramente cuando el sitio funciona en modo demostración o sin base de datos. */
export function BannerModo() {
  const modo = modoDatos();
  if (modo === "supabase") return null;
  return (
    <div className="border-t border-alerta/30 bg-alerta/10 py-4 text-sm text-marfil">
      <Contenedor>
        {modo === "demo" ? (
          <p>
            <strong className="text-alerta">Modo demostración.</strong> Las reservas, inscripciones y solicitudes se guardan en un archivo local con datos
            ficticios. No llegan al club. Para activar producción, configure Supabase (ver README).
          </p>
        ) : (
          <p>
            <strong className="text-alerta">Reservas en línea en preparación.</strong> Mientras tanto, reserva o pregunta por WhatsApp.
          </p>
        )}
      </Contenedor>
    </div>
  );
}
