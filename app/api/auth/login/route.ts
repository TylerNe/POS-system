import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
  }

  try {
    // Look up profile by username
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();

    let email = username; // fallback: treat as email

    if (profile) {
      const { data: { user: authUser } } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      if (authUser?.email) email = authUser.email;
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const { data: fullProfile } = await supabaseAdmin
      .from('profiles')
      .select('username, role')
      .eq('id', authData.user.id)
      .single();

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: authData.user.id,
        username: fullProfile?.username ?? username,
        email: authData.user.email,
        role: fullProfile?.role ?? 'cashier',
      },
      token: authData.session?.access_token,
      refresh_token: authData.session?.refresh_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
