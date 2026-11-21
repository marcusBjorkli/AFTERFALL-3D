// AFTERFALL CE 1.1.4C.1.3 – safe, separate extensions to existing graded sites.
// Parent projects retain their original bounds/IDs and construction-plan geometry.
const EPS=1e-7;
export function gradeTouches(a,b){
 const xContact=(Math.abs(a.x1-b.x0)<EPS||Math.abs(b.x1-a.x0)<EPS)&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>EPS;
 const zContact=(Math.abs(a.z1-b.z0)<EPS||Math.abs(b.z1-a.z0)<EPS)&&Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>EPS;
 return xContact||zContact;
}
export function gradeIntersectsArea(a,b){
 return Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>EPS&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>EPS;
}
export function gradeSharedBorderNode(x,z,existing,candidate,level){
 return existing.some(q=>['completed','archived'].includes(q.status)
  &&Math.abs(q.level-level)<.025
  &&gradeTouches(q,candidate)
  &&x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1
  &&(x===q.x0||x===q.x1||z===q.z0||z===q.z1));
}
export function validateGradeExtension(parent,candidate,projects,worldSize=4096){
 if(!parent||!['completed','archived'].includes(parent.status))return {error:'Velg et godkjent planeringsområde å utvide.'};
 const q=candidate;
 if(!q||!['x0','x1','z0','z1'].every(k=>Number.isInteger(q[k]))||
  !Number.isFinite(q.level)||q.x0<2||q.z0<2||q.x1>=worldSize-2||q.z1>=worldSize-2||
  q.x1<=q.x0||q.z1<=q.z0||q.x1-q.x0>20||q.z1-q.z0>20)
  return {error:'Utvidelsen må være mellom 1 × 1 og 20 × 20 meter.'};
 if(Math.abs(parent.level-q.level)>.025)return {error:'Utvidelsen må ha samme kote som det eksisterende området.'};
 if(!gradeTouches(parent,q))return {error:'Utvidelsen må dele en side med det valgte planeringsområdet.'};
 for(const other of projects||[]){
  if(gradeIntersectsArea(q,other))return {error:'Utvidelsen kan ikke dekke et eksisterende planeringsområde.'};
  if(gradeTouches(q,other)&&(!['completed','archived'].includes(other.status)||Math.abs(other.level-q.level)>.025))
   return {error:'Et tilstøtende område har en annen kote eller er ikke ferdig.'};
 }
 return {parentId:parent.id,level:parent.level};
}
