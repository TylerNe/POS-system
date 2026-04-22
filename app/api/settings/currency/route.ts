import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

const DEFAULT = { code: 'AUD', symbol: '$', name: 'Australian Dollar' };

export async function GET(req: NextRequest) {
  const { data } = await supabaseAdmin.from('system_settings').select('value').eq('key', 'currency').single();
  return NextResponse.json({ currency: data?.value ?? DEFAULT });
}

async function handleUpdate(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;
  
  const { code, symbol, name } = await req.json();
  if (!code || !symbol || !name) return NextResponse.json({ error: 'Code, symbol, and name are required' }, { status: 400 });

  const { error } = await supabaseAdmin
    .from('system_settings')
    .upsert({ 
      key: 'currency', 
      value: { code, symbol, name }, 
      updated_at: new Date().toISOString() 
    });

  if (error) {
    console.error('Update currency error:', error);
    return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Currency updated', currency: { code, symbol, name } });
}

export async function PUT(req: NextRequest) {
  return handleUpdate(req);
}

export async function POST(req: NextRequest) {
  return handleUpdate(req);
}
