# Auditoria estrutural dos bancos independentes — 2026-11-17

Escopo: branch `preview/recuperacao-isolada-20261117`; leitura direta dos quatro JSON de `dados/novos-desafios`. Esta auditoria **não** substitui revisão científica, editorial, autorização de imagens nem teste do navegador. Não altera gabaritos ou status.

| Banco | Registros | IDs únicos | Perguntas repetidas (ocorrências após a primeira) | Gabarito na alternativa estritamente mais longa | Empates de maior comprimento |
|---|---:|---:|---:|---:|---:|
| DPI Integrado | 40 | 40 | 1 | 32 | 2 |
| Qual Exame? Qual Projeção? | 50 | 50 | 10 | 8 | 7 |
| Telerradiologia clínica | 10 | 10 | 0 | 0 | 0 |
| Desafio do Olhar | 50 | 50 | 10 | 17 | 16 |
| **Total** | **150** | **150 dentro dos bancos** | **21** | **57** | **25** |

Método: normalização de pergunta com `trim().toLowerCase()` dentro de cada banco; comparação de comprimentos JS `text.length` nas quatro alternativas. Uma resposta correta é marcada como a mais longa somente quando seu comprimento é estritamente maior que os outros três. Empates foram excluídos da contagem. Esse é um sinal de viés de formato, não prova de que a resposta seja dedutível, e não autoriza alterar respostas científicas sem conferência.

**Risco prioritário:** no DPI Integrado, 32 de 40 gabaritos coincidem com a alternativa mais longa. Evitar liberação como conteúdo validado até reescrita dos distratores e duas revisões científicas independentes. Todos os 40 itens do DPI Integrado estão em estado preliminar; os 50 itens do Desafio do Olhar estão bloqueados por ausência de imagem autorizada. Os 50 itens de Qual Exame? Qual Projeção? distribuem-se entre 13 pendentes de revisão editorial, 8 confrontados aguardando segunda auditoria, 12 requerendo aprofundamento clínico e 17 requerendo reescrita. Os 10 de telerradiologia aguardam dupla auditoria. Não contar esses registros como homologados.

**Cobertura:** DPI Integrado contém 40 registros classificados RX e nenhum US identificado no campo `imaging_modality`; Qual Exame? Qual Projeção? contém 50 RX; Desafio do Olhar contém 50 RX. A ausência de US nesses bancos é uma lacuna objetiva frente ao escopo multiespécies e multimodalidade.

**Reprodução:** para cada `cases`, contar `new Set(cases.map(c=>c.id)).size`; normalizar `question` com `trim().toLowerCase()` e contar repetições; comparar `alternatives.map(a=>a.text.length)` com `correct_id`. Não confundir registros existentes com questões cientificamente aprovadas.

**Rollback:** excluir apenas este relatório em commit reversível; nenhum arquivo de jogo ou banco foi modificado nesta auditoria.
