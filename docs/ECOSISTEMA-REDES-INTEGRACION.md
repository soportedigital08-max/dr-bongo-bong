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

## 7) PENDIENTE (para cuando quieras)
- [ ] Crear las 3 apps/tokens arriba.
- [ ] El cross-post de VIDEO (reel/short) requiere subir el archivo generado por el kit;
      hoy el motor manda caption+imagen; el video se sube manual o con token de video.
- [ ] Canal de aprobación (email/WA) antes del cross-post automático (decisión del doc madre §8).
