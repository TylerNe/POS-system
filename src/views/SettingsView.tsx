import React, { useState, useEffect } from 'react';
import { Settings, Store, Receipt, Users, QrCode, DollarSign, Globe, Bluetooth } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserManagement from '../components/UserManagement';
import VietQRSettings from '../components/VietQRSettings';
import BluetoothPrinterManager from '../components/BluetoothPrinterManager';
import toast from 'react-hot-toast';

interface SettingsData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptHeader: string;
  receiptFooter: string;
  autoPrint: boolean;
  taxRate: number;
  taxName: string;
  taxInclusive: boolean;
  requireLogin: boolean;
  trackCashier: boolean;
}

const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const { currency, setCurrency, isLoading: currencyLoading } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [showVietQRSettings, setShowVietQRSettings] = useState(false);
  const [showBluetoothPrinter, setShowBluetoothPrinter] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    storeName: 'My Store',
    storeAddress: '123 Main Street, City, State 12345',
    storePhone: '(555) 123-4567',
    receiptHeader: 'Thank you for your business!',
    receiptFooter: 'Please come again!',
    autoPrint: true,
    taxRate: 10,
    taxName: 'Sales Tax',
    taxInclusive: false,
    requireLogin: false,
    trackCashier: true,
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('posSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    try {
      localStorage.setItem('posSettings', JSON.stringify(settings));
      toast.success(t('toast.settingsSaved'));
    } catch (error) {
      toast.error(t('toast.failedToSaveSettings'));
    }
  };
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{t('settings.title')}</h1>
          <p className="mt-2 text-sm text-gray-700">
            Configure your POS system preferences and business information
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Store Information */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                Store Information
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={settings.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    value={settings.storeAddress}
                    onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.storePhone}
                    onChange={(e) => handleInputChange('storePhone', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Receipt className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                Receipt Settings
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Receipt Header
                  </label>
                  <input
                    type="text"
                    value={settings.receiptHeader}
                    onChange={(e) => handleInputChange('receiptHeader', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Receipt Footer
                  </label>
                  <input
                    type="text"
                    value={settings.receiptFooter}
                    onChange={(e) => handleInputChange('receiptFooter', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="auto-print"
                    name="auto-print"
                    type="checkbox"
                    checked={settings.autoPrint}
                    onChange={(e) => handleInputChange('autoPrint', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-print" className="ml-2 block text-sm text-gray-900">
                    Auto-print receipts
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                Tax Settings
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Name
                  </label>
                  <input
                    type="text"
                    value={settings.taxName}
                    onChange={(e) => handleInputChange('taxName', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="tax-inclusive"
                    name="tax-inclusive"
                    type="checkbox"
                    checked={settings.taxInclusive}
                    onChange={(e) => handleInputChange('taxInclusive', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="tax-inclusive" className="ml-2 block text-sm text-gray-900">
                    Tax inclusive pricing
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                Current Session
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current User
                  </label>
                  <input
                    type="text"
                    value={user?.username || 'Current User'}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || 'Unknown'}
                    disabled
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="track-cashier"
                    name="track-cashier"
                    type="checkbox"
                    checked={settings.trackCashier}
                    onChange={(e) => handleInputChange('trackCashier', e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="track-cashier" className="ml-2 block text-sm text-gray-900">
                    Track cashier for each sale
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Management - Only for Admin */}
        {user?.role === 'admin' && (
          <UserManagement />
        )}

        {/* Currency Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                {t('settings.currencySettings')}
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.currency')}
                  </label>
                  <select
                    value={currency.code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const newCurrency = code === 'VND' 
                        ? { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' }
                        : { code: 'USD', symbol: '$', name: 'US Dollar' };
                      setCurrency(newCurrency);
                    }}
                    disabled={currencyLoading}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="VND">Vietnamese Dong (₫)</option>
                    <option value="USD">US Dollar ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Setting
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900">
                      <strong>{currency.name}</strong> ({currency.symbol})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Example: {currency.code === 'VND' ? '50,000 ₫' : '$50.00'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Globe className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                {t('settings.languageSettings')}
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t('settings.language')}
                  </label>
                  <select
                    value={language.code}
                    onChange={(e) => {
                      const code = e.target.value;
                      const newLanguage = code === 'vi' 
                        ? { code: 'vi', name: 'Vietnamese' }
                        : { code: 'en', name: 'English' };
                      setLanguage(newLanguage);
                    }}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    <option value="vi">{t('settings.vietnamese')}</option>
                    <option value="en">{t('settings.english')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Setting
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-900">
                      <strong>{language.name}</strong> ({language.code.toUpperCase()})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Example: {t('common.loading')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VietQR Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <QrCode className="h-8 w-8 text-primary-600" />
                <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                  VietQR Settings
                </h3>
              </div>
              <button
                onClick={() => setShowVietQRSettings(true)}
                className="bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 text-sm"
              >
                Configure
              </button>
            </div>
            <div className="mt-5">
              <p className="text-sm text-gray-600">
                Configure bank accounts and settings for VietQR payment processing.
              </p>
            </div>
          </div>
        </div>

        {/* Bluetooth Printer Settings */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bluetooth className="h-8 w-8 text-primary-600" />
                <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                  Bluetooth Printer
                </h3>
              </div>
              <button
                onClick={() => setShowBluetoothPrinter(true)}
                className="bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700 text-sm"
              >
                Configure
              </button>
            </div>
            <div className="mt-5">
              <p className="text-sm text-gray-600">
                Connect and configure Bluetooth thermal printer for receipt printing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSaveSettings}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      {/* VietQR Settings Modal */}
      {showVietQRSettings && (
        <VietQRSettings
          onClose={() => setShowVietQRSettings(false)}
          onSave={() => setShowVietQRSettings(false)}
        />
      )}

      {/* Bluetooth Printer Manager Modal */}
      {showBluetoothPrinter && (
        <BluetoothPrinterManager
          isOpen={showBluetoothPrinter}
          onClose={() => setShowBluetoothPrinter(false)}
        />
      )}
    </div>
  );
};

export default SettingsView;
