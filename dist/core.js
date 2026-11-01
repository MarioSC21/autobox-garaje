export const DEFAULTS={name:'Mi garaje',currency:'S/',capacity:40,rates:{auto:5,moto:3,camioneta:7},tolerance:10,block:60,ticketEnd:1000,nextTicket:1};
export const fresh=()=>({version:1,settings:structuredClone(DEFAULTS),visits:[],backupAt:null});
export function paymentTotal(gross,discount,status){
 if(!Number.isFinite(gross)||!Number.isFinite(discount)||gross<0||discount<0||discount>gross)throw Error('La exoneración debe estar entre cero y el importe original.');
 if(!['paid','unpaid'].includes(status))throw Error('Elige si ya pagó o no pagó.');
 const total=Math.round((gross-discount)*100)/100;
 if(status==='paid'&&total<=0)throw Error('El monto a cobrar debe ser mayor que cero. Para cerrar sin cobro, elige «No pagó».');
 return total;
}
export function normalizePlate(s){return s.toUpperCase().replace(/[^A-Z0-9]/g,'');}
export function matchesVehicle(v,query){const text=String(query??'').trim().toUpperCase();if(!text)return true;const code=text.match(/^(?:TK-(\d{1,8})-ABX|#?(\d{1,8}))$/);if(code&&Number(code[1]||code[2])===v.ticket)return true;const plateQuery=normalizePlate(text);return !!plateQuery&&normalizePlate(v.plate).includes(plateQuery);}
export function formatPlate(s){
 const clean=s.toUpperCase().replace(/[^A-Z0-9-]/g,''),raw=normalizePlate(clean);
 if(/^[A-Z]{2}\d{4}$/.test(raw))return raw.slice(0,2)+'-'+raw.slice(2);
 if(/^\d{5}[A-Z]$/.test(raw))return raw.slice(0,4)+'-'+raw.slice(4);
 if(/^[A-Z0-9]{3}\d{3}$/.test(raw))return raw.slice(0,3)+'-'+raw.slice(3);
 return clean;
}
export function quote(v,at=Date.now()){
 const minutes=Math.max(0,(at-v.entry)/60000),blocks=minutes<=v.tolerance?0:Math.max(1,Math.ceil((minutes-v.tolerance)/v.block));
 return {minutes,blocks,gross:Math.round(blocks*v.rate*100)/100};
}
export function nextFree(state){let t=state.settings.nextTicket;while(state.visits.some(v=>v.ticket===t&&v.status!=='cancelled'))t++;return t<=state.settings.ticketEnd?t:null;}
export function cancelRegistration(state,id,at=Date.now()){
 const result=structuredClone(state),v=result.visits.find(v=>v.id===id);
 if(!v||v.status!=='inside'||v.exit!=null)throw Error('Solo se puede anular un registro que sigue dentro.');
 if(!Number.isFinite(at)||at<v.entry)throw Error('La fecha de anulación no es válida.');
 Object.assign(v,{status:'cancelled',exit:at,gross:0,discount:0,total:0,reason:'Se retiró sin recibir boleto',method:'',paidAt:null});
 result.settings.nextTicket=Math.min(result.settings.nextTicket,v.ticket);
 return result;
}
export function dayTotals(state,at=Date.now()){
 const d=new Date(at);d.setHours(0,0,0,0);const start=+d;d.setDate(d.getDate()+1);const end=+d,today=t=>t>=start&&t<end,valid=state.visits.filter(v=>v.status!=='cancelled'),out=valid.filter(v=>v.exit!=null&&today(v.exit)),paid=valid.filter(v=>v.status==='paid'&&today(v.paidAt)),unpaid=out.filter(v=>v.status==='unpaid');
 return {inside:valid.filter(v=>v.status==='inside').length,entries:valid.filter(v=>today(v.entry)).length,exits:out.length,paidCount:paid.length,collected:paid.reduce((a,v)=>a+v.total,0),unpaidCount:unpaid.length,notCollected:unpaid.reduce((a,v)=>a+v.total,0),discounts:out.reduce((a,v)=>a+v.discount,0)};
}
export function validate(raw){
 if(!raw||raw.version!==1||!raw.settings||!Array.isArray(raw.visits))throw Error('Este archivo no es una copia de AutoBox compatible.');
 const s=raw.settings,number=(x,min,max)=>typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 if(typeof s.name!=='string'||s.name.length>60||!['S/','$','€','Bs'].includes(s.currency)||!number(s.capacity,1,100000)||!Number.isInteger(s.capacity)||!number(s.tolerance,0,59)||![15,30,60].includes(s.block)||!number(s.ticketEnd,1,10000000)||!Number.isInteger(s.ticketEnd)||!number(s.nextTicket,1,10000001)||!Number.isInteger(s.nextTicket)||!s.rates||Object.keys(DEFAULTS.rates).some(k=>!number(s.rates[k],0.01,100000)))throw Error('La configuración del archivo no es válida.');
 const ids=new Set(),tickets=new Set(),plates=new Set();
 for(const v of raw.visits){
  if(!v||typeof v.id!=='string'||!/^[A-Za-z0-9-]{1,100}$/.test(v.id)||ids.has(v.id)||!Number.isInteger(v.ticket)||v.ticket<1||v.ticket>s.ticketEnd||(v.status!=='cancelled'&&tickets.has(v.ticket))||typeof v.plate!=='string'||!/^[A-Z0-9-]{3,12}$/.test(v.plate)||normalizePlate(v.plate).length<3||!Object.hasOwn(s.rates,v.type)||!number(v.entry,1,8640000000000000)||!number(v.rate,0.01,100000)||!number(v.tolerance,0,59)||![15,30,60].includes(v.block))throw Error('Hay vehículos, placas o tickets inválidos o repetidos.');
  ids.add(v.id);if(v.status!=='cancelled')tickets.add(v.ticket);
  if(v.keys!==undefined&&typeof v.keys!=='boolean')throw Error('La opción de llave debe ser Sí o No.');
  if(v.status==='cancelled'){if(!number(v.exit,v.entry,8640000000000000)||v.gross!==0||v.discount!==0||v.total!==0||v.paidAt!=null||v.method!==''||typeof v.reason!=='string'||!v.reason.trim()||v.reason.length>300)throw Error('Hay una anulación inválida.');}
  else if(v.exit==null){if(plates.has(normalizePlate(v.plate)))throw Error('Hay una placa duplicada entre los vehículos dentro.');plates.add(normalizePlate(v.plate));if(v.status!=='inside')throw Error('Estado de vehículo inválido.');}
  else {const q=quote(v,v.exit),methods=['Efectivo','Yape / Plin','Tarjeta','Transferencia'];if(!number(v.exit,v.entry,8640000000000000)||!['paid','unpaid','pending'].includes(v.status)||!number(v.gross,0,1e12)||Math.abs(v.gross-q.gross)>.011||!number(v.discount,0,v.gross)||!number(v.total,0,1e12)||Math.abs(v.total-(v.gross-v.discount))>.011||typeof v.reason!=='string'||v.reason.length>300||(v.discount>0&&!v.reason.trim())||(v.status==='paid'&&(!methods.includes(v.method)||!number(v.paidAt,v.exit,8640000000000000)))||(v.status!=='paid'&&(!['',...methods].includes(v.method)||v.paidAt!=null)))throw Error('Hay un cobro inválido. Revisa los montos y las fechas.');}
 }
 return {version:1,settings:{...s,rates:{...s.rates}},visits:raw.visits.map(v=>v.status==='pending'||v.status==='unpaid'?{...v,status:'unpaid',method:''}:{...v}),backupAt:typeof raw.backupAt==='number'?raw.backupAt:null};
}
const columns=['version','id','ticket','placa','tipo','entrada','salida','tarifa','tolerancia','bloque_min','bruto','exonerado','motivo','total','estado','metodo','pagado_el','configuracion','dejo_llave'];
const cell=x=>{let value=String(x??'');if(/^[=+@\-\t\r]/.test(value))value="'"+value;return '"'+value.replaceAll('"','""')+'"';};
export function toCSV(state){
 const rows=[columns, [1,...Array(16).fill(''),JSON.stringify(state.settings),'']];
 for(const v of state.visits)rows.push([1,v.id,v.ticket,v.plate,v.type,v.entry,v.exit,v.rate,v.tolerance,v.block,v.gross,v.discount,v.reason,v.total,v.status,v.method,v.paidAt,'',v.keys?'Sí':'No']);
 return '\uFEFF'+rows.map(row=>row.map(cell).join(',')).join('\r\n');
}
export function parseCSV(text){
 text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('El CSV tiene comillas sin cerrar.');if(cell||row.length){row.push(cell);rows.push(row);}return rows;
}
export function fromCSV(text){
 const rows=parseCSV(text).map(row=>row.map(value=>/^'[=+@\-\t\r]/.test(value)?value.slice(1):value)),header=JSON.stringify(rows.shift()),legacy=header===JSON.stringify(columns.slice(0,-1));if(!legacy&&header!==JSON.stringify(columns))throw Error('Importa un CSV exportado desde AutoBox, con sus columnas originales.');
 const config=rows.filter(r=>r[17]);if(config.length!==1)throw Error('El CSV no contiene una configuración única.');
 const visits=rows.filter(r=>r[1]).map(r=>{if(!legacy&&!['Sí','No'].includes(r[18]))throw Error('La columna dejó llave debe contener Sí o No.');return {id:r[1],ticket:+r[2],plate:r[3],type:r[4],entry:+r[5],exit:r[6]?+r[6]:null,rate:+r[7],tolerance:+r[8],block:+r[9],gross:r[10]?+r[10]:null,discount:r[11]?+r[11]:null,reason:r[12],total:r[13]?+r[13]:null,status:r[14],method:r[15],paidAt:r[16]?+r[16]:null,keys:!legacy&&r[18]==='Sí'};});
 return validate({version:1,settings:JSON.parse(config[0][17]),visits});
}
