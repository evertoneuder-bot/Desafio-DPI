# Avaliação preliminar — integração reversível

Branch: `preview/recuperacao-isolada-20261117`
Commit do módulo interativo: `6be7b173d7f6f6a976f43d9332fc1ddeaa3d4870`.

## Arquivos e acesso após deploy da branch
- `/expansao-dpi/index.html?avaliacao=preliminar` — visualização preliminar, com perguntas ainda não homologadas e resultado isolado da sessão.
- `/expansao-dpi/index.html` — modo seguro: somente itens `review_status=validado` e, para imagem, com direitos e metadados comprovados.
- `/dpi-home.html` — capa aprovada, **inalterada**.

## Integração realizada
- Leitura assíncrona dos quatro bancos JSON independentes.
- Renderização de pergunta e quatro alternativas, feedback após resposta, avanço e contador de acertos.
- Validação estrutural antes de disponibilizar uma pergunta.
- Bloqueio de imagens ausentes/não licenciadas.
- Pontuação de sessão local ao módulo, sem persistência nem interferência no ranking oficial.

## Limitações importantes
- Ainda não é a integração definitiva com o motor original do Desafio DPI.
- Os 100 itens são rascunhos e alguns podem ser descartados na auditoria científica; não apresentar como conteúdo homologado.
- Os 50 roteiros do Desafio do Olhar permanecem sem imagens licenciadas e não são jogáveis.
- Correções de voz neural, escala e animação dos personagens **não foram validadas nesta rodada**.
- A ferramenta Vercel retornou lista vazia de projetos para a conexão atual. **Não houve deploy nem URL de Preview comprovada.**
- Sem teste de execução no navegador, celular ou áudio. Não afirmar conclusão.

## Próximo passo para disponibilização
Identificar o projeto Vercel correto e sua conexão Git, fazer deploy **Preview apenas** da branch isolada (sem produção), verificar recursos JSON/JS HTTP 200 e fluxos no navegador, incluindo mobile. Caso não haja acesso ao projeto correto, solicitar conexão específica sem alterar DNS ou criar novo projeto arbitrário.
