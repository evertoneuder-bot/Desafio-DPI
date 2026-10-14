/* DPI menu actions: make the approved entry art's controls match the live game functions. */
(function(){
"use strict";
const escape=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function sourceRows(){
 let bank=[];try{bank=typeof BANK!=="undefined"&&Array.isArray(BANK)?BANK:[]}catch{}
 const map=new Map();
 for(const q of bank){const label=String(q.referencia||q.fonte||"").trim();if(!label)continue;const raw=q.referencia_url||q.fonte_url||q.url_referencia||q.doi_url||q.bibliografia_url||q.url_fonte||"";let url="";try{const u=new URL(raw,location.origin);if(["https:","http:"].includes(u.protocol)&&/^https?:\/\//i.test(raw))url=u.href}catch{}if(!map.has(label))map.set(label,url)}
 return [...map].map(([label,url])=>'<li>'+(url?'<a target="_blank" rel="noopener noreferrer" href="'+escape(url)+'">📚 '+escape(label)+'</a>':'📚 '+escape(label))+'</li>').join("");
}
function bibliography(){const rows=sourceRows();window.shell?.("BIBLIOGRAFIA DPI",'<p>Fontes bibliográficas associadas às questões do Desafio DPI.</p><ul class="dpi-bibliography-list">'+(rows||"<li>As referências aparecem junto às explicações das questões.</li>")+'</ul><button class="btn secondary" onclick="showHome()">← VOLTAR AO DPI</button>')}
function patch(){
 const home=document.getElementById("home");if(!home)return;
 for(const b of home.querySelectorAll("button")){
  const text=(b.textContent||"").trim().toLowerCase();
  if(/fechar o caso|fechar caso/.test(text)&&!b.dataset.dpiAction){b.dataset.dpiAction="plantao";b.textContent="PLANTÃO";b.setAttribute("aria-label","Abrir Plantão veterinário")}
  else if(/minhas conquistas/.test(text)&&!b.dataset.dpiAction){b.dataset.dpiAction="minigames";b.textContent="MINI JOGOS";b.setAttribute("aria-label","Abrir mini jogos")}
  else if(/^banco/.test(text)&&!b.dataset.dpiAction){b.dataset.dpiAction="hide-bank";b.hidden=true}
 }
 const stage=home.querySelector(".v26-stage");if(stage&&!stage.querySelector("#dpi-bibliography-home")){const b=document.createElement("button");b.id="dpi-bibliography-home";b.className="btn secondary";b.textContent="📚 BIBLIOGRAFIA";b.onclick=bibliography;b.style.cssText="display:block;margin:10px auto 18px;position:relative;z-index:8;max-width:90%;border:1px solid #d36cff;background:#2a0b46;color:#fff";stage.appendChild(b)}
}
function action(e){const b=e.target.closest?.('button[data-dpi-action]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(b.dataset.dpiAction==="plantao")window.ELXVetDuty?.show?.();else if(b.dataset.dpiAction==="minigames")window.challenges?.()}
document.addEventListener("click",action,true);
const observer=new MutationObserver(patch);observer.observe(document.documentElement,{childList:true,subtree:true});
patch();setTimeout(patch,700);setTimeout(patch,1800);
window.dpiBibliography=bibliography;
})();