# PROJECT_STATE.md — Estado Actual

> Última actualización: 2026-07-19 (Sprint 1, en cierre)

## Estado del proyecto
**ACTIVO — migración WordPress → Next.js en curso.** Sitio nuevo funcional en local y fuentes subidas al server; deploy pendiente por habilitación de Node.js en el hosting.

## Sprint actual
**Sprint 1 — "Sitio nuevo + migración + diseño"** (en cierre, a la espera de deploy).

## Último Sprint aprobado
Sprint 1 (objetivo cumplido en local: build OK, 210 posts migrados, diseño calibrado, bonguito integrado). Pendiente: deploy en vivo.

## Próximo Sprint
**Sprint 2 — "Deploy en vivo + verificación"**: crear Node.js App en cPanel (cuando soporte habilite Node.js), Run NPM Install + Build + Restart, verificar `drbongobong.com.ar` sirve Next (no WordPress), y solo entonces desactivar/redirigir WordPress.

## Documentos LOCKED
- `governance/AGENTS.md` (manual de operaciones — no modificar sin consenso).
- `prisma/dev.db` (base con 210 posts — respaldo antes de cualquier mutación).

## Documentos en revisión
- `governance/PROJECT_MEMORY.md` (memoria conceptual, en crecimiento).

## Objetivo actual
Dejar el nuevo sitio funcionando en `drbongobong.com.ar` y dejar de usar WordPress, preservando las 210 publicaciones.

## Próximo objetivo
Sitio en vivo + dashboard de administración operativo + endpoint de IA (`/api/publish`) funcionando.

## Riesgos abiertos
1. **Hosting sin Node.js**: cPanel compartido en wnpservers no expone Node.js por API ni GUI. Riesgo de que soporte NO lo habilite (plan compartido). *Mitigación*: Opción A estática de contingencia (ver DECISIONS.md ID-004).
2. **Credenciales en texto plano**: `C:\contraseña base de datos.txt` y token de cPanel en archivo del usuario. *Mitigación*: rotar antes de producción.
3. **Imágenes de WordPress no migradas**: las tarjetas sin `featuredImage` muestran portada tipográfica por categoría (no el 🥁 feo). Mejora pendiente: copiar `wp-content/uploads` a `/public`.

## Hipótesis pendientes
- ¿Responderá soporte habilitando Node.js en este plan? (define Sprint 2).
- ¿El `npm run build` en el server correrá con Node 20 + Prisma 5.22? (validado en local, pendiente en server).

## Próximas decisiones
- Si soporte NO habilita Node.js: ejecutar Opción A (estática) o cambio de hosting (Opción C).
- Formato de las "notas IA" (quién firma, etiqueta IA visible ya está).
- Migración de imágenes de WordPress.

## Bloqueos
- **Deploy en vivo** bloqueado por falta de Node.js en el hosting. Requiere acción del usuario (enviar ticket a soporte) + creación de app en GUI del cPanel.

## Prioridades
1. (Usuario) Enviar ticket a soporte wnpservers pidiendo Node.js.
2. (IA) Al habilitarse Node.js → crear app, instalar, buildear, verificar.
3. (IA) Solo tras verificación → desactivar WordPress de forma reversible.
4. (IA) Migrar imágenes de WP a `/public`.

## Accesos (solo referencia, rotar en prod)
- cPanel: `cpanel173.wnpservers.net:2083`, usuario `drbongob`.
- FTP/API archivos: mismo usuario/clave.
- App root en server: `next-premium-site/`.
- API token cPanel (usado solo para listar archivos vía UAPI Fileman): `LB2WFI7BNYG31JUFTEI4WJD0TQ1OLH22`.
- IMPORTANTE: la API de Node.js NO está disponible en este hosting; la app se crea por GUI.
