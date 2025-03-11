
import mysql from 'mysql2/promise';
import { dbConfig } from '../config/db.config';

// Create connection pool com configurações mais seguras para MariaDB 11.4
const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  port: dbConfig.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  authPlugins: dbConfig.authPlugins
});

// Initialize database - create tables if they don't exist
export const initDatabase = async () => {
  try {
    console.log('Tentando inicializar o banco de dados...');
    // Teste de conexão antes de prosseguir
    const connection = await pool.getConnection();
    console.log('Conexão bem-sucedida!');
    connection.release();

    // Connect to database
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subitems (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT NOT NULL,
        last_updated_by VARCHAR(100),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Execute SQL query with parameters
export const query = async (sql: string, params: any[] = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Método separado para testar apenas a conexão
export const testConnection = async () => {
  try {
    console.log('Testando conexão com o banco de dados...');
    console.log('Configuração:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    const connection = await pool.getConnection();
    console.log('✅ Conexão bem-sucedida!');
    
    // Obter informações do servidor
    const [rows] = await connection.query('SELECT VERSION() as version');
    console.log('Versão do banco de dados:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco de dados:', error);
    return false;
  }
};
