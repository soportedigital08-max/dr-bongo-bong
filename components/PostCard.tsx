import Link from 'next/link';
import { cn, formatDate, excerptFrom } from '@/lib/utils';

const COVERS = [
  'from-[#3a0a14] to-[#160308]',
  'from-[#0a1f3a] to-[#06101f]',
  'from-[#2a0a3a] to-[#14061f]',
  'from-[#3a2a0a] to-[#1f1606]',
  'from-[#0a3a2a] to-[#061f16]',
  'from-[#1a1a1a] to-[#0d0d0d]',
];

function coverIndex(slug?: string): number {
  if (!slug) return 0;
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % COVERS.length;
}

export default function PostCard({
  post,
  className,
}: {
  post: {
    id: string;
    slug: string;
    title: string;
    excerpt?: string | null;
    content: string;
    featuredImage?: string | null;
    category?: { name: string; slug: string } | null;
    author?: { name: string } | null;
    publishedAt: Date | string;
    isAIContent?: boolean;
  };
  className?: string;
}) {
  const excerpt = post.excerpt || excerptFrom(post.content);
  const cover = COVERS[coverIndex(post.slug)];
  return (
    <Link
      href={`/posts/${post.slug}`}
      className={cn(
        'group block bg-card rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 transform hover:-translate-y-2',
        className
      )}
    >
      <div className={`h-48 relative overflow-hidden img-zoom bg-gradient-to-br ${cover}`}>
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/20">
            <span className="font-display font-extrabold text-5xl tracking-tighter">
              {post.category?.name?.charAt(0)?.toUpperCase() || 'B'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] font-accent">
              {post.category?.name || 'Dr Bongo Bong'}
            </span>
          </div>
        )}
        {post.category && (
          <span className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
            {post.category.name}
          </span>
        )}
        {post.isAIContent && (
          <span className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full border border-white/20">
            IA
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-bold mb-3 group-hover:text-accent-2 transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-text-2 text-sm mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-text-3">
          <span>{post.author?.name || 'Dr Bongo Bong'}</span>
          <span>{formatDate(post.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
