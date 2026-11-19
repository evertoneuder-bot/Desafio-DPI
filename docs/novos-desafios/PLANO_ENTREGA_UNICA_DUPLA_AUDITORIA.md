# Plano de entrega única e dupla auditoria — Qual Exame? Qual Projeção?

Status: trabalho em curso. **Não representa conteúdo finalizado ou validado.**

## Abrangência do banco
Casos encadeados de decisão sobre indicação de imagem, escolha de modalidade, posicionamento e projeções, com contexto clínico, espécie, restrições de segurança e justificativa. Incluir pequenos animais, equinos, ruminantes, suínos, aves, silvestres e exóticos, quando houver fonte verificável. Priorizar cobertura científica sobre quantidade. O banco JSON contém atualmente 50 registros preliminares, conforme inventário anterior; nenhum registro deve ser contabilizado como homologado sem as duas conferências documentadas. A meta mínima de trabalho é 50 questões cientificamente sustentadas e editorialmente aprovadas, escolhida para oferecer cobertura inicial de espécies, modalidades e decisões de posicionamento; a meta não equivale a jogo implementado ou entregue.

## Produção
Cada caso recebe ID estável, dados clínicos suficientes, perguntas e alternativas sem pistas por comprimento, resposta correta, explicação individual das alternativas, referência à obra e página/seção consultada, e status de revisão. Incluir opções de não realizar imagem imediatamente quando indicado. Não incorporar material protegido nem imagens clínicas sem permissão.

## Conferência 1 — ciência
Reabrir a fonte original; confirmar que a referência sustenta precisamente o enunciado e o gabarito; conferir modalidade, espécie, posicionamento, projeção, terminologia, contraindicações, limitações e contexto clínico. Registrar resultado por item (aprovado, corrigido, pendente), discrepâncias e páginas.

## Conferência 2 — consistência independente
Reexaminar todos os itens após a primeira conferência; revisar distratores, múltiplas respostas possíveis, comprimentos, repetição, português, padronização, metadados, fontes e integridade do JSON. Registrar resultado por item e teste automatizado de esquema, IDs, opções e referências. Não chamar a segunda conferência de concluída sem execução verificável.

## Entrega final única
Banco JSON editável + CSV/XLSX auditável + relatório de ambas conferências + referências verificadas + lista de pendências + commits e testes. Apresentar ao usuário apenas após completar as duas conferências, sem solicitações de revisão intermediárias. A avaliação final e autorização para integrar/publicar são exclusivas do usuário.

## Preservação
Não alterar layout aprovado, 325 questões, 12 fases, 7 minijogos, pontuação, cadastro, ranking ou produção. Trabalho somente em branch isolada.
