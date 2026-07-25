import Link from 'next/link';
import { prisma } from '@/lib/db';
import PostCard from '@/components/PostCard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function readingTime(text?: string | null): string {
  if (!text) return '2 min';
  const words = text.replace(/<[^>]+>/g, '').trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min`;
}

async function getHomeData() {
  const [featured, recent, categories] = await Promise.all([
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { category: true, author: true },
    }),
    prisma.post.findMany({
      where: { status: 'published' },
      orderBy: { publishedAt: 'desc' },
      skip: 3,
      take: 9,
      include: { category: true, author: true },
    }),
    prisma.category.findMany({
      orderBy: { name: 'asc' },
      take: 8,
    }),
  ]);
  return { featured, recent, categories };
}

export default async function HomePage() {
  const { featured, recent, categories } = await getHomeData();
  const [hero, ...rest] = featured;

  return (
    <div className="pt-16">
      {/* ===== HERO EDITORIAL ===== */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden grain">
        {/* aura animada */}
        <div className="aura absolute inset-0 z-0" />
        {/* fondo editorial (gradiente rico, no depende de red externa) */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(120%_120%_at_70%_10%,#3a0a14_0%,#160308_45%,#0d0d0d_100%)]" />
        <div className="absolute inset-0 z-0 opacity-[0.07] grain" />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-xs font-accent font-bold tracking-[0.2em] uppercase text-accent-2 mb-5">
              <span className="w-8 h-px bg-accent-2" />
              {hero?.category?.name || 'Cultura'}
            </span>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-6">
              {hero?.title || 'El latido del mundo'}
            </h1>
            <p className="text-lg md:text-xl text-text-2 max-w-2xl mb-8">
              {hero?.excerpt ||
                'Un espacio dedicado a la música, la cultura y la exploración de la mente humana.'}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href={hero ? `/posts/${hero.slug}` : '/posts'}
                className="glow-accent bg-accent hover:bg-accent-2 text-white px-8 py-3.5 rounded-full font-bold"
              >
                Leer nota principal
              </Link>
              <a
                href="/radio"
                className="border border-white/20 hover:border-white text-white px-8 py-3.5 rounded-full font-bold transition-colors"
              >
                Escuchar Radio
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-text-2">
              {hero?.author?.name && <span className="text-white/90">{hero.author.name}</span>}
              {hero?.author?.name && <span className="w-1 h-1 rounded-full bg-white/30" />}
              <span>{hero ? readingTime(hero.content) : '2 min'} de lectura</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Ticker de categorías ===== */}
      {categories.length > 0 && (
        <section className="bg-accent-soft border-y border-accent/20 py-3 overflow-hidden">
          <div className="ticker-track">
            {[...categories, ...categories].map((c, i) => (
              <Link
                key={i}
                href={`/categories/${c.slug}`}
                className="px-6 text-sm font-accent font-medium text-white/80 hover:text-white"
              >
                {c.name} <span className="text-accent-2">•</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ===== NOTA PRINCIPAL + GRID ASIMÉTRICO ===== */}
      {hero && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold mb-12 text-center">
            Lo más <span className="text-accent-2">reciente</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 reveal">
              <PostCard post={hero} className="h-full lift" />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {rest.map((p, i) => (
                <div key={p.id} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                  <PostCard post={p} className="lift" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== TODAS LAS NOTAS ===== */}
      {recent.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-24">
          <div className="flex items-center justify-between mb-12 reveal">
            <h2 className="text-3xl md:text-4xl font-display font-extrabold">
              Todas las <span className="text-accent-2">notas</span>
            </h2>
            <Link href="/posts" className="text-accent-2 font-bold text-sm hover:underline">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recent.map((p, i) => (
              <div key={p.id} className="reveal" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                <PostCard post={p} className="lift" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
