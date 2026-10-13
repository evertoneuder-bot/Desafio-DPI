/* Catalog interface: displays specialties without inventing unsourced questions. */
(function(){
"use strict";
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let catalog=null;
async function load(){if(catalog)return catalog;const r=await fetch("/data/especialidades-catalogo.json");if(!r.ok)throw Error("Biblioteca de especialidades indisponível");catalog=await r.json();return catalog;}
window.dpiEspecialidades=async function(filter=""){
 try{
 const data=await load();const q=String(filter).toLocaleLowerCase("pt-BR").trim();
 const html='<div class="miniStage"><label for="dpi-specialty-search">Buscar especialidade</label><input id="dpi-specialty-search" aria-label="Buscar especialidade" placeholder="Ex.: Toxicologia, Saúde Pública" style="width:100%;padding:12px;margin:8px 0 18px;border-radius:10px" value="'+escapeHTML(filter)+'" oninput="dpiFilterSpecialties(this.value)"><div id="dpi-specialty-list">'+list(data,q)+'</div><button class="btn" onclick="dpiChooseStudyArea()">🎮 FAÇA SEU PRÓPRIO JOGO</button><p class="muted">Questões liberadas somente após validação das referências científicas da Biblioteca DPI.</p><button class="btn secondary" onclick="challenges()">← VOLTAR</button></div>';
 window.shell("ESPECIALIDADES VETERINÁRIAS",html);
 }catch(e){window.shell("ESPECIALIDADES VETERINÁRIAS",'<p>Não foi possível carregar o catálogo. Tente novamente.</p><button class="btn" onclick="challenges()">VOLTAR</button>');}
};
function list(data,q){return Object.entries(data.categories).map(([group,items])=>{const filtered=items.filter(s=>s.toLocaleLowerCase("pt-BR").includes(q));return filtered.length?'<section><h3>'+escapeHTML(group)+'</h3>'+filtered.map(s=>'<button class="btn secondary" style="margin:4px" onclick="dpiSpecialtyDetail('+JSON.stringify(s).replace(/"/g,"&quot;")+')">'+escapeHTML(s)+'</button>').join('')+'</section>':''}).join('')||'<p>Nenhuma especialidade encontrada.</p>';}
window.dpiFilterSpecialties=function(value){const target=document.getElementById("dpi-specialty-list");if(target&&catalog)target.innerHTML=list(catalog,String(value).toLocaleLowerCase("pt-BR").trim());};
window.dpiSpecialtyDetail=function(name){window.shell(escapeHTML(name),'<p>Especialidade cadastrada.</p><p class="muted">As perguntas serão disponibilizadas quando as fontes da Biblioteca Científica DPI forem verificadas. Não serão geradas respostas sem referência.</p><button class="btn secondary" onclick="dpiEspecialidades()">← ESPECIALIDADES</button>');};

window.dpiProporQuiz=function(area="veterinária"){
 window.dpiCurrentStudyArea=area;
 window.shell("FAÇA SEU PRÓPRIO JOGO",'<div class="miniStage"><p>Todo conhecimento pode virar um desafio. Escolha seu universo e aprenda jogando! Nesta prévia, o tema fica salvo como proposta; a criação automática do jogo ainda não está disponível.</p><label for="dpi-topic">Assunto de estudo</label><input id="dpi-topic" maxlength="180" placeholder="Ex.: interpretação radiográfica, matemática ou história" style="width:100%;padding:12px;margin:8px 0 14px"><label for="dpi-reference">Referência científica (título, DOI ou URL)</label><input id="dpi-reference" maxlength="500" placeholder="Identifique a fonte para conferência" style="width:100%;padding:12px;margin:8px 0 14px"><label for="dpi-document">Material de estudo — artigo, capítulo de livro, apostila ou anotações (PDF ou texto, até 10 MB)</label><input id="dpi-document" type="file" accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" style="display:block;margin:8px 0 16px"><p class="muted">Envie apenas materiais que você tem autorização para utilizar. Não inclua dados pessoais de pacientes ou documentos confidenciais de clínicas. Nesta prévia, o arquivo não é enviado: somente a proposta fica registrada no navegador. Anotações e resumos pessoais são privados do autor e não podem integrar a biblioteca pública automaticamente. Fontes não verificadas precisam de revisão científica antes de publicação na biblioteca oficial.</p><button class="btn" onclick="dpiSaveQuizProposal()">REGISTRAR PROPOSTA PARA REVISÃO</button><button class="btn secondary" onclick="dpiEspecialidades()">← VOLTAR</button><p id="dpi-proposal-result" role="status"></p></div>');
};
window.dpiSaveQuizProposal=function(){
 const topic=document.getElementById("dpi-topic").value.trim(),ref=document.getElementById("dpi-reference").value.trim(),file=document.getElementById("dpi-document").files[0],out=document.getElementById("dpi-proposal-result");
 if(topic.length<5){out.textContent="Informe um assunto de estudo específico.";return;}
 if(file&&file.size>10*1024*1024){out.textContent="O documento excede 10 MB.";return;}
 const allowed=["pdf","txt","md"];if(file&&!allowed.includes((file.name.split(".").pop()||"").toLowerCase())){out.textContent="Formato de documento não aceito.";return;}
 const proposal={topic,reference:ref,fileName:file?file.name:null,submittedAt:new Date().toISOString(),status:"pendente de revisão científica",scope:window.dpiCurrentStudyArea||"veterinária",visibility:"private",publicationAllowed:false};
 try{const key="dpi-quiz-proposals-local";const items=JSON.parse(localStorage.getItem(key)||"[]");items.push(proposal);localStorage.setItem(key,JSON.stringify(items.slice(-30)));out.textContent="Proposta registrada neste aparelho, aguardando integração com a fila de aprovação DPI. Nenhum arquivo foi enviado ou publicado.";}
 catch(e){out.textContent="Não foi possível salvar a proposta neste aparelho.";}
};

window.dpiChooseStudyArea=function(){window.shell("FAÇA SEU PRÓPRIO JOGO",'<p>Todo conhecimento pode virar um desafio. Escolha seu universo e aprenda jogando!</p><button class="btn" onclick="dpiProporQuiz(\'veterinária\')">⚕ LX-VET — MEDICINA VETERINÁRIA</button><button class="btn secondary" onclick="dpiProporQuiz(\'outras áreas\')">🎓 OUTRAS ÁREAS LX — CRIE SEU JOGO!</button><p class="muted">Cada área LX terá biblioteca própria: LX-VET, LX-Psicologia, LX-Direito e outras. Propostas pessoais são privadas por padrão.</p><button class="btn secondary" onclick="dpiEspecialidades()">← VOLTAR</button>');};
const old=window.challenges;
if(typeof old==="function")window.challenges=function(){old.apply(this,arguments);const p=document.querySelector("#internal .panel");if(!p)return;const btn=document.createElement("button");btn.className="btn";btn.textContent="📚 ESPECIALIDADES VETERINÁRIAS";btn.onclick=()=>window.dpiEspecialidades();const nav=p.querySelector(".navrow");if(nav)nav.before(btn);else p.appendChild(btn);};
})();