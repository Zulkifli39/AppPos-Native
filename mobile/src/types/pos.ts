export type Role = 'admin' | 'cashier';

export type PaymentMethod = 'cash' | 'qris';

export type StockLogType = 'in' | 'out';

export type AppUser = {
  id: number;
  username: string;
  fullName: string;
  role: Role;
};

export type AuthSession = {
  user: AppUser;
  token: string;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export type Product = {
  id: number;
  categoryId: number;
  categoryName?: string | null;
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
  notes?: string | null;
};

export type TransactionDraft = {
  userId: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number;
};

export type TransactionHistoryDetail = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string | null;
};

export type TransactionHistory = {
  id: number;
  transactionCode: string;
  cashierName?: string | null;
  subtotal: number;
  discount: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountReceived?: number | null;
  amountChange?: number | null;
  createdAt: string;
  details: TransactionHistoryDetail[];
};
