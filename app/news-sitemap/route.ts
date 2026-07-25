import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Solo notas publicadas de las últimas 48h (requisito de Google News)
export async function GET() {
  const base = 'https://drbongobong.com.ar';
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const posts = await prisma.post.findMany({
    where: { status: 'published', publishedAt: { gte: since } },
    select: { slug: true, publishedAt: true, updatedAt: true },
    orderBy: { publishedAt: 'desc' },
    take: 1000,
  });

  const items = posts
    .map(
      (p) =>
        `    <url>\n      <loc>${base}/posts/${p.slug}</loc>\n      <news:news>\n        <news:publication>\n          <news:name>Dr Bongo Bong</news:name>\n          <news:language>es</news:language>\n        </news:publication>\n        <news:publication_date>${p.publishedAt.toISOString()}</news:publication_date>\n      </news:news>\n    </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
