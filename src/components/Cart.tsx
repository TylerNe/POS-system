import React from 'react';
import { usePOSStore } from '../store';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

const Cart: React.FC = () => {
  const { 
    cart, 
    updateCartItemQuantity, 
    removeFromCart, 
    clearCart,
    getCartSubtotal,
    getCartTax,
    getCartTotal
  } = usePOSStore();

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Your cart is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Cart ({cart.length} items)
          </h2>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.product.id} className="p-4 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500">${Number(item.product.price).toFixed(2)} each</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                
                <button
                  onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 rounded-full hover:bg-red-100 text-red-600 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-2 text-right">
              <span className="font-medium">
                ${(Number(item.product.price) * item.quantity).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
