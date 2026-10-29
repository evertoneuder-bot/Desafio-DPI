# EL-X VET — Desafio DPI · candidata de prévia R42.9

A R37 parte da R34 aprovada. Preserva o layout, as 300 questões originais, a biblioteca aprovada e os jogos. A R37 preserva as 300 questões aprovadas e acrescenta dezessete questões autorais: dez baseadas no livro de radiologia consultado no Drive e sete questões de trauma baseadas em fontes veterinárias públicas verificadas. O banco continua preparado para novas expansões fundamentadas.

## Ajustes R41

- A sirene toca imediatamente ao clicar em Plantão e aparece antes da seleção temática.
- O Relâmpago dá 60 segundos para cada resposta.

## Rodadas completas do Plantão

- O Plantão abre uma seleção de rodadas: trauma craniano, trauma pélvico, trauma de membros, respiratório/hipóxia, parto/distocia e plantão misto.
- Cada rodada tem 12 decisões com fases de avaliação, prioridades e segurança, pergunta clínica, plano de imagem, aquisição, interpretação, reavaliação e comunicação.
- Cada decisão mantém 2 minutos e a abertura conserva a sirene aprovada.
- A rodada de parto/distocia inclui retenção fetal e avaliação de viabilidade, com 8 perguntas novas rastreáveis ao Merck Veterinary Manual.

## Como abrir

- `ABRIR-CAPA-DPI-WINDOWS.bat` abre a capa integrada.
- `ABRIR-DPI-DIRETO-WINDOWS.bat` abre o Quiz.
- Para usar, extraia o ZIP completo e mantenha aberta a janela do servidor local.

## Banco ampliável

- As 300 questões atuais permanecem intactas; o banco desta versão contém 325 questões (300 aprovadas + 25 adicionais: 10 da R36, 7 de trauma da R37 e 8 de parto/distocia da R40).
- Não há teto fixo para o total: o banco de novas questões está em `dpi-r18.1/dados/banco-dpi-adicional.js`; ele contém as dez questões da R36 e as sete novas questões clínicas da R37 e recebe futuras inclusões.
- A interface calcula o total disponível e o campo de quantidade pelo tamanho real do banco.
- Alternativas do Plantão são avaliadas pelo texto correto exibido, mesmo que a ordem visual tenha mudado; a seleção errada fica vermelha e o gabarito, verde.
- Rodadas dos minijogos, quiz e Plantão evitam repetir a mesma resposta correta na rodada e priorizam respostas ainda não usadas em rodadas anteriores da mesma sessão.
- O Plantão mantém 12 decisões e agora seleciona 12 respostas distintas, com sete novas questões clínicas apoiadas em fontes veterinárias verificadas.
- Questões adicionais aceitas entram nos modos e minijogos que usam o banco comum.
- Cada registro adicional precisa seguir o esquema integral do banco atual, incluindo dificuldade, formas aceitas pela voz, pontuação, estado ativo, referência e URL `http`/`https` da fonte.
- Itens incompletos, URLs inválidas e IDs duplicados são ignorados, preservando o banco original.
- A inclusão de uma obra na biblioteca não cria perguntas sozinha. As questões devem ser elaboradas a partir da fonte confirmada, vinculadas a ela e revisadas antes de serem adicionadas.

Consulte `dpi-r18.1/dados/COMO-AMPLIAR-O-BANCO-DPI.txt` para o procedimento e o modelo.

## Validação histórica R37

- 73 testes automatizados cobrem a preservação das 300 questões originais, as 25 adicionais, os modos de jogo, fontes, duplicatas, contagens e cores do feedback do Plantão.
- Nenhuma publicação ou implantação foi feita.
- A R34 aprovada permanece preservada para retorno.


## R42.2 — correção mobile e bibliografia

A candidata R42.2 mantém a correção de cascata mobile, que aplica os estilos de telefone depois das folhas legadas que antes os anulavam. O breakpoint permanece limitado a telas de até 600 px; as regras web e tablet continuam inalteradas. As mecânicas e a camada web aprovada permanecem preservadas. A biblioteca agora reflete as 325 questões e oferece links diretos para fontes verificadas quando registrados. A suíte atualizada passa com 89 testes. Consulte `RELATORIO-REVISAO-R42.2.md`.

## R42.4 — paridade das rotas de voz

A R42.4 parte da R42.3 e preserva a interface, os jogos, o banco e os arquivos anteriores. Corrige a cópia do endpoint TTS na raiz do pacote para corresponder à implementação segura da pasta `dpi-r18.1`, adiciona um teste que detecta divergências futuras e mantém a classificação segura de falhas do provedor. A suíte completa passa com 171 testes. Esta candidata local ainda precisa ser implantada no projeto Vercel para que o backend seja validado; nenhuma publicação ou chamada paga foi feita.

## R42.5 — diagnóstico de falhas de voz

A R42.5 mantém as interfaces web e mobile, os jogos, o banco e as fontes da R42.4. Corrige o cliente de voz para preservar as categorias de erro seguras devolvidas pela API (chave, permissão, cota, modelo/voz e serviço indisponível) e exibi-las em português no painel de voz e na conversa. As gravações aprovadas seguem disponíveis; nenhum texto bruto do provedor ou segredo é mostrado. A candidata passa em 174 testes. Ainda depende de implantação e de configuração válida do serviço para testar a voz neural no ambiente online.


## R42.9 — entrada mobile acordada (prévia isolada)

- A versão desktop continua usando a entrada web existente. A raiz encaminha automaticamente larguras de celular (até 600 px) para `dpi-home.html`; tablet permanece no layout web.
- A capa mobile preserva a logo original central entre Everton e Fernanda e usa a imagem clínica de radiologia já existente no projeto.
- A capa não exibe cartões de quiz, desafios, plantão ou conquistas. `COMEÇAR` abre a identificação; depois do cadastro ou da entrada como visitante, abre o menu do jogo.
- `ESTUDE`, `PRATIQUE` e `EVOLUA` abrem suas funções informativas/demonstrativas. `PRATIQUE` percorre uma questão demonstrativa de cada modalidade, com opção de pular ou desistir. `COMPARTILHE` oferece WhatsApp, e-mail, cópia e compartilhamento nativo quando disponível.
- A trilha musical permanece desativada; a versão preserva efeitos e voz configurável.
- Branch de teste: `codex/r42.9-agreed-mobile-20261029`. A R42.8 anterior continua disponível como commit pai.
- Teste direcionado da nova entrada: 6/6 aprovados. A suíte histórica da R42.8 já contém 7 testes incompatíveis com seu próprio código (ver saída da candidata R42.8); não os apresento como aprovação da R42.9.
