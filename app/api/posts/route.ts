import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

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

  const post = await prisma.post.create({
    data: {
      title,
      slug: slug || slugify(title),
      content,
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
