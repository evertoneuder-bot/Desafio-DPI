import {STATES as S} from './character-state-machine.js';
export function actingClips(persona){
 const src=new URL(`../${persona==='Tom'?'everton':persona.toLowerCase()}-acting.avif`,import.meta.url).href;
 const frame=(i,duration,offsetY=0)=>({x:i%4*400,y:Math.floor(i/4)*480,w:400,h:480,duration,anchorX:200,anchorY:465,offsetY});
 const clip=(poses,loop=false)=>({src,stageWidth:400,stageHeight:480,loop,frames:poses.map(p=>frame(...p))});
 return {
  [S.IDLE_QUIZ]:clip([[0,6]],true),
  [S.THINKING]:clip([[8,1.8],[9,2.4]],true),
  [S.CORRECT_ANSWER]:clip(persona==='Fernanda'?[[0,.18],[10,.22],[11,.18,-12],[11,.2,-20],[10,.22,-8],[10,.6],[0,.4]]:[[0,.18],[10,.35],[11,.7],[10,.4],[0,.37]]),
  [S.INCORRECT_ANSWER]:clip([[0,.18],[12,.7],[13,.7],[12,.22],[0,.2]]),
  [S.MINIGAME_START]:clip([[0,.12],[1,.15],[17,.5],[21,.28],[0,.15]]),
  [S.MINIGAME_CHEERING]:clip([[0,1.6],[14,.55],[15,.45],[14,.5],[0,1.8]],true),
  POINT_UP:clip([[0,.1],[2,.16],[16,.78],[2,.16],[0,.2]]),
  POINT_UP_RIGHT:clip([[0,.1],[2,.16],[17,.78],[2,.16],[0,.2]]),
  POINT_RIGHT:clip([[0,.1],[2,.16],[18,.78],[2,.16],[0,.2]]),
  POINT_LEFT:clip([[0,.1],[2,.16],[19,.78],[2,.16],[0,.2]]),
  CROSSED:clip([[20,2.4]],true),
  PRESENT:clip([[0,.1],[2,.16],[21,.78],[2,.16],[0,.2]]),
  ARM_RIGHT:clip([[22,1.4]]),
  ARM_UP:clip([[23,1.4]]),
  FACE:{src,stageWidth:400,stageHeight:480,loop:true,frames:[{x:85,y:30,w:230,h:175,duration:2,anchorX:115,anchorY:175}]},
  BLINK:clip([[7,.12]]),
  TALK:clip([[0,1]],true),
 };
}
