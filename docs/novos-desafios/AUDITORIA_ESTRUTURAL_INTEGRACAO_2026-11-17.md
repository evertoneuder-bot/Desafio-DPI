# Auditoria estrutural e proteção da integração — 2026-11-17

## Estado de origem
- Branch de trabalho: `preview/recuperacao-isolada-20261117`. Branch original de áudio preservada.
- Histórico geral consultado via busca de commits; a consulta global não retorna o HEAD específico da branch de trabalho. O conteúdo e SHA do arquivo alterado foram consultados imediatamente antes da gravação. Não declarar HEAD global como HEAD da branch.
- Preview de referência visual não modificado; página principal e assets aprovados não alterados.

## Mudança comprovada
- `expansao-dpi/modulos.js` — commit `d0923d6d3aec7fe4854872c823f126b6ba0c99d7`.
- A rota isolada agora tem fluxo de alternativas, correção, justificativa, avanço e contagem de acertos, mas **apenas** para itens com `review_status=validado`, 4 alternativas distintas com justificativas, bibliografia marcada `verified=true` e, nos desafios visuais, imagens com licença, origem, anonimização e diagnóstico de referência.
- Não integrado à capa ou pontuação/ranking oficiais; nenhum deploy realizado.
- Rollback: reverter somente o commit acima ou restaurar blob anterior `f43aeedd0970d2f75627797cac6d80ed59ecf267`.

## Auditoria automatizada de dados
| Banco | Registros | Homologados | Com imagens |
|---|---:|---:|---:|
| DPI Integrado | 40 | 0 | 0 |
| Qual Exame? Qual Projeção? | 50 | 0 | 0 |
| Telerradiologia | 10 | 0 | 0 |
| Desafio do Olhar | 50 | 0 | 0 |
| Total | 150 | 0 | 0 |

- Conferidos IDs únicos dentro de cada banco, presença de quatro alternativas e gabarito que aponta a alternativa existente: nenhuma falha nessas verificações estruturais.
- Diversidade inadequada: DPI Integrado, Qual Exame e Olhar têm somente modalidade RX; Telerradiologia não usa campo `imaging_modality`. Falta US e correlação interdisciplinar real.
- Os 50 desafios visuais são apenas roteiros; não declarar jogáveis.
- Esta verificação **não** equivale a teste em navegador, revisão científica, prova de licença ou auditoria editorial dupla.

## Pendências
1. Localizar e conferir imagens RX/US com licenças de reutilização e diagnósticos de referência.
2. Completar fontes efetivamente consultadas, reescrever distratores óbvios e realizar duas auditorias registradas.
3. Integrar à versão final aprovada após homologação, preservando estética e funcionalidades.
4. Validar áudio, Fernanda 80%, 325 questões originais, Plantão, sete minijogos, mobile e acessibilidade com evidências.
5. Nenhuma liberação pública antes de autorização.
