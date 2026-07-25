// migrate-wp.mjs — Parsea el export de WordPress y vuelca a SQLite (Prisma).
// Uso: node scripts/migrate-wp.mjs [ruta-a-xml]
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const XML_PATH = process.argv[2] || path.join(process.cwd(), '..', 'drbongobong-programaderadioystreamingcultural.WordPress.2026-06-08.xml');

function cdata(s) {
  if (!s) return '';
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
  return (m ? m[1] : s).trim();
}

function extract(tag, block) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return null;
  return cdata(m[1]).trim();
}

function extractAttr(tag, attr, block) {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*${attr}="([^"]*)"[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!m) return null;
  return { attr: m[1], inner: cdata(m[2]) };
}

function decodeEntities(s) {
  return (s || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, '’')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ');
}

async function main() {
  if (!fs.existsSync(XML_PATH)) {
    console.error('❌ No encontré el XML en', XML_PATH);
    process.exit(1);
  }
  const xml = fs.readFileSync(XML_PATH, 'utf8');

  // 1) Categorías definidas globalmente en <wp:category> ... </wp:category>
  const catBlocks = xml.match(/<wp:category>[\s\S]*?<\/wp:category>/g) || [];
  const categories = new Map();
  for (const cb of catBlocks) {
    const name = decodeEntities(extract('wp:cat_name', cb));
    const slug = extract('wp:category_nicename', cb) || slugify(name);
    if (name) categories.set(slug, { name, slug });
  }

  // 2) Items <item>
  const items = xml.split('<item>').slice(1).map((s) => '<item>' + s.split('</item>')[0] + '</item>');
  const authors = new Map();
  const posts = [];

  for (const block of items) {
    const type = extract('wp:post_type', block);
    const status = extract('wp:status', block);

    if (type !== 'post') continue;
    if (status !== 'publish') continue;

    const title = decodeEntities(extract('title', block));
    const content = decodeEntities(extract('content:encoded', block));
    const date = extract('wp:post_date', block);
    const authorLogin = extract('dc:creator', block) || 'drbongobong';

    if (!title || !content || content.length < 30) continue;

    // Primera categoría real del post (domain="category")
    let catSlug = null;
    const catMatches = [...block.matchAll(/<category\b[^>]*domain="category"[^>]*nicename="([^"]*)"[^>]*>([\s\S]*?)<\/category>/g)];
    if (catMatches.length) catSlug = catMatches[0][1];

    if (authorLogin && !authors.has(authorLogin)) {
      authors.set(authorLogin, { login: authorLogin, name: authorLogin, email: `${authorLogin}@drbongobong.com.ar` });
    }

    posts.push({
      title,
      slug: slugify(title),
      content,
      date: date ? new Date(date) : new Date(),
      authorLogin,
      catSlug,
    });
  }

  console.log(`📦 ${posts.length} posts publicados | ${categories.size} categorías | ${authors.size} autores`);

  // Insert authors
  const authorIds = {};
  for (const a of authors.values()) {
    const u = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: { email: a.email, name: a.name, passwordHash: '$2a$10$placeholderMigratedUserNoLogin', role: 'author' },
    });
    authorIds[a.login] = u.id;
  }

  // Insert categories
  const catIds = {};
  for (const c of categories.values()) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    });
    catIds[c.slug] = cat.id;
  }

  // Insert posts
  let count = 0;
  for (const p of posts) {
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        title: p.title,
        slug: p.slug,
        content: p.content,
        excerpt: p.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160),
        categoryId: p.catSlug ? catIds[p.catSlug] || null : null,
        authorId: authorIds[p.authorLogin] || null,
        status: 'published',
        publishedAt: p.date,
      },
    });
    count++;
  }

  console.log(`✅ Migrados ${count} posts con ${Object.keys(catIds).length} categorías asignadas.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
