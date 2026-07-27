# CLONAR EL REPO EN cPanel (Git Version Control)

> Una sola vez. Después de esto, se acabó subir ZIP y descomprir.
> Repo: `https://github.com/soportedigital08-max/dr-bongo-bong.git` (rama `main`)
> App root destino: `/home/drbongob/NodeJS-TestApp`

---

## 0) RESPALDO (no lo saltees)
Desde el **Terminal de cPanel** (o Administrador de Archivos):
```bash
cp -a /home/drbongob/NodeJS-TestApp /home/drbongob/NodeJS-TestApp_bak
```
Si algo sale mal, renombrás `NodeJS-TestApp_bak` de vuelta y listo.

## 1) Detener la app (para que no quede el .next trabado)
cPanel → **Node.js App Manager** → seleccionar la app → **Stop**.

## 2) Clonar desde GitHub
cPanel → **Git Version Control** → botón **Create** (o "Clone Repository"):
- **Clone URL:** `https://github.com/soportedigital08-max/dr-bongo-bong.git`
- **Repository Path:** `NodeJS-TestApp`  (cPanel completa a `/home/drbongob/NodeJS-TestApp`)
- **Branch:** `main`
- Click en **Create / Clone**.

### Si cPanel dice "el directorio no está vacío"
Porque ya tenía los archivos del sitio viejo. Solución:
```bash
# desde Terminal de cPanel
mv /home/drbongob/NodeJS-TestApp /home/drbongob/_viejo_tmp
```
Y volvé a paso 2 (ahora el path `NodeJS-TestApp` está libre). El sitio viejo quedó en `_viejo_tmp` por si hace falta.

## 3) Primer deploy
Terminal de cPanel:
```bash
bash deploy.sh
```
Hace: `git pull` + `npm install` + `npm run build` + copiar `_next/static`.

## 4) Encender
cPanel → **Node.js App Manager** → **Start**.
Abrir `https://drbongobong.com.ar/posts` con **Ctrl+F5**.

## 5) Después de cada cambio (lo que vas a hacer siempre)
1. Yo subo a GitHub.
2. cPanel → **Git Version Control** → la repo → **Update** (trae lo nuevo).
3. Terminal: `bash deploy.sh`
4. Node.js App Manager → Stop → 30 s → Start.
5. Ctrl+F5.

(Opcional: en Git Version Control podés poner un "Deployment Hook" que corra
`bash deploy.sh` solo, sin entrar al Terminal. Lo dejamos para más adelante.)

## Notas
- El `.gitignore` ya excluye `.env`, `node_modules`, `.next` y `prisma/dev.db`.
  Tu base de datos del server queda intacta, y los secretos no se suben.
- No borres `prisma/dev.db` del server (ahí están los 210 posts).
