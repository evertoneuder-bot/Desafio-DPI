const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/../../dpi-r18.1/ABRA-ESTA-PREVIA.html','utf8'),begin=html.indexOf('function cwCheck(){'),end=html.indexOf('function miniDiagnosis()',begin),awards=[];
const field={value:'',classList:{add(){}}},fb={classList:{add(){},remove(){}}};const window={_cw:{entries:[{word:'RX',r:0,c:0,dr:0,dc:1}],active:true}};
const fields={'cw-0-0':{...field},'cw-0-1':{...field},cwFeedback:fb};
const c={window,document:{getElementById:id=>fields[id]},trackMission:(...x)=>awards.push(x),livelyFx(){},wordEscape:x=>x};
vm.runInNewContext(html.slice(begin,end),c);c.cwCheck();assert.equal(fields['cw-0-0'].value,'R');assert.equal(fields['cw-0-1'].value,'X');c.cwCheck();assert.deepEqual(awards,[[false,5]],'Gabarito automático não pode virar acerto em um segundo clique');
console.log('Revisão da cruzadinha não concede pontos de acerto pelo gabarito automático.');
