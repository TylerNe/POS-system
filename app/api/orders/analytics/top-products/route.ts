import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '10');
  const period = req.nextUrl.searchParams.get('period') ?? 'month';

  const since = new Date();
  switch (period) {
    case 'day':   since.setDate(since.getDate() - 1); break;
    case 'week':  since.setDate(since.getDate() - 7); break;
    case 'year':  since.setFullYear(since.getFullYear() - 1); break;
    default:      since.setDate(since.getDate() - 30);
  }

  try {
    const { data: items, error } = await supabaseAdmin.from('order_items').select(`
      product_id, quantity, total_price,
      products(id, name, category, price),
      orders!inner(created_at)
    `).gte('orders.created_at', since.toISOString());
    if (error) throw error;

    const productMap = new Map<string, any>();
    for (const item of items ?? []) {
      const product = (item as any).products;
      if (!product) continue;
      if (!productMap.has(item.product_id)) {
        productMap.set(item.product_id, { id: product.id, name: product.name, category: product.category, price: parseFloat(product.price), total_sold: 0, total_revenue: 0 });
      }
      const e = productMap.get(item.product_id)!;
      e.total_sold += parseInt(item.quantity);
      e.total_revenue += parseFloat(item.total_price);
    }

    const top_products = Array.from(productMap.values())
      .sort((a, b) => b.total_sold - a.total_sold).slice(0, limit);

    return NextResponse.json({ top_products, period, limit });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
