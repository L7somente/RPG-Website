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

## Homepage, níveis e sessões

- `/` é a homepage; o mural anterior continua em `/dashboard`.
- `/sessions` reúne Em andamento, Agendadas e Encerradas. O horário de início
  coloca a sessão em andamento; apenas o DM responsável ou ADMIN a encerra.
- O nível do mundo é o teto das fichas, inclusive a soma de multiclasses,
  até nível 20. A API valida e recalcula nível/proficiência na mesma transação.
  Fichas legadas acima do teto precisam redistribuir seus níveis antes de salvar.
- O encerramento preserva a sessão e participantes no histórico, conclui um
  evento ativo (ou cancela um agendado) e remove a sala temporária no Discord.
- O bot verifica as sessões a cada 30 segundos, cria recursos pendentes, inicia
  eventos no horário e repete sincronizações que falharam. O site também tenta
  sincronizar imediatamente após criar ou encerrar uma sessão.
- Falhas aparecem no painel de sessões, com tentativa manual. Uma reserva
  temporária no banco impede sincronizadores concorrentes; recursos criados
  parcialmente são reutilizados quando possível.

### Aplicar esta atualização

1. Configure `DATABASE_URL`, OAuth/NextAuth, `DISCORD_BOT_TOKEN`,
   `DISCORD_GUILD_ID` e o segredo dos sockets no ambiente do servidor.
2. Execute `npx prisma migrate deploy` e `npx prisma generate`.
3. Compile e reinicie o site, o servidor de sockets e o bot (`npm run bot`).
4. O bot precisa de Gerenciar canais, Gerenciar eventos, Ver canais e Conectar.
   Para o chat, mantenha também suas permissões e intents existentes.
5. Como DM, agende uma mesa alguns minutos à frente, confirme o evento e a
   sala privada, aguarde o início e encerre pelo site. Confira o histórico,
   a conclusão do evento e a remoção da sala. Simule uma falha de permissão
   e use Sincronizar Discord após restaurá-la para conferir a recuperação.

O Discord pode concluir eventos de voz automaticamente quando a sala fica
vazia; a sessão no site continua aberta até o DM encerrá-la. A duração é
uma estimativa, não encerra a mesa no site.
Referência: https://docs.discord.com/developers/resources/guild-scheduled-event

Os testes de sincronização usam respostas simuladas: não criam nem apagam
recursos reais. A validação em produção requer o banco e o bot configurados.

### Exclusão automática de salas e atualização visual

A sala temporária é excluída ao encerrar pelo site e também quando o evento
correspondente é concluído, cancelado ou removido no Discord. O bot escuta
essas mudanças e o verificador de 30 segundos recupera notificações perdidas.
O identificador da sala só é limpo após a exclusão ser confirmada (ou 404);
falhas mantêm a pendência para nova tentativa. O evento permanece associado
à sessão para evitar recriar a sala. A sessão no site ainda é encerrada pelo DM.
Reinicie o bot atualizado, com permissão Gerenciar canais, para ativar o fluxo.

O visual utiliza superfícies escuras translúcidas, navegação compacta e uma
barra de XP de 8 px com ondas. A animação respeita a preferência do sistema
por movimento reduzido. Sem dados de XP, nenhum progresso fictício é exibido.

### D20 e unidades de deslocamento

O d20 da homepage gira suavemente, inclusive na versão móvel; a preferência
por movimento reduzido desativa o giro. O campo Deslocamento oferece ft/m
na ficha editável e na leitura do DM, com preferência local de unidade.
Conversão física: 1 ft = 0,3048 m; 30 ft = 9,144 m. Alternar a unidade não salva
uma nova distância. Edições em metros são convertidas para pés, preservando
frações no banco. Aplicar também a migração `20260909020000_fractional_speed`.

O estudo de uma possível integração com Owlbear Rodeo está em
[docs/OWLBEAR-INTEGRATION.md](docs/OWLBEAR-INTEGRATION.md).
