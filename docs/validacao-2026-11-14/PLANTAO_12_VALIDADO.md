# Plantão — complemento autorizado e regressão local

## Escopo e decisão

Após a proposta de completar as trilhas curtas com questões gerais pertinentes já existentes e a resposta “Continue”, aplicado o complemento exclusivamente em crânio e pelve. Não foram criadas questões, repetidas respostas nem alterados layout, pontuação, temporização ou regras de revisão. As 325 questões continuam no banco ativo.

`casePoolForTrack` mantém primeiro todas as respostas temáticas distintas selecionadas pelo filtro existente. Somente quando há uma trilha não vazia de crânio/pelve com menos de 12, acrescenta itens até 12, recusando repetição da resposta normalizada e do enunciado. Não cria uma trilha temática vazia. As outras quatro trilhas retornam exatamente a seleção anterior.

Lista restrita de complementos existentes, na ordem de prioridade: DPI-VET-001 (estabilização antes da imagem); 271 (sedação individualizada); 273 (analgesia); 220 (colimação); 221 (lateralidade); 222 (movimento); 237 (descrição/interpretação no laudo); 239 (limitações técnicas). São fundamentos transversais usados no jogo, não novas prescrições ou questões anatômicas inventadas. Crânio recebe oito complementos; pelve, três. Registros inativos não são usados no complemento.

## Testes

Dois testes novos de preservação temática/complemento falharam antes da implementação com 4 e 9 em vez de 12, e passaram depois. Exercitam 20 rodadas de cada trilha: 12 decisões, 12 respostas distintas, manutenção de todas as respostas temáticas e somente IDs de complemento permitidos. O primeiro rascunho desses testes foi corrigido antes de validar o vermelho, pois referenciava um helper não exportado; o vermelho confirmado foi a diferença de contagem.

Os testes de progressão percorrem as seis trilhas completas, confirmam respostas, recusam duplo envio, verificam timer e conclusão. Mantido teste de mensagens em bancos artificiais incompletos, agora removendo os complementos do fixture para continuar verificando a contagem real nas situações de conteúdo insuficiente. Novo teste comprova seleção idêntica nas outras quatro trilhas e ausência de preenchimento de tema vazio.

Comando: `node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs`.

**Resultado: 114 testes, 114 aprovados, zero falhas.**

Banco-base e suas 25 adições, CSS e demais lógica permanecem preservados. O teste de hash do bloco normaliza somente as duas exceções documentadas: a mensagem de contagem real e a função casePoolForTrack alterada. A função anterior está explicitamente incorporada à normalização; o resto continua com o hash anterior. Os novos testes verificam a seleção nova.

`git diff --check` passou.

## Limites de conclusão

Esta aprovação é dos testes locais automatizados. Não equivale a validação visual, auditiva ou de cadastro remoto. A latência de três segundos exige execução com o backend neural acessível e medição de janela → requisição → áudio pronto → reprodução. O bloqueio externo anterior permanece; nenhum novo resultado auditivo foi inventado. O favicon original ausente continua registrado como pendência fora da suíte.

Não há novo link mobile validado. Não houve push, deploy, merge, publicação ou alteração em produção, DNS ou Vercel. Trabalho restrito à branch `codex/diagnostico-audio-dpi-20261111`.
