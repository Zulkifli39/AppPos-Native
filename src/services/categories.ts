import { supabase } from '../lib/supabase';
import type { Category } from '../types/pos';

type CategoryRow = {
  id: number;
  name: string;
  description: string | null;
};

export type CategoryPayload = {
  name: string;
  description?: string | null;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, description')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapCategory);
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    })
    .select('id, name, description')
    .single<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    })
    .eq('id', id)
    .select('id, name, description')
    .single<CategoryRow>();

  if (error) {
    throw error;
  }

  return mapCategory(data);
}

export async function deleteCategory(id: number): Promise<void> {
  const { count: productsCount, error: productsError } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (productsError) {
    throw productsError;
  }

  if ((productsCount ?? 0) > 0) {
    throw new Error('Kategori tidak bisa dihapus karena masih digunakan oleh produk.');
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error('Kategori tidak bisa dihapus karena masih digunakan oleh produk.');
    }

    throw error;
  }
}
