
import { testConnection } from './dbUtils';

// Função que testa a conexão com o banco e retorna uma promessa
export const ensureDatabaseConnection = async (retries = 3, delay = 2000): Promise<boolean> => {
  console.log(`Tentando conectar ao banco de dados (tentativa 1/${retries})...`);
  
  // Primeira tentativa
  let connected = await testConnection();
  
  // Se não conectou, tenta novamente com retry
  let attempt = 1;
  while (!connected && attempt < retries) {
    attempt++;
    console.log(`Aguardando ${delay/1000} segundos antes da próxima tentativa...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`Tentando conectar ao banco de dados (tentativa ${attempt}/${retries})...`);
    connected = await testConnection();
  }
  
  if (connected) {
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
    return true;
  } else {
    console.error(`❌ Falha ao conectar ao banco de dados após ${retries} tentativas.`);
    return false;
  }
};
