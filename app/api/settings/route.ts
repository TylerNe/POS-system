import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin.from('system_settings').select('key, value');
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  const settings: Record<string, any> = {};
  (data ?? []).forEach(row => { settings[row.key] = row.value; });
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { key, value } = await req.json();
  if (!key || value === undefined) return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });

  const { data, error } = await supabaseAdmin.from('system_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' }).select().single();
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ message: 'Setting updated', setting: data });
}
