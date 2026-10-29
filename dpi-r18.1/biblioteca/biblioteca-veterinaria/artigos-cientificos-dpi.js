/* Curadoria de fontes científicas públicas para o EL-X VET — Desafio DPI.
   O catálogo guarda metadados e links. O jogo não redistribui artigos fechados. */
window.DPI_ARTIGOS_CIENTIFICOS = {
  platforms: [
    {name:'PubMed',kind:'Índice biomédico da NLM',url:'https://pubmed.ncbi.nlm.nih.gov/',access:'Registro e resumo; o texto integral pode depender do periódico.'},
    {name:'PubMed Central',kind:'Arquivo de texto integral da NLM',url:'https://pmc.ncbi.nlm.nih.gov/',access:'A licença e as permissões devem ser verificadas no artigo individual.'},
    {name:'ACVR / ECVDI',kind:'Colégios profissionais de diagnóstico por imagem veterinário',url:'https://www.acvr.org/',access:'Consensos e recomendações profissionais; a licença do texto integral continua sendo individual.'},
    {name:'SciELO',kind:'Biblioteca científica de acesso aberto',url:'https://scielo.org/',access:'Acesso ao texto depende do periódico e da licença indicada em cada artigo.'},
    {name:'DOAJ',kind:'Diretório de periódicos de acesso aberto',url:'https://doaj.org/',access:'Use o diretório para localizar periódicos; confirme a licença na página de cada artigo.'}
  ],
  articles: [
    {title:'ACVR and ECVDI consensus statement for the standardization of the abdominal ultrasound examination',authors:'Seiler et al.',year:2022,type:'Consenso profissional',pmid:'36189784',doi:'10.1111/vru.13151',summary:'O registro PubMed descreve o documento como material de padronização e ensino para o exame ultrassonográfico abdominal.',dpi:'Ajuda a formular aquisição e descrição; não transforma ultrassom em resposta automática para todo sinal abdominal.',use:'Técnica e protocolo de ultrassom abdominal.'},
    {title:'American College of Veterinary Radiology and European College of Veterinary Diagnostic Imaging consensus statement on imaging report foundations',authors:'Scrivani et al.',year:2025,type:'Consenso profissional',pmid:'39681983',doi:'10.1111/vru.13471',summary:'Consenso profissional sobre fundamentos dos relatórios de diagnóstico por imagem.',dpi:'Pode apoiar questões sobre estrutura e comunicação de relatórios, sem extrapolar o que a imagem demonstra.',use:'Laudo, terminologia e comunicação de achados.'},
    {title:'Diagnostic accuracy of tests based on radiologic measurements of dogs and cats: a systematic review',authors:'Lamb et al.',year:2015,type:'Revisão sistemática',pmid:'25339347',summary:'Revisa estudos de acurácia diagnóstica que usam medidas radiográficas, ultrassonográficas, tomográficas ou de ressonância.',dpi:'Reforça que uma medida de imagem deve ser validada contra um padrão de referência e interpretada no contexto clínico.',use:'Acurácia, limitações e força da evidência.'},
    {title:'The use of ultrasound for dogs and cats in the emergency room: AFAST and TFAST',authors:'Boysen; Lisciandro',year:2013,type:'Revisão clínica',pmid:'23747260',doi:'10.1016/j.cvsm.2013.03.011',summary:'O resumo do PubMed diz que a revisão discute indicações de ultrassom focado em emergência para cães e gatos.',dpi:'Exemplo de modalidade para perguntas focadas; o artigo deve ser lido para compreender o escopo e as limitações.',use:'Plantão, emergência e ultrassom focado.'},
    {title:'Thoracic computed tomographic interpretation for clinicians to aid in the diagnosis of dogs and cats with respiratory disease',authors:'Masseau; Reinero',year:2019,type:'Revisão clínica',pmid:'31685132',doi:'10.1016/j.tvjl.2019.105388',summary:'Apresenta princípios, aquisição e interpretação sistemática de tomografia torácica em cães e gatos.',dpi:'Mostra o papel complementar da tomografia e a importância de terminologia e aquisição adequadas.',use:'Tórax, tomografia e doenças respiratórias.'},
    {title:'Diagnosis of pancreatitis in dogs and cats',authors:'Xenoulis',year:2015,type:'Revisão clínica',pmid:'25586803',doi:'10.1111/jsap.12274',summary:'O resumo do PubMed afirma que a radiografia abdominal pode ajudar a excluir outras doenças com sinais semelhantes.',dpi:'Exemplo de uso complementar: a radiografia pode ajudar a excluir diferenciais; não a apresentamos como confirmação isolada.',use:'Quando imagem é complementar ao diagnóstico.'}
  ],
  regulations: [
    {title:'Resolução CFMV nº 1.321/2020, com alterações da Resolução CFMV nº 1.653/2025',category:'Norma profissional oficial',url:'https://manual.cfmv.gov.br/arquivos/resolucao/1321.pdf',updatedUrl:'https://manual.cfmv.gov.br/arquivos/resolucao/1653.pdf',confirmed:'A consolidação oficial define documentos e prontuário veterinário. A alteração de 2025 prevê duas vias físicas e/ou digitais para documentos (com exceções descritas), cópia impressa ou digital de cada laudo de exame complementar clínico-laboratorial especializado ou de imagem no prontuário e regras e prazos para pedidos de cópia. Prazo geral: até 5 dias úteis; se não cumprido, justificativa escrita e novo prazo de até 30 dias úteis. Cópias de exames realizados por terceiros contratados pelo próprio estabelecimento: até 30 dias úteis. Exames contratados diretamente pelo responsável são solicitados ao estabelecimento que os realizou. O pedido precisa permitir conferência de identidade, com comprovante de recebimento, e é restrito ao responsável cadastrado ou representante autorizado.'},
    {title:'Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais',category:'Lei federal oficial',url:'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm',confirmed:'Na rotina de entrega, tratar com cuidado os dados pessoais identificáveis do responsável pelo animal: controlar acesso, conferir destinatário e usar canal apropriado. O registro da lei é a fonte; a aplicação concreta depende do fluxo e do agente de tratamento.'},
    {title:'Norma ANSN 3.01 — requisitos básicos de radioproteção (Resolução CNEN 344/2025)',category:'Norma federal oficial — escopo geral e limite regulatório',url:'https://www.gov.br/cnen/pt-br/acesso-rapido/normas/grupo-3/ansn-3-01-requisitos-basicos-de-radioprotecao-e-seguranca-radiologica-de-fontes-de-radiacao.pdf',confirmed:'A versão oficial de julho de 2025 estabelece requisitos básicos de radioproteção. O art. 5º declara que instalações e atividades que usam raios X para diagnóstico veterinário não estão sob controle regulatório da ANSN. Isso não significa, por si só, ausência de outras regras ou deveres aplicáveis; verificar a norma e a autoridade competentes para cada situação.'},
    {title:'Norma CNEN NN 6.12 — radioterapia e medicina nuclear veterinária',category:'Norma federal oficial — escopo específico',url:'https://www.gov.br/cnen/pt-br/acesso-rapido/normas/grupo-6/NormaCNENNN6.12.pdf',confirmed:'A norma trata de radioterapia e medicina nuclear veterinária; o § 2º do art. 2º declara que suas disposições não se aplicam à prática de radiodiagnóstico veterinário. Não usar esta norma específica como fundamento para radiografia convencional veterinária.'}
  ],
  deliveryProtocol: [
    {type:'norma_confirmada',text:'Entregar e manter cópia documental conforme a Resolução CFMV nº 1.321/2020 atualizada pela Resolução nº 1.653/2025; registrar pedido, conferência de identidade, entrega e comprovante.'},
    {type:'boa_pratica_operacional',text:'Conferir identificação do animal e do responsável, pedido e pergunta clínica; conferir se relatório e imagens correspondem ao mesmo estudo; enviar pelo canal autorizado e registrar a comunicação com o médico-veterinário solicitante.'},
    {type:'boa_pratica_tecnica',text:'Combinar por escrito o conjunto de arquivos, visualizador, canal seguro e prazo de rotina. DICOM e PDF podem ser opções técnicas quando compatíveis com o equipamento e o fluxo, mas as fontes oficiais acima não estabelecem esses formatos como obrigação universal de entrega.'}
  ],
  note:'Seleção curatorial inicial, não ranking bibliométrico. “Consenso”, “revisão sistemática” e “revisão clínica” identificam o tipo de publicação; não substituem leitura crítica, atualização nem avaliação de qualidade para cada decisão.'
};

/* User-provided Drive sources: metadata only; Drive permissions remain unchanged. */
window.DPI_ARTIGOS_CIENTIFICOS.localResources = [
  {
    "title": "POP TRAUMA.pptx",
    "type": "Apresentação de protocolo/trauma",
    "url": "https://drive.google.com/file/d/1bt7NSlqzTE1Zec5yn_KfZutPOrUM_x5G/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Instruções raio-x.pptx",
    "type": "Apresentação de instruções radiográficas",
    "url": "https://drive.google.com/file/d/1m9AMWygLYZO0icEkTmaUJDl3LaJ6nwgW/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "POP de Radiologia Veterinária — Daniel dos Santos Baptista",
    "type": "Manual PDF; inclui bibliografia na p. 84",
    "url": "https://drive.google.com/file/d/15CBAzZyxKUkEdt8SKt88qiR8xYNf3Trx/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Posicionamentos radiográficos.pptx",
    "type": "Apresentação de posicionamentos",
    "url": "https://drive.google.com/file/d/1BWU8K0LXKusCzz0b4Dg1eMqF1LGlSFbT/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Padrão Solicitações..pdf",
    "type": "Documento de solicitações",
    "url": "https://drive.google.com/file/d/14O2aDEFmn3fLtWpPCm9fJgJIBRgjmIS2/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "diagnostico-de-radiologia-veterinario-donald-e-thrall-dvm-phd_compress.pdf",
    "type": "Livro PDF no Drive; direitos/licença a confirmar antes de republicação",
    "url": "https://drive.google.com/file/d/1Q1gtoiPRJ3TvK4r9X3WKMijSKoXEsXdR/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Identificação das imagens radiográficas.pptx",
    "type": "Apresentação de identificação das imagens",
    "url": "https://drive.google.com/file/d/1fBo3iNKf81BSnFRwv_kcT-D2dXOPgCmx/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "EBOOK - 200 Descrições de Alterações Radiográficas.pdf",
    "type": "E-book; direitos/licença a confirmar antes de republicação",
    "url": "https://drive.google.com/file/d/18hEIL89clnlpxpp2iHV0vaKfK2BilQig/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Identificação das imagens radiográficas.pdf",
    "type": "Material de estudo em PDF",
    "url": "https://drive.google.com/file/d/1qNF-bCdgiWPlXdykZriENFkTg3xejMDG/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "EBOOK_200_Descrições_de_Alterações_Ultrassonográficas (atalho)",
    "type": "Atalho para material de ultrassonografia; requer abrir no Drive",
    "url": "https://drive.google.com/file/d/13CS94mfD_6UMMYQR9p9N6PJyUKAfo22y/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Protocolos DPI-CMA.pptx",
    "type": "Apresentação de protocolos DPI",
    "url": "https://drive.google.com/file/d/1iiAGTFmul5PzdhbodTknhT4GJcDNfImA/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Protocolos DPI.pptx",
    "type": "Apresentação de protocolos DPI",
    "url": "https://drive.google.com/file/d/19bmO4rbEHOqqQU2OUoqPJ1oh3NaLpu_X/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Preparo ultrassonografico-CMA.pptx",
    "type": "Apresentação de preparo para ultrassonografia",
    "url": "https://drive.google.com/file/d/1ELOLtBbdeuDKecz-n30pMs9lY_QKw24u/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Preparo ultrassonografico.pptx",
    "type": "Apresentação de preparo para ultrassonografia",
    "url": "https://drive.google.com/file/d/1mmjQrqvxZ2vb2FJSbJark3y1f98krLsH/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Prazo para entrega de RX e US-CMA.pptx",
    "type": "Apresentação de prazos/fluxo",
    "url": "https://drive.google.com/file/d/1za9TK_C2SsJWaIi4NSlsNyIe4vQL20Yu/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Prazo para entrega de RX e US.pptx",
    "type": "Apresentação de prazos/fluxo",
    "url": "https://drive.google.com/file/d/1oKSIugZN67LTQVWo1Nc7E8JDw2jVuGPB/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "Instruções para realização de exame radiográfico — Meireles.mp4",
    "type": "Vídeo de instruções radiográficas",
    "url": "https://drive.google.com/file/d/1O8YE7NT8O7d_dzahVL1Otlv6bcXRXRAW/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "CR. Meireles e Messejana.zip",
    "type": "Arquivo de apoio de radiologia digital",
    "url": "https://drive.google.com/file/d/1TdcP6VM1rQySN5xHsz5lN2aER3wZQ2dr/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  },
  {
    "title": "CR. Meireles e Messejana.mp4",
    "type": "Vídeo de apoio de radiologia digital",
    "url": "https://drive.google.com/file/d/1hmzffZ5jETnEDwHwS8brLmzmd2Wp8rB4/view",
    "license_status": "unverified",
    "public_preview": "bibliographic_metadata_only"
  }
];
