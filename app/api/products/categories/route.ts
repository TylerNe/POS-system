import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin.from('products').select('category').order('category', { ascending: true });
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  const categories = [...new Set((data ?? []).map(row => row.category))];
  return NextResponse.json({ categories });
}
