import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { id } = params;
  const { username, email, role, password } = await req.json();

  if (!username || !email || !role)
    return NextResponse.json({ error: 'Username, email, and role are required' }, { status: 400 });

  try {
    const { data: profile } = await supabaseAdmin.from('profiles').select('id, role').eq('id', id).single();
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: dup } = await supabaseAdmin.from('profiles').select('id').eq('username', username).neq('id', id).single();
    if (dup) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    if (profile.role === 'admin' && role !== 'admin') {
      const { count } = await supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin');
      if ((count ?? 0) <= 1) return NextResponse.json({ error: 'Cannot change role of the last admin' }, { status: 400 });
    }

    await supabaseAdmin.from('profiles').update({ username, role }).eq('id', id);
    const authUpdates: Record<string, string> = { email };
    if (password?.trim().length >= 6) authUpdates.password = password;
    await supabaseAdmin.auth.admin.updateUserById(id, authUpdates);

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { id } = params;
  try {
    const { data: profile } = await supabaseAdmin.from('profiles').select('id, role').eq('id', id).single();
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (profile.role === 'admin') {
      const { count } = await supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('role', 'admin');
      if ((count ?? 0) <= 1) return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 });
    }

    await supabaseAdmin.auth.admin.deleteUser(id);
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
