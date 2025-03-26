// check-files.js
const fs = require('fs');
const path = require('path');

// Verifique vários possíveis caminhos
const possiblePaths = [
  path.resolve(__dirname, 'dist'),
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../../dist')
];

possiblePaths.forEach(p => {
  console.log(`Verificando: ${p}`);
  if (fs.existsSync(p)) {
    console.log(`✅ Diretório existe: ${p}`);
    try {
      const files = fs.readdirSync(p);
      console.log(`Arquivos: ${files.join(', ')}`);
      
      // Verificar index.html
      if (fs.existsSync(path.join(p, 'index.html'))) {
        console.log(`✅ index.html encontrado`);
      } else {
        console.log(`❌ index.html não encontrado`);
      }
    } catch (e) {
      console.error(`Erro ao ler diretório: ${e.message}`);
    }
  } else {
    console.log(`❌ Diretório não existe: ${p}`);
  }
  console.log('-----------------------');
});
