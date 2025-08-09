# POS System

A modern Point of Sale (POS) system built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Management**: Add, edit, and delete products with categories and stock tracking
- **Shopping Cart**: Add products to cart, modify quantities, and manage cart items
- **Checkout Process**: Support for multiple payment methods (cash, card, digital)
- **Order Management**: View order history and detailed order information
- **Receipt Generation**: Generate and print receipts for completed orders
- **Settings**: Configure store information, tax rates, and receipt settings
- **Responsive Design**: Modern UI that works on desktop and mobile devices

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pos-system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── Layout.tsx
│   ├── ProductCard.tsx
│   ├── Cart.tsx
│   └── Checkout.tsx
├── views/             # Main application views
│   ├── POSView.tsx
│   ├── ProductsView.tsx
│   ├── OrdersView.tsx
│   └── SettingsView.tsx
├── store/             # State management
│   └── index.ts
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Usage

### POS Operation
1. Navigate to the POS view to start making sales
2. Search and filter products by category
3. Add products to cart by clicking "Add to Cart"
4. Adjust quantities in the cart as needed
5. Proceed to checkout and select payment method
6. Complete the sale to generate a receipt

### Product Management
1. Go to the Products view to manage inventory
2. Add new products with details like name, price, category, and stock
3. Edit existing products to update information
4. Delete products that are no longer available

### Order History
1. View all completed orders in the Orders view
2. Search orders by ID or payment method
3. View detailed order information including items and totals

### Settings
1. Configure store information and contact details
2. Set tax rates and receipt preferences
3. Manage user settings and access controls

## License

This project is licensed under the MIT License - see the LICENSE file for details.