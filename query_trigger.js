require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await sb.from('profiles').select('*').limit(1);
  console.log('Profiles:', data, error);
}
check();
