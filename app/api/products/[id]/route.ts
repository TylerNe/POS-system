import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireAuth(req);
  if (result instanceof NextResponse) return result;

  const { data: product, error } = await supabaseAdmin.from('products').select('*').eq('id', params.id).single();
  if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ product: { ...product, price: parseFloat(product.price) } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const updates = await req.json();
  const { data: product, error } = await supabaseAdmin.from('products')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', params.id).select().single();
  if (error || !product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ message: 'Product updated', product: { ...product, price: parseFloat(product.price) } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { data, error } = await supabaseAdmin.from('products').delete().eq('id', params.id).select().single();
  if (error || !data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  return NextResponse.json({ message: 'Product deleted successfully' });
}
