# Integração da prévia — dez jogos

Data: 17/11/2026

## O que mudou

- `ABRIR-PREVIA-INTEGRADA.html` agora funciona como entrada única para os sete minijogos originais e três desafios adicionais.
- Arena original: Relâmpago, Alvo, Eliminação, Associação, Caça-palavras, Forca clínica e Palavras cruzadas.
- Desafios adicionais: Questões clínicas, Desafio do Olhar e Detetive da Imagem.
- Os desafios adicionais apontam para os arquivos locais do próprio pacote. O Detetive da Imagem foi incluído em `avaliacao/Detetive_da_Imagem_PREVIA.html`.
- Não foram alterados o HTML/CSS da capa original, o arquivo do jogo legado, as artes ou as folhas de estilo aprovadas.

## Verificações concluídas

- Suíte Node: 142 testes aprovados, 0 falhas.
- Verificação automatizada confirma os sete nomes, os três arquivos e os três links do menu integrado.
- Chromium desktop: a página do menu carregou pelo servidor local; a captura mostrou a Arena e os três módulos novos. O clique em “Abrir Arena DPI” formou a rota esperada `dpi-r18.1/ABRA-ESTA-PREVIA.html?mode=start&return=dpi`.
- O fluxo de jogo dentro dessa rota não foi concluído no navegador nesta sessão; a conexão do servidor local foi interrompida durante a navegação.

## Estado de homologação

- A integração nesta cópia de prévia está concluída; não há evidência de publicação desta cópia ou de deploy em produção.
- Questões clínicas usa banco local de demonstração; bancos adicionais precisam estar no pacote para carregar.
- Desafio do Olhar usa três esquemas didáticos, explicitamente identificados como não sendo radiografias/ultrassonografias reais.
- Os módulos novos não compartilham cadastro, pontuação ou ranking com o jogo original.
- Não há validação neural auditiva nesta sessão. O acesso Vercel consultado antes não identificou o deployment do projeto.
- O teste no celular fica deliberadamente para o fim, conforme orientação do usuário; ainda não realizado.

## Integridade da interface aprovada

A alteração foi limitada ao lançador de prévia e à inclusão do arquivo do Detetive. As páginas `dpi-home.html`, `dpi-r18.1/ABRA-ESTA-PREVIA.html` e folhas de estilo do jogo foram mantidas como recebidas no pacote de origem.
