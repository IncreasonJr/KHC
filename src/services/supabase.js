// /home/caleb/Desktop/PROJECTS/KHC/src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are provided and not placeholders
const isConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key';

if (!isConfigured) {
  console.warn(
    'Supabase keys are missing or set to placeholder values. ' +
    'Please check your .env file and specify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Using mock data fallback mode until Supabase credentials are configured.'
  );
}

// Export the initialized Supabase client, or null if configuration is incomplete
export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = isConfigured;
