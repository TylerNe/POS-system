import React, { useState, useEffect } from 'react';
import { Clock, Utensils, CheckCircle, AlertCircle, PlayCircle, Wifi, WifiOff } from 'lucide-react';
import { kitchenAPI } from '../services/api';

interface OrderItem {
  name: string;
  quantity: number;
}

interface Order {
  orderNumber: number;
  orderId: string;
  tableNumber: number;
  timePlaced: string;
  items: OrderItem[];
  status: 'Pending' | 'In Progress' | 'Done';
  customerName?: string;
  customerPhone?: string;
  total: number;
}

const KitchenDashboard: React.FC = () => {
  console.log('KitchenDashboard component rendered');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadingOrders, setFadingOrders] = useState<Set<string>>(new Set());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load initial orders
  useEffect(() => {
    loadOrders();
  }, []);

  // Real-time updates via Server-Sent Events
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setConnectionError('No authentication token found');
      setIsLoading(false);
      return;
    }

    let eventSource: EventSource | null = null;
    let reconnectTimeout: number | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const connectSSE = () => {
      try {
        console.log('Attempting to connect to SSE...');
        
        // Close existing connection if any
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }

        // Create EventSource with authentication
        eventSource = new EventSource(`/api/kitchen/updates?token=${token}`);

        eventSource.onopen = () => {
          console.log('SSE connection opened successfully');
          setIsConnected(true);
          setConnectionError(null);
          reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('SSE message received:', data);
            
            switch (data.type) {
              case 'connected':
                console.log('Kitchen dashboard connected:', data.message);
                break;
              
              case 'heartbeat':
                console.log('Heartbeat received:', data.timestamp);
                break;
              
              case 'new_order':
                console.log('New order received:', data.order);
                setOrders(prev => [data.order, ...prev]);
                break;
              
              case 'status_update':
                console.log('Status update received:', data);
                setOrders(prev => prev.map(order => 
                  order.orderId === data.orderId 
                    ? { ...order, status: data.status }
                    : order
                ));
                
                // If status is 'Done', show completed state briefly then it will be filtered out by activeOrders
                if (data.status === 'Done') {
                  // Start fade-out after 1 second to show completed state
                  setTimeout(() => {
                    setFadingOrders(prev => new Set(prev).add(data.orderId));
                  }, 1000);
                }
                break;
              
              default:
                console.log('Unknown event type:', data.type);
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        eventSource.onerror = (error) => {
          console.error('SSE connection error:', error);
          console.error('EventSource readyState:', eventSource?.readyState);
          
          setIsConnected(false);
          setConnectionError('Connection lost. Trying to reconnect...');
          
          // Close current connection
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          // Try to reconnect with exponential backoff
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000); // Max 10 seconds
            
            console.log(`Reconnect attempt ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
            
            if (reconnectTimeout) {
              clearTimeout(reconnectTimeout);
            }
            reconnectTimeout = setTimeout(() => {
              connectSSE();
            }, delay);
          } else {
            setConnectionError('Failed to reconnect after multiple attempts. Please refresh the page.');
            console.error('Max reconnect attempts reached');
          }
        };
      } catch (error) {
        console.error('Error creating EventSource:', error);
        setIsConnected(false);
        setConnectionError('Failed to establish connection');
      }
    };

    connectSSE();

    return () => {
      console.log('Cleaning up SSE connection...');
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      setIsConnected(false);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const response = await kitchenAPI.getOrders();
      setOrders(response.orders);
      setIsConnected(true);
      setConnectionError(null);
      console.log('Orders loaded successfully:', response.orders.length);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setConnectionError('Failed to load orders. Please check your connection.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const changeOrderStatus = async (orderId: string) => {
    try {
      const currentOrder = orders.find(o => o.orderId === orderId);
      if (!currentOrder) return;

      const statusSequence: ('Pending' | 'In Progress' | 'Done')[] = ['Pending', 'In Progress', 'Done'];
      const currentIndex = statusSequence.indexOf(currentOrder.status);
      const nextIndex = (currentIndex + 1) % statusSequence.length;
      const newStatus = statusSequence[nextIndex];

      // Update locally first for immediate feedback
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus }
          : order
      ));

      // Send update to server
      await kitchenAPI.updateOrderStatus(orderId, newStatus);

      // If status is now 'Done', show completed state briefly then it will be filtered out by activeOrders
      if (newStatus === 'Done') {
        // Start fade-out after 1 second to show completed state
        setTimeout(() => {
          setFadingOrders(prev => new Set(prev).add(orderId));
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      // Revert local change on error
      loadOrders();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Done':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <AlertCircle className="w-6 h-6" />;
      case 'In Progress':
        return <PlayCircle className="w-6 h-6" />;
      case 'Done':
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <AlertCircle className="w-6 h-6" />;
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'text-yellow-800';
      case 'In Progress':
        return 'text-blue-800';
      case 'Done':
        return 'text-green-800';
      default:
        return 'text-gray-800';
    }
  };

  // Filter out completed orders and sort by time placed (newest first)
  const activeOrders = orders.filter(order => order.status !== 'Done');
  const sortedOrders = [...activeOrders].sort((a, b) => {
    const timeA = new Date(`2000-01-01 ${a.timePlaced}`);
    const timeB = new Date(`2000-01-01 ${b.timePlaced}`);
    return timeB.getTime() - timeA.getTime();
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Utensils className="w-12 h-12 text-orange-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Thai Kitchen Dashboard</h1>
              <p className="text-lg text-gray-600">Order Management System</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-6 h-6 text-green-500" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-500" />
              )}
              <span className={`text-lg font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            
            {/* Time */}
            <div className="text-right">
              <div className="flex items-center space-x-2 text-2xl font-semibold text-gray-700">
                <Clock className="w-8 h-8" />
                <span>{currentTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit', 
                  second: '2-digit',
                  hour12: true 
                })}</span>
              </div>
              <p className="text-lg text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
        
        {/* Connection Error */}
        {connectionError && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
            <span>{connectionError}</span>
            <button 
              onClick={loadOrders}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading orders...</p>
        </div>
      )}

      {/* Orders Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {sortedOrders.map((order) => (
            <div
              key={order.orderId}
              className={`bg-white rounded-lg shadow-lg p-6 border-l-8 transition-all duration-300 hover:shadow-xl ${
                order.status === 'Pending' ? 'border-l-yellow-500' :
                order.status === 'In Progress' ? 'border-l-blue-500' :
                'border-l-green-500'
              } ${fadingOrders.has(order.orderId) ? 'opacity-30 scale-95' : 'opacity-100 scale-100'}`}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">#{order.orderNumber}</h2>
                  <p className="text-xl text-gray-600">Table {order.tableNumber}</p>
                  {order.customerName && (
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  )}
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className={`font-semibold text-white ${getStatusTextColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="mb-4">
                <p className="text-lg text-gray-700 font-medium">
                  Placed: {order.timePlaced}
                </p>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Items:</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-lg font-medium text-gray-700">{item.name}</span>
                      <span className="text-xl font-bold text-orange-600">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mb-4">
                <p className="text-lg font-bold text-gray-800">
                  Total: ${order.total.toFixed(2)}
                </p>
              </div>

              {/* Status Change Button */}
              <button
                onClick={() => changeOrderStatus(order.orderId)}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  order.status === 'Pending' 
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                  order.status === 'In Progress'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                    'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {order.status === 'Pending' ? 'Start Cooking' :
                 order.status === 'In Progress' ? 'Mark as Done' :
                 'Completed ✓'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && activeOrders.length === 0 && !connectionError && (
        <div className="text-center py-12">
          <Utensils className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Orders will appear here when customers place them.</p>
          <button 
            onClick={loadOrders}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Refresh Orders
          </button>
        </div>
      )}

      {/* Footer */}
      {!isLoading && (
        <div className="mt-8 text-center">
          <p className="text-lg text-gray-600">
            Active Orders: {activeOrders.length} | 
            Pending: {activeOrders.filter(o => o.status === 'Pending').length} | 
            In Progress: {activeOrders.filter(o => o.status === 'In Progress').length}
          </p>
        </div>
      )}
    </div>
  );
};

export default KitchenDashboard;
