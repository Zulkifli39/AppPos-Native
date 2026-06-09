import { Platform } from 'react-native';

import { apiRequest, toApiAssetUrl } from '../lib/api';
import type { Product } from '../types/pos';

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

function mapProduct(product: Product): Product {
  return {
    ...product,
    imageUrl: toApiAssetUrl(product.imageUrl),
  };
}

function toProductBody(payload: ProductPayload) {
  return {
    categoryId: payload.categoryId,
    name: payload.name.trim(),
    description: payload.description?.trim() || null,
    costPrice: payload.costPrice,
    sellingPrice: payload.sellingPrice,
    imageUrl: payload.imageUrl?.trim() || null,
    isBundle: payload.isBundle,
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

  const extension = getFileExtension(payload.imageFile.fileName, payload.imageFile.mimeType);
  const fileName = payload.imageFile.fileName ?? `product.${extension}`;
  const mimeType = payload.imageFile.mimeType ?? 'image/jpeg';
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const response = await fetch(payload.imageFile.uri);
    const blob = await response.blob();
    formData.append('image', blob, fileName);
  } else {
    formData.append('image', {
      name: fileName,
      type: mimeType,
      uri: payload.imageFile.uri,
    } as unknown as Blob);
  }

  const result = await apiRequest<{ imageUrl: string }>('/uploads/products', {
    method: 'POST',
    body: formData,
  });

  return result.imageUrl;
}

async function toProductMutationRow(payload: ProductPayload) {
  return {
    ...toProductBody(payload),
    imageUrl: await uploadProductImage(payload),
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const products = await apiRequest<Product[]>('/products');
  return products.map(mapProduct);
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const product = await apiRequest<Product>('/products', {
    method: 'POST',
    body: await toProductMutationRow(payload),
  });

  return mapProduct(product);
}

export async function updateProduct(id: number, payload: ProductPayload): Promise<Product> {
  const product = await apiRequest<Product>(`/products/${id}`, {
    method: 'PUT',
    body: await toProductMutationRow(payload),
  });

  return mapProduct(product);
}

export async function deleteProduct(id: number): Promise<void> {
  await apiRequest<void>(`/products/${id}`, { method: 'DELETE' });
}
