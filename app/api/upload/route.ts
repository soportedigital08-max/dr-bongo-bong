import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Directorio físico donde Nginx sirve /portadas/
// En prod: /home/drbongob/public_html/portadas/uploads
// En dev local: ./public/portadas/uploads
const UPLOAD_DIR =
  process.env.UPLOAD_DIR ||
  (fs.existsSync('/home/drbongob/public_html/portadas')
    ? '/home/drbongob/public_html/portadas/uploads'
    : path.join(process.cwd(), 'public', 'portadas', 'uploads'));

const MAX_SIZE = 8 * 1024 * 1024; // 8 MB
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Falta el archivo (campo "file")' }, { status: 400 });

    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json({ error: `Tipo no permitido (${file.type}). Usá JPG, PNG, WebP, GIF o AVIF.` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'La imagen supera 8 MB. Reducila antes de subirla.' }, { status: 400 });
    }

    // Nombre seguro: fecha + nombre saneado
    const base = (file.name || 'imagen')
      .replace(/\.[^.]+$/, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .slice(0, 60);
    const stamp = Date.now().toString(36);
    const filename = `${base}-${stamp}${ext}`;

    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    const url = `/portadas/uploads/${filename}`;
    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error al subir' }, { status: 500 });
  }
}
