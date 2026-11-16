import {tomNameplates} from './tom-nameplate.js';
/** Renderização de sprites em Canvas 2D transparente; sem mover o canvas no layout. */
export class SpriteRenderer {
  constructor(canvas, clips) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    if (!this.context) throw new Error('Canvas 2D não disponível.');
    this.clips = clips;
    this.characterScale = canvas.dataset.persona === 'female' ? .5 : 1;
    this.images = new Map();
  }
  async load() {
    const sources = [...new Set(Object.values(this.clips).map(clip => clip.src))];
    await Promise.all(sources.map(async src => {
      const image = new Image();
      image.src = src;
      await image.decode();
      if(this.canvas.dataset.persona==='male'){
        const texture=document.createElement('canvas');texture.width=image.naturalWidth;texture.height=image.naturalHeight;
        const paint=texture.getContext('2d');paint.drawImage(image,0,0);
        for(const b of tomNameplates){paint.fillStyle='#0d203b';paint.fillRect(b.x,b.y,b.w,b.h);paint.fillStyle='#fff';paint.font='700 '+Math.min(11,b.h-1)+'px Arial';paint.textAlign='center';paint.textBaseline='middle';paint.fillText('Tom',b.x+b.w/2,b.y+b.h/2,b.w-3)}
        texture.naturalWidth=texture.width;texture.naturalHeight=texture.height;this.images.set(src,texture);
      }else this.images.set(src,image);
    }));
    for (const [name, clip] of Object.entries(this.clips)) {
      if (!Number.isFinite(clip.stageWidth) || clip.stageWidth <= 0 || !Number.isFinite(clip.stageHeight) || clip.stageHeight <= 0 || !clip.frames?.length || !clip.frames.every(f =>
        [f.x, f.y, f.w, f.h, f.duration, f.anchorX, f.anchorY].every(Number.isFinite) &&
        f.w > 0 && f.h > 0 && f.duration > 0)) throw new Error('Clip inválido: ' + name);
      if (name === 'IDLE_QUIZ' && clip.frames.some(f => (f.offsetY || 0) !== 0)) throw new Error('Repouso não pode flutuar.');
      const image = this.images.get(clip.src);
      if (clip.frames.some(f => f.x < 0 || f.y < 0 || f.x + f.w > image.naturalWidth || f.y + f.h > image.naturalHeight)) {
        throw new Error('Quadro fora da spritesheet: ' + name);
      }
    }
  }
  frameAt(clip, time) {
    const duration = clip.frames.reduce((sum, f) => sum + f.duration, 0);
    let at = clip.loop ? time % duration : Math.min(time, duration - 1e-9);
    for (const frame of clip.frames) { if (at < frame.duration) return frame; at -= frame.duration; }
    return clip.frames.at(-1);
  }
  drawClip(name, time, opacity, exactFrame = null) {
    if (opacity <= 0) return;
    const clip = this.clips[name];
    if (!clip) throw new Error('Falta spritesheet para o estado ' + name);
    const image = this.images.get(clip.src);
    const frame = exactFrame || this.frameAt(clip, time);
    // Escala comum por personagem: não recalcular a escala pelo contorno de cada pose.
    const baseScale = Math.min(this.canvas.width / clip.stageWidth, this.canvas.height / clip.stageHeight);
    const scale = baseScale * this.characterScale;
    const footX = this.canvas.width / 2;
    const footY = this.canvas.height - 4 * baseScale;
    this.context.globalAlpha = opacity;
    this.context.drawImage(image, frame.x, frame.y, frame.w, frame.h,
      footX - frame.anchorX * scale, footY + (frame.offsetY || 0) * scale - frame.anchorY * scale,
      frame.w * scale, frame.h * scale);
  }
  render(snapshot) {
    const { context: ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Soma ponderada de cores e alpha: evita escurecimento no meio do crossfade.
    ctx.globalCompositeOperation = 'lighter';
    const draw=(name,time,weight)=>{
      const clip=this.clips[name];if(!clip)throw new Error('Falta clip '+name);
      const total=clip.frames.reduce((s,f)=>s+f.duration,0);let at=clip.loop?time%total:Math.min(time,total-1e-9),index=0;
      while(index<clip.frames.length-1&&at>=clip.frames[index].duration){at-=clip.frames[index].duration;index++}
      const f=clip.frames[index],next=clip.frames[index+1]||(clip.loop?clip.frames[0]:f),window=Math.min(.05,f.duration*.3);
      let mix=Math.max(0,Math.min(1,(at-f.duration+window)/window));mix=mix*mix*(3-2*mix);
      this.drawClip(name,time,weight*(1-mix),f);this.drawClip(name,time,weight*mix,next);
    };
    const partialChange=snapshot.previous&&(snapshot.state==='FACE'||snapshot.previous.state==='FACE');
    if (snapshot.previous) draw(snapshot.previous.state,snapshot.previous.time,partialChange?Math.max(0,1-snapshot.weight*2):snapshot.previous.weight);
    draw(snapshot.state,snapshot.time,partialChange?Math.max(0,snapshot.weight*2-1):snapshot.weight);
    // Piscar é um clip facial completo opcional: sem bolinhas ou máscaras sobre os olhos.
    if (snapshot.blink && this.clips.BLINK) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawClip('BLINK', 0, 1);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}
