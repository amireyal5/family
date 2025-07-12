/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://<PROJECT_ID>.supabase.co';
const supabaseAnonKey = '<PUBLIC_ANON_KEY>';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
