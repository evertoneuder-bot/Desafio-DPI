'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process'),crypto=require('crypto');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'dpi-browser-voice-'));
(async()=>{try{
 const install=process.env.DPI_BROWSER_NODE_MODULES?null:temp;
 if(install)cp.execFileSync('npm',['install','--prefix',install,'@diffusionstudio/vits-web@1.0.3','@diffusionstudio/piper-wasm@1.0.0','esbuild@0.25.0','--ignore-scripts','--no-audit','--no-fund'],{stdio:'inherit',timeout:180000});
 const modules=process.env.DPI_BROWSER_NODE_MODULES||path.join(temp,'node_modules');
 const out=process.env.DPI_BROWSER_OUT||'dpi-r18.1/voz-e-mascotes/browser-piper',vendor=path.join(out,'vendor');fs.mkdirSync(vendor,{recursive:true});
 const pkg=path.join(modules,'@diffusionstudio/vits-web/dist'),entry=path.join(pkg,'dpi-browser-entry.js');
 let source=fs.readFileSync(path.join(pkg,'vits-web.js'),'utf8');
 source=source.replace('"https://huggingface.co/diffusionstudio/piper-voices/resolve/main"','new URL("../model/",import.meta.url).href.replace(/\\/$/,"")').replace('"https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.18.0/"','new URL("./",import.meta.url).href').replace('"https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize"','new URL("./piper_phonemize",import.meta.url).href').replace('numThreads = navigator.hardwareConcurrency','numThreads = 1');
 source=require('./browser-voice-engine-patch.cjs').patchEngine(source);
 if(source.includes('https://huggingface.co/diffusionstudio/'))throw Error('Unpatched model origin');
 fs.writeFileSync(entry,source);
 cp.execFileSync(path.join(modules,'esbuild/bin/esbuild'),[entry,'--bundle','--format=esm','--platform=browser','--minify','--external:fs','--external:path','--external:crypto','--external:module','--external:os','--outfile='+path.join(vendor,'engine.js')],{stdio:'inherit',timeout:120000});
 for(const file of ['ort-wasm.wasm','ort-wasm-simd.wasm'])fs.copyFileSync(path.join(modules,'onnxruntime-web/dist',file),path.join(vendor,file));
 for(const file of ['piper_phonemize.wasm','piper_phonemize.data'])fs.copyFileSync(path.join(modules,'@diffusionstudio/piper-wasm/build',file),path.join(vendor,file));
 const modelDir=path.join(out,'model/pt/pt_BR/faber/medium');fs.mkdirSync(modelDir,{recursive:true});
 const origin='https://huggingface.co/rhasspy/piper-voices/resolve/b4e358ffcb232591bf73a540e70f7de528e4174a/pt/pt_BR/faber/medium/';
 for(const file of ['pt_BR-faber-medium.onnx','pt_BR-faber-medium.onnx.json','MODEL_CARD']){
  const local=process.env.DPI_PIPER_MODEL&&file!=='MODEL_CARD'?(file.endsWith('.json')?process.env.DPI_PIPER_MODEL+'.json':process.env.DPI_PIPER_MODEL):null;
  if(local&&fs.existsSync(local))fs.copyFileSync(local,path.join(modelDir,file));
  else{const r=await fetch(origin+file,{signal:AbortSignal.timeout(120000)});if(!r.ok)throw Error('Model HTTP '+r.status);fs.writeFileSync(path.join(modelDir,file),Buffer.from(await r.arrayBuffer()));}
 }
 if(crypto.createHash('sha256').update(fs.readFileSync(path.join(modelDir,'pt_BR-faber-medium.onnx'))).digest('hex')!=='858555e3a064209c57088fe6bd70c4c3dc54d03eaa00c45d5ecaf43a33f95aa7')throw Error('Unexpected model hash');
 fs.writeFileSync(path.join(out,'THIRD-PARTY.txt'),'VITS Web 1.0.3 (MIT), Piper WASM 1.0.0, ONNX Runtime Web 1.18.0 (MIT). Model provenance: model/pt/pt_BR/faber/medium/MODEL_CARD. Runtime source: https://github.com/diffusionstudio/vits-web . Local modifications: same-origin assets; one CPU thread; reusable inference session.\n');
 const cache=path.join(out,'../piper-candidate');fs.mkdirSync(cache,{recursive:true});if(!fs.existsSync(path.join(cache,'manifest.json')))fs.writeFileSync(path.join(cache,'manifest.json'),JSON.stringify({schemaVersion:1,clips:{},questions:[]}));
 console.log('Browser speech runtime prepared with verified pt-BR model.');
}finally{fs.rmSync(temp,{recursive:true,force:true})}})().catch(error=>{console.error(error.message);process.exitCode=1});
