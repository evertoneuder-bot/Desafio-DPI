# Recurso ausente da capa corrigido

A referência de favicon apontava a um PNG inexistente, sem registro no histórico Git acessível. Substituída exclusivamente a tag link rel=icon para reutilizar o mesmo SVG de marca já presente e exibido na capa, com MIME image/svg+xml. Nenhuma imagem foi gerada ou reconstruída. Conteúdo inteiro após <body> confrontado com a versão anterior e idêntico; layout, estilos, botões e proporções não foram modificados. O ícone de aba passa a usar a marca existente.

Novo teste falhou antes porque o arquivo não existia; passou depois. O teste anterior que contava ocorrências globais do nome SVG foi restringido às tags img para continuar exigindo duas marcas visíveis, sem contar o favicon como terceira imagem de página.

Verificação de 37 referências locais previamente inventariadas: todas resolvem, sem ausência nesse conjunto. PREVIA_DEPENDENCIAS.json atualizado. Isso não cobre URLs dinâmicas/remotas, aparência ou áudio.

Regressão: node --test tests/*.test.cjs tests/recovered/speech-stream.test.cjs — **129 testes, 129 aprovados, zero falhas**. git diff --check passou. Banco de 325 preservado.

A conexão de Vercel foi novamente consultada após o pedido do usuário e continua retornando projetos vazios para a equipe conhecida. Não foi repetida a geração de links de consentimento defeituosos. A criação e a validação de uma prévia completa com voz real permanecem bloqueadas por acesso externo; mais testes simulados não resolveriam essa autenticação. Não se afirma que os três segundos tenham sido eliminados.

Sem novo link, push, deploy, publicação, merge, DNS ou alteração em Vercel/produção. Branch exclusiva mantida.
