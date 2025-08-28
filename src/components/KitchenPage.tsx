import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import KitchenDashboard from './KitchenDashboard';


const KitchenPage: React.FC = () => {
  const { user, loading } = useAuth();

  // Debug logging
  console.log('KitchenPage rendered:', { user, loading });

  if (loading) {
    console.log('KitchenPage: Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-center">Loading Kitchen Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('KitchenPage: No user, showing access denied');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to access the Kitchen Dashboard.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has permission to access kitchen
  if (user.role !== 'admin' && user.role !== 'cashier') {
    console.log('KitchenPage: User role not allowed:', user.role);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">You don't have permission to access the Kitchen Dashboard.</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('KitchenPage: Rendering KitchenDashboard for user:', user);
  
  // Use the real KitchenDashboard
  return <KitchenDashboard />;
};

export default KitchenPage;
