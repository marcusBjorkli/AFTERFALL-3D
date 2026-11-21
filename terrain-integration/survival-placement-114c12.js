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
export function validateSmallGround(type,position,projects,defs,{heightAt,restricted,waterAt,collides,player,other=[],sawbucks=[],piles=[],pileRadius=()=>.4}={}){
 const radius=smallFootprint(type,defs);
 if(!radius||!position||![position.x,position.z,position.y,position.angle].every(Number.isFinite))return {error:'Ugyldig konstruksjon eller plassering.'};
 const {x,z}=position;
 // The entire physical collision radius must fit within ONE approved grade.
 const q=(projects||[]).find(q=>['completed','archived'].includes(q.status)
  &&x-radius>=q.x0-1e-7&&x+radius<=q.x1+1e-7
  &&z-radius>=q.z0-1e-7&&z+radius<=q.z1+1e-7);
 if(!q)return {error:'Planer og godkjenn et område som rommer hele småbygget.'};
 if(typeof heightAt!=='function'||typeof restricted!=='function'||typeof collides!=='function')
  return {error:'Terrengkontrollen er ikke tilgjengelig.'};
 if(Math.abs(position.y-q.level)>.025)return {error:'Byggegrunnen har feil kote. Fullfør planeringen.'};
 for(let i=-1;i<16;i++){
  const a=2*Math.PI*Math.max(i,0)/16,px=i===-1?x:x+radius*Math.cos(a),pz=i===-1?z:z+radius*Math.sin(a);
  const h=heightAt(px,pz);
  if(!Number.isFinite(h)||Math.abs(h-q.level)>.025)return {error:'Byggegrunnen er ikke fullstendig planert.'};
  if(restricted(px,pz)||(waterAt&&waterAt(px,pz)))return {error:'Småbygget overlapper vann eller beskyttet terreng.'};
  if(collides(px,pz))return {error:'Småbygget kolliderer med en bygning.'};
 }
 if(player&&Math.hypot(x-player.x,z-player.z)<radius+.48)return {error:'Flytt småbygget bort fra Marcus.'};
 if(other.some(s=>s&&defs[s.type]&&Math.hypot(x-s.x,z-s.z)<radius+defs[s.type].r+.35))
  return {error:'For nær en annen småkonstruksjon.'};
 if(sawbucks.some(s=>s&&Math.hypot(x-s.x,z-s.z)<radius+.85+.35))
  return {error:'For nær en eksisterende sagbukk.'};
 if(piles.some(p=>p&&Math.hypot(x-p.x,z-p.z)<radius+pileRadius(p)+.3))
  return {error:'Flytt materialhaugen før bygging.'};
 return {gradeId:q.id,level:q.level};
}
