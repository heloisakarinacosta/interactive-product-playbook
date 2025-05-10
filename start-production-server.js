
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { createServer } from 'http';
import { initDatabase } from './src/utils/dbUtils.js';

// Set environment to production
process.env.NODE_ENV = 'production';

// Get current directory in ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

console.log('Starting server in production mode...');
console.log('Current directory:', __dirname);

// Import app from server/index.js
import app from './src/server/index.js';

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

// Set dist path as a static directory
app.use(express.static(distPath));

// Handle SPA routing
app.get('*', (req, res) => {
  console.log('Handling route:', req.path);
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
