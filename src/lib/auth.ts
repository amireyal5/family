/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { supabase } from './supabaseClient';
import { Profile } from '../types';

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user }, error: userError } = await (supabase.auth as any).getUser();
  if (userError || !user) {
    console.error('User not found or error fetching user:', userError?.message);
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Profile fetch error:', error.message);
    return null;
  }

  return profile as Profile;
}

export async function signInWithEmail(credentials: { email: string; password: string; }) {
    return (supabase.auth as any).signInWithPassword(credentials);
}

export async function signOut() {
    return (supabase.auth as any).signOut();
}