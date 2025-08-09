import { type FC } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { usePOSStore } from './store';
import Layout from './components/Layout';
import Login from './components/Login';
import ErrorBoundary from './components/ErrorBoundary';
import POSView from './views/POSView';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import OrdersView from './views/OrdersView';
import SettingsView from './views/SettingsView';

const AppContent: FC = () => {
  const { user, loading } = useAuth();
  const { currentView } = usePOSStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderCurrentView = () => {
    // Restrict cashier access to only POS and Orders
    if (user?.role === 'cashier' && (currentView === 'products' || currentView === 'settings' || currentView === 'dashboard')) {
      return <POSView />;
    }

    switch (currentView) {
      case 'pos':
        return <POSView />;
      case 'dashboard':
        return user?.role === 'admin' ? <DashboardView /> : <POSView />;
      case 'products':
        return user?.role === 'admin' ? <ProductsView /> : <POSView />;
      case 'orders':
        return <OrdersView />;
      case 'settings':
        return user?.role === 'admin' ? <SettingsView /> : <POSView />;
      default:
        return <POSView />;
    }
  };

  return (
    <ErrorBoundary>
      <Layout>
        {renderCurrentView()}
      </Layout>
    </ErrorBoundary>
  );
};

const App: FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;