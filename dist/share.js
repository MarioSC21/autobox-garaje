export async function shareBackupFile(name,content,nav=globalThis.navigator){
 if(!nav?.share||!nav?.canShare||typeof File==='undefined')return 'unsupported';
 const candidates=[new File([content],name,{type:'application/json'}),new File([content],name,{type:'text/plain'}),new File([content],name.replace(/\.json$/i,'.txt'),{type:'text/plain'})];
 try{const file=candidates.find(file=>nav.canShare({files:[file]}));if(!file)return 'unsupported';await nav.share({files:[file],title:'AutoBox · Respaldo',text:'Importa este respaldo en AutoBox: Ajustes → Datos y respaldo → Importar copia o CSV.'});return 'shared';}
 catch(error){return error.name==='AbortError'?'cancelled':'unsupported';}
}
