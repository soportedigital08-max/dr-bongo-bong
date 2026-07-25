'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }
      localStorage.setItem('dbb_token', data.token);
      router.push('/admin');
    } catch {
      setError('No se pudo conectar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <form onSubmit={handleSubmit} className="bg-card border border-white/5 rounded-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-display font-extrabold text-2xl">
            <span className="text-accent">DR</span> BONGO BONG
          </div>
          <p className="text-text-3 text-sm mt-1">Panel de administración</p>
        </div>

        {error && <div className="bg-accent/20 border border-accent text-white text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}

        <label className="block text-sm text-text-2 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 mb-4 text-white focus:border-accent outline-none"
        />

        <label className="block text-sm text-text-2 mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full bg-bg-3 border border-white/10 rounded-lg px-3 py-2 mb-6 text-white focus:border-accent outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white font-bold rounded-lg px-3 py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
