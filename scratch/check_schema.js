const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSchema() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching product:', error.message);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns found in products table:', Object.keys(data[0]));
  } else {
    console.log('No products found to determine schema.');
  }
}

checkSchema();
