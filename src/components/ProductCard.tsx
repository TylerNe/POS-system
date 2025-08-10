import React from 'react';
import type { Product } from '../types';
import { usePOSStore } from '../store';
import { useCurrency } from '../contexts/CurrencyContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  variant?: 'pos' | 'manage' | 'display';
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'pos',
  onEdit,
  onDelete 
}) => {
  const { addToCart } = usePOSStore();
  const { formatCurrency } = useCurrency();
  const { t } = useLanguage();

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 md:p-3 lg:p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-center h-20 md:h-24 lg:h-32 bg-gray-100 rounded-lg mb-2 md:mb-3">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="h-full w-full object-cover rounded-lg"
          />
        ) : (
          <Package className="h-12 w-12 text-gray-400" />
        )}
      </div>
      
      <div className="space-y-1 md:space-y-2">
        <h3 className="font-semibold text-gray-900 truncate text-xs md:text-sm lg:text-base">{product.name}</h3>
        <p className="text-xs text-gray-500">{product.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm md:text-base lg:text-lg font-bold text-primary-600">
            {formatCurrency(Number(product.price))}
          </span>
          <span className={`text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full ${
            product.stock > 10 
              ? 'bg-green-100 text-green-800'
              : product.stock > 0
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {t('pos.stock')}: {product.stock}
          </span>
        </div>
        
        {variant === 'pos' && (
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center py-1 md:py-1.5 lg:py-2 px-2 md:px-3 lg:px-4 rounded-md text-xs md:text-sm font-medium ${
              product.stock > 0
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('pos.addToCart')}
          </button>
        )}
        
        {variant === 'manage' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(product)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm hover:bg-blue-700"
            >
              {t('common.edit')}
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700"
            >
              {t('common.delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
