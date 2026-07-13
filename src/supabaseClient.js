import { createClient } from '@supabase/supabase-js';

// Read values from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Fallback logic to prevent application crash if env variables are not set yet
let supabaseClient = null;
if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase URL and Anon Key are missing from environment variables. Database operations will fail.');
}

export const supabase = supabaseClient;
