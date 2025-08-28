import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import corsMiddleware from './config/cors';

// Import routes
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import authRoutes from './routes/auth';
import vietQRRoutes from './routes/vietqr';
import settingsRoutes from './routes/settings';
import kitchenRoutes from './routes/kitchen';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(corsMiddleware);
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files in production
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
if (isProduction) {
  // Try multiple possible paths for frontend build
  const possiblePaths = [
    path.join(__dirname, '../../dist'),           // Local development
    path.join(__dirname, '../dist'),              // Docker container
    path.join(process.cwd(), 'dist'),             // Current working directory
    path.join(process.cwd(), '../dist')           // Parent directory
  ];
  
  let frontendServed = false;
  
  for (const frontendBuildPath of possiblePaths) {
    console.log('📁 Checking frontend path:', frontendBuildPath);
    
    if (fs.existsSync(frontendBuildPath)) {
      app.use(express.static(frontendBuildPath));
      console.log('✅ Frontend static files served from:', frontendBuildPath);
      frontendServed = true;
      break;
    }
  }
  
  if (!frontendServed) {
    console.log('❌ Frontend dist directory not found in any expected location');
    console.log('📂 Current working directory:', process.cwd());
    console.log('📂 __dirname:', __dirname);
    
    // List files in current directory for debugging
    try {
      const files = fs.readdirSync(process.cwd());
      console.log('📂 Files in current directory:', files);
    } catch (error) {
      console.log('❌ Cannot read current directory:', error);
    }
  }
}

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/vietqr', vietQRRoutes);
app.use('/api/kitchen', kitchenRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'POS Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Catch-all handler for frontend routing in production
if (isProduction) {
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ 
        error: 'API route not found',
        path: req.originalUrl
      });
    }
    
    // Try multiple possible paths for index.html
    const possibleIndexPaths = [
      path.join(__dirname, '../../dist/index.html'),  // Local development
      path.join(__dirname, '../dist/index.html'),     // Docker container
      path.join(process.cwd(), 'dist/index.html'),    // Current working directory
      path.join(process.cwd(), '../dist/index.html')  // Parent directory
    ];
    
    let indexServed = false;
    
    for (const indexPath of possibleIndexPaths) {
      console.log('📄 Checking index.html path:', indexPath);
      
      if (fs.existsSync(indexPath)) {
        console.log('📄 Serving index.html for:', req.path);
        res.sendFile(indexPath);
        indexServed = true;
        break;
      }
    }
    
    if (!indexServed) {
      console.log('❌ index.html not found in any expected location');
      res.status(404).json({ 
        error: 'Frontend not found',
        path: req.originalUrl,
        checkedPaths: possibleIndexPaths
      });
    }
  });
} else {
  // 404 handler for development
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Route not found',
      path: req.originalUrl
    });
  });
}

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'File too large' });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal Server Error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
