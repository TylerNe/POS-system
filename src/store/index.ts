import { create } from 'zustand';
import type { Product, CartItem, Order, PaymentMethod } from '../types';
import { productsAPI, ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

interface POSStore {
  // Products
  products: Product[];
  productsLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
  getCartTax: () => number;

  // Orders
  orders: Order[];
  ordersLoading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (paymentMethod: PaymentMethod, discount?: number, customerInfo?: { name?: string; phone?: string; email?: string }) => Promise<Order>;

  // UI State
  currentView: 'pos' | 'dashboard' | 'products' | 'orders' | 'settings' | 'kitchen';
  setCurrentView: (view: 'pos' | 'dashboard' | 'products' | 'orders' | 'settings' | 'kitchen') => void;
}

const TAX_RATE = 0.1; // 10% tax

export const usePOSStore = create<POSStore>((set, get) => ({
  // Initial state
  products: [],
  productsLoading: false,
  cart: [],
  orders: [],
  ordersLoading: false,
  currentView: 'pos',

  // Product actions
  fetchProducts: async () => {
    set({ productsLoading: true });
    try {
      const response = await productsAPI.getAll();
      set({ products: response.products, productsLoading: false });
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
      set({ productsLoading: false });
    }
  },

  addProduct: async (product) => {
    try {
      const response = await productsAPI.create(product);
      set((state) => ({
        products: [...state.products, response.product],
      }));
      toast.success('Product added successfully');
    } catch (error: any) {
      console.error('Failed to add product:', error);
      toast.error(error.response?.data?.error || 'Failed to add product');
      throw error;
    }
  },

  updateProduct: async (id, updatedProduct) => {
    try {
      const response = await productsAPI.update(id, updatedProduct);
      set((state) => ({
        products: state.products.map((product) =>
          product.id === id ? response.product : product
        ),
      }));
      toast.success('Product updated successfully');
    } catch (error: any) {
      console.error('Failed to update product:', error);
      toast.error(error.response?.data?.error || 'Failed to update product');
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productsAPI.delete(id);
      set((state) => ({
        products: state.products.filter((product) => product.id !== id),
      }));
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      toast.error(error.response?.data?.error || 'Failed to delete product');
      throw error;
    }
  },

  getProductById: (id) => {
    const state = get();
    return state.products.find((product) => product.id === id);
  },

  // Cart actions
  addToCart: (product, quantity = 1) =>
    set((state) => {
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      
      return {
        cart: [...state.cart, { product, quantity }],
      };
    }),

  updateCartItemQuantity: (productId, quantity) =>
    set((state) => ({
      cart: quantity <= 0
        ? state.cart.filter((item) => item.product.id !== productId)
        : state.cart.map((item) =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
    })),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),

  clearCart: () => set({ cart: [] }),

  getCartSubtotal: () => {
    const state = get();
    return state.cart.reduce((total, item) => total + Number(item.product.price) * item.quantity, 0);
  },

  getCartTax: () => {
    const subtotal = get().getCartSubtotal();
    return subtotal * TAX_RATE;
  },

  getCartTotal: () => {
    const subtotal = get().getCartSubtotal();
    const tax = get().getCartTax();
    return subtotal + tax;
  },

  // Order actions
  fetchOrders: async () => {
    set({ ordersLoading: true });
    try {
      const response = await ordersAPI.getAll();
      set({ orders: response.orders, ordersLoading: false });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
      set({ ordersLoading: false });
    }
  },

  createOrder: async (paymentMethod, discount = 0, customerInfo) => {
    const state = get();
    const cart = state.cart;

    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    try {
      // Map vietqr to digital for backend compatibility
      const backendPaymentMethod = paymentMethod === 'vietqr' ? 'digital' : paymentMethod;
      const originalPaymentMethod = paymentMethod; // Store original for display
      
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: backendPaymentMethod,
        discount,
        customer_name: customerInfo?.name,
        customer_phone: customerInfo?.phone,
        customer_email: customerInfo?.email,
        // Add metadata to preserve original payment method
        metadata: {
          original_payment_method: originalPaymentMethod
        }
      };

      const response = await ordersAPI.create(orderData);
      
      // Create order with original payment method for display
      const orderWithOriginalMethod = {
        ...response.order,
        paymentMethod: originalPaymentMethod // Use original method for display
      };
      
      // Update orders list
      set((currentState) => ({
        orders: [orderWithOriginalMethod, ...currentState.orders],
        cart: [],
      }));

      // Refresh products to update stock
      get().fetchProducts();

      toast.success('Order created successfully');
      return orderWithOriginalMethod; // Return the order with original payment method
    } catch (error: any) {
      console.error('Failed to create order:', error);
      toast.error(error.response?.data?.error || 'Failed to create order');
      throw error;
    }
  },

  // UI actions
  setCurrentView: (view) => set({ currentView: view }),
}));
