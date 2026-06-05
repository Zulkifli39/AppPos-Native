import { supabase } from '../lib/supabase';
import type { AppUser } from '../types/pos';

type UserRow = {
  id: number;
  username: string;
  full_name: string;
  role: AppUser['role'];
};

export async function signInWithUsername(username: string, password: string): Promise<AppUser> {
  const normalizedUsername = username.trim();
  const normalizedPassword = password.trim();

  const { data, error } = await supabase
    .from('users')
    .select('id, username, full_name, role')
    .eq('username', normalizedUsername)
    .eq('password', normalizedPassword)
    .maybeSingle<UserRow>();

  if (error) {
    console.error('Login query failed:', error);
    throw new Error(`Login gagal: ${error.message}`);
  }

  if (!data) {
    throw new Error('Username atau password tidak sesuai.');
  }

  return {
    id: data.id,
    username: data.username,
    fullName: data.full_name,
    role: data.role,
  };
}
