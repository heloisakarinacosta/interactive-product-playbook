
# Documentação do Sistema Playbook de Produtos

Esta documentação abrange os aspectos técnicos e funcionais do sistema Playbook de Produtos, incluindo configuração, estrutura e instruções de deploy.

## Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Frontend](#frontend)
5. [Backend](#backend)
6. [Banco de Dados](#banco-de-dados)
7. [Instalação e Configuração](#instalação-e-configuração)
8. [Deploy em Produção](#deploy-em-produção)
9. [Troubleshooting](#troubleshooting)
10. [Desenvolvimento Futuro](#desenvolvimento-futuro)

## Visão Geral

O sistema Playbook de Produtos é uma aplicação web para gerenciar e visualizar produtos, seus itens e subitens, além de cenários de uso. A aplicação utiliza uma arquitetura moderna com React no frontend e Node.js/Express no backend, com banco de dados MariaDB.

### Funcionalidades Principais

- Gerenciamento de produtos, itens e subitems
- Criação e gerenciamento de cenários de uso
- Autenticação de usuários
- Interface administrativa para usuários com privilégios
- Registro de logs de acesso

## Arquitetura

O sistema segue uma arquitetura de três camadas:

1. **Frontend**: React com TypeScript, utilizando Tailwind CSS e Shadcn UI para estilização
2. **Backend**: Node.js com Express
3. **Banco de Dados**: MariaDB

### Fluxo de Dados

1. O usuário interage com a interface React
2. As requisições são enviadas para a API Express
3. O backend processa as requisições e interage com o banco de dados
4. Os dados são retornados ao frontend para renderização

## Estrutura do Projeto

```
/
├── dist/                 # Build da aplicação frontend (gerado)
├── src/
│   ├── components/       # Componentes React
│   ├── context/          # Contextos React (ex: AuthContext)
│   ├── hooks/            # Custom hooks React
│   ├── pages/            # Páginas principais da aplicação
│   ├── services/         # Serviços para API
│   ├── utils/            # Utilitários
│   ├── config/           # Configurações
│   ├── server/           # Backend Express
│   ├── scripts/          # Scripts utilitários
│   ├── main.tsx          # Entry point do React
│   └── App.tsx           # Componente raiz do React
├── public/               # Arquivos estáticos
├── start-production-server.js  # Script para iniciar o servidor em produção
├── DEPLOYMENT.md         # Instruções de deployment
└── README.md             # Documentação geral
```

## Frontend

### Tecnologias Utilizadas

- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI (baseado em Radix UI)
- React Query para gerenciamento de estado e requisições
- React Router para navegação

### Estrutura do Frontend

#### Componentes Principais

- `src/components/layout/Header.tsx`: Barra de navegação principal
- `src/components/ui/`: Componentes de UI reusáveis

#### Páginas

- `src/pages/Login.tsx`: Página de login
- `src/pages/Products.tsx`: Listagem e gerenciamento de produtos
- `src/pages/Scenarios.tsx`: Listagem e gerenciamento de cenários
- `src/pages/AdminLogs.tsx`: Visualização de logs (acesso administrativo)
- `src/pages/Index.tsx`: Página inicial (redirecionamento)
- `src/pages/NotFound.tsx`: Página 404

#### Contextos

- `src/context/AuthContext.tsx`: Gerencia autenticação e sessão do usuário

#### Services

- `src/services/api.ts`: Funções para comunicação com backend

## Backend

### Tecnologias Utilizadas

- Node.js
- Express
- MySQL2 (driver para MariaDB)
- Helmet (para segurança)
- CORS

### Estrutura do Backend

- `src/server/index.ts`: Entry point do servidor Express
- `src/utils/dbUtils.ts`: Funções para interação com o banco de dados
- `src/config/db.config.js`: Configuração de conexão com banco de dados

### API Endpoints

#### Produtos

- `GET /api/products`: Lista todos os produtos
- `POST /api/products`: Cria um novo produto
- `PUT /api/products/:id`: Atualiza um produto existente

#### Itens

- `GET /api/items/:productId`: Lista todos os itens de um produto
- `POST /api/items`: Cria um novo item

#### Subitems

- `GET /api/subitems/:itemId`: Lista todos os subitems de um item
- `POST /api/subitems`: Cria um novo subitem
- `PUT /api/subitems/:id`: Atualiza um subitem existente

## Banco de Dados

### Estrutura do Banco de Dados

O banco de dados utiliza MariaDB com as seguintes tabelas principais:

- `users`: Usuários do sistema
- `access_logs`: Logs de acesso
- `products`: Produtos
- `items`: Itens de produtos
- `subitems`: Subitems de itens
- `scenarios`: Cenários
- `scenario_items`: Relação entre cenários e itens
- `scenario_subitems`: Visibilidade de subitems em cenários
- `menus`: Itens do menu da aplicação

### Modelo de Dados

#### users

| Campo      | Tipo         | Descrição                     |
|------------|--------------|-------------------------------|
| id         | INT          | ID único (chave primária)     |
| email      | VARCHAR(255) | Email do usuário (único)      |
| password   | VARCHAR(255) | Senha (MD5)                   |
| is_admin   | BOOLEAN      | Flag para usuários admin      |
| created_at | TIMESTAMP    | Data de criação               |

#### products

| Campo       | Tipo         | Descrição                     |
|-------------|--------------|-------------------------------|
| id          | INT          | ID único (chave primária)     |
| title       | VARCHAR(255) | Título do produto             |
| description | TEXT         | Descrição do produto          |
| created_by  | INT          | ID do usuário criador         |
| created_at  | TIMESTAMP    | Data de criação               |
| updated_by  | INT          | ID do usuário atualizador     |
| updated_at  | TIMESTAMP    | Data da última atualização    |

#### items

| Campo       | Tipo         | Descrição                     |
|-------------|--------------|-------------------------------|
| id          | INT          | ID único (chave primária)     |
| product_id  | INT          | ID do produto (FK)            |
| title       | VARCHAR(255) | Título do item                |
| created_by  | INT          | ID do usuário criador         |
| created_at  | TIMESTAMP    | Data de criação               |
| updated_by  | INT          | ID do usuário atualizador     |
| updated_at  | TIMESTAMP    | Data da última atualização    |

#### subitems

| Campo          | Tipo         | Descrição                     |
|----------------|--------------|-------------------------------|
| id             | INT          | ID único (chave primária)     |
| item_id        | INT          | ID do item (FK)               |
| title          | VARCHAR(255) | Título do subitem             |
| subtitle       | VARCHAR(255) | Subtítulo                     |
| description    | TEXT         | Descrição detalhada           |
| last_updated_by| VARCHAR(255) | Nome do último atualizador    |
| created_at     | TIMESTAMP    | Data de criação               |
| updated_at     | TIMESTAMP    | Data da última atualização    |

## Instalação e Configuração

### Requisitos do Sistema

- Node.js v14+ (recomendado v16+)
- MariaDB v10+ (recomendado v10.5+)
- Npm ou Yarn

### Instalação Local para Desenvolvimento

1. **Clone o repositório**

```bash
git clone https://seu-repositorio/playbook-produtos.git
cd playbook-produtos
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o banco de dados**

Edite o arquivo `src/config/db.config.js` com as credenciais do seu banco de dados local:

```javascript
{
  host: '127.0.0.1',  // ou seu host do MariaDB
  user: 'root',       // usuário do banco de dados
  password: '',       // senha do banco de dados
  database: 'playbook_produtos',
  port: 3306
}
```

4. **Inicialize o banco de dados**

```bash
npx tsx src/scripts/setupDatabase.ts
```

5. **Execute o servidor de desenvolvimento**

```bash
npm run dev
```

6. **Acesse a aplicação**

Abra o navegador em `http://localhost:3000`

## Deploy em Produção

### Requisitos do Servidor

- Ubuntu Server 20.04 LTS ou superior
- Node.js v16+
- MariaDB v10.5+
- Nginx (para proxy reverso)
- PM2 (para gerenciamento de processos)

### Configuração do Servidor Ubuntu

1. **Atualize o sistema**

```bash
sudo apt update
sudo apt upgrade -y
```

2. **Instale o Node.js**

```bash
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs
```

3. **Instale o MariaDB**

```bash
sudo apt install -y mariadb-server
sudo mysql_secure_installation
```

4. **Configure o MariaDB**

```bash
sudo mysql
```

```sql
CREATE USER 'playbook'@'localhost' IDENTIFIED BY 'sua_senha_segura';
CREATE DATABASE playbook_produtos CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
GRANT ALL PRIVILEGES ON playbook_produtos.* TO 'playbook'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

5. **Instale o PM2**

```bash
sudo npm install -g pm2
```

6. **Instale o Nginx**

```bash
sudo apt install -y nginx
```

### Deploy da Aplicação

1. **Clone o repositório no servidor**

```bash
git clone https://seu-repositorio/playbook-produtos.git
cd playbook-produtos
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto:

```
DB_HOST=localhost
DB_USER=playbook
DB_PASSWORD=sua_senha_segura
DB_NAME=playbook_produtos
DB_PORT=3306
PORT=3000
NODE_ENV=production
```

4. **Construa o frontend**

```bash
npm run build
```

5. **Inicialize o banco de dados**

```bash
node db-setup-script.js
```

6. **Configure o PM2**

```bash
pm2 start start-production-server.js --name "playbook"
pm2 startup
pm2 save
```

7. **Configure o Nginx como proxy reverso**

Crie um arquivo de configuração para o Nginx:

```bash
sudo nano /etc/nginx/sites-available/playbook
```

Adicione o seguinte conteúdo:

```nginx
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

Ative a configuração:

```bash
sudo ln -s /etc/nginx/sites-available/playbook /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Configure o HTTPS (recomendado)**

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### Atualização da Aplicação

1. **Baixe as atualizações**

```bash
cd /caminho/para/playbook-produtos
git pull origin main
```

2. **Atualize as dependências**

```bash
npm install
```

3. **Reconstrua o frontend**

```bash
npm run build
```

4. **Reinicie a aplicação**

```bash
pm2 restart playbook
```

## Troubleshooting

### Problemas de Conexão com o Banco de Dados

1. **Verifique as credenciais**

```bash
node src/scripts/testDbConnection.js
```

2. **Verifique o status do MariaDB**

```bash
sudo systemctl status mariadb
```

3. **Verifique os logs**

```bash
sudo journalctl -u mariadb
```

4. **Verifique acessos e privilégios**

```sql
SELECT USER(), CURRENT_USER();
SHOW GRANTS;
```

5. **Resolva problemas de autenticação (MariaDB 10.4+)**

```sql
ALTER USER 'playbook'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha_segura';
FLUSH PRIVILEGES;
```

### Problemas com o Nginx

1. **Verifique a sintaxe da configuração**

```bash
sudo nginx -t
```

2. **Verifique os logs**

```bash
sudo tail -f /var/log/nginx/error.log
```

3. **Verifique o status do serviço**

```bash
sudo systemctl status nginx
```

### Problemas com a Aplicação

1. **Verifique os logs do PM2**

```bash
pm2 logs
```

2. **Verifique se os arquivos estáticos estão sendo servidos**

```bash
ls -la dist
```

3. **Reinicie a aplicação**

```bash
pm2 restart playbook
```

## Desenvolvimento Futuro

### Funcionalidades Planejadas

1. Upload de arquivos para subitens
2. Histórico de alterações
3. Comentários em itens e subitens
4. Exportação para PDF
5. Dashboard administrativo expandido

### Melhorias Técnicas

1. Migração para autenticação com JWT
2. Implementação de testes automatizados
3. Refatoração para TypeScript completo no backend
4. Implementação de cache para melhorar performance

### Considerações de Segurança

1. Implementar CSRF protection
2. Adicionar rate limiting para API
3. Implementar verificação em duas etapas para usuários admin
4. Expandir validação de inputs

---

Documento revisado em: 10/05/2025  
Versão: 1.0
