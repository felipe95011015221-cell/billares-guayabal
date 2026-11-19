# Club de Billares Guayabal — sitio web y plataforma de gestión

Sitio web premium para **Club de Billares Guayabal** (Medellín, Colombia) con reservas de mesas en línea, escuela de billar, torneos, solicitudes de eventos, galería y un panel administrativo protegido.

> **Estado:** funcional en **modo demostración** local. Para producción falta conectar Supabase y validar los datos del negocio (ver [`PENDIENTES.md`](PENDIENTES.md)).

---

## Tecnología

| Capa | Herramienta |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 4 (tokens propios de marca), componentes propios |
| Animación | Motion (Framer Motion), respeta `prefers-reduced-motion` |
| Formularios | React Hook Form + Zod (validación en cliente **y** servidor) |
| Datos / auth | Supabase (PostgreSQL + Auth + Storage) |
| Íconos | Lucide |
| Pruebas | Vitest |
| Despliegue | Vercel |

Tipografías: **Cormorant Garamond** (títulos) y **Manrope** (texto), vía `next/font/google`.
Paleta: carbón `#111714`, verde billar `#164B37`, dorado `#C5A36A`, marfil `#F2EBDD`.

> No se usó la CLI de shadcn/ui (es interactiva); los componentes base (`src/components/ui`) siguen el mismo enfoque: primitivas propias, accesibles y con Tailwind.

---

## Instalación local

Requisitos: **Node.js 20+** (probado con 24 LTS).

```bash
npm install
```

```bash
cp .env.example .env.local
```

Edite `.env.local` y defina como mínimo `ADMIN_SESSION_SECRET` (32+ caracteres). Para entrar al panel en modo demostración defina también `ADMIN_DEMO_EMAIL` y `ADMIN_DEMO_PASSWORD` (10+ caracteres).

```bash
npm run dev
```

Abra http://localhost:3000. El panel está en http://localhost:3000/admin.

### Modos de datos

| Modo | Cuándo | Qué pasa |
|---|---|---|
| **Supabase** | Están `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` | Persistencia real en PostgreSQL. |
| **Demostración** | Sin Supabase, en desarrollo | Datos ficticios en `.data/demo-db.json`. La web muestra un aviso visible. Borre ese archivo para reiniciar los datos. |
| **Inactivo** | Sin Supabase, en producción | Los formularios **no** simulan funcionar: muestran un mensaje y remiten a WhatsApp. |

---

## Pruebas y verificación

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run lint
```

```bash
npm run build
```

Las pruebas unitarias (`tests/`) cubren el motor de disponibilidad: solapamientos, reservas contiguas, prioridad de estados, horario hasta las 2:00 a. m., anticipación mínima, franjas libres, zona horaria de Bogotá, códigos y validación de celulares.

Verificación manual realizada en desarrollo:
- Flujo completo de reserva (modalidad → fecha → hora → mesa → datos → código) con estado **"Solicitud pendiente de confirmación"**.
- 6 solicitudes simultáneas para la misma mesa y hora → **1 aceptada, 5 rechazadas (409)**.
- Inscripción a clase con 1 cupo → la segunda solicitud recibe "No quedan cupos".
- Inscripción duplicada a torneo, evento con fecha pasada, honeypot anti-spam y consulta de reserva con celular incorrecto → rechazados.
- `/admin/*` sin sesión o con cookie falsificada → redirige a `/admin/login`.

---

## Despliegue en producción (Vercel + Supabase)

1. **Cree un proyecto en Supabase** (región recomendada: São Paulo).
2. En *SQL Editor*, ejecute en orden:
   - `supabase/migrations/0001_esquema_inicial.sql` (tablas, restricción anti-solapamiento, funciones atómicas, RLS y bucket `galeria`).
   - `supabase/seed.sql` (mesas de ejemplo y programas propuestos, **sin** datos ficticios de clientes).
3. **Cree el usuario administrador:** *Authentication → Users → Add user* (correo + contraseña segura). Copie su UUID y ejecute:
   ```sql
   insert into admin_usuarios (user_id, nombre) values ('UUID-DEL-USUARIO', 'Propietario');
   ```
4. **Importe el repositorio en Vercel** y configure las variables de entorno de `.env.example` (sin `ADMIN_DEMO_*`).
5. Despliegue. Verifique `/admin/configuracion → Integraciones`.
6. En Google Search Console, registre el dominio y envíe `https://su-dominio/sitemap.xml`.

### Seguridad implementada

- **Doble reserva imposible a nivel de base de datos:** restricción `EXCLUDE USING gist (mesa_id WITH =, tstzrange(inicio, fin) WITH &&)` para reservas activas, más la función `crear_reserva` que bloquea la fila de la mesa y revisa bloqueos. La disponibilidad se recalcula en el servidor al confirmar.
- **RLS activado en todas las tablas sin políticas públicas**: el navegador nunca accede directo a la base de datos; solo el servidor (clave `service_role`, nunca expuesta).
- **Panel protegido en dos capas** (middleware + verificación en cada página/acción) con cookie `httpOnly` firmada (HMAC-SHA256, 8 h). Sin credenciales por defecto.
- Validación Zod en servidor para todos los formularios, límite de envíos por IP, campo trampa anti-bots, consulta de reservas que exige código **y** celular.
- Fotos subidas: se convierten a WebP y se les eliminan los metadatos EXIF (ubicación, cámara).
- Cabeceras `X-Frame-Options`, `X-Content-Type-Options` y `Referrer-Policy`.

### Limitaciones conocidas

- **Notificaciones automáticas** (correo/WhatsApp al cliente o al club) no están implementadas: requieren un proveedor (p. ej. Resend para correo o la API de WhatsApp Business). Hoy el cliente puede "Avisar al club" por WhatsApp con un mensaje prellenado, y el club ve las solicitudes en el panel.
- **Pagos en línea** (inscripciones, reservas) no están implementados.
- El **límite de envíos por IP** vive en memoria: en Vercel es orientativo por instancia. Para algo estricto use Upstash Redis o similar.
- Los **datos estructurados (Schema.org)** solo publican campos marcados como `confirmado` en `src/config/site.ts`. Hoy solo incluyen nombre y ciudad.

---

## Estructura

```
src/
  app/
    (sitio)/            Páginas públicas: inicio, club, reservas, escuela, torneos, eventos, galería, contacto…
    admin/              Login, panel y acciones de servidor (acciones.ts)
    api/                Disponibilidad, reservas, consulta y formularios públicos
    sitemap.ts, robots.ts
  components/
    ui/                 Botones, secciones, insignias, avisos, foto con etiqueta "referencia", animaciones
    site/               Header, footer, acciones flotantes, tarjetas, galería, ubicación, cuadro de torneo
    forms/              Asistente de reservas, calendario táctil, inscripciones, eventos, contacto
    admin/              Componentes del panel
  config/
    site.ts             ★ Datos del negocio con su estado de verificación
    images.ts           ★ Registro de fotos (autor, fuente, licencia)
  lib/
    availability.ts     Motor de disponibilidad (puro y probado)
    data/               Repositorio: demo-store (archivo) y supabase-store
    auth.ts, session.ts Autenticación del panel
    validation.ts       Esquemas Zod
    whatsapp.ts         Enlaces de WhatsApp contextuales, llamada y mapas
supabase/               Migración SQL y semilla
public/images/          Fotografías de referencia optimizadas (WebP)
tests/                  Pruebas Vitest
```

### Cómo actualizar los datos del negocio

- **Dirección, teléfono, horario, redes, correo:** `src/config/site.ts`. Cambie `estado: "publico"` por `"confirmado"` cuando el propietario lo valide (así entra en los datos estructurados y desaparece la nota "por confirmar").
- **Tarifas, mesas, clases, horarios, torneos, políticas, textos del inicio:** desde el panel `/admin`.
- **Fotos reales:** `/admin/galeria`.

---

## Fotografías

Ver [`LICENCIAS-FOTOS.md`](LICENCIAS-FOTOS.md). Todas son **fotos de referencia** de Unsplash/Pexels con licencia de uso comercial; la web las rotula como tales y **no** representan las instalaciones del club.
