import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { cspMiddleware } from '../middleware/csp';
import { query, initDatabase } from '../utils/dbUtils';
import { ResultSetHeader } from 'mysql2';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Apply CSP middleware before other middleware
app.use(cspMiddleware);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Determine if we're in production (not using Vite for development)
const isProduction = process.env.NODE_ENV === 'production';

// In production, serve static files from the dist directory
if (isProduction) {
  console.log('Running in production mode, serving static files from dist');
  app.use(express.static(path.join(__dirname, '../../../dist')));
} else {
  // In development, serve static files from the public directory
  console.log('Running in development mode, serving static files from public');
  app.use(express.static(path.join(__dirname, '../../public')));
}

// Initialize database
initDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
  });

// API routes

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await query('SELECT * FROM products ORDER BY updated_at DESC');
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { title, description } = req.body;
    const result = await query(
      'INSERT INTO products (title, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [title, description]
    );
    
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
app.put('/api/products/:id', async (req, res) => {
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
app.get('/api/items/:productId', async (req, res) => {
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

app.post('/api/items', async (req, res) => {
  try {
    const { title, product_id } = req.body;
    const result = await query(
      'INSERT INTO items (product_id, title, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [product_id, title]
    );
    
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
app.get('/api/subitems/:itemId', async (req, res) => {
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

app.post('/api/subitems', async (req, res) => {
  try {
    const { item_id, title, subtitle, description, last_updated_by } = req.body;
    const result = await query(
      'INSERT INTO subitems (item_id, title, subtitle, description, last_updated_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [item_id, title, subtitle, description, last_updated_by]
    );
    
    const resultHeader = result as ResultSetHeader;
    const newSubitemId = resultHeader.insertId;
    
    const newSubitem = await query('SELECT * FROM subitems WHERE id = ?', [newSubitemId]);
    
    res.status(201).json(Array.isArray(newSubitem) ? newSubitem[0] : newSubitem);
  } catch (error) {
    console.error('Error creating subitem:', error);
    res.status(500).json({ error: 'Failed to create subitem' });
  }
});

app.put('/api/subitems/:id', async (req, res) => {
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

// Scenarios routes
app.get('/api/scenarios', async (req, res) => {
  try {
    const scenarios = await query('SELECT * FROM scenarios ORDER BY updated_at DESC');
    res.json(scenarios);
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({ error: 'Failed to fetch scenarios' });
  }
});

app.post('/api/scenarios', async (req, res) => {
  try {
    const { title, description, formatted_description } = req.body;
    const result = await query(
      'INSERT INTO scenarios (title, description, formatted_description, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [title, description, formatted_description]
    );
    
    const resultHeader = result as ResultSetHeader;
    const newScenarioId = resultHeader.insertId;
    
    const newScenario = await query('SELECT * FROM scenarios WHERE id = ?', [newScenarioId]);
    
    res.status(201).json(Array.isArray(newScenario) ? newScenario[0] : newScenario);
  } catch (error) {
    console.error('Error creating scenario:', error);
    res.status(500).json({ error: 'Failed to create scenario' });
  }
});

app.put('/api/scenarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, formatted_description } = req.body;
    
    await query(
      'UPDATE scenarios SET title = ?, description = ?, formatted_description = ?, updated_at = NOW() WHERE id = ?',
      [title, description, formatted_description, id]
    );
    
    const updated = await query('SELECT * FROM scenarios WHERE id = ?', [id]);
    res.json(Array.isArray(updated) ? updated[0] : updated);
  } catch (error) {
    console.error('Error updating scenario:', error);
    res.status(500).json({ error: 'Failed to update scenario' });
  }
});

// Scenario items routes
app.get('/api/scenarios/:scenarioId/items', async (req, res) => {
  try {
    const { scenarioId } = req.params;
    const items = await query(
      'SELECT * FROM scenario_items WHERE scenario_id = ? ORDER BY created_at DESC',
      [scenarioId]
    );
    res.json(items);
  } catch (error) {
    console.error('Error fetching scenario items:', error);
    res.status(500).json({ error: 'Failed to fetch scenario items' });
  }
});

app.post('/api/scenarios/:scenarioId/items/:itemId', async (req, res) => {
  try {
    const { scenarioId, itemId } = req.params;
    const result = await query(
      'INSERT INTO scenario_items (scenario_id, item_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
      [scenarioId, itemId]
    );
    
    const resultHeader = result as ResultSetHeader;
    const newLinkId = resultHeader.insertId;
    
    const newLink = await query('SELECT * FROM scenario_items WHERE id = ?', [newLinkId]);
    
    res.status(201).json(Array.isArray(newLink) ? newLink[0] : newLink);
  } catch (error) {
    console.error('Error linking item to scenario:', error);
    res.status(500).json({ error: 'Failed to link item to scenario' });
  }
});

app.post('/api/scenarios/:scenarioId/items/:itemId/subitems/:subitemId/visibility', async (req, res) => {
  try {
    const { scenarioId, itemId, subitemId } = req.params;
    const { isVisible } = req.body;
    
    // Check if record exists
    const existingRecords = await query(
      'SELECT * FROM subitem_visibility WHERE scenario_id = ? AND item_id = ? AND subitem_id = ?',
      [scenarioId, itemId, subitemId]
    );
    
    if (Array.isArray(existingRecords) && existingRecords.length > 0) {
      // Update existing record
      await query(
        'UPDATE subitem_visibility SET is_visible = ?, updated_at = NOW() WHERE scenario_id = ? AND item_id = ? AND subitem_id = ?',
        [isVisible, scenarioId, itemId, subitemId]
      );
    } else {
      // Create new record
      await query(
        'INSERT INTO subitem_visibility (scenario_id, item_id, subitem_id, is_visible, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
        [scenarioId, itemId, subitemId, isVisible]
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating subitem visibility:', error);
    res.status(500).json({ error: 'Failed to update subitem visibility' });
  }
});

app.get('/api/scenarios/:scenarioId/items/:itemId/subitems', async (req, res) => {
  try {
    const { scenarioId, itemId } = req.params;
    
    // Get all subitems for the item
    const subitems = await query(
      'SELECT s.*, COALESCE(sv.is_visible, 1) as is_visible FROM subitems s ' +
      'LEFT JOIN subitem_visibility sv ON s.id = sv.subitem_id AND sv.scenario_id = ? AND sv.item_id = ? ' +
      'WHERE s.item_id = ? ORDER BY s.created_at DESC',
      [scenarioId, itemId, itemId]
    );
    
    res.json(subitems);
  } catch (error) {
    console.error('Error fetching subitems with visibility:', error);
    res.status(500).json({ error: 'Failed to fetch subitems with visibility' });
  }
});

// Catch-all route to serve index.html for client-side routing in production
if (isProduction) {
  app.get('*', (req, res) => {
    // Only catch routes that don't start with /api
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../../../dist/index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
