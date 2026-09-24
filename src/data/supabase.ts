import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://whettfyyqvdhobbiyqdq.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_1IGMlq2KJ-1eSlAtDoRrtg_zk-kfdXA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
