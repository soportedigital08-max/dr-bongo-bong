// Convierte URLs "sueltas" de YouTube, Instagram, X/Twitter, Facebook y Spotify
// en sus embeds correspondientes. Se aplica server-side al renderizar el artículo.

function ytEmbed(id: string) {
  return `<div class="embed embed-video"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
}

function spotifyEmbed(kind: string, id: string) {
  const h = kind === 'track' || kind === 'episode' ? 152 : 352;
  return `<div class="embed embed-spotify"><iframe src="https://open.spotify.com/embed/${kind}/${id}" width="100%" height="${h}" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div>`;
}

function igEmbed(url: string) {
  const clean = url.split('?')[0].replace(/\/$/, '');
  return `<div class="embed embed-instagram"><iframe src="${clean}/embed/captioned" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy"></iframe></div>`;
}

function xEmbed(url: string) {
  const clean = url.split('?')[0].replace('x.com', 'twitter.com');
  return `<div class="embed embed-x"><blockquote class="twitter-tweet" data-theme="dark"><a href="${clean}"></a></blockquote></div>`;
}

function fbEmbed(url: string) {
  const enc = encodeURIComponent(url);
  const isVideo = /\/videos\/|\/watch|\/reel/.test(url);
  const path = isVideo ? 'video.php?href=' : 'post.php?href=';
  return `<div class="embed embed-facebook"><iframe src="https://www.facebook.com/plugins/${path}${enc}&show_text=true&width=500" width="100%" height="${isVideo ? 314 : 500}" frameborder="0" scrolling="no" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe></div>`;
}

function urlToEmbed(url: string): string | null {
  let m;
  // YouTube: watch?v=, youtu.be/, shorts/
  m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (m) return ytEmbed(m[1]);
  // Spotify: track/album/playlist/episode/show/artist
  m = url.match(/open\.spotify\.com\/(?:intl-[a-z]+\/)?(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/);
  if (m) return spotifyEmbed(m[1], m[2]);
  // Instagram: /p/, /reel/, /tv/
  m = url.match(/instagram\.com\/(?:p|reel|tv)\/[\w-]+/);
  if (m) return igEmbed('https://www.' + m[0]);
  // X / Twitter status
  m = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/\d+/);
  if (m) return xEmbed('https://' + m[0]);
  // Facebook post/video/reel/watch
  m = url.match(/(?:www\.|m\.|web\.)?facebook\.com\/[^\s"<]+/);
  if (m) return fbEmbed('https://www.' + m[0].replace(/^(www\.|m\.|web\.)/, ''));
  return null;
}

const NEEDS_X_SCRIPT = /twitter-tweet/;

// Limpia shortcodes de WordPress/Divi ([et_pb_section], [caption], etc.)
// que quedaron en el content migrado y ensucian la lectura.
export function cleanWordPressArtifacts(html: string): string {
  if (!html) return html;
  let out = html;
  // Shortcodes Divi/WP: [et_pb_*], [/et_pb_*], [caption], [gallery], [embed], etc.
  out = out.replace(/\[\/?(?:et_pb_[a-z_]+|caption|gallery|embed|audio|video|playlist|vc_[a-z_]+)[^\]]*\]/gi, '');
  // Comentarios de bloques Gutenberg: <!-- wp:... --> y <!-- /wp:... -->
  out = out.replace(/<!--\s*\/?wp:[^>]*-->/gi, '');
  // Figuras de embed Gutenberg: <figure class="wp-block-embed...">...URL...</figure>
  // → se reemplazan por la URL sola en un párrafo (que luego processEmbeds convierte en iframe)
  out = out.replace(
    /<figure[^>]*wp-block-embed[^>]*>[\s\S]*?(https?:\/\/[^\s<"]+)[\s\S]*?<\/figure>/gi,
    '<p>$1</p>'
  );
  // Deduplicar: si la misma URL quedó repetida (URL suelta + figura con la misma URL)
  out = out.replace(/(?:^|\n)\s*(https?:\/\/[^\s<"]+)\s*\n(?:\s*\n)*\s*<p>\1<\/p>/gi, '\n<p>$1</p>');
  out = out.replace(/<p>(https?:\/\/[^\s<"]+)<\/p>(?:\s|<br\s*\/?>)*<p>\1<\/p>/gi, '<p>$1</p>');
  // Divs wrapper vacíos de Gutenberg
  out = out.replace(/<div class="wp-block-embed__wrapper">\s*<\/div>/gi, '');
  // Párrafos que quedaron vacíos tras la limpieza
  out = out.replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, '');
  // Más de 2 saltos de línea seguidos → 1
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

export function processEmbeds(html: string): string {
  if (!html) return html;

  let out = cleanWordPressArtifacts(html);

  // Caso 1: URL sola dentro de un párrafo: <p>https://...</p>
  out = out.replace(
    /<p>\s*(?:<a [^>]*href="([^"]+)"[^>]*>[^<]*<\/a>|(https?:\/\/[^\s<"]+))\s*<\/p>/gi,
    (full, hrefUrl, bareUrl) => {
      const url = hrefUrl || bareUrl;
      const embed = urlToEmbed(url);
      return embed || full;
    }
  );

  // Caso 2: URL sola en una línea (contenido sin <p>), separada por <br> o saltos
  out = out.replace(
    /(^|<br\s*\/?>|\n)\s*(https?:\/\/[^\s<"]+)\s*(?=<br\s*\/?>|\n|$)/gi,
    (full, prefix, url) => {
      const embed = urlToEmbed(url);
      return embed ? `${prefix}${embed}` : full;
    }
  );

  // Caso 3: bloques liveEmbed guardados por el editor (div data-live-embed)
  out = out.replace(
    /<div[^>]*data-live-embed[^>]*>\s*([\s\S]*?)<\/div>/gi,
    (full, inner) => {
      const m = inner.match(/https?:\/\/[^\s"'<>]+/);
      const url = m ? m[0] : '';
      const embed = url ? urlToEmbed(url) : null;
      return embed || full;
    }
  );

  // Si hay tweets, agregar el script de X una sola vez al final
  if (NEEDS_X_SCRIPT.test(out) && !out.includes('platform.twitter.com/widgets.js')) {
    out += '<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>';
  }

  return out;
}
