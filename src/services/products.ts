import { supabase } from '../lib/supabase';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, category_id, name, description, cost_price, selling_price, image_url, is_bundle, stock')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}
