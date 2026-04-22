import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0');

  try {
    const { data: users, error, count } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ 
      users: users ?? [], 
      total: count ?? 0, 
      limit, 
      offset 
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { username, email, password, role = 'cashier' } = await req.json();

  if (!username || !email || !password)
    return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });

  try {
    // 1. Kiểm tra username tồn tại
    const { data: existing } = await supabaseAdmin.from('users').select('id').eq('username', username).single();
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    // 2. Chèn vào bảng users
    const { data: newUser, error: insertError } = await supabaseAdmin.from('users').insert({
      username,
      email,
      password, // Plain text
      role
    }).select().single();

    if (insertError) throw insertError;

    return NextResponse.json({
      message: 'User created successfully',
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role, 
        created_at: newUser.created_at 
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
