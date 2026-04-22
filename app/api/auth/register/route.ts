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
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single();
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { username, role },
    });
    if (authError) {
      if (authError.message.includes('already registered'))
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      throw authError;
    }

    const user = authData.user!;
    await supabaseAdmin.from('profiles').update({ username, role }).eq('id', user.id);

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, username, email: user.email, role, created_at: user.created_at },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
