# ECOSISTEMA DE REDES — INTEGRACIÓN COMPLETA (4 redes)

> Diseño del ecosistema DR BONGO BONG (10 años) como generador de activos.
> Creado: 2026-07-27. Complementa `ECOSISTEMA-REDES.md` y el runbook de deploy.
> Objetivo: al publicar en el sitio, se dispara el cross-post a las 4 redes con
> copy/hashtags/titulo PROPIOS de cada una, siguiendo la identidad del proyecto.

---

## 1) PERFIL (fuente: PROYECTO-DR-BONGO-BONG.md)
- Filtro cultural argentino, 10 años. Reggae → todos los géneros + cultura/actualidad/virales.
- Voz: cercana, natural, irónica-cariñosa, con criterio, pregunta al lector. NO noticiero/partidario/frío.
- Audiencia: 18-45, música+cultura, radio nocturna, consumidor de cortos.
- Objetivo: 3-5 artículos/día, virales en tiempo real, MONETIZAR.

## 2) USUARIOS POR RED
| Red | Usuario | Formato foco | Monetización |
|---|---|---|---|
| Instagram | `@drbongobong` | Reel 1080×1350 | Brand + tráfico |
| Facebook | `@drbongobong` | Post + video | **La que más paga** (incluir siempre) |
| TikTok | `@drbongobong` | Short vertical 1080×1920 | Alcance joven |
| YouTube | `@dr.bongobong` | **Shorts** (ya da repercusión) | AdSense + afiliados |

Regla: misma identidad visual (starfield + logo 3 filas + zócalo + Gotham) en todas.

## 3) REGLAS POR RED (motor en `lib/social-rules.ts`)
El motor `buildSocialPosts(articulo)` genera 4 piezas:
- **Instagram**: caption con gancho + hasta 30 hashtags. Formato: ESCALA + NOMBRE + cierre emocional.
- **Facebook**: copy corto + 3-5 hashtags + link nativo (priorizar: es la que paga).
- **TikTok**: copy breve + 3-5 hashtags (#parati #viral + marca).
- **YouTube**: título SEO + `#Shorts` + descripción con links (web/IG/TikTok/Cafecito) + tags.

Fórmula de título (probada con el reel de Sardelli, 700k): `ESCALA + NOMBRE + "Argentina siendo Argentina"`.

## 4) FLUJO DE PUBLICACIÓN → ECOSISTEMA
```
Editor publica post (POST /api/publish)
   → buildSocialPosts(articulo) genera las 4 piezas (copy/hashtags/titulo)
   → /api/social/crosspost distribuye:
        • IG + FB  → Meta Graph API (requiere META_* tokens)
        • TikTok  → TikTok Direct Post API (requiere TIKTOK_* tokens)
        • YouTube → YouTube Data API v3 upload (requiere YT_* token)
   → cada red recibe SU pieza (no la misma)
```
Además, el kit visual (`assets/brand/`) genera el activo (reel/short) con la identidad,
listo para subir manualmente si la API de video no está configurada.

## 5) TOKENS QUE TENÉS QUE CREAR (una sola vez)
| Red | Qué crear | Variable(s) en cPanel |
|---|---|---|
| Meta (IG+FB) | Meta App + IG User token + FB Page token | `META_ACCESS_TOKEN`, `META_IG_USER_ID`, `META_FB_PAGE_ID` |
| TikTok | TikTok Developer App (Direct Post) | `TIKTOK_ACCESS_TOKEN`, `TIKTOK_OPEN_ID` |
| YouTube | Google Cloud project + OAuth (Data API v3) | `YOUTUBE_ACCESS_TOKEN`, `YOUTUBE_REFRESH_TOKEN` |

Hasta que las setees, `/api/social/crosspost` devuelve `configured:false` por red.

## 6) NO REPETIR EL LOOP DEL DEPLOY
El cross-post es código en el repo (como el deploy). Al subir, el `.next` se renueva con
`docs/DEPLOY-RUNBOOK.md` (Flujo B: build en PC matando zombies). El cross-post NO requiere
build especial; viaja con el `.next` normal.

## 7) PROCEDIMIENTO REAL DE TOKENS (verificado 2026-07-27, paso a paso)
No repetir las vueltas. Resumen del flujo que SÍ funcionó:

### META (IG + FB) — Usuario del Sistema (recomendado, no vence pronto)
1. developers.facebook.com → app **Dr Bongo Bong** (APP_ID `976067382151868`) →
   **Casos de uso** → elegir **"Administrar mensajes y contenido en Instagram"**.
2. Business Suite (business.facebook.com) → **Dr Bongo Bong** (portafolio) →
   **Usuarios → Usuarios del sistema → + Agregar** → crear bot (ej `drbongobong-bot`).
   Darle acceso total a la cuenta de IG `@drbongobong` y a la fanpage de FB.
3. developers.facebook.com → app → **Roles de la app → Roles → Agregar personas** →
   tipo **Usuario del sistema** → elegir `drbongobong-bot` → rol **Administrador**.
4. Business Suite → Usuarios del sistema → bot → **Generar token**:
   - App: Dr Bongo Bong
   - Caducidad: máxima
   - Permisos: `instagram_basic`, `instagram_content_publish`, `pages_read_engagement`, `pages_manage_posts`
   - Copiar el `EAA...` → **Cpanel env var `META_ACCESS_TOKEN`** (NUNCA pegar en chat).
5. Sacar IDs con Graph API Explorer (token del bot cargado):
   - IG: `GET /me?fields=connected_instagram_account{id,username}` → `META_IG_USER_ID`
   - FB: `GET /me/accounts?fields=id,name` → `META_FB_PAGE_ID` (buscar la fanpage)
6. Poner en Cpanel: `META_IG_USER_ID`, `META_FB_PAGE_ID`, `META_ACCESS_TOKEN`.

⚠️ El token de USUARIO PERSONAL desde el Explorador falla (popup/permisos). El de
Usuario del Sistema es el camino que funcionó. Si se expone un token en el chat, REVOCARLO
y regenerar.

### TIKTOK y YOUTUBE
Mismas env vars del doc §5. El código ya tiene los stubs token-ready; al setearlas, el
cross-post las usa. El video (reel/short) requiere subir el archivo generado por el kit
(pendiente de implementar la subida de bytes).

## 8) PENDIENTE
- [ ] TikTok + YouTube tokens (mismo esquema).
- [ ] Subida de video (reel/short) por bytes al cross-post.
- [ ] Canal de aprobación (email/WA) antes del cross-post automático (doc madre §8).
