import React, { useState, useEffect } from 'react';
import { usePOSStore } from '../store';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/ProductCard';
import Cart from '../components/Cart';
import Checkout from '../components/Checkout';
import VietQRPayment from '../components/VietQRPayment';
import ReceiptComponent from '../components/Receipt';
import { Search, Filter, ShoppingCart, X, QrCode } from 'lucide-react';

const POSView: React.FC = () => {
  const { products, cart, fetchProducts, productsLoading, getCartTotal } = usePOSStore();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [showVietQR, setShowVietQR] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchProducts();
    
    // Device detection
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isTablet = /ipad|android(?=.*\b(?!.*mobile))/i.test(userAgent);
      const isPhone = isMobileDevice && !isTablet;
      
      setIsMobile(isPhone);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, [fetchProducts]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCheckoutComplete = (orderId: string) => {
    setShowCheckout(false);
    setShowCart(false);
    
    // Get the completed order from store
    const order = usePOSStore.getState().orders.find(o => o.id === orderId);
    if (order) {
      setCompletedOrder(order);
      setShowReceipt(true);
    }
  };

  const handleVietQRComplete = () => {
    setShowVietQR(false);
    setShowCart(false);
    
    // For VietQR, we'll create a mock order for receipt
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
      total: getCartTotal(),
      subtotal: getCartTotal() - (getCartTotal() * 0.1),
      tax: getCartTotal() * 0.1,
      discount: 0,
      paymentMethod: 'vietqr' as const,
      timestamp: new Date().toISOString(),
      cashier_name: 'Cashier'
    };
    
    setCompletedOrder(mockOrder);
    setShowReceipt(true);
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="px-2 sm:px-4">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-white z-10 pb-2 border-b">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-gray-900">Point of Sale</h1>
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 bg-primary-600 text-white rounded-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm mb-3">
            <div className="flex flex-col gap-3 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search') + " products..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? t('common.filter') + ' Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Products Grid */}
        <div className="pb-20">
          {productsLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-3 animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} variant="pos" />
                ))}
              </div>

              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t('products.noProducts')}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold">{t('pos.cart')}</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Cart />
                </div>
                {cart.length > 0 && (
                  <div className="p-4 border-t bg-white flex-shrink-0 space-y-2">
                    <button
                      onClick={() => {
                        setShowCheckout(true);
                        setShowCart(false);
                      }}
                      className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 font-medium"
                    >
{t('pos.checkout')}
                    </button>
                                         <div className="space-y-2">
                       <button
                         onClick={() => {
                           setShowVietQR(true);
                           setShowCart(false);
                         }}
                         className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center"
                       >
                         <QrCode className="h-4 w-4 mr-2" />
{t('checkout.vietqr')}
                       </button>
                       
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

              {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}

                            {/* VietQR Modal */}
       {showVietQR && (
         <VietQRPayment
           amount={getCartTotal()}
           orderId={`ORDER-${Date.now()}`}
           onPaymentComplete={handleVietQRComplete}
           onClose={() => setShowVietQR(false)}
         />
       )}

       
      </div>
    );
  }

  // Desktop/Tablet Layout (existing code)
  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Point of Sale</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-700">
            Select products to add to cart and process sales
          </p>
        </div>
      </div>

      <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Products Section */}
        <div className="md:col-span-2">
          {/* Search and Filter */}
          <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm mb-3 md:mb-4">
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search') + " products..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? t('common.filter') + ' Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} variant="pos" />
                ))}
              </div>

              {filteredProducts.length === 0 && !productsLoading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">{t('products.noProducts')}</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cart Section */}
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <Cart />
            
            {cart.length > 0 && (
              <div className="space-y-2 mt-3 md:mt-4">
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-primary-600 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg hover:bg-primary-700 font-medium text-sm md:text-base"
                >
                  Proceed to Checkout
                </button>
                                 <div className="space-y-2">
                   <button
                     onClick={() => setShowVietQR(true)}
                     className="w-full bg-green-600 text-white py-2 md:py-3 px-3 md:px-4 rounded-lg hover:bg-green-700 font-medium text-sm md:text-base flex items-center justify-center"
                   >
                     <QrCode className="h-4 w-4 mr-2" />
                     Thanh toán VietQR
                   </button>

                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <Checkout
          onClose={() => setShowCheckout(false)}
          onComplete={handleCheckoutComplete}
        />
      )}

      {/* VietQR Modal */}
      {showVietQR && (
        <VietQRPayment
          amount={getCartTotal()}
          orderId={`ORDER-${Date.now()}`}
          onPaymentComplete={handleVietQRComplete}
          onClose={() => setShowVietQR(false)}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && completedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{t('orders.orderDetails')}</h2>
              <button
                onClick={() => setShowReceipt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <ReceiptComponent
              order={completedOrder}
              receiptNumber={completedOrder.id.slice(-8).toUpperCase()}
              cashierName={completedOrder.cashier_name || 'Cashier'}
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

export default POSView;
