import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://milozilmgtvbjubezgwv.supabase.co';

// Strip trailing /rest/v1 or slashes if provided in URL
export const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbG96aWxtZ3R2Ymp1YmV6Z3d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQzOTA3OTYsImV4cCI6MjEwOTk2Njc5Nn0.EQcqZajU758iC-g43tgOJlWlGB2UPWJWRuLJz-DkjCA';

export const SUPABASE_PROJECT_ID = 'milozilmgtvbjubezgwv';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
