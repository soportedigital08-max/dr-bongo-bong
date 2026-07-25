// reset-and-migrate.mjs — Limpia tablas locales y re-migra desde el XML.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({ where: { role: 'author' } });
  console.log('🧹 Tablas locales limpias.');
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
