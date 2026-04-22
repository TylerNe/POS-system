import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

function formatOrder(order: any) {
  if (!order) return null;
  return {
    ...order,
    subtotal: parseFloat(order.subtotal),
    tax: parseFloat(order.tax),
    discount: parseFloat(order.discount),
    total: parseFloat(order.total),
    paymentMethod: order.payment_method,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    timestamp: order.created_at,
    cashier_name: order.users?.username,
    metadata: order.metadata || {},
    items: (order.order_items ?? []).map((item: any) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.products?.name ?? '',
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
      total_price: parseFloat(item.total_price),
    })),
  };
}

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const params = req.nextUrl.searchParams;
  const limit = parseInt(params.get('limit') ?? '50');
  const offset = parseInt(params.get('offset') ?? '0');
  const start_date = params.get('start_date');
  const end_date = params.get('end_date');

  try {
    let query = supabaseAdmin.from('orders').select(`
      *, users!orders_user_id_fkey(username),
      order_items(id, product_id, quantity, unit_price, total_price, products(name))
    `, { count: 'exact' }).order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const { data: orders, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      orders: (orders ?? []).map(formatOrder),
      pagination: { total: count ?? 0, limit, offset, hasMore: offset + limit < (count ?? 0) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;
  const authUser = result;

  const { items, payment_method, discount = 0, customer_name, customer_phone, customer_email, metadata = {} } = await req.json();

  if (!items || items.length === 0)
    return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
  if (!['cash', 'card', 'digital'].includes(payment_method))
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });

  try {
    let subtotal = 0;
    const orderItems: any[] = [];

    for (const item of items) {
      const { data: product, error: productError } = await supabaseAdmin.from('products')
        .select('id, name, price, stock').eq('id', item.product_id).single();
      if (productError || !product) return NextResponse.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });

      const itemTotal = parseFloat(product.price) * item.quantity;
      subtotal += itemTotal;
      orderItems.push({ product_id: item.product_id, quantity: item.quantity, unit_price: parseFloat(product.price), total_price: itemTotal });
    }

    const tax = subtotal * 0.1;
    const total = subtotal + tax - discount;
    if (total < 0) return NextResponse.json({ error: 'Total cannot be negative' }, { status: 400 });

    const { data: order, error: orderError } = await supabaseAdmin.from('orders')
      .insert({ subtotal, tax, discount, total, payment_method, user_id: authUser.id, customer_name: customer_name || null, customer_phone: customer_phone || null, customer_email: customer_email || null, metadata })
      .select().single();
    if (orderError) throw orderError;

    await supabaseAdmin.from('order_items').insert(orderItems.map(item => ({ ...item, order_id: order.id })));

    // Update stock
    for (const item of orderItems) {
      const { data: p } = await supabaseAdmin.from('products').select('stock').eq('id', item.product_id).single();
      if (p) await supabaseAdmin.from('products').update({ stock: p.stock - item.quantity }).eq('id', item.product_id);
    }

    const { data: completeOrder } = await supabaseAdmin.from('orders').select(`
      *, users!orders_user_id_fkey(username),
      order_items(id, product_id, quantity, unit_price, total_price, products(name))
    `).eq('id', order.id).single();

    return NextResponse.json({ message: 'Order created successfully', order: formatOrder(completeOrder) }, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
