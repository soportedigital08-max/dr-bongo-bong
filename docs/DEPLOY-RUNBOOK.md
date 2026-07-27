# RUNBOOK DE DEPLOY — Dr Bongo Bong (cPanel + GitHub)

> Creado: 2026-07-27 tras 2 hs de debug por pasos ya pisados.
> Objetivo: que NADIE (ni el agente ni el usuario) vuelva a dar vueltas.
> Regla de oro: **GitHub trae el CÓDIGO. El `.next` (el build) NO está en el repo y
> se genera aparte.** El sitio en producción corre `.next/standalone/server.js`, no el código fuente.

---

## 1) ARQUITECTURA REAL (confirmada en el server)

| Item | Valor |
|---|---|
| App root (cPanel) | `/home/drbongob/NodeJS-TestApp` |
| Entrypoint Passenger | `test_app.js` (NO `server.js`) |
| Contenido de `test_app.js` | `process.chdir('/home/drbongob/NodeJS-TestApp'); require('/home/drbongob/NodeJS-TestApp/.next/standalone/server.js');` |
| Node en server | v24 |
| Base de datos | `file:/home/drbongob/NodeJS-TestApp/prisma/dev.db` |
| Static de Nginx | `/home/drbongob/public_html/_next/static/` (copia física) |
| Log de la app | `/home/drbongob/log_julio_dr.log` |
| Backups existentes | `/home/drbongob/_viejo_tmp` y `/home/drbongob/NodeJS-TestApp_bak` (ambos tienen `.next` + `.env` + `prisma/dev.db` buenos) |

⚠️ **`test_app.js` USA RUTA ABSOLUTA** en el `require`. Si alguien lo reescribe, que NO vuelva a
dejarlo relativo (`require('.next/standalone/server.js')`) — Passenger lo lanza con otro `cwd` y da
`Cannot find module` aunque el archivo exista.

---

## 2) LO QUE NO ESTÁ EN EL REPO (gitignored) — hay que restaurarlo

El `.gitignore` excluye: `.env`, `node_modules`, `.next`, `prisma/dev.db`.
Por eso, tras un clon fresco, el sitio NO arranca solo. Hay que copiar del backup:

```bash
# DB (los 210 posts viven acá)
cp /home/drbongob/_viejo_tmp/prisma/dev.db /home/drbongob/NodeJS-TestApp/prisma/dev.db

# Variables de entorno (DATABASE_URL, JWT_SECRET, etc.)
cp /home/drbongob/_viejo_tmp/.env /home/drbongob/NodeJS-TestApp/.env
```

Si no copiás el `.env`, el standalone arranca y crashea al conectar la DB → Passenger muestra
"We're sorry, but something went wrong".

---

## 3) FLUJO A — LEVANTAR EL SITIO (sitio caído / clon nuevo)

1. **Clonar desde GitHub** (cPanel → Git Version Control):
   - Si cPanel dice *"el directorio ya contiene archivos"*: desde Terminal renombrá la vieja:
     `mv /home/drbongob/NodeJS-TestApp /home/drbongob/_viejo_tmp` y volvé a clonar.
2. **Restaurar `.next` del backup** (el repo NO trae build y en el server NO se puede buildear, ver §4):
   ```bash
   cp -a /home/drbongob/_viejo_tmp/.next /home/drbongob/NodeJS-TestApp/.next
   ```
3. **Restaurar `.env` y DB** (§2).
4. **Copiar static a Nginx**:
   ```bash
   cp -a /home/drbongob/NodeJS-TestApp/.next/static/. /home/drbongob/public_html/_next/static/
   ```
5. **Node.js App Manager → Stop → 30s → Start.**
6. Verificar `https://drbongobong.com.ar/posts` con **Ctrl+F5** (NO Ctrl+Shift+R, no hace nada en tu navegador).

---

## 4) POR QUÉ NO SE BUILDEA EN EL SERVER

`npm run build` en el server muere con:
```
Next.js build worker exited with code: null and signal: SIGBUS
```
Causa: límite de RAM del cgroup de la cuenta en CloudLinux al spawnear los workers de Next.
NO es falta de RAM del nodo (`free` mostraba 16 GB libres) ni de `/tmp` (349 GB libres).
El `deploy.sh` incluye `npm run build` → **NO sirve en el server**. Usar Flujo A o B.

---

## 5) FLUJO B — TRAER ACTUALIZACIONES DEL CÓDIGO (el `.next` nuevo)

Única forma fiable: **build en la PC de Ariel** (Windows) con los zombies de node muertos.

### En la PC (Git Bash)
```bash
# 1) Admin Tareas -> matar TODOS los node.exe zombies (SINO el build timeout a 300s)
cd "D:/contenido para dr bongo bong/next-premium-site"
git pull
npm run build          # debe terminar en 1-3 min si no hay zombies
zip -r deploy_next.zip .next
```
Si `npm run build` se corta a los 300s → quedó un zombie de node.exe. Matalo y repetí.

### En el server (Terminal cPanel) — swap sin downtime
```bash
cd /home/drbongob/NodeJS-TestApp
unzip -t deploy_next.zip
mv .next .next_old
rm -rf .next && unzip -o deploy_next.zip
cp -a .next/static/. /home/drbongob/public_html/_next/static/
cp -a .next/static/. .next/standalone/.next/static/
```
Node.js App Manager → Stop → 30s → Start → Ctrl+F5.

⚠️ El build de la PC puede ser Node 18/20 y el server es Node 24. Si el log post-swap dice
algo de versión de Node, buildear con la versión alineada o avisar.

---

## 6) TROUBLESHOOTING (errores ya vividos — no reinventar)

| Síntoma | Causa real | Fix |
|---|---|---|
| cPanel: *"no puede usar el directorio porque ya contiene archivos"* | La carpeta destino tiene el sitio viejo | `mv` a `_viejo_tmp` y reclonar |
| `Error: Disk quota exceeded` al detener app | Pico de temporales en `.cl.selector` | Se resuelve solo al liberar; no es disco lleno (`df` mostraba 67%) |
| `SIGBUS` en `npm run build` | Límite CloudLinux al buildear | No buildear en server → Flujo B (PC) o Flujo A (backup) |
| `Cannot find module '.next/standalone/server.js'` | (a) `.next` no existe, o (b) `test_app.js` usa require relativo y Passenger cambia el `cwd` | (a) copiar `.next` del backup; (b) `test_app.js` DEBE usar ruta absoluta |
| Passenger: "We're sorry, but something went wrong" | Falta `.env` o DB, o el `server.js` no arranca | Copiar `.env` + `dev.db` del backup; ver log |
| `tar -tzf dist/standalone-bongobong.tar.gz` falla | El tarball está CORRUPTO/roto | No usar; usar backup `_viejo_tmp/.next` |
| Puerto 3000 ocupado / app no arranca | Hay otra app usando el 3000 en el server (app de localhost) | Matar la app de localhost en el server (`pkill -f 3000`); el sitio usa 3000 internamente y Nginx lo proxifica |
| Log viejo repite el mismo error | El log no se vacía; Passenger cachea | Siempre ver el log CON LA HORA ACTUAL tras un Stop/Start nuevo |

---

## 7) VERIFICACIÓN RÁPIDA (comando único en server)
```bash
echo "server.js:"; ls -la /home/drbongob/NodeJS-TestApp/.next/standalone/server.js
echo "env:";     ls -la /home/drbongob/NodeJS-TestApp/.env
echo "db:";      ls -la /home/drbongob/NodeJS-TestApp/prisma/dev.db
echo "log nuevo:"; tail -n 15 /home/drbongob/log_julio_dr.log; date
```
Los 3 archivos deben existir y el log debe ser POST-Start (hora actual).

---

## 8) NOTAS PARA EL AGENTE (próxima sesión)
- Al decir "deploy", asumir Flujo A o B según si el sitio está caído o solo falta código.
- NUNCA correr `npm run build` en el server (SIGBUS). Usar backup o build en PC.
- El `.next` del backup (`_viejo_tmp`) es de ANTES de los arreglos del 26-jul. Para traer esos
  arreglos hay que buildear en PC (Flujo B). El backup solo levanta el sitio "viejo".
- No borrar `_viejo_tmp`/`NodeJS-TestApp_bak` hasta confirmar que el sitio nuevo funciona con los 210 posts.
