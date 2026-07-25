import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// AI Publishing Bridge — let an authorized agent (Claude / any AI tool) publish.
export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get('x-api-key') || (await req.json().then((b) => b.apiKey).catch(() => null));
    if (apiKey !== process.env.PUBLISH_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, excerpt, slug, categoryId, authorId, featuredImage, isAIContent } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
    }

    const finalSlug = slug || slugify(title);
    const post = await prisma.post.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        categoryId: categoryId || null,
        authorId: authorId || null,
        isAIContent: isAIContent ?? true,
        status: 'published',
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
