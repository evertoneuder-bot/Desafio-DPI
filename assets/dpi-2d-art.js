/* Approved-source 2D layers, shared by the cover and the game. */
(function(){'use strict';
const currentArt=new URL('./mascotes-realistas-v2.avif',document.currentScript?.src||'https://example.test/assets/dpi-2d-art.js').href;
function create(src,persona){return `<canvas class="dpi-2d-rig dpi-acting-canvas" data-persona="${persona}" width="800" height="960" aria-hidden="true"></canvas>`;}
const motionKey='dpi-mascot-motion';
function getMotion(){try{const value=localStorage.getItem(motionKey);return ['full','off'].includes(value)?value:'auto'}catch{return 'auto'}}
function applyMotion(){if(document.documentElement)document.documentElement.dataset.dpiMascotMotion=getMotion();const control=document.getElementById?.('dpi-mascot-motion-setting');if(control)control.value=getMotion()}
function setMotion(value){if(!['auto','full','off'].includes(value))throw new Error('Invalid mascot motion preference');try{localStorage.setItem(motionKey,value)}catch{}if(document.documentElement)document.documentElement.dataset.dpiMascotMotion=value;const control=document.getElementById?.('dpi-mascot-motion-setting');if(control)control.value=value}
function installControl(){
 if(document.getElementById?.('dpi-mascot-motion-setting'))return;
 const heading=[...document.querySelectorAll('#internal h2')].find(node=>node.textContent.trim()==='CONFIGURAÇÕES');
 if(!heading)return;const panel=heading.closest('.dpi-game-panel')||heading.parentElement;
 const group=document.createElement('div');group.className='dpi-mascot-motion-preference';
 const label=document.createElement('label');label.htmlFor='dpi-mascot-motion-setting';label.textContent='Animações dos mascotes';
 const select=document.createElement('select');select.id='dpi-mascot-motion-setting';select.setAttribute('aria-label','Animações dos mascotes');
 for(const [value,text] of [['auto','Automático (sistema)'],['full','Ativadas'],['off','Desativadas']]){const option=document.createElement('option');option.value=value;option.textContent=text;select.append(option)}
 select.value=getMotion();select.addEventListener('change',()=>setMotion(select.value));
 const note=document.createElement('p');note.className='muted';note.textContent='Automático respeita a redução de movimento do sistema. Ativadas permite os movimentos somente neste jogo. A escolha fica salva neste navegador.';
 group.append(label,select,note);panel.append(group);
}
window.DPI2DArtwork={create,getMotion,setMotion,installControl};applyMotion();
if(window.addEventListener)window.addEventListener('storage',event=>{if(event.key===motionKey)applyMotion()});
if(typeof MutationObserver==='function')new MutationObserver(installControl).observe(document.body,{childList:true,subtree:true});

const style=document.createElement('style');style.id='dpi2d-artwork-core';style.textContent=`#internal .dpi-play-coach .dpi-play-coach-label,#internal .dpi-play-coach .dpi-play-speech,body:not(.elx-portal-on) #internal .dpi-play-coach #elx-character-stage.is-dpi-coach{grid-column:1!important}.dpi-acting-canvas{display:block;position:relative;left:-12.5%;width:125%!important;max-width:none;height:100%;object-fit:contain;pointer-events:none;animation:none!important;transform:none!important}.dpi-hero-mascot{animation:none!important;transform:none!important}.dpi-mascot-motion-preference{margin-top:18px}.dpi-mascot-motion-preference label{display:block;margin-bottom:8px}.dpi-mascot-motion-preference select{width:100%;padding:10px;font:inherit}`;document.head.append(style);
for(const hero of document.querySelectorAll('.dpi-hero-mascot')){
 const who=hero.classList.contains('everton')?'male':'female';
 const src=getComputedStyle(hero).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];
 if(!src)continue;
 hero.innerHTML=create(src,who);
 hero.style.backgroundImage='none';hero.dataset.animationVersion='puppet-2d-v8';
}
})();
