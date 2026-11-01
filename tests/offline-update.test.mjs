import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

async function worker(){
 const handlers={},requests=[],stores=new Map();let offline=false,failAsset='',activated=false;
 const origin='https://example.test/autobox/';
 const key=x=>new URL(typeof x==='string'?x:x.url||x.href,origin).href;
 const cache=name=>{if(!stores.has(name))stores.set(name,new Map());return {put:async(url,response)=>stores.get(name).set(key(url),response),match:async request=>stores.get(name).get(key(request))};};
 const self={location:new URL(origin+'sw.js'),addEventListener:(name,fn)=>handlers[name]=fn,skipWaiting:async()=>{activated=true;},clients:{claim:async()=>{}}};
 const caches={open:async name=>cache(name),keys:async()=>[...stores.keys()],delete:async name=>stores.delete(name)};
 const fetch=async(request,options)=>{const url=key(request);requests.push({url,options});if(offline)throw Error('offline');return new Response(url,{status:failAsset&&url.includes(failAsset)?503:200});};
 vm.runInNewContext(await readFile(new URL('../dist/sw.js',import.meta.url),'utf8'),{self,caches,fetch,URL,Error,Promise});
 const install=()=>{let promise;handlers.install({waitUntil:p=>promise=p});return promise;};
 const request=url=>{let result;handlers.fetch({request:{url:origin+url,method:'GET',mode:url==='unknown'?'navigate':'cors'},respondWith:p=>result=p});return result;};
 return {install,request,requests,stores,cache,setOffline:()=>offline=true,fail:asset=>failAsset=asset,activated:()=>activated};
}
test('instala archivos frescos y conserva las rutas originales para uso sin conexión',async()=>{
 const w=await worker();await w.install();assert.equal(w.activated(),true);
 assert.ok(w.requests.length>10);assert.ok(w.requests.every(r=>r.options.cache==='no-store'&&new URL(r.url).searchParams.has('release')));
 const versioned=w.requests.find(r=>r.url.includes('app.js?v='));assert.ok(versioned);
 w.setOffline();const response=await w.request('app.js?'+new URL(versioned.url).searchParams.toString().split('&release=')[0]);assert.equal(response.status,200);
 assert.equal((await w.request('unknown')).status,200);
});
test('una descarga fallida no activa una actualización incompleta',async()=>{
 const w=await worker();w.fail('core.js');await assert.rejects(w.install());assert.equal(w.activated(),false);
});
test('los archivos de una caché anterior no se mezclan con la versión nueva',async()=>{
 const w=await worker();await w.cache('autobox-shell-anterior').put('app.js',new Response('anterior'));await w.install();w.setOffline();
 assert.notEqual(await (await w.request('app.js')).text(),'anterior');
});
