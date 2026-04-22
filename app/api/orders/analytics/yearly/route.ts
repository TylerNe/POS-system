import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  try {
    const { data: orders, error } = await supabaseAdmin.from('orders')
      .select('created_at, total, payment_method').order('created_at', { ascending: true });
    if (error) throw error;

    const byYear = new Map<number, any>();
    for (const order of orders ?? []) {
      const year = new Date(order.created_at).getFullYear();
      const total = parseFloat(order.total);
      if (!byYear.has(year)) byYear.set(year, { year, orders_count: 0, revenue: 0, cash_revenue: 0, card_revenue: 0, digital_revenue: 0 });
      const e = byYear.get(year)!;
      e.orders_count++; e.revenue += total;
      if (order.payment_method === 'cash') e.cash_revenue += total;
      if (order.payment_method === 'card') e.card_revenue += total;
      if (order.payment_method === 'digital') e.digital_revenue += total;
    }

    const yearly_sales = Array.from(byYear.values())
      .sort((a, b) => b.year - a.year)
      .map(row => ({ ...row, avg_order_value: row.orders_count > 0 ? row.revenue / row.orders_count : 0 }));

    return NextResponse.json({ yearly_sales });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
