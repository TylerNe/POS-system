import React from 'react';
import { Settings, Store, Receipt, Users } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
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
                    defaultValue="My Store"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="123 Main Street, City, State 12345"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    defaultValue="(555) 123-4567"
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
                    defaultValue="Thank you for your business!"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Receipt Footer
                  </label>
                  <input
                    type="text"
                    defaultValue="Please come again!"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="auto-print"
                    name="auto-print"
                    type="checkbox"
                    defaultChecked
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
                    defaultValue="10"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tax Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Sales Tax"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="tax-inclusive"
                    name="tax-inclusive"
                    type="checkbox"
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

        {/* User Management */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600" />
              <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                User Management
              </h3>
            </div>
            <div className="mt-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Current Cashier
                  </label>
                  <input
                    type="text"
                    defaultValue="Admin User"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    id="require-login"
                    name="require-login"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="require-login" className="ml-2 block text-sm text-gray-900">
                    Require login for POS access
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="track-cashier"
                    name="track-cashier"
                    type="checkbox"
                    defaultChecked
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
      </div>

      {/* Save Button */}
      <div className="mt-6">
        <button
          type="button"
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsView;
