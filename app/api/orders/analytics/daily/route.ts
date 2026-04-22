import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30');
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const { data: orders, error } = await supabaseAdmin.from('orders')
      .select('created_at, total, payment_method')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });
    if (error) throw error;

    const byDate = new Map<string, any>();
    for (const order of orders ?? []) {
      const date = order.created_at.slice(0, 10);
      const total = parseFloat(order.total);
      if (!byDate.has(date)) byDate.set(date, { date, orders_count: 0, revenue: 0, cash_revenue: 0, card_revenue: 0, digital_revenue: 0 });
      const e = byDate.get(date)!;
      e.orders_count++; e.revenue += total;
      if (order.payment_method === 'cash') e.cash_revenue += total;
      if (order.payment_method === 'card') e.card_revenue += total;
      if (order.payment_method === 'digital') e.digital_revenue += total;
    }

    const daily_sales = Array.from(byDate.values())
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(row => ({ ...row, avg_order_value: row.orders_count > 0 ? row.revenue / row.orders_count : 0 }));

    return NextResponse.json({ daily_sales });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
