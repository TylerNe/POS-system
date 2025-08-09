export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  barcode?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: PaymentMethod;
  timestamp: Date;
  customerInfo?: CustomerInfo;
}

export interface CustomerInfo {
  name: string;
  phone?: string;
  email?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'digital';

export interface Receipt {
  order: Order;
  receiptNumber: string;
  cashierName: string;
}
