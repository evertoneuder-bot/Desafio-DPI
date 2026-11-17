# Continuidade técnica — 2026-11-16/17

## Estado comprovado
- Branch: `codex/diagnostico-audio-dpi-20261111`.
- HEAD validado pela suíte: `7101e451cb85df2560bbca1f3ebb594a5bdfcb36`.
- GitHub Actions workflow `.github/workflows/dpi-regression.yml`.
- Execução: https://github.com/evertoneuder-bot/Desafio-DPI/actions/runs/44001417681
- Resultado extraído dos logs do job 133766153799: **140 testes, 140 aprovados, 0 falhas**, duração ~1,19 s.
- Testes são Node.js simulados/estáticos, **não** equivalem a validação visual ou auditiva.

## Correções recentes
- `3b1d525a`, `1a46909d`, `a76229c1`: progresso cumulativo do minijogo Associação e teste.
- `ee794a16`, `2f6b8c56`, `1c4a9dc0`: atribuição de latência de áudio e teste.
- `d5b0d6ab`: workflow de regressão isolado.
- `6da079b1`: raiz encaminha desktop e celular à capa compartilhada.
- `51b05ee3`: escala de Fernanda na capa.
- `7101e451`: alinha teste de roteamento à capa.

## Pendências reais
1. Medir latência neural no navegador real: consulta de créditos, geração ElevenLabs, transferência MP3 e evento de reprodução.
2. Validar volume percebido de Tom e Fernanda, pronúncia pt-BR, sobreposição e sincronização labial com escuta humana.
3. Validar animações e navegação com navegador real, inclusive viewport móvel e aparelho físico.
4. Conferir Preview atualizado antes da homologação; nenhum deploy novo foi realizado nesta sequência.
5. Gerar pacote ZIP integral com código e manifesto SHA-256 quando o ambiente de arquivos estiver disponível; a ferramenta local de arquivos apresentou erros, portanto **nenhum ZIP completo foi gerado**.

## Restrições
Não alterar o layout aprovado; não publicar em produção, mexer no DNS, expor credenciais ou realizar alterações destrutivas sem autorização específica. Não confundir o `index.html` recuperado com o layout final. Trabalhar na branch acima, com correções mínimas, testes e rollback. Chat normal é o ambiente principal; Work só se indispensável.

## Próxima ação
Executar diagnóstico em navegador/Preview para separar latência do servidor e do cliente. Se não houver acesso, avançar em testes independentes e não inventar métricas reais.

## Verificação complementar — navegador e Preview (17/11)
- GitHub Actions do HEAD `5f6afbe7440184a21ad77b5621409c55c3f750b1`: execução `44002497030` concluída com sucesso (suíte Node); o HEAD inclui este relatório, não um novo deploy.
- Navegador conectado: aba aberta `https://desafio-dpi-veterinario-v40-previe-git-ceb3de-evertoneuder-6390.vercel.app/dpi-r18.1/ABRA-ESTA-PREVIA` exibiu texto/elementos de uma interface com botão `Começar`, marca antiga de personagem em atributo alternativo e rota diretamente para o HTML legado. **Essa aba não comprova que a versão atual da branch foi implantada.** Não usar sua aparência para validar ou substituir o layout aprovado.
- A integração de navegador disponível nesta sessão permite ler o conteúdo das abas, mas não executar JavaScript de instrumentação, reproduzir áudio ou medir eventos de reprodução. Nenhuma medição auditiva/latência real foi obtida.
- Código de `api/tts.js` conferido: consulta sequencial de saldo/limite de créditos precede a síntese ElevenLabs; o MP3 é inteiramente carregado antes de ser enviado. Há métricas `Server-Timing` para consulta, cabeçalhos de síntese e buffer. Não eliminar a proteção contra cobranças nem atribuir os três segundos a uma etapa sem medição.
- Próximo passo técnico: obter Preview efetivamente vinculado ao HEAD autorizado; medir `Server-Timing` e `playing` no navegador de teste, separando latência de rede, síntese e aplicação. A validação sonora real permanece pendente.
