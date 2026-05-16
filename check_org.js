require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const res = await sb.from('organizations').select('*');
  console.log('organizations length:', res.data?.length);
}
check();
