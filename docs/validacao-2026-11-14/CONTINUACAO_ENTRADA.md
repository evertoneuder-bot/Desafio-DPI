# Continuação autônoma — entrada e classificação das pendências

Remoto novamente conferido em 14/11: `7a2caf9b8b4179afad312f54b5324a8136d659dd`, sem novos commits. Branch exclusiva mantida.

## Correção comprovada

O index recuperado disparava `location.replace` para a capa e, em seguida, iniciava oito requisições do carregador legado, com `document.write`. Esse segundo fluxo podia disputar a navegação da capa. Dois testes executando ambos os scripts em VM reproduziram oito requisições indevidas em telefone e desktop. A correção remove exclusivamente o segundo script. Capa, parâmetros, hash e destino permanecem iguais. Os dois testes passaram após a remoção. Isso não comprova a eliminação do atraso neural nem uma disputa efetivamente observada no navegador real.

Comando: `node --test tests/dpi-entry-redirect.test.cjs` — 2/2 aprovados.
Regressão: `node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs` — 108 testes, 95 aprovados, 13 falhas; nomes e diagnósticos em `continuacao-regressao.log`. Os testes antigos da entrada ainda exigem o comportamento anterior telefone/desktop e precisam de reconciliação com a referência aprovada, não de alteração visual para satisfazer regex.

## Retificação da classificação anterior

A frase do relatório anterior classificando todas as onze falhas não relacionadas ao Plantão como expectativas incompatíveis foi abrangente demais. O teste da biblioteca para em arquivo realmente ausente: `dpi-r18.1/biblioteca/biblioteca-veterinaria/CATALOGO-BIBLIOTECA-DPI.md`. Foram localizadas cópias históricas em `dpi-recovery-r28/biblioteca-veterinaria` e `dpi-voice-fix/dpi-r18.1/biblioteca/biblioteca-veterinaria`, incluindo bibliografia e Manual_Zoonoses_MS.pdf. Sua identidade e escopo de entrega ainda precisam ser confrontados antes de restauração. Não foram copiados indiscriminadamente.

O teste de imagens conclui a checagem das referências externas e falha ao tentar abrir o antigo `elx-rig.js`, ausente do candidato que usa módulos FSM. O teste dinâmico de cadastro falha porque seu DOM simulado não implementa `createElement`; isso não comprova defeito do cadastro real. Outros testes esperam a antiga seleção mobile, imagem estática em vez do canvas e fragmentos literais anteriores. Nenhum foi excluído ou marcado como aprovado.

As limitações de 4/9 questões elegíveis em crânio/pelve continuam abertas. Não houve mudança do banco ou das regras para forçar 12 questões.

## Bloqueio ainda vigente

Sem acesso funcional ao ambiente neural para medir a latência real e sem referência visual inequívoca para reconciliar os testes legados, a aprovação global permanece pendente. Não foi criado link novo, não houve push, deploy, publicação, merge, alteração de produção, DNS ou Vercel. As mudanças desta continuação limitam-se ao script de entrada, seus testes e documentação.
