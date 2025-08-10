export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  barcode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: Product;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  timestamp: string | Date;
  createdAt?: string;
  updatedAt?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  cashier_name?: string;
  user_id?: string;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'digital' | 'vietqr';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'cashier';
  created_at: string;
  updated_at?: string;
}

export interface Receipt {
  order: Order;
  receiptNumber: string;
  cashierName: string;
}
