import { supabase } from '../lib/supabase';
import type { CartItem, TransactionDraft } from '../types/pos';

export async function createTransaction(draft: TransactionDraft, items: CartItem[]) {
  const transactionCode = `TRX-${Date.now()}`;

  const { data: transaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      transaction_code: transactionCode,
      user_id: draft.userId,
      subtotal: draft.subtotal,
      discount: draft.discount,
      total_amount: draft.totalAmount,
      payment_method: draft.paymentMethod,
      amount_received: draft.amountReceived,
      amount_change:
        draft.amountReceived === undefined ? null : draft.amountReceived - draft.totalAmount,
    })
    .select('id')
    .single();

  if (transactionError) {
    throw transactionError;
  }

  const details = items.map((item) => ({
    transaction_id: transaction.id,
    product_id: item.product.id,
    quantity: item.quantity,
    unit_price: item.product.sellingPrice,
    total_price: item.product.sellingPrice * item.quantity,
  }));

  const { error: detailsError } = await supabase.from('transaction_details').insert(details);

  if (detailsError) {
    throw detailsError;
  }

  return transaction;
}
