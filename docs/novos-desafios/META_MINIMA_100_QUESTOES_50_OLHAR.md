# Meta mínima obrigatória — expansão Desafio DPI / EL-X Vet

Data: 2026-11-17. Branch isolada `preview/recuperacao-isolada-20261117`. Sem deploy ou alteração do layout aprovado.

## Meta de entrega (não confundir meta com produção concluída)

- **100 questões diversas** e jogáveis, cientificamente revisadas. Distribuição editorial mínima proposta: 40 DPI Integrado (raciocínio clínico, exames e espécies), 40 Qual Exame? Qual Projeção? (escolha da modalidade, técnica, posicionamento, US, RX e outros exames quando justificado), 20 Telerradiologia (técnica, qualidade, comunicação, interpretação remota). Não é necessário limitar a quantidade a 100; o banco atual de 50 QP permanece e será revisado, não descartado.
- **50 Desafios do Olhar**, todos com imagem real licenciada, anonimizada quando aplicável, referência diagnóstica, pergunta que dependa da imagem, quatro alternativas e justificativas. Distribuição proposta: 30 RX e 20 US, incluindo estudos normais e alterados; diversificar regiões, espécies e dificuldade.
- Preservar banco original (325+ alegados, contagem a confirmar), Plantão, sete minijogos, quiz, ranking, revisão, vozes e layout aprovado.

## Linha de base comprovada nesta branch

- `dados/novos-desafios/qual-exame-qual-projecao.json`: 50 questões preliminares, não homologadas.
- `dados/novos-desafios/telerradiologia-clinica.json`: 10 questões preliminares, não homologadas.
- `dados/novos-desafios/dpi-integrado.json`: 10 questões preliminares, não homologadas.
- `dados/novos-desafios/desafio-do-olhar.json`: 10 **roteiros condicionais**, todos sem imagens e **não jogáveis**.
- Total atual: **70 questões preliminares + 10 roteiros visuais**, **zero itens novos homologados**.

## Critérios de aceitação

1. Fonte realmente lida, referência rastreável, gabarito único e distratores plausíveis. Separar alegações institucionais da literatura científica.
2. Duas auditorias distintas: conteúdo científico e revisão editorial/pedagógica, registradas por item. Sem apresentar versões intermediárias ao usuário.
3. Desafio do Olhar: arquivo de imagem efetivamente disponível, licença individual conferida, atribuição, anonimização, projeção/plano, região, espécie, achados visíveis e diagnóstico de referência; evitar perguntas respondíveis sem observar a imagem.
4. Cobertura de US e RX, ortopedia, tórax, abdômen, urgências, animais de produção, equinos, felinos, aves e não convencionais conforme fontes disponíveis.
5. Integração reversível na branch isolada, sem alterar layout aprovado, seguida de testes estruturais, funcionais, desktop/mobile e áudio. Não publicar sem autorização.

## Regra de contabilização

Contar em separado: rascunhos, revisados na primeira auditoria, revisados na segunda auditoria, imagens licenciadas, itens jogáveis e integrados. Nunca declarar 50 desafios visuais completos enquanto imagens estiverem ausentes.
