import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { username, email, password, role = 'cashier' } = await req.json();

  if (!username || !email || !password)
    return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  if (!['admin', 'cashier'].includes(role))
    return NextResponse.json({ error: 'Role must be admin or cashier' }, { status: 400 });

  try {
    // 1. Kiểm tra xem username đã tồn tại chưa
    const { data: existing } = await supabaseAdmin.from('users').select('id').eq('username', username).single();
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    // 2. Kiểm tra email
    const { data: existingEmail } = await supabaseAdmin.from('users').select('id').eq('email', email).single();
    if (existingEmail) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

    // 3. Chèn trực tiếp vào bảng users của bạn (Lưu mật khẩu văn bản thuần để đồng bộ với admin bạn vừa tạo)
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
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
