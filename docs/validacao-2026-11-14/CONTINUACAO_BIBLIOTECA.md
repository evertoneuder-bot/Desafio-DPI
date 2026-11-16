# Continuação — biblioteca e referência de testes

## Recuperação sem alterar o aprovado

Restaurados sete arquivos ausentes da biblioteca, sem substituir arquivos atuais. Duas cópias históricas (`dpi-recovery-r28` e `dpi-voice-fix`) conferidas byte a byte e idênticas. Hashes e caminhos individuais em `BIBLIOTECA_RESTAURADA_SHA256.json`. Catálogo, bibliografia, licenças, instruções, política de acesso, questões suplementares documentais e Manual_Zoonoses_MS.pdf são recuperações existentes, não conteúdo novo. O arquivo perguntas.json permanece apenas documental; nenhuma inclusão no banco executado foi feita. Artigos científicos atuais não foram sobrescritos.

O JSON histórico `banco-dpi-300.json` possui 300 itens, mas não é idêntico ao banco inline atual. A divergência foi detectada antes da cópia: esse JSON NÃO foi restaurado. O teste da biblioteca passa a conferir o banco realmente executado. O teste de preservação separado continua exigindo o mesmo SHA256 do banco original aprovado.

## Teste de identificação

O teste dinâmico de abertura de cadastro não chegava à asserção por ausência de createElement/head/addEventListener no DOM simulado. Fixture completada; expectativas alinhadas ao fluxo do candidato recuperado (`modeMenu` após identificação, retorno à `/dpi-home.html`). Nenhum código de cadastro ou estilo alterado. Esse teste avalia o roteador em VM, não cadastro real em servidor.

## Verificação

`node --test --test-name-pattern='a biblioteca entregue|a rota start configura' tests/portal-integration.test.cjs tests/dpi-home-reference.test.cjs` — 2/2 aprovados.

`node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs` — **108 testes: 97 aprovados e 11 falhas**. Falhas por nome e diagnóstico em `biblioteca-regressao.log`; nenhum teste excluído ou silenciado. Banco original, estilos e lógica preservados pelos testes existentes. A redução de duas falhas resulta da restauração de arquivos e correção explícita do teste/fixture, não de correção adicional de voz.

Persistem: cinco testes de referência da capa/roteamento/voz com expectativas anteriores; dois testes do antigo mecanismo de arte/reação; dois testes do portal (restrição antiga da entrada e rig antigo ausente); duas trilhas de Plantão sem 12 perguntas elegíveis.

Checagem adicional de src/href estáticos: nenhum arquivo ausente na página do jogo. Na capa, a referência ausente é exclusivamente o favicon `assets/logo-elx-desafios-recorte.png`, não o logotipo exibido no corpo. A busca nos arquivos locais não encontrou o original; não foi substituído por outra imagem. Pendência pequena, registrada sem afirmar equivalência visual.

## Limites

Continua sem validação auditiva da voz neural nem nova avaliação visual/mobile. O bloqueio de acesso ao backend permanece; não foi repetida a investigação anterior nem houve publicação. Alterações desta continuação: recuperação de documentos, testes e relatórios. Sem mudanças em layout, pontuação, cadastro, ranking, filtros do Plantão ou banco ativo.
