import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const possibleSql = [
  path.join(__dirname, '..', 'wple_posts.sql'),
  path.join(__dirname, '..', 'wple_posts (1).sql'),
  ...fs.readdirSync(path.join(__dirname, '..'))
    .filter(f => /^wple.*\.sql$/i.test(f))
    .map(f => path.join(__dirname, '..', f))
];

const SQL_PATH = possibleSql.find(p => fs.existsSync(p));
if (!SQL_PATH) {
  console.error('❌ No se encontró wple_posts.sql en la carpeta del proyecto.');
  process.exit(1);
}
console.log('📄 SQL encontrado: ' + path.basename(SQL_PATH));

const PORTADAS_DIR = path.join(__dirname, '..', '.next', 'standalone', 'public', 'portadas');
if (!fs.existsSync(PORTADAS_DIR)) {
  console.error('❌ No existe la carpeta: ' + PORTADAS_DIR);
  process.exit(1);
}

function findPortadas(dir) {
  let out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out = out.concat(findPortadas(full));
    } else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const allPortadas = findPortadas(PORTADAS_DIR);
console.log(`🖼️  ${allPortadas.length} archivos en portadas/ (incluye subcarpetas)\n`);

function extractValueBlocks(sql) {
  const reBlock = /INSERT INTO `wple_posts`[\s\S]*?VALUES\s*([\s\S]*?);\s*COMMIT/s;
  const blocks = [];
  let m;
  const globalRe = /INSERT INTO `wple_posts`[\s\S]*?VALUES\s*([\s\S]*?);\s*COMMIT/gs;
  while ((m = globalRe.exec(sql)) !== null) blocks.push(m[1]);
  return blocks;
}

function splitRows(text) {
  const rows = [];
  let current = '';
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (const ch of text) {
    if (esc) { current += ch; esc = false; continue; }
    if (ch === '\\') { esc = true; current += ch; continue; }
    if (ch === "'") { inStr = !inStr; current += ch; continue; }
    if (!inStr && ch === '(') { depth++; current += ch; continue; }
    if (!inStr && ch === ')') {
      depth--;
      if (depth === 0) {
        rows.push(current.trim());
        current = '';
        continue;
      } else {
        current += ch;
        continue;
      }
    }
    current += ch;
  }

  return rows;
}

function parseRow(row) {
  let text = row.trim();
  if (text.startsWith('(')) text = text.slice(1);
  if (text.endsWith(')')) text = text.slice(0, -1);

  const parts = [];
  let cur = '';
  let inStr = false;
  let esc = false;

  for (const ch of text) {
    if (esc) { cur += ch; esc = false; continue; }
    if (ch === '\\') { esc = true; cur += ch; continue; }
    if (ch === "'") { inStr = !inStr; cur += ch; continue; }
    if (ch === ',' && !inStr) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  parts.push(cur.trim());

  const unquote = (s) => {
    if (!s) return '';
    let v = s.trim();
    if (v.startsWith('(')) v = v.slice(1);
    if (v.endsWith(')')) v = v.slice(0, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    return v.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  };

  if (parts.length < 21) return null;

  return {
    id: parseInt(unquote(parts[0])),
    post_date: unquote(parts[2]),
    post_content: unquote(parts[4]),
    post_title: unquote(parts[5]),
    post_status: unquote(parts[7]),
    post_name: unquote(parts[11]),
    guid: unquote(parts[18]),
    post_type: unquote(parts[20]),
  };
}

function extractImagesFromContent(content) {
  const imgs = [];
  const regex = /<img[^>]+src=["']([^"']+)["']/g;
  let m;
  while ((m = regex.exec(content)) !== null) imgs.push(m[1]);
  return imgs;
}

function makeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function matchPortada(images, portadas) {
  for (const url of images) {
    const fn = path.basename(url).split('?')[0].toLowerCase();
    const exact = portadas.find(f => path.basename(f).toLowerCase() === fn);
    if (exact) return exact;
  }

  for (const url of images) {
    const fn = path.basename(url).split('?')[0].toLowerCase().replace(/\.\w+$/, '');
    const partial = portadas.find(f => {
      const fb = path.basename(f).toLowerCase().replace(/\.\w+$/, '');
      return fb === fn || fb.includes(fn) || fn.includes(fb);
    });
    if (partial) return partial;
  }

  return null;
}

function main() {
  console.log('📖 Leyendo SQL...');
  const sql = fs.readFileSync(SQL_PATH, 'utf-8');
  console.log(`   Tamaño: ${(sql.length / 1024 / 1024).toFixed(1)} MB`);

  const blocks = extractValueBlocks(sql);
  console.log(`   Bloques INSERT encontrados: ${blocks.length}`);

  const rows = [];
  for (const block of blocks) rows.push(...splitRows(block));
  console.log(`   Filas candidates: ${rows.length}`);

  const posts = [];
  for (const row of rows) {
    const p = parseRow(row);
    if (!p) continue;
    if (p.post_type !== 'post') continue;
    if (p.post_status !== 'publish') continue;
    const images = extractImagesFromContent(p.post_content || '');
    posts.push({ ...p, images });
  }

  console.log(`📊 Posts publicados: ${posts.length}`);

  const resultados = [];
  const matched = new Set();
  const unmatched = [];

  for (const post of posts) {
    const localPath = matchPortada(post.images, allPortadas);
    const publicPath = localPath
      ? '/portadas/' + path.relative(PORTADAS_DIR, localPath).replace(/\\/g, '/')
      : null;

    resultados.push({
      wp_id: post.id,
      slug: post.post_name,
      title: post.post_title,
      images: post.images.length ? post.images : null,
      portadaPath: publicPath,
    });

    if (publicPath) matched.add(post.id);
    else unmatched.push(post.post_name);

    if (resultados.length % 100 === 0) console.log(`   procesados: ${resultados.length}/${posts.length}`);
  }

  const outputPath = path.join(__dirname, 'portadas-wp-mapeo.json');
  fs.writeFileSync(outputPath, JSON.stringify(resultados, null, 2));

  console.log(`\n💾 Guardado en: ${outputPath}`);
  console.log(`✅ ${matched.size}/${posts.length} posts con portada asignada`);
  console.log(`❌ ${unmatched.length} posts sin portada`);

  if (unmatched.length) {
    console.log('\n--- Ejemplos sin portada ---');
    unmatched.slice(0, 20).forEach(s => console.log(' - ' + s));
  }

  console.log('\n--- Primeros resultados ---');
  resultados.slice(0, 10).forEach(r => {
    console.log(`[${r.wp_id}] ${r.slug} → ${r.portadaPath || '(sin portada)'}`);
  });
}

main();
