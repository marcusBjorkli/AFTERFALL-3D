// AFTERFALL CE 1.1.4B.6 – physical delivery from nearby material piles.
// Pure transformation; the host commits the updated plan and piles atomically.
const EPS=1e-7;
export function distanceToBuildingSite(site,x,z){
 if(!site||!Array.isArray(site.origin)||!Number.isFinite(x)||!Number.isFinite(z))return Infinity;
 const a=site.angle*Math.PI/180,c=Math.cos(a),s=Math.sin(a),dx=x-site.origin[0],dz=z-site.origin[2];
 const lx=dx*c+dz*s,lz=-dx*s+dz*c;
 return Math.hypot(Math.max(-lx,0,lx-site.length),Math.max(-lz,0,lz-site.width));
}
export function nearbyBuildingMaterials(plan,stockpiles,actor,reach=5){
 const resources=new Map(),candidateIds=new Set();
 if(!plan?.site||!actor||!Number.isFinite(actor.x)||!Number.isFinite(actor.z))return {resources,candidateIds};
 for(const p of stockpiles){
  if(!p?.id||!Number.isFinite(p.x)||!Number.isFinite(p.z)||!Number.isFinite(p.qty)||p.qty<=EPS)continue;
  if(Math.hypot(p.x-actor.x,p.z-actor.z)>reach+EPS||distanceToBuildingSite(plan.site,p.x,p.z)>reach+EPS)continue;
  const row=plan.materialTotals.find(m=>m.material===p.material);
  if(!row||row.missingUnits<=EPS)continue;
  const n=row.resource.unit==='stk'?Math.floor(p.qty+EPS):p.qty;
  if(n<=EPS)continue;
  resources.set(p.material,(resources.get(p.material)||0)+n);candidateIds.add(p.id);
 }
 return {resources,candidateIds};
}
export function deliverBuildFromPiles(plan,piles,actor,deliver,reach=5){
 if(!plan||!Array.isArray(piles)||typeof deliver!=='function')return {error:'Ugyldig materiallager.'};
 const eligible=nearbyBuildingMaterials(plan,piles,actor,reach),virtual={},alloc=[];
 for(const row of plan.materialTotals){
  const requested=Math.min(eligible.resources.get(row.material)||0,row.missingUnits||0);
  if(requested<=EPS)continue;
  let rest=requested;
  const sources=piles.filter(p=>eligible.candidateIds.has(p.id)&&p.material===row.material)
   .sort((a,b)=>Math.hypot(a.x-actor.x,a.z-actor.z)-Math.hypot(b.x-actor.x,b.z-actor.z)||String(a.id).localeCompare(String(b.id)));
  for(const pile of sources){
   if(rest<=EPS)break;
   const available=row.resource.unit==='stk'?Math.floor(pile.qty+EPS):pile.qty;
   const n=Math.min(available,rest);if(n<=EPS)continue;
   alloc.push({id:pile.id,qty:n});rest-=n;
  }
  if(requested-rest>EPS)virtual[row.material]=requested-rest;
 }
 if(!Object.keys(virtual).length)return {error:'Ingen nødvendige materialer i hauger innen 5 meter.'};
 const result=deliver(plan,virtual);
 if(result.error)return result;
 for(const [key,n] of Object.entries(result.moved))if(Math.abs(n-(virtual[key]||0))>EPS)return {error:'Materialmengdene stemmer ikke.'};
 const after=piles.map(p=>({...p}));
 for(const a of alloc){
  const p=after.find(p=>p.id===a.id);if(!p||p.qty+EPS<a.qty)return {error:'Materiallageret har endret seg.'};
  p.qty=Math.max(0,p.qty-a.qty);
 }
 return {...result,piles:after.filter(p=>p.qty>EPS),source:'piles'};
}
