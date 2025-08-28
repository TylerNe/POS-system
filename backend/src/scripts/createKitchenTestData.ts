import pool from '../config/database';

const createKitchenTestData = async () => {
  try {
    console.log('Creating kitchen test data...');
    
    // Create test products if they don't exist
    const products = [
      { name: 'Coffee', price: 5.50, category: 'Beverages' },
      { name: 'Burger', price: 12.00, category: 'Main Course' },
      { name: 'Pizza Slice', price: 8.50, category: 'Main Course' },
      { name: 'Energy Drink', price: 3.00, category: 'Beverages' },
      { name: 'Sandwich', price: 7.50, category: 'Main Course' },
      { name: 'Chips', price: 2.50, category: 'Snacks' },
      { name: 'Pho Dac Biet', price: 15.00, category: 'Main Course' },
      { name: 'Nuts', price: 3.00, category: 'Snacks' }
    ];

    for (const product of products) {
      const existingProduct = await pool.query(
        'SELECT id FROM products WHERE name = $1',
        [product.name]
      );

      if (existingProduct.rows.length === 0) {
        await pool.query(
          'INSERT INTO products (name, price, category, description) VALUES ($1, $2, $3, $4)',
          [product.name, product.price, product.category, `${product.name} - Delicious ${product.category.toLowerCase()}`]
        );
        console.log(`Created product: ${product.name}`);
      }
    }

    // Get or create a user
    let userResult = await pool.query('SELECT id FROM users LIMIT 1');
    let userId: string;

    if (userResult.rows.length === 0) {
      const newUser = await pool.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id',
        ['admin', 'admin@example.com', '$2b$10$dummy.hash.for.testing', 'admin']
      );
      userId = newUser.rows[0].id;
      console.log('Created test user');
    } else {
      userId = userResult.rows[0].id;
    }

    // Get products for creating orders
    const productsResult = await pool.query('SELECT id, name, price FROM products');
    const availableProducts = productsResult.rows;

    if (availableProducts.length === 0) {
      console.log('No products available. Cannot create orders.');
      return;
    }

    // Create test orders
    const testOrders = [
      {
        items: [
          { product_name: 'Coffee', quantity: 1 },
          { product_name: 'Nuts', quantity: 2 }
        ],
        table_number: 8,
        customer_name: 'Bob Johnson',
        status: 'Pending'
      },
      {
        items: [
          { product_name: 'Energy Drink', quantity: 3 },
          { product_name: 'Pizza Slice', quantity: 1 }
        ],
        table_number: 12,
        customer_name: 'Jane Smith',
        status: 'Pending'
      },
      {
        items: [
          { product_name: 'Coffee', quantity: 2 },
          { product_name: 'Sandwich', quantity: 1 }
        ],
        table_number: 5,
        customer_name: 'John Doe',
        status: 'Pending'
      },
      {
        items: [
          { product_name: 'Chips', quantity: 1 },
          { product_name: 'Pho Dac Biet', quantity: 1 }
        ],
        table_number: 2,
        customer_name: 'Alice Brown',
        status: 'Done'
      },
      {
        items: [
          { product_name: 'Burger', quantity: 1 }
        ],
        table_number: 20,
        customer_name: 'Charlie Wilson',
        status: 'Done'
      },
      {
        items: [
          { product_name: 'Coffee', quantity: 1 },
          { product_name: 'Nuts', quantity: 1 }
        ],
        table_number: 13,
        customer_name: 'Diana Davis',
        status: 'Done'
      },
      {
        items: [
          { product_name: 'Energy Drink', quantity: 2 }
        ],
        table_number: 9,
        customer_name: 'Eve Miller',
        status: 'Pending'
      }
    ];

    for (const orderData of testOrders) {
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = availableProducts.find(p => p.name === item.product_name);
        if (product) {
          const itemTotal = parseFloat(product.price) * item.quantity;
          subtotal += itemTotal;
          orderItems.push({
            product_id: product.id,
            quantity: item.quantity,
            unit_price: parseFloat(product.price),
            total_price: itemTotal
          });
        }
      }

      const tax = subtotal * 0.1;
      const total = subtotal + tax;

      // Create order
      const orderResult = await pool.query(`
        INSERT INTO orders (subtotal, tax, discount, total, payment_method, user_id, customer_name, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        subtotal, 
        tax, 
        0, 
        total, 
        'cash', 
        userId, 
        orderData.customer_name, 
        JSON.stringify({ 
          table_number: orderData.table_number, 
          kitchen_status: orderData.status 
        })
      ]);

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of orderItems) {
        await pool.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `, [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]);
      }

      console.log(`Created test order ${orderId} for table ${orderData.table_number} (${orderData.status})`);
    }

    console.log('Kitchen test data created successfully!');
    console.log(`Created ${testOrders.length} test orders`);
  } catch (error) {
    console.error('Error creating kitchen test data:', error);
  } finally {
    await pool.end();
  }
};

createKitchenTestData();
