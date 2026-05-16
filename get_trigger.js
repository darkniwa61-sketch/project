require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await sb.rpc('get_trigger'); 
  // No, I can't call get_trigger. Let's use postgres query.
}
run();
