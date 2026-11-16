const assert=require('node:assert/strict');const {expand}=require('../../dpi-r18.1/voz-e-mascotes/dpi-spoken-text.js');
assert.equal(expand('DCF é avaliada por RX, US, TC e RM.'),'displasia coxofemoral é avaliada por radiografia, ultrtrassonografia, tomografia computadorizada e ressonância magnética.'.replace('ultrtrassonografia','ultrassonografia'));
assert.equal(expand('A. Não confundir a letra A com ATM.'),'A. Não confundir a letra A com articulação temporomandibular.');
assert.equal(expand('LLD e VD; sem mudar DCFX.'),'laterolateral direita e ventrodorsal; sem mudar DCFX.');assert.equal(expand(expand('DCF por TC')),expand('DCF por TC'));
console.log('Clinical abbreviations expanded, word boundaries and repeated normalization passed.');
