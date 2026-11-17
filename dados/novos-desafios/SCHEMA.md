# Contrato de dados dos novos modos

Cada `case` deve conter: `id` (único), `species`, `difficulty`, `clinical_context`, `imaging_modality` (RX/US), `question`, `alternatives` (quatro objetos com `id`, `text`, `rationale`), `correct_id`, `references` (lista de registros com `title`, `authors`, `year`, `locator`, `verified`), `review_status` e `reviewer_notes`.

Para o Desafio do Olhar acrescentar `images`: objetos com `path`, `source`, `license_or_permission`, `anonymized`, `modality`, `reference_diagnosis`. Somente casos com `review_status: "validado"`, referências verificadas e imagens autorizadas poderão ser exibidos ao jogador.

Os bancos começam vazios deliberadamente: conteúdo científico e imagens não serão fabricados para cumprir uma meta quantitativa.
