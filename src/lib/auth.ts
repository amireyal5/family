import { supabase } from './supabaseClient';
import { Profile } from '../types';

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    console.warn("⚠️ No active session.");
    return null;
  }

  const user = sessionData.session.user;

  if (!user) {
    console.warn("⚠️ User not found in session.");
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
  return await supabase.auth.signInWithPassword(credentials);
}

export async function signOut() {
  return await supabase.auth.signOut();
}
