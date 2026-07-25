import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });
  if (!category) notFound();

  const posts = await prisma.post.findMany({
    where: { categoryId: category.id, status: 'published' },
    orderBy: { publishedAt: 'desc' },
    include: { category: true, author: true },
  });

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 pb-20">
      <Link href="/categories" className="text-sm text-text-3 hover:text-white">← Categorías</Link>
      <h1 className="text-4xl font-display font-extrabold mt-4 mb-2">{category.name}</h1>
      {category.description && <p className="text-text-2 mb-12">{category.description}</p>}

      {posts.length === 0 ? (
        <p className="text-text-3">No hay notas en esta categoría todavía.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
