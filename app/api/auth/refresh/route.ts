import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, unauthorized } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return unauthorized();

  const result = await requireAuth(req);
  if (result instanceof NextResponse) {
    return NextResponse.json({ error: 'Invalid token', code: 'TOKEN_EXPIRED' }, { status: 401 });
  }

  return NextResponse.json({ message: 'Token is valid', user: result, token });
}
