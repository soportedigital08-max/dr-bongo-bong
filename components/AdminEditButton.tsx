'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Muestra un botón flotante "Editar" en el artículo solo si hay sesión de admin.
export default function AdminEditButton({ postId }: { postId: string }) {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    setLogged(!!localStorage.getItem('dbb_token'));
  }, []);

  if (!logged) return null;

  return (
    <Link
      href={`/admin/edit/${postId}`}
      className="admin-edit-fab"
      title="Editar esta nota"
    >
      ✏️ Editar
    </Link>
  );
}
