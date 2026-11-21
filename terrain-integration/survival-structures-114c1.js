// CE 1.1.4C.1: physical survival stations. Build costs are gameplay values.
export const SURVIVAL_DEFS={
 campfire:{name:'Bålplass',icon:'🔥',cost:{stone:12,firewood:1},r:.65},
 crate:{name:'Lagringskasse',icon:'📦',cost:{planks:6,battens:2},r:.55,capacity:{mass:300,volume:.45}},
 workbench:{name:'Arbeidsbenk',icon:'🪚',cost:{logs:1,planks:4},r:.95},
 sawbuck:{name:'Sagbukk',icon:'🪵',cost:{logs:1,battens:2},r:.85},
 woodshed:{name:'Vedskjul',icon:'🪵',cost:{logs:1,planks:5},r:1.35,capacity:{mass:1800,volume:4.2}}
};
export const WOOD_RESOURCES=['logs','planks','battens','sticks','firewood','sawdust'];
export const WORK_RECIPES={torch:{name:'Fakkel',input:{sticks:2,firewood:1},output:{torch:1}},pegs:{name:'Trepinner',input:{planks:1},output:{sticks:8,sawdust:2}}};
const EPS=1e-7,rounded=x=>Math.round(x*1000)/1000;
function totals(a,c){
 if(!a||typeof a!=='object'||Array.isArray(a))return null;
 let mass=0,volume=0;
 for(const [id,n] of Object.entries(a)){
  const meta=c[id];if(!meta||!Number.isFinite(n)||n<0||n>1e8||(meta.unit==='stk'&&!Number.isSafeInteger(n)))return null;
  mass+=n*meta.mass;volume+=n*meta.volume;
 }
 return {mass,volume};
}
function fits(a,c,lim){const t=totals(a,c);return !!t&&t.mass<=lim.mass+EPS&&t.volume<=lim.volume+EPS;}
function take(a,id,n){if((a[id]||0)+EPS<n)return false;a[id]=rounded(Math.max(0,a[id]-n));if(a[id]<EPS)delete a[id];return true;}
function add(a,id,n){a[id]=rounded((a[id]||0)+n);}
export function buildSurvival(type,pos,inv,other,c,limit){
 const def=SURVIVAL_DEFS[type],list=Array.isArray(other)?other:[...other.values()];
 if(!def||!pos||![pos.x,pos.y,pos.z,pos.angle].every(Number.isFinite)||typeof pos.id!=='string'||!pos.id||pos.id.length>120)return {error:'Ugyldig konstruksjon eller plassering.'};
 if(list.length>=100||list.some(s=>s.id===pos.id))return {error:'Konstruksjonsgrensen eller ID er brukt.'};
 if(list.some(s=>Math.hypot(s.x-pos.x,s.z-pos.z)<def.r+(SURVIVAL_DEFS[s.type]?.r||.7)+.35))return {error:'For nær en annen konstruksjon.'};
 if(!fits(inv,c,limit))return {error:'Ugyldig inventar.'};
 const items={...inv};
 for(const [id,n] of Object.entries(def.cost))if(!take(items,id,n))return {error:'Mangler '+n+' '+(c[id]?.name||id).toLowerCase()+'.'};
 return {structure:{id:pos.id,type,x:pos.x,y:pos.y,z:pos.z,angle:pos.angle,items:{},litUntil:0},inventory:items,cost:{...def.cost}};
}
export function restoreSurvival(records,c,now=Date.now()){
 const values=new Map(),invalid=[];
 for(const o of Array.isArray(records)?records.slice(0,100):[]){
  if(!o||!SURVIVAL_DEFS[o.type]||typeof o.id!=='string'||!o.id||o.id.length>120||values.has(o.id)||![o.x,o.y,o.z,o.angle].every(Number.isFinite)||o.x<1||o.z<1||o.x>4095||o.z>4095){invalid.push(o?.id||'?');continue;}
  const def=SURVIVAL_DEFS[o.type],items=o.items||{};
  if(!fits(items,c,def.capacity||{mass:1e10,volume:1e10})||!def.capacity&&Object.keys(items).length||o.type==='woodshed'&&Object.keys(items).some(id=>!WOOD_RESOURCES.includes(id))){invalid.push(o.id);continue;}
  const litUntil=o.type==='campfire'&&Number.isFinite(o.litUntil)&&o.litUntil>=0&&o.litUntil<now+365*86400000?o.litUntil:0;
  values.set(o.id,{id:o.id,type:o.type,x:o.x,y:o.y,z:o.z,angle:o.angle,items:{...items},litUntil});
 }
 return {structures:values,invalid};
}
export function moveSurvivalStock(s,inv,c,carry,id,amount,direction){
 const def=SURVIVAL_DEFS[s?.type];
 if(!def?.capacity||!c[id]||!['deposit','withdraw'].includes(direction)||!Number.isFinite(amount)||amount<=0||amount>1e8||Math.abs(rounded(amount)-amount)>EPS||c[id].unit==='stk'&&!Number.isSafeInteger(amount))return {error:'Ugyldig overføring.'};
 if(s.type==='woodshed'&&!WOOD_RESOURCES.includes(id))return {error:'Vedskjulet tar bare ved og trelast.'};
 if(!fits(inv,c,carry)||!fits(s.items,c,def.capacity))return {error:'Ugyldig inventar eller lager.'};
 const inventory={...inv},stored={...s.items},from=direction==='deposit'?inventory:stored,to=direction==='deposit'?stored:inventory;
 if(!take(from,id,amount))return {error:'For lite materiale.'};
 add(to,id,amount);
 if(!fits(inventory,c,carry))return {error:'Inventaret er fullt.'};
 if(!fits(stored,c,def.capacity))return {error:'Lageret er fullt.'};
 return {inventory,structure:{...s,items:stored},amount,id,direction};
}
export function fuelCampfire(s,inv,now=Date.now()){
 if(s?.type!=='campfire'||(inv?.firewood||0)<1)return {error:'Du trenger én vedkubbe.'};
 const inventory={...inv};take(inventory,'firewood',1);
 return {inventory,structure:{...s,litUntil:Math.max(now,s.litUntil||0)+8*60000}};
}
export function warmAt(ss,x,z,now=Date.now()){return ss.some(s=>s.type==='campfire'&&s.litUntil>now&&Math.hypot(x-s.x,z-s.z)<4);}
export function dryBerries(s,inv,now=Date.now()){
 if(s?.type!=='campfire'||s.litUntil<=now)return {error:'Tenn bålet først.'};
 if((inv?.berries||0)<2)return {error:'Du trenger to porsjoner bær.'};
 const inventory={...inv};take(inventory,'berries',2);add(inventory,'dried_berries',1);return {inventory};
}
export function craftWorkbench(s,inv,c,carry,recipeId,count=1){
 const r=WORK_RECIPES[recipeId];if(s?.type!=='workbench'||!r||!Number.isSafeInteger(count)||count<1||count>10||!fits(inv,c,carry))return {error:'Ugyldig oppskrift.'};
 const inventory={...inv};
 for(const [id,n] of Object.entries(r.input))if(!take(inventory,id,n*count))return {error:'Mangler '+id+'.'};
 for(const [id,n] of Object.entries(r.output))add(inventory,id,n*count);
 if(!fits(inventory,c,carry))return {error:'Inventaret er fullt.'};
 return {inventory,recipe:r};
}
export function eatBerries(inv,hunger){
 if((inv?.dried_berries||0)<1)return {error:'Ingen tørkede bær.'};
 const inventory={...inv};take(inventory,'dried_berries',1);
 return {inventory,hunger:Math.min(100,Math.max(0,hunger)+18)};
}
export function igniteTorch(inv,now=Date.now(),until=0){
 if((inv?.torch||0)<1)return {error:'Ingen fakkel.'};
 const inventory={...inv};take(inventory,'torch',1);
 return {inventory,torchUntil:Math.max(now,until)+300000};
}
