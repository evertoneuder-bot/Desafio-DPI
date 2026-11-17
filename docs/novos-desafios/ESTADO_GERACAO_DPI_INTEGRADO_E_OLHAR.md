# Estado de geração dos módulos — 2026-11-17

Branch isolada: `preview/recuperacao-isolada-20261117`.

## DPI Integrado
10 casos preliminares: INT-001 a INT-010. Abrangência atual: cães e equinos, ortopedia, radiografia, doenças metabólicas, distúrbios de desenvolvimento e navicular. Fontes lidas: Thrall 6ª ed., capítulo 14, PDF pp. 557–559, capítulo 15, pp. 600–603, capítulo 24, pp. 1010–1012. Ainda **não** há cobertura suficiente de US, cirurgia, farmacologia, epidemiologia, reprodução, animais de produção e silvestres. Distratores precisam de revisão científica/editorial e confronto independente.

## Desafio do Olhar
5 roteiros condicionais: OLH-001 a OLH-005. Cada um tem quatro alternativas e proposta de achado visual, mas `images: []` e `review_status: bloqueado_sem_imagem_autorizada`. Nenhum está apto para exibição. As figuras dos livros são protegidas por direitos autorais e **não podem ser reproduzidas automaticamente** no jogo. É necessário encontrar imagens de acervo próprio com autorização comprovada, anonimização e diagnóstico de referência, ou imagens com licença compatível; revalidar gabarito contra imagem efetivamente escolhida.

## Integridade
- Nenhum banco original substituído; nenhum layout alterado; nenhuma implantação.
- Total de novos conteúdos: 50 itens de Qual Exame?, 10 de Telerradiologia, 10 de DPI Integrado e 5 roteiros não jogáveis do Desafio do Olhar = 75 registros, dos quais 5 são apenas roteiros.
- Todos pendentes de auditorias científicas completas. O total do banco original (325+) ainda requer conferência no código efetivo.

## Próximas ações sem publicação
1. Consultar literatura adicional de ultrassonografia, clínica médica, urgências e epidemiologia antes de criar casos interdisciplinares nessas áreas.
2. Buscar acervo de imagens com origem, licença, anonimização e laudo/diagnóstico de referência.
3. Substituir distratores fracos, realizar duas auditorias independentes por questão, testar JSON e integração.
4. Submeter ao usuário apenas a entrega final consolidada, não avaliações intermediárias.
