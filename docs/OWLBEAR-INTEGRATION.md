# Integração com Owlbear Rodeo

Estudo de viabilidade · 09/09/2026. Pesquisa documental; não houve instalação de extensão nem alteração em salas reais.

A primeira versão das etapas 1 e 2 está implementada: vínculo de sala na página de sessões, manifest e painel de ficha somente de leitura. A instalação em uma sala real e o fluxo com Discord/banco ainda precisam de validação no ambiente configurado.

## Usar a primeira versão

1. Execute `npm ci`, `npx prisma migrate deploy`, `npx prisma generate` e `npm run build` no ambiente configurado; reinicie o site.
2. Em `/sessions`, o DM responsável ou ADMIN cadastra o link HTTPS da sala. Apagar o link e salvar desvincula a sala. Alterar o vínculo revoga os acessos anteriores.
3. No perfil do Owlbear, adicione a extensão pelo endereço `https://SEU-SITE/owlbear/manifest.json` e habilite-a na sala. Localmente, substitua a origem por `http://localhost:3000` (ou a porta usada pelo Ledger).
4. Confirme a participação do jogador com sua ficha no painel de organização da sessão. O jogador abre **Conectar minha ficha ao Owlbear**, escolhe a ficha e gera o código.
5. Cole o código no painel The Ledger dentro da sala correspondente. O painel exibe PV, PV temporários, CA, deslocamento em metros, iniciativa e ataques; consulta novamente a cada 15 segundos.

O código é uma credencial de leitura de alta entropia válida por uma hora, guardada somente como hash no banco e em memória no painel. Não é um código de uso único. Gerar outro código substitui o acesso anterior desse jogador nessa sessão. **Revogar acesso** invalida-o no servidor; **Desconectar deste painel** apenas limpa a memória local. Fechar/reabrir o painel exige colar o código novamente. Não compartilhe o código.

Cada consulta verifica existência do usuário, propriedade da ficha, participação confirmada com a ficha selecionada (ou gestão da sessão), sala vinculada e sessão não encerrada. O identificador da sala enviado pelo SDK é contexto, não prova de identidade. Nenhuma ficha é publicada em metadata do Owlbear. Códigos não autorizam escrita. O painel limpa a ficha quando a consulta falha.

Esta versão não modifica tokens nem implementa iniciativa compartilhada ou sincronização de duas vias. Os testes automatizados verificam permissões, expiração, revogação, isolamento e validação de URLs com banco simulado. Para concluir a validação real: instalar em uma sala, parear com Discord, alterar PV no Ledger, aguardar a atualização e revogar acesso; testar também com outro jogador e uma sala diferente.

## Capacidades e prioridades

| Possibilidade | Como funcionaria | Esforço relativo |
| --- | --- | --- |
| Abrir a sala pela sessão | DM cadastra o link; jogadores abrem pelo Ledger | Baixo |
| Ficha no tabletop | Painel com PV, CA, deslocamento e ataques | Médio |
| Personagem associado a token | Selecionar token e vinculá-lo à ficha autorizada | Médio |
| PV e condições visíveis no token | Atualizar rótulos ou indicadores a partir da ficha | Médio |
| Iniciativa compartilhada | Painel de ordem de combate | Médio |
| Medição de deslocamento | Comparar percurso e movimento disponível conforme a grade | Médio/alto |
| Avisos e rolagens | Enviar avisos aos clientes conectados, com histórico no Ledger | Médio |

Essas são propostas fundamentadas nas APIs, não recursos já conectados ao nosso site. O SDK oferece leitura, criação e atualização de itens da cena, seleção de tokens e metadata própria. Há também um tutorial oficial de iniciativa. [Itens](https://docs.owlbear.rodeo/extensions/apis/scene/items/), [jogador](https://docs.owlbear.rodeo/extensions/apis/player/), [metadata](https://docs.owlbear.rodeo/extensions/reference/metadata/), [iniciativa](https://docs.owlbear.rodeo/extensions/tutorial-initiative-tracker/).

## Arquitetura proposta

O mecanismo documentado é uma aplicação web em iframe, descrita por um manifest e conectada ao SDK TypeScript. O manifest pode definir um painel e uma página de segundo plano. Essa página roda no navegador; não substitui um servidor persistente. [Arquitetura](https://docs.owlbear.rodeo/extensions/getting-started/), [manifest](https://docs.owlbear.rodeo/extensions/reference/manifest/).

1. Adicionar futuramente `owlbearRoomUrl` e `owlbearRoomId` à sessão. Somente o DM responsável ou ADMIN poderá alterar a associação.
2. Criar um painel compacto da extensão, reutilizando a ficha sem carregar a navegação inteira do site.
3. Parear o usuário autenticado no Ledger com acesso temporário restrito à sessão e à ficha. Nunca enviar credenciais do bot à extensão.
4. Associar token a personagem, sala e cena. Guardar referências e apenas dados explicitamente compartilhados em metadata com prefixo próprio; manter dados privados no banco.
5. Começar com Ledger como origem dos PV e do deslocamento e um botão para atualizar o token. Introduzir duas vias só depois, com versões, deduplicação e reconciliação após desconexão.

Essas escolhas são recomendações de implementação. O cargo GM e o identificador fornecidos pelo SDK não comprovam, por si só, a identidade Discord no nosso servidor. Toda escrita deve continuar validando propriedade da ficha e permissão da sessão. [API do jogador](https://docs.owlbear.rodeo/extensions/apis/player/).

## Limitações a resolver

- **Localhost:** o tutorial oficial permite instalar o manifest de um servidor local. Podemos prototipar nesta máquina. Para outros computadores, localhost aponta para cada máquina; o serviço precisará de endereço acessível aos participantes. [Instalação local](https://docs.owlbear.rodeo/extensions/tutorial-hello-world/install-your-extension/).
- **Login dentro do iframe:** testar cookies e políticas de embedding nos navegadores do grupo. Recomendo login em janela normal e pareamento temporário, evitando depender exclusivamente de cookies de terceiros. Isso precisa de prova prática.
- **Sala e cena:** os tokens pertencem à cena carregada; trocar de cena exige reconstruir os vínculos visíveis. [Sala](https://docs.owlbear.rodeo/extensions/apis/room/), [itens](https://docs.owlbear.rodeo/extensions/apis/scene/items/).
- **Mensagens:** broadcast é efêmero e limita mensagens a 16 KB. Usar para avisos, não como banco do histórico. [Broadcast](https://docs.owlbear.rodeo/extensions/apis/broadcast/).
- **Distância:** distinguir conversão física (1 ft = 0,3048 m, usada nesta atualização) da convenção de jogo (5 ft = 1,5 m). A extensão deve conferir escala e método de medição da cena. A API expõe escala, DPI e cálculo de distância; não assumir que toda grade mede 5 ft. [Grade](https://docs.owlbear.rodeo/extensions/apis/scene/grid/).
- **Automação de salas:** nas referências consultadas, não encontrei base para prometer criação ou encerramento de salas por REST a partir do bot. A primeira etapa deve usar uma sala criada pelo DM.
- **Outras extensões:** não presumir compatibilidade com PV ou iniciativa de terceiros. Investigar seus formatos separadamente e não sobrescrever metadata alheia.

## Plano e critérios de aceite

**1. Link da mesa.** Campo na sessão e botão Abrir tabletop. Validar host oficial e autorização do DM.

**2. Extensão somente de leitura.** Manifest local, pareamento e ficha resumida. Testar que um jogador não acessa a ficha privada de outro, que o acesso expira e que reconectar não duplica vínculos.

**3. Tokens.** Associação e atualização explícita de PV/condições. Testar que apenas o token correto é alterado, na cena correta, preservando metadata de terceiros.

**4. Sincronização contínua.** Eventos de alteração, versões e recuperação de conexão. Testar duas abas, edições concorrentes, revogação de acesso e retorno após queda.

Próximo passo: validar as etapas 1 e 2 dentro de uma sala real com banco e login Discord configurados, antes de implementar vínculos com tokens.
