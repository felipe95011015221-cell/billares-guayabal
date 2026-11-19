-- =====================================================================
-- Club de Billares Guayabal — Esquema inicial
-- Ejecutar en Supabase (SQL editor) o con `supabase db push`.
-- Seguridad: RLS activado en TODAS las tablas y SIN políticas para anon/authenticated.
-- Solo el servidor (service_role, nunca expuesto al navegador) lee y escribe.
-- =====================================================================

create extension if not exists btree_gist;
create extension if not exists pgcrypto;

-- ---------- Ajustes (fila única) ----------
create table if not exists ajustes (
  id smallint primary key default 1 check (id = 1),
  datos jsonb not null default '{}'::jsonb,
  actualizado_en timestamptz not null default now()
);

-- ---------- Administradores ----------
-- Vincula usuarios de Supabase Auth con permiso de administración.
create table if not exists admin_usuarios (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  creado_en timestamptz not null default now()
);

-- ---------- Mesas ----------
create table if not exists mesas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  modalidad text not null check (modalidad in ('carambola', 'pool')),
  tarifa_hora integer check (tarifa_hora is null or tarifa_hora >= 0),
  activa boolean not null default true,
  mantenimiento boolean not null default false,
  notas text,
  orden integer not null default 0
);

-- ---------- Bloqueos de horario ----------
create table if not exists bloqueos (
  id uuid primary key default gen_random_uuid(),
  mesa_id uuid not null references mesas (id) on delete cascade,
  inicio timestamptz not null,
  fin timestamptz not null check (fin > inicio),
  tipo text not null default 'bloqueo' check (tipo in ('bloqueo', 'ocupada', 'mantenimiento')),
  motivo text
);
create index if not exists bloqueos_mesa_rango on bloqueos using gist (mesa_id, tstzrange(inicio, fin));

-- ---------- Reservas ----------
create table if not exists reservas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  mesa_id uuid not null references mesas (id),
  modalidad text not null check (modalidad in ('carambola', 'pool')),
  inicio timestamptz not null,
  fin timestamptz not null check (fin > inicio),
  nombre text not null,
  celular text not null,
  correo text not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmada', 'en_curso', 'finalizada', 'cancelada', 'rechazada')),
  valor_estimado integer,
  observaciones text,
  historial jsonb not null default '[]'::jsonb,
  creada_en timestamptz not null default now(),
  -- GARANTÍA ANTI-DOBLE RESERVA: dos reservas activas no pueden solaparse en la misma mesa,
  -- aunque lleguen en el mismo milisegundo.
  constraint reservas_sin_solapamiento exclude using gist (
    mesa_id with =,
    tstzrange(inicio, fin, '[)') with &&
  ) where (estado in ('pendiente', 'confirmada', 'en_curso'))
);
create index if not exists reservas_inicio on reservas (inicio);

-- ---------- Escuela ----------
create table if not exists instructores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  bio text,
  activo boolean not null default true
);

create table if not exists clases (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  titulo text not null,
  descripcion text not null default '',
  modalidad text not null check (modalidad in ('carambola', 'pool', 'ambas')),
  nivel text not null,
  duracion_min integer not null check (duracion_min > 0),
  instructor_id uuid references instructores (id) on delete set null,
  precio integer check (precio is null or precio >= 0),
  confirmada boolean not null default false,
  activa boolean not null default true
);

create table if not exists sesiones_clase (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid not null references clases (id) on delete cascade,
  inicio timestamptz not null,
  cupos integer not null check (cupos > 0)
);

create table if not exists inscripciones_clase (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  sesion_id uuid not null references sesiones_clase (id) on delete cascade,
  clase_id uuid not null references clases (id) on delete cascade,
  nombre text not null,
  celular text not null,
  correo text not null,
  nivel_declarado text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada')),
  creada_en timestamptz not null default now()
);
create unique index if not exists inscripcion_clase_unica on inscripciones_clase (sesion_id, celular) where estado <> 'cancelada';

-- ---------- Torneos ----------
create table if not exists torneos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  modalidad text not null check (modalidad in ('carambola', 'pool')),
  fecha timestamptz not null,
  formato text not null default '',
  requisitos text not null default '',
  valor_inscripcion integer,
  cupos integer not null check (cupos > 0),
  estado text not null default 'borrador'
    check (estado in ('borrador', 'inscripciones_abiertas', 'inscripciones_cerradas', 'en_juego', 'finalizado', 'cancelado')),
  descripcion text not null default '',
  publicado boolean not null default false
);

create table if not exists inscripciones_torneo (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  torneo_id uuid not null references torneos (id) on delete cascade,
  nombre text not null,
  celular text not null,
  correo text not null,
  documento text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmada', 'cancelada')),
  creada_en timestamptz not null default now()
);
create unique index if not exists inscripcion_torneo_unica on inscripciones_torneo (torneo_id, celular) where estado <> 'cancelada';

create table if not exists partidos (
  id uuid primary key default gen_random_uuid(),
  torneo_id uuid not null references torneos (id) on delete cascade,
  ronda integer not null,
  orden integer not null,
  jugador_a text,
  jugador_b text,
  marcador_a integer,
  marcador_b integer,
  ganador text check (ganador in ('A', 'B'))
);

-- ---------- Eventos y contacto ----------
create table if not exists solicitudes_evento (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('privado', 'empresarial', 'celebracion', 'recreativo', 'grupal')),
  fecha date not null,
  participantes integer not null check (participantes > 0),
  nombre text not null,
  celular text not null,
  correo text not null,
  empresa text,
  mensaje text,
  estado text not null default 'nueva' check (estado in ('nueva', 'en_revision', 'aprobada', 'rechazada', 'cerrada')),
  notas text,
  creada_en timestamptz not null default now()
);

create table if not exists mensajes_contacto (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  celular text,
  correo text not null,
  asunto text not null,
  mensaje text not null,
  leido boolean not null default false,
  creado_en timestamptz not null default now()
);

-- ---------- Galería ----------
create table if not exists galeria (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null,
  categoria text not null check (categoria in ('pool', 'carambola', 'ambiente', 'detalle')),
  ancho integer not null default 1600,
  alto integer not null default 1067,
  es_referencia boolean not null default false,
  credito text,
  url_credito text,
  orden integer not null default 0,
  visible boolean not null default true
);

-- ---------- Seguridad: RLS sin políticas públicas ----------
alter table ajustes enable row level security;
alter table admin_usuarios enable row level security;
alter table mesas enable row level security;
alter table bloqueos enable row level security;
alter table reservas enable row level security;
alter table instructores enable row level security;
alter table clases enable row level security;
alter table sesiones_clase enable row level security;
alter table inscripciones_clase enable row level security;
alter table torneos enable row level security;
alter table inscripciones_torneo enable row level security;
alter table partidos enable row level security;
alter table solicitudes_evento enable row level security;
alter table mensajes_contacto enable row level security;
alter table galeria enable row level security;

-- =====================================================================
-- Funciones atómicas (llamadas solo desde el servidor con service_role)
-- =====================================================================

-- Crea una reserva re-verificando bloqueos y solapamientos bajo bloqueo de fila de la mesa.
create or replace function crear_reserva(
  p_codigo text, p_mesa_id uuid, p_modalidad text, p_inicio timestamptz, p_fin timestamptz,
  p_nombre text, p_celular text, p_correo text, p_estado text, p_valor integer, p_historial jsonb
) returns reservas
language plpgsql security definer set search_path = public as $$
declare
  v_mesa mesas;
  v_res reservas;
begin
  select * into v_mesa from mesas where id = p_mesa_id for update;
  if not found or v_mesa.modalidad <> p_modalidad then
    raise exception 'MESA_NO_ENCONTRADA';
  end if;
  if not v_mesa.activa or v_mesa.mantenimiento then
    raise exception 'MESA_NO_DISPONIBLE';
  end if;
  if exists (select 1 from bloqueos b where b.mesa_id = p_mesa_id and tstzrange(b.inicio, b.fin) && tstzrange(p_inicio, p_fin)) then
    raise exception 'MESA_NO_DISPONIBLE';
  end if;
  insert into reservas (codigo, mesa_id, modalidad, inicio, fin, nombre, celular, correo, estado, valor_estimado, historial)
  values (p_codigo, p_mesa_id, p_modalidad, p_inicio, p_fin, p_nombre, p_celular, p_correo, p_estado, p_valor, p_historial)
  returning * into v_res;
  return v_res;
exception
  when exclusion_violation then raise exception 'MESA_NO_DISPONIBLE';
end $$;

-- Inscribe en una sesión de clase verificando cupos bajo bloqueo.
create or replace function inscribir_clase(
  p_codigo text, p_sesion_id uuid, p_nombre text, p_celular text, p_correo text, p_nivel text
) returns inscripciones_clase
language plpgsql security definer set search_path = public as $$
declare
  v_sesion sesiones_clase;
  v_clase clases;
  v_ocupados integer;
  v_ins inscripciones_clase;
begin
  select * into v_sesion from sesiones_clase where id = p_sesion_id for update;
  if not found then raise exception 'NO_ENCONTRADO'; end if;
  select * into v_clase from clases where id = v_sesion.clase_id;
  if not v_clase.activa then raise exception 'NO_ENCONTRADO'; end if;
  if v_sesion.inicio < now() then raise exception 'SESION_PASADA'; end if;
  select count(*) into v_ocupados from inscripciones_clase where sesion_id = p_sesion_id and estado <> 'cancelada';
  if v_ocupados >= v_sesion.cupos then raise exception 'SIN_CUPOS'; end if;
  insert into inscripciones_clase (codigo, sesion_id, clase_id, nombre, celular, correo, nivel_declarado)
  values (p_codigo, p_sesion_id, v_clase.id, p_nombre, p_celular, p_correo, p_nivel)
  returning * into v_ins;
  return v_ins;
exception
  when unique_violation then raise exception 'DUPLICADO';
end $$;

-- Inscribe en un torneo verificando estado y cupos bajo bloqueo.
create or replace function inscribir_torneo(
  p_codigo text, p_torneo_id uuid, p_nombre text, p_celular text, p_correo text, p_documento text
) returns inscripciones_torneo
language plpgsql security definer set search_path = public as $$
declare
  v_t torneos;
  v_n integer;
  v_ins inscripciones_torneo;
begin
  select * into v_t from torneos where id = p_torneo_id for update;
  if not found or not v_t.publicado then raise exception 'NO_ENCONTRADO'; end if;
  if v_t.estado <> 'inscripciones_abiertas' then raise exception 'CERRADO'; end if;
  select count(*) into v_n from inscripciones_torneo where torneo_id = p_torneo_id and estado <> 'cancelada';
  if v_n >= v_t.cupos then raise exception 'SIN_CUPOS'; end if;
  insert into inscripciones_torneo (codigo, torneo_id, nombre, celular, correo, documento)
  values (p_codigo, p_torneo_id, p_nombre, p_celular, p_correo, p_documento)
  returning * into v_ins;
  return v_ins;
exception
  when unique_violation then raise exception 'DUPLICADO';
end $$;

revoke all on function crear_reserva from public, anon, authenticated;
revoke all on function inscribir_clase from public, anon, authenticated;
revoke all on function inscribir_torneo from public, anon, authenticated;

-- ---------- Almacenamiento de fotos ----------
insert into storage.buckets (id, name, public) values ('galeria', 'galeria', true)
on conflict (id) do nothing;
