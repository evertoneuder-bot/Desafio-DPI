# Relatório de integração e validação do preview DPI
Data: 17/11/2026

## Estado de origem confirmado
- Repositório: `evertoneuder-bot/Desafio-DPI`
- Branch: `codex/diagnostico-audio-dpi-20261111`
- Commit validado antes deste relatório: `aad3c95837ca5e46b07c8cc76c23080d2554016d`
- A capa aprovada e os estilos originais não foram alterados pela integração da prévia.

## Integração disponível
- `ABRIR-PREVIA-INTEGRADA.html` oferece a Arena original e três protótipos adicionais: Questões clínicas, Desafio do Olhar e Detetive da Imagem.
- A página do hub é uma rota separada. A capa original não ganhou controles novos nem teve cores, imagens, posições ou proporções alteradas.
- Os protótipos adicionais continuam independentes do cadastro, pontuação e ranking da Arena.
- O texto das páginas identifica os esquemas gráficos como sintéticos, sem alegar que sejam radiografias ou ultrassonografias reais.

## Testes automatizados
- Comando: `node --test tests/*.test.cjs tests/recovered/*.test.cjs`
- Resultado local: 148 aprovados, 0 falhas.
- GitHub Actions, execução `44034669294`, no commit `aad3c95837ca5e46b07c8cc76c23080d2554016d`: sucesso.
- O check Vercel associado ao commit concluiu com sucesso e indicou a prévia `https://desafio-dpi-veterinario-v40-previe-git-ceb3de-evertoneuder-6390.vercel.app`.

## Testes manuais no desktop
Na prévia acima, o navegador abriu a capa e percorreu o cadastro como visitante, menu, Arena e hub integrado.
- Questões clínicas: carregou o banco offline com 20 questões; uma resposta correta mostrou correção e feedback.
- Desafio do Olhar: exibiu caso RX esquemático; a resposta correta atualizou acertos e justificativa. As imagens são esquemas didáticos.
- Detetive da Imagem: a missão de fissura óssea aceitou a marcação do achado e registrou 100 pontos.
- Arena original: abriram Relâmpago, Alvo, Eliminação, Associação, Caça-palavras, Forca clínica, Palavras cruzadas e Feche o Diagnóstico. Foram exercitadas respostas/associações em mais de um modo.
- A execução completa das rodadas de todos os modos não foi feita.

## Pendências comprovadas
1. **Contagem:** o hub anuncia sete jogos originais; na Arena existem sete cartões, mas o cartão de palavras abre Caça-palavras e Forca clínica, e também há Feche o Diagnóstico. Portanto, os modos acionáveis observados na Arena são oito. O escopo “dez jogos” precisa ser reconciliado sem remover um modo já existente.
2. **Navegação:** o hub é acessível pela rota direta, mas ainda não está ligado a um controle da navegação principal. A integração testada funciona como prévia independente.
3. **Questões e fontes:** a demonstração de 20 questões está marcada como preliminar. A bibliografia apresentada é geral, não uma referência individual auditável em cada item. Os bancos remotos não foram validados nesta execução.
4. **Imagens:** os dois jogos visuais usam esquemas sintéticos. Não foram inseridas imagens extraídas de livros/PDFs ou prontuários; é necessário confirmar licença e anonimização antes de redistribuir imagens reais no repositório/prévia.
5. **Voz:** a execução no browser não comprova a voz neural aprovada nem sua latência/volume real.
6. **Celular:** teste deliberadamente reservado para a etapa final, conforme instrução do usuário.
7. **Vercel API:** a API conectada lista o time `evertoneuder-6390`, mas retorna zero projetos e 404 ao consultar o projeto histórico. Ainda assim, o check oficial do GitHub forneceu uma prévia funcional, testada no desktop. A gestão do projeto pelas ferramentas Vercel continua sem acesso verificável.

## Segurança de publicação
Nenhuma promoção ou alteração de produção foi feita nesta execução. Não foram adicionados ao repositório PDFs, imagens de pacientes, credenciais ou arquivos privados.
