# Verificação independente do acesso externo

## Backend de voz

Adicionados 14 testes de contrato executando o handler real api/tts.js em VM isolada com fetch, ambiente, relógio e temporizadores simulados. Nenhuma chave real, chamada de rede ou síntese paga foi utilizada.

Verificados: rota correta de Tom e Fernanda; resposta de áudio; modelo padrão; cabeçalhos no-store e Server-Timing; ausência de credenciais/texto nos cabeçalhos; método/origem/texto/persona inválidos; configuração ausente; limite incluído insuficiente, dados de saldo nulos e cobrança excedente habilitada; erro de permissão; modelo/voz inválidos; resposta não sonora recusada; limpeza do temporizador.

Os valores de duração nos testes são artificiais e conferem o cálculo dos indicadores. NÃO representam a latência do provedor nem demonstram eliminação dos três segundos relatados. O backend continua consultando assinatura antes de solicitar síntese; não foi removida essa proteção para tentar reduzir atraso.

Comandos executados:

- node --test tests/dpi-tts-backend.test.cjs — 14 aprovados.
- node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs — **128 testes, 128 aprovados, zero falhas**.
- git diff --check — sem problemas.

## Dependências da prévia

37 referências locais de src/href das páginas principais e imports relativos dos módulos em assets verificadas. Lista em PREVIA_DEPENDENCIAS.json. Única ausência encontrada nesse conjunto: favicon assets/logo-elx-desafios-recorte.png já registrado anteriormente. Nenhuma referência estática ausente na página principal do jogo. Essa checagem não é um teste de rede, de todos os recursos dinâmicos ou da aparência.

O candidato local permanece acessível no workspace após manutenção; não foi necessária recuperação de arquivos nesta execução. Banco de 325 e produto não foram modificados.

## Acesso externo

A conexão instalada de Vercel reconhece a equipe, mas consultas recentes de projetos retornaram lista vazia e consulta do ambiente conhecido retornou 404. Duas solicitações novas de consentimento foram recusadas na tela do usuário como expiradas/já usadas, embora o contador indicasse tempo restante. Não foram gerados novos links repetindo esse fluxo defeituoso. Reconectar a integração pela conta do usuário permanece uma ação de autenticação que o agente não pode completar por ele.

Nenhum link desatualizado foi reapresentado como atual. Não houve push, publicação, deploy, merge, alteração em Vercel/produção ou DNS. Próxima verificação real depende de a conexão voltar a fornecer o projeto ou de outro ambiente neural autorizado ficar acessível.
