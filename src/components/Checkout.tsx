import React, { useState } from 'react';
import { usePOSStore } from '../store';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { printerService, type ReceiptData } from '../services/bluetoothPrinter';
import type { PaymentMethod } from '../types';
import { CreditCard, DollarSign, Smartphone, Receipt, QrCode, X, ArrowLeft, Percent, Calculator, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface CheckoutProps {
  onClose: () => void;
  onComplete: (orderId: string) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ onClose, onComplete }) => {
  const { cart, getCartTotal, createOrder } = usePOSStore();
  const { formatCurrency, currency } = useCurrency();
  const { t } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [selectedDenominations, setSelectedDenominations] = useState<{[key: number]: number}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'summary' | 'payment' | 'cash'>('summary');
  const [autoPrintEnabled, setAutoPrintEnabled] = useState(true);

  const total = getCartTotal() - discount;
  
  // Calculate total from denominations
  const totalFromDenominations = Object.entries(selectedDenominations).reduce(
    (sum, [denomination, count]) => sum + (parseInt(denomination) * count), 0
  );
  
  // Use manual input or denominations total
  const actualCashReceived = cashReceived ? parseFloat(cashReceived) : totalFromDenominations;
  const change = paymentMethod === 'cash' ? Math.max(0, actualCashReceived - total) : 0;
  
  // Mệnh giá động theo loại tiền tệ
  const getDenominations = () => {
    if (currency.code === 'USD') {
      return [100, 50, 20, 10, 5, 2, 1];
    } else {
      // VND denominations
      return [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000];
    }
  };

  const denominations = getDenominations();

  // Hàm format mệnh giá theo định dạng phù hợp
  const formatDenomination = (amount: number): string => {
    if (currency.code === 'USD') {
      return `$${amount}`;
    } else {
      // VND format
      if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(0)}M`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}k`;
      } else {
        return amount.toString();
      }
    }
  };

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

  const handleCheckoutWithMethod = async (method: PaymentMethod) => {
    console.log('🔍 Checkout started with method:', {
      paymentMethod: method,
      total,
      actualCashReceived,
      cartLength: cart.length
    });

    if (cart.length === 0) {
      toast.error(t('checkout.cartEmpty'));
      return;
    }

    if (discount > getCartTotal()) {
      toast.error(t('checkout.discountExceedsTotal'));
      return;
    }

    if (total <= 0) {
      toast.error(t('checkout.totalMustBePositive'));
      return;
    }

    // Only check cash amount for cash payments
    if (method === 'cash') {
      if (actualCashReceived < total) {
        toast.error(t('checkout.insufficientCash'));
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Create order via API
      console.log('🔍 Creating order with:', { paymentMethod: method, discount });
      const order = await createOrder(method, discount);
      console.log('🔍 Order created successfully:', order);
      toast.success(t('checkout.paymentSuccess'));
      
      // Auto print receipt if enabled and Bluetooth printer is connected
      if (autoPrintEnabled && printerService.isConnected()) {
        try {
          await autoPrintReceipt(order);
        } catch (error) {
          console.error('Auto print failed:', error);
          // Don't show error toast for auto print failure
        }
      }
      
      onComplete(order.id);
    } catch (error) {
      console.error('Payment failed:', error);
      
      // For debugging, create a mock order if API fails
      if (import.meta.env.DEV) {
        console.log('🔍 Creating mock order for development');
        const mockOrder = {
          id: `ORDER-${Date.now()}`,
          items: cart.map(item => ({
            id: item.product.id,
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.price,
            total_price: item.product.price * item.quantity,
            product: item.product
          })),
          total: total,
          subtotal: total - (total * 0.1),
          tax: total * 0.1,
          discount: discount,
          paymentMethod: method,
          timestamp: new Date().toISOString(),
          cashier_name: 'Cashier'
        };
        
        toast.success(t('checkout.paymentSuccess') + ' (Mock)');
        onComplete(mockOrder.id);
        return;
      }
      
      toast.error(t('checkout.paymentFailed'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    return handleCheckoutWithMethod(paymentMethod);
  };

  const autoPrintReceipt = async (order: any) => {
    const receiptData: ReceiptData = {
      storeName: 'Cửa hàng của bạn',
      storeAddress: 'Địa chỉ cửa hàng',
      storePhone: '0123456789',
      receiptNumber: order.id,
      timestamp: new Date(order.timestamp).toLocaleString('vi-VN'),
      cashierName: order.cashier_name || 'Thu ngân',
      items: order.items.map((item: any) => ({
        name: item.product?.name || item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price || item.product?.price || 0),
        totalPrice: Number(item.total_price || (item.unit_price || 0) * item.quantity)
      })),
      subtotal: Number(order.subtotal),
      tax: Number(order.tax),
      discount: Number(order.discount),
      total: Number(order.total),
      paymentMethod: order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                    order.paymentMethod === 'card' ? 'Thẻ' : 
                    order.paymentMethod === 'vietqr' ? 'VietQR' : 
                    order.paymentMethod === 'digital' ? 'Ví điện tử' : 'Khác',
      receiptHeader: 'Cảm ơn quý khách!',
      receiptFooter: 'Hẹn gặp lại!'
    };

    await printerService.printReceipt(receiptData);
    console.log('Auto print completed successfully');
  };

  const paymentMethods = [
    { id: 'cash', label: t('checkout.cash'), icon: DollarSign, color: 'bg-green-500' },
    { id: 'card', label: t('checkout.card'), icon: CreditCard, color: 'bg-blue-500' },
    { id: 'vietqr', label: t('checkout.vietqr'), icon: QrCode, color: 'bg-purple-500' },
    { id: 'digital', label: t('checkout.mobileWallet'), icon: Smartphone, color: 'bg-orange-500' },
  ] as const;

  const renderSummary = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">{t('checkout.orderSummary')}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Order Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Receipt className="h-5 w-5 mr-2 text-primary-600" />
{t('checkout.orderDetails')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-600">{t('pos.subtotal')}:</span>
            <span className="font-medium">{formatCurrency(getCartTotal() - getCartTotal() * 0.1)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-600">{t('pos.tax')} (10%):</span>
            <span className="font-medium">{formatCurrency(getCartTotal() * 0.1)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1 text-green-600">
              <span>{t('checkout.discount')}:</span>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 border-t border-gray-200 pt-2">
            <span className="text-lg font-bold text-gray-800">{t('pos.total')}:</span>
            <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Discount Section */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Percent className="h-5 w-5 mr-2 text-orange-600" />
          {t('checkout.discount')}
        </h3>
        
        {/* Quick Discount Buttons */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2">{t('checkout.quickDiscount')}</div>
          <div className="grid grid-cols-4 gap-2">
            {[5, 10, 15, 20].map((percentage) => {
              const discountAmount = (getCartTotal() * percentage) / 100;
              const isActive = Math.abs(discount - discountAmount) < 0.01;
              return (
                <button
                  key={percentage}
                  type="button"
                  onClick={() => setDiscount(discountAmount)}
                  className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-orange-500 text-white shadow-md' 
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200'
                  }`}
                >
                  {percentage}%
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[25, 30, 50].map((percentage) => {
              const discountAmount = (getCartTotal() * percentage) / 100;
              const isActive = Math.abs(discount - discountAmount) < 0.01;
              return (
                <button
                  key={percentage}
                  type="button"
                  onClick={() => setDiscount(discountAmount)}
                  className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
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
          <div className="text-xs text-gray-500 mb-2">{t('checkout.customAmount')}</div>
          <div className="flex space-x-2">
            <input
              type="number"
              min="0"
              max={getCartTotal()}
              step="1000"
              value={discount}
              onChange={(e) => setDiscount(Math.min(parseFloat(e.target.value) || 0, getCartTotal()))}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="0"
            />
            {discount > 0 && (
              <button
                type="button"
                onClick={() => setDiscount(0)}
                className="px-4 py-3 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50"
              >
{t('checkout.remove')}
              </button>
            )}
          </div>
        </div>

        {/* Discount Preview */}
        {discount > 0 && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex justify-between text-green-700">
              <span className="text-sm">{t('checkout.discount')}:</span>
              <span className="font-semibold">-{formatCurrency(discount)}</span>
            </div>
            <div className="text-xs text-green-600 mt-1">
              {((discount / getCartTotal()) * 100).toFixed(1)}% giảm giá
            </div>
          </div>
        )}
      </div>

      {/* Auto Print Option */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Printer className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-800">Tự động in hóa đơn</h3>
              <p className="text-sm text-gray-500">
                {printerService.isConnected() 
                  ? 'Máy in Bluetooth đã kết nối' 
                  : 'Máy in Bluetooth chưa kết nối'}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={autoPrintEnabled}
              onChange={(e) => setAutoPrintEnabled(e.target.checked)}
              disabled={!printerService.isConnected()}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => setCurrentStep('payment')}
        className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors shadow-lg"
      >
{t('checkout.continueToPayment')}
      </button>
    </div>
  );

  const renderPaymentMethod = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep('summary')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{t('checkout.paymentMethod')}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => {
                console.log('🔍 Payment method selected:', method.id);
                setPaymentMethod(method.id);
                if (method.id === 'cash') {
                  setCurrentStep('cash');
                } else {
                  console.log('🔍 Calling handleCheckout for non-cash payment');
                  // Pass the payment method directly to avoid state update delay
                  handleCheckoutWithMethod(method.id);
                }
              }}
              className={`p-6 border-2 rounded-xl flex flex-col items-center space-y-3 transition-all ${
                paymentMethod === method.id
                  ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className={`p-3 rounded-full ${method.color} text-white`}>
                <Icon className="h-8 w-8" />
              </div>
              <span className="font-semibold text-sm">{method.label}</span>
            </button>
          );
        })}
      </div>

      {/* Total Display */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
        <div className="text-center">
          <div className="text-sm text-primary-600 mb-1">{t('checkout.totalPayment')}</div>
          <div className="text-2xl font-bold text-primary-700">{total.toFixed(0)} ₫</div>
        </div>
      </div>
    </div>
  );

  const renderCashPayment = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentStep('payment')}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">{t('checkout.cashPayment')}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Total Display */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
        <div className="text-sm text-blue-600 mb-1">{t('checkout.amountToPay')}</div>
        <div className="text-2xl font-bold text-blue-700">{formatCurrency(total)}</div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <Calculator className="h-5 w-5 mr-2 text-green-600" />
{t('checkout.quickAmount')}
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(() => {
            // Tạo các mệnh giá nhanh phù hợp với loại tiền tệ
            let quickAmounts;
            if (currency.code === 'USD') {
              quickAmounts = [
                total, // Số tiền chính xác
                Math.ceil(total), // Làm tròn lên 1 USD
                Math.ceil(total / 5) * 5 // Làm tròn lên 5 USD
              ];
            } else {
              // VND
              quickAmounts = [
                total, // Số tiền chính xác
                Math.ceil(total / 1000) * 1000, // Làm tròn lên 1000
                Math.ceil(total / 10000) * 10000 // Làm tròn lên 10000
              ];
            }
            const uniqueAmounts = [...new Set(quickAmounts)];
            return uniqueAmounts.map((amount, index) => (
              <button
                key={`quick-amount-${amount}-${index}`}
                type="button"
                onClick={() => addQuickAmount(amount)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                {formatCurrency(amount)}
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Denominations */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">{t('checkout.selectDenomination')}</h3>
        <div className="space-y-3">
          {denominations.map((denom) => (
            <div key={denom} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="text-lg font-semibold">{formatDenomination(denom)}</span>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleDenominationChange(denom, (selectedDenominations[denom] || 0) - 1)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-lg font-semibold">
                  {selectedDenominations[denom] || 0}
                </span>
                <button
                  type="button"
                  onClick={() => handleDenominationChange(denom, (selectedDenominations[denom] || 0) + 1)}
                  className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500 w-16 text-right font-medium">
                  {formatCurrency((selectedDenominations[denom] || 0) * denom)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Input */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">{t('checkout.orEnterAmount')}</h3>
        <input
          type="number"
          min="0"
          step="1000"
          value={cashReceived}
          onChange={(e) => handleCashReceivedChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="0"
        />
      </div>

      {/* Total and Change */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-lg">
          <span className="font-medium">{t('checkout.cashReceived')}:</span>
          <span className="font-bold">{formatCurrency(actualCashReceived)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span className="font-medium">{t('checkout.change')}:</span>
          <span className={`font-bold ${change >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(change)}
          </span>
        </div>
      </div>

      {/* Complete Payment Button */}
      <button
        onClick={handleCheckout}
        disabled={isProcessing || actualCashReceived < total}
        className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg flex items-center justify-center"
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        ) : (
          <>
            <Receipt className="h-5 w-5 mr-2" />
{t('checkout.completePayment')}
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        <div className="p-4">
          {currentStep === 'summary' && renderSummary()}
          {currentStep === 'payment' && renderPaymentMethod()}
          {currentStep === 'cash' && renderCashPayment()}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
