# Contrato de dados dos novos modos

Cada `case` deve conter: `id` (único), `species`, `difficulty`, `clinical_context`, `imaging_modality` (RX/US), `question`, `alternatives` (quatro objetos com `id`, `text`, `rationale`), `correct_id`, `references` (lista de registros com `title`, `authors`, `year`, `locator`, `verified`), `review_status` e `reviewer_notes`.

Para o Desafio do Olhar acrescentar `images`: objetos com `path`, `source`, `license_or_permission`, `anonymized`, `modality`, `reference_diagnosis`. Somente casos com `review_status: "validado"`, referências verificadas e imagens autorizadas poderão ser exibidos ao jogador.

Os bancos começam vazios deliberadamente: conteúdo científico e imagens não serão fabricados para cumprir uma meta quantitativa.


## Critério de homologação científica (obrigatório)

O campo `references[].verified: true` é **declaração de metadados, não evidência suficiente**. Para homologar cada questão, registrar em relatório auditável, vinculado ao `case.id`: (1) ID e nome do PDF original no Drive; (2) hash SHA-256 calculado a partir dos bytes efetivamente consultados, edição e versão quando identificáveis; (3) número da página física do PDF e página impressa quando divergirem; (4) trecho ou descrição objetiva do conteúdo examinado que sustenta enunciado, gabarito, alternativas e justificativas; (5) resultado da primeira conferência científica; (6) resultado independente da segunda conferência científica/editorial, com datas, responsáveis ou método e histórico de correções. Não atribuir página, edição, hash ou autorização presumidos.

**Estados separados:** registro existente, estruturalmente válido, cientificamente confrontado na primeira passagem, aprovado na segunda passagem e elegível para publicação são etapas distintas. Itens sem acesso ao PDF, ambíguos ou sem evidência completa ficam `pendente`, mesmo que tenham `verified: true` ou `review_status: "validado"`. O auditor estrutural atual não verifica a documentação externa e, isoladamente, não certifica aprovação científica.

Para `qual-exame-qual-projecao`, a meta mínima é **50 questões aprovadas individualmente nas duas passagens**, não apenas 50 registros JSON. Entregar o banco inteiro editável e uma auditoria consolidada em uma única revisão humana final. Para modos com imagens, autorização de uso e anonimização devem ser comprovadas antes de qualquer publicação. Não incluir imagens ou páginas integrais de obras protegidas no repositório sem permissão.
