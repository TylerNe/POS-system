import React, { useState, useEffect } from 'react';
import { Settings, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { vietQRAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';

interface BankAccountInfo {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  isActive: boolean;
}

interface VietQRSettingsProps {
  onClose: () => void;
  onSave: (settings: VietQRSettings) => void;
}

export interface VietQRSettings {
  bankAccounts: BankAccountInfo[];
  defaultBankCode: string;
  qrCodeSize: number;
  autoRefresh: boolean;
  timeoutMinutes: number;
}

const VietQRSettings: React.FC<VietQRSettingsProps> = ({ onClose, onSave }) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<VietQRSettings>({
    bankAccounts: [],
    defaultBankCode: '',
    qrCodeSize: 300,
    autoRefresh: true,
    timeoutMinutes: 5
  });


  const [newAccount, setNewAccount] = useState<Partial<BankAccountInfo>>({
    accountNumber: '',
    accountName: '',
    bankCode: '',
    bankName: '',
    isActive: true
  });

  // Sample bank data
  const banks = [
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
    { code: 'OCB', name: 'OCB' },
    { code: 'SCB', name: 'SCB' },
    { code: 'HDB', name: 'HDBank' },
    { code: 'SHB', name: 'SHB' },
    { code: 'EIB', name: 'Eximbank' },
  ];

  // Load settings from API or localStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Try to load from API first
        const apiSettings = await vietQRAPI.getSettings();
        setSettings(apiSettings);
      } catch (error) {
        console.log('API not available, loading from localStorage');
        
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('vietqr-settings');
        if (savedSettings) {
          try {
            const parsed = JSON.parse(savedSettings);
            setSettings(parsed);
          } catch (error) {
            console.error('Error loading VietQR settings:', error);
          }
        } else {
          // Add demo data if no settings exist
          const demoSettings: VietQRSettings = {
            bankAccounts: [
              {
                accountNumber: '1234567890',
                accountName: 'DEMO ACCOUNT',
                bankCode: 'VCB',
                bankName: 'Vietcombank',
                isActive: true
              }
            ],
            defaultBankCode: 'VCB',
            qrCodeSize: 300,
            autoRefresh: true,
            timeoutMinutes: 5
          };
          setSettings(demoSettings);
        }
      }
    };

    loadSettings();
  }, []);

  const handleAddAccount = () => {
    if (!newAccount.accountNumber || !newAccount.accountName || !newAccount.bankCode) {
      toast.error(t('toast.vietQRFields'));
      return;
    }

    const bank = banks.find(b => b.code === newAccount.bankCode);
    const account: BankAccountInfo = {
      accountNumber: newAccount.accountNumber!,
      accountName: newAccount.accountName!,
      bankCode: newAccount.bankCode!,
      bankName: bank?.name || newAccount.bankCode!,
      isActive: newAccount.isActive ?? true
    };

    setSettings(prev => ({
      ...prev,
      bankAccounts: [...prev.bankAccounts, account]
    }));

    setNewAccount({
      accountNumber: '',
      accountName: '',
      bankCode: '',
      bankName: '',
      isActive: true
    });

    toast.success(t('toast.accountAdded'));
  };

  const handleRemoveAccount = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
    toast.success(t('toast.accountDeleted'));
  };

  const handleToggleAccount = (index: number) => {
    setSettings(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map((account, i) => 
        i === index ? { ...account, isActive: !account.isActive } : account
      )
    }));
  };

  const handleSave = async () => {
    if (settings.bankAccounts.length === 0) {
      toast.error(t('toast.addAtLeastOneAccount'));
      return;
    }

    try {
      // Try to save to API first
      await vietQRAPI.saveSettings(settings);
      
      // Also save to localStorage as backup
      localStorage.setItem('vietqr-settings', JSON.stringify(settings));
      
      // Call parent save function
      onSave(settings);
      
      toast.success(t('toast.vietQRSettingsSaved'));
      onClose();
    } catch (error) {
      console.log('API not available, saving to localStorage only');
      
      // Fallback to localStorage only
      localStorage.setItem('vietqr-settings', JSON.stringify(settings));
      
      // Call parent save function
      onSave(settings);
      
      toast.success(t('toast.settingsSavedLocal'));
      onClose();
    }
  };

  const handleBankSelect = (bankCode: string) => {
    const bank = banks.find(b => b.code === bankCode);
    setNewAccount(prev => ({
      ...prev,
      bankCode,
      bankName: bank?.name || bankCode
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Cài đặt VietQR
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Bank Accounts Section */}
          <div>
                         <h3 className="text-lg font-medium mb-4 flex items-center">
               <Building2 className="h-4 w-4 mr-2" />
               Tài khoản ngân hàng
             </h3>

            {/* Add New Account */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Thêm tài khoản mới</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tài khoản
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên chủ tài khoản
                  </label>
                  <input
                    type="text"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, accountName: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="CONG TY ABC"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngân hàng
                  </label>
                  <select
                    value={newAccount.bankCode}
                    onChange={(e) => handleBankSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Chọn ngân hàng</option>
                    {banks.map(bank => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name} ({bank.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddAccount}
                    className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 font-medium"
                  >
                    Thêm tài khoản
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Accounts */}
            <div className="space-y-3">
              {settings.bankAccounts.map((account, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${account.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <div className="font-medium">{account.accountName}</div>
                          <div className="text-sm text-gray-600">
                            {account.bankName} - {account.accountNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleAccount(index)}
                        className={`px-3 py-1 rounded text-sm ${
                          account.isActive 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {account.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                      </button>
                      <button
                        onClick={() => handleRemoveAccount(index)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}

                             {settings.bankAccounts.length === 0 && (
                 <div className="text-center py-8 text-gray-500">
                   <Building2 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                   <p>Chưa có tài khoản ngân hàng nào</p>
                   <p className="text-sm">Vui lòng thêm tài khoản để sử dụng VietQR</p>
                 </div>
               )}
            </div>
          </div>

          {/* General Settings */}
          <div>
            <h3 className="text-lg font-medium mb-4">Cài đặt chung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngân hàng mặc định
                </label>
                <select
                  value={settings.defaultBankCode}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultBankCode: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Chọn ngân hàng mặc định</option>
                  {settings.bankAccounts.filter(acc => acc.isActive).map(account => (
                    <option key={account.bankCode} value={account.bankCode}>
                      {account.bankName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kích thước QR Code (px)
                </label>
                <input
                  type="number"
                  min="200"
                  max="500"
                  value={settings.qrCodeSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, qrCodeSize: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian chờ thanh toán (phút)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.timeoutMinutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, timeoutMinutes: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={settings.autoRefresh}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRefresh" className="ml-2 block text-sm text-gray-700">
                  Tự động làm mới trạng thái thanh toán
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default VietQRSettings;
