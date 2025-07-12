import { createClient } from '@supabase/supabase-js';

// Supabase client setup
// ודא שקובץ .env שלך כולל את:
// VITE_SUPABASE_URL=https://kmbgignzdultsghpuxhw.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// בדיקה — חשוב בזמן פיתוח
if (!supabaseUrl || !supabaseAnonKey) {
  // This is a critical error, not a warning. The app cannot function without these.
  const errorMessage = 'Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are missing. Please create a .env file in the project root with these values.';
  // Display the error prominently on the page as well as in the console.
  document.body.innerHTML = `<div style="padding: 20px; font-family: sans-serif; background-color: #ffcdd2; border: 1px solid #f44336; color: #b71c1c; text-align: center; direction: ltr;"><h2>Configuration Error</h2><p>${errorMessage}</p></div>`;
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);