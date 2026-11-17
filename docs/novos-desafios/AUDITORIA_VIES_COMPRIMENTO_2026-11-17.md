# Auditoria objetiva — comprimento das alternativas

Data: 17/11/2026. Os valores abaixo foram recalculados nos JSONs presentes neste commit. Uma resposta correta conta como “entre as mais longas” se empatar com o maior número de caracteres.

| Banco | Itens | Gabarito entre as alternativas mais longas | Percentual | Distribuição dos gabaritos |
|---|---:|---:|---:|---|
| DPI Integrado | 40 | 32 | 80% | A=11, B=11, C=9, D=9 |
| Qual Exame? Qual Projeção? | 50 | 14 | 28% | A=14, B=12, C=12, D=12 |
| Telerradiologia Clínica | 10 | 0 | 0% | A=4, B=3, C=1, D=2 |
| Desafio do Olhar (roteiros) | 50 | 30 | 60% | A=14, B=12, C=12, D=12 |

## Interpretação

DPI Integrado e os roteiros do Olhar ainda mostram associação alta entre gabarito e alternativa mais longa. O banco de Telerradiologia foi reescrito após a auditoria anterior e agora não tem gabarito entre as alternativas mais longas; isso não prova equilíbrio geral nem validação pedagógica. O banco Qual Exame tem percentual inferior, mas ainda requer revisão de plausibilidade e semântica.

Não homologar nenhum banco por esta métrica isolada. A revisão deve reduzir pistas de extensão sem adicionar palavras de preenchimento, preservar o sentido clínico e o gabarito respaldado pela fonte e manter registro por item. Não alterar gabaritos para atender a uma distribuição estatística.

O Desafio do Olhar tem 50 roteiros sem imagens autorizadas e não é um desafio visual jogável. Os 100 itens de questão ainda aguardam revisão científica/editorial conforme os status registrados em cada objeto.
