export const DEFAULTS={name:'Mi garaje',currency:'S/',capacity:40,rates:{auto:5,moto:3,camioneta:7},tolerance:10,block:60,ticketEnd:1000,nextTicket:1};
export const fresh=()=>({version:1,settings:structuredClone(DEFAULTS),visits:[],backupAt:null});
export function normalizePlate(s){return s.toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function quote(v,at=Date.now()){
 const minutes=Math.max(0,(at-v.entry)/60000),blocks=minutes<=v.tolerance?0:Math.max(1,Math.ceil((minutes-v.tolerance)/v.block));
 return {minutes,blocks,gross:Math.round(blocks*v.rate*100)/100};
}
export function nextFree(state){let t=state.settings.nextTicket;while(state.visits.some(v=>v.ticket===t))t++;return t<=state.settings.ticketEnd?t:null;}
export function validate(raw){
 if(!raw||raw.version!==1||!raw.settings||!Array.isArray(raw.visits))throw Error('Este archivo no es una copia de AutoBox compatible.');
 const s=raw.settings,number=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 if(typeof s.name!=='string'||s.name.length>60||!['S/','$','€','Bs'].includes(s.currency)||!number(s.capacity,1,100000)||!Number.isInteger(s.capacity)||!number(s.tolerance,0,59)||![15,30,60].includes(s.block)||!number(s.ticketEnd,1,10000000)||!Number.isInteger(s.ticketEnd)||!number(s.nextTicket,1,10000001)||!Number.isInteger(s.nextTicket)||!s.rates||Object.keys(DEFAULTS.rates).some(k=>!number(s.rates[k],0.01,100000)))throw Error('La configuración del archivo no es válida.');
 const ids=new Set(),tickets=new Set(),plates=new Set();
 for(const v of raw.visits){
  if(!v||typeof v.id!=='string'||!/^[A-Za-z0-9-]{1,100}$/.test(v.id)||ids.has(v.id)||!Number.isInteger(v.ticket)||v.ticket<1||v.ticket>s.ticketEnd||tickets.has(v.ticket)||typeof v.plate!=='string'||!/^[A-Z0-9-]{3,12}$/.test(v.plate)||normalizePlate(v.plate).length<3||!Object.hasOwn(s.rates,v.type)||!number(v.entry,1,8640000000000000)||!number(v.rate,0.01,100000)||!number(v.tolerance,0,59)||![15,30,60].includes(v.block))throw Error('Hay vehículos, placas o tickets inválidos o repetidos.');
  ids.add(v.id);tickets.add(v.ticket);
  if(v.exit==null){if(plates.has(normalizePlate(v.plate)))throw Error('Hay una placa duplicada entre los vehículos dentro.');plates.add(normalizePlate(v.plate));if(v.status!=='inside')throw Error('Estado de vehículo inválido.');}
  else {const q=quote(v,v.exit);if(!number(v.exit,v.entry,8640000000000000)||!['paid','pending'].includes(v.status)||!number(v.gross,0,1e12)||Math.abs(v.gross-q.gross)>.011||!number(v.discount,0,v.gross)||!number(v.total,0,1e12)||Math.abs(v.total-(v.gross-v.discount))>.011||typeof v.reason!=='string'||v.reason.length>300||(v.discount>0&&!v.reason.trim())||!['Efectivo','Yape / Plin','Tarjeta','Transferencia'].includes(v.method)||(v.status==='paid'&&!number(v.paidAt,v.exit,8640000000000000))||(v.status==='pending'&&v.paidAt!=null))throw Error('Hay un cobro inválido. Revisa los montos y las fechas.');}
 }
 return {version:1,settings:{...s,rates:{...s.rates}},visits:raw.visits.map(v=>({...v})),backupAt:typeof raw.backupAt==='number'?raw.backupAt:null};
}
const columns=['version','id','ticket','placa','tipo','entrada','salida','tarifa','tolerancia','bloque_min','bruto','exonerado','motivo','total','estado','metodo','pagado_el','configuracion'];
const cell=x=>{let value=String(x??'');if(/^[=+@\-\t\r]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"';};
export function toCSV(state){
 const rows=[columns, [1,...Array(16).fill(''),JSON.stringify(state.settings)]];
 for(const v of state.visits)rows.push([1,v.id,v.ticket,v.plate,v.type,v.entry,v.exit,v.rate,v.tolerance,v.block,v.gross,v.discount,v.reason,v.total,v.status,v.method,v.paidAt,'']);
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
export function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('El CSV tiene comillas sin cerrar.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
export function fromCSV(text){
 const rows=parseCSV(text).map(row=>row.map(value=>/^'[=+@\-\t\r]/.test(value)?value.slice(1):value));if(JSON.stringify(rows.shift())!==JSON.stringify(columns))throw Error('Importa un CSV exportado desde AutoBox, con sus columnas originales.');
 const config=rows.filter(r=>r[17]);if(config.length!==1)throw Error('El CSV no contiene una configuración única.');
 const visits=rows.filter(r=>r[1]).map(r=>({id:r[1],ticket:+r[2],plate:r[3],type:r[4],entry:+r[5],exit:r[6]?+r[6]:null,rate:+r[7],tolerance:+r[8],block:+r[9],gross:r[10]?+r[10]:null,discount:r[11]?+r[11]:null,reason:r[12],total:r[13]?+r[13]:null,status:r[14],method:r[15],paidAt:r[16]?+r[16]:null}));
 return validate({version:1,settings:JSON.parse(config[0][17]),visits});
}
