import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const months = parseInt(req.nextUrl.searchParams.get('months') ?? '12');
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  since.setDate(1);

  try {
    const { data: orders, error } = await supabaseAdmin.from('orders')
      .select('created_at, total, payment_method')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    const byMonth = new Map<string, any>();
    for (const order of orders ?? []) {
      const d = new Date(order.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = parseFloat(order.total);
      if (!byMonth.has(key)) byMonth.set(key, { month: `${key}-01`, year: d.getFullYear(), month_num: d.getMonth() + 1, orders_count: 0, revenue: 0, cash_revenue: 0, card_revenue: 0, digital_revenue: 0 });
      const e = byMonth.get(key)!;
      e.orders_count++; e.revenue += total;
      if (order.payment_method === 'cash') e.cash_revenue += total;
      if (order.payment_method === 'card') e.card_revenue += total;
      if (order.payment_method === 'digital') e.digital_revenue += total;
    }

    const monthly_sales = Array.from(byMonth.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .map(row => ({ ...row, avg_order_value: row.orders_count > 0 ? row.revenue / row.orders_count : 0 }));

    return NextResponse.json({ monthly_sales });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
