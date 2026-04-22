import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const params = req.nextUrl.searchParams;
  const limit = parseInt(params.get('limit') ?? '50');
  const offset = parseInt(params.get('offset') ?? '0');
  const category = params.get('category');
  const search = params.get('search');

  try {
    let query = supabaseAdmin.from('products').select('*', { count: 'exact' })
      .order('name', { ascending: true }).range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);

    const { data: products, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      products: (products ?? []).map(p => ({ ...p, price: parseFloat(p.price) })),
      pagination: { total: count ?? 0, limit, offset, hasMore: offset + limit < (count ?? 0) },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { name, price, category, stock, image, barcode } = await req.json();
  if (!name || !category || price === undefined || stock === undefined)
    return NextResponse.json({ error: 'Name, price, category, and stock are required' }, { status: 400 });

  try {
    if (barcode) {
      const { data: existing } = await supabaseAdmin.from('products').select('id').eq('barcode', barcode).single();
      if (existing) return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
    }

    const { data: product, error } = await supabaseAdmin.from('products')
      .insert({ name, price, category, stock, image: image || null, barcode: barcode || null })
      .select().single();
    if (error) throw error;

    return NextResponse.json({ message: 'Product created successfully', product: { ...product, price: parseFloat(product.price) } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
