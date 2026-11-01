import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./dist/',import.meta.url);
let html=await readFile(new URL('index.html',root),'utf8');
const core=(await readFile(new URL('core.js',root),'utf8')).replaceAll('export ','');
const app=(await readFile(new URL('app.js',root),'utf8')).replace(/^import .*?;\r?\n/gm,'');
const qr=(await readFile(new URL('qr.js',root),'utf8')).replace(/^export /gm,'');
const scan=(await readFile(new URL('scan.js',root),'utf8')).replace(/^export /gm,'');
for(const file of ['qrcode','jsQR']){const code=await readFile(new URL(`vendor/${file}.js`,root),'utf8');html=html.replace(`<script src="./vendor/${file}.js"></script>`,()=>`<script>${code.replaceAll('</script','<\\/script')}</script>`);}
const css=await readFile(new URL('style.css',root),'utf8');
const licenses=await Promise.all(['qrcode-LICENSE.txt','jsQR-LICENSE.txt'].map(file=>readFile(new URL('vendor/'+file,root),'utf8')));
html=html.replace('</head>',()=>`<script type="text/plain" id="third-party-licenses">${licenses.join('\n\n').replaceAll('</script','<\\/script')}</script></head>`);
html=html.replace(/<link rel="manifest"[^>]*>/,'').replace('<link rel="icon" href="./icon.svg" type="image/svg+xml">','').replace('<link rel="stylesheet" href="./style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="./app.js"></script>',()=>`<script type="module">${core}\n${qr}\n${scan}\n${app}</script>`);
await writeFile(new URL('AutoBox-portatil.html',root),html);
const hash=createHash('sha256').update(html).digest('hex').slice(0,12);
const sw=await readFile(new URL('sw.js',root),'utf8');
await writeFile(new URL('sw.js',root),sw.replace(/autobox-shell-[\w-]+/,'autobox-shell-'+hash));
console.log('Creada dist/AutoBox-portatil.html (sin dependencias externas).');
