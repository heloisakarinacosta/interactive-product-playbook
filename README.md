
# Playbook de Produtos

Uma plataforma interativa para gerenciar e visualizar produtos, itens, subitens e cenários.

## Requisitos

- Node.js (v14+)
- MariaDB (v10+)

## Configuração do Banco de Dados

1. Instale o MariaDB em seu servidor.

2. Configure os parâmetros de conexão no arquivo `src/config/db.config.ts`:
   - host (padrão: localhost)
   - user (padrão: root)
   - password (defina sua senha)
   - database (padrão: playbook_produtos)
   - port (padrão: 3306)

3. Teste a conexão com o banco de dados:
   ```
   npx tsx src/scripts/testDbConnection.ts
   ```

4. Se o teste for bem-sucedido, execute o script de inicialização do banco de dados:
   ```
   npx tsx src/scripts/setupDatabase.ts
   ```

### Soluções para Problemas de Conexão

Se você estiver enfrentando problemas de conexão com o MariaDB:

1. Verifique se o servidor MariaDB está em execução:
   ```
   sudo systemctl status mariadb   # Linux
   ```
   ou
   ```
   sc query mysql                  # Windows
   ```

2. Verifique se o usuário tem permissões corretas:
   ```sql
   GRANT ALL PRIVILEGES ON playbook_produtos.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Para MariaDB 11.4+, pode ser necessário alterar o método de autenticação:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'sua_senha';
   FLUSH PRIVILEGES;
   ```

## Acesso ao Sistema

- Usuário administrador padrão:
  - Login: admin
  - Senha: 01928374

## Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

1. `users` - Usuários do sistema
2. `access_logs` - Registros de acesso
3. `products` - Produtos cadastrados
4. `items` - Itens de produtos
5. `subitems` - Subitens de itens de produtos
6. `scenarios` - Cenários
7. `scenario_items` - Relação entre cenários e itens
8. `scenario_subitems` - Visibilidade de subitens em cenários
9. `menus` - Itens do menu do sistema

## Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```
npm run dev
```

## Produção

Para compilar para produção:

```
npm run build
```

Para iniciar o servidor em produção:

```
npm start
```
