import { createClient } from '@supabase/supabase-js';

// These variables are loaded from the .env file by Vite.
// See https://vitejs.dev/guide/env-and-mode.html
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    // In a real app, you might want to show a more user-friendly error
    // or prevent the app from initializing further.
    console.error("Supabase URL or Anon Key is missing. Please check your .env file.");
    throw new Error("Supabase environment variables are not set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);