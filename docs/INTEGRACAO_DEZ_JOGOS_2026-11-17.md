# Relatório de integração e validação do preview DPI

Atualizado: 17/11/2026. Branch: `codex/diagnostico-audio-dpi-20261111`.

## Base e layout

- Estado confirmado no GitHub antes da última atualização de documentação: `97faa2cab2215667a80f6bb3ecca8ebc89b8aa8a`.
- O launcher de prévia oferece sete cartões de minijogos do jogo existente e três módulos novos, totalizando dez itens de integração. A Arena mantém também o modo independente `Feche o Diagnóstico`; ele foi preservado e não substitui nenhum dos dez itens.
- A capa e o layout original permanecem inalterados. Os módulos novos abrem em rotas separadas e não interferem no cadastro, pontuação ou ranking originais.

## Conteúdo que pode ser avaliado

- O banco preliminar de 20 questões offline continua disponível.
- Foram incorporados os três bancos JSON que a página já anunciava: DPI Integrado (40), Qual Exame? Qual Projeção? (50) e Telerradiologia Clínica (10). O quiz agora carrega os arquivos locais do pacote, mostra contexto clínico, fontes/localizadores e situação editorial do item.
- Os 100 itens novos continuam em revisão; nenhum está homologado. Não apresentar as contagens como conteúdo cientificamente aprovado.
- Há mais 50 roteiros para o Desafio do Olhar. Todos permanecem bloqueados sem imagens licenciadas, anonimizadas e revisadas; nenhum dos 50 é apresentado como caso visual jogável.
- O Detetive da Imagem mantém cinco missões sintéticas de demonstração, sem alegação de imagem clínica real.
- A auditoria do banco documental de zoonoses corrigiu cinco gabaritos que contradiziam a justificativa e a fonte, com os localizadores consultados registrados em `docs/novos-desafios/AUDITORIA_GABARITOS_ZOONOSES_2026-11-17.md`. A contagem original de 325 questões permanece protegida por teste.

## Testes automatizados locais

- Comando: `node --test tests/*.test.cjs tests/recovered/*.test.cjs`.
- Resultado atualizado: **151 aprovados, 0 falhas**.
- Auditoria estrutural: 0 IDs/gabaritos/estruturas inválidos nos quatro JSONs (40 + 50 + 10 questões e 50 roteiros). Esse resultado não é homologação científica.
- Contagem das respostas corretas entre as alternativas de maior comprimento: DPI Integrado 32/40 (80%); Qual Exame 14/50 (28%); Telerradiologia 0/10; Olhar 30/50 (60%). DPI Integrado e Olhar ainda exigem revisão do viés; ver `AUDITORIA_VIES_COMPRIMENTO_2026-11-17.md`.

## Teste real em desktop

Na prévia do commit `7ffda52`, o launcher, o banco offline de 20 questões, avanço e feedback foram exercitados. A resposta correta mostrou retorno visual e avançou o contador.

Ao selecionar o banco DPI Integrado, a prévia ainda publicada respondeu HTTP 404 porque os JSONs não estavam incluídos no pacote dessa versão. Esta atualização corrige os caminhos e inclui os bancos; o reteste da versão atualizada depende do novo Preview gerado pelo GitHub.

Na rota original da Arena, houve reprodução neural real com `data-dpi-voice-source=elevenlabs`. O primeiro evento de reprodução medido ocorreu **3.508 ms após a solicitação**. A latência permanece acima da meta de início próximo a 1 s. A suíte protege o limite de créditos e impede sobrecarga; não deve ser removida para acelerar o áudio.

## Vercel e publicação

- O check Vercel associado ao commit anterior indicou a prévia `https://desafio-dpi-veterinario-v40-previe-git-ceb3de-evertoneuder-6390.vercel.app`.
- O check GitHub do commit `97faa2c` apresenta `Vercel: success` e aponta para o dashboard de deployment `https://vercel.com/evertoneuder-6390/desafio-dpi-veterinario-v40-preview/4jkQvtMTWzegQQTGjTpFJwD1kMz7`.
- A API Vercel da conta conectada retorna zero projetos/deployments, mesmo sem filtro; `get_deployment` e a busca autenticada da URL antiga retornam 404. A tentativa autorizada de link de proteção foi recusada com HTTP 403; o fallback CLI não está instalado. O status de build está verde, mas a nova URL pública do Preview e seu conteúdo não puderam ser obtidos nesta sessão.
- O Chromium local não conseguiu iniciar neste ambiente gerenciado (`socket() failed: Operation not permitted`). Portanto, os 151 testes são regressão automatizada; a rechecagem interativa do novo pacote depende de acesso à prévia atualizada.
- Nenhum deploy de produção, promoção, alteração de DNS ou mudança do layout aprovado foi feita.

## Pendências restantes

1. Conferir o Preview da atualização e testar novamente os três bancos JSON (HTTP 200, carregamento, justificativa, fonte, situação editorial e progressão).
2. Concluir revisão científica e editorial dupla dos 100 itens; revisar primeiro o viés de extensão em DPI Integrado e Olhar.
3. Obter imagens RX/US reutilizáveis com direitos, anonimização e diagnóstico de referência para os 50 roteiros visuais; incorporar diversidade de modalidades e espécies sem inventar imagens clínicas.
4. Corrigir e testar a latência neural no navegador, confirmando início, voz de Tom e Fernanda, volume e ausência de sobreposição.
5. Executar a validação celular somente na etapa final, conforme solicitado.
6. Resolver a permissão real do projeto Vercel para consultar builds e gerar link de compartilhamento. A conexão autenticada atual não tem permissão para isso.
7. Conferir a redistribuição do Manual de Zoonoses: a cópia binária versionada falha na leitura PDF, enquanto a cópia do Drive abre. A substituição da cópia no repositório público ficou reservada, pois a licença é CC BY-NC-SA e a compatibilidade com distribuição comercial ainda não foi confirmada.
