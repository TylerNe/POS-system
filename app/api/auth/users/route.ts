import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: NextRequest) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '50');
  const offset = parseInt(req.nextUrl.searchParams.get('offset') ?? '0');

  try {
    const { data: profiles, error, count } = await supabaseAdmin
      .from('profiles')
      .select('id, username, role, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const usersWithEmail = await Promise.all(
      (profiles ?? []).map(async (profile) => {
        const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(profile.id);
        return { ...profile, email: user?.email ?? '' };
      })
    );

    return NextResponse.json({ users: usersWithEmail, total: count ?? 0, limit, offset });
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
    const { data: existing } = await supabaseAdmin.from('profiles').select('id').eq('username', username).single();
    if (existing) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { username, role },
    });
    if (authError) throw authError;

    const user = authData.user!;
    await supabaseAdmin.from('profiles').update({ username, role }).eq('id', user.id);

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, username, email: user.email, role, created_at: user.created_at },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
