import Image from "next/image";
import { editarFoto, subirFoto } from "../../acciones";
import { BotonEnviar, FormAccion } from "@/components/admin/form-accion";
import { Etq, Panel, TituloAdmin, campoAdmin } from "@/components/admin/ui";
import { Insignia } from "@/components/ui/primitives";
import { repoOError } from "@/lib/data";

export default async function AdminGaleria() {
  const fotos = await repoOError().listarGaleria();
  const referencia = fotos.filter((f) => f.esReferencia).length;
  return (
    <>
      <TituloAdmin titulo="Galería" texto={`Suba fotos reales del club para reemplazar las ${referencia} fotos de referencia. Las imágenes se optimizan a WebP y se les eliminan los metadatos.`} />
      <Panel titulo="Subir foto real" className="mb-6">
        <FormAccion accion={subirFoto} className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2"><Etq>Imagen (JPG, PNG, WebP · máx. 8 MB)</Etq><input type="file" name="archivo" accept="image/jpeg,image/png,image/webp,image/avif" required className={`${campoAdmin} file:mr-3 file:rounded-full file:border-0 file:bg-oro file:px-3 file:py-1 file:text-xs file:text-carbon`} /></div>
          <div><Etq>Categoría</Etq><select name="categoria" className={campoAdmin}><option value="ambiente">Ambiente</option><option value="carambola">Carambola</option><option value="pool">Pool</option><option value="detalle">Detalle</option></select></div>
          <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="destacar" className="accent-[#c5a36a]" />Mostrar primero</label></div>
          <div className="sm:col-span-3"><Etq>Descripción (texto alternativo)</Etq><input name="alt" required minLength={5} maxLength={160} placeholder="Ej. Mesa de carambola del club con iluminación cenital" className={campoAdmin} /></div>
          <div className="flex items-end"><BotonEnviar>Subir</BotonEnviar></div>
        </FormAccion>
      </Panel>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {fotos.map((f) => (
          <li key={f.id} className="overflow-hidden rounded-xl border border-marfil/10 bg-carbon-2">
            <div className="relative aspect-[4/3]"><Image src={f.src} alt={f.alt} fill sizes="25vw" className={`object-cover ${f.visible ? "" : "opacity-30"}`} /></div>
            <div className="space-y-2 p-3 text-xs">
              <div className="flex flex-wrap gap-1.5">{f.esReferencia ? <Insignia tono="alerta">Referencia</Insignia> : <Insignia tono="ok">Real</Insignia>}<Insignia>{f.categoria}</Insignia></div>
              <p className="line-clamp-2 text-marfil/60">{f.alt}</p>
              <FormAccion accion={editarFoto} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={f.id} />
                <label className="flex items-center gap-1.5"><input type="checkbox" name="visible" defaultChecked={f.visible} className="accent-[#c5a36a]" />Visible</label>
                <input type="number" name="orden" defaultValue={f.orden} aria-label="Orden" className={`${campoAdmin} !w-16`} />
                <BotonEnviar variante="sutil">OK</BotonEnviar>
              </FormAccion>
              <FormAccion accion={editarFoto} confirmar="¿Eliminar esta foto de la galería?">
                <input type="hidden" name="id" value={f.id} /><input type="hidden" name="eliminar" value="1" />
                <BotonEnviar variante="peligro">Eliminar</BotonEnviar>
              </FormAccion>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
