# Five Run — PRD da versão zero

Versão 0.3 • 2 de novembro de 2026 • Responsáveis pelo produto: Felipe e Gabriel

## 1. Visão do produto

Five Run é um jogo casual de basquete no navegador: sorteie lendas, escolha um quinteto e acompanhe um campeonato curto. A experiência deve ser especialmente boa em celulares na vertical, com estética de 16 bits e acabamento moderno. O sorteio é a principal atração; o resultado dá vontade de tentar novamente.

Uma tentativa completa até a final deve durar normalmente de 5 a 10 minutos. Eliminações e uso do botão de acelerar podem encurtar esse tempo. Não usar esperas artificiais para atingir a duração.

Marca aprovada: Five Run. A aprovação do nome não representa verificação de domínio ou disponibilidade de marca.

Assinaturas sugeridas:

- Português: Sorteie lendas. Monte seu quinteto. Conquiste o título.
- Inglês: Draft legends. Build your five. Win the title.

## 2. Decisões e limites

### Decisões consolidadas

- Jogo web, sem instalação e sem cadastro obrigatório.
- Português brasileiro e inglês desde a v0, preparado para novos idiomas.
- Cinco titulares: dois armadores, dois alas e um pivô; sem banco.
- Cinco rodadas de draft. Em cada rodada, três jogadores do mesmo grupo; escolher um.
- Pelo menos 100 atletas distintos: 40 armadores, 40 alas e 20 pivôs.
- Priorizar nomes reconhecíveis e apelo popular, com presença de lendas internacionais.
- Referência editorial de aproximadamente 80 nomes com passagem pela NBA e 20 destaques fora dela. Não é cota rígida nem divisão por nacionalidade.
- Oito equipes, dois grupos de quatro, semifinal e final.
- Eliminação é game over. Nova tentativa começa com novo draft, sem conservar atletas.
- Geral do atleta derivado de seis atributos; simulação usa os atributos diretamente.
- Estética de 16 bits, interface legível e responsiva, destaque visual para o draft.

### Defaults deste PRD

As regras abaixo completam lacunas para viabilizar implementação. São propostas técnicas e de produto, não decisões históricas já aprovadas individualmente: ausência de reroll, probabilidades do sorteio, sorteio dos adversários, desempates, tempos de animação, coeficientes da simulação e arquitetura. Devem ser configuráveis quando fizer sentido; não ampliar escopo para torná-las editáveis pela interface.

### Fora da v0

Multiplayer, login, ranking global, desafio diário, compras, anúncios, banco de reservas, substituições, táticas manuais, controle dos atletas, partidas completas animadas, carreira, temporadas de 82 jogos e múltiplas versões do mesmo jogador. Não é necessário instalar uma PWA ou oferecer jogo totalmente offline.

## 3. Fluxo principal

1. Início: Jogar, Continuar quando houver tentativa em andamento, idioma, som e Como jogar.
2. Tutorial curto, dispensável: sortear três cartas, escolher uma, completar cinco atletas, disputar o título.
3. Draft na ordem G, G, F, F, C.
4. Revisão do quinteto com atributos do conjunto, um ponto forte e uma vulnerabilidade.
5. Três jogos da fase de grupos, com tabela atualizada após cada rodada.
6. Se classificado, semifinal. Vitória leva à final; derrota encerra a tentativa.
7. Final e resultado: campeão ou eliminado, campanha e destaque do time.
8. Compartilhar resultado ou começar nova tentativa.

Estados de domínio: início, draft, revisão, grupos, semifinal, final e encerrado. Recarregar a página deve restaurar o estado salvo, nunca conceder uma nova chance de sortear ou simular o mesmo jogo.

## 4. Draft e catálogo

| Grupo interno | Português | Inglês | Vagas | Atletas mínimos |
|---|---|---|---:|---:|
| G | Armadores | Guards | 2 | 40 |
| F | Alas | Forwards | 2 | 40 |
| C | Pivôs | Centers | 1 | 20 |

Armadores reúne armador e ala-armador. Alas reúne ala e ala-pivô. Cada atleta tem um único grupo principal na v0; sua contagem nunca é duplicada.

### Regras do sorteio

- As três opções de uma rodada são distintas e elegíveis para o grupo da vaga.
- Não oferecer novamente atleta já escolhido. Default: também não repetir cartas descartadas na mesma tentativa, favorecendo variedade.
- Default v0: sorteio uniforme dentro do grupo elegível, sem rerolls. O catálogo já favorece nomes reconhecíveis; ajustar pesos de popularidade apenas após observar sessões de teste.
- Nenhuma raridade ou animação deve sugerir uma probabilidade que o sistema não pratica.
- A seleção de uma carta permite inspecioná-la; um botão explícito confirma a escolha. Depois de confirmar, não há desfazer.
- Bloquear duplo toque e confirmação duplicada.
- Gerar e salvar as três opções antes da animação. Atualizar a página não muda as opções.

### Conteúdo das cartas

Nome, retrato, grupo, país, geral e os seis atributos. O geral fica em destaque; detalhes podem abrir em painel acessível. Mostrar os anos do auge e uma descrição curta no detalhe, sem transformar a seleção em leitura obrigatória.

As três opções devem estar visíveis simultaneamente na largura de um celular de 360 px, sem carrossel. Se seis atributos em três colunas prejudicarem leitura, usar três linhas compactas empilhadas com detalhes expansíveis. Legibilidade tem prioridade sobre o formato de carta colecionável.

## 5. Scout e notas

Uma ficha por jogador representa aproximadamente três temporadas de auge. Não combinar livremente atributos máximos de períodos incompatíveis da carreira. Registrar a janela exata usada e a razão de exceções quando faltarem dados.

| Atributo | Chave | Significado |
|---|---|---|
| Arremesso | shooting | Média e longa distância |
| Finalização | finishing | Pontuação perto da cesta |
| Criação | playmaking | Passes, domínio da bola e oportunidades |
| Defesa | defense | Marcação e proteção da cesta |
| Rebote | rebounding | Recuperação de arremessos errados |
| Atletismo | athleticism | Velocidade, impulsão, força e mobilidade |

Escala inteira de 40 a 99. As notas são editoriais, apoiadas em fontes e comparações; não apresentar como medição científica objetiva. Ausência de dado histórico não equivale a habilidade baixa.

| Atributo | G | F | C |
|---|---:|---:|---:|
| Arremesso | 25% | 25% | 10% |
| Finalização | 15% | 20% | 25% |
| Criação | 30% | 15% | 5% |
| Defesa | 15% | 20% | 25% |
| Rebote | 5% | 10% | 25% |
| Atletismo | 10% | 10% | 10% |

GER/OVR = arredondar a soma de atributo × peso do grupo. Cada coluna soma 100%. O geral é calculado, nunca mantido como um segundo valor manual divergente.

Exemplo fictício de teste: um armador com 90, 80, 95, 75, 50 e 85, na ordem da tabela, tem geral 85. Todos os atributos em 80 produzem geral 80 em qualquer grupo.

### Processo de produção do catálogo

1. Selecionar 100 atletas, respeitando 40/40/20 e priorizando reconhecimento.
2. Definir grupo principal e janela de auge.
3. Registrar fontes de estatísticas e perfil, com URL e data de consulta.
4. Atribuir notas considerando contexto de época e competição. Não comparar diretamente médias brutas entre ligas.
5. Revisar atletas de funções semelhantes e justificar discrepâncias relevantes.
6. Revisar as notas e os nomes com Felipe e Gabriel antes de fechar o catálogo de lançamento.

Manter popularidade separada de capacidade esportiva. Não aumentar notas apenas para produzir um vencedor famoso. Não usar BPM como dependência obrigatória, pois não está disponível de maneira comparável para todo o catálogo mundial.

O catálogo nominal e os 600 atributos individuais ainda precisam ser pesquisados e produzidos. Este PRD define a estrutura; não contém um scout concluído. Protótipos podem usar um conjunto pequeno explicitamente provisório, mas a entrega da v0 exige os 100 registros completos.

## 6. Campeonato

- Sete adversários controlados pelo jogo, cada um com formação G/G/F/F/C.
- Equipes e identidades visuais fictícias; não simular um torneio oficial existente.
- Gerar adversários no começo da tentativa e salvar. Nunca adaptar secretamente sua força aos resultados do usuário.
- Default: atletas únicos dentro de cada equipe; permitir o mesmo atleta em equipes diferentes para simplificar o catálogo da v0.
- Distribuir as oito equipes aleatoriamente em grupos A e B. Cada grupo tem seis partidas ao todo: três rodadas com duas partidas por rodada.
- Todos jogam contra os outros três integrantes do grupo. Simular as outras partidas para a classificação ser consistente.
- Classificação por vitórias, saldo de pontos e pontos marcados, nessa ordem. Persistindo igualdade total, usar ordem de desempate sorteada antes do torneio e salva; explicar esse último critério no regulamento.
- Após as três rodadas, os dois melhores de cada grupo avançam. Não encerrar antecipadamente após uma derrota.
- Semifinais: 1º A × 2º B e 1º B × 2º A. Simular também a semifinal sem o usuário para determinar o finalista.
- Sem disputa de terceiro lugar. Campeão pode ter perdido na fase de grupos.
- Campanha de 5 vitórias e 0 derrotas concede o selo especial Campanha perfeita / Perfect run.
- Toda partida precisa de vencedor: empate após quatro quartos leva a prorrogações.

Os adversários podem ter perfis de arremesso, defesa ou garrafão, mas esses rótulos precisam corresponder aos atributos reais de seus quintetos. Não aplicar bônus ocultos apenas por nome ou perfil.

## 7. Simulação proposta para o protótipo

Objetivo: partidas compreensíveis, resultados variados e vantagem perceptível para elencos melhores. Não reproduzir todas as regras do basquete real.

### Motor e apresentação separados

Uma função pura recebe equipes, seed, versão das regras e configuração; retorna placares por período e eventos. A interface apenas apresenta o resultado. Pular, acelerar, trocar idioma ou recarregar não pode mudar o vencedor.

Usar gerador pseudoaleatório com seed persistida e fluxos independentes para draft, adversários e partidas. Não usar o relógio ou aleatoriedade da animação para calcular resultados.

### Modelo inicial

- Derivar perfis do conjunto a partir das médias dos seis atributos. O geral não entra novamente no cálculo.
- Simular posses alternadas em quatro quartos; ponto de partida de balanceamento: 18 posses por equipe por quarto.
- Em cada posse, sortear perda de bola, tipo de arremesso (2 ou 3 pontos), acerto e eventual rebote ofensivo.
- Criação e atletismo reduzem perdas; defesa adversária aumenta perdas e reduz acertos.
- Arremesso influencia tentativas de três e sua precisão; finalização influencia tentativas de dois; criação melhora oportunidades de ambos.
- Rebote compara os conjuntos para decidir segunda chance. Limitar a duas tentativas adicionais por posse para manter execução finita.
- Para um modelo inicial calibrável, usar diferenças de atributos divididas por 100 em torno de bases de 12% de perda, 50% de acerto de dois, 33% de acerto de três e 25% de rebote ofensivo. Coeficientes e limites ficam em configuração versionada e devem ser documentados na implementação.
- Prorrogação inicial com cinco posses por equipe. Repetir quando empatar; um limite técnico alto deve gerar períodos extras decisivos com ponto de dois, sem possibilidade de empate, mantendo os totais consistentes.
- Sem faltas, lances livres, lesões, fadiga e substituições nesta versão. É uma simplificação de arcade, não um motor oficial.

Essas constantes são hipóteses de partida, não parâmetros já validados. O teste do motor deve verificar se os seis atributos têm efeito útil e se nenhuma combinação domina todos os cenários. Caso surja vantagem estrutural, ajustar coeficientes antes de adicionar regras ou novos atributos.

### Feedback ao jogador

Exibir placar por quarto e no máximo dois ou três destaques por jogo. Mensagens precisam decorrer de eventos ou comparações reais, como volume de cestas de três ou rebotes ofensivos. Não inventar justificativa depois do resultado.

Se houver destaque individual, atribuir as ações a atletas durante a simulação e derivar o destaque dos eventos. Não mostrar pontos individuais que não somam o placar. Um simples líder de pontuação serve para a v0, com desempate estável.

## 8. Direção visual e interação

- Referência visual: fliperama de basquete de 16 bits, com fundo escuro, quadra de madeira, placar eletrônico e cores de destaque.
- Fonte pixel para títulos e placares; fonte de leitura normal para instruções, números pequenos e textos longos.
- Retratos em pixel art com enquadramento, paleta e escala consistentes. Validar um pequeno conjunto de estrelas antes de produzir os 100.
- Produzir arte original. Evitar dependência de fotos, uniformes e logotipos oficiais para implementar a identidade visual.
- Sorteio com suspense curto, revelação clara das três opções e confirmação satisfatória. Default: 1 a 2 segundos por revelação, com modo de movimento reduzido.
- Som de bola, tênis, torcida e efeitos eletrônicos. Habilitar áudio somente após interação e respeitar preferência salva de silêncio.
- Durante partidas, usar quadra estilizada e placar; não desenvolver atletas correndo em quadra.
- Controle de acelerar e avançar ao resultado disponível; animação não pode bloquear navegação necessária.
- Alvos de toque de pelo menos 44 × 44 px, foco visível e navegação por teclado. Não depender só de cor, som ou hover.
- Suportar áreas seguras do celular e zoom de texto sem esconder controles essenciais.

## 9. Telas da v0

| Tela | Conteúdo essencial | Ação principal |
|---|---|---|
| Início | Marca, idioma, som, tutorial, progresso salvo | Jogar ou continuar |
| Draft | Vaga atual, três opções, quinteto parcial | Sortear e confirmar atleta |
| Quinteto | Cinco titulares, geral, força e vulnerabilidade | Iniciar campeonato |
| Campeonato | Próximo adversário, campanha, tabela ou chave | Jogar próxima partida |
| Partida | Placar por quarto, destaques, velocidade | Acompanhar ou acelerar |
| Resultado | Campeão/eliminado, campanha, quinteto e destaque | Jogar novamente ou compartilhar |

Compartilhamento inicial em texto, via mecanismo nativo quando disponível, com alternativa de copiar. Não depender de imagem gerada para concluir a v0. O compartilhamento é sempre acionado pelo usuário.

## 10. Localização

- Locales iniciais: pt-BR e en. Detectar idioma do navegador, oferecer escolha e persistir preferência.
- Qualquer variante de português abre pt-BR; idiomas não suportados usam inglês como fallback.
- Trocar idioma não reinicia a tentativa.
- Traduzir interface, tutorial, grupos, atributos, descrições, mensagens, erros, textos acessíveis e compartilhamento.
- Nomes próprios preservados; informações de países podem ser localizadas.
- Chaves estáveis nos dados: G/F/C e shooting/finishing/playmaking/defense/rebounding/athleticism. Não usar rótulos traduzidos como identificadores.
- Usar mensagens completas com parâmetros e pluralização. Evitar montagem de frases por concatenação.
- Testar textos maiores em ambos os idiomas. Não colocar textos essenciais dentro de imagens.

## 11. Dados e persistência

### Player

id estável; displayName; group; countryCode; careerRegions; nbaExperience; peakStart; peakEnd; seis attributes inteiros; portraitAsset; descriptionKey; sources; scoutNotes; confidence; catalogVersion.

confidence e scoutNotes servem à revisão editorial e não precisam aparecer na interface. Geral é derivado. Fontes devem registrar o que sustentam; não inventar URL ou estatística para completar ficha.

### Run

id; seed; rulesVersion; catalogVersion; status; draftRound; offeredPlayerIds; seenPlayerIds; chosenPlayerIds; opponents; groups; schedule; results; knockout; tiebreakOrder; presentationCursor; createdAt; updatedAt.

### Settings

locale; muted; reducedMotion; simulationSpeed; tutorialSeen; schemaVersion.

Salvar localmente após sorteio, confirmação de carta e cálculo de partida. Salvar resultado completo antes de animar. Retomar apresentação com o mesmo resultado. Não refazer jogos ao recarregar.

Uma tentativa ativa por aparelho/navegador. Iniciar outra durante uma tentativa ativa exige confirmação de abandono. Game over permite nova tentativa sem confirmação redundante. Informar que limpar dados do navegador remove o progresso. Se armazenamento estiver indisponível, permitir jogar e avisar que a tentativa não será recuperável.

Mudanças incompatíveis de regras ou catálogo devem invalidar a tentativa antiga com explicação curta, preservando preferências. Dados corrompidos não podem causar tela em branco.

## 12. Arquitetura e desempenho

Default recomendado: aplicação web em TypeScript, com UI responsiva e motor independente. Se houver repositório existente, respeitar sua stack. Sem necessidade de backend para o ciclo principal da v0.

Separar módulos de domínio, geração aleatória, draft, simulação, torneio, persistência, conteúdo, localização e apresentação. Configurações de pesos e motor não ficam espalhadas em componentes.

Catálogo versionado em dados estáticos. Carregar retratos sob demanda e pré-carregar apenas as próximas opções necessárias. Falha de retrato mostra placeholder consistente e não impede escolher.

Metas iniciais de aceite técnico:

- Sem rolagem horizontal em 360, 390, 430 e 1280 px de largura.
- Fluxo integral no Safari do iPhone e Chrome do Android, além de um navegador desktop.
- Primeira tela interativa em até 3 segundos no perfil de teste móvel de rede 4G; registrar dispositivo e condições da medição.
- Resposta visual de seleção em até 100 ms no dispositivo de referência.
- Não carregar os 100 retratos no primeiro acesso.
- Pausar apresentação e áudio ao sair da aba; restaurar sem mudar resultado.

## 13. Critérios de aceite

1. Catálogo contém ao menos 100 IDs únicos, distribuídos em pelo menos 40 G, 40 F e 20 C, com seis notas válidas, grupo, auge e fontes.
2. Draft entrega três opções distintas e elegíveis por rodada; termina em G/G/F/F/C sem duplicar atleta escolhido.
3. Recarregar durante a revelação mantém as mesmas opções; recarregar durante a partida mantém o resultado.
4. Os pesos de cada grupo somam 100%; cálculo do geral passa pelos exemplos da seção 5.
5. Todas as equipes disputam três jogos de grupo; tabela inclui jogos fora da tela do usuário e desempates reproduzíveis.
6. Semifinais cruzam grupos corretamente; derrota no mata-mata ou eliminação no grupo gera game over.
7. Vitória na final encerra como campeão; 5–0 concede campanha perfeita. Derrota na fase de grupos não impede ser campeão se classificado.
8. Placar final é a soma dos períodos; nenhuma partida termina empatada; estatísticas exibidas conferem com os eventos.
9. Mesmos inputs e seed geram os mesmos resultados. Acelerar, mudar idioma e recarregar não alteram o motor.
10. Em um lote de 10 mil partidas, equipes idênticas devem vencer aproximadamente 50% cada, com tolerância inicial de 47% a 53%. Testar também alternância do lado inicial para detectar viés.
11. Em lotes controlados, aumentar cada atributo isoladamente não deve reduzir a taxa esperada de vitória além da flutuação estatística. Equipes claramente superiores devem apresentar vantagem, sem exigir vitória garantida.
12. Todo o fluxo, erros e compartilhamento funcionam em pt-BR e en, sem chaves cruas ou textos faltando.
13. Dados locais indisponíveis ou inválidos e imagens que falham não impedem começar nova tentativa.
14. Sessões observadas de campanha completa ficam normalmente entre 5 e 10 minutos; testar com Felipe e Gabriel, anotando tempo no draft e na simulação. Tentativas aceleradas não precisam atingir o mínimo.
15. Validar visualmente as telas nos tamanhos definidos, incluindo nomes longos, atributos, foco, áreas seguras e modo sem som/movimento reduzido.

## 14. Ordem de implementação

1. Estrutura: tipos, catálogo provisório claramente identificado, localização e persistência.
2. Draft funcional completo, ainda com arte provisória; testar o prazer de sortear e escolher.
3. Scout do catálogo de 100 e produção de retratos, seguindo padrão validado.
4. Motor determinístico e campeonato completo com testes de invariantes e balanceamento.
5. Acabamento visual, áudio, animações e resultado compartilhável.
6. QA móvel, revisão editorial, testes de duração e ajustes finais.

O primeiro protótipo não é a v0 entregue. A v0 só está pronta com o catálogo mínimo, ciclo completo, dois idiomas e experiência móvel validada.

## 15. Orientação de execução para o Codex

Implementar Five Run conforme este PRD. Inspecionar o projeto e instruções locais antes de escolher dependências. Priorizar o ciclo jogável e o draft; evitar novos modos ou infraestrutura sem necessidade. Manter notas, regras e coeficientes em dados/configuração versionados. Tratar o motor como função testável independente da UI. Não inventar scout histórico nem apresentar placeholders como conteúdo final. Registrar as decisões de implementação e resultados dos testes; sinalizar diferenças relevantes em relação ao PRD.

## 16. Execução com múltiplos modelos

### Papéis e responsabilidade

Diretriz de Felipe: implementação com modelos baratos, Sol como orquestrador e Astra com esforço medium como advisor. É autorizado delegar tarefas de implementação e revisão a subagentes no repositório. Esta seção define o fluxo futuro; não implica que agentes já estejam executando ou que o roteamento esteja configurado.

| Papel | Modelo e esforço propostos | Responsabilidade |
|---|---|---|
| Advisor | Astra, medium | Revisar plano inicial, contratos críticos e decisões difíceis; aconselhar sobre arquitetura e balanceamento |
| Orquestrador | Sol, medium; low em tarefas operacionais | Decompor trabalho, selecionar executor, controlar dependências, revisar diffs, integrar e validar entregas |
| Executor econômico | Modelo de código de menor custo adequado disponível no ambiente | Implementar tarefas delimitadas, escrever testes necessários e corrigir falhas locais |
| Escalada técnica | Sol, medium | Resolver tarefa que ultrapassou a capacidade do executor econômico |

Usar aliases de papel e mapear para os IDs reais disponíveis ao iniciar o projeto. Luna é um candidato para executor econômico se disponível e vantajoso no plano em uso; não assumir que disponibilidade equivale a menor preço. Não contratar APIs, instalar proxies ou introduzir provedores externos automaticamente. Registrar modelo, esforço e limitações reais do ambiente. Se não houver roteamento entre modelos, informar a limitação sem afirmar que houve delegação.

### Entrada pelo Astra Medium

Felipe pode iniciar a sessão com Astra Medium. Seu primeiro trabalho é ler o PRD e o repositório, identificar lacunas materiais e produzir um plano curto com contratos de dados, marcos e riscos. Em seguida, passar a condução ao Sol.

Se a ferramenta permitir troca de modelo principal, preferir Sol como sessão principal e Astra sob demanda. Se o modelo principal não puder ser trocado, Astra delega a execução ao Sol e evita duplicar acompanhamento, revisões e mensagens operacionais. Não manter duas camadas planejando continuamente o mesmo trabalho.

### Ciclo de entrega

1. Sol define interfaces e uma tarefa pequena, com arquivos de responsabilidade, dependências, critérios de aceite e comandos de validação.
2. Executor econômico recebe apenas o contexto relevante e implementa a tarefa, sem alterar escopo ou contratos compartilhados unilateralmente.
3. Executor entrega resumo, arquivos alterados, verificações executadas e riscos restantes. Uma declaração de sucesso não substitui evidência.
4. Sol examina o diff, integra e executa as verificações relevantes. Correções locais voltam ao executor; problemas estruturais são tratados pelo Sol.
5. Astra é consultado quando necessário, recebendo uma pergunta concreta, opções, diff ou evidência de falha. Sua resposta deve recomendar uma decisão e explicar o risco principal.

Usar Astra em dois checkpoints planejados: antes da implementação dos contratos centrais e antes de considerar o motor/campeonato estabilizados. Fora deles, consultar somente diante de ambiguidade importante, falha estrutural ou dúvida de balanceamento que Sol não resolveu. Não exigir aprovação do advisor para cada commit, componente ou tradução.

### Distribuição inicial de trabalho

- Executores econômicos: componentes de UI com especificação visual, catálogos de tradução, adaptação responsiva, serialização, validadores de dados e testes de regras já definidas.
- Sol: contratos de domínio, integração do fluxo, persistência/reidratação, torneio e implementação crítica que não foi resolvida com segurança pelo executor.
- Astra: revisão da arquitetura e das invariantes, avaliação de simplificações do motor, investigação de viés e decisões com impacto em múltiplos módulos.
- Scout: executores podem organizar fontes e fichas; nenhum modelo pode inventar fatos para preencher lacunas. Sol verifica consistência; Felipe e Gabriel fazem a revisão editorial prevista neste PRD.

### Limites de custo e paralelismo

- Começar com até dois executores simultâneos. Paralelizar somente tarefas independentes com arquivos distintos; ampliar apenas se houver trabalho realmente separável.
- Um responsável por arquivo em cada etapa. Mudanças em contratos comuns são coordenadas por Sol antes de os executores prosseguirem.
- Após duas tentativas de correção sem resolver o mesmo bloqueio, parar a repetição, registrar o erro e escalar para Sol. Sol pode consultar Astra com evidências se o bloqueio persistir.
- Não enviar o histórico inteiro a cada executor; fornecer objetivo, trechos pertinentes do PRD, interfaces e arquivos necessários.
- Não repetir testes completos ou revisões de todo o repositório sem nova alteração ou risco que justifique isso.
- Medir custo e retrabalho quando o ambiente expuser métricas. Sem métricas, registrar quantidade de chamadas e escaladas, sem inventar custo monetário.
- Otimizar custo por entrega validada: um modelo barato que exige sucessivas reescritas pode custar mais que uma execução direta com Sol.

### Instrução de início para Astra Medium

> Leia este PRD e as instruções do repositório. Atue inicialmente como advisor e valide um plano curto para a v0, sem ampliar o escopo. Organize a execução com Sol como orquestrador e modelos econômicos como executores, usando apenas os modelos realmente disponíveis. Delegue a condução ao Sol e permaneça como advisor sob demanda. Sol deve implementar por marcos, revisar e integrar as entregas, aplicar os critérios de aceite e escalar bloqueios após duas tentativas de correção. Não use Astra para implementação rotineira. Comece pelo ciclo jogável do draft, preservando a arquitetura necessária para simulação determinística, localização e persistência. Não publique nem configure serviços pagos sem instrução específica. Registre decisões e evidências de validação no repositório.

## 17. Repositório inicial e autonomia do Codex

### Estado inicial

O repositório será público e começará apenas com este documento, no caminho `docs/prd/FIVE-RUN-PRD-v0.md`. Não assumir aplicação, dependências, pipeline, estrutura de pastas ou instruções locais previamente existentes. O PRD é a fonte inicial de requisitos.

Felipe criará o repositório e adicionará o PRD. O Codex será responsável por estruturar e implementar o projeto inteiro, seguindo a divisão de modelos da seção 16. A execução não deve parar após produzir um plano, scaffold ou demonstração parcial.

### Responsabilidades de inicialização

1. Inspecionar o repositório, confirmar seu estado e ler o PRD.
2. Escolher uma stack web simples em TypeScript, adequada ao navegador móvel e à hospedagem estática, e registrar a decisão. A escolha rotineira de framework não exige interromper o trabalho para pedir aprovação.
3. Criar estrutura de código, configuração de desenvolvimento, scripts de build e testes, arquivo de lock, `.gitignore` e README com instruções reproduzíveis.
4. Criar `AGENTS.md` na raiz com os papéis Sol/Astra/executores econômicos, regras de trabalho, comandos de validação e referências ao PRD, respeitando instruções superiores do ambiente.
5. Implementar o fluxo completo, produzir o catálogo pesquisado e os assets necessários, validar e corrigir até cumprir os critérios de aceite. Usar as ferramentas disponíveis para pesquisa e arte; não declarar retratos ou scout concluídos quando forem provisórios.
6. Configurar CI de validação do código no GitHub, com instalação pelo lockfile, verificações estáticas, testes e build. Não incluir deploy automático nesta etapa.
7. Documentar decisões, verificações executadas e qualquer bloqueio externo concreto. Prosseguir nas tarefas independentes enquanto um bloqueio não puder ser resolvido.

Não criar documentação excessiva ou infraestrutura de backend sem necessidade. Manter organização suficiente para outro desenvolvedor executar, testar e continuar o jogo.

### Código público

- Tratar tudo que for commitado, inclusive fixtures, fontes do scout e histórico, como conteúdo público.
- Não incluir credenciais, tokens, arquivos de ambiente reais, logs privados ou dados pessoais dos responsáveis. Quando necessário, fornecer `.env.example` apenas com nomes de variáveis e valores fictícios.
- Usar conteúdo e assets com procedência registrada. Não copiar bases completas, fotografias, fontes ou sprites de terceiros sem verificar as condições de uso e redistribuição. Referências bibliográficas não concedem por si só direito de redistribuir os materiais.
- Registrar a origem dos assets e as atribuições necessárias em `docs/assets.md`. Preferir assets originais ou com permissão explícita de redistribuição.
- Repositório público não significa licença aberta definida. Não escolher uma licença de distribuição do projeto em nome de Felipe; deixar essa decisão registrada como pendente, sem bloquear desenvolvimento.
- Código público e jogo publicado são etapas diferentes. Preparar build estático e instruções de deploy, mas não ativar hospedagem, domínio, serviços pagos ou publicação automática sem solicitação específica.

### Complemento da instrução de início

> O repositório começa apenas com `docs/prd/FIVE-RUN-PRD-v0.md` e é público. Estruture e implemente todo o projeto conforme o PRD; não se limite ao planejamento. Escolha uma stack simples, crie os arquivos de configuração, README, AGENTS.md e CI, e avance por marcos até uma v0 validada. Sol conduz a execução, modelos econômicos implementam tarefas delimitadas e Astra Medium atua como advisor. Preserve a segurança dos arquivos públicos e registre a procedência dos dados e assets. Não configure publicação automática nem escolha a licença do projeto por conta própria. Ao concluir, informe como executar, o que foi validado e quais critérios ainda dependem de avaliação humana ou de recursos indisponíveis.

## 18. Referências de produto

Referências discutidas na pesquisa anterior, para comparação de mecânica, sem copiar interface, marca, arte ou dados:

- 7a0: https://7a0.com.br/
- 82-0: https://www.82-0.com/
- 73-9: https://hoopsmatic.com/73-9-game
- Legacy Run: https://legacyruns.com/how-to-play
- EuroLeague 34-0: https://euroleague-34-0.vercel.app/how-to-play

Posicionamento do Five Run: draft curto com opções visíveis, quinteto de lendas reconhecíveis com alcance mundial, campeonato de até cinco jogos e estética de 16 bits no navegador móvel.
