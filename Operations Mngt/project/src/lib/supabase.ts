import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use local Supabase URL if environment variables are not set
const defaultUrl = 'http://localhost:54321';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Debug: Log the actual values
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'undefined');

// Check if the values are placeholder values and replace them
const isPlaceholderUrl = supabaseUrl === 'your-supabase-url' || supabaseUrl === undefined || supabaseUrl === '';
const isPlaceholderKey = supabaseAnonKey === 'your-supabase-anon-key' || supabaseAnonKey === undefined || supabaseAnonKey === '';

// Ensure we have valid values
const finalUrl = isPlaceholderUrl ? defaultUrl : supabaseUrl;
const finalKey = isPlaceholderKey ? defaultKey : supabaseAnonKey;

if (isPlaceholderUrl || isPlaceholderKey) {
  console.warn('Supabase credentials are missing or contain placeholder values. Using local development defaults.');
  console.log('Using URL:', finalUrl);
  console.log('Using Key:', finalKey.substring(0, 20) + '...');
}

// Validate URL format
try {
  new URL(finalUrl);
} catch (error) {
  console.error('Invalid Supabase URL:', finalUrl);
  throw new Error(`Invalid Supabase URL: ${finalUrl}`);
}

export const supabase = createClient<Database>(
  finalUrl,
  finalKey
);

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && 
    supabaseUrl !== defaultUrl && 
    supabaseAnonKey !== defaultKey;
};