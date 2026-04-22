// API configuration for Next.js + Supabase + Vercel
// API routes are served at /api/* on the same origin in both dev and prod

export const getApiConfig = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return '/api';
};

export const API_BASE_URL = getApiConfig();

