# Desafio DPI / EL-X Vet — validação técnica de 14/11/2026

Estado: correções de sincronização verificadas em testes de lógica; validação completa bloqueada. Não aprovado para publicação.

## Continuidade e isolamento

Repositório: evertoneuder-bot/Desafio-DPI.
Branch única de trabalho: `codex/diagnostico-audio-dpi-20261111`.
Referência remota conferida antes das mudanças: `42f5ae404932401644b49d7da1f0c0a17009abf1`, sem commits posteriores naquele momento.
Lidos o diagnóstico existente e os testes de cancelamento, sobreposição, identidade e instrumentação. As proteções desktop já concluídas foram preservadas.

Commit local da correção: `b1c3e9d` (`fix: serialize narration ownership and reject stale speech events`). O commit seguinte contém este registro, os logs e os testes de aceitação do Plantão. Consulte `git log` para seu SHA, sem criar referências autorreferentes neste documento.

Nenhum push, deploy, merge, alteração de produção, DNS ou Vercel. O status GitHub do commit remoto informa integração `Vercel: success` com o projeto `desafio-dpi-veterinario-v40-preview`; por isso não se moveu a branch remota, evitando disparar implantação automática. Commits e bundle disponíveis para revisão e continuidade local.

## 1. Mecanismos de voz e atraso

| Entrada / modo | Mecanismo comprovado pelo código | Observações |
| --- | --- | --- |
| Desktop/tablet pela raiz, telas acima de 600 px | Concatenação de `game/part01.txt` a `part08.txt`; `SpeechSynthesisUtterance` e `speechSynthesis.speak` | `lang=pt-BR`, voz padrão do aparelho; não usa `/api/tts` nem o roteador mobile. A instrumentação desktop existente foi mantida. |
| Quiz, Plantão e rodadas na prévia mobile | `ELXAssistentes`: `/api/audio-status`, depois `/api/tts` se a persona estiver configurada | O backend usa ElevenLabs. A seleção de persona é preservada. |
| Mesmos modos mobile, quando habilitada a voz do aparelho e o servidor não está disponível | `SpeechSynthesisUtterance`, seleção de voz pt-BR por preferências/persona | Fallback depende da opção existente do usuário. Não foi habilitado automaticamente. |
| Apresentações aprovadas de Everton/Tom e Fernanda | Elementos de áudio `voiceEverton` / `voiceFernanda` | Gravações existentes, preservadas. Não equivalem à síntese das perguntas. |
| Minijogos de palavras e demais telas mobile | Mesmo assistente; observador inline permanece para textos que o roteador não reconhece | Teste impede a correção de desativar a narração desses textos. |

Fatores demonstrados no código:

- O roteador detecta mudanças com 32 ms de coalescência e verifica estabilidade após 180 ms. Não há nele espera fixa de três segundos.
- Um segundo observador inline agenda leitura após 520 ms. Antes da correção, também tentava narrar perguntas e explicações já assumidas pelo roteador. As chamadas competiam e podiam cancelar/reiniciar a síntese. Reproduzido em teste antes da correção.
- A verificação de disponibilidade neural pode aguardar até 2.500 ms. Quando o status permanece nulo, novas falas podem repetir a verificação. Não se alterou essa política sem medidas reais.
- O endpoint consulta créditos, aguarda os cabeçalhos de síntese e recebe o áudio integral antes de responder. A instrumentação existente separa essas parcelas em `Server-Timing`.
- No desktop, a demora entre chamada e `onstart` depende da síntese do navegador/aparelho; não se atribuiu a ele o comportamento do backend neural.

**Não foi demonstrado qual desses fatores explica os aproximadamente três segundos relatados, nem que o atraso auditivo desapareceu.** Não houve chamada paga ao provedor ou medição de áudio real. O que foi corrigido é a disputa de narradores comprovada, não uma latência presumida do provedor.

## 2. Correções mínimas

- O observador inline cede perguntas e resultados reconhecidos ao roteador. O leitor explícito permanece disponível; prompts de minijogos não reconhecidos pelo roteador conservam a leitura automática.
- Eventos do assistente incluem `speechId` da geração e partem do documento com propagação até a janela, alcançando tanto os consumidores de legendas quanto os de mascotes.
- Uma guarda instalada antes dos consumidores recusa início antigo/repetido, progresso antigo e término/pausa de outra fala. Eventos legados sem identidade são recusados quando o assistente é proprietário do áudio.
- Observadores legados das gravações deixam de mudar a persona diretamente quando o assistente já é proprietário da reprodução.
- Cancelamento e pausa informam a identidade da fala encerrada, anterior ao incremento da geração.
- Um `SpeechSynthesisUtterance` já concluído não pode voltar a iniciar animação nem executar sua conclusão duas vezes.
- Legendas apresentam a frase completa no evento de reprodução, removendo duas velocidades artificiais de digitação (18/24 ms por caractere), que não acompanhavam a voz. Não há alinhamento palavra a palavra alegado.
- Pausa encerra o estado de fala das legendas e do módulo de movimento.

Nenhuma alteração em CSS, cores, fontes, imagens, botões, posições, proporções, banco ou regras de pontuação. Arquivos desktop intactos. O nome técnico existente `Everton`/`male` foi preservado.

## 3. Plantão

Simulação Node/VM das funções reais, com DOM e relógio substituídos; não é teste visual nem navegação real.

| Tema | Perguntas distintas disponíveis após filtro e deduplicação | Resultado do percurso de 12 decisões |
| --- | ---: | --- |
| Crânio | 4 | Falha de aceitação: termina antes de 12 |
| Pelve | 9 | Falha de aceitação: termina antes de 12 |
| Membros | 20 | Passou com 12 respostas distintas |
| Respiratório | 19 | Passou com 12 respostas distintas |
| Reprodutivo | 12 | Passou com 12 respostas distintas |
| Misto | 29 | Passou com 12 respostas distintas |

Também passaram: uma submissão por decisão, limite de 120 segundos, timeout sem avanço duplo, término com vitalidade zero e identificação da resposta pelo texto após reordenação.

Pendências existentes: `caseStageForQuestion` classifica a fase por palavras da questão, portanto 12 decisões não garantem passagem cronológica pelas 12 fases diferentes. Além disso, `caseFinish` anuncia 12 decisões mesmo em rodadas menores. Não se alterou o conteúdo clínico nem se completaram temas com questões de outro assunto. Faltam pelo menos oito respostas distintas adequadas para crânio e três para pelve; mapear as fases requer revisão editorial clínica, não apenas aumentar a quantidade.

## 4. Regressão e preservação

Comandos executados na raiz do checkout:

```sh
node --test tests/*.test.cjs
node --test tests/dpi-speech-events.test.cjs tests/dpi-narration-owner.test.cjs tests/dpi-preservation.test.cjs
node --test tests/dpi-plantao-progression.test.cjs
node --check dpi-r18.1/voz-e-mascotes/dpi-speech-events.js
node --check dpi-r18.1/voz-e-mascotes/dpi-launch-router.js
node --check dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js
git diff --check
```

- Baseline exportado de `42f5ae4` e executado separadamente: **63 testes, 57 aprovados, 6 falhas**.
- Estado corrigido com novos testes: **85 testes, 77 aprovados, 8 falhas**.
- Áudio, propriedade da narração e preservação novos: **14/14 aprovados**.
- Plantão: **6/8 aprovados**, com duas falhas de aceitação que expõem limitações já existentes do banco.
- Nenhum dos 57 testes que passavam no baseline passou a falhar.
- Conferência de sintaxe dos três módulos alterados, compilação dos scripts inline e `git diff --check`: passaram.
- SHA-256 confirma as 300 questões originais byte a byte, todos os blocos de estilo inline e o bloco de lógica que contém modos, pontuação, revisão, cadastro, ranking e minijogos legados. O banco continua com 325 registros (300 originais + 25 adicionais).
- As folhas CSS, imagens, dados adicionais, motor de rodadas e `dpi-game-rounds.js` não foram alterados. Isso comprova preservação do código; não substitui regressão funcional integral de todos os modos.

Seis falhas preexistentes mantidas explicitamente:

1. `a capa aprovada mantém logo original e mascotes, usa fundo radiográfico real e não antecipa jogos` — teste espera dois elementos que não encontra no baseline.
2. `o roteador pede cadastro no início, segue ao menu do jogo e devolve recursos informativos à capa` — expectativa textual de `afterReg = home` diverge do baseline.
3. `a rota start configura a identificação e a rota de recurso abre a função apropriada` — espera `home`, recebe `modeMenu` também no baseline.
4. `as correções preservam áudio aprovado, cadastro por e-mail, questões e PDFs em nova aba` — primeira divergência é o texto esperado `Confirmar esta resposta`, ausente no baseline.
5. `a biblioteca entregue é clínica veterinária e preserva o banco editorial DPI` — arquivos esperados não existem nessa árvore, começando por `CATALOGO-BIBLIOTECA-DPI.md`.
6. `imagens externas do jogo apontam a arquivos presentes e o rig só carrega mascotes DPI` — espera `elx-rig.js`, ausente nessa árvore.

Os testes antigos não foram relaxados nem removidos para produzir aprovação artificial. Logs completos neste diretório.

## 5. Bloqueios e próximo passo preciso

1. Playwright foi localizado, mas seu Chromium empacotado não está instalado. A tentativa com `/usr/bin/chromium` falhou antes de abrir a aplicação: `socket() failed: Operation not permitted` em `process_singleton_posix.cc`. Nenhuma tela ou áudio foi observado. Não houve teste mobile, comparação de screenshots ou medição auditiva válida.
2. Para concluir a latência, executar a candidata em navegador permitido, sem publicação, e correlacionar três perguntas consecutivas com `__dpiDesktopSpeechTiming` na rota desktop ou `__dpiAudioDiagnostics` e `Server-Timing` na rota neural. Não repetir a investigação de rotas já documentada.
3. Para aceitar 12 fases por tema, revisar o banco/filtro e o mapeamento de fases com conteúdo clínico apropriado. Os testes de crânio/pelve continuam vermelhos de propósito para expor a exigência não atendida.
4. Antes de atualizar a branch remota, definir explicitamente como evitar ou autorizar o disparo da integração Vercel já detectada. Nenhuma configuração dessa integração foi consultada ou modificada além da leitura do status GitHub.

## Retorno e continuidade

As alterações estão em commits locais descendentes diretos de `42f5ae4`, na mesma branch solicitada. Para revisar: `git diff 42f5ae4..HEAD`. Para desfazer somente o commit de código em uma cópia limpa: `git revert b1c3e9d`. Não executar reset destrutivo ou publicar o pacote para testar.


## Retomada — tentativa de superar o bloqueio do navegador

Após solicitação expressa para superar o bloqueio, foi utilizado o desktop disponível, sem alterar permissões ou configurações de segurança. O terminal do desktop confirmou o início de um servidor Python vinculado somente a `127.0.0.1:8124`. Isso confirma o início do processo; não comprova que a candidata foi carregada.

A primeira navegação do navegador gerenciado para o servidor anterior, na porta 8123, retornou `net::ERR_CONNECTION_REFUSED`. Após iniciar o servidor pelo desktop, a aquisição da aba e tentativa de navegação foram recusadas pela camada de política do navegador, antes de qualquer observação da aplicação. A resposta foi: `Browser Use rejected this action due to browser security policy`, acrescentando que não havia autoridade para observar a página e proibindo alternativas por execução indireta, CDP ou outras superfícies de navegador.

A tentativa foi encerrada nesse limite. Nenhuma política foi enfraquecida ou contornada. Não houve captura da aplicação, confirmação visual, áudio observado, publicação ou atualização da branch remota. Os resultados anteriores de testes de lógica permanecem válidos, mas não substituem essa validação. A continuação requer um ambiente com acesso de navegador permitido à candidata local; autorização conversacional não remove a política da ferramenta.
