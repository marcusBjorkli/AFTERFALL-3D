// CE 1.1.4C.1.4: real-height grid and safe target-limit math (no save mutation).
export const GRADE_TOLERANCE=.02;
export function quantizeTarget(value){return Number.isFinite(value)&&value>=-100&&value<=1000?Math.round(value*100)/100:null;}
export function terrainTargetStep(height,fill,target,locked=true){
 if(!Number.isFinite(height)||typeof fill!=='boolean')return null;
 const bound=locked?quantizeTarget(target):null,dir=fill?1:-1;
 if(locked&&bound===null||bound!==null&&dir*(bound-height)<=1e-7)return null;
 const scaled=height*10,r=Math.round(scaled);
 let next=(Math.abs(scaled-r)<=1e-6?r+dir:fill?Math.ceil(scaled):Math.floor(scaled))/10;
 if(bound!==null)next=fill?Math.min(next,bound):Math.max(next,bound);
 return dir*(next-height)>1e-7?next:null;
}
export function readGridCells(heightAt,cx,cz,target,{radius=4,step=1,tolerance=GRADE_TOLERANCE}={}){
 if(typeof heightAt!=='function'||![cx,cz,target].every(Number.isFinite))return [];
 const ox=Math.round(cx),oz=Math.round(cz),cells=[];
 for(let z=oz-radius;z<=oz+radius;z+=step)for(let x=ox-radius;x<=ox+radius;x+=step){
  const pts=[[x-step/2,z-step/2],[x+step/2,z-step/2],[x-step/2,z+step/2],[x+step/2,z+step/2],[x,z]],h=pts.map(p=>heightAt(...p));
  if(h.some(v=>!Number.isFinite(v)))continue;
  const level=h[4],spread=Math.max(...h)-Math.min(...h),difference=level-target;
  cells.push({x,z,level,difference,spread,corners:h.slice(0,4),classification:Math.abs(difference)<=tolerance&&spread<=tolerance?'flat':difference>tolerance?'cut':difference< -tolerance?'fill':'uneven'});
 }
 return cells;
}
export function plotFlatAt(heightAt,cx,cz,{minSize=3,maxSize=20,tolerance=GRADE_TOLERANCE,valid=()=>true}={}){
 if(typeof heightAt!=='function'||![cx,cz].every(Number.isFinite)||typeof valid!=='function')return null;
 const x=Math.round(cx),z=Math.round(cz),h=heightAt(x,z);
 if(!Number.isFinite(h)||!valid(x,z))return null;
 let best=null;
 for(let size=minSize;size<=maxSize;size++){
  const left=Math.floor(size/2),right=size-left;
  const x0=x-left,x1=x+right,z0=z-left,z1=z+right;
  let allowed=true;
  for(let iz=z0;iz<=z1&&allowed;iz++)for(let ix=x0;ix<=x1;ix++){
   const at=heightAt(ix,iz);
   if(!Number.isFinite(at)||Math.abs(at-h)>tolerance||!valid(ix,iz)){allowed=false;break;}
  }
  for(let iz=z0;iz<z1&&allowed;iz++)for(let ix=x0;ix<x1;ix++)if(Math.abs(heightAt(ix+.5,iz+.5)-h)>tolerance){allowed=false;break;}
  if(!allowed)break;
  best={x0,x1,z0,z1,level:quantizeTarget(h),actualLevel:h,area:size*size,size};
 }
 return best;
}
export function flatConnectedCells(heightAt,cx,cz,{radius=12,tolerance=GRADE_TOLERANCE,valid=()=>true}={}){
 if(typeof heightAt!=='function'||![cx,cz].every(Number.isFinite))return {nodes:[],area:0,level:null};
 const x=Math.round(cx),z=Math.round(cz),level=heightAt(x,z);
 if(!Number.isFinite(level))return {nodes:[],area:0,level:null};
 const queue=[[x,z]],seen=new Set(),nodes=[];
 for(let i=0;i<queue.length;i++){
  const [u,v]=queue[i],key=u+','+v;
  if(seen.has(key))continue;seen.add(key);
  if(Math.abs(u-x)>radius||Math.abs(v-z)>radius||!valid(u,v))continue;
  if(Math.abs(heightAt(u,v)-level)>tolerance)continue;
  nodes.push({x:u,z:v});if(nodes.length>=2601)break;
  queue.push([u+1,v],[u-1,v],[u,v+1],[u,v-1]);
 }
 return {nodes,area:nodes.length,level};
}
