# Pesquisa do draft e simulação — 2 de novembro de 2026

## Referência pública: 7a0

Na página [Sobre](https://7a0.com.br/sobre), o 7a0 descreve um sorteio de seleção e Copa seguido da escolha de um jogador daquele elenco. As notas são avaliações subjetivas para a Copa específica; um selo identifica lendas. A [FAQ](https://7a0.com.br/faq) descreve orçamento no Desafio do Dia, que é um modo distinto do clássico. Os números de acervo exibidos pelo site variam conforme a página: a página inicial consultada mostra 302 elencos e 7.048 jogadores, enquanto o texto Sobre consultado mostra aproximadamente 250 e 5.700.

O JavaScript público carregado por [play](https://7a0.com.br/play) permite uma observação mais precisa do build consultado, sem inferir compromissos para versões futuras:

- [Chunk 530](https://7a0.com.br/_next/static/chunks/530-e87ac4c69f343dce.js), SHA-256 `0014e5172c119c109041ffcb3a04f7cddcb0a9eaf29fa8f5f2b5c1efaf0922b8`, módulo 9676, aproximadamente caracteres 16659–17600: o sorteio normal calcula a força média do elenco e normaliza linearmente os pesos do conjunto disponível de 0,25 a 1,0. Quando existem alternativas, exclui os pares seleção–Copa recentes; se esgotados, volta ao conjunto inteiro. O peso depende da força média do elenco, não diretamente do selo de lenda.
- [Chunk 2977](https://7a0.com.br/_next/static/chunks/2977-44e5011a6c30781a.js), SHA-256 `1c76ccbd3e7f42dc71dbfa22895faf70bbe3cd5503c958f22a826a69d9438f6d`, aproximadamente caracteres 42322–44000: a lista de recentes conserva os seis últimos pares e é passada ao sorteio; há tratamento separado para uma sequência pré-definida. Aproximadamente caracteres 36000–37500: a interface busca os jogadores do elenco sorteado e aplica critérios de elegibilidade.
- Os mesmos trechos contêm caminhos de reroll e de sequência pré-definida. Não estabelecem garantia de que uma lenda específica aparecerá, nem provam que todos os modos usam a mesma distribuição. O código pode mudar. Nenhuma marca, código ou base de dados do 7a0 foi incorporada ao jogo.

## Comparação atual: uniforme e rules v4

O pool editorial atual de 30 nomes está em `src/content/featured.ts`: 12 G, 12 F e 6 C. É um critério de reconhecimento escolhido editorialmente, independente das notas e sem pesquisa científica de popularidade. A lista atual substitui Kevin McHale por Kevin Garnett e David Robinson por Nikola Jokić.

O sorteio uniforme anterior foi reproduzido localmente no script, com a seed de draft original, sem chamar a função de produção. O v4 chama a função de produção: uma pessoa do pool editorial, mais cinco pessoas uniformes entre as elegíveis restantes, com as seis opções embaralhadas. Todos os atletas exibidos ficam excluídos das rodadas posteriores. Com o pool atual há atletas destacados suficientes para cada rodada.

O cálculo exato para o uniforme resulta em **31,35%** de chance de um destaque em cada rodada G ou F, **31,70%** na rodada C e **85,19%** de pelo menos um destaque ao longo do draft. A chance de haver ao menos um em **todas as cinco rodadas é 0,2716%**: para cada grupo com duas rodadas, aplica-se inclusão-exclusão considerando que os 12 nomes exibidos são distintos. O v4 garante essa oportunidade em todas as rodadas para o pool atual.

A auditoria executou **2.000 torneios por cenário**, totalizando 12.000, com as mesmas seeds `draft-audit-v4-20261102-0` a `-1999`, o catálogo atual e o motor rules v4 em ambos os sorteios. Os sete adversários de cada torneio são escolhidos entre os 12 quintetos históricos, usando seus snapshots. OVR usa os pesos atuais por posição; empates são resolvidos pelo ID. A política aleatória usa gerador de auditoria separado. Tempo medido: 167,5 segundos. Execute `npx tsx scripts/draft-audit.ts 2000`; os resultados completos estão em [draft-audit-v4.json](draft-audit-v4.json).

| Política | Sorteio | Destaques escolhidos, média | Destaques oferecidos nas 5 | Destaques escolhidos nas 5 | OVR p10 / mediana / p90 |
|---|---|---:|---:|---:|---:|
| Maior OVR | Uniforme | 1,12 | 0,20% | 0,00% | 88,20 / 89,40 / 90,40 |
| Maior OVR | Destaque v4 | 3,68 | 100,00% | 19,20% | 89,80 / 90,80 / 91,60 |
| Prefere destaque | Uniforme | 1,57 | 0,20% | 0,20% | 88,00 / 89,20 / 90,20 |
| Prefere destaque | Destaque v4 | 5,00 | 100,00% | 100,00% | 89,00 / 90,20 / 91,40 |
| Aleatória | Uniforme | 0,29 | 0,20% | 0,00% | 82,40 / 84,80 / 87,00 |
| Aleatória | Destaque v4 | 1,06 | 100,00% | 0,05% | 83,20 / 85,60 / 88,00 |

A amostra uniforme registrou 4 de 2.000 drafts com destaque nas cinco ofertas; o cálculo exato acima é mais preciso para essa probabilidade rara. Com preferência por destaque, as cinco escolhas são destacadas sempre que as cinco oportunidades existem.

| Política | Sorteio | Vitórias em jogos de grupo | Classificação | Vitória na semi, se disputada | Presença na final | Título |
|---|---|---:|---:|---:|---:|---:|
| Maior OVR | Uniforme | 86,27% | 94,60% | 86,21% | 81,55% | 68,55% |
| Maior OVR | Destaque v4 | 91,32% | 97,90% | 89,94% | 88,05% | 79,00% |
| Prefere destaque | Uniforme | 85,63% | 94,15% | 84,81% | 79,85% | 66,25% |
| Prefere destaque | Destaque v4 | 89,00% | 96,75% | 87,65% | 84,80% | 74,45% |
| Aleatória | Uniforme | 57,63% | 60,75% | 59,18% | 35,95% | 22,55% |
| Aleatória | Destaque v4 | 63,52% | 68,85% | 67,61% | 46,55% | 30,80% |

Medianas dos seis atributos médios do quinteto:

| Política | Sorteio | Arremesso | Finalização | Criação | Defesa | Rebotes | Atletismo |
|---|---|---:|---:|---:|---:|---:|---:|
| Maior OVR | Uniforme | 85,40 | 93,00 | 86,20 | 89,00 | 79,60 | 91,80 |
| Maior OVR | Destaque v4 | 85,60 | 94,80 | 88,20 | 90,80 | 81,00 | 93,00 |
| Prefere destaque | Uniforme | 85,20 | 92,80 | 86,40 | 88,40 | 79,40 | 91,60 |
| Prefere destaque | Destaque v4 | 84,60 | 94,20 | 88,80 | 89,40 | 80,80 | 92,40 |
| Aleatória | Uniforme | 81,80 | 88,60 | 80,60 | 83,00 | 75,60 | 86,40 |
| Aleatória | Destaque v4 | 82,20 | 89,60 | 82,00 | 83,80 | 76,20 | 87,40 |

O draft com destaque por rodada aumenta a visibilidade e, nestes cenários, a força do quinteto e a taxa de título mesmo sem mudar atributos. Com maior OVR, a mediana sobe de 89,4 para 90,8 e os títulos de 68,55% para 79,00%; com escolha aleatória, os títulos sobem de 22,55% para 30,80%. São simulações condicionadas às políticas e aos snapshots atuais, não previsões de como pessoas reais escolherão. Taxas de título têm erro amostral aproximado de 2 pontos percentuais; probabilidades raras têm incerteza proporcionalmente maior.

## Arquivo: análise anterior com rules v3

Os resultados desta seção usaram a lista editorial anterior, McHale e David Robinson, e uma hipótese que destacava apenas a primeira rodada. Não representam a implementação v4.

### Método

Catálogo v3, 500 jogadores masculinos com passagem pela NBA, distribuídos em 200 G, 200 F e 100 C. O draft atual oferece seis jogadores uniformemente sem reposição por rodada, em G/G/F/F/C, excluindo os jogadores já exibidos. O desempate da simulação é pelo ID.

Para medir reconhecimento usamos uma lista editorial explícita de 30 nomes, não uma pesquisa de popularidade e não um sinônimo de OVR: Jordan, Bryant, Magic Johnson, Curry, Robertson, West, Wade, Iverson, Harden, Nash, Kidd, Stockton; LeBron James, Bird, Durant, Antetokounmpo, Duncan, Nowitzki, Barkley, Pippen, Leonard, Erving, Malone, McHale; Abdul-Jabbar, Chamberlain, Russell, O'Neal, Olajuwon e Robinson. A lista contém 12 G, 12 F e 6 C. Outras listas de estrelas produzem outras taxas.

Sob amostragem uniforme ideal, a probabilidade de ao menos um desses 30 aparecer em uma oferta é **31,35%** para G ou F e **31,70%** para C. Na sequência inteira, respeitando a exclusão das ofertas anteriores, a probabilidade é **85,19%**; portanto, **14,81%** dos drafts não exibem nenhum desses nomes. Uma estrela G específica, como Jordan, aparece em uma das duas rodadas G com probabilidade de **6%**. São probabilidades de exposição, não de escolha. As probabilidades teóricas assumem sorteios independentes entre os grupos.

A versão anterior da auditoria executou 2.000 torneios completos por cenário com seeds fixas `draft-audit-20261102-0` a `-1999`. Em cada rodada, o jogador automático seleciona o maior OVR calculado pelas regras atuais; ele não otimiza sinergia nem reproduz preferências humanas. Cada torneio sorteia sete dos 12 times históricos e usa seus snapshots de temporada, com o motor real de partidas. A comparação usa as mesmas seeds nos dois cenários. Tempo observado: 55,7 s para os dois lotes neste ambiente.

### Resultado anterior

| Medida | Draft atual | Uma estrela na primeira oferta |
|---|---:|---:|
| Drafts com ao menos um nome da lista exibido | 85,15% | 100% |
| Nomes da lista escolhidos por draft, média | 1,11 | 1,53 |
| OVR médio escolhido, p10 / mediana / p90 | 88,2 / 89,4 / 90,4 | 88,4 / 89,6 / 90,6 |
| Vitórias nos jogos de grupo | 86,45% | 86,93% |
| Classificação para semifinal | 93,85% | 94,40% |
| Vitória na semifinal, condicionada a disputá-la | 85,30% | 86,33% |
| Presença na final | 80,05% | 81,50% |
| Título por draft | 67,50% | 69,25% |

O contrafactual é apenas uma hipótese de pesquisa: a primeira oferta G contém um nome sorteado uniformemente da lista e cinco outros G uniformes entre os restantes; as quatro ofertas seguintes seguem as regras existentes, inclusive exclusão de vistos. A garantia vale apenas para esta lista editorial, não para todas as pessoas consideradas estrelas. Não foi implementada no jogo.

No draft atual, os percentis p10 / mediana / p90 da média do quinteto são: arremesso **80,6 / 85,4 / 89,4**; finalização **90,6 / 93,2 / 95,2**; criação **82,2 / 86,2 / 90,2**; defesa **84,4 / 89,0 / 93,0**; rebotes **75,0 / 79,4 / 83,8**; atletismo **88,4 / 91,8 / 94,6**. OVR médio dos 12 quintetos históricos, calculado com os atributos de seus snapshots, varia de **81,0 a 85,2**. OVR é um resumo ponderado por posição; o motor usa os seis atributos, não apenas essa média.

A diferença observada não sustenta aumentar notas para corrigir a presença de estrelas. O jogador automático já monta equipes fortes contra os snapshots atuais. As taxas são estimativas de Monte Carlo, não garantias: 2.000 torneios dão erro amostral aproximado de 2 pontos percentuais para uma proporção próxima de 50%, e os resultados podem mudar com escolha humana, outra definição de reconhecimento, catálogo ou regras.
