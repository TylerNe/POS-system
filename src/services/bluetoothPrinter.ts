export interface BluetoothPrinterService {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  printReceipt(receiptData: ReceiptData): Promise<boolean>;
  getAvailableDevices(): Promise<BluetoothPrinterDevice[]>;
}

export interface ReceiptData {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  receiptNumber: string;
  timestamp: string;
  cashierName: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  receiptHeader?: string;
  receiptFooter?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BluetoothPrinterDevice {
  id: string;
  name: string;
  isConnected: boolean;
}

class BluetoothPrinterServiceImpl implements BluetoothPrinterService {
  private device: any | null = null; // Native BluetoothDevice
  private server: any | null = null; // BluetoothRemoteGATTServer
  private service: any | null = null; // BluetoothRemoteGATTService  
  private characteristic: any | null = null; // BluetoothRemoteGATTCharacteristic
  private isConnecting = false;

  async connect(): Promise<boolean> {
    if (this.isConnecting) {
      return false;
    }

    if (!(navigator as any).bluetooth) {
      throw new Error('Bluetooth không được hỗ trợ trên thiết bị này');
    }

    this.isConnecting = true;

    try {
      // Tìm kiếm thiết bị Bluetooth với service UUID cho máy in
      const selectedDevice = await (navigator as any).bluetooth.requestDevice({
        filters: [
          {
            services: ['000018f0-0000-1000-8000-00805f9b34fb'] // ESC/POS service UUID
          },
          {
            namePrefix: 'Printer'
          },
          {
            namePrefix: 'POS'
          },
          {
            namePrefix: 'Receipt'
          }
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0000ffe1-0000-1000-8000-00805f9b34fb'
        ]
      });

      this.device = selectedDevice;
      console.log('Thiết bị được chọn:', selectedDevice.name || 'Unknown');

      // Kết nối đến GATT server
      this.server = await selectedDevice.gatt?.connect();
      if (!this.server) {
        throw new Error('Không thể kết nối đến GATT server');
      }

      // Tìm service
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '0000ffe0-0000-1000-8000-00805f9b34fb'
      ];

      for (const uuid of serviceUUIDs) {
        try {
          this.service = await this.server.getPrimaryService(uuid);
          break;
        } catch (error) {
          console.log(`Service ${uuid} không tìm thấy, thử service khác...`);
        }
      }

      if (!this.service) {
        throw new Error('Không tìm thấy service phù hợp');
      }

      // Tìm characteristic để ghi dữ liệu
      const characteristicUUIDs = [
        '0000ffe1-0000-1000-8000-00805f9b34fb',
        '0000ffe2-0000-1000-8000-00805f9b34fb'
      ];

      for (const uuid of characteristicUUIDs) {
        try {
          this.characteristic = await this.service.getCharacteristic(uuid);
          break;
        } catch (error) {
          console.log(`Characteristic ${uuid} không tìm thấy, thử characteristic khác...`);
        }
      }

      if (!this.characteristic) {
        throw new Error('Không tìm thấy characteristic phù hợp');
      }

      console.log('Kết nối Bluetooth thành công!');
      return true;

    } catch (error) {
      console.error('Lỗi kết nối Bluetooth:', error);
      this.disconnect();
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      await this.device.gatt.disconnect();
    }
    this.device = null;
    this.server = null;
    this.service = null;
    this.characteristic = null;
    console.log('Đã ngắt kết nối Bluetooth');
  }

  isConnected(): boolean {
    return !!(this.device?.gatt?.connected);
  }

  async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    if (!this.isConnected()) {
      throw new Error('Máy in chưa được kết nối');
    }

    try {
      const commands = this.generateESCCommands(receiptData);
      
      // Gửi từng command đến máy in
      for (const command of commands) {
        await this.characteristic!.writeValue(command);
        // Đợi một chút giữa các lệnh
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      console.log('In hóa đơn thành công!');
      return true;

    } catch (error) {
      console.error('Lỗi khi in hóa đơn:', error);
      throw error;
    }
  }

  async getAvailableDevices(): Promise<BluetoothPrinterDevice[]> {
    // Trên web, chúng ta không thể quét thiết bị mà không yêu cầu người dùng
    // Chỉ có thể trả về thiết bị đã kết nối
    if (this.device) {
      return [{
        id: this.device.id,
        name: this.device.name || 'Unknown Device',
        isConnected: this.isConnected()
      }];
    }
    return [];
  }

  private generateESCCommands(receiptData: ReceiptData): Uint8Array[] {
    const commands: Uint8Array[] = [];

    // ESC/POS commands
    const ESC = 0x1B;
    const GS = 0x1D;
    const INIT = 0x40;
    const ALIGN_CENTER = 0x01;
    const ALIGN_LEFT = 0x00;
    // Font constants
    const BOLD_ON = 0x01;
    const BOLD_OFF = 0x00;
    const NORMAL_SIZE = 0x00;
    const CUT_PAPER = 0x00;
    const FEED_LINE = 0x0A;

    // Initialize printer
    commands.push(new Uint8Array([ESC, INIT]));

    // Header - Store name (centered, bold, double size)
    commands.push(new Uint8Array([ESC, 0x61, ALIGN_CENTER])); // Center alignment
    commands.push(new Uint8Array([ESC, 0x21, 0x30])); // Double height and width
    commands.push(new Uint8Array([ESC, 0x45, BOLD_ON])); // Bold on
    commands.push(this.textToBytes(receiptData.storeName));
    commands.push(new Uint8Array([FEED_LINE]));

    // Store info (normal size, left aligned)
    commands.push(new Uint8Array([ESC, 0x21, NORMAL_SIZE])); // Normal size
    commands.push(new Uint8Array([ESC, 0x45, BOLD_OFF])); // Bold off
    commands.push(new Uint8Array([ESC, 0x61, ALIGN_LEFT])); // Left alignment
    commands.push(this.textToBytes(receiptData.storeAddress));
    commands.push(new Uint8Array([FEED_LINE]));
    commands.push(this.textToBytes(`ĐT: ${receiptData.storePhone}`));
    commands.push(new Uint8Array([FEED_LINE]));

    // Receipt header
    if (receiptData.receiptHeader) {
      commands.push(new Uint8Array([ESC, 0x61, ALIGN_CENTER]));
      commands.push(this.textToBytes(receiptData.receiptHeader));
      commands.push(new Uint8Array([FEED_LINE]));
    }

    // Divider
    commands.push(new Uint8Array([ESC, 0x61, ALIGN_LEFT]));
    commands.push(this.textToBytes('--------------------------------'));
    commands.push(new Uint8Array([FEED_LINE]));

    // Order info
    commands.push(this.textToBytes(`Hóa đơn: #${receiptData.receiptNumber}`));
    commands.push(new Uint8Array([FEED_LINE]));
    commands.push(this.textToBytes(`Ngày: ${receiptData.timestamp}`));
    commands.push(new Uint8Array([FEED_LINE]));
    commands.push(this.textToBytes(`Thu ngân: ${receiptData.cashierName}`));
    commands.push(new Uint8Array([FEED_LINE]));

    // Divider
    commands.push(this.textToBytes('--------------------------------'));
    commands.push(new Uint8Array([FEED_LINE]));

    // Items
    for (const item of receiptData.items) {
      // Item name
      commands.push(this.textToBytes(item.name));
      commands.push(new Uint8Array([FEED_LINE]));
      
      // Item details
      const itemLine = `  ${item.quantity} x ${this.formatCurrency(item.unitPrice)}`;
      commands.push(this.textToBytes(itemLine));
      commands.push(new Uint8Array([FEED_LINE]));
      
      // Item total
      commands.push(new Uint8Array([ESC, 0x61, 0x02])); // Right alignment
      commands.push(this.textToBytes(this.formatCurrency(item.totalPrice)));
      commands.push(new Uint8Array([ESC, 0x61, ALIGN_LEFT])); // Back to left
      commands.push(new Uint8Array([FEED_LINE]));
    }

    // Divider
    commands.push(this.textToBytes('--------------------------------'));
    commands.push(new Uint8Array([FEED_LINE]));

    // Totals
    commands.push(new Uint8Array([ESC, 0x61, 0x02])); // Right alignment
    commands.push(this.textToBytes(`Tạm tính: ${this.formatCurrency(receiptData.subtotal)}`));
    commands.push(new Uint8Array([FEED_LINE]));
    commands.push(this.textToBytes(`Thuế (10%): ${this.formatCurrency(receiptData.tax)}`));
    commands.push(new Uint8Array([FEED_LINE]));
    
    if (receiptData.discount > 0) {
      commands.push(this.textToBytes(`Giảm giá: -${this.formatCurrency(receiptData.discount)}`));
      commands.push(new Uint8Array([FEED_LINE]));
    }

    // Total (bold, double size)
    commands.push(new Uint8Array([ESC, 0x21, 0x30])); // Double height and width
    commands.push(new Uint8Array([ESC, 0x45, BOLD_ON])); // Bold on
    commands.push(this.textToBytes(`TỔNG CỘNG: ${this.formatCurrency(receiptData.total)}`));
    commands.push(new Uint8Array([FEED_LINE]));

    // Payment method
    commands.push(new Uint8Array([ESC, 0x21, NORMAL_SIZE])); // Normal size
    commands.push(new Uint8Array([ESC, 0x45, BOLD_OFF])); // Bold off
    commands.push(new Uint8Array([ESC, 0x61, ALIGN_LEFT])); // Left alignment
    commands.push(this.textToBytes(`Phương thức: ${receiptData.paymentMethod}`));
    commands.push(new Uint8Array([FEED_LINE]));

    // Divider
    commands.push(this.textToBytes('--------------------------------'));
    commands.push(new Uint8Array([FEED_LINE]));

    // Footer
    commands.push(new Uint8Array([ESC, 0x61, ALIGN_CENTER]));
    if (receiptData.receiptFooter) {
      commands.push(this.textToBytes(receiptData.receiptFooter));
      commands.push(new Uint8Array([FEED_LINE]));
    }
    commands.push(this.textToBytes('Cảm ơn quý khách!'));
    commands.push(new Uint8Array([FEED_LINE]));

    // Feed paper and cut
    commands.push(new Uint8Array([FEED_LINE, FEED_LINE, FEED_LINE]));
    commands.push(new Uint8Array([GS, 0x56, CUT_PAPER]));

    return commands;
  }

  private textToBytes(text: string): Uint8Array {
    // Convert text to UTF-8 bytes
    const encoder = new TextEncoder();
    return encoder.encode(text);
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  }
}

// Export singleton instance
export const bluetoothPrinterService = new BluetoothPrinterServiceImpl();

// Fallback implementation for development/testing
export class MockBluetoothPrinterService implements BluetoothPrinterService {
  private connected = false;

  async connect(): Promise<boolean> {
    console.log('Mock: Kết nối Bluetooth...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.connected = true;
    console.log('Mock: Kết nối thành công!');
    return true;
  }

  async disconnect(): Promise<void> {
    console.log('Mock: Ngắt kết nối Bluetooth...');
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async printReceipt(receiptData: ReceiptData): Promise<boolean> {
    console.log('Mock: In hóa đơn...', receiptData);
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Mock: In thành công!');
    return true;
  }

  async getAvailableDevices(): Promise<BluetoothPrinterDevice[]> {
    return [
      { id: 'mock-device-1', name: 'Mock Printer 1', isConnected: false },
      { id: 'mock-device-2', name: 'Mock Printer 2', isConnected: true }
    ];
  }
}

// Export the appropriate service based on environment
export const printerService: BluetoothPrinterService = 
  import.meta.env.DEV ? new MockBluetoothPrinterService() : bluetoothPrinterService;
