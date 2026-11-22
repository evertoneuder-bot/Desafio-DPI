# Auditoria reproduzível dos bancos novos — 2026-11-22 09:10 BRT

Origem: GitHub Actions run 44983682795, artefato 14738996906, SHA-256 do ZIP informado no checkpoint anterior: 473b7650f79ac9921c96ad49ad76b841b50b5781bbe5ecd6c1faee9aefb602a9 (não recalculado nesta sessão).
Branch de origem: preview/recuperacao-isolada-20261117; HEAD antes deste registro: f9a633b2340ea99c5c57668dc75bdd3564af415e.
Extração efetiva de auditoria-novos-desafios.jsonl e auditoria-status.txt do artefato nesta rodada. Exit codes: structural_exit=1, homologation_exit=1.

| Banco | Itens | Duplicações de enunciado | Sem evidência | Problemas de justificativa | Imagem inválida | Gabarito único mais longo | Elegíveis |
|---|---:|---:|---:|---:|---:|---:|---:|
| dpi-integrado | 40 | 2 | 40 | 0 | 0 | 32 | 0 |
| qual-exame-qual-projecao | 50 | 15 | 50 | 0 | 0 | 8 | 0 |
| telerradiologia-clinica | 10 | 0 | 10 | 10 | 0 | 0 | 0 |
| desafio-do-olhar | 50 | 15 | 50 | 0 | 50 | 17 | 0 |

Total 150 itens, 32 sinalizações de enunciados duplicados, 150 sem evidência bibliográfica, 10 sem justificativa individual segundo o validador, 50 referências de imagens inválidas e 57 gabaritos como alternativa unicamente mais longa. Contagens são sinalizações do validador, não itens necessariamente distintos.

IDs duplicados: DPI Integrado INT-005, INT-032. Qual Exame QP-RX-FEI-031,032,033,034,036,038,039,040,043,044,045,046,048; QP-RX-CRA-048; QP-RX-COL-050. Desafio do Olhar OLH-011,012,013,014,015,016,026,027,028,029,030,033,034,048,049.

Próxima tarefa técnica: confrontar os enunciados duplicados com o banco fonte, distinguir duplicatas reais de variantes clínicas legítimas e aplicar mudanças mínimas somente após inspecionar os textos. Não inventar referências nem considerar banco homologado. Auditar as justificativas individuais do banco Telerradiologia e a validade/autorizações das imagens. Reexecutar validador e guardar logs após patches.

Rollback deste registro documental: reverter apenas o commit que adicionou este arquivo. Nenhum dado clínico, jogo ou configuração de produção alterado.
