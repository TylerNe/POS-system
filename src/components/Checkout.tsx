import React, { useState } from 'react';
import { usePOSStore } from '../store';
import type { PaymentMethod } from '../types';
import { CreditCard, DollarSign, Smartphone, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutProps {
  onClose: () => void;
  onComplete: (orderId: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onClose, onComplete }) => {
  const { cart, getCartTotal, createOrder } = usePOSStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [selectedDenominations, setSelectedDenominations] = useState<{[key: number]: number}>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const total = getCartTotal() - discount;
  
  // Calculate total from denominations
  const totalFromDenominations = Object.entries(selectedDenominations).reduce(
    (sum, [denomination, count]) => sum + (parseInt(denomination) * count), 0
  );
  
  // Use manual input or denominations total
  const actualCashReceived = cashReceived ? parseFloat(cashReceived) : totalFromDenominations;
  const change = paymentMethod === 'cash' ? Math.max(0, actualCashReceived - total) : 0;
  
  const denominations = [100, 50, 20, 10, 5];

  const handleDenominationChange = (denomination: number, count: number) => {
    setSelectedDenominations(prev => ({
      ...prev,
      [denomination]: Math.max(0, count)
    }));
    // Clear manual input when using denominations
    if (count > 0) {
      setCashReceived('');
    }
  };

  const handleCashReceivedChange = (value: string) => {
    setCashReceived(value);
    // Clear denominations when using manual input
    if (value) {
      setSelectedDenominations({});
    }
  };

  const addQuickAmount = (amount: number) => {
    const currentTotal = totalFromDenominations || parseFloat(cashReceived) || 0;
    const newTotal = currentTotal + amount;
    setCashReceived(newTotal.toString());
    setSelectedDenominations({});
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (discount > getCartTotal()) {
      toast.error('Discount cannot exceed total amount');
      return;
    }

    if (total <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }

    if (paymentMethod === 'cash' && actualCashReceived < total) {
      toast.error('Insufficient cash received');
      return;
    }

    setIsProcessing(true);

    try {
      // Create order via API
      const order = await createOrder(paymentMethod, discount);
      toast.success('Payment processed successfully!');
      onComplete(order.id);
    } catch {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: DollarSign },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'digital', label: 'Digital', icon: Smartphone },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Checkout</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Order Summary & Payment Method */}
          <div className="space-y-4">
            {/* Order Summary */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(getCartTotal() - getCartTotal() * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${(getCartTotal() * 0.1).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount
            </label>
            
            {/* Discount Percentage Buttons */}
            <div className="mb-3">
              <div className="text-xs text-gray-500 mb-1">Quick Discount (%)</div>
              <div className="grid grid-cols-4 gap-1">
                {[5, 10, 15, 20].map((percentage) => {
                  const discountAmount = (getCartTotal() * percentage) / 100;
                  const isActive = Math.abs(discount - discountAmount) < 0.01;
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setDiscount(discountAmount)}
                      className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                        isActive 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                      }`}
                    >
                      {percentage}%
                    </button>
                  );
                })}
              </div>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {[25, 30, 50].map((percentage) => {
                  const discountAmount = (getCartTotal() * percentage) / 100;
                  const isActive = Math.abs(discount - discountAmount) < 0.01;
                  return (
                    <button
                      key={percentage}
                      type="button"
                      onClick={() => setDiscount(discountAmount)}
                      className={`py-1.5 px-2 rounded text-xs font-medium transition-colors ${
                        isActive 
                          ? 'bg-red-500 text-white' 
                          : 'bg-red-100 hover:bg-red-200 text-red-700'
                      }`}
                    >
                      {percentage}%
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Manual Discount Input */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Custom Amount ($)</div>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="0"
                  max={getCartTotal()}
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Math.min(parseFloat(e.target.value) || 0, getCartTotal()))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="0.00"
                />
                {/* Clear Discount */}
                {discount > 0 && (
                  <button
                    type="button"
                    onClick={() => setDiscount(0)}
                    className="px-2 text-xs text-red-600 hover:text-red-700 border border-red-200 rounded hover:bg-red-50"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Discount Preview */}
            {discount > 0 && (
              <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                <div className="flex justify-between text-green-700">
                  <span>Discount Applied:</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  {((discount / getCartTotal()) * 100).toFixed(1)}% off total
                </div>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 border rounded-lg flex flex-col items-center space-y-1 ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50 text-primary-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>

          {/* Right Column - Cash Payment Details */}
          <div className="space-y-4">
          {/* Cash Payment Details */}
          {paymentMethod === 'cash' && (
            <div className="space-y-4">
              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => addQuickAmount(amount)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-md text-sm"
                    >
                      ${amount.toFixed(0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Denominations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bills/Coins
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {denominations.map((denom) => (
                    <div key={denom} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                      <span className="text-sm font-medium">${denom}</span>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => handleDenominationChange(denom, (selectedDenominations[denom] || 0) - 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">
                          {selectedDenominations[denom] || 0}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDenominationChange(denom, (selectedDenominations[denom] || 0) + 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm"
                        >
                          +
                        </button>
                        <span className="text-sm text-gray-500 w-12 text-right">
                          ${((selectedDenominations[denom] || 0) * denom).toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Or Enter Amount Manually ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => handleCashReceivedChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
              </div>

              {/* Total and Change */}
              <div className="bg-blue-50 p-3 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Cash Received:</span>
                  <span className="font-medium">${actualCashReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Change:</span>
                  <span className={`${change >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    ${change.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleCheckout}
              disabled={isProcessing || (paymentMethod === 'cash' && actualCashReceived < total)}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Complete Payment
                </>
              )}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
