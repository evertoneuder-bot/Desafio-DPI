const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
for(const name of ['crossword-input','crossword-review','minigame-reaction','story-timing','duo-speech','profile-draft','entry-share','approved-dispatch','motion-lifecycle','spoken-text']){
 test('recovered candidate regression: '+name,()=>{
  const arg=name==='motion-lifecycle'?'dpi-r18.1/voz-e-mascotes/dpi-mascot-motion.js':'dpi-r18.1/ABRA-ESTA-PREVIA.html';
  const result=spawnSync(process.execPath,[path.join(__dirname,'recovered',name+'.cjs'),path.join(root,arg)],{cwd:root,encoding:'utf8',timeout:10000});
  assert.equal(result.status,0,(result.stdout||'')+(result.stderr||''));
 });
}
