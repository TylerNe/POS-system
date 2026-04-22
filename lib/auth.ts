import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from './supabase-admin';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  if (!token) return null;

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .single();

    if (!profile) return null;

    return {
      id: user.id,
      username: profile.username,
      email: user.email ?? '',
      role: profile.role,
    };
  } catch {
    return null;
  }
}

export function unauthorized(message = 'Access token required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function forbidden(message = 'Insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireAuth(req: NextRequest): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return user;
}

export async function requireRole(req: NextRequest, roles: string[]): Promise<AuthUser | NextResponse> {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!roles.includes(user.role)) return forbidden();
  return user;
}
