# Auditoria das entradas de áudio do Desafio DPI — 11/11/2026

## Verificação
Branch: `codex/diagnostico-audio-dpi-20261111`. Auditoria estática, sem teste auditivo de navegador.

### Rotas diferentes
- `index.html` encaminha telas de até 600 px a `dpi-home.html`. Em telas maiores carrega e concatena `game/part01.txt` a `part08.txt`, substituindo o documento via `document.write`.
- `assets/dpi-home.js` encaminha o botão COMEÇAR da capa para `dpi-r18.1/ABRA-ESTA-PREVIA.html?mode=start&return=dpi`.
- As oito partes desktop concatenadas têm cerca de 6,64 milhões de caracteres. A busca direta no conteúdo concatenado encontrou `new SpeechSynthesisUtterance(` (1), `speechSynthesis.speak(` (1), mas nenhuma ocorrência de `/api/tts`, `ELXAssistentes`, `DPIStaticVoice`, `dpiReadQuestion` ou `dpi-launch-router.js`.
- Portanto, testes e correções do roteador neural não demonstram, por si, melhorias na voz do pacote desktop. Esta constatação não prova a causa do atraso de três segundos.

### Pipeline neural
Em `api/tts.js` cada solicitação aguarda, sequencialmente, a consulta de créditos da ElevenLabs, o retorno dos cabeçalhos de síntese e o recebimento integral do áudio antes de enviá-lo. O cabeçalho `Server-Timing` instrumenta `subscription`, `synthesis_headers` e `buffer`. Ainda não há medidas reais de sessão para identificar qual parcela domina a latência.

### Próximas ações seguras
1. Auditar separadamente o fluxo nativo desktop e o fluxo da capa/mobile, sem confundir suas vozes.
2. Conseguir execução real e correlacionar pergunta visível, invocação do leitor, reprodução e `Server-Timing`.
3. Não trocar a rota desktop pelo HTML novo sem auditoria visual e aprovação: preservar o layout, as 300 questões, modos, revisão, pontuação, minijogos, cadastro e ranking.
4. Não remover o bloqueio de créditos para acelerar a síntese sem proteção equivalente contra cobranças.
5. Status `Vercel: success` no GitHub indica implantação concluída, **não** que o deploy esteja acessível ou o áudio validado; o conector Vercel não listou o projeto e o navegador conectado exibia login da Vercel.
