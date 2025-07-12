/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { supabase } from './supabaseClient';
import { Profile } from '../types';
import type { SignInWithPasswordCredentials } from '@supabase/supabase-js';

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
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

export async function signInWithEmail(credentials: Pick<SignInWithPasswordCredentials, 'email' | 'password'>) {
    return supabase.auth.signInWithPassword(credentials);
}

export async function signOut() {
    return supabase.auth.signOut();
}