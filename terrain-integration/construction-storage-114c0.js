// AFTERFALL CE 1.1.4C.0 – persistent interactive storehouses.
// No modification of construction plans, inventory schema, or legacy world keys.
const EPS=1e-7;
const round=v=>Math.round(v*1000)/1000;
const validResource=(catalog,id)=>Object.hasOwn(catalog,id);
function insidePolygon(x,z,points){
 let inPoly=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const a=points[i],b=points[j],dx=b[0]-a[0],dz=b[2]-a[2];
  if(((a[2]>z)!==(b[2]>z))&&x<(dx*(z-a[2])/(dz||1e-20)+a[0]))inPoly=!inPoly;
 }
 return inPoly;
}
export function distanceToStorehouse(plan,x,z){
 const v=plan?.setout?.world;
 if(!Array.isArray(v)||v.length<3||!Number.isFinite(x)||!Number.isFinite(z))return Infinity;
 if(insidePolygon(x,z,v))return 0;
 let best=Infinity;
 for(let i=0;i<v.length;i++){
  const a=v[i],b=v[(i+1)%v.length],dx=b[0]-a[0],dz=b[2]-a[2];
  const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz||1)));
  best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz));
 }
 return best;
}
export function isCompletedStorehouse(plan){
 if(plan?.status!=='complete'||!plan.planId||!Array.isArray(plan.project?.modules))return false;
 const ms=plan.project.modules,types=new Set(ms.map(m=>m.type));
 const hasShell=types.has('floorDeck')&&types.has('doorWall')&&types.has('doorLeaf')&&['flatRoof','gableRoof','shedRoof'].some(t=>types.has(t));
 if(!hasShell)return false;
 const name=(plan.project.name||'')+' '+(plan.project.description||'');
 const named=/lager|storage|skur|bod/i.test(name);
 const originalStorage=ms.length===11&&types.has('flatRoof')&&!types.has('windowWall')&&!types.has('windowUnit')&&!types.has('gableRoof');
 return named||originalStorage;
}
export function storeCapacity(plan){
 const setout=plan?.setout||{},area=Number(setout.area)||(Number(setout.length)||3)*(Number(setout.width)||3);
 const floor=Math.max(1,Math.min(64,area));
 return {volume:round(Math.max(4,Math.min(24,floor*1.4))),mass:Math.round(Math.max(6000,Math.min(24000,floor*1600)))};
}
export function resourceTotals(items,catalog){
 let mass=0,volume=0;
 for(const [id,n] of Object.entries(items||{})){
  if(!validResource(catalog,id)||!Number.isFinite(n)||n<0)return {error:'Ugyldig lagermateriale.'};
  mass+=n*catalog[id].mass;volume+=n*catalog[id].volume;
 }
 return {mass,volume};
}
export function validateStoreItems(items,plan,catalog){
 if(items==null)return {items:{}};
 if(typeof items!=='object'||Array.isArray(items))return {error:'Ugyldig lagret innhold.'};
 const clean={};
 for(const [id,n] of Object.entries(items)){
  if(!validResource(catalog,id)||!Number.isFinite(n)||n<0||n>1e8)return {error:'Ukjent eller ugyldig lagermateriale.'};
  if(catalog[id].unit==='stk'&&!Number.isSafeInteger(n))return {error:'Tre og utstyr må lagres i hele enheter.'};
  if(n>EPS)clean[id]=n;
 }
 const sum=resourceTotals(clean,catalog),cap=storeCapacity(plan);
 if(sum.error||sum.mass>cap.mass+EPS||sum.volume>cap.volume+EPS)return {error:'Lagret mengde overskrider bygningens kapasitet.'};
 return {items:clean};
}
export function transferToStore({inventory,stored,resource,amount,direction,plan,catalog,inventoryLimit}){
 if(!isCompletedStorehouse(plan))return {error:'Bygningen er ikke et ferdig lagerskur.'};
 if(!validResource(catalog,resource)||!Number.isFinite(amount)||amount<=0||amount>1e8)return {error:'Ugyldig materialmengde.'};
 if(!['deposit','withdraw'].includes(direction))return {error:'Ugyldig overføringsretning.'};
 if(catalog[resource].unit==='stk'&&!Number.isSafeInteger(amount))return {error:'Denne ressursen overføres i hele enheter.'};
 const qty=round(amount);
 if(qty<=0||Math.abs(qty-amount)>EPS)return {error:'Bruk maks tre desimaler.'};
 const check=validateStoreItems(stored,plan,catalog);if(check.error)return check;
 const inv={...inventory},store={...check.items};
 const source=direction==='deposit'?inv:store,target=direction==='deposit'?store:inv;
 if(!Number.isFinite(source[resource]||0)||(source[resource]||0)+EPS<qty)return {error:'For lite materiale tilgjengelig.'};
 source[resource]=round(Math.max(0,(source[resource]||0)-qty));if(source[resource]<=EPS)delete source[resource];
 target[resource]=round((target[resource]||0)+qty);
 const totals=resourceTotals(store,catalog),capacity=storeCapacity(plan);
 if(totals.error||totals.volume>capacity.volume+EPS||totals.mass>capacity.mass+EPS)return {error:'Lagerskuret er fullt.'};
 const carried=resourceTotals(inv,catalog);
 if(carried.error||carried.mass>inventoryLimit.mass+EPS||carried.volume>inventoryLimit.volume+EPS)return {error:'Inventaret har ikke ledig bærekapasitet.'};
 return {inventory:inv,stored:store,moved:{resource,quantity:qty,direction},capacity,totals};
}
export function restoreBuildingStores(records,plans,catalog){
 const result=new Map(),warnings=[];
 for(const raw of Array.isArray(records)?records:[]){
  if(!raw||typeof raw.planId!=='string'||raw.planId.length>240||result.has(raw.planId)){warnings.push('Ugyldig eller duplisert lager-ID.');continue;}
  const plan=[...plans.values()].find(p=>p.planId===raw.planId);
  if(!plan||!isCompletedStorehouse(plan)){warnings.push('Lager uten godkjent ferdig bygg: '+raw.planId);continue;}
  const check=validateStoreItems(raw.items,plan,catalog);
  if(check.error){warnings.push('Ugyldig lagerinnhold for '+raw.planId+': '+check.error);continue;}
  result.set(raw.planId,check.items);
 }
 return {stores:result,warnings};
}
