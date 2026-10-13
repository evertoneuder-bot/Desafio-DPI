/* Catalog interface: displays specialties without inventing unsourced questions. */
(function(){
"use strict";
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let catalog=null;
async function load(){if(catalog)return catalog;const r=await fetch("/data/especialidades-catalogo.json");if(!r.ok)throw Error("Biblioteca de especialidades indisponível");catalog=await r.json();return catalog;}
window.dpiEspecialidades=async function(filter=""){
 try{
 const data=await load();const q=String(filter).toLocaleLowerCase("pt-BR").trim();
 const html='<div class="miniStage"><label for="dpi-specialty-search">Buscar especialidade</label><input id="dpi-specialty-search" aria-label="Buscar especialidade" placeholder="Ex.: Toxicologia, Saúde Pública" style="width:100%;padding:12px;margin:8px 0 18px;border-radius:10px" value="'+escapeHTML(filter)+'" oninput="dpiFilterSpecialties(this.value)"><div id="dpi-specialty-list">'+list(data,q)+'</div><p class="muted">Questões liberadas somente após validação das referências científicas da Biblioteca DPI.</p><button class="btn secondary" onclick="challenges()">← VOLTAR</button></div>';
 window.shell("ESPECIALIDADES VETERINÁRIAS",html);
 }catch(e){window.shell("ESPECIALIDADES VETERINÁRIAS",'<p>Não foi possível carregar o catálogo. Tente novamente.</p><button class="btn" onclick="challenges()">VOLTAR</button>');}
};
function list(data,q){return Object.entries(data.categories).map(([group,items])=>{const filtered=items.filter(s=>s.toLocaleLowerCase("pt-BR").includes(q));return filtered.length?'<section><h3>'+escapeHTML(group)+'</h3>'+filtered.map(s=>'<button class="btn secondary" style="margin:4px" onclick="dpiSpecialtyDetail('+JSON.stringify(s).replace(/"/g,"&quot;")+')">'+escapeHTML(s)+'</button>').join('')+'</section>':''}).join('')||'<p>Nenhuma especialidade encontrada.</p>';}
window.dpiFilterSpecialties=function(value){const target=document.getElementById("dpi-specialty-list");if(target&&catalog)target.innerHTML=list(catalog,String(value).toLocaleLowerCase("pt-BR").trim());};
window.dpiSpecialtyDetail=function(name){window.shell(escapeHTML(name),'<p>Especialidade cadastrada.</p><p class="muted">As perguntas serão disponibilizadas quando as fontes da Biblioteca Científica DPI forem verificadas. Não serão geradas respostas sem referência.</p><button class="btn secondary" onclick="dpiEspecialidades()">← ESPECIALIDADES</button>');};
const old=window.challenges;
if(typeof old==="function")window.challenges=function(){old.apply(this,arguments);const p=document.querySelector("#internal .panel");if(!p)return;const btn=document.createElement("button");btn.className="btn";btn.textContent="📚 ESPECIALIDADES VETERINÁRIAS";btn.onclick=()=>window.dpiEspecialidades();const nav=p.querySelector(".navrow");if(nav)nav.before(btn);else p.appendChild(btn);};
})();