# Expansão modular — Desafio DPI Integrado e Desafio do Olhar

Estado: **especificação técnica inicial; não publicada**. Base de trabalho: branch isolada. Não modificar a interface aprovada, os 7 minijogos, o Plantão, o cadastro, o ranking nem o banco original.

## DPI Integrado — do sinal ao diagnóstico
Casos correlacionam sinais clínicos, laboratório, farmacologia/toxicologia, epidemiologia/sanidade, reprodução, cirurgia e diagnóstico por imagem. Espécies: cães, gatos, equinos, bovinos, pequenos ruminantes, suínos, aves, silvestres e exóticos. Cada caso deve exigir uma decisão clínica fundamentada (indicação, modalidade, técnica, achados, diferenciais, limites e próximos passos). Evitar inferir doença apenas de imagem.

## Desafio do Olhar — radiografia e ultrassonografia
Fases: identificar região/projeção ou plano, reconhecer estruturas, localizar e descrever alterações, definir padrão, formular diferenciais e impressão diagnóstica. Incluir estudos normais. Cada imagem precisa de origem, autorização de uso, identificação anonimizada, espécie, modalidade, metadados técnicos e diagnóstico de referência; nunca publicar imagens de pacientes sem autorização adequada.

## Requisitos obrigatórios para publicar um item
- ID estável, modalidade, espécie, dificuldade, pergunta e quatro alternativas.
- Uma única resposta correta sustentada por fonte efetivamente consultada.
- Justificativa de cada alternativa e referência verificável (obra, edição/ano, capítulo/página/seção quando disponíveis).
- Distratores plausíveis e comprimentos variados, sem pistas sistemáticas por extensão.
- Revisão de português e terminologia clínica; revisão veterinária de conteúdo.
- Estado de auditoria **validado**; itens em elaboração/pendentes não entram no jogo.
- No modo imagem: pelo menos uma imagem autorizada e seu diagnóstico de referência.

## Política de bibliografia
O catálogo local documenta 300 questões e 32 grupos de fontes; o total-alvo confirmado pelo usuário é 325. **Não afirmar que as 25 adicionais foram localizadas ou auditadas sem prova.** As oito obras bibliográficas transcritas não equivalem a oito exemplares completos disponíveis localmente. Não inventar páginas, DOI, achados ou imagens. Respeitar direitos autorais e confidencialidade.

## Implementação posterior
Os bancos independentes ficam em `dados/novos-desafios/`. Validar dados antes de renderizar. Integrar por navegação sem alterar a capa aprovada; adicionar somente após validação visual e funcional. Meta inicial proposta: 50 casos integrados + 50 estudos de imagem, sujeitos à disponibilidade de fontes e imagens licenciadas.
