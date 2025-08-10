import React, { useState, useEffect } from 'react';
import { QrCode, Copy, CheckCircle, Clock, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import VietQRSettings from './VietQRSettings';
import type { VietQRSettings as VietQRSettingsType } from './VietQRSettings';
import { vietQRAPI } from '../services/api';

interface VietQRPaymentProps {
  amount: number;
  orderId: string;
  onPaymentComplete: () => void;
  onClose: () => void;
}

interface BankInfo {
  code: string;
  name: string;
  logo?: string;
}

const VietQRPayment: React.FC<VietQRPaymentProps> = ({ 
  amount, 
  orderId, 
  onPaymentComplete, 
  onClose 
}) => {
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<VietQRSettingsType | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from API first
        const apiSettings = await vietQRAPI.getSettings();
        console.log('🔍 Loaded settings from API:', apiSettings);
        setSettings(apiSettings);
        setTimeLeft(apiSettings.timeoutMinutes * 60);
        
        // Also save to localStorage as backup
        localStorage.setItem('vietqr-settings', JSON.stringify(apiSettings));
      } catch (error) {
        console.log('API not available, loading from localStorage');
        
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('vietqr-settings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            console.log('🔍 Loaded settings from localStorage:', parsed);
            setSettings(parsed);
            setTimeLeft(parsed.timeoutMinutes * 60);
          } catch (error) {
            console.error('Error loading VietQR settings:', error);
          }
        }
      }
    };

    loadSettings();
  }, []);

  // Get banks from settings or use default
  const banks: BankInfo[] = settings?.bankAccounts
    .filter(acc => acc.isActive)
    .map(acc => ({ code: acc.bankCode, name: acc.bankName })) || [
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'TCB', name: 'Techcombank' },
      { code: 'BIDV', name: 'BIDV' },
      { code: 'MB', name: 'MB Bank' },
      { code: 'ACB', name: 'ACB' },
      { code: 'VPB', name: 'VPBank' },
      { code: 'STB', name: 'Sacombank' },
      { code: 'TPB', name: 'TPBank' },
      { code: 'MSB', name: 'MSB' },
      { code: 'VIB', name: 'VIB' },
    ];

  // Generate VietQR data
  const generateVietQRData = (bankCode: string) => {
    console.log('🔍 Generating QR for bank:', bankCode);
    console.log('🔍 Current settings:', settings);
    
    // Get account info from settings
    const account = settings?.bankAccounts.find(acc => acc.bankCode === bankCode && acc.isActive);
    console.log('🔍 Found account:', account);
    
    if (!account) {
      console.log('🔍 No active account found, using demo data');
      // Use demo data if no real account is configured
      const demoAccount = {
        accountNumber: '1234567890',
        accountName: 'DEMO ACCOUNT',
        bankCode: bankCode,
        bankName: banks.find(b => b.code === bankCode)?.name || bankCode
      };
      
      // Use Google Charts API as primary QR generator
      const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(`VietQR:${bankCode}:${demoAccount.accountNumber}:${amount}:${orderId}`)}&chld=L|0`;
      
      return qrUrl;
    }

    // For real accounts, use Google Charts API
    const qrData = `VietQR:${bankCode}:${account.accountNumber}:${amount}:${orderId}:${account.accountName}`;
    
    // Use Google Charts API - more reliable than other services
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(qrData)}&chld=L|0`;
    
    return qrUrl;
  };

  // Handle bank selection
  const handleBankSelect = (bankCode: string) => {
    setSelectedBank(bankCode);
    const qrData = generateVietQRData(bankCode);
    console.log('Generated QR URL:', qrData); // Debug log
    setQrCodeData(qrData);
  };

  // Copy account number
  const copyAccountNumber = () => {
    const account = settings?.bankAccounts.find(acc => acc.bankCode === selectedBank && acc.isActive);
    const accountNumber = account?.accountNumber || '1234567890';
    navigator.clipboard.writeText(accountNumber);
    toast.success('Sao chép số tài khoản thành công!');
  };

  // Simulate payment status check
  useEffect(() => {
    if (selectedBank && qrCodeData) {
      // In real app, this would poll the payment API
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setPaymentStatus('failed');
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [selectedBank, qrCodeData]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg md:text-xl font-semibold flex items-center">
            <QrCode className="h-5 w-5 mr-2" />
            Thanh toán VietQR
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Cài đặt VietQR"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mb-4">
          {paymentStatus === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-blue-800 text-sm">Đang chờ thanh toán</span>
                </div>
                <span className="text-blue-600 font-medium">{formatTime(timeLeft)}</span>
              </div>
            </div>
          )}
          {paymentStatus === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-green-800 text-sm">Thanh toán thành công!</span>
              </div>
            </div>
          )}
          {paymentStatus === 'failed' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="text-red-800 text-sm">Hết thời gian thanh toán</span>
            </div>
          )}
        </div>

        {/* Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center">
          <div className="text-sm text-gray-600">Số tiền cần thanh toán</div>
          <div className="text-2xl font-bold text-primary-600">
            {amount.toLocaleString('vi-VN')} ₫
          </div>
          <div className="text-xs text-gray-500 mt-1">Mã đơn hàng: {orderId}</div>
        </div>

        {/* Bank Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn ngân hàng
          </label>
          <div className="grid grid-cols-2 gap-2">
            {banks.map((bank) => (
              <button
                key={bank.code}
                onClick={() => handleBankSelect(bank.code)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedBank === bank.code
                    ? 'border-primary-500 bg-primary-50 text-primary-600'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-medium">{bank.name}</div>
                <div className="text-xs text-gray-500">{bank.code}</div>
              </button>
            ))}
          </div>
        </div>

                 {/* QR Code Display */}
         {selectedBank && qrCodeData && (
           <div className="mb-4">
             <div className="text-center">
               <div className="bg-gray-100 rounded-lg p-4 inline-block">
                 <img 
                   src={qrCodeData} 
                   alt="VietQR Code"
                   className="w-48 h-48 rounded-lg"
                   onError={(e) => {
                     // Try alternative QR generator if first one fails
                     const target = e.target as HTMLImageElement;
                     const account = settings?.bankAccounts.find(acc => acc.bankCode === selectedBank);
                     const accountNumber = account?.accountNumber || '1234567890';
                     
                     // Use QR Server API as fallback
                     const alternativeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`VietQR:${selectedBank}:${accountNumber}:${amount}:${orderId}`)}`;
                     
                     target.src = alternativeUrl;
                     target.onerror = () => {
                       // If both fail, show placeholder
                       target.style.display = 'none';
                       target.nextElementSibling?.classList.remove('hidden');
                     };
                   }}
                 />
                 <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hidden">
                   <div className="text-center">
                     <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                     <p className="text-xs text-gray-500">Không thể tải QR Code</p>
                     <p className="text-xs text-gray-400 mt-1">Vui lòng kiểm tra kết nối mạng</p>
                   </div>
                 </div>
               </div>
             </div>
            
                         {/* Account Info */}
             <div className="mt-4 bg-gray-50 rounded-lg p-3">
               <div className="text-sm text-gray-600 mb-2">Thông tin tài khoản</div>
               <div className="flex items-center justify-between">
                 <div>
                   <div className="text-sm font-medium">Số tài khoản</div>
                   <div className="text-lg font-mono">
                     {(() => {
                       const account = settings?.bankAccounts.find(acc => acc.bankCode === selectedBank);
                       return account?.accountNumber || '1234567890 (Demo)';
                     })()}
                   </div>
                 </div>
                 <button
                   onClick={copyAccountNumber}
                   className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                 >
                   <Copy className="h-4 w-4" />
                 </button>
               </div>
               <div className="mt-2">
                 <div className="text-sm font-medium">Chủ tài khoản</div>
                 <div className="text-sm">
                   {(() => {
                     const account = settings?.bankAccounts.find(acc => acc.bankCode === selectedBank);
                     return account?.accountName || 'DEMO ACCOUNT';
                   })()}
                 </div>
               </div>
               {!settings?.bankAccounts.find(acc => acc.bankCode === selectedBank) && (
                 <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                   <p className="text-xs text-yellow-700">
                     💡 Đây là dữ liệu demo. Vui lòng cấu hình tài khoản thật trong cài đặt để sử dụng VietQR thực tế.
                   </p>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <div className="text-sm font-medium text-blue-800 mb-2">Hướng dẫn thanh toán:</div>
          <ol className="text-xs text-blue-700 space-y-1">
            <li>1. Mở ứng dụng ngân hàng trên điện thoại</li>
            <li>2. Chọn tính năng "Quét mã QR"</li>
            <li>3. Quét mã QR bên trên</li>
            <li>4. Kiểm tra thông tin và xác nhận thanh toán</li>
            <li>5. Hoàn tất giao dịch</li>
          </ol>
          {!settings?.bankAccounts.find(acc => acc.isActive) && (
            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-700">
                <strong>Lưu ý:</strong> Để sử dụng VietQR thực tế, vui lòng cấu hình tài khoản ngân hàng thật trong cài đặt (biểu tượng ⚙️).
              </p>
            </div>
          )}
          
          {/* Debug section - only show in development */}
          {import.meta.env.DEV && selectedBank && (
            <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
              <p className="text-xs text-gray-700 mb-2">
                <strong>Debug Info:</strong>
              </p>
              <p className="text-xs text-gray-600">Bank: {selectedBank}</p>
              <p className="text-xs text-gray-600">Account: {settings?.bankAccounts.find(acc => acc.bankCode === selectedBank)?.accountNumber || 'Demo'}</p>
              <p className="text-xs text-gray-600">Amount: {amount}</p>
              <p className="text-xs text-gray-600">Settings loaded: {settings ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-600">Active accounts: {settings?.bankAccounts.filter(acc => acc.isActive).length || 0}</p>
              <button
                onClick={() => {
                  console.log('🔍 Current settings:', settings);
                  console.log('🔍 All bank accounts:', settings?.bankAccounts);
                  console.log('🔍 Active accounts:', settings?.bankAccounts.filter(acc => acc.isActive));
                }}
                className="mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                Log Settings
              </button>
              <button
                onClick={() => {
                  const newQrData = generateVietQRData(selectedBank);
                  setQrCodeData(newQrData);
                  console.log('Regenerated QR URL:', newQrData);
                }}
                className="mt-2 ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              >
                Regenerate QR
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('vietqr-settings');
                  window.location.reload();
                }}
                className="mt-2 ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Reset Settings
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Hủy
          </button>
          {paymentStatus === 'completed' && (
            <button
              onClick={onPaymentComplete}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700"
            >
              Hoàn tất
            </button>
          )}
                 </div>
       </div>

       {/* Settings Modal */}
       {showSettings && (
         <VietQRSettings
           onClose={() => setShowSettings(false)}
           onSave={(newSettings) => {
             setSettings(newSettings);
             setShowSettings(false);
             // Reload banks and reset selection
             setSelectedBank('');
             setQrCodeData('');
           }}
         />
       )}
     </div>
   );
 };

export default VietQRPayment;

