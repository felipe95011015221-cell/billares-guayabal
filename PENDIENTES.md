# Datos empresariales pendientes por confirmar

Nada de lo siguiente debe publicarse como dato oficial hasta que el propietario lo valide. Al confirmar un dato, actualícelo en `src/config/site.ts` (cambie `estado` a `"confirmado"`) o en el panel `/admin`.

## Datos de contacto y ubicación

| Dato | Valor actual | Estado | Nota |
|---|---|---|---|
| Nombre comercial | Club de Billares Guayabal | Por validar | ¿Razón social y NIT? (necesarios para la política de datos) |
| Dirección | Carrera 52 #9-17, Guayabal, Medellín | Por validar | Dato del brief. Una búsqueda web (19 nov. 2026) **no lo pudo contrastar** con otra fuente. Confirmar también el pin de Google Maps. |
| Teléfono / WhatsApp | +57 314 773 0533 | Por validar | Confirmar que es línea de WhatsApp Business del club. |
| Horario | Todos los días, 9:00 a. m. – 2:00 a. m. | Por validar | ¿Varía en festivos o fines de semana? |
| Correo electrónico | — | Falta | |
| Instagram / Facebook | — | Falta | |
| Ficha de Google Business Profile | — | Falta | Clave para el SEO local. |

## Operación

- [ ] **Inventario real de mesas**: cantidad, modalidad (carambola / pool) y nombres. Hoy hay 6 mesas **de ejemplo** (4 carambola + 2 pool).
- [ ] **Tarifas por hora** de cada tipo de mesa (COP). Hoy: "Tarifa por confirmar".
- [ ] **Política de reservas**: tiempo de tolerancia, cancelación, anticipo y número máximo de jugadores por mesa.
- [ ] Modo de confirmación: **manual** (actual) o automático.
- [ ] Duraciones permitidas (actual: 1 h, 1 h 30, 2 h, 3 h) y anticipación (actual: 60 min mínimo, 30 días máximo).

## Escuela

- [ ] ¿El club ofrecerá clases? Los 6 programas son **propuestas** (se muestran como "Propuesta · por confirmar").
- [ ] Instructores (nombre y perfil), precios, cupos y horarios reales.
- [ ] Marcar cada programa como "Confirmada" en `/admin/escuela` cuando se apruebe.

## Torneos y eventos

- [ ] Calendario real de torneos, reglamento, valores de inscripción y premios. Hoy **no hay torneos publicados** en producción.
- [ ] Capacidad máxima del local para eventos privados y paquetes/valores.

## Legal y marca

- [ ] Política de tratamiento de datos (Ley 1581 de 2012): responsable, NIT, canal de atención. El texto en `/privacidad` es un borrador.
- [ ] Logotipo oficial (hoy se usa un monograma "BG" provisional).
- [ ] Fotografías reales del local, en especial de las mesas de carambola.
- [ ] Dominio definitivo (para `NEXT_PUBLIC_SITE_URL`).

## Integraciones

- [ ] Proyecto Supabase y usuario administrador (ver README).
- [ ] ID de Google Analytics 4 (`NEXT_PUBLIC_GA_ID`).
- [ ] (Opcional) Proveedor de correo o WhatsApp Business API para notificaciones automáticas.
