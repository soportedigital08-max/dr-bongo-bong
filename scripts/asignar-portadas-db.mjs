// asignar-portadas-db.mjs
// Lee los posts de prisma/dev.db, extrae la primera <img> del content HTML,
// busca ese archivo por nombre dentro de portadas/ y actualiza featuredImage.
// Maneja sufijos de tamaño de WP (-1024x768, -scaled) y formatos .avif/.webp.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTADAS_DIR = '/home/drbongob/public_html/portadas';
const prisma = new PrismaClient();

// 1) Indexar portadas/ recursivamente: basename(lower) -> ruta relativa
function indexPortadas(dir, map) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) indexPortadas(full, map);
    else if (/\.(jpg|jpeg|png|webp|gif|avif)$/i.test(entry.name)) {
      const key = entry.name.toLowerCase();
      if (!map.has(key)) map.set(key, path.relative(PORTADAS_DIR, full).replace(/\\/g, '/'));
    }
  }
}

// Variaciones de nombre: sin sufijo de tamaño WP y sin extensión
function variantes(baseName) {
  const dot = baseName.lastIndexOf('.');
  const name = dot >= 0 ? baseName.slice(0, dot) : baseName;
  const ext = dot >= 0 ? baseName.slice(dot) : '';
  const out = new Set([baseName]);
  // quitar sufijo -WxH (ej: -1024x768) o -scaled
  const base = name.replace(/-\d+x\d+$/i, '').replace(/-scaled$/i, '');
  if (base !== name) out.add(base + ext);
  return [...out];
}

function primeraImagen(content) {
  const m = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

const GENERICA = '/portadas/bonguito-logo.png';

async function main() {
  console.log('📁 Indexando portadas/ ...');
  const map = new Map();
  indexPortadas(PORTADAS_DIR, map);
  console.log(`   ${map.size} imágenes indexadas`);

  const posts = await prisma.post.findMany({
    where: { featuredImage: null },
    select: { id: true, slug: true, content: true },
  });
  console.log(`📦 Posts sin portada asignada: ${posts.length}`);

  let asignadas = 0;
  let genericas = 0;
  let sinImg = 0;

  for (const post of posts) {
    const src = primeraImagen(post.content || '');
    let asignada = false;
    if (src) {
      const base = path.basename(src).split('?')[0].toLowerCase();
      for (const v of variantes(base)) {
        const rel = map.get(v);
        if (rel) {
          await prisma.post.update({
            where: { id: post.id },
            data: { featuredImage: '/portadas/' + rel },
          });
          asignadas++;
          asignada = true;
          break;
        }
      }
    }
    if (!asignada) {
      await prisma.post.update({
        where: { id: post.id },
        data: { featuredImage: GENERICA },
      });
      genericas++;
    }
  }

  console.log(`\n✅ Asignadas desde contenido: ${asignadas}`);
  console.log(`🅱️  Genérica (sin img / sin match): ${genericas}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
