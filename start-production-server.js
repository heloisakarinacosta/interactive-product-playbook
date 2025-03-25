
#!/usr/bin/env node
import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { initDatabase } from './dist/utils/dbUtils.js';

// Obter o diretório atual em ESM
const __dirname = dirname(fileURLToPath(import.meta.url));

// Inicializar o aplicativo Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing de JSON e URL encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Iniciando o servidor em modo de produção...');

// Testar a conexão com o banco de dados antes de iniciar o servidor
try {
  await initDatabase();
  console.log('✅ Banco de dados inicializado com sucesso!');
} catch (error) {
  console.error('❌ Falha ao inicializar o banco de dados:', error);
  process.exit(1);
}

// Importar as rotas da API
const apiModule = await import('./dist/server/index.js');
const apiRoutes = apiModule.default || app;

// Usar as rotas da API
app.use('/api', apiRoutes);

// Servir arquivos estáticos do build do React
app.use(express.static(join(__dirname, 'dist/client')));

// Para qualquer outra rota, servir o index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist/client', 'index.html'));
});

// Iniciar o servidor
const server = createServer(app);
server.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT} em modo de produção`);
  console.log(`   Acesse: http://localhost:${PORT}`);
});
