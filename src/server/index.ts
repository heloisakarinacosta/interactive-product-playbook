// Modificações no arquivo index.ts

import express from 'express';
import { json, urlencoded } from 'express';
import cors from 'cors';
import { query, initDatabase } from '../utils/dbUtils';
import { ResultSetHeader } from 'mysql2';
import path from 'path';
import helmet from 'helmet';
import fs from 'fs';

// Create Express application
const app = express();

// Definir CSP directives simplificados e abrangentes
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

// Usar Helmet corretamente
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

// Criar router e definir rotas API
const router = express.Router();

// (Manter todas as rotas API existentes)
// ...

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
  const PORT = process.env.PORT || 3000; // Usando porta 3000 consistentemente
  
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
