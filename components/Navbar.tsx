'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    // Sesión
    const check = () => setLogged(!!localStorage.getItem('dbb_token'));
    check();
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('storage', check);
    };
  }, []);

  function logout() {
    localStorage.removeItem('dbb_token');
    setLogged(false);
    window.location.href = '/';
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${scrolled ? 'glass' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-extrabold text-xl tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/bonguito-logo.png" alt="Dr Bongo Bong" className="h-8 w-8 object-contain bonguito" />
          <span>BONGO BONG</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-accent font-medium text-text-2">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <Link href="/posts" className="hover:text-white transition-colors">Artículos</Link>
          <Link href="/categories" className="hover:text-white transition-colors">Categorías</Link>
          <Link href="/radio" className="hover:text-white transition-colors">Radio</Link>
          <a href="https://www.instagram.com/drbongobong" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Redes</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://drbongobong.com.ar/radio"
            className="live-glow flex items-center gap-2 bg-accent hover:bg-accent-2 text-white px-4 py-2 rounded-full text-sm font-accent font-bold transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white pulse-dot" />
            EN VIVO
          </a>

          {logged ? (
            <div className="hidden md:flex items-center gap-3">
              <span className="session-pill"><span className="dot" /> Sesión activa</span>
              <Link href="/admin/new" className="text-sm text-accent hover:underline">Nueva nota</Link>
              <Link href="/admin" className="text-sm text-text-2 hover:text-white">Panel</Link>
              <button onClick={logout} className="text-sm text-text-3 hover:text-white">Salir</button>
            </div>
          ) : (
            <Link href="/admin/login" className="text-sm text-text-2 hover:text-white hidden md:block">Admin</Link>
          )}

          <button className="md:hidden text-white" onClick={() => setOpen(!open)} aria-label="menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden glass px-4 py-4 flex flex-col gap-3 text-text-2">
          <Link href="/" onClick={() => setOpen(false)}>Inicio</Link>
          <Link href="/posts" onClick={() => setOpen(false)}>Artículos</Link>
          <Link href="/categories" onClick={() => setOpen(false)}>Categorías</Link>
          <Link href="/radio" onClick={() => setOpen(false)}>Radio</Link>
          {logged ? (
            <>
              <Link href="/admin/new" onClick={() => setOpen(false)}>Nueva nota</Link>
              <Link href="/admin" onClick={() => setOpen(false)}>Panel</Link>
              <button onClick={() => { setOpen(false); logout(); }}>Salir</button>
            </>
          ) : (
            <Link href="/admin/login" onClick={() => setOpen(false)}>Admin</Link>
          )}
        </nav>
      )}
    </header>
  );
}
