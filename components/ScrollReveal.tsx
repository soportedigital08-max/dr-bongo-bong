'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    document.documentElement.classList.add('js');

    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' }
    );
    els.forEach((el) => io.observe(el));

    // Fallback: fuerza visibilidad tras 1.2s por si el observer no dispara
    const t = setTimeout(() => {
      els.forEach((el) => el.classList.add('in'));
    }, 1200);

    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, []);

  return null;
}
