import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../store';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { format } from 'date-fns';
import { Search, Eye, Receipt, Calendar } from 'lucide-react';
import type { Order } from '../types';
import ReceiptComponent from '../components/Receipt';

// Helper functions for payment method display
const getPaymentMethodColor = (method: string | undefined) => {
  if (!method) return 'bg-gray-100 text-gray-800';
  
  switch (method) {
    case 'cash': return 'bg-green-100 text-green-800';
    case 'card': return 'bg-blue-100 text-blue-800';
    case 'digital': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPaymentMethodDisplay = (method: string | undefined, order?: any, t?: any) => {
  if (!method) return 'N/A';
  
  // Check if we have original payment method in metadata
  if (order?.metadata?.original_payment_method) {
    const originalMethod = order.metadata.original_payment_method;
    switch (originalMethod) {
      case 'vietqr': return t ? t('checkout.vietqr') : 'VietQR';
      case 'digital': return t ? t('checkout.mobileWallet') : 'Ví điện tử';
      case 'cash': return t ? t('checkout.cash') : 'Tiền mặt';
      case 'card': return t ? t('checkout.card') : 'Thẻ';
      default: return originalMethod.charAt(0).toUpperCase() + originalMethod.slice(1);
    }
  }
  
  // Fallback to current method
  switch (method) {
    case 'cash': return t ? t('checkout.cash') : 'Tiền mặt';
    case 'card': return t ? t('checkout.card') : 'Thẻ';
    case 'digital': return t ? t('checkout.mobileWallet') : 'Ví điện tử';
    case 'vietqr': return t ? t('checkout.vietqr') : 'VietQR';
    default: return method.charAt(0).toUpperCase() + method.slice(1);
  }
};

const OrdersView: React.FC = () => {
  const { orders, fetchOrders, ordersLoading } = usePOSStore();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.paymentMethod && order.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort orders by timestamp (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{t('orders.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage all completed orders
          </p>
        </div>
      </div>

      <div className="mt-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.search') + " orders by ID or payment method..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Orders Table */}
        {ordersLoading ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {Array.from({ length: 5 }).map((_, index) => (
                <li key={index} className="px-4 py-4 sm:px-6 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {sortedOrders.map((order) => (
              <li key={order.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Receipt className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                                                     <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                             {getPaymentMethodDisplay(order.paymentMethod, order, t)}
                           </span>
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4" />
                          {format(new Date(order.timestamp), 'MMM dd, yyyy HH:mm')}
                          {order.cashier_name && (
                            <span className="ml-3 text-xs text-gray-400">
                              by {order.cashier_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                                                 <p className="text-sm font-medium text-gray-900">
                           {formatCurrency(Number(order.total))}
                         </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} {t('pos.items')}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700 flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-1" />
{t('orders.orderDetails')}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
              ))}
            </ul>
          </div>
        )}

        {!ordersLoading && sortedOrders.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t('orders.noOrders')}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders match your search.'}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const [showReceipt, setShowReceipt] = useState(false);
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();
  
  const handlePrint = () => {
    setShowReceipt(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{t('orders.orderDetails')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">{t('orders.orderId')}</p>
                <p className="text-sm text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('orders.date')} & Time</p>
                <p className="text-sm text-gray-900">
                  {format(new Date(order.timestamp), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">{t('orders.paymentMethod')}</p>
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(order.paymentMethod)}`}>
                   {getPaymentMethodDisplay(order.paymentMethod, order, t)}
                 </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Cashier</p>
                <p className="text-sm text-gray-900">{order.cashier_name || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">{t('orders.items')}</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <div>
                    <p className="font-medium">{item.product?.name || item.product_name}</p>
                                         <p className="text-sm text-gray-500">
                       {formatCurrency(Number(item.unit_price || item.product?.price || 0))} × {item.quantity}
                     </p>
                   </div>
                   <p className="font-medium">
                     {formatCurrency(Number(item.total_price || (item.unit_price || 0) * item.quantity))}
                   </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
                             <div className="flex justify-between text-sm">
                 <span>{t('pos.subtotal')}:</span>
                 <span>{formatCurrency(Number(order.subtotal))}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span>{t('pos.tax')}:</span>
                 <span>{formatCurrency(Number(order.tax))}</span>
               </div>
               {order.discount > 0 && (
                 <div className="flex justify-between text-sm text-green-600">
                   <span>{t('checkout.discount')}:</span>
                   <span>-{formatCurrency(Number(order.discount))}</span>
                 </div>
               )}
               <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                 <span>{t('pos.total')}:</span>
                 <span>{formatCurrency(Number(order.total))}</span>
               </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
            >
{t('common.close')}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center"
            >
              <Receipt className="h-4 w-4 mr-2" />
Print Receipt
            </button>
          </div>
        </div>
      </div>
      
      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">In hóa đơn</h2>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <ReceiptComponent
              order={order}
              receiptNumber={order.id.slice(-8).toUpperCase()}
              cashierName={order.cashier_name || 'Unknown'}
              storeName="Cửa hàng POS"
              storeAddress="123 Đường ABC, Quận 1, TP.HCM"
              storePhone="0123456789"
              receiptHeader="Cảm ơn quý khách đã mua hàng!"
              receiptFooter="Hẹn gặp lại quý khách!"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
