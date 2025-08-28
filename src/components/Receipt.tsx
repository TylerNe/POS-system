import React, { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useCurrency } from '../contexts/CurrencyContext';
import { printerService, type ReceiptData } from '../services/bluetoothPrinter';
import { Printer, Bluetooth, CheckCircle, XCircle } from 'lucide-react';
import type { Order } from '../types';
import toast from 'react-hot-toast';

interface ReceiptProps {
  order: Order;
  receiptNumber: string;
  cashierName: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

const Receipt: React.FC<ReceiptProps> = ({
  order,
  receiptNumber,
  cashierName,
  storeName = 'Cửa hàng của bạn',
  storeAddress = 'Địa chỉ cửa hàng',
  storePhone = '0123456789',
  receiptHeader = 'Cảm ơn quý khách!',
  receiptFooter = 'Hẹn gặp lại!'
}) => {
  const { formatCurrency } = useCurrency();
  const [isPrinting, setIsPrinting] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);

  // Check Bluetooth connection status
  React.useEffect(() => {
    setIsBluetoothConnected(printerService.isConnected());
  }, []);
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${receiptNumber}</title>
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .receipt { width: 80mm; font-family: 'Courier New', monospace; }
            }
            body { font-family: 'Courier New', monospace; margin: 0; padding: 10px; }
            .receipt { width: 80mm; margin: 0 auto; background: white; }
            .header { text-align: center; margin-bottom: 10px; }
            .store-name { font-size: 14px; font-weight: bold; margin-bottom: 2px; }
            .store-info { font-size: 10px; color: #666; margin-bottom: 5px; }
            .receipt-header { font-size: 10px; color: #333; margin-bottom: 10px; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            .order-info { font-size: 10px; margin-bottom: 10px; }
            .items { margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; }
            .item-name { flex: 1; }
            .item-price { text-align: right; }
            .totals { font-size: 11px; }
            .total-line { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .total-final { font-weight: bold; font-size: 12px; border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; font-size: 10px; color: #666; margin-top: 10px; }
            .payment-info { font-size: 10px; margin: 10px 0; }
            .qr-code { text-align: center; margin: 10px 0; }
            .qr-placeholder { width: 60px; height: 60px; border: 1px solid #ccc; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">${storeName}</div>
              <div class="store-info">${storeAddress}</div>
              <div class="store-info">ĐT: ${storePhone}</div>
            </div>
            
            <div class="receipt-header">${receiptHeader}</div>
            
            <div class="divider"></div>
            
            <div class="order-info">
              <div>Hóa đơn: #${receiptNumber}</div>
              <div>Ngày: ${format(new Date(order.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
              <div>Thu ngân: ${cashierName}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="items">
              ${order.items.map(item => `
                <div class="item">
                  <div class="item-name">${item.product?.name || item.product_name}</div>
                  <div class="item-price">${formatCurrency(Number(item.unit_price || item.product?.price || 0))}</div>
                </div>
                <div class="item">
                  <div class="item-name">  ${item.quantity} x ${formatCurrency(Number(item.unit_price || item.product?.price || 0))}</div>
                  <div class="item-price">${formatCurrency(Number(item.total_price || (item.unit_price || 0) * item.quantity))}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="divider"></div>
            
            <div class="totals">
              <div class="total-line">
                <span>Tạm tính:</span>
                <span>${formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div class="total-line">
                <span>Thuế (10%):</span>
                <span>${formatCurrency(Number(order.tax))}</span>
              </div>
              ${order.discount > 0 ? `
                <div class="total-line">
                  <span>Giảm giá:</span>
                  <span>-${formatCurrency(Number(order.discount))}</span>
                </div>
              ` : ''}
              <div class="total-line total-final">
                <span>TỔNG CỘNG:</span>
                <span>${formatCurrency(Number(order.total))}</span>
              </div>
            </div>
            
            <div class="payment-info">
              <div>Phương thức: ${order.paymentMethod === 'cash' ? 'Tiền mặt' : 
                                   order.paymentMethod === 'card' ? 'Thẻ' : 
                                   order.paymentMethod === 'vietqr' ? 'VietQR' : 
                                   order.paymentMethod === 'digital' ? 'Ví điện tử' : 'Khác'}</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="qr-code">
              <div class="qr-placeholder">QR Code</div>
              <div style="font-size: 8px; margin-top: 5px;">Quét để xem chi tiết</div>
            </div>
            
            <div class="footer">
              <div>${receiptFooter}</div>
              <div style="margin-top: 5px;">Cảm ơn quý khách!</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  const handleBluetoothPrint = async () => {
    if (!isBluetoothConnected) {
      toast.error('Máy in Bluetooth chưa được kết nối. Vui lòng kết nối máy in trước.');
      return;
    }

    setIsPrinting(true);
    try {
      const receiptData: ReceiptData = {
        storeName,
        storeAddress,
        storePhone,
        receiptNumber,
        timestamp: format(new Date(order.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi }),
        cashierName,
        items: order.items.map(item => ({
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
        receiptHeader,
        receiptFooter
      };

      await printerService.printReceipt(receiptData);
      toast.success('In hóa đơn thành công!');
    } catch (error) {
      console.error('Lỗi khi in hóa đơn:', error);
      toast.error(`Lỗi khi in: ${error instanceof Error ? error.message : 'Không thể in hóa đơn'}`);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm mx-auto">
      {/* Receipt Preview */}
      <div className="font-mono text-xs bg-gray-50 p-3 rounded border mb-4">
        <div className="text-center mb-2">
          <div className="font-bold text-sm">{storeName}</div>
          <div className="text-gray-600">{storeAddress}</div>
          <div className="text-gray-600">ĐT: {storePhone}</div>
        </div>
        
        <div className="border-t border-b border-gray-300 py-1 mb-2 text-center">
          {receiptHeader}
        </div>
        
        <div className="mb-2">
          <div>Hóa đơn: #{receiptNumber}</div>
          <div>Ngày: {format(new Date(order.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}</div>
          <div>Thu ngân: {cashierName}</div>
        </div>
        
        <div className="border-t border-gray-300 py-1 mb-2">
          {order.items.map((item, index) => (
            <div key={index} className="mb-1">
              <div className="flex justify-between">
                <span>{item.product?.name || item.product_name}</span>
                <span>{formatCurrency(Number(item.unit_price || item.product?.price || 0))}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>  {item.quantity} x {formatCurrency(Number(item.unit_price || item.product?.price || 0))}</span>
                <span>{formatCurrency(Number(item.total_price || (item.unit_price || 0) * item.quantity))}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-300 py-1">
          <div className="flex justify-between">
            <span>Tạm tính:</span>
            <span>{formatCurrency(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span>Thuế (10%):</span>
            <span>{formatCurrency(Number(order.tax))}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá:</span>
              <span>-{formatCurrency(Number(order.discount))}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-gray-300 pt-1 mt-1">
            <span>TỔNG CỘNG:</span>
            <span>{formatCurrency(Number(order.total))}</span>
          </div>
        </div>
        
        <div className="text-center mt-2 text-gray-600">
          <div>{receiptFooter}</div>
          <div className="mt-1">Cảm ơn quý khách!</div>
        </div>
      </div>
      
      {/* Print Buttons */}
      <div className="space-y-3">
        {/* Bluetooth Connection Status */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {isBluetoothConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-gray-600">
              {isBluetoothConnected ? 'Máy in Bluetooth đã kết nối' : 'Máy in Bluetooth chưa kết nối'}
            </span>
          </div>
        </div>

        {/* Print Options */}
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>In thường</span>
          </button>
          
          <button
            onClick={handleBluetoothPrint}
            disabled={!isBluetoothConnected || isPrinting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang in...</span>
              </>
            ) : (
              <>
                <Bluetooth className="h-4 w-4" />
                <span>In Bluetooth</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
