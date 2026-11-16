# Recuperação e validação técnica — 14/11/2026

## Origem e isolamento

Branch exclusiva: `codex/diagnostico-audio-dpi-20261111`. Remoto verificado em `7a2caf9b8b4179afad312f54b5324a8136d659dd`: três commits de testes posteriores a `42f5ae4`, sem alteração de produto. Os cinco commits locais foram reaplicados sobre esse remoto, sem merge ou push. Backup anterior em bundle no workspace.

Recuperado o candidato já existente `dpi-refine-20261107/project`, confrontado com `local-preview/dist`, e seus dois sprites AVIF. Nenhuma nova geração ou renderização. `RECUPERACAO_SHA256.json` registra hashes de entrada, antes dos ajustes descritos abaixo. O candidato recuperado contém mudanças anteriores ausentes da árvore Git inicial; não confundir a recuperação com uma nova criação de layout. A aprovação visual final desse candidato não foi novamente comprovada nesta execução.

## 1. Voz e atraso

A entrada recuperada encaminha computador e celular à capa; Quiz, Plantão e minijogos usam o controlador compartilhado ELXAssistentes, turnos DPIDuoSpeech e requisições `/api/tts` ao ElevenLabs. Modelo padrão no servidor: `eleven_multilingual_v2`, configurável. Há cache de áudio e preparação antecipada do próximo turno. Gravações aprovadas de apresentação permanecem disponíveis. A opção de voz do dispositivo usa `speechSynthesis`; o cliente/worker Piper é uma alternativa local retida, não a substituição automática das vozes aprovadas. O carregador desktop legado mantém seu mecanismo nativo separado.

Não foi encontrada uma espera fixa de três segundos aplicável a todas as perguntas. O caminho neural aguarda síntese, transferência e preparação do áudio antes do início; a latência efetiva exige medição no backend. A seleção de vozes do dispositivo também pode aguardar disponibilização de vozes. Concorrência entre observadores podia reiniciar a narração. A hipótese de atraso não equivale a medição: não há evidência auditiva nesta execução de que os três segundos tenham desaparecido.

## 2. Correções mínimas sobre o candidato recuperado

- Roteador mantém identidade da pergunta, prioridade de feedback e geração de cancelamento; observador legado cede a propriedade das perguntas/feedback ao roteador.
- Cada turno recebe identidade crescente própria. Eventos antigos de início, progresso, pausa e fim são rejeitados antes de atingir consumidores.
- Legenda completa aparece no início efetivo do áudio, sem atraso artificial por digitação. Fim/pausa encerra estado de fala. Tom/Fernanda seguem o turno ativo.
- Reprodução por trechos anuncia cada trecho uma vez e ignora callbacks de trechos concluídos. Um trecho obsoleto não interrompe uma tarefa nova.
- Callbacks nativos exigem geração e instância ativa. Listeners de gravações legadas cedem ao controlador ativo.
- Movimento avançado existente recuperado com FSM, sprites e transições; testes históricos reaproveitados. Sem afirmar qualidade visual ou auditiva nova.

## 3. Plantão

Membro, respiratório, reprodutivo e misto percorrem 12 decisões com respostas distintas. Tempo esgotado, vitalidade zero, resposta reordenada e proteção contra envio duplicado passaram. Crânio produz somente 4 questões elegíveis e pelve 9; ambas falham no requisito de 12. Não foram inventadas questões nem alterados filtros aprovados para esconder a limitação. A conclusão das 12 fases em todas as trilhas permanece pendente de decisão editorial sobre conteúdo/regras.

## 4. Regressão executada

Comandos na raiz:

```sh
node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs
```

Resultado: **106 testes, 93 aprovados, 13 falhas**. As mesmas 13 falhas foram reproduzidas na cópia do candidato recuperado sem as correções desta execução: `node --test tests/dpi-home-reference.test.cjs tests/dpi-mascot-proportions-motion.test.cjs tests/portal-integration.test.cjs tests/dpi-plantao-progression.test.cjs` — 24 testes, 11 aprovados, 13 falhas. Onze são expectativas de rotas, arte antiga e isolamento do portal incompatíveis com o candidato recuperado; duas são as insuficiências reais do Plantão. Não estão resolvidas nem foram removidas.

Conjunto específico de áudio, eventos, identidade, propriedade, desktop, narração de fases, regressão recuperada, preservação e stream: **82/82 aprovados**, conforme `audio-preservacao-82.log`. Os dois novos testes de eventos atrasados do stream falharam antes da correção e passaram depois.

Os 300 itens originais permanecem com SHA256 `27538788f2d9480456a2827a80d91be976ef2176faa91470d592b848fedaa302`, igual a `42f5ae4`. CSS inline e bloco de lógica de jogo/cadastro/pontuação/revisão/ranking/minijogos preservados por hash em relação ao candidato recuperado anterior aos ajustes. Os testes de preservação passaram. As referências de CSS/lógica dos testes foram explicitamente migradas para essa origem recuperada; o hash do banco não mudou. Isso verifica integridade de código, não execução real de cadastro/ranking em servidor.

Logs anexos têm linhas gigantes de diff do HTML omitidas e demais linhas limitadas a 500 caracteres, para evitar duplicar o runtime no relatório.

## 5. Limites e próximos passos

Validação técnica parcial concluída; aprovação global bloqueada por 13 falhas e ausência de validação neural ponta a ponta. O projeto Vercel não está acessível pela conexão atual (consultas anteriores retornaram 404/403); não há credenciais locais disponíveis para testar a síntese real. Não foram feitas chamadas pagas, deploy, publicação, merge, DNS ou alterações de produção. Não há novo link de avaliação desta execução. O link estático antigo não representa este candidato e não deve ser apresentado como versão completa.

Próxima etapa: disponibilizar acesso funcional ao ambiente neural de teste, medir abertura da janela → requisição → áudio pronto → início de reprodução e avaliar no celular; resolver o conteúdo das duas trilhas e reconciliar os onze testes de referência com a versão visual efetivamente aprovada antes de qualquer publicação autorizada.

## Registro de commits

`bd8fe0c` — recuperação do candidato avançado, correções de turnos/legendas e testes/evidências. Commit somente local na branch autorizada. `9655feb`, `0b1be31`, `5af68dd`, `9dae539`, `ccae3ce` preservam o trabalho local anterior reaplicado sobre `7a2caf9`.
