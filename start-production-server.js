import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import mysql from 'mysql2/promise';
import { dbConfig } from './src/config/db.config.js';
import helmet from 'helmet';
import expressStaticGzip from 'express-static-gzip';
import fs from 'fs';

// Set environment to production
process.env.NODE_ENV = 'production';

// Get current directory in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting server in production mode...');
console.log('Current directory:', __dirname);

// Create a database connection pool
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

// Initialize database function
const initDatabase = async () => {
  try {
    console.log('Attempting to initialize database...');
    // Test connection before proceeding
    const connection = await pool.getConnection();
    console.log('Connection successful!');
    connection.release();

    // Create the tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subitems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        last_updated_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS scenarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS scenario_items (
        scenario_id INT NOT NULL,
        item_id INT NOT NULL,
        PRIMARY KEY (scenario_id, item_id),
        FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS scenario_subitems (
        scenario_id INT NOT NULL,
        subitem_id INT NOT NULL,
        visible BOOLEAN DEFAULT TRUE,
        PRIMARY KEY (scenario_id, subitem_id),
        FOREIGN KEY (scenario_id) REFERENCES scenarios(id) ON DELETE CASCADE,
        FOREIGN KEY (subitem_id) REFERENCES subitems(id) ON DELETE CASCADE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        route VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

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

// Define CSP directives for our app - expanded for productfruits
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

// Monkey patch the http.ServerResponse prototype to intercept all setHeader calls globally
// This ensures our CSP is never overridden by any middleware
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

// Import app from server/index.js
import app from './src/server/index.js';

// Custom middleware to ensure our CSP is preserved on all responses
app.use((req, res, next) => {
  // Force our CSP to be set on every response
  res.setHeader('Content-Security-Policy', generateCspString());
  
  // Override the setHeader method for this request
  const originalResSetHeader = res.setHeader;
  res.setHeader = function(name, value) {
    if (name.toLowerCase() === 'content-security-policy') {
      if (typeof value === 'string' && value.includes("default-src 'none'")) {
        return originalResSetHeader.call(this, name, generateCspString());
      }
    }
    return originalResSetHeader.call(this, name, value);
  };
  
  // Monkey patch res.send for this request
  const originalSend = res.send;
  res.send = function(body) {
    // Ensure our CSP is set before sending
    const currentCsp = res.getHeader('Content-Security-Policy');
    if (!currentCsp || 
        (typeof currentCsp === 'string' && currentCsp.includes("default-src 'none'"))) {
      res.setHeader('Content-Security-Policy', generateCspString());
    }
    
    return originalSend.call(this, body);
  };
  
  next();
});

// Define the path to static files
const distPath = join(__dirname, 'dist');
console.log('Looking for static files at:', distPath);

// Check if the dist directory exists
if (fs.existsSync(distPath)) {
  console.log('✅ Dist directory found');
  
  // List files in the dist directory for debugging
  const files = fs.readdirSync(distPath);
  console.log('Files in dist directory:', files);
  
  // Check if index.html exists
  if (fs.existsSync(join(distPath, 'index.html'))) {
    console.log('✅ index.html found');
  } else {
    console.error('❌ index.html not found in dist directory');
  }
} else {
  console.error('❌ Dist directory not found at', distPath);
  console.log('Make sure to run "npm run build" before starting the production server');
}

// Set dist path as a static directory with express.static as fallback
app.use(express.static(distPath));

// Use express-static-gzip for static files
app.use(expressStaticGzip(distPath, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  index: false // Remove setHeaders property to fix TypeScript error
}));

// Apply CSP headers after the static middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', generateCspString());
  next();
});

// Handle SPA routing
app.get('*', (req, res) => {
  console.log('Handling route:', req.path);
  res.setHeader('Content-Security-Policy', generateCspString());
  res.sendFile(join(distPath, 'index.html'));
});

// Initialize database before starting the server
initDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully!');
    
    // Define port
    const PORT = process.env.PORT || 3000;
    
    // Create HTTP server with Express app
    const server = createServer(app);
    
    // Start server
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} in production mode`);
      console.log(`   Access: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
  });
