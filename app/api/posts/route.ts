import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { slugify } from '@/lib/utils';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (fs.existsSync('/home/drbongob/public_html/portadas')
    ? '/home/drbongob/public_html/portadas/uploads'
    : path.join(process.cwd(), 'public', 'portadas', 'uploads'));

const DATA_URL_RE = /src="(data:image\/(?:png|jpeg|jpg|webp|gif|avif);base64,[^"]+)"/g;

// Si el contenido trae data URLs (fallback del editor cuando falla el upload),
// los sube al server y reemplaza por URLs reales para no guardar base64 en la DB.
async function resolveDataUrls(html: string): Promise<string> {
  if (!html.includes('data:image/')) return html;
  const matches = [...html.matchAll(DATA_URL_RE)];
  if (!matches.length) return html;
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  for (const m of matches) {
    const dataUrl = m[1];
    const comma = dataUrl.indexOf(',');
    const meta = dataUrl.slice(0, comma);
    const ext = (meta.match(/image\/(\w+)/)?.[1] || 'png').replace('jpeg', 'jpg');
    const buf = Buffer.from(dataUrl.slice(comma + 1), 'base64');
    const filename = `editor-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buf);
    html = html.replace(dataUrl, `/portadas/uploads/${filename}`);
  }
  return html;
}

// List posts (admin)
export async function GET(req: Request) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const posts = await prisma.post.findMany({
    orderBy: { publishedAt: 'desc' },
    include: { category: true, author: true },
  });
  return NextResponse.json({ posts }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
}

// Create post (admin or AI with PUBLISH_KEY handled separately)
export async function POST(req: Request) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, slug, categoryId, status, featuredImage, isAIContent } = body;
  if (!title || !content) {
    return NextResponse.json({ error: 'title y content requeridos' }, { status: 400 });
  }

  const cleanContent = await resolveDataUrls(content);

  const post = await prisma.post.create({
    data: {
      title,
      slug: slug || slugify(title),
      content: cleanContent,
      excerpt: excerpt || null,
      categoryId: categoryId || null,
      authorId: user.userId,
      status: status || 'published',
      featuredImage: featuredImage || null,
      isAIContent: isAIContent ?? false,
      publishedAt: status === 'published' ? new Date() : new Date(0),
    },
  });
  return NextResponse.json({ post }, { status: 201 });
}
