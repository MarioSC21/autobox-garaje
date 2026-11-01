import test from 'node:test';import assert from 'node:assert/strict';import {matchesVehicle} from '../dist/core.js';
test('busca el ticket entero con ceros iniciales, sin ceros o con el código impreso',()=>{const v={ticket:1,plate:'ABC-123'};for(const q of ['00001','1','#00001','TK-00001-ABX',' 00001 '])assert.equal(matchesVehicle(v,q),true);assert.equal(matchesVehicle({ticket:10,plate:'XYZ-999'},'00001'),false);assert.equal(matchesVehicle({ticket:1001,plate:'XYZ-999'},'01001'),true);});
test('conserva la búsqueda de placa completa o parcial con y sin guion',()=>{const v={ticket:8,plate:'A1B-234'};for(const q of ['a1b234','A1B-234','a1b','234',''])assert.equal(matchesVehicle(v,q),true);assert.equal(matchesVehicle(v,'ZZZ'),false);});
test('modo Ticket no mezcla el número 5 con placas que contienen 5',()=>{
 const visits=[{ticket:5,plate:'ABC-123'},{ticket:12,plate:'DEF-555'},{ticket:55,plate:'XYZ-505'}];
 for(const query of ['5','00005','#00005','TK-00005-ABX'])assert.deepEqual(visits.filter(v=>matchesVehicle(v,query,'ticket')).map(v=>v.ticket),[5]);
 assert.deepEqual(visits.filter(v=>matchesVehicle(v,'555','ticket')),[]);
 assert.equal(matchesVehicle(visits[0],'ABC','ticket'),false);
});
test('modo Placa busca solamente placas aunque el texto sea numérico',()=>{
 const visits=[{ticket:5,plate:'ABC-123'},{ticket:12,plate:'DEF-555'},{ticket:55,plate:'XYZ-505'}];
 assert.deepEqual(visits.filter(v=>matchesVehicle(v,'5','plate')).map(v=>v.ticket),[12,55]);
 assert.equal(matchesVehicle(visits[0],'abc123','plate'),true);
 assert.equal(matchesVehicle(visits[0],'00005','plate'),false);
 for(const mode of ['ticket','plate'])assert.ok(visits.every(v=>matchesVehicle(v,'',mode)));
});
