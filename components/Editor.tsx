'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cleanWordPressArtifacts } from '@/lib/embeds';
import RichEditor from '@/components/RichEditor';

interface Category { id: string; name: string; }
interface Post {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  categoryId: string;
  status: string;
  isAIContent: boolean;
}

export default function Editor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Post>({
    title: '', slug: '', content: '', excerpt: '', featuredImage: '',
    categoryId: '', status: 'published', isAIContent: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState<'cover' | 'content' | null>(null);
  const [savedSlug, setSavedSlug] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Redimensiona y comprime la imagen en el navegador antes de subirla.
  // Máx 1600px de ancho/alto, salida JPEG calidad 0.85 → peso y dimensiones uniformes.
  async function resizeImage(file: File): Promise<File> {
    if (file.type === 'image/gif') return file; // no tocar GIFs animados
    const MAX = 1600;
    try {
      const bitmap = await createImageBitmap(file);
      if (bitmap.width <= MAX && bitmap.height <= MAX && file.size < 500 * 1024) {
        bitmap.close();
        return file; // ya es chica y liviana
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
      const blob: Blob = await new Promise((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob falló'))), 'image/jpeg', 0.85)
      );
      const newName = (file.name || 'imagen').replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], newName, { type: 'image/jpeg' });
    } catch {
      return file; // si algo falla, subir original
    }
  }

  // Inserta HTML en la posición del cursor dentro del textarea de contenido
  function insertAtCursor(snippet: string) {
    const ta = contentRef.current;
    setForm((f) => {
      if (!ta) return { ...f, content: f.content + snippet };
      const start = ta.selectionStart ?? f.content.length;
      const end = ta.selectionEnd ?? start;
      const next = f.content.slice(0, start) + snippet + f.content.slice(end);
      requestAnimationFrame(() => {
        ta.focus();
        const pos = start + snippet.length;
        ta.setSelectionRange(pos, pos);
      });
      return { ...f, content: next };
    });
  }

  async function uploadImage(file: File): Promise<string | null> {
    const resized = await resizeImage(file);
    const fd = new FormData();
    fd.append('file', resized);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Error al subir la imagen');
        return null;
      }
      return data.url as string;
    } catch {
      setMsg('Error de conexión al subir la imagen');
      return null;
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('cover');
    const url = await uploadImage(file);
    if (url) { update('featuredImage', url); setMsg('Imagen de portada subida ✓'); }
    setUploading(null);
    e.target.value = '';
  }

  async function handleContentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('content');
    const url = await uploadImage(file);
    if (url) {
      insertAtCursor(`\n<img src="${url}" alt="" />\n`);
      setMsg('Imagen insertada en la posición del cursor ✓');
    }
    setUploading(null);
    e.target.value = '';
  }

  // Drag & drop / pegar imagen directamente sobre el textarea de contenido
  async function handleContentDrop(e: React.DragEvent<HTMLTextAreaElement>) {
    const file = Array.from(e.dataTransfer?.files || []).find((f) => f.type.startsWith('image/'));
    if (!file) return; // dejar pasar drops de texto
    e.preventDefault();
    // Posicionar el cursor donde soltó el mouse (si el navegador lo soporta)
    const ta = contentRef.current;
    if (ta && typeof (document as any).caretPositionFromPoint === 'function') {
      const cp = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
      if (cp && cp.offsetNode === ta.firstChild) ta.setSelectionRange(cp.offset, cp.offset);
    }
    setUploading('content');
    const url = await uploadImage(file);
    if (url) {
      insertAtCursor(`\n<img src="${url}" alt="" />\n`);
      setMsg('Imagen soltada e insertada ✓');
    }
    setUploading(null);
  }

  async function handleContentPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
    if (!item) return; // pegar texto normal
    const file = item.getAsFile();
    if (!file) return;
    e.preventDefault();
    setUploading('content');
    const url = await uploadImage(file);
    if (url) {
      insertAtCursor(`\n<img src="${url}" alt="" />\n`);
      setMsg('Imagen pegada e insertada ✓');
    }
    setUploading(null);
  }

  useEffect(() => {
    const t = localStorage.getItem('dbb_token') || '';
    if (!t) { router.push('/admin/login'); return; }
    setToken(t);
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
    if (postId) {
      fetch(`/api/posts/${postId}`, { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          const p = d.post;
          setForm({
            id: p.id, title: p.title, slug: p.slug, content: cleanWordPressArtifacts(p.content),
            excerpt: p.excerpt || '', featuredImage: p.featuredImage || '',
            categoryId: p.categoryId || '', status: p.status, isAIContent: p.isAIContent,
          });
          setSavedSlug(p.slug || '');
        });
    }
  }, [postId]);

  function update(key: keyof Post, value: any) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMsg('');
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/posts/${form.id}` : '/api/posts';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.error || 'Error'); return; }
      setMsg(form.status === 'published' ? 'Publicado ✓' : 'Borrador guardado ✓');
      const p = data.post;
      if (p?.slug) setSavedSlug(p.slug);
      if (!form.id && p?.id) setForm((f) => ({ ...f, id: p.id, slug: p.slug || f.slug }));
    } catch {
      setMsg('Error de conexión');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-24 max-w-4xl mx-auto px-4 pb-20">
      <h1 className="text-3xl font-display font-extrabold mb-6">
        {form.id ? 'Editar nota' : 'Nueva nota'}
      </h1>

      {msg && <div className="bg-accent/20 border border-accent text-white text-sm rounded-lg px-3 py-2 mb-4">{msg}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-text-2 mb-1">Título</label>
          <input value={form.title} onChange={(e) => update('title', e.target.value)}
            className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-2 mb-1">Slug (URL)</label>
            <input value={form.slug} onChange={(e) => update('slug', e.target.value)}
              placeholder="se-genera-automatico" className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none" />
          </div>
          <div>
            <label className="block text-sm text-text-2 mb-1">Categoría</label>
            <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}
              className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none">
              <option value="">— sin categoría —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-2 mb-1">Imagen destacada</label>
          <div className="flex flex-col md:flex-row gap-2">
            <input value={form.featuredImage} onChange={(e) => update('featuredImage', e.target.value)}
              placeholder="https://… o subí un archivo →" className="flex-1 bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none" />
            <label className="cursor-pointer bg-bg-3 border border-white/10 hover:border-accent text-text-2 hover:text-white rounded-lg px-4 py-2 text-sm text-center transition-colors whitespace-nowrap">
              {uploading === 'cover' ? 'Subiendo…' : '📁 Subir imagen'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleCoverUpload} className="hidden" disabled={uploading !== null} />
            </label>
          </div>
          {form.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.featuredImage} alt="Vista previa" className="mt-2 max-h-40 rounded-lg border border-white/10" />
          )}
        </div>

        <div>
          <label className="block text-sm text-text-2 mb-1">Extracto</label>
          <textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} rows={2}
            className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-accent outline-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-text-2">Contenido</label>
            <label className="cursor-pointer text-xs text-text-3 hover:text-accent border border-white/10 hover:border-accent rounded-lg px-3 py-1 transition-colors">
              {uploading === 'content' ? 'Subiendo…' : '📁 Imagen de portada'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleCoverUpload} className="hidden" disabled={uploading !== null} />
            </label>
          </div>
          <RichEditor value={form.content} onChange={(html) => update('content', html)} />
        </div>

        <div className="flex items-center gap-6">
          <select value={form.status} onChange={(e) => update('status', e.target.value)}
            className="bg-bg-3 border border-white/10 rounded-lg px-3 py-2 text-white">
            <option value="published">Publicado</option>
            <option value="draft">Borrador</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-text-2">
            <input type="checkbox" checked={form.isAIContent} onChange={(e) => update('isAIContent', e.target.checked)} />
            Contenido generado por IA
          </label>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 items-center">
          <button onClick={save} disabled={saving}
            className="bg-accent hover:bg-accent-hover text-white font-bold rounded-lg px-6 py-2.5 transition-colors disabled:opacity-50">
            {saving ? 'Guardando…' : form.status === 'published' ? 'Publicar' : 'Guardar borrador'}
          </button>
          <button onClick={() => setShowPreview(true)} disabled={!form.title && !form.content}
            className="border border-accent/60 text-accent hover:bg-accent hover:text-white rounded-lg px-6 py-2.5 transition-colors disabled:opacity-40">
            👁 Vista previa
          </button>
          {savedSlug && (
            <a href={`/posts/${savedSlug}`} target="_blank" rel="noopener noreferrer"
              className="border border-green-500/60 text-green-400 hover:bg-green-500/20 rounded-lg px-6 py-2.5 transition-colors">
              Ver nota ↗
            </a>
          )}
          <button onClick={() => router.push('/admin')}
            className="border border-white/20 text-text-2 hover:text-white rounded-lg px-6 py-2.5">
            {savedSlug ? 'Volver al panel' : 'Cancelar'}
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={() => setShowPreview(false)}>
          <div className="min-h-full py-10 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-3xl mx-auto bg-bg-2 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-bg-3 sticky top-0">
                <span className="text-sm font-bold text-text-2">👁 Vista previa</span>
                <button onClick={() => setShowPreview(false)} className="text-text-3 hover:text-white text-xl leading-none">✕</button>
              </div>
              <div className="p-6">
                {form.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.featuredImage} alt="" className="w-full max-h-72 object-cover rounded-xl mb-6" />
                )}
                <h1 className="text-3xl font-display font-extrabold mb-4">{form.title || 'Sin título'}</h1>
                <div className="prose-content" dangerouslySetInnerHTML={{ __html: form.content }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
