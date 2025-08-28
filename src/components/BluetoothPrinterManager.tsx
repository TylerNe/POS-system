import React, { useState, useEffect } from 'react';
import { Bluetooth, WifiOff, Printer, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { printerService, type BluetoothPrinterDevice } from '../services/bluetoothPrinter';
// import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

interface BluetoothPrinterManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BluetoothPrinterManager: React.FC<BluetoothPrinterManagerProps> = ({ isOpen, onClose }) => {
  // const { t } = useLanguage(); // Unused for now
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<BluetoothPrinterDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothPrinterDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
      loadAvailableDevices();
    }
  }, [isOpen]);

  const checkConnectionStatus = () => {
    setIsConnected(printerService.isConnected());
  };

  const loadAvailableDevices = async () => {
    try {
      const devices = await printerService.getAvailableDevices();
      setAvailableDevices(devices);
      
      // Auto-select connected device
      const connectedDevice = devices.find(device => device.isConnected);
      if (connectedDevice) {
        setSelectedDevice(connectedDevice);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách thiết bị:', error);
    }
  };

  const handleConnect = async () => {
    if (isConnecting) return;

    setIsConnecting(true);
    try {
      const success = await printerService.connect();
      if (success) {
        setIsConnected(true);
        toast.success('Kết nối máy in thành công!');
        await loadAvailableDevices(); // Refresh device list
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      toast.error(`Lỗi kết nối: ${error instanceof Error ? error.message : 'Không thể kết nối'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await printerService.disconnect();
      setIsConnected(false);
      setSelectedDevice(null);
      toast.success('Đã ngắt kết nối máy in');
      await loadAvailableDevices(); // Refresh device list
    } catch (error) {
      console.error('Lỗi ngắt kết nối:', error);
      toast.error('Lỗi khi ngắt kết nối');
    }
  };

  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      await loadAvailableDevices();
      toast.success('Đã cập nhật danh sách thiết bị');
    } catch (error) {
      console.error('Lỗi quét thiết bị:', error);
      toast.error('Lỗi khi quét thiết bị');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTestPrint = async () => {
    if (!isConnected) {
      toast.error('Vui lòng kết nối máy in trước');
      return;
    }

    try {
      const testReceipt = {
        storeName: 'Cửa hàng Test',
        storeAddress: '123 Đường Test, Quận 1, TP.HCM',
        storePhone: '0123456789',
        receiptNumber: 'TEST-001',
        timestamp: new Date().toLocaleString('vi-VN'),
        cashierName: 'Nhân viên Test',
        items: [
          {
            name: 'Sản phẩm test',
            quantity: 1,
            unitPrice: 10000,
            totalPrice: 10000
          }
        ],
        subtotal: 9091,
        tax: 909,
        discount: 0,
        total: 10000,
        paymentMethod: 'Tiền mặt',
        receiptHeader: 'HÓA ĐƠN TEST',
        receiptFooter: 'Cảm ơn quý khách!'
      };

      await printerService.printReceipt(testReceipt);
      toast.success('In test thành công!');
    } catch (error) {
      console.error('Lỗi in test:', error);
      toast.error(`Lỗi in test: ${error instanceof Error ? error.message : 'Không thể in'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bluetooth className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Cài đặt máy in</h2>
              <p className="text-sm text-gray-500">Kết nối máy in qua Bluetooth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isConnected ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <WifiOff className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {isConnected ? 'Đã kết nối' : 'Chưa kết nối'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConnected ? 'Máy in sẵn sàng sử dụng' : 'Vui lòng kết nối máy in'}
                  </p>
                </div>
              </div>
              {selectedDevice && (
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800">{selectedDevice.name}</p>
                  <p className="text-xs text-gray-500">{selectedDevice.id}</p>
                </div>
              )}
            </div>
          </div>

          {/* Connection Actions */}
          <div className="space-y-3">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>Đang kết nối...</span>
                  </>
                ) : (
                  <>
                    <Bluetooth className="h-5 w-5" />
                    <span>Kết nối máy in</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <WifiOff className="h-5 w-5" />
                <span>Ngắt kết nối</span>
              </button>
            )}
          </div>

          {/* Available Devices */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Thiết bị có sẵn</h3>
              <button
                onClick={handleScanDevices}
                disabled={isScanning}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableDevices.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <Bluetooth className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Không có thiết bị nào</p>
                </div>
              ) : (
                availableDevices.map((device) => (
                  <div
                    key={device.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      device.isConnected
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDevice(device)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {device.isConnected ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Bluetooth className="h-5 w-5 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{device.name}</p>
                          <p className="text-xs text-gray-500">{device.id}</p>
                        </div>
                      </div>
                      {device.isConnected && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Đã kết nối
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Test Print */}
          {isConnected && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Kiểm tra máy in</h3>
              <button
                onClick={handleTestPrint}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Printer className="h-5 w-5" />
                <span>In thử nghiệm</span>
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn sử dụng</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Đảm bảo máy in đã bật và ở chế độ kết nối Bluetooth</li>
              <li>• Máy in phải hỗ trợ giao thức ESC/POS</li>
              <li>• Kích thước giấy: 80mm x 80mm</li>
              <li>• Hóa đơn sẽ tự động in khi hoàn thành đơn hàng</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BluetoothPrinterManager;
