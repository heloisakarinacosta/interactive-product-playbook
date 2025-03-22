
// Set environment to production by default
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`Starting server in ${process.env.NODE_ENV} mode`);

// This script helps run the TypeScript server directly
require('ts-node/register');
require('./src/server/index.ts');
