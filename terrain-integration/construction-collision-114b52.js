// AFTERFALL CE 1.1.4B.6 – gameplay collision from mounted convex prisms.
// Horizontal player footprint is a circle, vertical body is a finite interval.
// Sloped pieces are clipped to player height before checking horizontal contact.
const EPS=1e-7,DOOR_SWING_RAD=1.45,CELL=8;
export function createConstructionCollision(installedSites){
 const modules=[],decks=[];
 for(const site of installedSites){
  for(const m of site.modules){
   const angle=m.angle*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
   const common={key:String(site.siteId)+':'+m.moduleId,siteId:site.siteId,type:m.type,cx:m.center[0],cy:m.center[1],cz:m.center[2],c,s,l:m.length,w:m.width,h:m.height,radius:Math.hypot(m.length,m.width)/2+.45};
   if(m.type==='floorDeck'){
    decks.push({...common,top:m.center[1]+m.height});
    continue;
   }
   const solids=[];
   for(const part of m.pieces){
    const poly=part.polygon;
    if(!poly?.length||!Number.isFinite(part.z0)||!Number.isFinite(part.z1))continue;
    const xs=poly.map(v=>v[0]),ys=poly.map(v=>v[1]);
    solids.push({poly,z0:part.z0,z1:part.z1,
     minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)});
   }
   if(solids.length)modules.push({...common,solids});
  }
 }
 const moduleCells=new Map(),deckCells=new Map();
 const insert=(map,m)=>{
  const reach=m.radius+(m.type==='doorLeaf'?m.l:0)+.45;
  for(let x=Math.floor((m.cx-reach)/CELL);x<=Math.floor((m.cx+reach)/CELL);x++)
   for(let z=Math.floor((m.cz-reach)/CELL);z<=Math.floor((m.cz+reach)/CELL);z++){
    const key=x+','+z,arr=map.get(key)||[];arr.push(m);map.set(key,arr);
   }
 };
 for(const m of modules)insert(moduleCells,m);
 for(const m of decks)insert(deckCells,m);
 return {modules,decks,moduleCells,deckCells};
}
function cellsAt(index,x,z,kind){
 const map=kind==='decks'?index.deckCells:index.moduleCells;
 if(!map)return kind==='decks'?index.decks:index.modules;
 const ix=Math.floor(x/CELL),iz=Math.floor(z/CELL),found=new Set();
 for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)
  for(const m of map.get((ix+dx)+','+(iz+dz))||[])found.add(m);
 return found;
}
function openedDoor(m){
 const angle=Math.atan2(m.s,m.c)-DOOR_SWING_RAD;
 const hx=m.cx-m.c*m.l/2,hz=m.cz-m.s*m.l/2;
 return {...m,c:Math.cos(angle),s:Math.sin(angle),cx:hx+Math.cos(angle)*m.l/2,cz:hz+Math.sin(angle)*m.l/2};
}
function localXZ(m,x,z){
 const dx=x-m.cx,dz=z-m.cz;
 return [dx*m.c+dz*m.s,-dx*m.s+dz*m.c];
}
export function walkableHeight(x,z,terrainHeight,index,maxStep=.72){
 let h=terrainHeight;
 for(const m of cellsAt(index,x,z,'decks')){
  const [lx,lz]=localXZ(m,x,z);
  if(Math.abs(lx)>m.l/2+EPS||Math.abs(lz)>m.w/2+EPS)continue;
  // Small raised decks are walkable without a separate step animation.
  if(m.top>=terrainHeight-EPS&&m.top<=terrainHeight+maxStep+EPS)h=Math.max(h,m.top);
 }
 return h;
}
function clipY(polygon,level,lower){
 const inside=v=>lower?v[1]>=level-EPS:v[1]<=level+EPS;
 const out=[];
 for(let i=0;i<polygon.length;i++){
  const a=polygon[i],b=polygon[(i+1)%polygon.length],ia=inside(a),ib=inside(b);
  if(ia!==ib){
   const d=b[1]-a[1];
   if(Math.abs(d)>EPS){const t=(level-a[1])/d;out.push([a[0]+t*(b[0]-a[0]),level]);}
  }
  if(ib)out.push(b);
 }
 return out;
}
function bodySliceX(solid,low,high){
 if(solid.maxY<=low+EPS||solid.minY>=high-EPS)return null;
 if(solid.minY>=low-EPS&&solid.maxY<=high+EPS)return [solid.minX,solid.maxX];
 const clipped=clipY(clipY(solid.poly,low,true),high,false);
 if(!clipped.length)return null;
 let a=Infinity,b=-Infinity;
 for(const p of clipped){a=Math.min(a,p[0]);b=Math.max(b,p[0]);}
 return Number.isFinite(a)?[a,b]:null;
}
export function constructionCollidesAt(x,z,feet,index,openDoors=new Set(),radius=.34){
 const low=feet+.10,high=feet+1.68,r2=radius*radius;
 for(const base of cellsAt(index,x,z,'modules')){
  // A door stays solid when open; use the same hinge rotation as the mesh.
  const m=base.type==='doorLeaf'&&openDoors.has(base.key)?openedDoor(base):base;
  if(Math.hypot(x-m.cx,z-m.cz)>m.radius+radius)continue;
  const [lx,lz]=localXZ(m,x,z),lo=low-m.cy,hi=high-m.cy;
  for(const solid of m.solids){
   if(lz<solid.z0-radius||lz>solid.z1+radius||lx<solid.minX-radius||lx>solid.maxX+radius)continue;
   const span=bodySliceX(solid,lo,hi);
   if(!span)continue;
   const dx=Math.max(span[0]-lx,0,lx-span[1]),dz=Math.max(solid.z0-lz,0,lz-solid.z1);
   if(dx*dx+dz*dz<r2-1e-10)return true;
  }
 }
 return false;
}
export function nearestClearPosition(x,z,groundAt,index,openDoors=new Set()){
 const blocked=(px,pz)=>constructionCollidesAt(px,pz,walkableHeight(px,pz,groundAt(px,pz),index),index,openDoors);
 if(!blocked(x,z))return null;
 for(let r=.15;r<=3.05;r+=.15){
  const steps=Math.max(24,Math.ceil(2*Math.PI*r/.15));
  for(let i=0;i<steps;i++){
   const a=2*Math.PI*i/steps,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
   if(!blocked(px,pz))return {x:px,z:pz};
  }
 }
 return null;
}
