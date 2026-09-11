# The Ledger

Gerenciador de campanhas de D&D com fichas, inventário, multiclasse, forja de itens, missões, sessões e XP compartilhado. Login pelo Discord e integração com Owlbear Rodeo.

Desenvolvido com Next.js, React, TypeScript, Tailwind e PostgreSQL/Prisma.

## Instalação

Requisitos: Node.js 24 LTS, PostgreSQL e uma aplicação Discord com OAuth e bot configurados.

1. Copie `.env.example` para `.env` e preencha as variáveis descritas no arquivo.
2. Instale as dependências e prepare o banco:

   ```sh
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   ```

3. Execute cada serviço em um terminal separado:

   ```sh
   npm run dev
   npm run socket
   npm run bot
   ```

Acesse http://localhost:3000.

## Configuração essencial

- **Banco e login:** configure `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET` e as credenciais OAuth do Discord. Registre o retorno `http://localhost:3000/api/auth/callback/discord`, substituindo a origem em produção.
- **Cargos:** configure `DISCORD_GUILD_ID`, `DISCORD_ADMIN_ROLE_ID` e `DISCORD_DM_ROLE_ID`. Os cargos são sincronizados no login; sem essa configuração, novas contas recebem PLAYER e o primeiro ADMIN precisa ser definido no banco.
- **Tempo real:** use o mesmo `SOCKET_SERVER_SECRET` privado, com pelo menos 32 caracteres aleatórios, no site, no servidor de sockets e no bot. Configure `NEXT_PUBLIC_SOCKET_URL` para o navegador e `SOCKET_SERVER_URL` para comunicação entre serviços.
- **Bot:** configure o token e os canais em `.env`. Para gerenciar sessões, conceda Gerenciar canais, Gerenciar eventos, Ver canais e Conectar, além das permissões e intents do chat.

Nunca publique o arquivo `.env` ou os segredos. Use HTTPS/WSS em produção.

## Produção e atualizações

Após obter a versão atualizada do projeto, execute:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Mantenha o servidor de sockets (`npm run socket`) e o bot (`npm run bot`) em processos persistentes separados. Ao atualizar, reinicie os três serviços. As migrações incluem as alterações necessárias para o Owlbear Rodeo.

## Owlbear Rodeo

Vincule uma sala em `/sessions` e instale a extensão pelo endereço `https://SEU-SITE/owlbear/manifest.json`. O painel permite consultar a ficha com pareamento temporário.

Consulte o [guia de integração](docs/OWLBEAR-INTEGRATION.md) para instalação, permissões e limitações.

## Verificação

```sh
npm test
npm run typecheck
npm run build
```

Os testes automatizados não substituem a validação das integrações com banco, Discord e Owlbear em um ambiente configurado.
