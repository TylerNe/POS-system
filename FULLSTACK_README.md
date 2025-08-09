# 🏪 POS System - Full Stack Application

A complete Point of Sale system with React TypeScript frontend and Node.js backend with PostgreSQL database.

## 🚀 Features

### Frontend (React + TypeScript)
- ⚡ **Modern UI** with Tailwind CSS
- 🔐 **Authentication** with JWT tokens
- 📱 **Responsive Design** for desktop and mobile
- 🛒 **Real-time Cart Management**
- 💰 **Advanced Checkout** with multiple payment methods
- 💸 **Smart Discount System** with percentage buttons
- 📊 **Product Management** with image upload
- 📋 **Order History** and detailed receipts
- ⚙️ **Settings Panel** for configuration

### Backend (Node.js + Express + PostgreSQL)
- 🏗️ **RESTful API** with TypeScript
- 🔒 **JWT Authentication** with role-based authorization
- 🗃️ **PostgreSQL Database** with connection pooling
- 📊 **Comprehensive Order Management**
- 🛡️ **Security Features** (Helmet, CORS, bcrypt)
- 📝 **Request Logging** with Morgan
- 🔄 **Transaction Support** for order processing
- 📈 **Order Statistics** and analytics

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for API calls
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **PostgreSQL** with pg driver
- **JWT** for authentication
- **bcrypt** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for request logging

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🚀 Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd POS-system
\`\`\`

### 2. Backend Setup

\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Update .env with your database credentials
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=pos_system
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_jwt_secret

# Create PostgreSQL database
createdb pos_system

# Initialize database schema and sample data
npm run init-db

# Start backend server
npm run dev
\`\`\`

Backend will be running on `http://localhost:5000`

### 3. Frontend Setup

\`\`\`bash
# Navigate to frontend directory (from root)
cd ../

# Install dependencies
npm install

# Create environment file (optional)
cp env.example .env
# VITE_API_URL=http://localhost:5000/api

# Start frontend development server
npm run dev
\`\`\`

Frontend will be running on `http://localhost:5173`

## 👤 Default Users

After running `npm run init-db` in backend, you'll have these users:

| Username | Password | Role | Email |
|----------|----------|------|--------|
| admin | admin123 | admin | admin@pos.com |
| cashier1 | cashier123 | cashier | cashier1@pos.com |

## 🎯 Usage

### 1. Login
- Visit `http://localhost:5173`
- Use one of the default accounts or click Quick Login buttons
- Admin has full access, Cashier can manage products and create orders

### 2. POS Operations
- **Add Products to Cart:** Browse products and click "Add to Cart"
- **Manage Cart:** Adjust quantities, remove items
- **Checkout:** Choose payment method (cash/card/digital)
- **Apply Discounts:** Use percentage buttons (5%, 10%, 15%, 20%, 25%, 30%, 50%)
- **Cash Payments:** Select bill denominations ($100, $50, $20, $10, $5)

### 3. Product Management
- **Add Products:** Click "Add Product" with name, price, category, stock
- **Upload Images:** Upload from computer or enter image URL
- **Edit/Delete:** Manage existing products (Admin/Cashier access)

### 4. Order Management
- **View Orders:** See all completed transactions
- **Order Details:** View items, totals, payment method, timestamp
- **Search Orders:** Filter by date range or search terms

## 🗄️ Database Schema

### Users
- User authentication and role management
- Fields: id, username, email, password, role, timestamps

### Products
- Product catalog with inventory tracking
- Fields: id, name, price, category, stock, image, barcode, timestamps

### Orders
- Complete order information
- Fields: id, totals, payment_method, user_id, customer_info, timestamps

### Order Items
- Detailed order line items
- Fields: id, order_id, product_id, quantity, prices, timestamp

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories` - Get categories

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/stats` - Order statistics

### Health Check
- `GET /api/health` - API status

## 🔒 Security Features

- **JWT Authentication** with token expiration
- **Password Hashing** with bcrypt
- **Role-based Authorization** (Admin/Cashier)
- **CORS Protection** for cross-origin requests
- **Security Headers** with Helmet
- **Input Validation** and sanitization
- **SQL Injection Protection** with parameterized queries

## 🏗️ Project Structure

\`\`\`
POS-system/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── config/         # Database & configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & validation
│   │   ├── models/         # TypeScript types
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database scripts
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── README.md
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   ├── store/             # Zustand store
│   ├── types/             # TypeScript types
│   ├── views/             # Main pages
│   └── App.tsx            # App entry point
├── package.json
└── README.md
\`\`\`

## 🚦 Development

### Backend Development
\`\`\`bash
cd backend
npm run dev    # Start with nodemon
npm run build  # Build TypeScript
npm start      # Run production build
\`\`\`

### Frontend Development
\`\`\`bash
npm run dev    # Start Vite dev server
npm run build  # Build for production
npm run preview # Preview production build
\`\`\`

## 🐳 Production Deployment

### Backend
1. Set environment variables for production
2. Use PM2 or similar for process management
3. Set up reverse proxy (nginx)
4. Configure SSL certificates

### Frontend
1. Build for production: `npm run build`
2. Serve `dist/` folder with nginx or similar
3. Configure API_URL for production backend

### Database
1. Use managed PostgreSQL service
2. Set up connection pooling
3. Configure backup strategy
4. Monitor performance

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
\`\`\`env
PORT=5000
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_system
DB_USER=postgres
DB_PASSWORD=secure_password
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
\`\`\`

**Frontend (.env):**
\`\`\`env
VITE_API_URL=http://localhost:5000/api
\`\`\`

## 🎨 Key Features Showcase

### 💰 Advanced Checkout System
- Multiple payment methods (Cash, Card, Digital)
- Bill denomination selection for cash payments
- Real-time change calculation
- Discount system with percentage buttons
- Customer information capture

### 📊 Smart Product Management
- Image upload from computer
- Real-time stock tracking
- Category management
- Barcode support
- Bulk operations

### 📈 Comprehensive Reporting
- Order statistics and analytics
- Date range filtering
- Payment method breakdown
- Revenue tracking
- Export capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎉 What's Next?

- 📱 Mobile app with React Native
- 🖨️ Receipt printer integration
- 📊 Advanced analytics dashboard
- 🔄 Real-time sync across devices
- 📦 Inventory management system
- 💳 Payment gateway integration
- 🌐 Multi-store support

---

**Built with ❤️ for modern retail businesses**
