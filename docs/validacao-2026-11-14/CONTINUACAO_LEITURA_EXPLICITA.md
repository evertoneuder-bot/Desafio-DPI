# Continuação — entrada real da leitura explícita

## Falha e causa

O teste anterior de propriedade de narração chamava diretamente `narrateVisibleScreen(true)`, mas a função pública real `dpiReadQuestion` continuava chamando `narrateVisibleScreen()` sem o sinalizador. Quando o roteador está instalado e há uma questão reconhecida, essa chamada retorna vazia para ceder ao observador automático. Isso também silenciava a leitura pública explícita. O wrapper do Plantão possui seu próprio caminho; o problema atinge a delegação à função original em perguntas comuns.

Novo teste executa o trecho verdadeiro de atribuição de `window.dpiReadQuestion` junto à implementação de `narrateVisibleScreen`. Antes: retorna string vazia, teste falha. Após: retorna a pergunta e invoca voz uma vez. Correção de um argumento: `narrateVisibleScreen(true)` somente no leitor público. Observador automático continua cedendo e prompts legados de minijogos continuam funcionando. Não há alteração de layout, banco, regras ou mecanismo de síntese.

## Verificação executada

- `node --test tests/dpi-narration-owner.test.cjs tests/dpi-voice-question-identity.test.cjs tests/dpi-speech-events.test.cjs tests/dpi-preservation.test.cjs`: **42/42 aprovados**.
- `node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs`: **109 testes, 98 aprovados, 11 falhas**, mesmas pendências da execução anterior. Log completo de status/diagnóstico com linhas gigantes de HTML omitidas em `leitura-explicita-full.log`.
- `git diff --check`: sem problemas.

Os 300 itens originais e o CSS/bloco de lógica permanecem iguais às referências verificadas pelos testes. Não se afirma que a correção remove o atraso auditivo de três segundos; o backend neural continua sem acesso funcional para medição.

## Precisão sobre mecanismos de voz

O candidato contém `deviceVoice=read('dpi-device-voice')!=='0'`, portanto a variável de alternativa nativa é habilitada quando a preferência está ausente, contrariando o comentário inline que diz opt-in. Porém o caminho público ativo `say()` encaminha ao servidor configurado ou emite indisponibilidade após consultar status; ele não chama `sayResolved()` nem substitui automaticamente a síntese por voz nativa. O teste antigo que exige `==='1'` conflita com a variável recuperada, mas isso não prova fallback ativo. Nenhuma mudança nessa configuração foi feita. Relatórios anteriores que tratam opt-in como descrição literal da variável devem ser lidos com essa ressalva.

## Pendências mantidas

Nove testes de referência antigos precisam ser reconciliados com a fonte visual/funcional aprovada; não foram removidos nem ajustados apenas para produzir verde. Crânio e pelve continuam limitados a 4 e 9 itens elegíveis. Favicon original ausente. Sem validação nova de áudio real, movimento visual ou celular. Nenhum deploy, merge, push, publicação, produção, DNS ou Vercel alterado.
