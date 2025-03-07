
import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import path from 'path';
import { query, initDatabase } from '../utils/dbUtils';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../../public')));

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
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add more routes for items, subitems, scenarios, etc.

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
