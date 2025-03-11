
import { testConnection } from '../utils/dbUtils';

const runTest = async () => {
  console.log('Iniciando teste de conexão com o banco de dados...');
  
  try {
    const result = await testConnection();
    if (result) {
      console.log('Teste de conexão concluído com sucesso!');
      process.exit(0);
    } else {
      console.error('Falha no teste de conexão.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Erro durante o teste de conexão:', error);
    process.exit(1);
  }
};

// Executar o teste
runTest();
