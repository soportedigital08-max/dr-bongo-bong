// Botón de mecenazgo Cafecito.me — estética limpia, no rompe el diseño.
// Cambiá la URL por tu usuario real de Cafecito cuando lo tengas.
const CAFETITO_URL = 'https://cafecito.app/drbongobong';

export default function SupportButton({ variant = 'footer' }: { variant?: 'footer' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <a
        href={CAFETITO_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded-full transition-colors"
        title="Invitame un café"
      >
        ☕ Apoyar
      </a>
    );
  }
  return (
    <a
      href={CAFETITO_URL}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm px-4 py-2 rounded-lg transition-colors"
    >
      ☕ Invitame un café
    </a>
  );
}
