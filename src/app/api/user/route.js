// src/app/api/user/route.js
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, image } = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Profile update failed:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
