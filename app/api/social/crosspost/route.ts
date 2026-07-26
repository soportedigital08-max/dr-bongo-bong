import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Cross-post a published article to Instagram + Facebook via Meta Graph API.
// Auth: same x-api-key as /api/publish (PUBLISH_KEY).
// Token/IDs come from env vars (set in cPanel once the Meta App is created by the user).
// If not configured, returns 200 with configured:false (no crash in prod).

const IG_USER = process.env.META_IG_USER_ID;
const FB_PAGE = process.env.META_FB_PAGE_ID;
const META_TOKEN = process.env.META_ACCESS_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://drbongobong.com.ar';

async function postToInstagram(link: string, caption: string) {
  // 1) create media container
  const c = await fetch(
    `https://graph.facebook.com/v20.0/${IG_USER}/media?image_url=${encodeURIComponent(link)}&caption=${encodeURIComponent(caption)}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  const cj = await c.json();
  if (!cj.id) throw new Error('IG container: ' + JSON.stringify(cj));
  // 2) publish
  const p = await fetch(
    `https://graph.facebook.com/v20.0/${IG_USER}/media_publish?creation_id=${cj.id}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  return await p.json();
}

async function postToFacebook(link: string, caption: string) {
  const r = await fetch(
    `https://graph.facebook.com/v20.0/${FB_PAGE}/feed?link=${encodeURIComponent(link)}&message=${encodeURIComponent(caption)}&access_token=${META_TOKEN}`,
    { method: 'POST' }
  );
  return await r.json();
}

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key');
    if (apiKey !== process.env.PUBLISH_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!IG_USER || !FB_PAGE || !META_TOKEN) {
      return NextResponse.json({
        configured: false,
        note: 'Faltan META_IG_USER_ID / META_FB_PAGE_ID / META_ACCESS_TOKEN en env vars (cPanel).',
      });
    }
    const body = await req.json();
    const { slug, title, caption } = body;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });

    const link = `${SITE_URL}/posts/${slug}`;
    const text = caption || title || '';
    const results: any = { configured: true };
    try { results.instagram = await postToInstagram(link, text); } catch (e: any) { results.instagram = { error: e.message }; }
    try { results.facebook = await postToFacebook(link, text); } catch (e: any) { results.facebook = { error: e.message }; }
    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
