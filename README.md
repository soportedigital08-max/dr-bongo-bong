# Dr Bongo Bong — Sitio nuevo (Next.js 14 + Prisma + SQLite)

## Stack
- Next.js 14 (App Router) + React 18
- Prisma + SQLite (base en `prisma/dev.db`)
- Tailwind CSS (tema dark "Premium")
- Auth: JWT (bcrypt) para el dashboard `/admin`
- Endpoint de IA: `POST /api/publish` con header `x-api-key`

## Estructura
- `app/` — páginas (home, posts, categorías, radio, admin, api)
- `components/` — Navbar, Footer, PostCard, Editor, RichEditor
- `lib/` — db (Prisma), auth (JWT), utils, embeds
- `prisma/schema.prisma` — modelo User / Category / Post
- `scripts/` — `migrate-wp.mjs`, `seed.mjs`, `asignar-portadas-db.mjs`, etc.
- `server.js` — entrypoint alternativo (usa `.next/standalone/server.js`)
- `test_app.js` — entrypoint REAL en producción (cPanel Passenger)
- `assets/brand/` — KIT DE REDES DR BONGO BONG (starfield, logo, zócalo, Gotham, `generar_reel.py`)

## Comandos locales
```
npm install
npx prisma generate
npm run build
npm run start      # producción en :3000
```

## ⚠️ EDITOR (RichEditor) — estado al 26-jul-2026
- M/L/S (tamaños de imagen): ✅ funcionando (verificado en Chrome).
- Plantillas: el menú abre y lista las opciones, pero al elegir una plantilla se inserta el
  TEXTO (epígrafe/descripción) pero NO la imagen en el flujo interactivo del usuario.
  "Dos imágenes" con 2 archivos juntos no inserta nada (solo salta el cartel si elegís 1).
  -> PENDIENTE de reparar (el nodo image se crea pero no se ve en el flujo real del navegador).
- Login bypass `NEXT_PUBLIC_PREVIEW=1` existe SOLO para Vercel (banco de pruebas). NUNCA usarlo en producción.

## KIT DE REDES (assets/brand)
Generador de piezas alineadas a la identidad DR BONGO BONG (starfield + logo 3 filas + zócalo
negro/línea roja + título Gotham). Uso:
```
cd assets/brand
python3 generar_reel.py --input RECORTE.mp4 --titulo "TU TITULO" --formato ig --out salida.mp4
# formatos: ig (1080x1350), short (1080x1920), horizontal (1920x1080)
```
Regla de 2 límites: Límite 1 (exterior) = el recorte llena el frame (entra desde afuera hacia
adentro); Límite 2 (interior) = logo (3 filas, derecha) + título (Gotham, al pie).

---

## DESPLIEGUE EN PRODUCCIÓN (cPanel / WNPower) — DATO REAL
> La fuente de verdad es `docs/ESTADO-DEL-PROYECTO.md` (actualizado 24-jul-2026). Lo que sigue
> reemplaza la sección vieja de "Deploy en cPanel" de esta README.

### Rutas reales en el server
- **App root:** `/home/drbongob/NodeJS-TestApp`  (NO `next-premium-site`)
- **Entrypoint Passenger:** `test_app.js` (NO `server.js`)
- **Build standalone:** `/home/drbongob/NodeJS-TestApp/.next/standalone/`
- **Base de datos:** `file:/home/drbongob/NodeJS-TestApp/prisma/dev.db`
- **Node:** v24 (`nodevenv/NodeJS-TestApp/24/`)
- **Static de Nginx:** `/home/drbongob/public_html/_next/static/` (copia física, se rehace cada build)
- **Portadas:** `/home/drbongob/public_html/portadas/2024|2025|2026/` (copia física)

### Variables de entorno (en .htaccess / bloque CloudLinux del app)
```
DATABASE_URL=file:/home/drbongob/NodeJS-TestApp/prisma/dev.db
JWT_SECRET=*** (rotar, quedó expuesto en chat)
PUBLISH_KEY=*** (rotar, quedó expuesto en chat)
NODE_ENV=production
SITE_URL=https://drbongobong.com.ar
```
⚠️ NUNCA poner `NEXT_PUBLIC_PREVIEW=1` en producción (abre el admin sin login).

### Reglas del hosting (aprendidas a fuerza de errores)
1. Nginx NO sigue symlinks fuera de `public_html` → todo lo que Nginx sirve es COPIA FÍSICA dentro de `public_html/`.
2. `_next/static/` debe recopiarse tras CADA build (los hashes cambian):
   ```bash
   rm -rf /home/drbongob/public_html/_next/static
   cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/public_html/_next/static/
   cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/NodeJS-TestApp/.next/standalone/.next/static/
   ```
3. Mismatch de hashes HTML/chunks = `ChunkLoadError` + "Application error".
4. `.htaccess` NO se toca (bloques Passenger/env). No debe haber `index.html`/`index.php` en `public_html/`.

### Rutina de deploy REAL (proceso del usuario — cero downtime)
El build local en la PC de Ariel falla por timeout SI hay procesos `node.exe` zombis consumiendo
RAM. Workaround documentado del usuario: **matar los zombis `node.exe` en Administrador de Tareas
(Admin Tareas) ANTES de buildear**. Con eso el `npm run build` local termina y se hace el swap de
`.next` en el server SIN downtime (la app sigue sirviendo el `.next` viejo hasta reiniciar).

Paso A — En la PC de Ariel (preparar y VERIFICAR antes de tocar el server):
1. Admin Tareas → matar todos los `node.exe` zombis.
2. En la carpeta del proyecto:
   ```bash
   npm run build
   ```
3. Comprimir la carpeta `.next` resultante en `deploy_next.zip` (SIN `node_modules`).
4. (Opcional) `npm run start` + Ctrl+F5 para verificar localmente.

Paso B — Subir y swap en el server (Terminal cPanel):
```bash
cd /home/drbongob/NodeJS-TestApp
unzip -t deploy_next.zip                              # 1) verificar integridad
mv .next .next_old                                    # 2) renombrar el vivo (la app sigue sirviendo el viejo)
rm -rf .next && unzip -o deploy_next.zip              # 3) extrae como .next (reemplaza)
# 4) recopiar static (regla 2 de arriba) — esto es lo que antes se hacía "redireccionando archivos"
rm -rf /home/drbongob/public_html/_next/static
cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/public_html/_next/static/
cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/NodeJS-TestApp/.next/standalone/.next/static/
```
Luego en el Node.js App Manager de cPanel: **Stop** → esperar 30 s → **Start**.
Verificar con curl (hashes) + navegador Ctrl+F5.
(Si algo falla, `mv .next_old .next` + restart devuelve al estado previo.)

### Fallback — build en el server (si el local no termina tras matar zombis)
Subir el fuente (sin `.next`/`node_modules`) a un dir temporal, build allí, y hacer swap del `.next`:
```bash
cd /home/drbongob/NodeJS-TestApp
unzip -o deploy_src.zip -d NodeJS-TestApp_build
cd NodeJS-TestApp_build && npm install && npm run build
# luego swap igual que Paso B pero moviendo NodeJS-TestApp_build/.next -> .next
```

## Migrar contenido de WordPress
```bash
node scripts/migrate-wp.mjs ../drbongobong-programaderadioystreamingcultural.WordPress.2026-06-08.xml
```
Usuario admin por defecto (seed): admin@drbongobong.com.ar / BongoBong2026!

## Notas
- NO tocar `public_html/` (WordPress vivo) hasta verificar el nuevo sitio.
- Las imágenes destacadas de WordPress NO se migraron automáticamente; los scripts
  `asignar-portadas-db.mjs` + copia física a `public_html/portadas/` resuelven las portadas.
- Documentación extendida en `docs/` y `governance/`.

---

## INTEGRACIÓN GIT ↔ cPanel (menos vueltas — recomendado)
Repo: `https://github.com/soportedigital08-max/dr-bongo-bong.git` (rama `main`).

### En cPanel (lo hacés una sola vez)
1. **Git Version Control** → Create → Repository URL: la de arriba → Clone en
   `/home/drbongob/NodeJS-TestApp` (mismo app root).
2. (Opcional) **Deployment** → agregar hook que corra `bash deploy.sh` tras cada pull.

### Después de cada cambio (lo que hacés vos)
1. Hermes sube a GitHub (push).
2. cPanel → **Git Version Control → Update** (trae los cambios).
3. Terminal de cPanel: `bash deploy.sh` (instala, build, copia static).
4. Node.js App Manager: **Stop** → 30 s → **Start**.
5. Verificar con Ctrl+F5.

Con esto se elimina el ZIP y el descomprir. `deploy.sh` está en el repo y se clona solo.

⚠️ El `.gitignore` ya excluye `.env`, `node_modules`, `.next`, `prisma/dev.db` → la DB del
server queda intacta y no se suben secretos.

