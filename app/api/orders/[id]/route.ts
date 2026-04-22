import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { data: order, error } = await supabaseAdmin.from('orders').select(`
    *, profiles!orders_user_id_fkey(username),
    order_items(id, product_id, quantity, unit_price, total_price, products(name, category))
  `).eq('id', params.id).single();

  if (error || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      paymentMethod: order.payment_method,
      customerName: order.customer_name,
      cashier_name: order.profiles?.username,
      metadata: order.metadata || {},
      items: (order.order_items ?? []).map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name ?? '',
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price),
      })),
    },
  });
}
