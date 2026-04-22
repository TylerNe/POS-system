import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const user = result;
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  // Refresh: validate current token and return user info
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return unauthorized();

  const result = await requireAuth(req);
  if (result instanceof NextResponse) return NextResponse.json({ error: 'Invalid token', code: 'TOKEN_EXPIRED' }, { status: 401 });
  const user = result;

  return NextResponse.json({ message: 'Token is valid', user, token });
}
