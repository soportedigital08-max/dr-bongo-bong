import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { category: true, author: true },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, content, excerpt, slug, categoryId, status, featuredImage } = body;

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      title,
      slug: slug || slugify(title),
      content,
      excerpt: excerpt || null,
      categoryId: categoryId || null,
      status: status || 'published',
      featuredImage: featuredImage || null,
      publishedAt: status === 'published' ? new Date() : undefined,
    },
  });
  return NextResponse.json({ post });
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.post.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
