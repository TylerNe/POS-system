import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const params = req.nextUrl.searchParams;
  const start_date = params.get('start_date');
  const end_date = params.get('end_date');

  try {
    let query = supabaseAdmin.from('orders').select('total, payment_method');
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data: orders, error } = await query;
    if (error) throw error;

    const total_orders = orders?.length ?? 0;
    const total_revenue = orders?.reduce((sum, o) => sum + parseFloat(o.total), 0) ?? 0;

    return NextResponse.json({
      stats: {
        total_orders,
        total_revenue,
        average_order_value: total_orders > 0 ? total_revenue / total_orders : 0,
        cash_orders: orders?.filter(o => o.payment_method === 'cash').length ?? 0,
        card_orders: orders?.filter(o => o.payment_method === 'card').length ?? 0,
        digital_orders: orders?.filter(o => o.payment_method === 'digital').length ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
