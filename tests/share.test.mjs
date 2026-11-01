import test from 'node:test';
import assert from 'node:assert/strict';
import {shareBackupFile} from '../dist/share.js';
import {fresh,validate} from '../dist/core.js';
test('comparte un archivo completo que se puede volver a importar',async()=>{
 const state=fresh();state.settings.name='Garaje de prueba';state.settings.nextTicket=45;const content=JSON.stringify(state);let shared;
 const result=await shareBackupFile('AutoBox.json',content,{canShare:()=>true,share:async data=>shared=data});
 assert.equal(result,'shared');assert.equal(shared.files[0].name,'AutoBox.json');assert.deepEqual(validate(JSON.parse(await shared.files[0].text())),state);
});
test('si solo se admite texto comparte TXT sin perder el respaldo JSON',async()=>{
 let file;const content=JSON.stringify(fresh());const result=await shareBackupFile('AutoBox.json',content,{canShare:({files})=>files[0].name.endsWith('.txt'),share:async data=>file=data.files[0]});
 assert.equal(result,'shared');assert.equal(file.name,'AutoBox.txt');assert.equal(await file.text(),content);
});
test('cancelar compartir no se confunde con un envío completado',async()=>{
 assert.equal(await shareBackupFile('AutoBox.json','{}',{canShare:()=>true,share:async()=>{throw Object.assign(new Error('cancel'),{name:'AbortError'});}}),'cancelled');
});
test('sin soporte o ante un fallo permite descargar la copia como alternativa',async()=>{
 assert.equal(await shareBackupFile('AutoBox.json','{}',{}),'unsupported');
 assert.equal(await shareBackupFile('AutoBox.json','{}',{canShare:()=>false,share:async()=>assert.fail('No debería compartir')}),'unsupported');
 assert.equal(await shareBackupFile('AutoBox.json','{}',{canShare:()=>true,share:async()=>{throw Error('fallo');}}),'unsupported');
});
