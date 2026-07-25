// seed.mjs — Crea el usuario admin y algunas categorías base.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@drbongobong.com.ar';
  const password = 'BongoBong2026!';
  const hash = bcrypt.hashSync(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Dr Bongo Bong', passwordHash: hash, role: 'admin' },
  });
  console.log('👤 Admin:', admin.email, '| password:', password);

  const baseCats = ['Música', 'Cultura', 'Radio', 'Streaming', 'IA', 'Entrevistas'];
  for (const name of baseCats) {
    await prisma.category.upsert({
      where: { slug: name.toLowerCase() },
      update: {},
      create: { name, slug: name.toLowerCase() },
    });
  }
  console.log('📂 Categorías base listas.');
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
