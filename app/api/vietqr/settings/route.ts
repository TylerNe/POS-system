import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const { data } = await supabaseAdmin.from('vietqr_settings').select('settings').eq('user_id', result.id).single();
  return NextResponse.json({ settings: data?.settings ?? null });
}

export async function POST(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const settings = await req.json();
  const { data, error } = await supabaseAdmin.from('vietqr_settings').insert({ user_id: result.id, settings }).select().single();
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ message: 'VietQR settings saved', settings: data.settings }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const settings = await req.json();
  const { data, error } = await supabaseAdmin.from('vietqr_settings')
    .upsert({ user_id: result.id, settings, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select().single();
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  return NextResponse.json({ message: 'VietQR settings updated', settings: data.settings });
}
