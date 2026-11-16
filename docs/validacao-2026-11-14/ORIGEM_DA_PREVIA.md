# Reconciliação da prévia rejeitada — 14/11/2026

O usuário rejeitou como totalmente defasada a cópia privada publicada em `https://desafio-dpi-mobile-teste-20261114.everton-euder.chatgpt.site`. Não usar essa cópia como evidência de aprovação visual.

Referência recuperada das conversas de novembro e aberta com sucesso no navegador em 14/11:

https://desafio-dpi-veterinario-v40-previe-git-9033c1-evertoneuder-6390.vercel.app/dpi-home

Observação direta: título “Desafio DPI · EL-X VET”; capa com Tom e Fernanda, marca central, Estude/Pratique/Evolua/Compartilhe e Começar. O botão Começar abriu `/dpi-r18.1/ABRA-ESTA-PREVIA?mode=start&return=dpi`, exibiu o cadastro e permitiu continuar como visitante. A entrada como visitante chegou ao menu “Escolha como quer jogar”, com Quiz, Minijogos, Plantão e Minhas conquistas. Não foram medidos áudio ou latência.

O DOM da aplicação publicada referencia módulos ausentes na branch usada na cópia, incluindo:

- `dpi-spoken-text.js`
- `dpi-audio-playback.js`
- `dpi-browser-voice.js`
- `dpi-speech-stream.js`
- `dpi-duo-speech.js`
- `dpi-menu-cards.js`
- `../assets/dpi-2d-art.js?v=duo-tom-fernanda-v2`
- `../assets/dpi-puppet-driver.js?v=duo-tom-fernanda-v2`

Isso demonstra uma divergência da composição da página publicada em relação à árvore copiada. A observação de referências não comprova isoladamente a execução correta de cada módulo. Não atribuir automaticamente todo o conteúdo servido ao SHA histórico ff56b03 apenas pelo nome do domínio ou por registros de implantação antigos: a procedência exata do snapshot atual ainda requer conferência de seus arquivos.

A branch remota de diagnóstico avançou a `7a2caf9b8b4179afad312f54b5324a8136d659dd`; a comparação com 42f5ae4 mostra três commits e somente a inclusão de `tests/dpi-plantao-phase-narration.test.cjs`. As correções locais permanecem preservadas, sem rebase ou sobrescrita. A branch R43.3 contém outra linha de alterações, divergente; não tratá-la como aprovada nem mesclar visual automaticamente.

Nenhuma versão foi substituída ou publicada nesta reconciliação. As correções locais de áudio desta conversa ainda não foram aplicadas à prévia de referência. Próxima implementação: recuperar a fonte completa efetivamente servida e sua proveniência antes de transportar correções. Não repetir a cópia baseada somente no GitHub nem substituir a referência por Sites antigos R41/R42 ou V26 históricos.
