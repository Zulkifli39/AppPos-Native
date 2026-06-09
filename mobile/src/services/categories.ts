import { apiRequest } from '../lib/api';
import type { Category } from '../types/pos';

export type CategoryPayload = {
  name: string;
  description?: string | null;
};

export async function fetchCategories(): Promise<Category[]> {
  return apiRequest<Category[]>('/categories');
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    body: {
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    },
  });
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<Category> {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: {
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
    },
  });
}

export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<void>(`/categories/${id}`, { method: 'DELETE' });
}
