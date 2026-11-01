import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../dist/scan.js',import.meta.url),'utf8');
async function scanner(getUserMedia){
 const element=()=>({hidden:false,disabled:false,handlers:{},addEventListener(n,fn){this.handlers[n]=fn;},removeEventListener(n){delete this.handlers[n];}});
 const video={...element(),readyState:0,play:async()=>{}},button=element(),message=element(),placeholder=element();
 const elements={'#scan-video':video,'#scanner-camera':button,'#scanner-message':message,'#scanner-placeholder':placeholder};
 const dialog={...element(),querySelector:q=>elements[q]};
 const document={...element(),hidden:false,createElement:()=>({getContext:()=>({})})};
 const context=vm.createContext({document,navigator:{mediaDevices:{getUserMedia}},window:{isSecureContext:true},location:{protocol:'https:'},setTimeout:()=>1,clearTimeout:()=>{}});
 vm.runInContext(source.replaceAll('export ','')+'\nglobalThis.mountScanner=mountScanner;',context);
 const cleanup=context.mountScanner(dialog,()=>true);
 await new Promise(resolve=>setImmediate(resolve));
 return {cleanup,dialog,video,button,message,document};
}
test('abre cámara al montar y libera la cámara al cerrar',async()=>{
 let calls=0,stops=0;const s=await scanner(async constraints=>{calls++;assert.equal(constraints.audio,false);assert.equal(constraints.video.facingMode.ideal,'environment');return {getTracks:()=>[{stop:()=>stops++}]};});
 assert.equal(calls,1);assert.equal(s.video.hidden,false);assert.equal(s.button.hidden,true);
 s.dialog.handlers.close();assert.equal(stops,1);assert.equal(s.video.srcObject,null);
});
test('si se rechaza el permiso explica el problema y permite reintentar',async()=>{
 let calls=0;const s=await scanner(async()=>{calls++;throw Object.assign(new Error('denied'),{name:'NotAllowedError'});});
 assert.match(s.message.textContent,/Cámara → Permitir/);assert.equal(s.button.hidden,false);assert.equal(s.button.disabled,false);
 await s.button.handlers.click();assert.equal(calls,2);s.cleanup();
});
test('cerrar durante la solicitud detiene la cámara cuando llega la respuesta',async()=>{
 let resolve,stops=0;const pending=new Promise(r=>resolve=r);const s=await scanner(()=>pending);s.cleanup();
 resolve({getTracks:()=>[{stop:()=>stops++}]});await new Promise(r=>setImmediate(r));assert.equal(stops,1);assert.equal(s.video.srcObject,null);
});
