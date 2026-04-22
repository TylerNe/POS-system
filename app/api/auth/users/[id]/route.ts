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
    const { data: user } = await supabaseAdmin.from('users').select('id, role').eq('id', id).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { data: dup } = await supabaseAdmin.from('users').select('id').eq('username', username).neq('id', id).single();
    if (dup) return NextResponse.json({ error: 'Username already exists' }, { status: 400 });

    if (user.role === 'admin' && role !== 'admin') {
      const { count } = await supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('role', 'admin');
      if ((count ?? 0) <= 1) return NextResponse.json({ error: 'Cannot change role of the last admin' }, { status: 400 });
    }

    const updates: any = { username, email, role };
    if (password?.trim().length >= 6) {
      updates.password = password; // Plain text
    }

    const { error: updateError } = await supabaseAdmin.from('users').update(updates).eq('id', id);
    if (updateError) throw updateError;

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const result = await requireRole(req, ['admin']);
  if (result instanceof NextResponse) return result;

  const { id } = params;
  try {
    const { data: user } = await supabaseAdmin.from('users').select('id, role').eq('id', id).single();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.role === 'admin') {
      const { count } = await supabaseAdmin.from('users').select('id', { count: 'exact' }).eq('role', 'admin');
      if ((count ?? 0) <= 1) return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin.from('users').delete().eq('id', id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
