import {writeFile,mkdir} from 'node:fs/promises';import {fresh,quote} from '../dist/core.js';
const s=fresh(),now=Date.now();
const vehicle=(id,ticket,plate,type,minutes)=>({id,ticket,plate,type,entry:now-minutes*60000,exit:null,rate:s.settings.rates[type],tolerance:10,block:60,status:'inside'});
s.visits=[vehicle('qa-auto',1,'TEST-01','auto',75),vehicle('qa-moto',2,'TEST-02','moto',45),vehicle('qa-pending',3,'TEST-03','camioneta',180)];
const v=s.visits[2];Object.assign(v,{exit:now-60*60000,gross:quote(v,now-60*60000).gross,discount:0,reason:'',total:14,status:'pending',method:'Efectivo',paidAt:null});s.settings.nextTicket=4;
await mkdir(new URL('../.local/',import.meta.url),{recursive:true});await writeFile(new URL('../.local/qa.json',import.meta.url),JSON.stringify(s));console.log('Datos de prueba creados.');
