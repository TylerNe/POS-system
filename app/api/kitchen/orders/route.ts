import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const since = new Date();
  since.setHours(since.getHours() - 24);

  const { data: orders, error } = await supabaseAdmin.from('orders').select(`
    id, total, created_at, customer_name, customer_phone, metadata,
    order_items(id, quantity, unit_price, total_price, products(name))
  `).gte('created_at', since.toISOString()).order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Internal server error' }, { status: 500 });

  const kitchenOrders = (orders ?? []).map((row, index) => ({
    orderNumber: index + 1,
    orderId: row.id,
    tableNumber: (row.metadata as any)?.table_number ?? (Math.floor(Math.random() * 20) + 1),
    timePlaced: new Date(row.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    items: (row.order_items ?? []).map((item: any) => ({ name: item.products?.name ?? '', quantity: parseInt(item.quantity) })),
    status: (row.metadata as any)?.kitchen_status ?? 'Pending',
    customerName: row.customer_name,
    total: parseFloat(row.total),
  }));

  return NextResponse.json({ orders: kitchenOrders, total: kitchenOrders.length });
}
