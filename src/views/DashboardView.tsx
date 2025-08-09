import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Calendar,
  Trophy,
  Package
} from 'lucide-react';
import { analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DailySale {
  date: string;
  orders_count: number;
  revenue: number;
  avg_order_value: number;
  cash_revenue: number;
  card_revenue: number;
  digital_revenue: number;
}

interface MonthlySale {
  month: string;
  year: number;
  month_num: number;
  orders_count: number;
  revenue: number;
  avg_order_value: number;
  cash_revenue: number;
  card_revenue: number;
  digital_revenue: number;
}

interface YearlySale {
  year: number;
  orders_count: number;
  revenue: number;
  avg_order_value: number;
  cash_revenue: number;
  card_revenue: number;
  digital_revenue: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  total_sold: number;
  total_revenue: number;
  orders_count: number;
}

const DashboardView: React.FC = () => {
  const [dailySales, setDailySales] = useState<DailySale[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [yearlySales, setYearlySales] = useState<YearlySale[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly' | 'yearly'>('daily');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dailyData, monthlyData, yearlyData, topProductsData] = await Promise.all([
        analyticsAPI.getDailySales({ days: 30 }),
        analyticsAPI.getMonthlySales({ months: 12 }),
        analyticsAPI.getYearlySales(),
        analyticsAPI.getTopProducts({ limit: 10, period: 'month' })
      ]);

      setDailySales(dailyData.daily_sales || []);
      setMonthlySales(monthlyData.monthly_sales || []);
      setYearlySales(yearlyData.yearly_sales || []);
      setTopProducts(topProductsData.top_products || []);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'daily':
        return dailySales;
      case 'monthly':
        return monthlySales;
      case 'yearly':
        return yearlySales;
      default:
        return dailySales;
    }
  };

  const getTotalStats = () => {
    const data = getCurrentData();
    if (!data.length) return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
    const totalOrders = data.reduce((sum, item) => sum + item.orders_count, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, avgOrderValue };
  };

  const { totalRevenue, totalOrders, avgOrderValue } = getTotalStats();

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Sales analytics and business insights
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Sales analytics and business insights
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Orders
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalOrders.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Order Value
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${avgOrderValue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Top Products
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {topProducts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Period Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['daily', 'monthly', 'yearly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2 inline" />
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Sales
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Data Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <BarChart3 className="h-5 w-5 mr-2 inline" />
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Sales Data
            </h3>
            <div className="overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Orders
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentData().slice(0, 10).map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {activeTab === 'daily' && new Date((item as DailySale).date || '').toLocaleDateString()}
                          {activeTab === 'monthly' && `${(item as MonthlySale).year}-${String((item as MonthlySale).month_num).padStart(2, '0')}`}
                          {activeTab === 'yearly' && (item as YearlySale).year}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {item.orders_count}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          ${item.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              <Trophy className="h-5 w-5 mr-2 inline" />
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.total_sold} sold</p>
                    <p className="text-sm text-gray-500">${product.total_revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Payment Methods Breakdown
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {getCurrentData().length > 0 && (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${getCurrentData().reduce((sum, item) => sum + item.cash_revenue, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Cash Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ${getCurrentData().reduce((sum, item) => sum + item.card_revenue, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Card Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ${getCurrentData().reduce((sum, item) => sum + item.digital_revenue, 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">Digital Payments</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
