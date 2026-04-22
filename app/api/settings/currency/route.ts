import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT = { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' };

export async function GET(req: NextRequest) {
  const { data } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'currency').single();
  return NextResponse.json({ currency: data?.value ?? DEFAULT });
}

export async function PUT(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;
  const { code, symbol, name } = await req.json();
  if (!code || !symbol || !name) return NextResponse.json({ error: 'Code, symbol, and name are required' }, { status: 400 });
  await supabaseAdmin.from('system_settings').upsert({ key: 'currency', value: { code, symbol, name }, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return NextResponse.json({ message: 'Currency updated', currency: { code, symbol, name } });
}
