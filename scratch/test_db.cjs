
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config({path: '.env'});
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: WebSocket }
});
supabase.from('categories').select('*').then(res => console.log('Categories count:', res.data?.length, res.error));

