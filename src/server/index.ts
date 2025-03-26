import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { query, initDatabase } from '../utils/dbUtils';
import { ResultSetHeader } from 'mysql2';
import path from 'path';
import helmet from 'helmet';
import http from 'http';

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

// Monkey patch the http.ServerResponse prototype to intercept all setHeader calls
// This ensures our CSP is never overridden
const originalSetHeader = http.ServerResponse.prototype.setHeader;

http.ServerResponse.prototype.setHeader = function(name, value) {
  // Only intercept Content-Security-Policy headers
  if (name.toLowerCase() === 'content-security-policy') {
    if (typeof value === 'string' && value.includes("default-src 'none'")) {
      // Replace any restrictive CSP with our custom one
      const cspString = Object.entries(cspDirectives)
        .map(([key, values]) => {
          const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          return `${kebabKey} ${values.join(' ')}`;
        })
        .join('; ');
      
      return originalSetHeader.call(this, name, cspString);
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
  const cspString = Object.entries(cspDirectives)
    .map(([key, values]) => {
      const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey} ${values.join(' ')}`;
    })
    .join('; ');
  
  res.setHeader('Content-Security-Policy', cspString);
  
  // Monkey patch res.setHeader for this request
  const originalResSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'content-security-policy') {
      if (typeof value === 'string' && value.includes("default-src 'none'")) {
        return originalResSetHeader.call(this, name, cspString);
      }
    }
    return originalResSetHeader.call(this, name, value);
  };
  
  // Monkey patch res.send to ensure CSP is set before sending
  const originalSend = res.send;
  res.send = function(body) {
    // Ensure our CSP is set
    if (!res.getHeader('Content-Security-Policy') || 
        (typeof res.getHeader('Content-Security-Policy') === 'string' && 
         res.getHeader('Content-Security-Policy').includes("default-src 'none'"))) {
      res.setHeader('Content-Security-Policy', cspString);
    }
    return originalSend.call(this, body);
  };
  
  next();
});

// Create router for API endpoints
const router = express.Router();

// Middleware for router
router.use(cors());
router.use(json());
router.use(urlencoded({ extended: true }));

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
    
    // Corrigido: verificamos explicitamente o tipo como ResultSetHeader para acessar insertId
    const resultHeader = result as ResultSetHeader;
    const newProductId = resultHeader.insertId;
    
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
    
    // Corrigido: verificamos explicitamente o tipo como ResultSetHeader para acessar insertId
    const resultHeader = result as ResultSetHeader;
    const newItemId = resultHeader.insertId;
    
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
    
    // Corrigido: verificamos explicitamente o tipo como ResultSetHeader para acessar insertId
    const resultHeader = result as ResultSetHeader;
    const newSubitemId = resultHeader.insertId;
    
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
  const distPath = path.join(__dirname, '../../dist');
  
  // Custom middleware to preserve CSP when serving static files
  const serveStaticWithCsp = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Ensure our CSP header is set
    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => {
        const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return `${kebabKey} ${values.join(' ')}`;
      })
      .join('; ');
    
    res.setHeader('Content-Security-Policy', cspString);
    
    next();
  };
  
  // Apply our middleware before serving static files
  app.use(serveStaticWithCsp);
  
  // Serve static files
  app.use(express.static(distPath, {
    setHeaders: (res) => {
      // Set CSP header for each static file
      const cspString = Object.entries(cspDirectives)
        .map(([key, values]) => {
          const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          return `${kebabKey} ${values.join(' ')}`;
        })
        .join('; ');
      
      res.setHeader('Content-Security-Policy', cspString);
    }
  }));
  
  // Handle SPA routing - serve index.html for any unmatched routes
  app.get('*', (req, res) => {
    // Set CSP header before sending index.html
    const cspString = Object.entries(cspDirectives)
      .map(([key, values]) => {
        const kebabKey = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
        return `${kebabKey} ${values.join(' ')}`;
      })
      .join('; ');
    
    res.setHeader('Content-Security-Policy', cspString);
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize database and start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  
  // Initialize database
  initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
      
      // Start the server
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access at: http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Failed to initialize database:', error);
      process.exit(1);
    });
}

// Export the Express app for production use
export default app;
