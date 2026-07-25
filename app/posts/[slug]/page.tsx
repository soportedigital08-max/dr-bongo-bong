import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatDate } from '@/lib/utils';
import { processEmbeds } from '@/lib/embeds';
import PostCard from '@/components/PostCard';
import AdminEditButton from '@/components/AdminEditButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PostDetail({
  params,
}: {
  params: { slug: string };
}) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { category: true, author: true },
  });
  if (!post) notFound();

  const related = await prisma.post.findMany({
    where: { categoryId: post.categoryId ?? undefined, status: 'published', NOT: { id: post.id } },
    take: 3,
    include: { category: true, author: true },
  });

  return (
    <article className="pt-24">
      <AdminEditButton postId={post.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt || post.title,
            image: post.featuredImage ? [post.featuredImage] : [],
            datePublished: post.publishedAt,
            dateModified: post.updatedAt || post.publishedAt,
            author: { '@type': 'Organization', name: post.author?.name || 'Dr Bongo Bong' },
            publisher: {
              '@type': 'Organization',
              name: 'Dr Bongo Bong',
              logo: { '@type': 'ImageObject', url: 'https://drbongobong.com.ar/bonguito-logo.png' },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `https://drbongobong.com.ar/posts/${post.slug}` },
          }),
        }}
      />
      <div className="article-hero max-w-3xl mx-auto px-4">
        {post.category && (
          <span className="inline-block bg-accent text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            {post.category.name}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-display font-extrabold leading-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-text-3 mb-8">
          <span>{post.author?.name || 'Dr Bongo Bong'}</span>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
          {post.isAIContent && <span className="text-accent font-bold">· IA</span>}
        </div>
      </div>

      {post.featuredImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.title}
          className="article-cover w-full max-h-[460px] object-cover my-8"
        />
      )}

      <div
        className="prose-content max-w-3xl mx-auto px-4 pb-16"
        dangerouslySetInnerHTML={{ __html: processEmbeds(post.content) }}
      />

      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <h2 className="text-2xl font-display font-extrabold mb-8">Notas relacionadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
