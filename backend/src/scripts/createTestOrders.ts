import pool from '../config/database';

const createTestOrders = async () => {
  try {
    console.log('Creating test orders for kitchen dashboard...');
    
    // Get a user for creating orders
    const userResult = await pool.query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.log('No users found. Please create a user first.');
      return;
    }
    const userId = userResult.rows[0].id;

    // Get some products
    const productsResult = await pool.query('SELECT id, name, price FROM products LIMIT 5');
    if (productsResult.rows.length === 0) {
      console.log('No products found. Please create some products first.');
      return;
    }
    const products = productsResult.rows;

    // Create test orders
    const testOrders = [
      {
        items: [
          { product_id: products[0].id, quantity: 2 },
          { product_id: products[1].id, quantity: 1 }
        ],
        table_number: 5,
        customer_name: 'John Doe'
      },
      {
        items: [
          { product_id: products[2].id, quantity: 3 },
          { product_id: products[3].id, quantity: 1 }
        ],
        table_number: 12,
        customer_name: 'Jane Smith'
      },
      {
        items: [
          { product_id: products[0].id, quantity: 1 },
          { product_id: products[4].id, quantity: 2 }
        ],
        table_number: 8,
        customer_name: 'Bob Johnson'
      }
    ];

    for (const orderData of testOrders) {
      // Calculate totals
      let subtotal = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          const itemTotal = parseFloat(product.price) * item.quantity;
          subtotal += itemTotal;
          orderItems.push({
            product_id: item.product_id,
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
      `, [subtotal, tax, 0, total, 'cash', userId, orderData.customer_name, JSON.stringify({ table_number: orderData.table_number, kitchen_status: 'Pending' })]);

      const orderId = orderResult.rows[0].id;

      // Create order items
      for (const item of orderItems) {
        await pool.query(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
          VALUES ($1, $2, $3, $4, $5)
        `, [orderId, item.product_id, item.quantity, item.unit_price, item.total_price]);
      }

      console.log(`Created test order ${orderId} for table ${orderData.table_number}`);
    }

    console.log('Test orders created successfully!');
  } catch (error) {
    console.error('Error creating test orders:', error);
  } finally {
    await pool.end();
  }
};

createTestOrders();
