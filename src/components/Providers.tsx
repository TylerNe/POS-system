'use client';

import { AuthProvider } from '@/src/contexts/AuthContext';
import { CurrencyProvider } from '@/src/contexts/CurrencyContext';
import { LanguageProvider } from '@/src/contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CurrencyProvider>
          {children}
        </CurrencyProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
