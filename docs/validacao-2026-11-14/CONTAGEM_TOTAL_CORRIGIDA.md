# Retificação — banco completo de 325 questões

O jogo atual executa **325 questões únicas e ativas: 300 da base inline + 25 adicionais**, sem rejeições ou duplicatas na montagem. Referir-se apenas a “300 questões preservadas” nas respostas anteriores foi incompleto: esse era o teste de integridade da base, não a contagem total. Nenhuma das 25 adicionais foi removida.

Verificações de 14/11/2026:

- Executada em VM a montagem verdadeira de `DPI_BANCO_EXPANDIDO`, `BANK` e `DPI_BANK_STATS`, com os dois scripts de extensão reais e na ordem declarada pelo HTML.
- Estatísticas: base 300; adicionais aceitas 25; rejeitadas 0; duplicadas 0; total 325; IDs únicos 325; registros não inativos 325.
- `banco-dpi-adicional.js` e `dpi-bank-extension.js` continuam byte a byte iguais aos arquivos em `42f5ae4`. Hash do adicional: `ea1f3e77ccee29f76c839953afdf6804be8d31ba5b3f64007c49d543f7fbeef1`.
- Inventariados 14 arquivos de bancos/runtime nos workspaces conhecidos e quatro revisões Git acessíveis do adicional: todos os runtimes contáveis têm base 300; todos os adicionais encontrados têm 25; JSON histórico tem 300. Evidência individual em `AUDITORIA_CONTAGEM_BANCOS.json`.
- Remoto novamente conferido: `7a2caf9b8b4179afad312f54b5324a8136d659dd`. Nenhum commit novo na branch solicitada.

Não foi encontrado banco posterior com mais de 325 nesses arquivos/histórico acessíveis. Essa conclusão é limitada às fontes examinadas; não comprova ausência de versões em conversas, serviços ou arquivos não acessíveis. Questões documentais da biblioteca não foram somadas ao banco executado.

Teste novo em `tests/dpi-preservation.test.cjs` protege a montagem completa e a contagem das 325, além do hash já existente dos 300 itens base. Cinco testes de preservação passaram. Regressão completa: `node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs` — **110 testes: 99 aprovados, 11 falhas**, mesmas pendências anteriores.

A validação anterior das trilhas do Plantão já usava BANK expandido (325), portanto suas limitações de crânio/pelve não eram causadas pela omissão das 25 adicionais no teste. Não houve mudança de conteúdo, visual, áudio ou regra nesta retificação. Sem publicação, push, deploy, merge ou alterações de produção.
