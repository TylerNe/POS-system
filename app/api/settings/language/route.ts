import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT = { code: 'vi', name: 'Vietnamese' };

export async function GET(req: NextRequest) {
  const { data } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'language').single();
  return NextResponse.json({ language: data?.value ?? DEFAULT });
}

export async function PUT(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;
  const { code, name } = await req.json();
  if (!code || !name) return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });
  await supabaseAdmin.from('system_settings').upsert({ key: 'language', value: { code, name }, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  return NextResponse.json({ message: 'Language updated', language: { code, name } });
}
