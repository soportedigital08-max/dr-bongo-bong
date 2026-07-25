# AGENTS.md — Manual de Operaciones

Este es el **punto de entrada obligatorio** para cualquier IA que trabaje en este proyecto. Léelo siempre primero.

## Qué es el proyecto
**Dr Bongo Bong** es un medio digital de radio, streaming y cultura (música, cultura, exploración de la mente humana). Se está migrando desde WordPress/Divi (210+ publicaciones) hacia un sitio propio **Next.js 14 (App Router) + Prisma + SQLite**, con dashboard de administración y un endpoint de publicación por IA.

## Objetivo general
Dejar de usar WordPress, preservar el contenido existente (210 posts + 21 categorías migradas), y operar el sitio nuevo de forma limpia: publicación por dashboard (usuario) y por IA (endpoint `/api/publish`).

## Estado actual (resumen)
- ✅ Sitio nuevo completo, build OK (Next 14.2.33), 210 posts + 21 cats en SQLite local (`prisma/dev.db`).
- ✅ Diseño calibrado: hero editorial, grid con portadas por categoría, navbar con logo "bonguito" (PNG transparente), ticker, scroll-reveal, glow/lift.
- ✅ Fuentes subidas al server en `next-premium-site/` (cPanel de wnpservers, cuenta `drbongob`).
- ⏸️ **Deploy bloqueado**: el cPanel de este hosting NO tiene Node.js habilitado. Se envió/ha de enviarse ticket a soporte pidiendo habilitar Node.js (CloudLinux Node.js Selector). Hasta entonces el sitio NO puede ejecutarse en el server.
- ⚠️ WordPress sigue vivo en `public_html/` (NO tocar hasta verificar el nuevo sitio).

## Cómo está organizada la documentación
Carpeta `/governance` (esta):
- `AGENTS.md` — este manual.
- `PROJECT_STATE.md` — estado actual (léelo 2º).
- `HANDOFF.md` — qué debe saber la próxima IA.
- `PROJECT_MEMORY.md` — memoria conceptual (ideas, filosofías).
- `CHANGELOG.md` — historial de cambios.
- `DECISIONS.md` — registro de decisiones estratégicas.

Documentación técnica del código vive en `/README.md` y los comentarios de los archivos.

## Órden obligatorio de lectura (al iniciar)
1. `AGENTS.md` (este)
2. `PROJECT_STATE.md`
3. `HANDOFF.md`
4. `DECISIONS.md`
5. Documentación oficial del proyecto (`README.md`, archivos de código)

**Nunca** comenzar leyendo conversaciones del chat. Las conversaciones NO son memoria oficial.

## Metodología de trabajo
- Trabajo por **Sprints**. Cada Sprint tiene objetivo, alcance y criterio de aprobación.
- Al finalizar Sprint: actualizar `PROJECT_STATE.md`, `HANDOFF.md`, `CHANGELOG.md`; registrar decisiones en `DECISIONS.md` si corresponde.
- Nunca dejar el proyecto en estado ambiguo.

## Cómo registrar decisiones
En `DECISIONS.md`, agregando una entrada NUEVA (no modificar decisiones aprobadas; solo reemplazar marcando la anterior como reemplazada).

## Cómo crear nueva documentación
Dentro de `/governance` con nombre descriptivo. Referenciarla en `PROJECT_STATE.md` y en este `AGENTS.md`.

## Qué NUNCA debe hacer una IA
- ❌ Tocar `public_html/` (WordPress vivo) sin autorización explícita y verificación previa del nuevo sitio.
- ❌ Borrar contenido migrado (210 posts) sin respaldo.
- ❌ Subir credenciales reales a repositorios públicos o dejarlas en texto plano sin rotación.
- ❌ Asumir que el server tiene Node.js (este hosting compartido NO lo trae por defecto).
- ❌ Ejecutar comandos destructivos en el server sin confirmación del usuario.
- ❌ Modificar una decisión ya aprobada en `DECISIONS.md`.

## Cómo continuar un Sprint
1. Leer `PROJECT_STATE.md` → Sprint actual y Próximo objetivo.
2. Leer `HANDOFF.md` → qué quedó pendiente.
3. Leer `DECISIONS.md` → restricciones vigentes.
4. Continuar el trabajo y actualizar documentación al cerrar.

## Cómo cerrar un Sprint
- Marcar objetivo como completado en `PROJECT_STATE.md`.
- Registrar en `CHANGELOG.md` (fecha, sprint, documento, descripción, impacto).
- Actualizar `HANDOFF.md` con el estado de entrega.
- Si hubo decisión estratégica, agregarla a `DECISIONS.md`.

## Convenciones generales
- Lenguaje del proyecto y comunicación: **español** (usuario en Argentina).
- Stack: Next.js 14 App Router, Prisma 5, SQLite, Tailwind, bcryptjs, jsonwebtoken.
- Rutas relativas al root del proyecto: `D:\contenido para dr bongo bong\next-premium-site\`.
- ENV en producción se setean en la GUI del cPanel (NO en archivo `.env` subido; el `.env.production` local fue renombrado a `.env.production.dist` para evitar que Next lo cargue en local).
