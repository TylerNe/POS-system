import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT = { code: 'vi', name: 'Vietnamese' };

export async function GET(req: NextRequest) {
  const { data } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'language').single();
  return NextResponse.json({ language: data?.value ?? DEFAULT });
}

async function handleUpdate(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;
  
  const { code, name } = await req.json();
  if (!code || !name) return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('system_settings')
    .upsert({ 
      key: 'language', 
      value: { code, name }, 
      updated_at: new Date().toISOString() 
    });

  if (error) {
    console.error('Update language error:', error);
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Language updated', language: { code, name } });
}

export async function PUT(req: NextRequest) {
  return handleUpdate(req);
}

export async function POST(req: NextRequest) {
  return handleUpdate(req);
}
