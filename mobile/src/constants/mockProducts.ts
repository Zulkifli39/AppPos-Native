import type { Product } from '../types/pos';

export const mockProducts: Product[] = [
  {
    id: 1,
    categoryId: 1,
    name: 'Americano',
    costPrice: 12000,
    sellingPrice: 18000,
    stock: 24,
    isBundle: false,
  },
  {
    id: 2,
    categoryId: 1,
    name: 'Latte',
    costPrice: 15000,
    sellingPrice: 24000,
    stock: 18,
    isBundle: false,
  },
  {
    id: 3,
    categoryId: 2,
    name: 'Bundle Breakfast',
    costPrice: 28000,
    sellingPrice: 42000,
    stock: 9,
    isBundle: true,
  },
];
