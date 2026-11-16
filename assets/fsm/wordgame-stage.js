/** Reaproveita a caixa da arte aprovada; os canvases não deslocam texto nem grade. */
export function mountWordgameStage(doc, artwork) {
  const coach=doc.querySelector('.dpi-wordgame-coach');
  if(!coach||coach.querySelector('.dpi-wordgame-duo')||!artwork)return false;
  const image=coach.querySelector('img');if(!image)return false;
  const stage=doc.createElement('span');stage.className='dpi-wordgame-duo';
  stage.setAttribute('role','img');stage.setAttribute('aria-label','Tom e Fernanda, assistentes animados da missão');
  stage.style.cssText='position:absolute;display:grid;grid-template-columns:1fr 1fr;pointer-events:none;z-index:1';
  for(const persona of ['male','female']){const slot=doc.createElement('span');slot.style.cssText='display:block;position:relative;min-width:0;height:100%';slot.innerHTML=artwork.create('',persona);stage.appendChild(slot)}
  // A imagem original mantém todas as dimensões e regras responsivas da interface.
  image.style.visibility='hidden';image.style.animation='none';image.setAttribute('aria-hidden','true');
  coach.appendChild(stage);
  const align=()=>{if(!stage.isConnected){observer.disconnect();return}stage.style.left=image.offsetLeft+'px';stage.style.top=image.offsetTop+'px';stage.style.width=image.offsetWidth+'px';stage.style.height=image.offsetHeight+'px'};
  const observer=new ResizeObserver(align);observer.observe(image);observer.observe(coach);align();
  const label=coach.querySelector('.dpi-wordgame-speech b');if(label)label.textContent='Tom e Fernanda';
  return true;
}
