const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2],'utf8'),a=html.indexOf('function say(text,who=persona'),b=html.indexOf('function toggle(',a),calls=[];
const context={window:{DPISpokenText:require('../../dpi-r18.1/voz-e-mascotes/dpi-spoken-text.js')},enabled:true,persona:'male',neuralStatus:{configured:true},neuralSay:(text,who)=>calls.push({text,who}),checkNeural(){throw Error('Unexpected status fetch')},notify(){}};
vm.runInNewContext(html.slice(a,b),context);context.say('Teste masculino','male');context.say('Teste feminino','female');assert.deepEqual(calls,[{text:'Teste masculino',who:'male'},{text:'Teste feminino',who:'female'}]);console.log('Both personas route to approved server voice.');
