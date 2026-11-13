import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('[!] WARNING: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set in environment.');
}

// Server-side Supabase client with admin privileges (Service Role)
export const supabaseAdmin = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseServiceRoleKey || 'placeholder', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to create a user-scoped client that respects RLS using their access token
export const createUserClient = (accessToken) => {
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', process.env.SUPABASE_ANON_KEY || supabaseServiceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
