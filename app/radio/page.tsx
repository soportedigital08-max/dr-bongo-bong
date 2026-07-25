export const dynamic = 'force-dynamic';

const STREAM_URL = 'https://drbongobong.com.ar:8000/stream'; // ajustar al stream real

export default function RadioPage() {
  return (
    <div className="pt-24 max-w-5xl mx-auto px-4 pb-20">
      <div className="flex items-center gap-3 mb-2">
        <span className="w-3 h-3 rounded-full bg-accent animate-pulse-dot" />
        <span className="font-accent font-bold text-accent tracking-widest uppercase text-sm">En Vivo</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-extrabold mb-6">
        Bongo Estación
      </h1>

      {/* Equalizer visual */}
      <div className="bg-card border border-white/5 rounded-2xl p-8 mb-8 flex items-end justify-center gap-2 h-40">
        {Array.from({ length: 28 }).map((_, i) => (
          <div
            key={i}
            className="w-2 bg-accent rounded-full animate-pulse-dot"
            style={{ height: `${20 + ((i * 37) % 80)}%`, animationDelay: `${i * 0.08}s` }}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-12">
        <audio controls className="w-full" src={STREAM_URL}>
          Tu navegador no soporta audio HTML5.
        </audio>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <a
          href="https://www.youtube.com/@drbongobong"
          target="_blank"
          rel="noreferrer"
          className="bg-card hover:bg-bg-3 border border-white/5 hover:border-accent/50 rounded-xl p-6 transition-all"
        >
          <div className="font-display font-bold text-lg mb-1">YouTube — Programas</div>
          <div className="text-sm text-text-3">Reviví los programas completos de Cadena 103.</div>
        </a>
        <a
          href="https://www.instagram.com/drbongobong"
          target="_blank"
          rel="noreferrer"
          className="bg-card hover:bg-bg-3 border border-white/5 hover:border-accent/50 rounded-xl p-6 transition-all"
        >
          <div className="font-display font-bold text-lg mb-1">Instagram / TikTok</div>
          <div className="text-sm text-text-3">Seguí el contenido diario de la bonga.</div>
        </a>
      </div>
    </div>
  );
}
