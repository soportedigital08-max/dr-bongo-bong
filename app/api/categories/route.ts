import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')?.replace('Bearer ', '');
  const user = verifyToken(auth || '');
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, slug, description } = body;
  if (!name) return NextResponse.json({ error: 'name requerido' }, { status: 400 });

  const category = await prisma.category.create({
    data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), description: description || null },
  });
  return NextResponse.json({ category }, { status: 201 });
}
