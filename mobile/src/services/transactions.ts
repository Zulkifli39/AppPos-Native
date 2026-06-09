import { apiRequest } from '../lib/api';
import type { CartItem, TransactionDraft, TransactionHistory } from '../types/pos';

export async function fetchTransactions(): Promise<TransactionHistory[]> {
  return apiRequest<TransactionHistory[]>('/transactions');
}

export async function createTransaction(draft: TransactionDraft, items: CartItem[]) {
  return apiRequest<{ id: number; transactionCode: string }>('/transactions', {
    method: 'POST',
    body: {
      draft,
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        totalPrice: item.product.sellingPrice * item.quantity,
        notes: item.notes?.trim() || null,
      })),
    },
  });
}
