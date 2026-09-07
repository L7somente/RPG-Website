# The Ledger — gerenciador de campanha D&D

Aplicação Next.js 16, React, TypeScript e Tailwind, com PostgreSQL/Prisma,
login exclusivamente pelo Discord, servidor Socket.io e bot discord.js.
Inclui fichas, inventário, multiclasse, missões, sessões e XP compartilhado.

## Instalação

1. Use Node.js 24 LTS e um banco PostgreSQL.
2. Execute `npm ci` e `npx prisma generate`.
3. Copie `.env.example` para `.env` e preencha as variáveis.
4. Execute `npx prisma migrate deploy` para aplicar as migrações existentes.
5. Execute `npm run prisma:seed` para inicializar o XP global.
6. Execute `npm run dev`, `npm run socket` e `npm run bot` em processos separados.

Para produção: `npm run build` seguido de `npm start`. O servidor de sockets
e o bot precisam continuar em processos persistentes separados.

## Configuração de acesso

Configure o OAuth Discord e registre a URL de retorno
`http://localhost:3000/api/auth/callback/discord` (troque a origem em produção).
Preencha `DISCORD_GUILD_ID`, `DISCORD_ADMIN_ROLE_ID` e `DISCORD_DM_ROLE_ID`
para sincronizar cargos no login. Sem sincronização, novas contas são PLAYER;
a atribuição inicial de ADMIN deve ser feita por um operador confiável no banco.
O seed não cria contas de demonstração nem senhas padrão.

Contas antigas não são vinculadas pelo nome. Um operador deve confirmar a
identidade antes de associar manualmente o `discordId` correto a uma conta
legada. O cargo atual é consultado no banco a cada leitura de sessão.
Alterações no Discord são sincronizadas no próximo login; para revogação
imediata de cargo no site, atualize também o registro no banco.

## Comunicação em tempo real

Gere um segredo com:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Defina o mesmo `SOCKET_SERVER_SECRET` privado no Next.js, servidor Socket.io e
bot. Nunca use prefixo `NEXT_PUBLIC_` nesse segredo. O servidor e o bot recusam
iniciar sem um segredo de pelo menos 32 caracteres.

- `NEXT_PUBLIC_SOCKET_URL`: endereço acessível aos navegadores.
- `SOCKET_SERVER_URL`: endereço usado entre os processos do servidor.
- `NEXTAUTH_URL`: origem permitida pelo CORS do servidor Socket.io.

Use HTTPS/WSS em produção. Apenas usuários autenticados recebem tokens de
chat, com validade de cinco minutos e renovação por nova consulta de sessão.
Visitantes recebem somente atualizações públicas de XP. Publicações HTTP e
mensagens do bot exigem o segredo privado. O histórico do chat exige login.
O bot não permite menções automáticas a usuários ou cargos.

## Regras de consistência

- PATCH de ficha e inventário valida campos permitidos e rejeita operações
  sobre relações do Prisma. Itens são sempre associados à ficha da URL.
- O limite de cinco fichas é verificado na mesma transação da criação.
- Conclusão de missão, histórico e recompensa usam uma transação serializável,
  com repetição limitada em conflitos. Uma missão concluída não pode reabrir.
- A aprovação só opera sobre missões pendentes. Missões rejeitadas não podem
  ser concluídas pelo endpoint de atualização.
- A ficha envia alterações em ordem, mantém falhas pendentes e oferece nova
  tentativa. Não saia da página enquanto houver alterações pendentes.
- Falhas de transmissão em tempo real não desfazem dados já salvos. Não há
  fila persistente para reenvio automático de eventos ao Discord.

## Verificação

```sh
npm test
npm run typecheck
npm run build
```

Os testes cobrem validação, autorização, associação de itens, vinculação de
contas, sessões revogadas, conclusão/recompensa e rollback com banco simulado.
Também exercitam um servidor Socket.io real local, incluindo autenticação,
isolamento do chat e rejeição de mensagens forjadas. A integração com um
PostgreSQL real e o OAuth/bot Discord requer as credenciais do ambiente.

Não distribua `.env`, `node_modules` ou `.next` em pacotes do projeto.
