
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

3. Execute o script de inicialização do banco de dados:
   ```
   npx ts-node src/scripts/setupDatabase.ts
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
