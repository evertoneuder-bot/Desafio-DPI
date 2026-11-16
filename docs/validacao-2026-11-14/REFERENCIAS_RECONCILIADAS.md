# Reconciliação explícita dos testes legados

Alterações exclusivamente em três arquivos de testes e documentação. Nenhum arquivo do produto foi modificado nesta etapa. Os testes não foram removidos, pulados ou marcados como falha esperada.

## Nove expectativas atualizadas

1. Entrada: capa compartilhada em todos os dispositivos, sem fetch/document.write legado; mantém restrições de rewrite.
2. Marca da capa: SVG efetivamente presente no candidato recuperado, em vez do nome de PNG anterior. Mantidas verificações de fundo, mascotes e botão Começar.
3. Roteamento estático: identificação seguida de modeMenu; retorno à capa atual, em acordo com teste dinâmico já executado.
4. Preservação de voz: trecho público say encaminha à voz neural e não chama alternativas nativas/Piper; confirmação atual chama confirmAction('Confirmar resposta?'). Cadastro por e-mail, marcador de pausa, aria-pressed e PDFs continuam verificados.
5. Entrada dinâmica: telefone e desktop preservam query/hash e não iniciam carregador antigo. Mesma propriedade verificada no teste específico da correção de entrada.
6. Arte: Tom/Fernanda em camadas criadas por DPI2DArtwork, em lugar da exigência de img.src e nome Everton. Estilos legados preservados continuam checados.
7. Reação: persona(who) e seletores gerados por persona, em vez de expressão antiga de fallback. Teste dinâmico recuperado motion-lifecycle segue exercitando as reações reais.
8. Isolamento do portal: entrada para capa compartilhada, mantendo proibição de rotas e marcas de outras áreas.
9. Rig: dependência atual do driver/acting-clips e presença dos dois sprites; retirada exigência do arquivo antigo elx-rig.js que não é carregado. Referências externas locais permanecem verificadas.

Essas atualizações comprovam coerência com o candidato recuperado, não aprovação visual humana. A origem foi documentada nas etapas anteriores. Não foi feita alteração visual para produzir testes verdes.

## Resultado fresco

`node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs` — **110 testes, 108 aprovados, 2 falhas**.

Falhas mantidas e não ocultadas:

- `Plantão cranio reaches decision 12 with distinct answers and one submission per decision`: 4 em vez de 12.
- `Plantão pelve reaches decision 12 with distinct answers and one submission per decision`: 9 em vez de 12.

As outras quatro trilhas percorrem 12 decisões. O teste do Plantão utiliza o banco completo de 325, não apenas os 300 originais. Alterar filtros, permitir repetição ou acrescentar conteúdo para essas duas trilhas seria mudança das regras/conteúdo aprovado, fora do ajuste mínimo de voz e movimento. Nenhuma dessas mudanças foi feita.

`git diff --check` passou. Permanecem os limites de acesso ao backend neural, validação auditiva/mobile e favicon original ausente. Não há novo link validado. Sem push, deploy, merge, publicação, produção, DNS ou Vercel alterados.
