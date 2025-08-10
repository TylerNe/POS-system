import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  formatCurrency: (amount: number) => string;
  isLoading: boolean;
}

const defaultCurrency: Currency = {
  code: 'VND',
  symbol: '₫',
  name: 'Vietnamese Dong'
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(defaultCurrency);
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from backend on mount
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const response = await settingsAPI.getCurrency();
        // Ensure the currency object has the required properties
        if (response && response.currency && response.currency.code) {
          setCurrencyState(response.currency);
        } else {
          console.warn('Invalid currency data received, using default');
          setCurrencyState(defaultCurrency);
        }
      } catch (error) {
        console.error('Failed to load currency:', error);
        // Keep default currency if loading fails
        setCurrencyState(defaultCurrency);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrency();
  }, []);

  // Update currency in backend and local state
  const setCurrency = async (newCurrency: Currency) => {
    try {
      await settingsAPI.updateCurrency(newCurrency);
      setCurrencyState(newCurrency);
      toast.success('Currency updated successfully');
    } catch (error) {
      console.error('Failed to update currency:', error);
      toast.error('Failed to update currency');
      throw error;
    }
  };

  // Format currency based on current settings
  const formatCurrency = (amount: number): string => {
    // Safety check to ensure currency object exists and has required properties
    if (!currency || !currency.code || !currency.symbol) {
      // Fallback to default formatting
      return `${amount.toLocaleString('vi-VN')} ₫`;
    }
    
    if (currency.code === 'VND') {
      return `${amount.toLocaleString('vi-VN')} ${currency.symbol}`;
    } else if (currency.code === 'USD') {
      return `${currency.symbol}${amount.toFixed(2)}`;
    } else {
      return `${amount.toFixed(2)} ${currency.symbol}`;
    }
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    formatCurrency,
    isLoading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
