// Engine de reglas por red para el ecosistema DR BONGO BONG.
// Toma un articulo del sitio y genera el copy/hashtags/titulo especifico de cada red.
// No depende de tokens: se usa en el cross-post real y en previsualizacion.

export interface ArticleInput {
  title: string;
  excerpt?: string;
  url: string;            // URL publica del post (canonica)
  slug: string;
  image?: string;         // URL de la imagen destacada (para IG/TikTok/YouTube thumbnail)
  category?: string;
}

export interface SocialPost {
  network: 'instagram' | 'facebook' | 'tiktok' | 'youtube';
  caption: string;        // texto del post
  hashtags: string[];
  title?: string;         // solo YouTube (titulo SEO)
  description?: string;   // solo YouTube (descripcion + links)
  tags?: string[];        // solo YouTube (tags de busqueda)
  mediaUrl?: string;      // para redes que suben video/imagen
}

// ====== UTILIDADES (misma logica que asistente_contenido.py) ======
function limpiar(s: string): string {
  return s.replace(/\s+/g, ' ').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").trim();
}

function extraerNombres(texto: string): { principal: string; secundarios: string[] } {
  const handles = texto.match(/@[\w.]+/g) || [];
  const palabras = texto.split(/\s+/).filter(Boolean);
  const stop = new Set([
    'El','La','Los','Las','Un','Una','Y','En','De','Se','Su','Por','Para','Con','Al','A','O','Mi','Tu',
    'Palermo','Buenos','Argentina','Facebook','Instagram','YouTube','TikTok','Lo','Que','Como','Su','Mas'
  ]);
  // Une palabras capitalizadas consecutivas en un solo nombre propio (ej: "Pato Sardelli")
  const nombres: string[] = [];
  let buffer = '';
  for (const p of palabras) {
    if (/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+$/.test(p) && !stop.has(p) && !/^(https?:|www\.)/.test(p)) {
      buffer = buffer ? `${buffer} ${p}` : p;
    } else {
      if (buffer) { nombres.push(buffer); buffer = ''; }
    }
  }
  if (buffer) nombres.push(buffer);

  if (handles.length) {
    return { principal: handles[0] ?? '', secundarios: handles.slice(1) };
  }
  if (nombres.length) {
    return { principal: nombres[0] ?? '', secundarios: nombres.slice(1, 3) };
  }
  return { principal: '', secundarios: [] };
}

function escala(texto: string): string {
  const m = texto.match(/(\d{3,})\s*(mil|k|miles)?/i);
  const n = texto.match(/\b(\d{4,})\b/);
  if (m) return m[0].replace(/\s+/g, '');
  if (n) return n[0];
  return '';
}

// Formula probada (reel de Sardelli): ESCALA + NOMBRE + CIERRE EMOCIONAL
function tituloDRBongo(articulo: ArticleInput): string[] {
  const t = limpiar(articulo.title);
  const { principal, secundarios } = extraerNombres(t);
  const esc = escala(t);
  const nombre = principal || secundarios[0] || 'la cultura';
  const f1 = esc ? `${esc} con ${nombre}: Argentina siendo Argentina.` : `${nombre}: Argentina siendo Argentina.`;
  const f2 = esc ? `Lo que pasó con ${nombre} y ${esc} personas.` : `Lo que pasó con ${nombre}.`;
  const f3 = `¿Vos qué pensás de ${nombre}?`;
  return [f1, f2, f3];
}

// Hashtag base de la marca + derivados del titulo
function hashtagsDe(articulo: ArticleInput): string[] {
  const base = ['DrBongoBong', 'Cultura', 'MusicaArgentina'];
  const { principal, secundarios } = extraerNombres(limpiar(articulo.title));
  const extra: string[] = [];
  const push = (s: string) => {
    const h = s.replace(/[^a-zA-Z0-9áéíóúñ]/g, '').replace(/^([0-9])/, '_$1');
    if (h && h.length >= 3) extra.push(h);
  };
  if (principal.startsWith('@')) push(principal.slice(1));
  else push(principal);
  secundarios.forEach(push);
  const cat = (articulo.category || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (cat) push(cat);
  return [...new Set([...base, ...extra])].slice(0, 8);
}

// ====== REGLAS POR RED ======
export function buildSocialPosts(a: ArticleInput): SocialPost[] {
  const titulos = tituloDRBongo(a);
  const tags = hashtagsDe(a);
  const url = a.url;
  const cierrre = '¿Vos qué pensás?';

  // INSTAGRAM: caption con gancho + hasta 30 hashtags, encomillado para copiar
  const igHash = tags.slice(0, 30);
  const igCaption =
    `${titulos[0]}\n\n${limpiar(a.excerpt || a.title)}\n\n${cierrre}\n\n` +
    igHash.map(h => `#${h}`).join(' ');

  // FACEBOOK: copy corto, 3-5 hashtags, link nativo
  const fbHash = tags.slice(0, 4);
  const fbCaption =
    `${titulos[0]}\n\n${limpiar(a.excerpt || a.title)}\n\n${cierrre}\n\n` +
    fbHash.map(h => `#${h}`).join(' ') + `\n\n${url}`;

  // TIKTOK: copy breve + 3-5 hashtags con tendencia, tono de short
  const tkHash = ['parati', 'viral', ...tags.slice(0, 3)];
  const tkCaption =
    `${titulos[1]}\n\n${tkHash.map(h => `#${h}`).join(' ')}`;

  // YOUTUBE (Shorts): titulo SEO + descripcion + tags
  const ytTitle = `${titulos[0]} #Shorts`;
  const ytDesc =
    `${limpiar(a.excerpt || a.title)}\n\n` +
    `Más en Dr Bongo Bong:\n` +
    `🌐 Web: https://drbongobong.com.ar\n` +
    `📸 IG: @drbongobong\n` +
    `🎵 TikTok: @drbongobong\n` +
    `💸 Apoyanos: https://cafecito.app/drbongobong\n\n` +
    tags.map(h => `#${h}`).join(' ');
  const ytTags = [...tags, 'shorts', 'musica', 'argentina', 'viral'];

  return [
    { network: 'instagram', caption: igCaption, hashtags: igHash, mediaUrl: a.image },
    { network: 'facebook', caption: fbCaption, hashtags: fbHash, mediaUrl: a.image },
    { network: 'tiktok', caption: tkCaption, hashtags: tkHash },
    { network: 'youtube', caption: ytDesc, title: ytTitle, description: ytDesc, tags: ytTags, hashtags: ytTags, mediaUrl: a.image },
  ];
}
