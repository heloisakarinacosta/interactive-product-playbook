
# Instruções de Deployment

## Preparação para Produção

1. Construa o aplicativo React para produção:
   ```
   npm run build
   ```

2. Inicie o servidor de produção:
   ```
   node start-production-server.js
   ```

## Configuração de Ambiente

As variáveis de ambiente a seguir podem ser configuradas:

- `DB_HOST`: Host do banco de dados (padrão: 'localhost')
- `DB_USER`: Usuário do banco de dados (padrão: 'root')
- `DB_PASSWORD`: Senha do banco de dados
- `DB_NAME`: Nome do banco de dados (padrão: 'playbook_produtos')
- `DB_PORT`: Porta do banco de dados (padrão: 3306)
- `PORT`: Porta da aplicação (padrão: 3000)

## Deployment em Servidor na Nuvem

### Opção 1: DigitalOcean Droplet / VPS

1. Crie um Droplet com Ubuntu
2. Conecte-se via SSH
3. Instale as dependências:
   ```
   apt update
   apt install -y nodejs npm mariadb-server
   ```

4. Configure o MariaDB:
   ```
   mysql_secure_installation
   ```

5. Crie o banco de dados:
   ```
   mysql -u root -p
   CREATE DATABASE playbook_produtos;
   GRANT ALL PRIVILEGES ON playbook_produtos.* TO 'usuario'@'localhost' IDENTIFIED BY 'senha';
   FLUSH PRIVILEGES;
   EXIT;
   ```

6. Clone o repositório e configure:
   ```
   git clone https://seu-repositorio/playbook-produtos.git
   cd playbook-produtos
   npm install
   ```

7. Configure as variáveis de ambiente:
   ```
   touch .env
   nano .env
   ```
   
   Adicione:
   ```
   DB_HOST=localhost
   DB_USER=usuario
   DB_PASSWORD=senha
   DB_NAME=playbook_produtos
   PORT=3000
   ```

8. Construa e inicie:
   ```
   npm run build
   node start-production-server.js
   ```

9. Configure o Nginx como proxy reverso (opcional, mas recomendado):
   ```
   apt install -y nginx
   ```
   
   Edite o arquivo de configuração:
   ```
   nano /etc/nginx/sites-available/default
   ```
   
   Substitua com:
   ```
   server {
       listen 80;
       server_name seu-dominio.com www.seu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
   Reinicie o Nginx:
   ```
   systemctl restart nginx
   ```

10. Configure o PM2 para manter o aplicativo rodando:
    ```
    npm install -g pm2
    pm2 start start-production-server.js
    pm2 startup
    pm2 save
    ```

### Opção 2: Heroku

1. Instale o Heroku CLI
2. Faça login:
   ```
   heroku login
   ```

3. Crie um novo aplicativo:
   ```
   heroku create
   ```

4. Adicione um banco de dados MariaDB:
   ```
   heroku addons:create jawsdb-maria
   ```

5. Configure o script de start no package.json:
   ```json
   "scripts": {
     "start": "node start-production-server.js"
   }
   ```

6. Faça o deployment:
   ```
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

### Opção 3: Railway.app (Alternativa simples)

1. Crie uma conta em railway.app
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente necessárias
4. O Railway detectará automaticamente o script `start` no package.json

## Solução de Problemas

- **Erro de conexão com banco de dados**: Verifique credenciais no arquivo .env e certifique-se de que o serviço MariaDB/MySQL está rodando.
- **Erro 502 Bad Gateway**: Verifique se o servidor Node está rodando e as portas estão corretamente configuradas.
- **Problemas de CORS**: Verifique a configuração CORS no arquivo server.js.
- **Módulos não encontrados**: Certifique-se de que todas as dependências estão instaladas (`npm install`).

Para mais ajuda, consulte a documentação completa do projeto ou abra uma issue no repositório.
