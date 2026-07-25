'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Node, mergeAttributes } from '@tiptap/core';

// Redimensiona y comprime la imagen en el navegador antes de subirla (máx 1600px, JPEG 0.85)
async function resizeImage(file: File): Promise<File> {
  if (file.type === 'image/gif') return file;
  const MAX = 1600;
  try {
    const bitmap = await createImageBitmap(file);
    if (bitmap.width <= MAX && bitmap.height <= MAX && file.size < 500 * 1024) {
      bitmap.close();
      return file;
    }
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob: Blob = await new Promise((res, rej) =>
      canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob falló'))), 'image/jpeg', 0.85)
    );
    const name = (file.name || 'imagen').replace(/\.[^.]+$/, '') + '.jpg';
    return new File([blob], name, { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

// === Embed en VIVO (se ve en el editor, no solo al publicar) ===
function embedHTML(url: string): string {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `<div class="embed embed-video"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
  const ig = url.match(/instagram\.com\/(?:p|reel)\/([\w-]+)/);
  if (ig) return `<div class="embed embed-instagram"><iframe src="https://www.instagram.com/p/${ig[1]}/embed/captioned" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy"></iframe></div>`;
  const tw = url.match(/x\.com\/\w+\/status\/(\d+)/) || url.match(/twitter\.com\/\w+\/status\/(\d+)/);
  if (tw) return `<div class="embed embed-x"><blockquote class="twitter-tweet" data-theme="dark"><a href="${url}">Ver en X</a></blockquote></div>`;
  const fb = url.match(/facebook\.com\/.+\/(\d{10,})/);
  if (fb) return `<div class="embed embed-facebook"><iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500" width="100%" height="500" frameborder="0" scrolling="no" allowtransparency="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" loading="lazy"></iframe></div>`;
  const sp = url.match(/open\.spotify\.com\/(track|album|playlist)\/([\w]+)/);
  if (sp) return `<div class="embed embed-spotify"><iframe src="https://open.spotify.com/embed/${sp[1]}/${sp[2]}" width="100%" height="152" frameborder="0" allow="encrypted-media" loading="lazy"></iframe></div>`;
  return '';
}

const LiveEmbed = Node.create({
  name: 'liveEmbed',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return { url: { default: '' } };
  },
  parseHTML() {
    return [{ tag: 'div[data-live-embed]' }];
  },
  renderHTML({ HTMLAttributes }) {
    const url = HTMLAttributes.url as string;
    const html = embedHTML(url) || `<a href="${url}">${url}</a>`;
    return ['div', mergeAttributes(HTMLAttributes, { 'data-live-embed': '', class: 'live-embed' }), html];
  },
  addNodeView() {
    return ReactNodeViewRenderer(({ node, editor: ed, getPos }) => {
      const url = node.attrs.url as string;
      const remove = () => {
        const pos: number = typeof getPos === 'function' ? getPos() : -1;
        if (pos >= 0) ed.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).run();
      };
      return (
        <NodeViewWrapper className="live-embed">
          <button type="button" onClick={remove} className="live-embed-remove" title="Quitar">✕ Quitar</button>
          <div dangerouslySetInnerHTML={{ __html: embedHTML(url) || `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>` }} />
        </NodeViewWrapper>
      );
    });
  },
});

// 5 plantillas de IMAGEN (sin cita ni ficha). Al elegir, dispara subida.
const IMG_TEMPLATES: Record<string, { label: string; wrapperClass: string; caption?: string; two?: boolean }> = {
  imageCaption: { label: '🖼 Imagen + epígrafe', wrapperClass: 'tpl-image-caption', caption: 'Epígrafe de la imagen' },
  imageWide: { label: '🌄 Imagen ancha', wrapperClass: 'tpl-image-wide', caption: 'Descripción de la imagen' },
  twoImages: { label: '🧩 Dos imágenes', wrapperClass: 'tpl-two-images', two: true },
  imageSide: { label: '▫ Imagen + texto', wrapperClass: 'tpl-image-side', caption: 'Pie de imagen' },
  imageBanner: { label: '🔅 Banner CTA', wrapperClass: 'tpl-image-banner', caption: 'Texto del banner' },
};

export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const [token, setToken] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [tab, setTab] = useState<'visual' | 'html'>('visual');
  const [htmlDraft, setHtmlDraft] = useState(value || '');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem('dbb_token') || '');
  }, []);

  async function uploadFile(file: File): Promise<string | null> {
    if (!file.type.startsWith('image/')) return null;
    // Modo preview (Vercel): genera data URL local para probar sin auth/DB.
    if (process.env.NEXT_PUBLIC_PREVIEW === '1') {
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      const fd = new FormData();
      fd.append('file', resized);
      const res = await fetch('/api/upload', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: fd });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Error al subir'); return null; }
      return data.url;
    } catch { alert('Error de conexión al subir'); return null; }
    finally { setUploading(false); }
  }

  async function insertImageWithClass(url: string, cls: string) {
    editor?.chain().focus()
      .insertContent({ type: 'image', attrs: { src: url, alt: '', class: `article-img ${cls}` } })
      .run();
  }

  // Plantilla de imagen: dispara file picker, sube y arma el bloque con la clase
  async function handleTemplate(key: string) {
    const tpl = IMG_TEMPLATES[key];
    if (!tpl) return;
    setShowTpl(false);
    if (tpl.two) {
      const pick = () => new Promise<File | null>((res) => {
        const i = document.createElement('input');
        i.type = 'file'; i.accept = 'image/*';
        i.onchange = () => res(i.files?.[0] || null);
        i.click();
      });
      const a = await pick();
      if (!a) return;
      const b = await pick();
      if (!b) return;
      const u1 = await uploadFile(a); const u2 = await uploadFile(b);
      if (u1 && u2) {
        editor?.chain().focus()
          .insertContent(`<div class="tpl-two-images"><img src="${u1}" alt="" class="article-img img-left img-small"/><img src="${u2}" alt="" class="article-img img-right img-small"/></div><p></p>`)
          .run();
      }
      return;
    }
    const input = document.createElement('input');
    input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const url = await uploadFile(file);
      if (!url) return;
      const cls = key === 'imageWide' || key === 'imageBanner' ? 'img-center img-full' : key === 'imageSide' ? 'img-left img-small' : 'img-center img-med';
      const cap = tpl.caption ? `<figcaption>${tpl.caption}</figcaption>` : '';
      editor?.chain().focus()
        .insertContent(`<figure class="${tpl.wrapperClass}">`)
        .insertContent({ type: 'image', attrs: { src: url, alt: '', class: `article-img ${cls}` } })
        .insertContent(cap || '')
        .insertContent('<p></p>')
        .run();
    };
    input.click();
  }

  const editor = useEditor({
    immediatelyRender: false,
    content: value || '',
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ inline: false, HTMLAttributes: { class: 'article-img' } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener', target: '_blank' } }),
      LiveEmbed,
    ],
    editorProps: {
      attributes: { class: 'tiptap-content prose-content' },
      handlePaste: (_view, event) => {
        const item = Array.from(event.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
        if (item) { const f = item.getAsFile(); if (f) { event.preventDefault(); uploadFile(f).then((u) => { if (u) insertImageWithClass(u, 'img-center img-med'); }); return true; } }
        const text = event.clipboardData?.getData('text/plain')?.trim();
        if (text && embedHTML(text)) { event.preventDefault(); editor?.chain().focus().insertContent({ type: 'liveEmbed', attrs: { url: text } }).run(); return true; }
        return false;
      },
      handleDrop: (_view, event) => {
        const file = Array.from(event.dataTransfer?.files || []).find((f) => f.type.startsWith('image/'));
        if (file) { event.preventDefault(); uploadFile(file).then((u) => { if (u) insertImageWithClass(u, 'img-center img-med'); }); return true; }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      if (tab === 'html') setHtmlDraft(html);
    },
  });

  if (!editor) return <div className="bg-bg-3 border border-white/10 rounded-lg p-4 text-text-3">Cargando editor…</div>;

  const btn = (active: boolean) =>
    `px-2.5 py-1 rounded text-sm transition-colors ${active ? 'bg-accent text-white' : 'text-text-2 hover:bg-white/10'}`;

  // M/L/S: aplica la clase a TODAS las imágenes del doc (robusto, sin selección frágil)
  function applySize(cls: string) {
    const ed = editor;
    if (!ed) return;
    let count = 0;
    const { state, view } = ed;
    const tr = state.tr;
    state.doc.descendants((node, pos) => {
      if (node.type.name === 'image') {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, class: `article-img ${cls}` });
        count++;
      }
    });
    if (count === 0) { alert('Primero insertá una imagen para cambiar su tamaño.'); return; }
    view.dispatch(tr);
  }

  function insertVideo() {
    const url = prompt('URL de YouTube / Instagram / X / Facebook / Spotify (se ve al instante):');
    if (url && embedHTML(url)) editor?.chain().focus().insertContent({ type: 'liveEmbed', attrs: { url } }).run();
    else if (url) alert('URL no reconocida como video/red social.');
  }

  function applyHtmlDraft() {
    editor?.commands.setContent(htmlDraft, false);
    onChange(htmlDraft);
    setTab('visual');
  }

  return (
    <div className="bg-bg-3 border border-white/10 rounded-lg overflow-hidden">
      {/* Pestañas */}
      <div className="flex items-center gap-1 px-2 pt-2 bg-bg-2 border-b border-white/10">
        <button type="button" className={tab === 'visual' ? 'px-3 py-1.5 text-sm font-bold text-white border-b-2 border-accent' : 'px-3 py-1.5 text-sm text-text-2 hover:text-white'} onClick={() => setTab('visual')}>📝 Visual</button>
        <button type="button" className={tab === 'html' ? 'px-3 py-1.5 text-sm font-bold text-white border-b-2 border-accent' : 'px-3 py-1.5 text-sm text-text-2 hover:text-white'} onClick={() => { setHtmlDraft(editor.getHTML()); setTab('html'); }}>🔤 HTML</button>
      </div>

      {tab === 'visual' ? (
        <>
          <div className="relative flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-bg-2 sticky top-0 z-10">
            <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
            <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
            <span className="w-px h-5 bg-white/10 mx-1" />
            <button type="button" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
            <button type="button" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <span className="w-px h-5 bg-white/10 mx-1" />
            <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Lista</button>
            <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Lista</button>
            <span className="w-px h-5 bg-white/10 mx-1" />
            <button type="button" className={btn(false)} onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Subiendo…' : '🖼 Imagen'}</button>
            <button type="button" className={btn(false)} onClick={insertVideo}>🎬 Video/Redes</button>
            <button type="button" className={btn(false)} onClick={() => editor?.chain().focus().undo().run()} title="Deshacer">↶</button>
            <button type="button" className={btn(false)} onClick={() => editor?.chain().focus().redo().run()} title="Rehacer">↺</button>
            <span className="w-px h-5 bg-white/10 mx-1" />
            <span className="text-xs text-text-3 mr-1">Tamaño:</span>
            <button type="button" className={btn(false)} onClick={() => applySize('img-center img-med')} title="Mediano">M</button>
            <button type="button" className={btn(false)} onClick={() => applySize('img-center img-full')} title="Ancho completo">L</button>
            <button type="button" className={btn(false)} onClick={() => applySize('img-left img-small')} title="Chico izquierda">S</button>
            <span className="w-px h-5 bg-white/10 mx-1" />
            <button type="button" className={btn(false)} onClick={() => setShowTpl((v) => !v)}>📐 Plantillas</button>
            {showTpl && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-[#0a0a0a] border border-white/20 rounded-lg shadow-2xl p-1 z-50">
                {Object.entries(IMG_TEMPLATES).map(([k, t]) => (
                  <button key={k} type="button" className="block w-full text-left text-sm text-white hover:bg-white/15 px-3 py-2 rounded" onClick={() => handleTemplate(k)}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f).then((u) => { if (u) insertImageWithClass(u, 'img-center img-med'); }); e.target.value = ''; }} />
          </div>

          <EditorContent editor={editor} className="px-4 py-3 min-h-[360px] max-h-[70vh] overflow-y-auto" />
          <p className="text-xs text-text-3 px-4 pb-3">
            💡 Lo que escribís ES el artículo. Videos/redes: botón ✕ para quitar. M/L/S cambian el tamaño de TODAS las imágenes. 📐 Plantillas disparan la subida con diseño.
          </p>
        </>
      ) : (
        <div className="p-3">
          <textarea
            value={htmlDraft}
            onChange={(e) => setHtmlDraft(e.target.value)}
            className="w-full h-[360px] bg-bg-1 border border-white/10 rounded-lg p-3 text-xs font-mono text-text-2 focus:border-accent outline-none"
            spellCheck={false}
          />
          <button type="button" className="mt-2 bg-accent hover:bg-accent-hover text-white rounded-lg px-3 py-2 text-sm font-bold" onClick={applyHtmlDraft}>
            ✓ Aplicar HTML al editor visual
          </button>
          <p className="text-xs text-text-3 mt-2">Editá el código y aplicá para verlo en el editor visual (como WordPress).</p>
        </div>
      )}
    </div>
  );
}
