const CACHE='autobox-shell-f937be77b4d9';
const ASSETS=['./','./index.html','./style.css','./app.js','./core.js','./icon.svg','./manifest.webmanifest','./AutoBox-portatil.html'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('autobox-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).catch(()=>{if(event.request.mode==='navigate')return caches.match('./index.html');return Response.error();})));});
