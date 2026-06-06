import { supabase } from '../lib/supabase';
import type { Product } from '../types/pos';

const productImagesBucket = 'product-images';

type ProductRow = {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  cost_price: number | string;
  selling_price: number | string;
  image_url: string | null;
  is_bundle: boolean;
  stock: number;
  categories?: { name: string } | { name: string }[] | null;
};

export type ProductPayload = {
  categoryId: number;
  name: string;
  description?: string | null;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
  imageFile?: {
    fileName?: string | null;
    mimeType?: string | null;
    uri: string;
  } | null;
  isBundle: boolean;
  stock: number;
};

function mapProduct(row: ProductRow): Product {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;

  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: category?.name ?? null,
    name: row.name,
    description: row.description,
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    imageUrl: row.image_url,
    isBundle: row.is_bundle,
    stock: row.stock,
  };
}

function toProductRow(payload: ProductPayload) {
  return {
    category_id: payload.categoryId,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    cost_price: payload.costPrice,
    selling_price: payload.sellingPrice,
    image_url: payload.imageUrl?.trim() || null,
    is_bundle: payload.isBundle,
    stock: payload.stock,
  };
}

function getFileExtension(fileName?: string | null, mimeType?: string | null) {
  const fileNameExtension = fileName?.split('.').pop();

  if (fileNameExtension) {
    return fileNameExtension.toLowerCase();
  }

  if (mimeType?.includes('/')) {
    return mimeType.split('/')[1];
  }

  return 'jpg';
}

async function uploadProductImage(payload: ProductPayload): Promise<string | null> {
  if (!payload.imageFile) {
    return payload.imageUrl?.trim() || null;
  }

  const response = await fetch(payload.imageFile.uri);
  const blob = await response.blob();
  const extension = getFileExtension(payload.imageFile.fileName, payload.imageFile.mimeType);
  const safeName = payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const path = `${Date.now()}-${safeName || 'product'}.${extension}`;

  const { error } = await supabase.storage
    .from(productImagesBucket)
    .upload(path, blob, {
      contentType: payload.imageFile.mimeType ?? (blob.type || 'image/jpeg'),
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(productImagesBucket).getPublicUrl(path);

  return data.publicUrl;
}

async function toProductMutationRow(payload: ProductPayload) {
  return {
    ...toProductRow(payload),
    image_url: await uploadProductImage(payload),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, category_id, name, description, cost_price, selling_price, image_url, is_bundle, stock, categories(name)',
    )
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapProduct(row as ProductRow));
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(await toProductMutationRow(payload))
    .select(
      'id, category_id, name, description, cost_price, selling_price, image_url, is_bundle, stock, categories(name)',
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProduct(data as ProductRow);
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(await toProductMutationRow(payload))
    .eq('id', id)
    .select(
      'id, category_id, name, description, cost_price, selling_price, image_url, is_bundle, stock, categories(name)',
    )
    .single();

  if (error) {
    throw error;
  }

  return mapProduct(data as ProductRow);
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw error;
  }
}
