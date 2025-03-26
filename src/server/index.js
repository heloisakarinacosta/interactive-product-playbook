
import express from 'express';
import cors from 'cors';
import pkg from 'mysql2';
const { ResultSetHeader } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db.config.js';
import helmet from 'helmet';

// Create pool for database connections
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Query helper function
const query = async (sql, params) => {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};

// Create Express application
const app = express();

// Create router for API endpoints
const router = express.Router();

// Apply Helmet before any route handling
// Use Helmet with custom CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://191.232.33.131:3000", "http://localhost:3000", "https://my.productfruits.com", "https://edge.microsoft.com"],
        imgSrc: ["'self'", "https://my.productfruits.com", "data:"],
        scriptSrc: ["'self'", "https://cdn.gpteng.co", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"]
      }
    },
    // Use boolean values instead of objects for simplicity
    xContentTypeOptions: true,
    xFrameOptions: true,
    xXssProtection: true
  })
);

// Middleware to ensure no other middleware overrides our CSP
app.use((req, res, next) => {
  const originalSetHeader = res.setHeader;
  
  res.setHeader = function(name, value) {
    // Don't let any other middleware set a different Content-Security-Policy
    if (name.toLowerCase() === 'content-security-policy') {
      return this;
    }
    return originalSetHeader.call(this, name, value);
  };
  
  next();
});

// Middleware for router
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// API routes

// Products routes
router.get('/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY updated_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await query(
      'INSERT INTO products (title, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [title, description]
    );
    
    const newProductId = result.insertId;
    
    const newProduct = await query('SELECT * FROM products WHERE id = ?', [newProductId]);
    
    res.status(201).json(Array.isArray(newProduct) ? newProduct[0] : newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    await query(
      'UPDATE products SET title = ?, description = ?, updated_at = NOW() WHERE id = ?',
      [title, description, id]
    );
    
    const updated = await query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(Array.isArray(updated) ? updated[0] : updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Items routes
router.get('/items/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const items = await query(
      'SELECT * FROM items WHERE product_id = ? ORDER BY created_at DESC',
      [productId]
    );
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { title, product_id } = req.body;
    const result = await query(
      'INSERT INTO items (product_id, title, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [product_id, title]
    );
    
    const newItemId = result.insertId;
    
    const newItem = await query('SELECT * FROM items WHERE id = ?', [newItemId]);
    
    res.status(201).json(Array.isArray(newItem) ? newItem[0] : newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Subitems routes
router.get('/subitems/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const subitems = await query(
      'SELECT * FROM subitems WHERE item_id = ? ORDER BY created_at DESC',
      [itemId]
    );
    res.json(subitems);
  } catch (error) {
    console.error('Error fetching subitems:', error);
    res.status(500).json({ error: 'Failed to fetch subitems' });
  }
});

router.post('/subitems', async (req, res) => {
  try {
    const { item_id, title, subtitle, description, last_updated_by } = req.body;
    const result = await query(
      'INSERT INTO subitems (item_id, title, subtitle, description, last_updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [item_id, title, subtitle, description, last_updated_by]
    );
    
    const newSubitemId = result.insertId;
    
    const newSubitem = await query('SELECT * FROM subitems WHERE id = ?', [newSubitemId]);
    
    res.status(201).json(Array.isArray(newSubitem) ? newSubitem[0] : newSubitem);
  } catch (error) {
    console.error('Error creating subitem:', error);
    res.status(500).json({ error: 'Failed to create subitem' });
  }
});

router.put('/subitems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, last_updated_by } = req.body;
    
    await query(
      'UPDATE subitems SET title = ?, subtitle = ?, description = ?, last_updated_by = ?, updated_at = NOW() WHERE id = ?',
      [title, subtitle, description, last_updated_by, id]
    );
    
    const updated = await query('SELECT * FROM subitems WHERE id = ?', [id]);
    res.json(Array.isArray(updated) ? updated[0] : updated);
  } catch (error) {
    console.error('Error updating subitem:', error);
    res.status(500).json({ error: 'Failed to update subitem' });
  }
});

// Use router for /api routes
app.use('/api', router);

// If in production, serve static files
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '../../../dist');
  
  // Serve static files with consistent CSP
  app.use(express.static(distPath));
  
  // Handle SPA routing - serve index.html for any unmatched routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the Express app for production use
export default app;
