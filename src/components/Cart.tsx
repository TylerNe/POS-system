import React from 'react';
import { usePOSStore } from '../store';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
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
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4 lg:p-6 h-full">
      <div className="flex items-center justify-center h-20 md:h-24 lg:h-32">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">{t('pos.cart')} is empty</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md h-full flex flex-col">
      <div className="p-2 md:p-3 lg:p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900">
{t('pos.cart')} ({cart.length} {t('pos.items')})
          </h2>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-xs"
          >
{t('common.clear')} All
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cart.map((item) => (
          <div key={item.product.id} className="p-2 md:p-3 lg:p-4 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">{item.product.name}</h3>
                <p className="text-xs text-gray-500">{formatCurrency(Number(item.product.price))} each</p>
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
                {formatCurrency(Number(item.product.price) * item.quantity)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2 md:p-3 lg:p-4 border-t bg-gray-50 flex-shrink-0">
        <div className="space-y-1 md:space-y-2">
          <div className="flex justify-between text-xs">
            <span>{t('pos.subtotal')}:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>{t('pos.tax')} (10%):</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm md:text-base lg:text-lg font-semibold pt-2 border-t">
            <span>{t('pos.total')}:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
