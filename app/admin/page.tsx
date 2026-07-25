'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  isAIContent: boolean;
  publishedAt: string;
  category?: { name: string } | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('dbb_token') || '';
    if (!t) {
      router.push('/admin/login');
      return;
    }
    setToken(t);
    fetchPosts(t);
  }, []);

  async function fetchPosts(t: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/posts', { headers: { Authorization: 'Bearer ' + t }, cache: 'no-store' });
      if (res.status === 401) {
        localStorage.removeItem('dbb_token');
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError('No se pudieron cargar las publicaciones');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta publicación?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
      if (res.status === 401) {
        localStorage.removeItem('dbb_token');
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(`No se pudo borrar (HTTP ${res.status}). ${data?.error || ''}`);
        return;
      }
    } catch (e) {
      alert('Error de red al intentar borrar. Probá de nuevo.');
      return;
    }
    fetchPosts(token);
  }

  function logout() {
    localStorage.removeItem('dbb_token');
    router.push('/admin/login');
  }

  return (
    <div className="pt-24 max-w-6xl mx-auto px-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-extrabold">Panel</h1>
          <p className="text-text-3 text-sm">Gestioná el contenido del sitio</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/new" className="bg-accent hover:bg-accent-hover text-white font-bold rounded-lg px-4 py-2 text-sm transition-colors">
            + Nueva nota
          </Link>
          <button onClick={logout} className="border border-white/20 text-text-2 hover:text-white rounded-lg px-4 py-2 text-sm">
            Salir
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-text-3">Cargando…</p>
      ) : error ? (
        <p className="text-accent">{error}</p>
      ) : posts.length === 0 ? (
        <p className="text-text-3">No hay publicaciones. Creá la primera o migrá WordPress.</p>
      ) : (
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-text-3 border-b border-white/5">
              <tr>
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4 hidden md:table-cell">Categoría</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-bg-3">
                  <td className="p-4">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-text-3">
                      {p.isAIContent && <span className="text-accent font-bold">IA · </span>}
                      {new Date(p.publishedAt).toLocaleDateString('es-AR')}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-text-2">{p.category?.name || '—'}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'published' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <a href={`/posts/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-text-2 hover:text-white mr-3">Ver</a>
                    <Link href={`/admin/edit/${p.id}`} className="text-accent hover:underline mr-3">Editar</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-text-3 hover:text-accent">Borrar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
