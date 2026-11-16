# Plantão — causa comprovada e resumo corrigido

Percorrido o banco completo de 325. Comparar seleção por tema/subtema com tema/subtema/pergunta não revela itens adicionais de crânio ou pelve ignorados pelo filtro. Crânio tem 8 registros temáticos e 4 respostas distintas; pelve tem 17 registros temáticos e 9 respostas distintas. `casePoolForTrack` deduplica por resposta normalizada e `caseStart` usa `Math.min(12,pool.length)`. O comportamento existente anuncia “até 12” na seleção.

Portanto, o requisito adicional de exatamente 12 perguntas temáticas distintas por trilha não pode ser atendido somente corrigindo um filtro, com o conteúdo atual e a regra de não repetir respostas. Não foram relaxados os testes que exigem 12 nem as regras existentes. Para chegar a 12 em ambas as trilhas, será preciso uma decisão editorial: acrescentar questões revisadas ou permitir complementar as rodadas com questões gerais pertinentes. Não foi feita essa ampliação silenciosamente.

Defeito corrigido nesta execução: `caseFinish` afirmava sempre “Você concluiu as 12 decisões”, mesmo nas rodadas de 4 ou 9. Agora a mensagem usa `_caseDeck.length`. Nenhuma mudança de estilo, posição ou elemento; apenas a contagem textual correta. O novo teste executa até o fim as duas rodadas curtas e exige os números reais; falhou antes e passou após a alteração.

O teste de hash do bloco de lógica mantém a referência anterior normalizando exclusivamente essa substituição de texto. Todas as demais partes do bloco continuam protegidas pelo mesmo hash; o teste dedicado verifica a nova contagem. Banco de 325 e CSS permanecem intactos.

Regressão executada: `node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs`: **111 testes, 109 aprovados, 2 falhas**, ainda as exigências de 12 questões para crânio e pelve. São impedimentos de conteúdo/regra, não falhas escondidas por exclusão de testes. Log em `plantao-resumo-real.log`.

Também permanece o bloqueio externo de validação da voz neural: não há acesso funcional ao backend na conexão disponível. Os testes locais não substituem medição auditiva ou validação no celular. Sem novo link, publicação, push, deploy, merge, DNS ou alterações em Vercel/produção.
