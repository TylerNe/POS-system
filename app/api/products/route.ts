import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  try {
    const result = await requireAuth(req);
    if (result instanceof NextResponse) return result;

    const params = req.nextUrl.searchParams;
    const limit = parseInt(params.get('limit') ?? '50');
    const offset = parseInt(params.get('offset') ?? '0');
    const category = params.get('category');
    const search = params.get('search');

    let query = supabaseAdmin.from('products').select('*', { count: 'exact' })
      .order('name', { ascending: true }).range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);
    if (search) query = query.or(`name.ilike.%${search}%,category.ilike.%${search}%`);

    const { data: products, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      products: (products ?? []).map(p => ({ 
        ...p, 
        price: parseFloat(p.price || 0),
        stock: p.stock !== undefined ? p.stock : p.stock_quantity
      })),
      pagination: { total: count ?? 0, limit, offset, hasMore: offset + limit < (count ?? 0) },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const result = await requireRole(req, ['admin']);
    if (result instanceof NextResponse) return result;

    const body = await req.json();
    const { name, price, category, stock, image, barcode } = body;
    
    if (!name || !category || price === undefined)
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 });

    if (barcode) {
      const { data: existing } = await supabaseAdmin.from('products').select('id').eq('barcode', barcode).single();
      if (existing) return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
    }

    // Tự động chọn đúng cột stock
    const { data: schema } = await supabaseAdmin.from('products').select('*').limit(1);
    const hasStock = schema && schema.length > 0 && 'stock' in schema[0];
    
    const insertData: any = {
      name,
      price,
      category,
      image: image || null,
      barcode: barcode || null
    };
    
    if (hasStock) insertData.stock = stock || 0;
    else insertData.stock_quantity = stock || 0;

    const { data: product, error } = await supabaseAdmin.from('products')
      .insert(insertData)
      .select().single();
    
    if (error) throw error;

    return NextResponse.json({ 
      message: 'Product created successfully', 
      product: { ...product, price: parseFloat(product.price) } 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
