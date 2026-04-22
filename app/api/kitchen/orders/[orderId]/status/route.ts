import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { status } = await req.json();
  if (!['Pending', 'In Progress', 'Done'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const { data: current, error: fetchError } = await supabaseAdmin
    .from('orders').select('metadata').eq('id', params.orderId).single();
  if (fetchError || !current) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { data, error } = await supabaseAdmin.from('orders')
    .update({ metadata: { ...(current.metadata as object ?? {}), kitchen_status: status }, updated_at: new Date().toISOString() })
    .eq('id', params.orderId).select().single();
  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  return NextResponse.json({ message: 'Status updated', order: data });
}
