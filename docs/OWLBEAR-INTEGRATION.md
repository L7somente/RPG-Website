# Integração com Owlbear Rodeo

Estudo de viabilidade · 09/09/2026. Pesquisa documental; não houve instalação de extensão nem alteração em salas reais.

A integração é viável por uma extensão conectada ao Ledger. Recomendo começar pelo vínculo entre sessão e sala, seguido de uma ficha resumida dentro do tabletop. A integração ainda não foi implementada.

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

Próximo passo recomendado: um protótipo das etapas 1 e 2 após configurar banco e login Discord locais. Não instalar uma integração aparente sem testar dentro de uma sala real.
