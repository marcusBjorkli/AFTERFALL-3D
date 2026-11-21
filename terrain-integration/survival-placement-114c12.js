// AFTERFALL CE 1.1.4C.1.2 – authoritative checks for small-structure placement.
// Existing placed structures are not migrated or revalidated by this module.
export const SMALL_ROTATION_STEP=15;
export function normalizeSmallAngle(angle){
 if(!Number.isFinite(angle))return 0;
 return (Math.round(angle/5)*5%360+360)%360;
}
export function rotateSmallAngle(angle,steps){
 return normalizeSmallAngle(angle+SMALL_ROTATION_STEP*steps);
}
export function smallFootprint(type,defs){
 const def=defs?.[type];
 return def&&Number.isFinite(def.r)&&def.r>0?def.r:null;
}
// The flatness of the *physical footprint* is authoritative, not ownership
// of a historical grading-project ID. Approved projects may contain older
// buildings, but their unoccupied flat portions are reusable.
export function validateSmallGround(type,position,projects,defs,{heightAt,restricted,waterAt,collides,player,other=[],sawbucks=[],piles=[],pileRadius=()=>.4}={}){
 const radius=smallFootprint(type,defs);
 if(!radius||!position||![position.x,position.z,position.y,position.angle].every(Number.isFinite))return {error:'Ugyldig konstruksjon eller plassering.'};
 const {x,z}=position;
 if(typeof heightAt!=='function'||typeof restricted!=='function'||typeof collides!=='function')
  return {error:'Terrengkontrollen er ikke tilgjengelig.'};
 const level=heightAt(x,z);
 if(!Number.isFinite(level)||Math.abs(position.y-level)>.025)return {error:'Byggeplassen har feil terrengkote.'};
 // Center, full perimeter, inner ring and the integer-grid nodes within the
 // footprint: avoid accepting a sloping spot merely because corners match.
 const samples=[[x,z]];
 for(const [r,steps] of [[radius,24],[radius*.5,12]]){
  for(let i=0;i<steps;i++){const a=i*2*Math.PI/steps;samples.push([x+r*Math.cos(a),z+r*Math.sin(a)]);}
 }
 for(let iz=Math.ceil(z-radius);iz<=Math.floor(z+radius);iz++)
  for(let ix=Math.ceil(x-radius);ix<=Math.floor(x+radius);ix++)
   if(Math.hypot(ix-x,iz-z)<=radius+.000001)samples.push([ix,iz]);
 for(const [px,pz] of samples){
  const h=heightAt(px,pz);
  if(!Number.isFinite(h)||Math.abs(h-level)>.025)return {error:'Hele byggeflaten må ha samme kote. Planer eller utvid området.'};
  if(restricted(px,pz)||(waterAt&&waterAt(px,pz)))return {error:'Småbygget overlapper vann eller vernet terreng.'};
  if(collides(px,pz))return {error:'Småbygget kolliderer med et eksisterende bygg.'};
  // Unfinished grading must not be overwritten while excavation continues.
  if((projects||[]).some(q=>q.status==='active'&&px>=q.x0&&px<=q.x1&&pz>=q.z0&&pz<=q.z1))
   return {error:'Fullfør det aktive planeringsprosjektet før du bygger her.'};
 }
 if(player&&Math.hypot(x-player.x,z-player.z)<radius+.48)return {error:'Flytt småbygget bort fra Marcus.'};
 if(other.some(s=>s&&defs[s.type]&&Math.hypot(x-s.x,z-s.z)<radius+defs[s.type].r+.35))
  return {error:'For nær en annen småkonstruksjon.'};
 if(sawbucks.some(s=>s&&Math.hypot(x-s.x,z-s.z)<radius+.85+.35))
  return {error:'For nær en eksisterende sagbukk.'};
 if(piles.some(p=>p&&Math.hypot(x-p.x,z-p.z)<radius+pileRadius(p)+.3))
  return {error:'Flytt materialhaugen før bygging.'};
 const approved=(projects||[]).find(q=>['completed','archived'].includes(q.status)&&x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1&&Math.abs(q.level-level)<.025);
 return {gradeId:approved?.id||null,level};
}
