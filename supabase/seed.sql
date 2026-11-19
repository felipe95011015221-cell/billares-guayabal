-- Datos iniciales de PRODUCCIÓN (sin datos ficticios de clientes).
-- Mesas: inventario de EJEMPLO, edítelo desde /admin/mesas con el inventario real.
-- Clases: programas PROPUESTOS (confirmada = false), sin instructor ni precio.
-- La galería se carga automáticamente con las fotos de referencia la primera vez que se abre la web.

insert into ajustes (id, datos) values (1, '{}'::jsonb) on conflict (id) do nothing;

insert into mesas (nombre, modalidad, tarifa_hora, orden)
select * from (values
  ('Mesa 1', 'carambola', null::integer, 1),
  ('Mesa 2', 'carambola', null, 2),
  ('Mesa 3', 'carambola', null, 3),
  ('Mesa 4', 'carambola', null, 4),
  ('Mesa 5', 'pool', null, 5),
  ('Mesa 6', 'pool', null, 6)
) v
where not exists (select 1 from mesas);

insert into clases (slug, titulo, descripcion, modalidad, nivel, duracion_min, confirmada)
values
  ('iniciacion-al-billar', 'Iniciación al billar', 'Postura, puente, agarre del taco y primeros golpes. Para quien nunca ha jugado o quiere empezar con buenas bases.', 'ambas', 'Iniciación', 90, false),
  ('carambola-tres-bandas', 'Carambola a tres bandas', 'Sistemas de diamantes, lectura de bandas y elección de la bola correcta para construir la carambola.', 'carambola', 'Intermedio', 90, false),
  ('pool-para-principiantes', 'Pool para principiantes', 'Reglas de bola 8 y bola 9, saque, control de la blanca y cómo planear las siguientes bolas.', 'pool', 'Básico', 60, false),
  ('tecnica-y-precision', 'Técnica y precisión', 'Efectos, fuerza, seguimiento y retroceso. Ejercicios de repetición para un golpe más limpio y constante.', 'ambas', 'Intermedio', 90, false),
  ('entrenamiento-avanzado', 'Entrenamiento avanzado', 'Sesiones de alto volumen, posiciones de torneo y análisis de partidas para jugadores con experiencia competitiva.', 'carambola', 'Avanzado', 120, false),
  ('clases-particulares', 'Clases particulares', 'Una hora uno a uno, enfocada en lo que tú quieras mejorar. Horario a convenir.', 'ambas', 'Todos los niveles', 60, false)
on conflict (slug) do nothing;

-- Para dar acceso de administrador: cree el usuario en Authentication > Users y luego:
-- insert into admin_usuarios (user_id, nombre) values ('<UUID del usuario>', 'Propietario');
