export type Role = 'admin' | 'cashier';

export type PaymentMethod = 'cash' | 'qris';

export type StockLogType = 'in' | 'out';

export type AppUser = {
  id: number;
  username: string;
  fullName: string;
  role: Role;
};

export type Product = {
  id: number;
  categoryId: number;
  name: string;
  description?: string | null;
  costPrice: number;
  sellingPrice: number;
  imageUrl?: string | null;
  isBundle: boolean;
  stock: number;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type TransactionDraft = {
  userId: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
};
