import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

let supabase: any = null;

try {
  if (supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder')) {
    supabase = createClient(supabaseUrl, supabaseKey);
  } else {
    console.warn('⚠️  Supabase credentials not configured. Using local API fallback.');
  }
} catch (error) {
  console.warn('⚠️  Failed to initialize Supabase. Using local API fallback.', error);
}

export { supabase };

