# Candidata de avaliação — 16/11/2026

**Base recuperada:** `eb9924dbd7ccfdfa50d07ac7b786607cb19e2473` (pacote de 14/11/2026).
**Áudio mais recente integrado:** `848825330d380947781dcfeca45d9d93b3b2ade0` (branch `codex/diagnostico-audio-dpi-20261111`).
**Questões:** 325, conforme auditoria do pacote restaurado.
**Escopo:** candidata local isolada; nenhum deploy, publicação, alteração de domínio ou produção.

## Resultado da verificação local

Regressão executada em 16/11: **137 testes aprovados, 0 falhas** (`node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs`). A integração de mascotes conserva o fallback para a arte aprovada quando o renderizador articulado não está carregado, e os testes verificam a proteção contra eventos de fala atrasados.

## Limite desta candidata

A voz neural real ainda não foi validada. O backend `/api/tts` requer ativação e credenciais/IDs de voz no ambiente de servidor. Esta candidata local não é um link publicado e abrir o HTML sem backend não comprova áudio neural.

## Próximo passo para avaliação navegável

Criar uma prévia isolada do repositório, com backend TTS configurado sem expor credenciais, e validar visual, navegação, áudio Tom/Fernanda e reprodução no navegador. A integração Vercel disponível nesta sessão não localizou o projeto associado; portanto, a prévia hospedada segue pendente.
