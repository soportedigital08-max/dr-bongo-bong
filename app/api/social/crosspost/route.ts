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
const TIKTOK_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_OPEN_ID = process.env.TIKTOK_OPEN_ID;
const YT_TOKEN = process.env.YOUTUBE_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://drbongobong.com.ar';

// ---------- META (IG + FB) ----------
async function postToInstagram(link: string, caption: string) {
  const c = await fetch(
    `https://graph.facebook.com/v21.0/${META_IG}/media?image_url=${encodeURIComponent(link)}&caption=${encodeURIComponent(caption)}&access_token=${META_TOKEN}`,
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

async function postToFacebook(link: string, caption: string) {
  const r = await fetch(
    `https://graph.facebook.com/v21.0/${META_FB}/feed?link=${encodeURIComponent(link)}&message=${encodeURIComponent(caption)}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  return await r.json();
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
        results.instagram = { wouldPost: true, caption: byNet.instagram.caption, to: META_IG };
        results.facebook = { wouldPost: true, caption: byNet.facebook.caption, to: META_FB };
      } else {
        try { results.instagram = await postToInstagram(link, byNet.instagram.caption); }
        catch (e: any) { results.instagram = { error: e.message }; }
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
