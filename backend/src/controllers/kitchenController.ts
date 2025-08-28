import { Request, Response } from 'express';
import pool from '../config/database';

// Store connected clients for real-time updates
const connectedClients = new Set<Response>();

export const getKitchenOrders = async (req: Request, res: Response) => {
  try {
    // Get orders from the last 24 hours with status
    const result = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.created_at,
        o.customer_name,
        o.customer_phone,
        o.metadata,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= NOW() - INTERVAL '24 hours'
      GROUP BY o.id, o.total, o.created_at, o.customer_name, o.customer_phone, o.metadata
      ORDER BY o.created_at DESC
    `);

    // Transform data for kitchen dashboard
    const kitchenOrders = result.rows.map((row, index) => ({
      orderNumber: index + 1, // Simple numbering for display
      orderId: row.id,
      tableNumber: row.metadata?.table_number || Math.floor(Math.random() * 20) + 1, // Fallback to random
      timePlaced: new Date(row.created_at).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      items: row.items.map((item: any) => ({
        name: item.product_name,
        quantity: item.quantity
      })),
      status: row.metadata?.kitchen_status || 'Pending', // Default status
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      total: parseFloat(row.total)
    }));

    res.json({
      orders: kitchenOrders,
      total: kitchenOrders.length
    });
  } catch (error) {
    console.error('Get kitchen orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update order metadata with kitchen status
    const result = await pool.query(`
      UPDATE orders 
      SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [JSON.stringify({ kitchen_status: status }), orderId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Notify all connected clients about the status change
    const updateData = {
      type: 'status_update',
      orderId,
      status,
      timestamp: new Date().toISOString()
    };

    notifyClients(updateData);

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const subscribeToUpdates = async (req: Request, res: Response) => {
  try {
    console.log('SSE connection request received');
    
    // Check authentication manually for SSE
    const token = req.query.token as string || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      console.log('No token provided for SSE connection');
      return res.status(401).json({ error: 'Access token required' });
    }

    console.log('Token received, verifying...');

    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('Token verified successfully for user:', decoded.userId);
    } catch (jwtError: any) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      console.log('User not found in database:', decoded.userId);
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User authenticated:', userResult.rows[0].username);

    // Set headers for Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control, Authorization',
      'Access-Control-Allow-Credentials': 'true'
    });

    // Send initial connection message
    const connectMessage = {
      type: 'connected',
      message: 'Connected to kitchen updates',
      timestamp: new Date().toISOString()
    };
    
    try {
      res.write(`data: ${JSON.stringify(connectMessage)}\n\n`);
      console.log('Initial connection message sent');
    } catch (writeError) {
      console.error('Error writing initial message:', writeError);
      return;
    }

    // Add client to connected clients set
    connectedClients.add(res);
    console.log(`Client added to connected clients. Total clients: ${connectedClients.size}`);

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      try {
        const heartbeat = {
          type: 'heartbeat',
          timestamp: new Date().toISOString()
        };
        res.write(`data: ${JSON.stringify(heartbeat)}\n\n`);
        console.log('Heartbeat sent');
      } catch (error) {
        console.error('Error sending heartbeat:', error);
        // Client disconnected, remove from set
        connectedClients.delete(res);
        clearInterval(heartbeatInterval);
        console.log('Client removed due to heartbeat error');
      }
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      console.log('Client disconnected (req.on close)');
      connectedClients.delete(res);
      clearInterval(heartbeatInterval);
    });

    req.on('end', () => {
      console.log('Client disconnected (req.on end)');
      connectedClients.delete(res);
      clearInterval(heartbeatInterval);
    });

    // Handle response finish
    res.on('finish', () => {
      console.log('Response finished');
      connectedClients.delete(res);
      clearInterval(heartbeatInterval);
    });

    res.on('close', () => {
      console.log('Response closed');
      connectedClients.delete(res);
      clearInterval(heartbeatInterval);
    });

    console.log('SSE connection established successfully');
  } catch (error) {
    console.error('SSE authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Helper function to notify all connected clients
const notifyClients = (data: any) => {
  const disconnectedClients: Response[] = [];
  
  connectedClients.forEach(client => {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (error) {
      // Mark for removal
      disconnectedClients.push(client);
    }
  });

  // Remove disconnected clients
  disconnectedClients.forEach(client => {
    connectedClients.delete(client);
  });
};

// Function to notify all clients about new orders
export const notifyNewOrder = async (orderId: string) => {
  try {
    // Get the new order details
    const result = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.created_at,
        o.customer_name,
        o.customer_phone,
        o.metadata,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.id = $1
      GROUP BY o.id, o.total, o.created_at, o.customer_name, o.customer_phone, o.metadata
    `, [orderId]);

    if (result.rows.length > 0) {
      const order = result.rows[0];
      const kitchenOrder = {
        type: 'new_order',
        order: {
          orderNumber: Date.now(), // Use timestamp as order number
          orderId: order.id,
          tableNumber: order.metadata?.table_number || Math.floor(Math.random() * 20) + 1,
          timePlaced: new Date(order.created_at).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          }),
          items: order.items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity
          })),
          status: 'Pending',
          customerName: order.customer_name,
          customerPhone: order.customer_phone,
          total: parseFloat(order.total)
        }
      };

      notifyClients(kitchenOrder);
    }
  } catch (error) {
    console.error('Notify new order error:', error);
  }
};
