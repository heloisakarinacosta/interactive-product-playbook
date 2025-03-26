
import express from 'express';
import cors from 'cors';
import pkg from 'mysql2';
const { ResultSetHeader } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db.config.js';
import helmet from 'helmet';
import expressStaticGzip from 'express-static-gzip';
import fs from 'fs';

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

// Define our CSP directives - expanded to ensure all productfruits domains are covered
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "https://cdn.gpteng.co", "'unsafe-inline'", "'unsafe-eval'", "https://my.productfruits.com"],
  connectSrc: [
    "'self'", 
    "http://191.232.33.131:3000", 
    "http://localhost:3000", 
    "https://my.productfruits.com",
    "wss://my.productfruits.com",
    "https://edge.microsoft.com"
  ],
  imgSrc: ["'self'", "https://my.productfruits.com", "data:"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://my.productfruits.com"],
  fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://my.productfruits.com"],
  frameSrc: ["'self'", "https://my.productfruits.com"],
  objectSrc: ["'self'"],
  mediaSrc: ["'self'"]
};

// Convert CSP object to string format
const generateCspString = () => {
  return Object.entries(cspDirectives)
    .map(([key, values]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey} ${values.join(' ')}`;
    })
    .join('; ');
};

// Monkey patch the http.ServerResponse prototype to intercept all setHeader calls
// This ensures our CSP is never overridden
const http = require('http');
const originalSetHeader = http.ServerResponse.prototype.setHeader;

http.ServerResponse.prototype.setHeader = function(name, value) {
  // Only intercept Content-Security-Policy headers
  if (name.toLowerCase() === 'content-security-policy') {
    if (typeof value === 'string' && value.includes("default-src 'none'")) {
      // Replace any restrictive CSP with our custom one
      return originalSetHeader.call(this, name, generateCspString());
    }
  }
  
  return originalSetHeader.call(this, name, value);
};

// Apply Helmet with custom CSP configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives
    },
    xContentTypeOptions: true,
    xFrameOptions: false, // Allowing iframe for productfruits
    xXssProtection: true
  })
);

// Remove any other middleware that might override CSP
app.use((req, res, next) => {
  // Force our CSP to be set
  res.setHeader('Content-Security-Policy', generateCspString());
  
  // Monkey patch res.setHeader for this request
  const originalResSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'content-security-policy') {
      if (typeof value === 'string' && value.includes("default-src 'none'")) {
        return originalResSetHeader.call(this, name, generateCspString());
      }
    }
    return originalResSetHeader.call(this, name, value);
  };
  
  // Monkey patch res.send to ensure CSP is set before sending
  const originalSend = res.send;
  res.send = function(body) {
    // Ensure our CSP is set
    const currentCsp = res.getHeader('Content-Security-Policy');
    if (!currentCsp || 
        (typeof currentCsp === 'string' && currentCsp.includes("default-src 'none'"))) {
      res.setHeader('Content-Security-Policy', generateCspString());
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Create router for API endpoints
const router = express.Router();

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
  // Two directories up from server/index.js to reach project root, then to dist
  const distPath = path.join(__dirname, '../../dist');
  
  console.log('Server index.js serving static files from:', distPath);
  
  // Check if the dist directory exists
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory found in server/index.js');
    
    // List files in the dist directory for debugging
    try {
      const files = fs.readdirSync(distPath);
      console.log('Files in dist directory (server/index.js):', files);
    } catch (error) {
      console.error('Error reading dist directory:', error);
    }
  } else {
    console.error('❌ Dist directory not found at', distPath);
  }
  
  // Set dist path as a static directory with express.static as fallback
  app.use(express.static(distPath));
  
  // Use express-static-gzip for serving compressed static files
  app.use(expressStaticGzip(distPath, {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    index: false // Disable default index behavior
  }));
  
  // Apply CSP headers after the static middleware
  app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', generateCspString());
    next();
  });
  
  // Handle SPA routing - serve index.html for any unmatched routes
  app.get('*', (req, res) => {
    console.log('Handling route in server/index.js:', req.path);
    // Set CSP header before sending index.html
    res.setHeader('Content-Security-Policy', generateCspString());
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Export the Express app for production use
export default app;
