# Auditoria global de continuidade — 14/11/2026

## Ordem vigente do usuário

A semifinal de 98% já estava aprovada. Preservar interface, conteúdo e comportamentos aprovados. Escopo remanescente: antecipar a voz em sincronia com abertura das janelas e aprimorar a naturalidade do movimento. O usuário pediu recuperar trabalho existente entre conversas para evitar reconstrução, renderizações repetidas e créditos desnecessários.

## Conclusão comprovada

Existe uma candidata local posterior à base da prévia de referência, com fonte, cópia completa de teste, arte já gerada, testes e instruções de implantação. Ela NÃO estava na árvore da branch que foi copiada para o Site de teste anterior. Não é necessário gerar novas imagens nem recriar o controlador para recuperá-la.

O conjunto foi localizado em `/workspace/scratch/d4b95970c586/dpi-refine-20261107`. Seus registros finais foram modificados em 10/11/2026, à noite no horário de Brasília. Não inferir a data de conclusão pelo nome da pasta de 07/11.

## Estados separados

| Estado | Fonte comprovada | Situação |
| --- | --- | --- |
| Prévia original de referência | ff56b03 + composição de build; implantação F9eTG4wLs segundo continuidade | Acesso pelo navegador confirmado nesta conversa; não equivale à árvore Git isoladamente |
| Aprimoramentos locais de 7–10/11 | `project/`, `local-preview/dist/`, `build-overlay.json` | Fonte e cópia completa recuperadas; 24 arquivos no overlay; não publicados segundo os registros |
| Diagnóstico GitHub de 11–14/11 | branch codex/diagnostico-audio-dpi-20261111, remoto 7a2caf9 | Instrumentação, cancelamento e testes; não substitui a renderização completa aprimorada |
| Correções locais desta conversa | b1c3e9d e registros posteriores | Disputa de narradores e eventos atrasados testados na árvore copiada; não transportados cegamente para o motor recuperado |
| Candidata separada de pausa inicial | RELATORIO_DIAGNOSTICO_VOZ.md, 11/11, cópia R43.3 | Remoção candidata de 1500ms em falas positivas; 70/70 testes Node informados no relatório; não explica toda narração nem comprova compatibilidade |

## Trabalho já existente na candidata recuperada

Os registros e o código confirmam: filtro de alterações de legendas/relógios para impedir reagendamento de fala; agendamento por requestAnimationFrame em lugar de debounce de 520ms; primeiro trecho longo dividido em pontuação; preparação do próximo trecho enquanto o atual toca; dupla com turnos sem sobreposição; controlador de gestos por contexto; reflexão após consideração silenciosa; preparação e retorno de apontar; pose de escuta; transições parciais de rosto; integração da dupla nos jogos de palavras sem alterar a caixa da imagem de reserva.

Há ainda correções existentes de rascunho de cadastro, preservação de parâmetros de compartilhamento, reação em minijogos e cruzadinha. Não reimplementar ou remover esses comportamentos para preparar o teste.

## Correspondência por bytes

Os seguintes arquivos do diretório `project` foram comparados nesta auditoria e são idênticos aos de `local-preview/dist`:

| Arquivo relativo | SHA-256 |
| --- | --- |
| dpi-r18.1/ABRA-ESTA-PREVIA.html | 2a3ee71bc42b1677f00796f759fc795d53318cd5bd3003bc46a9cd4b8bf92d7a |
| dpi-r18.1/voz-e-mascotes/dpi-duo-speech.js | 8cf7ac5321cc6d589e65ce696e7e73f1796cf2d2193a61bdf3165985aebba3ea |
| dpi-r18.1/voz-e-mascotes/dpi-speech-timing.js | 167a352cf8dd2f2aad056f68163eb10851e3a617d1fae2cd3051eac57776d401 |
| dpi-r18.1/voz-e-mascotes/dpi-speech-stream.js | a4e2db57b77bb68ed816f2369ce0cb6c2b7db4ce947a63867372bd980de7c489 |
| assets/dpi-puppet-driver.js | 63b234b0ca9b8a9a37b178e8c0dbfbba2afdd31e89c511b66ea77071f2032076 |
| assets/fsm/sprite-renderer.js | cdd3408472dc2123f4b5af5ab078211a9fde1800c98a2ba1b4211cc35e5e5c0a |
| assets/fsm/character-state-machine.js | 3187def3bf56a1cca225018865c1709c29db0e270217117bedc3e086e81ab0a3 |
| assets/fsm/wordgame-stage.js | 91bd4f3b28ac09b6e7811555b29e6443f5aa5525e05e0f3d94d744a9d486cfc3 |

A cópia completa contém 64 arquivos. O overlay existente declara 24 entradas. Esses números descrevem o material encontrado, não aprovação funcional integral.

## Evidência de validação já realizada

Lidos integralmente `STATUS-CONTINUIDADE.md` e `VALIDACAO-LOCAL-FINAL.md`. Eles registram testes locais de entrada/cadastro, quiz 10/25/50, amostras de minijogos, Plantão, reações e molduras móveis, além de scripts de lógica e streaming. Também registram falhas herdadas, cobertura parcial e ausência de validação da síntese neural real. Esses resultados são históricos documentados; não foram reapresentados como nova execução nesta auditoria.

O commit histórico 7c4521ea foi consultado e trata de teste de isolamento de tempos de leitor; não é nova renderização. Os três commits remotos posteriores a 42f5ae4 também acrescentam/corrigem um teste de fases. Portanto, atividade posterior no Git não prova por si só publicação de uma nova candidata audiovisual.

## Limite restante

Os registros locais dizem expressamente que os aprimoramentos não foram implantados porque a Vercel exigiu reverificação para alterar o patch de Preview. A conexão Vercel atual continua sem localizar o projeto; a consulta do endereço protegido pelo terminal terminou em tela de login, e o conector não recuperou o deployment. Não copiar credenciais de sessão nem remover proteção para resolver isso.

A cópia estática em Sites não preserva a integração neural do ambiente original e foi rejeitada pelo usuário. Não publicar outra versão incompleta como avaliação final. O próximo passo técnico depende de publicar a candidata RECUPERADA no ambiente de testes com as vozes aprovadas, preservando a base de 98% e comparando somente as diferenças de voz/movimento. Não reiniciar renderização ou geração.

## Ações desta auditoria

Consulta de contexto das conversas, arquivos de continuidade, metadados Sites e histórico Git; leitura dos relatórios de voz; descoberta dos arquivos locais existentes; comparação de hashes. Nenhum novo asset foi gerado, nenhum render foi iniciado, nenhum módulo do produto foi alterado e nenhum deploy foi feito nesta auditoria.
