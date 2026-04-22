import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    // 1. Kiểm tra trực tiếp trong bảng 'users' của bạn
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password) // So sánh trực tiếp văn bản thuần như bạn đã nhập
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // 2. Tạo một token giả hoặc dùng chính ID làm token để Frontend không bị lỗi
    // (Vì chúng ta đang dùng bảng custom, không qua Supabase Auth mặc định)
    // Sau này nếu muốn bảo mật hơn, ta sẽ tích hợp JWT sau.
    const token = `fake-jwt-token-${user.id}`;

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
