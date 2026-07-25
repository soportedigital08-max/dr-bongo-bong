import Link from 'next/link';
import SupportButton from '@/components/SupportButton';

export default function Footer() {
  return (
    <footer className="bg-bg-2 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-display font-extrabold text-lg mb-3">
            <span className="text-accent">DR</span> BONGO BONG
          </div>
          <p className="text-sm text-text-2 max-w-xs">
            Radio, streaming y cultura. El latido del mundo conectando corazones a través del arte.
          </p>
          <div className="mt-4">
            <SupportButton />
          </div>
        </div>

        <div>
          <h4 className="font-accent font-bold text-sm mb-3 uppercase tracking-wider">Navegación</h4>
          <ul className="space-y-2 text-sm text-text-2">
            <li><Link href="/posts" className="hover:text-white">Artículos</Link></li>
            <li><Link href="/categories" className="hover:text-white">Categorías</Link></li>
            <li><Link href="/radio" className="hover:text-white">Radio en vivo</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-accent font-bold text-sm mb-3 uppercase tracking-wider">Redes</h4>
          <ul className="space-y-2 text-sm text-text-2">
            <li><a href="https://www.instagram.com/drbongobong" target="_blank" rel="noreferrer" className="hover:text-white">Instagram</a></li>
            <li><a href="https://www.tiktok.com/@drbongobong" target="_blank" rel="noreferrer" className="hover:text-white">TikTok</a></li>
            <li><a href="https://www.youtube.com/@dr.bongobong" target="_blank" rel="noreferrer" className="hover:text-white">YouTube</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-accent font-bold text-sm mb-3 uppercase tracking-wider">Newsletter</h4>
          <form className="flex flex-col gap-2" action="#" method="post">
            <input
              type="email"
              required
              placeholder="tu@email.com"
              className="bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-accent outline-none"
            />
            <button className="bg-accent hover:bg-accent-hover text-white rounded-lg px-3 py-2 text-sm font-bold transition-colors">
              Suscribirme
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/5 py-6 text-center text-xs text-text-3 flex flex-col md:flex-row items-center justify-center gap-2">
        <span>© {new Date().getFullYear()} Dr Bongo Bong — Todos los derechos reservados.</span>
        <SupportButton variant="compact" />
      </div>
    </footer>
  );
}
