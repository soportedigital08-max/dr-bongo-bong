import { prisma } from '@/lib/db';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 pb-20">
      <h1 className="text-4xl font-display font-extrabold mb-12">
        Categorías
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`/categories/${c.slug}`}
            className="bg-card hover:bg-bg-3 border border-white/5 hover:border-accent/50 rounded-xl p-6 transition-all"
          >
            <div className="font-display font-bold text-lg">{c.name}</div>
            <div className="text-sm text-text-3 mt-1">{c._count.posts} notas</div>
          </a>
        ))}
      </div>
    </div>
  );
}
