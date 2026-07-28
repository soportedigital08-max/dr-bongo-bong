import { NextResponse } from 'next/server';
import { buildSocialPosts, type ArticleInput } from '@/lib/social-rules';

export const dynamic = 'force-dynamic';

// Cross-post a published article to IG + FB (Meta) + TikTok + YouTube.
// Auth: same x-api-key as /api/publish (PUBLISH_KEY).
// Tokens/IDs come from env vars (set in cPanel once the user creates each app).
// If a network is not configured, it is skipped (returns configured:false for that network, no crash).

const META_IG = process.env.META_IG_USER_ID;
const META_FB = process.env.META_FB_PAGE_ID;
const META_TOKEN = process.env.META_ACCESS_TOKEN;
// Page Access Token dedicado (opcional). Si existe, se usa directo para publicar
// en la fanpage sin derivarlo en runtime. Es la opcion mas robusta.
const META_FB_PAGE_TOKEN = process.env.META_FB_PAGE_TOKEN;
const TIKTOK_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_OPEN_ID = process.env.TIKTOK_OPEN_ID;
const YT_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://drbongobong.com.ar';

// ---------- HELPERS ----------

interface ImageCheck {
  ok: boolean;
  contentType?: string;
  status?: number;
  reason?: string;
}

// IG Graph NO acepta posts de solo texto: exige imagen (JPEG recomendado) o video.
// Antes de llamar a Meta validamos que la URL exista y sea realmente una imagen,
// para evitar el error 9004 / 2207052 ("Only photo or video can be accepted...").
async function validateImageUrl(url?: string): Promise<ImageCheck> {
  if (!url) return { ok: false, reason: 'Sin imagen (featuredImage vacio)' };
  if (!/^https?:\/\//i.test(url)) return { ok: false, reason: `URL invalida: ${url}` };
  try {
    // HEAD primero; algunos servers no lo soportan -> fallback GET con Range.
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    if (!res.ok || !res.headers.get('content-type')) {
      res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow' });
    }
    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!res.ok) {
      return { ok: false, status: res.status, contentType, reason: `La URL respondio HTTP ${res.status} (no es una imagen accesible)` };
    }
    if (!contentType.startsWith('image/')) {
      return { ok: false, status: res.status, contentType, reason: `Content-Type "${contentType}" no es image/* (probablemente una pagina 404/HTML)` };
    }
    if (contentType.includes('svg')) {
      return { ok: false, status: res.status, contentType, reason: 'IG no acepta SVG; usar JPEG o PNG' };
    }
    return { ok: true, status: res.status, contentType };
  } catch (e: any) {
    return { ok: false, reason: `No se pudo verificar la imagen: ${e?.message || e}` };
  }
}

// ---------- META (IG + FB) ----------
async function postToInstagram(imageUrl: string, caption: string) {
  const c = await fetch(
    `https://graph.facebook.com/v21.0/${META_IG}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  const cj = await c.json();
  if (!cj.id) throw new Error('IG container: ' + JSON.stringify(cj));
  const p = await fetch(
    `https://graph.facebook.com/v21.0/${META_IG}/media_publish?creation_id=${cj.id}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  return await p.json();
}

// Devuelve el Page Access Token a usar para publicar en la fanpage.
// Prioridad:
//   1) META_FB_PAGE_TOKEN (env var dedicada, lo mas robusto).
//   2) Derivarlo del system-user token: GET /{PAGE_ID}?fields=access_token.
//      IMPORTANTE: esto SOLO funciona si el System User tiene la pagina asignada
//      como activo con control total en Business Manager (tarea MANAGE).
//      Si Meta devuelve (#200), falta esa asignacion (ver docs/META-FB-SETUP).
async function getPageToken(): Promise<string> {
  if (META_FB_PAGE_TOKEN) return META_FB_PAGE_TOKEN;
  const tokRes = await fetch(
    `https://graph.facebook.com/v21.0/${META_FB}?fields=access_token&access_token=${META_TOKEN}`
  );
  const tokJson = await tokRes.json();
  if (tokJson?.access_token) return tokJson.access_token as string;
  throw new Error(
    'No se pudo obtener un Page Access Token. El System User no tiene la pagina asignada con control total en Business Manager, ' +
    'o falta definir META_FB_PAGE_TOKEN en cPanel. Detalle Meta: ' + JSON.stringify(tokJson?.error || tokJson)
  );
}

async function postToFacebook(link: string, caption: string) {
  const pageToken = await getPageToken();
  const r = await fetch(
    `https://graph.facebook.com/v21.0/${META_FB}/feed?link=${encodeURIComponent(link)}&message=${encodeURIComponent(caption)}&access_token=${pageToken}`,
    { method: 'POST' }
  );
  const rj = await r.json();
  if (rj?.error) {
    throw new Error(
      `FB feed: ${JSON.stringify(rj.error)}${rj.error?.code === 200 ? ' | Hint: el token usado no es un Page Token valido; asignar la pagina al System User (control total) o setear META_FB_PAGE_TOKEN.' : ''}`
    );
  }
  return rj;
}

// ---------- TIKTOK (Direct Post API, stub token-ready) ----------
async function postToTikTok(caption: string, videoUrl?: string) {
  // Requiere video subido previamente (upload de bytes). Por ahora armamos el payload.
  if (!TIKTOK_TOKEN || !TIKTOK_OPEN_ID) throw new Error('TikTok no configurado');
  // Flujo real: POST /v2/video/init -> upload -> /v2/video/publish con caption.
  throw new Error('TikTok video upload pending (requiere subir el archivo generado por el kit).');
}

// ---------- YOUTUBE (Data API v3, stub token-ready) ----------
async function postToYouTube(p: { title?: string; description?: string; tags?: string[]; videoUrl?: string }) {
  if (!YT_TOKEN) throw new Error('YouTube no configurado');
  // Flujo real: resumable upload a youtube/v3/videos?upload con snippet + status.
  throw new Error('YouTube upload pending (requiere subir el Short generado por el kit).');
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.PUBLISH_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { slug, title, excerpt, featuredImage, category, dryRun } = body;
    if (!slug || !title) return NextResponse.json({ error: 'slug y title requeridos' }, { status: 400 });

    const article: ArticleInput = {
      title,
      excerpt,
      slug,
      url: `${SITE_URL}/posts/${slug}`,
      image: featuredImage,
      category,
    };

    // Motor de reglas: genera la pieza propia de cada red
    const posts = buildSocialPosts(article);
    const byNet = Object.fromEntries(posts.map((p) => [p.network, p]));

    const results: any = { configured: {}, dryRun: !!dryRun };
    const link = article.url;

    // IG + FB (Meta)
    if (META_IG && META_FB && META_TOKEN) {
      if (dryRun) {
        const imgCheck = await validateImageUrl(article.image);
        results.instagram = {
          wouldPost: imgCheck.ok,
          caption: byNet.instagram.caption,
          to: META_IG,
          image: article.image || null,
          imageCheck: imgCheck,
          ...(imgCheck.ok ? {} : { warning: `IG se omitiria: ${imgCheck.reason}` }),
        };
        results.facebook = {
          wouldPost: true,
          caption: byNet.facebook.caption,
          to: META_FB,
          pageTokenSource: META_FB_PAGE_TOKEN ? 'env:META_FB_PAGE_TOKEN' : 'derived-from-system-user',
        };
      } else {
        // IG: exige imagen real (image/*). Si no hay imagen valida, se OMITE con warning (no crashea).
        const imgCheck = await validateImageUrl(article.image);
        if (imgCheck.ok && article.image) {
          try { results.instagram = await postToInstagram(article.image, byNet.instagram.caption); }
          catch (e: any) { results.instagram = { error: e.message }; }
        } else {
          results.instagram = {
            skipped: true,
            warning: `Instagram omitido: ${imgCheck.reason}. IG Graph API exige imagen (JPEG/PNG) o video; no existe el post de solo texto.`,
            imageChecked: article.image || null,
            imageCheck: imgCheck,
          };
        }
        try { results.facebook = await postToFacebook(link, byNet.facebook.caption); }
        catch (e: any) { results.facebook = { error: e.message }; }
      }
      results.configured.instagram = true;
      results.configured.facebook = true;
    } else {
      results.configured.instagram = false;
      results.configured.facebook = false;
    }

    // TikTok (caption listo; video se sube con token)
    if (TIKTOK_TOKEN && TIKTOK_OPEN_ID) {
      if (dryRun) {
        results.tiktok = { wouldPost: true, caption: byNet.tiktok.caption, to: TIKTOK_OPEN_ID };
      } else {
        try { results.tiktok = await postToTikTok(byNet.tiktok.caption, byNet.tiktok.mediaUrl); }
        catch (e: any) { results.tiktok = { error: e.message }; }
      }
      results.configured.tiktok = true;
    } else {
      results.configured.tiktok = false;
    }

    // YouTube (pieza lista; video se sube con token)
    if (YT_TOKEN) {
      if (dryRun) {
        results.youtube = { wouldPost: true, title: byNet.youtube.title, description: byNet.youtube.description };
      } else {
        try { results.youtube = await postToYouTube(byNet.youtube); }
        catch (e: any) { results.youtube = { error: e.message }; }
      }
      results.configured.youtube = true;
    } else {
      results.configured.youtube = false;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
