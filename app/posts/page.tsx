import { prisma } from '@/lib/db';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';

export default async function PostsPage() {
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    include: { category: true, author: true },
  });

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 pb-20">
      <h1 className="text-4xl font-display font-extrabold mb-2">
        Artículos <span className="text-accent">({posts.length})</span>
      </h1>
      <p className="text-text-2 mb-12">Todas las notas publicadas en Dr Bongo Bong.</p>

      {posts.length === 0 ? (
        <p className="text-text-3">Aún no hay publicaciones. Vamos a migrar el contenido de WordPress.</p>
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
