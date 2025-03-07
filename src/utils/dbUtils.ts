
import mysql from 'mysql2/promise';
import { dbConfig, dbSetupScript } from '../config/db.config';
import fs from 'fs';
import path from 'path';

// Create a connection pool
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to execute a query
export const query = async (sql: string, params?: any[]) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Function to save description to a text file
export const saveDescriptionToFile = async (
  subitemId: number,
  title: string,
  description: string
): Promise<string> => {
  try {
    // Create directory if it doesn't exist
    const dir = path.join(process.cwd(), 'public', 'descriptions');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Create a sanitized filename
    const sanitizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Create a unique filename
    const filename = `${subitemId}-${sanitizedTitle}.txt`;
    const filepath = path.join(dir, filename);

    // Strip HTML tags to save as plain text
    const plainText = description.replace(/<[^>]*>/g, '');
    
    // Write the file
    fs.writeFileSync(filepath, plainText);
    
    return filename;
  } catch (error) {
    console.error('Error saving description to file:', error);
    throw error;
  }
};

// Initialize database (create tables if they don't exist)
export const initDatabase = async () => {
  try {
    // Create connection without specifying database to check if it exists
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    // Execute the setup script
    const scripts = dbSetupScript.split(';');
    
    for (const script of scripts) {
      if (script.trim()) {
        await tempConnection.execute(script + ';');
      }
    }
    
    await tempConnection.end();
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};
