const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const PORT = path.join(__dirname, '..', '.next', 'standalone', 'public', 'portadas');

function idx(d, map) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const f = path.join(d, e.name);
    if (e.isDirectory()) idx(f, map);
    else if (/\.(jpg|jpeg|png|webp|gif)$/i.test(e.name)) {
      map.set(e.name.toLowerCase(), path.relative(PORT, f).replace(/\\/g, '/'));
    }
  }
}

(async () => {
  const map = new Map();
  idx(PORT, map);
  const p = new PrismaClient();
  const sin = await p.post.findMany({ where: { featuredImage: null }, select: { slug: true, content: true } });
  for (const x of sin) {
    const m = (x.content || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    if (m) {
      const base = path.basename(m[1]).split('?')[0].toLowerCase();
      console.log('CON-IMG-SIN-MATCH:', x.slug, '|', base, '| enMapa:', map.has(base));
    }
  }
  await p.$disconnect();
})();
