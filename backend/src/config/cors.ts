import cors from 'cors';

// Helper: check if origin is allowed (for dev)
const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true; // Allow requests with no origin (like mobile apps, curl, etc.)

  const allowedOrigins = [
    // Local development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',

    // Known ngrok domains (add more as needed)
    'https://f09306c33707.ngrok-free.app',

    // File protocol for local HTML files
    'file://'
  ];

  // Allow all ngrok-free.app subdomains in dev
  if (origin && origin.match(/^https:\/\/[a-z0-9]+\.ngrok-free\.app$/)) {
    return true;
  }

  // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
  const localNetworkRegexes = [
    /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/
  ];

  if (localNetworkRegexes.some(re => re.test(origin))) {
    return true;
  }

  return allowedOrigins.includes(origin);
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Always allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In production, allow only specific domains
    if (process.env.NODE_ENV === 'production') {
      const productionOrigins = [
        'https://your-frontend-domain.com',
        'https://your-ngrok-domain.ngrok.io'
      ];

      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    }

    // In development, allow ALL origins (including ngrok)
    console.log('Development mode - allowing origin:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
};

export default cors(corsOptions);
