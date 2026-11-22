# Auditoria editorial direcionada — 22/11/2026

Base: branch `preview/recuperacao-isolada-20261117`, HEAD `62f70319eb42cc989814e7fa2094c0931785b392`. Inspeção direta dos JSONs, **sem execução do jogo ou testes automatizados**. Não há homologação científica nem conferência de PDFs nesta rodada.

## Qual Exame? Qual Projeção? (50 registros)

Blob original: `e84a7448623818a3f1610f056d43cdbd4e8a7cf0`. Cinco grupos de perguntas textualmente repetidas (15 registros; 10 ocorrências além da primeira):

- Laterolateral: QP-RX-FEI-031, 033, 043. Mesmo enunciado e resposta textual, apesar de posições A/C/A.
- Ventrodorsal: QP-RX-FEI-032, 034, 044. Mesmo enunciado e resposta textual, posições D/B/D.
- Mediolateral: QP-RX-FEI-036, 038, 040, 045, 048. Mesmo enunciado e resposta textual, posições D/B/D/C/D.
- Craniocaudal: QP-RX-FEI-039, 046. Mesmo enunciado e resposta textual, posições A/B.
- Abreviação laterolateral: QP-RX-CRA-048 e QP-RX-COL-050. Resposta LL nos dois registros; confirmar se contexto específico distingue os casos.

**Decisão editorial pendente:** substituir redundâncias por perguntas distintas, verificadas em fontes primárias, preservando IDs e rastreabilidade. Não tratar troca da letra do gabarito como questão diferente. A redação “face um lado” é gramaticalmente inadequada e precisa ser corrigida após revisão científica.

## Desafio do Olhar (50 registros)

Blob original: `e504c1fdb0739e84a95e97938ce49db2ee3c30b7`. Cinco grupos de enunciados iguais (15 registros; 10 ocorrências além da primeira): OLH-011/012/013/016/026; OLH-014/015; OLH-027/028; OLH-029/030/033/034; OLH-048/049.

**Importante:** perguntas iguais sobre imagens distintas **não demonstram duplicação clínica**. Os gabaritos diferem em vários grupos (ex.: OLH-011/012/013/016/026: LLD, LLE, VD, VD, DPl). A checagem precisa considerar hash/identidade da imagem, autorização, anonimização, região anatômica e contexto, não apenas o texto do enunciado. Não alterar ou remover os casos automaticamente.

## Critérios e próximos testes

1. Confrontar cada registro com a imagem efetiva e os PDFs originais; duas passagens independentes, páginas e hashes comprovados.
2. Registrar diferenças entre enunciado, alternativas, justificativas e gabarito; marcar pendente até evidência suficiente.
3. Reexecutar `node scripts/auditar-novos-desafios.mjs` em checkout isolado e guardar saída e código de retorno. **Não executado nesta inspeção**.
4. Regressão de carregamento dos bancos, fluxo mobile e acessibilidade somente depois de corrigir dados com evidências.

Nenhum item deste documento é considerado aprovado para publicação. Nenhum arquivo original de banco, layout ou produção foi alterado.
