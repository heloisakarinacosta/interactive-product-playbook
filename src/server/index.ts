
import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { query, initDatabase } from '../utils/dbUtils';
import path from 'path';
import helmet from 'helmet';
import fs from 'fs';

// Create Express application
const app = express();

// Definir CSP directives
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
  objectSrc: ["'none'"],
  mediaSrc: ["'self'"]
};

// Usar Helmet com CSP configurado
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: cspDirectives,
      useDefaults: false
    }
  })
);

// Middleware básico
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Criar router para API
const router = express.Router();

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
      'INSERT INTO products (title, description) VALUES (?, ?)',
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

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    await query(
      'UPDATE products SET title = ?, description = ? WHERE id = ?',
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
      'INSERT INTO items (product_id, title) VALUES (?, ?)',
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
      'INSERT INTO subitems (item_id, title, subtitle, description, last_updated_by) VALUES (?, ?, ?, ?, ?)',
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
      'UPDATE subitems SET title = ?, subtitle = ?, description = ?, last_updated_by = ? WHERE id = ?',
      [title, subtitle, description, last_updated_by, id]
    );
    
    const updated = await query('SELECT * FROM subitems WHERE id = ?', [id]);
    res.json(Array.isArray(updated) ? updated[0] : updated);
  } catch (error) {
    console.error('Error updating subitem:', error);
    res.status(500).json({ error: 'Failed to update subitem' });
  }
});

// Usar o router para /api
app.use('/api', router);

// Se em produção, servir arquivos estáticos
if (process.env.NODE_ENV === 'production') {
  // Definir caminho para dist de forma robusta
  const distPath = path.resolve(__dirname, '../../dist');
  
  console.log('Serving static files from:', distPath);
  
  // Verificar se diretório existe
  if (fs.existsSync(distPath)) {
    console.log('✅ Dist directory found');
    const files = fs.readdirSync(distPath);
    console.log('Files in dist directory:', files);
  } else {
    console.error('❌ Dist directory not found at', distPath);
  }
  
  // Servir arquivos estáticos - simples e direto
  app.use(express.static(distPath));
  
  // Rota catch-all para SPA
  app.get('*', (req, res) => {
    console.log('SPA route handler for:', req.path);
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Inicializar DB e iniciar servidor apenas se este for o módulo principal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  initDatabase()
    .then(() => {
      console.log('Database initialized successfully');
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

export default app;
