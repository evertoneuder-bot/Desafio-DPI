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
