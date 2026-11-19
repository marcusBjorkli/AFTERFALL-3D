function validDimension(n){return Number.isFinite(n)&&n>=1&&n<=100&&Math.abs(n*4-Math.round(n*4))<1e-8;}
function snapCoordinate(value,size,snap){const v=Math.max(0,Math.min(size,value+size/2));return (snap?Math.min(size,Math.round(v*4)/4):v)-size/2;}
const catalog={
 stoneFoot:{name:'Punktfundament – stein',l:0.6,w:0.6,h:0.35,color:0x858b82,material:'Stein',ground:true,role:'foundation'},
 concreteFoot:{name:'Punktfundament – betong',l:0.5,w:0.5,h:0.4,color:0xa4a7a1,material:'Betong',ground:true,role:'foundation'},
 stripFoot:{name:'Stripefundament – betong',l:3,w:0.5,h:0.3,color:0xa4a7a1,material:'Betong',ground:true,role:'foundation'},
 foundationBeam:{name:'Fundamentbjelke',l:3,w:0.198,h:0.198,color:0x987b56,material:'Tre',role:'beam'},
 timberPost:{name:'Trestolpe',l:0.148,w:0.148,h:2.4,color:0xb28d64,material:'Tre',role:'post'},
 timberBeam:{name:'Trebjelke',l:3,w:0.098,h:0.198,color:0xc5a578,material:'Tre',role:'beam'},
 brace:{name:'Skråavstiver (fast)',l:1.2,w:0.098,h:1.2,color:0xb88d5e,material:'Tre',role:'brace'},
 fittedBrace:{name:'Tilpasset skråavstiver',l:1,w:0.098,h:1,color:0xb88d5e,material:'Tre',role:'brace'},
 floorFrame:{name:'Gulvbjelkelag',l:3,w:3,h:.198,color:0xaf8961,material:'Tre',role:'floor',params:{member:.098,spacing:.6}},
 floorDeck:{name:'Gulvmodul',l:1,w:1,h:.035,color:0xb8a181,material:'Tre',role:'floor',params:{}},
 wallFrame:{name:'Veggramme',l:3,w:.148,h:2.4,color:0xb28d64,material:'Tre',role:'wall',params:{member:.048,spacing:.6}},
 cladding:{name:'Veggkledning',l:1,w:.048,h:2.4,color:0x9a7957,material:'Tre',role:'wall',params:{}},
 solidWall:{name:'Hel vegg',l:3,w:.148,h:2.4,color:0xa88765,material:'Tre',role:'wall',params:{}},
 doorWall:{name:'Vegg med døråpning',l:3,w:.148,h:2.4,color:0xa88765,material:'Tre',role:'wall',params:{openingW:.9,openingH:2.1,offset:0}},
 windowWall:{name:'Vegg med vindusåpning',l:3,w:.148,h:2.4,color:0xa88765,material:'Tre',role:'wall',params:{openingW:1.2,openingH:1,sill:.9,offset:0}},
 doorLeaf:{name:'Dør',l:.89,w:.045,h:2.09,color:0x76513b,material:'Tre',role:'door',params:{}},
 windowUnit:{name:'Vindu',l:1.19,w:.075,h:.99,color:0xffffff,material:'Tre/glass',role:'window',params:{rim:.05}},
 rafter:{name:'Taksperre',l:1.5,w:.098,h:1,color:0xc5a578,material:'Tre',role:'roof',params:{pitch:30,thickness:.198}},
 flatRoof:{name:'Flatt tak',l:3,w:3,h:.12,color:0x66767a,material:'Tre/taktekking',role:'roof',params:{thickness:.12}},
 shedRoof:{name:'Pulttak',l:3,w:3,h:1,color:0x66767a,material:'Tre/taktekking',role:'roof',params:{pitch:20,thickness:.12}},
 gableRoof:{name:'Saltak',l:3,w:3,h:1,color:0x66767a,material:'Tre/taktekking',role:'roof',params:{pitch:30,thickness:.12}},
 gableWall:{name:'Hel gavlvegg',l:3,w:.148,h:1,color:0xa88765,material:'Tre',role:'gable',params:{}},
 gableFrame:{name:'Gavlramme',l:3,w:.148,h:1,color:0xb28d64,material:'Tre',role:'gable',params:{member:.048,spacing:.6}},
 gableCladding:{name:'Gavlkledning',l:3,w:.048,h:1,color:0x9a7957,material:'Tre',role:'gable',params:{}},
 gableWindowWall:{name:'Gavl med vindusåpning',l:3,w:.148,h:1,color:0xa88765,material:'Tre',role:'gable',params:{openingW:.6,openingH:.4,sill:.15,offset:0}},
 block:{name:'Testblokk',l:1,w:1,h:1,color:0x8da6ac},
 post:{name:'Stolpe',l:0.2,w:0.2,h:2.5,color:0xaf8961},
 beam:{name:'Bjelke',l:3,w:0.2,h:0.25,color:0xc7a47a},
 panel:{name:'Plate',l:1,w:1,h:0.15,color:0xa2b8a0}
};
const EPS=1e-7,MAX_MODULES=300;
function footprint(m){return m.angle%180===0?{x:m.l/2,z:m.w/2}:{x:m.w/2,z:m.l/2};}
function isFitted(m){return m.type==='fittedBrace';}
function isBrace(m){return m.type==='brace'||isFitted(m);}
function braceEndHeight(h){return Math.min(0.12,h*0.4);}
function rotateVector(v,angle){
 const cs=[1,0,-1,0],sn=[0,1,0,-1],i=angle/90;
 return [v[0]*cs[i]-v[2]*sn[i],v[1],v[0]*sn[i]+v[2]*cs[i]];
}
function pointToWorld(m,v){
 const p=rotateVector(v,m.angle);return [p[0]+m.x,p[1]+m.y,p[2]+m.z];
}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function profileOf(m){
 if(isFitted(m))return m.profile;
 const t=braceEndHeight(m.h);
 return isBrace(m)?[[-m.l/2,0],[m.l/2,m.h-t],[m.l/2,m.h],[-m.l/2,t]]:
 [[-m.l/2,0],[m.l/2,0],[m.l/2,m.h],[-m.l/2,m.h]];
}
function isBuilding(m){return !!catalog[m.type]?.params;}
function isRoof(m){return catalog[m.type]?.role==='roof';}
function isGable(m){return !!m&&catalog[m.type]?.role==='gable';}
function isOpening(m){return m.type==='doorWall'||m.type==='windowWall'||m.type==='gableWindowWall';}
function roofRise(m){return (m.type==='gableRoof'?m.l/2:m.l)*Math.tan((m.type==='flatRoof'?0:m.params.pitch)*Math.PI/180);}
function roofThickness(m){return m.params.thickness/Math.cos((m.type==='flatRoof'?0:m.params.pitch)*Math.PI/180);}
function normalizeBuilding(m){
 if(!isBuilding(m))return m;
 const n={...m,params:{...catalog[m.type].params,...m.params}};
 if(isRoof(n))n.h=roofRise(n)+roofThickness(n);return n;
}
function openingOf(m){
 const p=m.params,base=m.type==='doorWall'?0:p.sill;
 return {x0:p.offset-p.openingW/2,x1:p.offset+p.openingW/2,y0:base,y1:base+p.openingH};
}
function gableError(m){
 const f=m.gableFit,p=m.params,s=f?.segments;
 if(!f||!Array.isArray(s)||!s.length||f.type!==m.type||Math.abs(f.l-m.l)>EPS||Math.abs(f.w-m.w)>EPS||Math.abs(f.h-m.h)>EPS)return 'Gavlen må dimensjoneres med Gavltilpasning.';
 if(s.some(a=>a.length!==4||!a.every(Number.isFinite)||a[1]-a[0]<=EPS||a[0]<-m.l/2-EPS||a[1]>m.l/2+EPS||Math.min(a[2],a[3])<-EPS)||s.some((a,i)=>i&&a[0]<s[i-1][1]-EPS)||Math.abs(Math.max(...s.flatMap(a=>a.slice(2)))-m.h)>EPS)return 'Ugyldig gavlprofil.';
 if(m.type==='gableFrame'&&(p.member<.025-EPS||p.member>.3||p.spacing<.25||p.spacing>2||p.spacing<p.member+.025||m.l>24||m.l<2*p.member||(m.l-p.member)/Math.max(1,Math.ceil((m.l-p.member)/p.spacing))<p.member-EPS))return 'Kontroller stenderbredde og senteravstand.';
 if(m.type==='gableWindowWall'){
  const o=openingOf(m),a=o.x0-.05,b=o.x1+.05;
  if(p.openingW<.2||p.openingH<.2||o.y0<.05||a<-m.l/2-EPS||b>m.l/2+EPS)return 'Vindusåpningen må ha minst 50 mm materiale rundt.';
  let reach=a;
  for(const q of s){
   const lo=Math.max(a,q[0]),hi=Math.min(b,q[1]);if(hi-lo<=EPS)continue;
   const height=x=>q[2]+(q[3]-q[2])*(x-q[0])/(q[1]-q[0]);
   if(lo>reach+EPS||Math.min(height(lo),height(hi))<o.y1+.05-EPS)return 'Vinduet går utenfor gavlprofilen. Reduser åpningen eller flytt den.';
   reach=Math.max(reach,hi);
  }
  if(reach<b-EPS)return 'Vinduet går utenfor gavlprofilen.';
 }
 return '';
}
function buildingError(m){
 if(!isBuilding(m))return '';
 const p=m.params||{};
 for(const k of Object.keys(catalog[m.type].params))if(!Number.isFinite(p[k]))return 'Ugyldig bygningsparameter: '+k;
 if(isGable(m))return gableError(m);
 if(isRoof(m)){
  if(m.roofFit){
   const f=m.roofFit;
   if(!['flatRoof','shedRoof','gableRoof'].includes(m.type)||f.type!==m.type||![f.l,f.w,f.pitch,f.thickness].every(Number.isFinite)||Math.abs(f.l-m.l)>EPS||Math.abs(f.w-m.w)>EPS||Math.abs(f.thickness-p.thickness)>EPS||Math.abs(f.pitch-(m.type==='flatRoof'?0:p.pitch))>EPS)return 'Dimensjoner på tilpasset tak endres via Taktilpasning. Frikoble for fri redigering.';
   if(!Array.isArray(f.seats)||f.seats.length!==2||f.seats.some(s=>![s.x0,s.x1,s.cut0,s.cut1,s.y,s.z].every(Number.isFinite)||s.x1-s.x0<=EPS||s.cut0>s.x0+EPS||s.cut1<s.x1-EPS||s.cut0<-m.l/2-EPS||s.cut1>m.l/2+EPS||Math.abs(s.z)>m.w/2+EPS||s.y<Math.max(roofUnderside(m,s.cut0),roofUnderside(m,s.cut1))-EPS||s.y>Math.min(roofUnderside(m,s.cut0),roofUnderside(m,s.cut1))+roofThickness(m)-.02+EPS)||f.seats[0].cut1>f.seats[1].cut0+EPS||(m.type==='gableRoof'&&(f.seats[0].cut1>EPS||f.seats[1].cut0<-EPS)))return 'Takets anleggsflater er ugyldige. Tilpass taket på nytt.';
  }
  if(p.thickness<.05-EPS||p.thickness>.5+EPS)return 'Taktykkelse må være 0,05–0,50 m.';
  if(m.type!=='flatRoof'&&(p.pitch<5||p.pitch>60))return 'Takvinkel må være 5–60°.';
  if(Math.abs(m.h-roofRise(m)-roofThickness(m))>EPS)return 'Takhøyde må beregnes fra parametere.';
 }
 if(isOpening(m)){
  const o=openingOf(m);
  if(p.openingW<.2||p.openingH<.2||o.x0<-m.l/2+.05-EPS||o.x1>m.l/2-.05+EPS||o.y0<0||o.y1>m.h-.05+EPS||(m.type==='windowWall'&&o.y0<.05))return 'Åpningen må få plass med minst 50 mm vegg rundt (unntatt dørens underkant).';
 }
 if(m.type==='floorFrame'||m.type==='wallFrame'){
  const span=m.type==='floorFrame'?m.w:m.l,other=m.type==='floorFrame'?m.l:m.h;
  if(p.member<(m.type==='floorFrame'?.05:.025)-EPS||p.member>.3||p.spacing<.25||p.spacing>2||span<2*p.member+.05||other<2*p.member+.05||p.spacing<p.member+.025||span>24||(span-p.member)/Math.ceil((span-p.member)/p.spacing)<p.member-EPS)return 'Kontroller rammebredde, avstand og rammedimensjoner (maks 24 m på fordelingsaksen).';
 }
 if(m.type==='windowUnit'&&(p.rim<.02||p.rim>.3||2*p.rim>=Math.min(m.l,m.h)-EPS))return 'Vinduskarmen må være mindre enn vindusåpningen.';
 return '';
}
function rectPiece(x0,x1,y0,y1,z0,z1,kind='body'){return {polygon:[[x0,y0],[x1,y0],[x1,y1],[x0,y1]],z0,z1,kind};}
function roofUnderside(m,x){
 if(m.type==='flatRoof')return 0;
 const slope=Math.tan(m.params.pitch*Math.PI/180);
 return (m.type==='gableRoof'?m.l/2-Math.abs(x):x+m.l/2)*slope;
}
function fittedRoofPieces(m){
 const half=m.l/2,z=m.w/2,t=roofThickness(m),seats=m.roofFit.seats;
 const breaks=[-half,half,...(m.type==='gableRoof'?[0]:[]),...seats.flatMap(s=>[s.cut0,s.cut1])].sort((a,b)=>a-b).filter((v,i,a)=>!i||v-a[i-1]>EPS);
 const pieces=[];
 for(let i=0;i<breaks.length-1;i++){
  const a=breaks[i],b=breaks[i+1],mid=(a+b)/2,seat=seats.find(s=>mid>s.cut0-EPS&&mid<s.cut1+EPS);
  const lo=roofUnderside(m,a),hi=roofUnderside(m,b);
  pieces.push({polygon:[[a,seat?seat.y:lo],[b,seat?seat.y:hi],[b,hi+t],[a,lo+t]],z0:-z,z1:z,kind:'body'});
 }
 return pieces;
}
function gablePieces(m){
 const out=[],t=m.params.member||0,z=m.w/2;
 const add=(a,b,lo0,lo1,hi0,hi1,kind='body',key='body')=>{
  if(b-a<=EPS||Math.max(hi0-lo0,hi1-lo1)<=EPS)return;
  const raw=[[a,lo0],[b,lo1],[b,hi1],[a,hi0]];
  const polygon=raw.filter((q,i)=>!i||Math.hypot(q[0]-raw[i-1][0],q[1]-raw[i-1][1])>EPS);
  if(polygon.length>2&&Math.hypot(polygon[0][0]-polygon.at(-1)[0],polygon[0][1]-polygon.at(-1)[1])<=EPS)polygon.pop();
  if(polygon.length>=3&&polygonArea(polygon)>EPS)out.push({polygon,z0:-z,z1:z,kind,memberKey:key});
 };
 const count=m.type==='gableFrame'?Math.max(1,Math.ceil((m.l-t)/m.params.spacing)):0;
 const studs=Array.from({length:count?count+1:0},(_,i)=>{const mid=-m.l/2+t/2+(m.l-t)*i/count;return [mid-t/2,mid+t/2];});
 const o=m.type==='gableWindowWall'?openingOf(m):null;
 for(const [i,s] of m.gableFit.segments.entries()){
  const [x0,x1,h0,h1]=s,H=x=>h0+(h1-h0)*(x-x0)/(x1-x0);
  const band=(a,b,lo,hi,kind,key,levels=[])=>{
   if(b-a<=EPS)return;
   const xs=[a,b];
   if(Math.abs(h1-h0)>EPS)for(const v of levels){const x=x0+(v-h0)*(x1-x0)/(h1-h0);if(x>a+EPS&&x<b-EPS)xs.push(x);}
   xs.sort((a,b)=>a-b);
   for(let j=0;j<xs.length-1;j++){
    const a=xs[j],b=xs[j+1],ha=H(a),hb=H(b);
    add(a,b,lo(ha),lo(hb),hi(ha),hi(hb),kind,key);
   }
  };
  if(m.type==='gableFrame'){
   const bottom=h=>Math.min(t,h),top=h=>Math.max(bottom(h),h-t);
   band(x0,x1,()=>0,bottom,'bottom','bottom-'+i,[t]);
   band(x0,x1,top,h=>h,'top','top-'+i,[t,2*t]);
   for(const [j,st] of studs.entries())band(Math.max(x0,st[0]),Math.min(x1,st[1]),bottom,top,'stud','stud-'+j,[t,2*t]);
  }else if(o){
   band(x0,Math.min(x1,o.x0),()=>0,h=>h,'body','body');
   band(Math.max(x0,o.x1),x1,()=>0,h=>h,'body','body');
   const a=Math.max(x0,o.x0),b=Math.min(x1,o.x1);
   band(a,b,()=>0,h=>Math.min(h,o.y0),'body','body',[o.y0]);
   band(a,b,h=>Math.min(h,o.y1),h=>h,'body','body',[o.y1]);
  }else band(x0,x1,()=>0,h=>h,'body','body');
 }
 return out;
}
function piecesOf(m){
 if(isGable(m))return gablePieces(m);
 const x=m.l/2,z=m.w/2,h=m.h,p=m.params||{},pieces=[];
 const box=(a,b,c,d,e=-z,f=z,kind='body')=>{if(b-a>EPS&&d-c>EPS&&f-e>EPS)pieces.push(rectPiece(a,b,c,d,e,f,kind));};
 if(isOpening(m)){
  const o=openingOf(m);box(-x,o.x0,0,h);box(o.x1,x,0,h);box(o.x0,o.x1,0,o.y0);box(o.x0,o.x1,o.y1,h);return pieces;
 }
 if(m.type==='wallFrame'){
  const t=p.member;box(-x,x,0,t);box(-x,x,h-t,h);box(-x,-x+t,t,h-t);box(x-t,x,t,h-t);
  const count=Math.ceil((m.l-t)/p.spacing);
  for(let i=1;i<count;i++){const mid=-x+t/2+(m.l-t)*i/count;box(mid-t/2,mid+t/2,t,h-t);}
  return pieces;
 }
 if(m.type==='floorFrame'){
  const t=p.member;box(-x,-x+t,0,h);box(x-t,x,0,h);box(-x+t,x-t,0,h,-z,-z+t);box(-x+t,x-t,0,h,z-t,z);
  const count=Math.ceil((m.w-t)/p.spacing);
  for(let i=1;i<count;i++){const mid=-z+t/2+(m.w-t)*i/count;box(-x+t,x-t,0,h,mid-t/2,mid+t/2);}
  return pieces;
 }
 if(m.type==='windowUnit'){
  const t=p.rim;box(-x,-x+t,0,h);box(x-t,x,0,h);box(-x+t,x-t,0,t);box(-x+t,x-t,h-t,h);
  box(-x+t,x-t,t,h-t,-Math.min(z,.006),Math.min(z,.006),'glass');return pieces;
 }
 if(m.roofFit?.seats?.length)return fittedRoofPieces(m);
 if(isRoof(m)&&m.type!=='flatRoof'){
  const rise=roofRise(m),t=roofThickness(m);
  if(m.type==='gableRoof')pieces.push({polygon:[[-x,0],[0,rise],[0,rise+t],[-x,t]],z0:-z,z1:z,kind:'body'},{polygon:[[0,rise],[x,0],[x,t],[0,rise+t]],z0:-z,z1:z,kind:'body'});
  else pieces.push({polygon:[[-x,0],[x,rise],[x,rise+t],[-x,t]],z0:-z,z1:z,kind:'body'});
  return pieces;
 }
 return [{polygon:profileOf(m),z0:-z,z1:z,kind:'body'}];
}
function usesPieces(m){return isGable(m)||!!m.roofFit?.seats?.length||isBrace(m)||['floorFrame','wallFrame','doorWall','windowWall','windowUnit','rafter','shedRoof','gableRoof'].includes(m.type);}
function pointOnPiece(p,q){
 if(q[2]<p.z0-EPS||q[2]>p.z1+EPS)return false;
 const poly=p.polygon;let positive=false,negative=false;
 for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],v=(b[0]-a[0])*(q[1]-a[1])-(b[1]-a[1])*(q[0]-a[0]);if(v>EPS)positive=true;if(v<-EPS)negative=true;if(positive&&negative)return false;}
 return true;
}
function openingInsert(wall,id){
 if(!isOpening(wall))return {error:'Velg en vegg med dør- eller vindusåpning.'};
 const o=openingOf(wall),gap=.005,type=wall.type==='doorWall'?'doorLeaf':'windowUnit',d=catalog[type],l=o.x1-o.x0-2*gap,h=o.y1-o.y0-2*gap;
 const [x,y,z]=pointToWorld(wall,[(o.x0+o.x1)/2,o.y0+gap,0]);
 return {module:normalizeBuilding({id,type,x,y,z,l,w:Math.min(wall.w,d.w),h,angle:wall.angle,params:type==='windowUnit'?{rim:Math.min(.05,l/4,h/4)}:{}})};
}
const materialCatalog={
 wood:{name:'Trevirke',density:450},
 concrete:{name:'Betong',density:2400},
 stone:{name:'Stein',density:2600},
 glass:{name:'Glass',density:2500},
 roof:{name:'Takmateriale (modellert kompositt)',density:500},
 test:{name:'Uspesifisert testmateriale',density:null}
};
const areaLabels={floor:'Gulv – netto flate',wall:'Vegg – netto sideflate',frame:'Veggramme – projisert treflate',door:'Dør – sideflate',glass:'Glass – synlig flate',roof:'Tak – skrå / dekkende flate',foundation:'Fundament – grunnflate',test:'Testplate – flate'};
const defaultDensities=()=>Object.fromEntries(Object.entries(materialCatalog).map(([k,v])=>[k,v.density]));
function polygonArea(poly){
 if(poly.length<3)return 0;
 const [x,y]=poly[0];let twice=0;
 for(let i=1;i<poly.length-1;i++){
  const a=poly[i],b=poly[i+1];twice+=(a[0]-x)*(b[1]-y)-(a[1]-y)*(b[0]-x);
 }
 return Math.abs(twice)/2;
}
function pieceVolume(p){return polygonArea(p.polygon)*(p.z1-p.z0);}
function pieceBounds(p){
 const x=p.polygon.map(v=>v[0]),y=p.polygon.map(v=>v[1]);
 return [Math.max(...x)-Math.min(...x),p.z1-p.z0,Math.max(...y)-Math.min(...y)];
}
function projectionExtent(poly,u){const proj=poly.map(p=>p[0]*u[0]+p[1]*u[1]);return Math.max(...proj)-Math.min(...proj);}
function quantityRows(m){
 const parts=piecesOf(m),vol=parts.reduce((v,p)=>v+pieceVolume(p),0),out=[];
 const dim=[m.l,m.w,m.h];
 const add=(label,material,net,raw,dimensions,extra={})=>{
  if(![net,raw,...dimensions].every(Number.isFinite)||net<-EPS||raw<net-EPS)throw Error('Ugyldig mengde for modul #'+m.id+' '+label);
  out.push({moduleId:m.id,type:m.type,label,material,net:Math.max(0,net),raw:Math.max(net,raw),dimensions,...extra});
 };
 const member=(p,label,index,axis,material='wood')=>{
  const [l,w,h]=pieceBounds(p),len=axis==='x'?l:axis==='z'?w:h,section=axis==='x'?[w,h]:axis==='z'?[l,h]:[l,w];
  add(label,material,pieceVolume(p),pieceVolume(p),[len,...section],{length:len,rawLength:len,dimKind:'member',pieceIndex:index});
 };
 if(m.type==='floorFrame'){
  parts.forEach((p,i)=>member(p,i<2?'Kantbjelke – tvers':i<4?'Kantbjelke – langs':'Gulvbjelke',i,i<2?'z':'x'));return out;
 }
 if(isGable(m)){
  if(m.type==='gableFrame'){
   const groups=new Map();
   for(const p of parts){if(!groups.has(p.memberKey))groups.set(p.memberKey,[]);groups.get(p.memberKey).push(p);}
   for(const ps of groups.values()){
    const poly=ps.flatMap(p=>p.polygon),[x0,x1,y0,y1]=bounds2(poly),kind=ps[0].kind,net=ps.reduce((v,p)=>v+pieceVolume(p),0);
    let len,section,label,slope;
    if(kind==='stud'){len=y1-y0;section=x1-x0;label='Gavlstender';}
    else if(kind==='bottom'){len=x1-x0;section=y1-y0;label='Gavl – bunnsvillseksjon';}
    else{
     const seg=m.gableFit.segments[Number(ps[0].memberKey.split('-')[1])],rad=Math.atan2(seg[3]-seg[2],seg[1]-seg[0]);
     len=projectionExtent(poly,[Math.cos(rad),Math.sin(rad)]);section=projectionExtent(poly,[-Math.sin(rad),Math.cos(rad)]);slope=rad*180/Math.PI;label='Gavl – skrå toppsvillseksjon';
    }
    add(label,'wood',net,Math.max(net,len*section*m.w),[len,m.w,section],{length:len,rawLength:len,dimKind:'member',area:net/m.w,areaKind:'frame',slope,shape:ps.map(p=>p.polygon.map(q=>[q[0]-x0,q[1]-y0]))});
   }
  }else add(catalog[m.type].name,'wood',vol,m.l*m.w*m.h,dim,{area:vol/m.w,areaKind:'wall',shape:[m.gableFit.segments,m.params]});
  return out;
 }
 if(m.type==='wallFrame'){
  parts.forEach((p,i)=>{
   member(p,i===0?'Bunnsvill':i===1?'Toppsvill':'Stender',i,i<2?'x':'y');
   out[out.length-1].area=polygonArea(p.polygon);out[out.length-1].areaKind='frame';
  });return out;
 }
 if(m.type==='windowUnit'){
  parts.forEach((p,i)=>{
   if(p.kind==='glass')add('Glassrute','glass',pieceVolume(p),pieceVolume(p),pieceBounds(p),{area:polygonArea(p.polygon),areaKind:'glass'});
   else member(p,'Vinduskarm',i,i<2?'y':'x');
  });return out;
 }
 if(isBrace(m)){
  const p=profileOf(m),t=isFitted(m)?m.fit.thickness:braceEndHeight(m.h)*Math.cos(Math.atan2(m.h-braceEndHeight(m.h),m.l));
  const slope=isFitted(m)?m.fit.slope:Math.atan2(m.h-braceEndHeight(m.h),m.l)*180/Math.PI;
  const rad=slope*Math.PI/180,u=[Math.cos(rad),Math.sin(rad)];
  const len=isFitted(m)?m.fit.length:Math.hypot(m.l,m.h-braceEndHeight(m.h)),rawLength=projectionExtent(p,u);
  const raw=Math.max(vol,rawLength*t*m.w);
  add(catalog[m.type].name,'wood',vol,raw,[rawLength,m.w,t],{length:len,rawLength,dimKind:'member',slope,shape:p});return out;
 }
 if(m.type==='rafter'){
  const rad=m.params.pitch*Math.PI/180,p=parts[0].polygon,len=m.l/Math.cos(rad),rawLength=projectionExtent(p,[Math.cos(rad),Math.sin(rad)]);
  add('Taksperre','wood',vol,rawLength*m.w*m.params.thickness,[rawLength,m.w,m.params.thickness],{length:len,rawLength,dimKind:'member',slope:m.params.pitch,shape:p});return out;
 }
 if(['flatRoof','shedRoof','gableRoof'].includes(m.type)){
  const angle=m.type==='flatRoof'?0:m.params.pitch,half=m.type==='gableRoof',sides=half?[-1,1]:[0];
  for(const side of sides){
   const subset=half?parts.filter(p=>side*p.polygon.reduce((v,q)=>v+q[0],0)>0):parts;
   const net=subset.reduce((v,p)=>v+pieceVolume(p),0),len=(half?m.l/2:m.l)/Math.cos(angle*Math.PI/180),area=len*m.w;
   const label=half?(side<0?'Saltak – fallflate −X':'Saltak – fallflate +X'):catalog[m.type].name;
   add(label,'roof',net,area*m.params.thickness,[len,m.w,m.params.thickness],{area,areaKind:'roof',slope:angle,dimKind:'roof',shape:subset.map(p=>p.polygon)});
  }return out;
 }
 const role=catalog[m.type].role;
 if(role==='post'||role==='beam'||m.type==='post'||m.type==='beam'){
  const axis=(role==='post'||m.type==='post')?'y':'x';
  member(parts[0],catalog[m.type].name,0,axis,catalog[m.type].material?'wood':'test');return out;
 }
 if(role==='foundation'){
  add(catalog[m.type].name,m.type==='stoneFoot'?'stone':'concrete',vol,vol,dim,{area:m.l*m.w,areaKind:'foundation'});return out;
 }
 if(isOpening(m)){
  const o=openingOf(m),area=m.l*m.h-(o.x1-o.x0)*(o.y1-o.y0);
  add(catalog[m.type].name,'wood',vol,m.l*m.w*m.h,dim,{area,areaKind:'wall',shape:[o.x0,o.x1,o.y0,o.y1]});return out;
 }
 if(m.type==='floorDeck'||m.type==='panel'){
  add(catalog[m.type].name,m.type==='panel'?'test':'wood',vol,vol,dim,{area:m.l*m.w,areaKind:m.type==='panel'?'test':'floor'});return out;
 }
 if(['solidWall','cladding','doorLeaf'].includes(m.type)){
  add(catalog[m.type].name,'wood',vol,vol,dim,{area:m.l*m.h,areaKind:m.type==='doorLeaf'?'door':'wall'});return out;
 }
 add(catalog[m.type].name,'test',vol,vol,dim);return out;
}
function quantitySummary(modules,densities=defaultDensities()){
 const parts=[],moduleRows=[],byMaterial={},areaTotals={};
 let net=0,raw=0,mass=0,rawMass=0,unknownVolume=0,unknownRaw=0;
 for(const m of modules){
  const rows=quantityRows(m);parts.push(...rows);
  const sum={id:m.id,name:catalog[m.type].name,count:rows.length,net:0,raw:0,mass:0,rawMass:0,unknown:0};
  for(const p of rows){
   const density=densities[p.material],known=Number.isFinite(density)&&density>0;
   const a=byMaterial[p.material]??={key:p.material,count:0,net:0,raw:0,mass:0,rawMass:0,unknown:0,unknownRaw:0,length:0,rawLength:0,areas:{}};
   a.count++;a.net+=p.net;a.raw+=p.raw;sum.net+=p.net;sum.raw+=p.raw;
   net+=p.net;raw+=p.raw;
   if(known){const km=p.net*density,kr=p.raw*density;a.mass+=km;a.rawMass+=kr;sum.mass+=km;sum.rawMass+=kr;mass+=km;rawMass+=kr;}
   else{a.unknown+=p.net;a.unknownRaw+=p.raw;sum.unknown+=p.net;unknownVolume+=p.net;unknownRaw+=p.raw;}
   if(p.length!==undefined){a.length+=p.length;a.rawLength+=p.rawLength;}
   if(p.areaKind){a.areas[p.areaKind]=(a.areas[p.areaKind]||0)+p.area;areaTotals[p.areaKind]=(areaTotals[p.areaKind]||0)+p.area;}
  }
  moduleRows.push(sum);
 }
 const groups=new Map();
 const q=v=>typeof v==='number'?Number(v.toFixed(9)):v;
 for(const p of parts){
  // Geometry-sensitive grouping; identical part dimensions alone are insufficient for cut pieces.
  const signature=JSON.stringify([p.material,p.label,p.dimKind,p.dimensions,p.net,p.raw,p.area,p.areaKind,p.length,p.rawLength,p.slope,p.shape],(k,v)=>q(v));
  if(!groups.has(signature))groups.set(signature,{...p,count:0,ids:new Set()});
  const g=groups.get(signature);g.count++;g.ids.add(p.moduleId);
 }
 return {moduleCount:modules.length,partCount:parts.length,parts,moduleRows,materials:Object.values(byMaterial),areas:areaTotals,groups:[...groups.values()].map(g=>({...g,ids:[...g.ids]})),net,raw,mass,rawMass,unknownVolume,unknownRaw};
}
// CE 0.7: game-only structural analysis based on the same solid pieces as CE 0.6.
const STRUCT_TOL=1e-5,CONTACT_MIN=1e-7,GRAVITY=9.81;
const gameBearing={wood:1e6,concrete:3e6,stone:1.5e6,roof:.5e6};
function signedArea2(p){let a=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length];a+=q[0]*r[1]-r[0]*q[1];}return a/2;}
function centroid2(p){
 let a=0,x=0,y=0;for(let i=0;i<p.length;i++){const q=p[i],r=p[(i+1)%p.length],v=q[0]*r[1]-r[0]*q[1];a+=v;x+=(q[0]+r[0])*v;y+=(q[1]+r[1])*v;}
 return Math.abs(a)>EPS?[x/(3*a),y/(3*a)]:p[0];
}
function ccw(p){return signedArea2(p)<0?p.slice().reverse():p;}
function bounds2(p){return [Math.min(...p.map(v=>v[0])),Math.max(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[1]))];}
function clipConvex(subject,clip){
 let out=ccw(subject);clip=ccw(clip);
 for(let i=0;i<clip.length&&out.length;i++){
  const a=clip[i],b=clip[(i+1)%clip.length],side=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
  const input=out;out=[];
  for(let j=0;j<input.length;j++){
   const p=input[j],q=input[(j+1)%input.length],sp=side(p),sq=side(q),pin=sp>=-1e-10,qin=sq>=-1e-10;
   if(pin)out.push(p);
   if(pin!==qin&&Math.abs(sp-sq)>1e-15){const t=sp/(sp-sq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}
  }
 }
 return out;
}
function faceAxes(axis){return axis===0?[1,2]:axis===1?[0,2]:[0,1];}
function pieceFaces(m,p){
 const poly=ccw(p.polygon),faces=[];
 const add=(vs,n)=>{
  const normal=rotateVector(n,m.angle),len=Math.hypot(...normal);
  if(len<EPS)return;
  const axis=normal.findIndex(v=>Math.abs(v)/len>1-1e-10);
  if(axis<0)return; // sloped faces do not transfer gravity by this model
  const w=vs.map(v=>pointToWorld(m,v)),axes=faceAxes(axis);
  const polygon=ccw(w.map(v=>[v[axes[0]],v[axes[1]]]));
  if(polygonArea(polygon)<=CONTACT_MIN)return;
  faces.push({axis,sign:Math.sign(normal[axis]),plane:w[0][axis],polygon,bounds:bounds2(polygon)});
 };
 add(poly.map(q=>[...q,p.z0]),[0,0,-1]);add(poly.map(q=>[...q,p.z1]),[0,0,1]);
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];
  add([[...a,p.z0],[...b,p.z0],[...b,p.z1],[...a,p.z1]],[b[1]-a[1],a[0]-b[0],0]);
 }
 return faces;
}
function contactPatch(a,b){
 if(a.axis!==b.axis||a.sign===b.sign||Math.abs(a.plane-b.plane)>STRUCT_TOL)return null;
 const p=a.bounds,q=b.bounds;
 if(Math.min(p[1],q[1])-Math.max(p[0],q[0])<=STRUCT_TOL||Math.min(p[3],q[3])-Math.max(p[2],q[2])<=STRUCT_TOL)return null;
 const polygon=clipConvex(a.polygon,b.polygon),area=polygonArea(polygon);
 return area>CONTACT_MIN?{area,polygon,center:centroid2(polygon),plane:(a.plane+b.plane)/2,axis:a.axis}:null;
}
function structuralMaterial(m){
 if(m.type==='windowUnit')return 'wood';
 if(['flatRoof','shedRoof','gableRoof'].includes(m.type))return 'roof';
 return quantityRows(m)[0]?.material||'test';
}
function massCenter(m,densities){
 let weight=0,x=0,z=0;const material=structuralMaterial(m);
 for(const p of piecesOf(m)){
  const d=densities[p.kind==='glass'?'glass':material],v=pieceVolume(p)*(Number.isFinite(d)&&d>0?d:1),q=centroid2(p.polygon);
  const a=pointToWorld(m,[q[0],q[1],(p.z0+p.z1)/2]);weight+=v;x+=a[0]*v;z+=a[2]*v;
 }
 return weight>EPS?[x/weight,z/weight]:[m.x,m.z];
}
function hull2(points){
 const p=points.slice().sort((a,b)=>a[0]-b[0]||a[1]-b[1]).filter((q,i,a)=>!i||Math.hypot(q[0]-a[i-1][0],q[1]-a[i-1][1])>STRUCT_TOL);
 const turn=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 if(p.length<3)return p;
 const half=arr=>{const h=[];for(const v of arr){while(h.length>1&&turn(h[h.length-2],h[h.length-1],v)<=1e-10)h.pop();h.push(v);}return h;};
 const a=half(p),b=half(p.slice().reverse());return a.slice(0,-1).concat(b.slice(0,-1));
}
function inHull(p,h){
 if(h.length<3)return false;
 return h.every((a,i)=>{const b=h[(i+1)%h.length];return (b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0])>=-STRUCT_TOL*Math.hypot(b[0]-a[0],b[1]-a[1]);});
}
function supportSpan(m,links){
 const axis=m.angle%180===0?0:1;
 const ranges=links.filter(e=>e.kind==='bearing'||e.kind==='ground').flatMap(e=>e.patches.map(p=>{
  const q=p.polygon.map(v=>v[axis]);return [Math.min(...q),Math.max(...q)];
 })).sort((a,b)=>a[0]-b[0]);
 if(!ranges.length)return null;
 const merged=[];for(const r of ranges){const last=merged.at(-1);if(last&&r[0]<=last[1]+STRUCT_TOL)last[1]=Math.max(last[1],r[1]);else merged.push(r.slice());}
 const center=axis===0?m.x:m.z,lo=center-m.l/2,hi=center+m.l/2;
 let span=0;for(let i=1;i<merged.length;i++)span=Math.max(span,merged[i][0]-merged[i-1][1]);
 const left=Math.max(0,merged[0][0]-lo),right=Math.max(0,hi-merged.at(-1)[1]),overhang=Math.max(left,right);
 return {span,overhang,effective:Math.max(span,2*overhang),zones:merged.length};
}
function structureAnalysis(modules,densities=defaultDensities()){
 const quantities=quantitySummary(modules,densities),massById=new Map(quantities.moduleRows.map(m=>[m.id,m]));
 const nodes=new Map(),edges=[],sideEdges=[];
 for(const m of modules){
  const mass=massById.get(m.id),own=mass.mass*GRAVITY,center=massCenter(m,densities),faces=piecesOf(m).flatMap(p=>pieceFaces(m,p));
  const f=footprint(m);
  nodes.set(m.id,{id:m.id,m,name:catalog[m.type].name,material:structuralMaterial(m),faces,box:[m.x-f.x,m.x+f.x,m.y,m.y+m.h,m.z-f.z,m.z+f.z],
   own,received:0,total:own,moment:[own*center[0],own*center[1]],center,unknown:mass.unknown>EPS,ownUnknown:mass.unknown>EPS,links:[],incoming:[],neighbors:new Set(),issues:[],grounded:false,processed:false,span:null,utilization:[]});
 }
 const issue=(n,level,code,message)=>{if(!n.issues.some(a=>a.code===code))n.issues.push({level,code,message});};
 const link=(from,to,patches,kind,area=patches.reduce((s,p)=>s+p.area,0))=>{
  const e={from:from.id,to:to?.id??null,patches,kind,area,force:0,unknown:false};
  edges.push(e);from.links.push(e);if(to){to.incoming.push(e);from.neighbors.add(to.id);to.neighbors.add(from.id);}return e;
 };
 const list=[...nodes.values()];
 for(const n of list){
  const patches=n.faces.filter(f=>f.axis===1&&f.sign===-1&&Math.abs(f.plane)<=STRUCT_TOL).map(f=>({axis:1,plane:0,polygon:f.polygon,area:polygonArea(f.polygon),center:centroid2(f.polygon)}));
  if(patches.length)link(n,null,patches,'ground');
 }
 for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++){
  const a=list[i],b=list[j],A=a.box,B=b.box;
  if([0,2,4].some(k=>A[k]>B[k+1]+STRUCT_TOL||B[k]>A[k+1]+STRUCT_TOL))continue;
  const ab=[],ba=[],sides=[];
  for(const p of a.faces)for(const q of b.faces){
   const patch=contactPatch(p,q);if(!patch)continue;
   if(p.axis===1)(p.sign===-1?ab:ba).push(patch);else sides.push(patch);
  }
  if(ab.length){if(isRoof(a.m)&&isGable(b.m)){a.neighbors.add(b.id);b.neighbors.add(a.id);}else link(a,b,ab,'bearing');}
  if(ba.length){if(isRoof(b.m)&&isGable(a.m)){a.neighbors.add(b.id);b.neighbors.add(a.id);}else link(b,a,ba,'bearing');}
  if(sides.length){
   a.neighbors.add(b.id);b.neighbors.add(a.id);
   sideEdges.push({a:a.id,b:b.id,patches:sides,area:sides.reduce((v,p)=>v+p.area,0)});
  }
 }
 // Insertion clearance is intentional; model a mounting connection, not a contact patch.
 for(const n of list){
  if(['doorLeaf','windowUnit'].includes(n.m.type)&&!n.links.length){
   const hosts=list.filter(a=>containsOpeningInsert(a.m,n.m)&&((a.m.type==='doorWall')===(n.m.type==='doorLeaf')));
   if(hosts.length===1){link(n,hosts[0],[],'insert',1);issue(n,'warn','insert','Innfesting i åpning er idealisert; beslag og karmforbindelser er ikke beregnet.');}
  }
  if(isFitted(n.m)){
   const m=n.m,post=nodes.get(m.fit.postId),beam=nodes.get(m.fit.beamId);
   const side=post&&sideEdges.find(e=>((e.a===n.id&&e.b===post.id)||(e.b===n.id&&e.a===post.id)));
   const own=anchors(m),pa=post&&anchors(post.m).find(p=>p.id===m.fit.postPoint),pb=beam&&anchors(beam.m).find(p=>p.id===m.fit.beamPoint);
   const match=(p,q)=>p&&q&&dot(p.n,q.n)<-.9999&&Math.hypot(...p.p.map((v,i)=>v-q.p[i]))<STRUCT_TOL;
   if(side&&match(own[0],pa)&&match(own[1],pb)){
    const e=link(n,post,side.patches,'brace',side.area);e.braceAngle=m.fit.slope;
    issue(n,'warn','brace','Avstiverens sideforbindelse er idealisert. Horisontalkraft og skjøtekapasitet er ikke beregnet.');
   }else issue(n,'error','brace-fit','Tilpasset avstiver har mistet ett eller begge opprinnelige festepunkter.');
  }
 }
 // Reachability is calculated independently of load distribution.
 const queue=list.filter(n=>n.links.some(e=>e.kind==='ground'));queue.forEach(n=>n.grounded=true);
 for(let i=0;i<queue.length;i++)for(const e of queue[i].incoming){const a=nodes.get(e.from);if(!a.grounded){a.grounded=true;queue.push(a);}}
 for(const n of list){
  if(!n.grounded)issue(n,'error','no-ground','Ingen sammenhengende lastvei til byggegrunnen.');
  if(!n.links.length)issue(n,'error','no-support','Ingen understøttende flate eller definert monteringsforbindelse.');
  if(isGable(n.m))issue(n,'warn','gable-infill','Gavl er ikke-bærende utfylling; taklast og innfesting er ikke dimensjonert.');
  if(n.ownUnknown)issue(n,'warn','unknown-mass','Deler av egenlasten er ukjent. Angi densitet i Materialer.');
  if(n.links.some(e=>e.kind==='ground')&&catalog[n.m.type].role!=='foundation')issue(n,'warn','direct-ground','Står direkte på byggeplaten uten egen fundamentmodul.');
 }
 // A topological pass transfers each known weight once; cyclic graphs are not solved.
 const pending=new Map(list.map(n=>[n.id,n.incoming.length])),ready=list.filter(n=>pending.get(n.id)===0);
 let groundForce=0,unresolvedForce=0,groundUnknown=false,unresolvedUnknown=false;
 for(let i=0;i<ready.length;i++){
  const n=ready[i];n.processed=true;n.total=n.own+n.received;
  if(n.unknown&&!n.ownUnknown)issue(n,'warn','unknown-above','Ukjent last mottatt fra en overliggende modul.');
  if(n.total>EPS)n.center=n.moment.map(v=>v/n.total);
  if(!n.links.length){unresolvedForce+=n.total;unresolvedUnknown||=n.unknown;continue;}
  const supported=n.links.filter(e=>e.to===null||nodes.get(e.to).grounded);
  // If a ground path exists, do not distribute through floating supports.
  const active=supported.length?supported:n.links;
  if(active.length<n.links.length)issue(n,'warn','floating-support','En mulig understøttelse mangler lastvei og er utelatt fra lastfordelingen.');
  const physical=active.filter(e=>e.kind==='bearing'||e.kind==='ground');
  const ideal=active.filter(e=>e.kind==='brace'||e.kind==='insert');
  if(physical.length&&!ideal.length&&!n.unknown&&n.total>EPS){
   const hull=hull2(physical.flatMap(e=>e.patches.flatMap(p=>p.polygon)));
   if(!inHull(n.center,hull))issue(n,'error','eccentric','Forenklet lastresultant ligger utenfor understøttelsens konvekse omriss. Fare for utkraging / velting i spillmodellen.');
  }
  
  const totalArea=active.reduce((s,e)=>s+e.area,0);
  for(const e of n.links){
   const use=active.includes(e),force=use?n.total*e.area/totalArea:0;
   e.force=force;e.unknown=use&&n.unknown;
   if(e.kind==='bearing'||e.kind==='ground'){
    const target=e.to===null?null:nodes.get(e.to);
    const cap=e.kind==='ground'?.15e6:Math.min(gameBearing[n.material]??Infinity,gameBearing[target.material]??Infinity);
    const known=e.kind==='ground'||(gameBearing[n.material]!==undefined&&gameBearing[target.material]!==undefined);
    e.pressure=force/e.area;
    if(use&&known&&!n.unknown){e.utilization=e.pressure/cap;n.utilization.push({name:e.kind==='ground'?'Grunntrykk':'Kontakttrykk mot #'+e.to,value:e.utilization});
     if(e.utilization>1+EPS)issue(n,'error','bearing-'+e.to,'Spillgrense for '+(e.kind==='ground'?'grunntrykk':'kontakttrykk mot #'+e.to)+' overskredet.');
    }else if(use&&!known)issue(n,'warn','bearing-material','Kontaktkapasitet kan ikke vurderes for uspesifisert materiale.');
   }
   if(e.to===null){groundForce+=force;groundUnknown||=e.unknown;continue;}
   const target=nodes.get(e.to);
   target.received+=force;target.unknown||=e.unknown;
   let center=[n.m.x,n.m.z];
   if(e.kind==='bearing')center=[0,1].map(k=>e.patches.reduce((s,p)=>s+p.center[k]*p.area,0)/e.area);
   else if(e.kind==='brace'&&isFitted(n.m)){const a=anchors(n.m)[0].p;center=[a[0],a[2]];}
   target.moment[0]+=force*center[0];target.moment[1]+=force*center[1];
   pending.set(target.id,pending.get(target.id)-1);if(pending.get(target.id)===0)ready.push(target);
  }
 }
 // Account for the weight of unprocessed cyclic nodes plus load already delivered to them.
 for(const n of list)if(!n.processed){n.total=n.own+n.received;unresolvedForce+=n.total;unresolvedUnknown||=n.unknown;issue(n,'error','cycle','Sirkulær lastgraf eller lastvei etter en slik sløyfe. Lastfordeling ikke løst.');}
 for(const n of list){
  const m=n.m,beam=['timberBeam','foundationBeam','beam'].includes(m.type),post=['timberPost','post'].includes(m.type);
  if(beam||['floorDeck','floorFrame','flatRoof','shedRoof','gableRoof','rafter'].includes(m.type)){
   n.span=supportSpan(m,n.links.filter(e=>e.kind==='ground'||(e.to!==null&&nodes.get(e.to).grounded)));
   const depth=m.type==='rafter'?m.params.thickness:['flatRoof','shedRoof','gableRoof'].includes(m.type)?m.params.thickness:m.h;
   if(n.span&&n.span.effective>EPS){
    const ratio=n.span.effective/depth,limit=m.type==='floorDeck'?35:25;n.span.ratio=ratio;n.span.limit=limit;
    if(ratio>limit+EPS)issue(n,'warn','span','Effektivt, projisert spenn / konstruksjonshøyde overskrider spillgrensen '+limit+'.');
    if(beam&&m.type!=='beam'&&n.processed&&!n.unknown){
     // Uniformly distributed equivalent load over the member; simply supported or cantilever approximation.
     const q=n.total/m.l,M=Math.max(q*n.span.span**2/8,q*n.span.overhang**2/2),Z=m.w*m.h*m.h/6;
     const u=M/Z/6e6;n.utilization.push({name:'Nominell bøyning (jevnt fordelt last)',value:u});
     if(u>1+EPS)issue(n,'error','bending','Spillgrense for nominell bøyespenning overskredet.');
    }else if(!beam)issue(n,'warn','span-model','Spenn er et overordnet geometrisk anslag; individuell lastdeling og opplegg for delene er ikke beregnet.');
   }
  }
  if(post){
   const slender=m.h/Math.min(m.l,m.w);
   n.slenderness=slender;
   if(slender>30)issue(n,'warn','slender','Stolpens høyde / minste tverrmål overskrider spillgrensen 30. Knekking er ikke beregnet.');
   if(m.type==='timberPost'&&!n.unknown&&n.processed){
    const u=n.total/(m.l*m.w*4e6);n.utilization.push({name:'Nominelt aksialtrykk',value:u});
    if(u>1+EPS)issue(n,'error','compression','Spillgrense for nominelt aksialtrykk overskredet.');
   }
  }
  if(n.material==='test')issue(n,'warn','test-material','Testmodul har ingen definert mekanisk kapasitet.');
 }
 // Connected assemblies. Only grounded continuous wall panels and fitted braces
 // with both original connections are candidates for directional bracing.
 const assemblies=[],seen=new Set();
 for(const root of list){
  if(seen.has(root.id))continue;
  const members=[root];seen.add(root.id);
  for(let i=0;i<members.length;i++)for(const id of members[i].neighbors)if(!seen.has(id)){seen.add(id);members.push(nodes.get(id));}
  const elevated=members.some(n=>n.m.y+n.m.h>1+EPS&&(catalog[n.m.type].role!=='foundation'));
  const dirs={X:[],Z:[]};
  for(const n of members){
   const m=n.m;
   const panel=['solidWall','doorWall','windowWall'].includes(m.type)&&m.l>=.5&&m.h>=.5;
   const brace=isFitted(m)&&n.links.some(e=>e.kind==='brace')&&!n.issues.some(i=>i.code==='brace-fit');
   if(n.grounded&&(panel||brace))dirs[m.angle%180===0?'X':'Z'].push(n.id);
  }
  const groundPatches=members.flatMap(n=>n.links.filter(e=>e.kind==='ground').flatMap(e=>e.patches));
  const weight=members.reduce((s,n)=>s+n.own,0),unknown=members.some(n=>n.ownUnknown);
  const center=weight>EPS?[0,1].map(k=>members.reduce((s,n)=>s+n.own*massCenter(n.m,densities)[k],0)/weight):null;
  const hull=groundPatches.length?hull2(groundPatches.flatMap(p=>p.polygon)):[];
  const stable=center&&!unknown&&hull.length>=3?inHull(center,hull):null;
  const warnings=[];
  if(!groundPatches.length)warnings.push('Ingen kontakt med byggegrunnen.');
  if(stable===false){warnings.push('Samlet egenlastresultant utenfor grunnkontaktens omriss.');for(const n of members)issue(n,'error','assembly-eccentric','Samlet egenlastresultant ligger utenfor byggegrunnens kontaktomriss.');}
  if(elevated&&(!dirs.X.length||!dirs.Z.length)){
   warnings.push('Mulig manglende sideavstiving i '+[!dirs.X.length?'X':null,!dirs.Z.length?'Z':null].filter(Boolean).join(' og ')+'-retning.');
   for(const n of members.filter(n=>n.m.y+n.m.h>1))issue(n,'warn','lateral','Sammenhengende konstruksjon mangler registrert avstivingskandidat i én eller begge retninger.');
  }
  if(elevated&&dirs.X.length&&dirs.Z.length)warnings.push('Avstivingskandidater finnes i begge retninger; forbindelser og forankring er ikke kontrollert.');
  if(unknown)warnings.push('Ukjent egenlast i konstruksjonen.');
  assemblies.push({ids:members.map(n=>n.id),dirs,elevated,stable,warnings,groundArea:groundPatches.reduce((s,p)=>s+p.area,0)});
 }
 for(const n of list){n.status=n.issues.some(i=>i.level==='error')?'error':n.issues.length?'warn':'ok';}
 return {nodes:list,edges,sideEdges,assemblies,ownForce:quantities.mass*GRAVITY,unknownVolume:quantities.unknownVolume,groundForce,unresolvedForce,groundUnknown,unresolvedUnknown,errors:list.filter(n=>n.status==='error').length,warnings:list.filter(n=>n.status==='warn').length,cycles:list.filter(n=>!n.processed).length};
}
// CE 0.9: blueprints instantiate the same modules used for free construction.
const blueprintCatalog={
 storage:{name:'Lagerskur',description:'Lite lukket lager med enkel dør, uten vindu. Funksjon i spillet kommer ved integrasjon.',l:3,w:3,h:2.4,roof:'flatRoof',pitch:20,overhang:.2,door:.9,windows:[]},
 cabin:{name:'Enkel bolig',description:'Enroms hytte med dør og to vinduer. Saltak med automatisk tilpassede gavlvegger.',l:4,w:3.5,h:2.4,roof:'gableRoof',pitch:30,overhang:.3,door:.9,windows:['south','east']},
 workshop:{name:'Verksted',description:'Større arbeidsrom med bred dør og to vinduer. Innredning og produksjonsfunksjon kommer senere.',l:5,w:4,h:2.7,roof:'flatRoof',pitch:20,overhang:.3,door:1.5,windows:['south','west']}
};
function blueprintOptions(type,L,W){
 const d=blueprintCatalog[type];return {type,l:d.l,w:d.w,h:d.h,roof:d.roof,pitch:d.pitch,overhang:d.overhang,angle:0,x:L/2,z:W/2};
}
function buildBlueprint(o,existing,L,W,firstId){
 const fail=error=>({error}),def=blueprintCatalog[o.type];
 if(!def)return fail('Ukjent ferdigtegning.');
 if(![o.l,o.w,o.h,o.x,o.z,o.angle,o.overhang,o.pitch].every(Number.isFinite)||o.l<2.5||o.l>8||o.w<2.5||o.w>8||o.h<2.2||o.h>3.5||o.overhang<0||o.overhang>1||o.pitch<5||o.pitch>45||![0,90,180,270].includes(o.angle)||!['flatRoof','gableRoof'].includes(o.roof))return fail('Kontroller mål: 2,5–8 m, vegghøyde 2,2–3,5 m, takvinkel 5–45°, takutstikk 0–1 m.');
 if(!Number.isSafeInteger(firstId)||firstId<1||existing.some(m=>m.id>=firstId))return fail('Ugyldig startnummer for moduler.');
 const list=[],steps=[],basis={x:o.x,y:0,z:o.z,angle:o.angle};
 let id=firstId;
 const make=(type,x,y,z,angle,patch={})=>{
  const d=catalog[type],[X,Y,Z]=pointToWorld(basis,[x,y,z]);
  return normalizeBuilding({id:id++,type,x:X,y:Y,z:Z,l:d.l,w:d.w,h:d.h,angle:(angle+o.angle)%360,...patch});
 };
 const append=(m,step)=>{
  const error=validModule(m,L,W,list);
  if(error)throw Error(catalog[m.type].name+': '+error);
  list.push(m);
  let group=steps.at(-1);
  if(!group||group.name!==step){group={name:step,ids:[]};steps.push(group);}
  group.ids.push(m.id);return m;
 };
 try{
  // Three strip footings directly beneath the floor joists (more above 5 m).
  // The outside edges coincide with the floor extent. All are real modules.
  const footWidth=.3,footH=.3,frameH=.198,deckH=.035;
  const n=Math.ceil((o.l-footWidth)/2.5)+1;
  for(let i=0;i<n;i++){
   const x=-o.l/2+footWidth/2+(o.l-footWidth)*i/(n-1);
   append(make('stripFoot',x,0,0,90,{l:o.w,w:footWidth,h:footH}),'1. Fundamentering');
  }
  append(make('floorFrame',0,footH,0,0,{l:o.l,w:o.w,h:frameH}),'2. Gulvbjelkelag og gulv');
  const floor=append(make('floorDeck',0,footH+frameH,0,0,{l:o.l,w:o.w,h:deckH}),'2. Gulvbjelkelag og gulv');
  const openings=[];
  for(const side of ['north','south','east','west']){
   const type=side==='north'?'doorWall':def.windows.includes(side)?'windowWall':'solidWall';
   const patch={h:o.h,w:.148};
   if(type==='doorWall')patch.params={openingW:def.door,openingH:2.1,offset:0};
   if(type==='windowWall')patch.params={openingW:1,openingH:.9,sill:.9,offset:0};
   const m=make(type,0,0,0,0,patch),r=fitWallOnEdge(m,floor,side,list,L,W);
   if(r.error)throw Error('Vegg '+edgeNames[side]+': '+r.error);
   const wall=append(r.module,'3. Yttervegger');if(isOpening(wall))openings.push(wall);
  }
  for(const wall of openings){
   const r=openingInsert(wall,id++);
   if(r.error)throw Error(r.error);
   append(r.module,'4. Dører og vinduer');
  }
  const roof=fitRoofOnFloor(make(o.roof,0,0,0,0),floor,{direction:0,eave:o.overhang,gable:o.overhang,pitch:o.pitch,thickness:o.roof==='flatRoof'?.12:.20,autoPitch:false},list,L,W);
  if(roof.error)throw Error('Tak: '+roof.error);
  if(o.roof==='gableRoof'){
   for(const side of ['north','south']){
    const wall=list.find(m=>m.edgeFit?.side===side);
    const r=fitGable(make('gableWall',0,0,0,0,{w:wall.w}),roof.module,wall,[...list,roof.module],L,W);
    if(r.error)throw Error('Gavl '+side+': '+r.error);
    append(r.module,'5. Gavlvegger');
   }
  }
  append(roof.module,o.roof==='gableRoof'?'6. Tak':'5. Tak');
  if(list.length+existing.length>MAX_MODULES)return fail('Prosjektet overskrider grensen på '+MAX_MODULES+' moduler.');
  for(const m of list){
   const error=validModule(m,L,W,existing);
   if(error)return fail(catalog[m.type].name+': '+error+' Velg en annen plassering.');
  }
  return {modules:list,steps,nextId:id,floorId:floor.id,name:def.name,options:{...o}};
 }catch(e){return fail(e.message);}
}
function drawingModel(modules,view,hideRoof=false){
 const faces=[];
 for(const m of modules){
  if(hideRoof&&isRoof(m))continue;
  for(const p of piecesOf(m)){
   const vertices=p.polygon.flatMap(([x,y])=>[p.z0,p.z1].map(z=>pointToWorld(m,[x,y,z])));
   const project=v=>view==='plan'?[v[0],v[2],v[1]]:view==='front'?[v[0],-v[1],v[2]]:[-v[2],-v[1],v[0]];
   const mapped=vertices.map(project),poly=hull2(mapped.map(v=>v.slice(0,2)));
   if(poly.length<3||polygonArea(poly)<EPS)continue;
   const depth=mapped.reduce((s,v)=>s+v[2],0)/mapped.length;
   faces.push({id:m.id,type:m.type,kind:p.kind,polygon:poly,depth});
  }
 }
 if(!faces.length)return {faces:[],bounds:null};
 faces.sort((a,b)=>a.depth-b.depth||a.id-b.id);
 const all=faces.flatMap(f=>f.polygon);
 return {faces,bounds:bounds2(all)};
}
// CE 0.9: canonical editable project data, not cached quantities or mesh objects.
const PROJECT_FORMAT='afterfall.construction-project',PROJECT_SCHEMA=1,PROJECT_LIMIT=2*1024*1024;
const PROJECT_STORE='afterfall.ce.projects.v1',PROJECT_SLOTS=20;
const projectId=v=>Number.isSafeInteger(v)&&v>0&&v<1e9;
const plainObject=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finiteArray=(v,n)=>Array.isArray(v)&&v.length===n&&v.every(Number.isFinite);
function requireProject(ok,message){if(!ok)throw Error(message);}
function cleanProjectName(name){return typeof name==='string'?name.trim().slice(0,80):'';}
function snapshotProject(name,L,W,modules,nextId,densities,settings){
 return {format:PROJECT_FORMAT,schemaVersion:PROJECT_SCHEMA,editorVersion:'1.0',name:cleanProjectName(name)||'Nytt prosjekt',savedAt:new Date().toISOString(),plot:{length:L,width:W},nextId,modules:JSON.parse(JSON.stringify(modules)),densities:{...densities},settings:{...settings}};
}
function projectSignature(p){return JSON.stringify([p.name,p.plot,p.nextId,p.modules,p.densities,p.settings]);}
function readModuleRecord(record){
 requireProject(plainObject(record)&&projectId(record.id)&&typeof record.type==='string'&&Object.hasOwn(catalog,record.type),'Ukjent eller ugyldig modul.');
 const m={};
 for(const k of ['id','type','x','y','z','l','w','h','angle'])m[k]=record[k];
 requireProject(['x','y','z','l','w','h','angle'].every(k=>Number.isFinite(m[k])),'Ugyldige mål for modul #'+m.id+'.');
 const d=catalog[m.type];
 if(d.params){
  requireProject(plainObject(record.params),'Parametere mangler for #'+m.id+'.');
  m.params={};
  for(const k of Object.keys(d.params)){requireProject(Number.isFinite(record.params[k]),'Ugyldig parameter '+k+' i #'+m.id+'.');m.params[k]=record.params[k];}
 }
 if(isFitted(m)){
  const f=record.fit,p=record.profile;
  requireProject(plainObject(f)&&Array.isArray(p)&&p.length===4&&p.every(q=>finiteArray(q,2))&&finiteArray(record.low,3)&&finiteArray(record.high,3),'Ugyldig avstiverprofil #'+m.id+'.');
  requireProject(projectId(f.postId)&&projectId(f.beamId)&&f.postId!==f.beamId&&typeof f.postPoint==='string'&&f.postPoint.length<=80&&typeof f.beamPoint==='string'&&f.beamPoint.length<=80,'Ugyldige avstiverreferanser #'+m.id+'.');
  const nums=['thickness','width','length','slope','sideCut','topCut','stockLength'];
  requireProject(nums.every(k=>Number.isFinite(f[k])&&f[k]>0)&&f.thickness>=.05-EPS&&f.thickness<=.3+EPS&&f.width>=.05-EPS&&f.width<=.3+EPS&&f.slope<90&&f.stockLength>=f.length-EPS,'Ugyldige avstivermål #'+m.id+'.');
  const turn=p.map((a,i)=>{const b=p[(i+1)%4],c=p[(i+2)%4];return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);});
  requireProject((turn.every(v=>v>EPS)||turn.every(v=>v<-EPS))&&p.every(q=>q[1]>=-EPS&&q[1]<=m.h+EPS)&&Math.abs(Math.min(...p.map(q=>q[1])))<=EPS,'Avstiverprofil er ikke konveks eller innenfor modulens mål.');
  requireProject(record.low[0]>=-m.l/2-EPS&&record.low[0]<=m.l/2+EPS&&record.high[0]>=-m.l/2-EPS&&record.high[0]<=m.l/2+EPS&&[record.low,record.high].every(q=>q[1]>=-EPS&&q[1]<=m.h+EPS&&Math.abs(q[2])<=m.w/2+EPS),'Ugyldige festepunkter i avstiver.');
  m.profile=p.map(q=>q.slice());m.low=record.low.slice();m.high=record.high.slice();m.fit={postId:f.postId,postPoint:f.postPoint,beamId:f.beamId,beamPoint:f.beamPoint,...Object.fromEntries(nums.map(k=>[k,f[k]]))};
 }
 if(record.edgeFit!=null&&fitWallType(m)){
  const f=record.edgeFit;
  requireProject(plainObject(f)&&projectId(f.floorId)&&Object.hasOwn(edgeNames,f.side)&&[f.startTrim,f.endTrim].every(v=>Number.isFinite(v)&&v>=-EPS&&v<=100)&&[f.startIds,f.endIds].every(a=>Array.isArray(a)&&a.length<=MAX_MODULES&&a.every(projectId)),'Ugyldig veggtilpasning #'+m.id+'.');
  m.edgeFit={floorId:f.floorId,side:f.side,startTrim:f.startTrim,endTrim:f.endTrim,startIds:f.startIds.slice(),endIds:f.endIds.slice()};
 }
 if(record.roofFit!=null&&fitRoofType(m)){
  const f=record.roofFit,nums=['direction','eave','gable','pitch','thickness','l','w'];
  requireProject(plainObject(f)&&projectId(f.floorId)&&f.type===m.type&&nums.every(k=>Number.isFinite(f[k]))&&[0,90,180,270].includes(f.direction)&&[f.eave,f.gable].every(v=>v>=0&&v<=1)&&typeof f.autoPitch==='boolean'&&Array.isArray(f.seats)&&f.seats.length===2,'Ugyldig taktilpasning #'+m.id+'.');
  const seats=f.seats.map(s=>{
   const keys=['x0','x1','cut0','cut1','z','y'];
   requireProject(plainObject(s)&&projectId(s.wallId)&&keys.every(k=>Number.isFinite(s[k])),'Ugyldig takanlegg #'+m.id+'.');
   return {wallId:s.wallId,...Object.fromEntries(keys.map(k=>[k,s[k]]))};
  });
  m.roofFit={floorId:f.floorId,type:m.type,...Object.fromEntries(nums.map(k=>[k,f[k]])),autoPitch:f.autoPitch,seats};
 }
 // Retain the detached flag where the editor uses null.
 if(record.roofFit===null&&fitRoofType(m))m.roofFit=null;
 if(isGable(m)){
  const f=record.gableFit;
  requireProject(plainObject(f)&&projectId(f.roofId)&&projectId(f.wallId)&&f.type===m.type&&['l','w','h'].every(k=>Number.isFinite(f[k]))&&typeof f.inside==='boolean'&&Array.isArray(f.segments)&&f.segments.length>=1&&f.segments.length<=32&&f.segments.every(a=>finiteArray(a,4)),'Ugyldig gavltilpasning #'+m.id+'.');
  m.gableFit={roofId:f.roofId,wallId:f.wallId,type:m.type,l:f.l,w:f.w,h:f.h,inside:f.inside,segments:f.segments.map(a=>a.slice())};
  if(typeof record.inside==='boolean')m.inside=record.inside;
 }
 return m;
}
function validateProject(p){
 try{
  requireProject(plainObject(p)&&p.format===PROJECT_FORMAT,'Filen er ikke et AFTERFALL-konstruksjonsprosjekt.');
  requireProject(p.schemaVersion===PROJECT_SCHEMA,'Prosjektets dataversjon støttes ikke. Forventet schemaVersion '+PROJECT_SCHEMA+'.');
  requireProject(typeof p.name==='string'&&cleanProjectName(p.name)&&p.name.length<=80,'Ugyldig prosjektnavn.');
  requireProject(plainObject(p.plot)&&validDimension(p.plot.length)&&validDimension(p.plot.width),'Ugyldig byggeflate.');
  requireProject(Array.isArray(p.modules)&&p.modules.length<=MAX_MODULES,'Ugyldig modulliste eller for mange moduler.');
  const L=p.plot.length,W=p.plot.width,list=p.modules.map(readModuleRecord),ids=new Set(list.map(m=>m.id));
  requireProject(ids.size===list.length,'Prosjektet inneholder dupliserte modul-ID-er.');
  const maxId=Math.max(0,...ids);
  requireProject(projectId(p.nextId)&&p.nextId>maxId,'Neste modul-ID må være større enn alle eksisterende ID-er.');
  requireProject(plainObject(p.densities),'Materialdensiteter mangler.');
  const densities={};
  for(const k of Object.keys(materialCatalog)){
   const v=p.densities[k];requireProject(v===null||Number.isFinite(v)&&v>=1&&v<=20000,'Ugyldig densitet for '+materialCatalog[k].name+'.');densities[k]=v;
  }
  const settings=p.settings;
  requireProject(plainObject(settings)&&['0','0.25','1'].includes(settings.gridStep)&&['orbit','top','front','right'].includes(settings.view)&&['snapModules','snapAnchors','snap','showAnchors','planRoof'].every(k=>typeof settings[k]==='boolean'),'Ugyldige visningsinnstillinger.');
  const warnings=[];
  for(let i=0;i<list.length;i++){
   const m=list[i],err=validModule(m,L,W,[]);
   requireProject(!err,'Modul #'+m.id+': '+err);
   const parts=piecesOf(m);
   requireProject(parts.length>0&&parts.length<=1024&&parts.every(a=>Number.isFinite(pieceVolume(a))&&pieceVolume(a)>0),'Ugyldig eller tom geometri i modul #'+m.id+'.');
   const refs=[...(m.fit?[m.fit.postId,m.fit.beamId]:[]),...(m.edgeFit?[m.edgeFit.floorId,...m.edgeFit.startIds,...m.edgeFit.endIds]:[]),...(m.roofFit?[m.roofFit.floorId,...m.roofFit.seats.map(s=>s.wallId)]:[]),...(m.gableFit?[m.gableFit.roofId,m.gableFit.wallId]:[])];
   requireProject(refs.every(id=>id<m.id||id<p.nextId)&&!refs.includes(m.id),'Ugyldig selvreferanse eller fremtidig referanse i #'+m.id+'.');
   for(const id of new Set(refs))if(!ids.has(id))warnings.push('Modul #'+m.id+' refererer til slettet modul #'+id+'.');
  }
  // Validate every record before pairwise collision checks.
  for(let i=0;i<list.length;i++)for(let j=0;j<i;j++)requireProject(!solidOverlap(list[i],list[j]),'Modul #'+list[i].id+' overlapper #'+list[j].id+'.');
  const data={format:PROJECT_FORMAT,schemaVersion:PROJECT_SCHEMA,editorVersion:'1.0',name:cleanProjectName(p.name),savedAt:typeof p.savedAt==='string'&&p.savedAt.length<=40?p.savedAt:'',plot:{length:L,width:W},nextId:p.nextId,modules:list,densities,settings:{gridStep:settings.gridStep,view:settings.view,...Object.fromEntries(['snapModules','snapAnchors','snap','showAnchors','planRoof'].map(k=>[k,settings[k]]))}};
  // All reports are recalculated; imported caches are never trusted.
  quantitySummary(list,densities);
  return {project:data,warnings};
 }catch(e){return {error:e.message};}
}
function parseProject(raw){
 if(typeof raw!=='string'||raw.length>PROJECT_LIMIT)return {error:'Prosjektfilen er for stor (maks 2 MB).'};
 try{return validateProject(JSON.parse(raw));}catch(e){return {error:'Ugyldig JSON: '+e.message};}
}
function projectCSV(rows){
 const field=v=>{
  if(v===null||v===undefined)return '';
  if(typeof v==='number')return Number.isFinite(v)?String(v).replace('.',','):'';
  let s=String(v);if(/^[\s]*[=+\-@]/.test(s))s="'"+s;
  return '"'+s.replaceAll('"','""')+'"';
 };
 return '\uFEFF'+rows.map(r=>r.map(field).join(';')).join('\r\n')+'\r\n';
}
function materialCSV(ms,d){
 const q=quantitySummary(ms,d);
 return projectCSV([['Materiale','Antall deler','Netto m3','Raavolum m3','Netto kg (kjent)','Raa kg (kjent)','Ukjent netto m3','Ukjent raa m3','Densitet kg/m3','Netto lm','Raa lm'],
 ...q.materials.map(a=>[materialCatalog[a.key].name,a.count,a.net,a.raw,a.mass,a.rawMass,a.unknown,a.unknownRaw,d[a.key],a.length,a.rawLength])]);
}
function partsCSV(ms,d){
 const q=quantitySummary(ms,d);
 return projectCSV([['Del','Materiale','Antall','Modul-ID-er','Maal 1 mm','Maal 2 mm','Maal 3 mm','Maaltype','Netto m3 totalt','Raa m3 totalt','Netto kg totalt','Raa kg totalt','Netto lm totalt','Raa lm totalt','Areal m2 totalt','Arealtype','Helning grader'],
 ...q.groups.map(g=>[g.label,materialCatalog[g.material].name,g.count,g.ids.join(', '),...g.dimensions.map(v=>v*1000),g.dimKind||'L x B x H',g.net*g.count,g.raw*g.count,d[g.material]===null?null:g.net*g.count*d[g.material],d[g.material]===null?null:g.raw*g.count*d[g.material],g.length===undefined?null:g.length*g.count,g.rawLength===undefined?null:g.rawLength*g.count,g.area===undefined?null:g.area*g.count,g.areaKind?areaLabels[g.areaKind]:null,g.slope])]);
}
function structureExport(ms,d){
 const s=structureAnalysis(ms,d);
 return {format:'afterfall.construction-analysis',schemaVersion:1,units:{force:'N',area:'m2',pressure:'Pa',length:'m'},model:'Kun egenlast. Forenklet spillmodell, ikke sikkerhetsgodkjenning.',ownForce:s.ownForce,groundForce:s.groundForce,unresolvedForce:s.unresolvedForce,unknownVolume:s.unknownVolume,groundUnknown:s.groundUnknown,unresolvedUnknown:s.unresolvedUnknown,errors:s.errors,warnings:s.warnings,nodes:s.nodes.map(n=>({id:n.id,type:n.m.type,own:n.own,received:n.received,total:n.total,unknown:n.unknown,grounded:n.grounded,status:n.status,span:n.span,utilization:n.utilization,issues:n.issues})),edges:s.edges,assemblies:s.assemblies,sideEdges:s.sideEdges};
}
// CE 1.0: transferable construction plan. No world state mutation in the editor.
const BUILD_FORMAT='afterfall.build-plan',BUILD_SCHEMA=1,BUILD_PROTOCOL='afterfall.construction.v1';
const BUILD_DEMO_STORE='afterfall.ce.demo-plan.v1';
const BUILD_STAGES=['Fundamentering','Bærekonstruksjon','Gulv','Vegger','Åpninger','Gavler','Tak'];
function validateBuildSite(s){
 try{
  requireProject(plainObject(s)&&typeof s.id==='string'&&s.id.trim().length>0&&s.id.length<=120,'Byggeplass-ID mangler.');
  requireProject(s.leveled===true&&s.approved===true,'Byggeplassen må være planert og godkjent før prosjektering.');
  requireProject(validDimension(s.length)&&validDimension(s.width),'Byggeplassen må ha gyldige mål (1–100 m i 0,25 m intervaller).');
  requireProject(finiteArray(s.origin,3)&&s.origin.every(v=>Math.abs(v)<=1e7)&&[0,90,180,270].includes(s.angle),'Byggeplassen mangler gyldig verdensposisjon eller rotasjon.');
  return {site:{id:s.id,length:s.length,width:s.width,origin:s.origin.slice(),angle:s.angle,leveled:true,approved:true}};
 }catch(e){return {error:e.message};}
}
function buildStage(m){
 if(catalog[m.type].role==='foundation')return 0;
 if(['floorFrame','floorDeck'].includes(m.type))return 2;
 if(['doorLeaf','windowUnit'].includes(m.type))return 4;
 if(isGable(m))return 5;
 if(isRoof(m))return 6;
 if(fitWallType(m))return 3;
 return 1;
}
function siteWorldPoint(site,point){
 const v=rotateVector(point,site.angle);return v.map((x,i)=>x+site.origin[i]);
}
function buildFootprint(ms,site){
 // Ground projection is a visual set-out envelope, not proof of usable floor area.
 const boxes=ms.map(m=>{const b=footprint(m);return {id:m.id,x0:m.x-b.x,x1:m.x+b.x,z0:m.z-b.z,z1:m.z+b.z};});
 const floorBoxes=boxes.filter(b=>ms.some(m=>m.id===b.id&&m.type==='floorDeck'));
 const groundBoxes=boxes.filter(b=>ms.some(m=>m.id===b.id&&Math.abs(m.y)<=EPS));
 const base=floorBoxes.length?floorBoxes:groundBoxes.length?groundBoxes:boxes;
 const x0=Math.min(...base.map(b=>b.x0)),x1=Math.max(...base.map(b=>b.x1)),z0=Math.min(...base.map(b=>b.z0)),z1=Math.max(...base.map(b=>b.z1));
 const outline=[[x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]];
 const foundations=ms.filter(m=>catalog[m.type].role==='foundation').map(m=>{
  const points=[[-m.l/2,0,-m.w/2],[m.l/2,0,-m.w/2],[m.l/2,0,m.w/2],[-m.l/2,0,m.w/2]].map(p=>pointToWorld(m,p));
  return {moduleId:m.id,local:points,world:points.map(p=>siteWorldPoint(site,p))};
 });
 return {kind:'rectangular-setout-envelope',basis:floorBoxes.length?'floorDeck':groundBoxes.length?'grounded':'projection',length:x1-x0,width:z1-z0,area:(x1-x0)*(z1-z0),local:outline,world:outline.map(p=>siteWorldPoint(site,p)),foundations,groundLevel:site.origin[1]};
}
function verifyBuildFits(ms,L,W){
 const byId=new Map(ms.map(m=>[m.id,m]));
 for(const m of ms){
  const fail=label=>{throw Error('Modul #'+m.id+': '+label+' er endret. Tilpass modulen på nytt før bygging.');};
  if(m.edgeFit){
   const f=m.edgeFit,other=ms.filter(n=>!containsOpeningInsert(m,n)),r=fitWallOnEdge(m,byId.get(f.floorId),f.side,other,L,W);
   if(r.error||!samePlacement(m,r.module))fail('Veggtilpasningen');
  }
  if(m.roofFit){
   const f=m.roofFit,r=fitRoofOnFloor(m,byId.get(f.floorId),f,ms,L,W);
   if(r.error||!sameRoofFit(m,r.module))fail('Taktilpasningen');
  }
  if(m.gableFit){
   const f=m.gableFit,other=ms.filter(n=>n.id!==m.id&&!containsOpeningInsert(m,n)),r=fitGable(m,byId.get(f.roofId),byId.get(f.wallId),other,L,W);
   if(r.error||!samePlacement(m,r.module)||f.segments.length!==r.module.gableFit.segments.length||!f.segments.every((s,i)=>s.every((v,j)=>Math.abs(v-r.module.gableFit.segments[i][j])<=EPS)))fail('Gavltilpasningen');
  }
 }
}
function makeBuildPlan(project,site,id){
 try{
  const vs=validateBuildSite(site);requireProject(!vs.error,vs.error);site=vs.site;
  const r=validateProject(project);requireProject(!r.error,r.error);
  const p=r.project,ms=p.modules;
  requireProject(ms.length>0,'Prosjekter minst én modul før byggeplanen godkjennes.');
  requireProject(p.plot.length===site.length&&p.plot.width===site.width,'Byggeplanen må ha nøyaktig samme mål som den godkjente byggeplassen.');
  requireProject(typeof id==='string'&&id.length>0&&id.length<=160,'Ugyldig byggeplan-ID.');
  requireProject(!r.warnings.length,'Rett manglende modulreferanser før byggeplanen godkjennes.');
  verifyBuildFits(ms,p.plot.length,p.plot.width);
  const q=quantitySummary(ms,p.densities);
  requireProject(!q.materials.some(m=>m.key==='test'),'Testmoduler uten definert byggemateriale kan ikke overføres til spill.');
  requireProject(q.unknownVolume<=EPS,'Angi densitet for alle brukte byggematerialer før overføring.');
  const s=structureAnalysis(ms,p.densities);
  const errors=s.nodes.filter(n=>n.status==='error'||!n.grounded);
  requireProject(!errors.length,'Rett konstruksjonsfeil før bygging: '+errors.slice(0,5).map(n=>'#'+n.id+' '+n.issues.filter(i=>i.level==='error').map(i=>i.message).join(' ')).join('; '));
  const tasks=ms.map(m=>({moduleId:m.id,type:m.type,label:catalog[m.type].name,stage:buildStage(m),requires:[],status:'unbuilt',materials:[],parts:[]}));
  const byId=new Map(tasks.map(t=>[t.moduleId,t]));
  const dep=(from,to)=>{requireProject(byId.has(from)&&byId.has(to)&&from!==to,'Ugyldig monteringsavhengighet.');const a=byId.get(from).requires;if(!a.includes(to))a.push(to);};
  // All real load-bearing supports and idealized mounting links are prerequisites.
  for(const e of s.edges)if(e.to!==null)dep(e.from,e.to);
  // Gables are designed from a roof reference, but mounted before its roof.
  // Roof geometry is already present in the plan; it need not exist in the world.
  for(const m of ms){
   if(m.gableFit){dep(m.id,m.gableFit.wallId);dep(m.gableFit.roofId,m.id);}
   if(m.roofFit)for(const seat of m.roofFit.seats)dep(m.id,seat.wallId);
   if(m.edgeFit)dep(m.id,m.edgeFit.floorId);
  }
  for(const t of tasks){
   t.requires.sort((a,b)=>a-b);
   const rows=q.parts.filter(p=>p.moduleId===t.moduleId);
   t.parts=rows.map((p,i)=>({partId:String(t.moduleId)+':'+String(i+1),label:p.label,material:p.material,netM3:p.net,rawM3:p.raw,dimensionsM:p.dimensions,dimensionKind:p.dimKind||'L x B x H',...(p.length!==undefined?{lengthM:p.length,rawLengthM:p.rawLength}:{}),...(p.areaKind?{areaM2:p.area,areaKind:p.areaKind}:{}),...(p.slope!==undefined?{slopeDeg:p.slope}:{}),...(p.shape?{shape:p.shape}:{})}));
   const sums=new Map();
   for(const p of t.parts){const a=sums.get(p.material)||{material:p.material,rawM3:0,netM3:0,rawKg:0};a.rawM3+=p.rawM3;a.netM3+=p.netM3;a.rawKg+=p.rawM3*pDens(p.material);sums.set(p.material,a);}
   t.materials=[...sums.values()];
  }
  function pDens(k){return p.densities[k];}
  // Stage is a sorting preference; dependencies are authoritative.
  const pending=new Map(tasks.map(t=>[t.moduleId,t])),done=new Set(),order=[];
  while(pending.size){
   const ready=[...pending.values()].filter(t=>t.requires.every(id=>done.has(id))).sort((a,b)=>a.stage-b.stage||a.moduleId-b.moduleId);
   requireProject(ready.length>0,'Monteringsrekkefølgen inneholder en sirkel. Rett gjensidig avhengige moduler før overføring.');
   const t=ready[0];order.push(t.moduleId);done.add(t.moduleId);pending.delete(t.moduleId);
  }
  tasks.sort((a,b)=>order.indexOf(a.moduleId)-order.indexOf(b.moduleId));
  const totals=q.materials.map(a=>({material:a.key,label:materialCatalog[a.key].name,rawM3:a.raw,netM3:a.net,rawKg:a.rawMass,netKg:a.mass,partCount:a.count,areaM2ByKind:a.areas,rawLengthM:a.rawLength,deliveredM3:0,consumedM3:0}));
  return {plan:{format:BUILD_FORMAT,schemaVersion:BUILD_SCHEMA,editorVersion:'1.0',planId:id,site,status:'planned',createdAt:new Date().toISOString(),coordinateSystem:{unit:'m',origin:'plot-corner',axes:'X length, Y up, Z width',rotation:'positive X toward positive Z'},project:p,setout:buildFootprint(ms,site),materialTotals:totals,tasks,order,stages:BUILD_STAGES.slice(),progress:{installedModuleIds:[],installedPartIds:[],installedModules:0,totalModules:ms.length},analysis:{knownOwnForceN:s.ownForce,warnings:s.nodes.flatMap(n=>n.issues.filter(i=>i.level==='warn').map(i=>({moduleId:n.id,code:i.code,message:i.message}))),model:'Forenklet spillmodell, kun egenlast. Ikke fysisk sikkerhetsgodkjenning.'}}};
 }catch(e){return {error:e.message};}
}
function solid(m,piece=null){
 const part=piece||{polygon:profileOf(m),z0:-m.w/2,z1:m.w/2};
 const polygon=part.polygon;
 const localEdges=polygon.map(([x,y],i)=>[polygon[(i+1)%polygon.length][0]-x,polygon[(i+1)%polygon.length][1]-y,0]);
 const localNormals=localEdges.map(v=>[-v[1],v[0],0]);
 localEdges.push([0,0,1]);localNormals.push([0,0,1]);
 return {vertices:polygon.flatMap(([x,y])=>[part.z0,part.z1].map(z=>pointToWorld(m,[x,y,z]))),
 edges:localEdges.map(v=>rotateVector(v,m.angle)),normals:localNormals.map(v=>rotateVector(v,m.angle))};
}
function solidOverlap(m,n){
 const a=footprint(m),b=footprint(n);
 if(Math.abs(m.x-n.x)>=a.x+b.x-EPS||Math.abs(m.z-n.z)>=a.z+b.z-EPS||m.y>=n.y+n.h-EPS||m.y+m.h<=n.y+EPS)return false;
 if(!usesPieces(m)&&!usesPieces(n))return true;
 const A=piecesOf(m).map(p=>solid(m,p)),B=piecesOf(n).map(p=>solid(n,p));
 return A.some(a=>B.some(b=>convexOverlap(a,b)));
}
function convexOverlap(A,B){
 const axes=[...A.normals,...B.normals];
 for(const a of A.edges)for(const b of B.edges)axes.push(cross(a,b));
 for(const axis of axes){
  const mag=Math.hypot(...axis);if(mag<EPS)continue;
  const unit=axis.map(v=>v/mag),p=A.vertices.map(v=>dot(v,unit)),q=B.vertices.map(v=>dot(v,unit));
  if(Math.max(...p)<=Math.min(...q)+EPS||Math.max(...q)<=Math.min(...p)+EPS)return false;
 }
 return true;
}
function anchors(m){
 const points=[];
 const add=(id,label,p,n)=>points.push({id,label,p:pointToWorld(m,p),n:rotateVector(n,m.angle)});
 if(m.roofFit?.seats?.length){
  for(const [i,s] of m.roofFit.seats.entries())add('seat'+i,'Anleggsflate – vegg #'+s.wallId,[(s.x0+s.x1)/2,s.y,s.z],[0,-1,0]);
  if(m.type==='flatRoof'){add('top','Overkant – sentrum',[0,m.h,0],[0,1,0]);return points;}
  const l=m.l/2,t=roofThickness(m),rise=roofRise(m),gable=m.type==='gableRoof';
  add('ridge','Øvre takreferanse',[gable?0:l,rise+t,0],[0,1,0]);return points;
 }
 if(isRoof(m)&&m.type!=='flatRoof'){
  const l=m.l/2,t=roofThickness(m),rise=roofRise(m),gable=m.type==='gableRoof';
  add('eaveLow','Nedre takkant – referanse',[-l,0,0],[0,-1,0]);
  add('eaveHigh',gable?'Motsatt takkant – referanse':'Øvre takkant – referanse',[l,gable?0:rise,0],[0,-1,0]);
  add('ridge','Øvre takreferanse',[gable?0:l,rise+t,0],[0,1,0]);return points;
 }
 if(isFitted(m)){
  add('low','Nedre endekutt',m.low,[-1,0,0]);
  add('high','Øvre endekutt',m.high,[0,1,0]);
  return points;
 }
 if(isBrace(m)){
  const t=braceEndHeight(m.h);
  add('low','Nedre ende',[-m.l/2,t/2,0],[-1,0,0]);
  add('high','Øvre ende',[m.l/2,m.h-t/2,0],[1,0,0]);
  return points;
 }
 add('bottom','Underkant – sentrum',[0,0,0],[0,-1,0]);
 add('top','Overkant – sentrum',[0,m.h,0],[0,1,0]);
 add('left','Ende −X',[-m.l/2,m.h/2,0],[-1,0,0]);
 add('right','Ende +X',[m.l/2,m.h/2,0],[1,0,0]);
 add('back','Side −Z',[0,m.h/2,-m.w/2],[0,0,-1]);
 add('front','Side +Z',[0,m.h/2,m.w/2],[0,0,1]);
 const role=catalog[m.type]?.role;
 if(role==='floor'||role==='wall'||m.type==='flatRoof'){
  for(const x of [-m.l/2,m.l/2])for(const z of [-m.w/2,m.w/2]){
   const suffix=(x<0?'−X':'+X')+(z<0?'−Z':'+Z');add('base'+suffix,'Underkant '+suffix,[x,0,z],[0,-1,0]);add('top'+suffix,'Overkant '+suffix,[x,m.h,z],[0,1,0]);
  }
 }
 if(isOpening(m)){
  const o=openingOf(m),mid=(o.y0+o.y1)/2;
  add('jambLeft','Åpning – venstre karm',[o.x0,mid,0],[1,0,0]);add('jambRight','Åpning – høyre karm',[o.x1,mid,0],[-1,0,0]);
  if(o.y0>EPS)add('sill','Åpning – underkant',[(o.x0+o.x1)/2,o.y0,0],[0,1,0]);
  add('lintel','Åpning – overkant',[(o.x0+o.x1)/2,o.y1,0],[0,-1,0]);
 }
 if(role==='beam'||m.type==='beam'||m.type==='stripFoot'){
  for(const fraction of [-.25,.25]){
   const id=fraction<0?'quarter−X':'quarter+X';
   add(id,'Underkant – '+(fraction<0?'25 %':'75 %'),[m.l*fraction,0,0],[0,-1,0]);
  }
  const d=m.l/2-Math.min(0.15,m.l/4);
  for(const [suffix,x] of [['−X',-d],['+X',d]]){
   add('bottom'+suffix,'Underkant ved '+suffix,[x,0,0],[0,-1,0]);
   add('top'+suffix,'Overkant ved '+suffix,[x,m.h,0],[0,1,0]);
  }
 }
 if(role==='post'||m.type==='post'){
  const h=Math.min(0.15,m.h/4);
  for(const [suffix,y] of [['nedre',h],['25%',m.h*.25],['75%',m.h*.75],['øvre',m.h-h]]){
   for(const [id,x,z,n] of [['−X',-m.l/2,0,[-1,0,0]],['+X',m.l/2,0,[1,0,0]],['−Z',0,-m.w/2,[0,0,-1]],['+Z',0,m.w/2,[0,0,1]]]){
    add(id+suffix,id+' – '+suffix,[x,y,z],n);
   }
  }
 }
 if(usesPieces(m)&&!isBrace(m)){
  const pieces=piecesOf(m);
  return points.filter(a=>{
   const v=rotateVector([a.p[0]-m.x,a.p[1]-m.y,a.p[2]-m.z],(360-m.angle)%360),n=rotateVector(a.n,(360-m.angle)%360);
   return pieces.some(p=>pointOnPiece(p,v))&&!pieces.some(p=>pointOnPiece(p,v.map((q,i)=>q+n[i]*.0001)));
  });
 }
 return points;
}
function bracePostType(m){return m.type==='timberPost'||m.type==='post';}
function braceBeamType(m){return ['timberBeam','foundationBeam','beam'].includes(m.type);}
function validEndFace(m,points){
 // The selected contact plane has already been fixed by the cut.
 // Verify every corner is inside the receiving rectangular component.
 return points.every(p=>{
  const v=rotateVector([p[0]-m.x,p[1]-m.y,p[2]-m.z],(360-m.angle)%360);
  return Math.abs(v[0])<=m.l/2+EPS&&v[1]>=-EPS&&v[1]<=m.h+EPS&&Math.abs(v[2])<=m.w/2+EPS;
 });
}
function fitBrace(post,postId,beam,beamId,thickness,width,id){
 const fail=error=>({error});
 if(!post||!beam||post.id===beam.id||!bracePostType(post)||!braceBeamType(beam))return fail('Velg en stolpe og en bjelke.');
 if(![thickness,width].every(v=>Number.isFinite(v)&&v>=.05-EPS&&v<=.3+EPS))return fail('Tverrsnitt må være 50–300 mm.');
 const a=anchors(post).find(p=>p.id===postId),b=anchors(beam).find(p=>p.id===beamId);
 if(!a||!b||Math.abs(a.n[1])>EPS||b.n[1]>-1+EPS)return fail('Velg en stolpeside og bjelkens underside.');
 const u=a.n,perp=[-u[2],0,u[0]],delta=b.p.map((v,i)=>v-a.p[i]);
 if(Math.abs(dot(delta,perp))>1e-6)return fail('Festepunktene må ligge i samme vertikalplan.');
 const dx=dot(delta,u),dy=delta[1];
 if(dx<=EPS||dy<=EPS)return fail('Øvre punkt må ligge høyere og utenfor den valgte stolpesiden.');
 const length=Math.hypot(dx,dy),cos=dx/length,sin=dy/length,r=thickness/2;
 const halfVertical=r/cos,halfHorizontal=r/sin;
 if(dy<=halfVertical+EPS||dx<=halfHorizontal+EPS)return fail('Festepunktene ligger for tett for dette tverrsnittet.');
 const angle=u[0]>0.5?0:u[2]>0.5?90:u[0]<-.5?180:270;
 const world=(x,y,z)=>a.p.map((v,i)=>v+x*u[i]+(i===1?y:0)+z*perp[i]);
 const lowFace=[-halfVertical,halfVertical].flatMap(y=>[-width/2,width/2].map(z=>world(0,y,z)));
 const highFace=[dx-halfHorizontal,dx+halfHorizontal].flatMap(x=>[-width/2,width/2].map(z=>world(x,dy,z)));
 if(!validEndFace(post,lowFace))return fail('Hele det nedre endekuttet får ikke plass på stolpen. Velg et annet punkt eller mindre tverrsnitt.');
 if(!validEndFace(beam,highFace))return fail('Hele det øvre endekuttet får ikke plass på bjelkens underside. Velg et annet punkt eller mindre tverrsnitt.');
 const l=dx+halfHorizontal,h=dy+halfVertical,origin=world(l/2,-halfVertical,0);
 const profile=[[-l/2,0],[l/2,h],[dx-halfHorizontal-l/2,h],[-l/2,2*halfVertical]];
 return {module:{id,type:'fittedBrace',x:origin[0],y:origin[1],z:origin[2],l,w:width,h,angle,profile,
 low:[-l/2,halfVertical,0],high:[dx-l/2,h,0],
 fit:{postId:post.id,postPoint:postId,beamId:beam.id,beamPoint:beamId,thickness,width,length,slope:Math.atan2(dy,dx)*180/Math.PI,
 sideCut:2*halfVertical,topCut:2*halfHorizontal,stockLength:length+halfVertical*sin+halfHorizontal*cos}}};
}
function aligned(m,sourceId,target,targetId){
 const a=anchors(m).find(p=>p.id===sourceId),b=anchors(target).find(p=>p.id===targetId);
 if(!a||!b)return {error:'Velg gyldige festepunkter.'};
 if(dot(a.n,b.n)>-0.9999)return {error:'Festepunktene må vende mot hverandre. Roter kilden eller velg et annet punkt.'};
 const round=v=>Math.round(v*1e10)/1e10;
 return {module:{...m,x:round(m.x+b.p[0]-a.p[0]),y:round(m.y+b.p[1]-a.p[1]),z:round(m.z+b.p[2]-a.p[2])}};
}
function matchingConnections(m,others){
 const result=[],own=anchors(m);
 for(const n of others){
  if(n.id===m.id)continue;
  const a=footprint(m),b=footprint(n);
  if(Math.abs(m.x-n.x)>a.x+b.x+0.001||Math.abs(m.z-n.z)>a.z+b.z+0.001||m.y>n.y+n.h+0.001||m.y+m.h<n.y-0.001)continue;
  for(const p of own)for(const q of anchors(n)){
   if(dot(p.n,q.n)<-0.9999&&Math.hypot(p.p[0]-q.p[0],p.p[1]-q.p[1],p.p[2]-q.p[2])<0.001)result.push({id:n.id,source:p.id,target:q.id,label:p.label+' ↔ #'+n.id+' '+q.label});
  }
 }
 return result;
}
function validModule(m,L,W,others=[],ignore=null){
 if(!catalog[m.type])return 'Ukjent modultype.';
 if(![m.x,m.y,m.z,m.l,m.w,m.h,m.angle].every(Number.isFinite))return 'Alle mål må være gyldige tall.';
 if(![0,90,180,270].includes(m.angle))return 'Rotasjon må være 0°, 90°, 180° eller 270°.';
 const minDim=isBuilding(m)?.02:.05;
 if([m.l,m.w,m.h].some(v=>v<minDim-EPS||v>100+EPS)||m.y<-EPS||m.y+m.h>100+EPS)return 'Ugyldige dimensjoner (byggemoduler minst 0,02 m, øvrige minst 0,05 m). Total høyde maks 100 m.';
 if(isFitted(m)&&(!m.profile||m.profile.length!==4||!m.fit||!m.low||!m.high||
 !m.profile.flat().every(Number.isFinite)||Math.abs(Math.max(...m.profile.map(p=>p[0]))-m.l/2)>EPS||
 Math.abs(Math.min(...m.profile.map(p=>p[0]))+m.l/2)>EPS||Math.abs(Math.max(...m.profile.map(p=>p[1]))-m.h)>EPS||
 Math.abs(m.w-m.fit.width)>EPS))return 'Tilpasset avstiver må dimensjoneres med to festepunkter.';
 const paramError=buildingError(m);if(paramError)return paramError;
 if(catalog[m.type].ground&&Math.abs(m.y)>EPS)return 'Dette fundamentet må stå på byggeplaten (Y = 0).';
 const a=footprint(m);
 if(m.x-a.x<-EPS||m.x+a.x>L+EPS||m.z-a.z<-EPS||m.z+a.z>W+EPS)return 'Modulen går utenfor byggeflaten.';
 for(const n of others){
  if(n.id===ignore)continue;
  if(solidOverlap(m,n))return 'Modulen overlapper '+(catalog[n.type]?.name||'en annen modul')+' #'+n.id+'.';
 }
 return '';
}
const edgeNames={north:'−Z (langs X)',east:'+X (langs Z)',south:'+Z (langs X)',west:'−X (langs Z)'};
function fitWallType(m){return !!m&&['wallFrame','cladding','solidWall','doorWall','windowWall'].includes(m.type);}
function fitFloorType(m){return !!m&&m.type==='floorDeck';}
function floorLocal(f,m){
 const v=rotateVector([m.x-f.x,m.y-f.y,m.z-f.z],(360-f.angle)%360);
 return {...m,x:v[0],y:v[1],z:v[2],angle:(m.angle-f.angle+360)%360};
}
function edgeSpec(floor,side,thickness){
 const alongX=side==='north'||side==='south',sign=side==='north'||side==='west'?-1:1;
 const half=(alongX?floor.l:floor.w)/2,depth=(alongX?floor.w:floor.l)/2;
 const center=sign*(depth-thickness/2);
 return {alongX,half,depth,center,v0:center-thickness/2,v1:center+thickness/2,angle:(floor.angle+(alongX?0:90))%360};
}
function wallSupported(wall,floor){
 const n=floorLocal(floor,wall),b=footprint(n);
 return Math.abs(n.y-floor.h)<=EPS&&n.x-b.x>=-floor.l/2-EPS&&n.x+b.x<=floor.l/2+EPS&&n.z-b.z>=-floor.w/2-EPS&&n.z+b.z<=floor.w/2+EPS;
}
function samePlacement(a,b){
 return a.angle===b.angle&&['x','y','z','l','w','h'].every(k=>Math.abs(a[k]-b[k])<=EPS);
}
function containsOpeningInsert(wall,m){
 if(!isOpening(wall)||!['doorLeaf','windowUnit'].includes(m.type))return false;
 const n=floorLocal(wall,m),b=footprint(n),o=openingOf(wall);
 return n.x-b.x>=o.x0-EPS&&n.x+b.x<=o.x1+EPS&&n.y>=o.y0-EPS&&n.y+n.h<=o.y1+EPS&&n.z-b.z>=-wall.w/2-EPS&&n.z+b.z<=wall.w/2+EPS;
}
function fitWallOnEdge(source,floor,side,others,L,W){
 const fail=error=>({error});
 if(!fitWallType(source)||!fitFloorType(floor)||!Object.hasOwn(edgeNames,side))return fail('Velg en veggtype, gulvmodul og ytterkant.');
 if(![source.w,source.h].every(Number.isFinite)||source.w<.02-EPS||source.h<.02-EPS||source.h>100||source.w>100)return fail('Kontroller veggtykkelse og vegghøyde.');
 const e=edgeSpec(floor,side,source.w);
 if(source.w>e.depth*2+EPS)return fail('Veggen er tykkere enn gulvets bredde på tvers.');
 let start=-e.half,end=e.half;const startIds=[],endIds=[];
 const wallY=floor.h;
 // Work entirely in the floor's local coordinate system. Only perpendicular
 // wall modules that cover the complete new wall band and height can form a butt joint.
 for(const n of others){
  if(n.id===source.id||!fitWallType(n))continue;
  const local=floorLocal(floor,n),perpendicular=e.alongX?local.angle%180===90:local.angle%180===0;
  if(!perpendicular)continue;
  const b=footprint(local),u=e.alongX?local.x:local.z,v=e.alongX?local.z:local.x,bu=e.alongX?b.x:b.z,bv=e.alongX?b.z:b.x;
  const lo=u-bu,hi=u+bu,vlo=v-bv,vhi=v+bv;
  if(vlo>e.v0+EPS||vhi<e.v1-EPS||local.y>wallY+EPS||local.y+local.h<wallY+source.h-EPS)continue;
  // Do not use a wall outside the floor or at an unrelated interior location as a corner.
  if(!wallSupported(n,floor))continue;
  if(Math.abs(lo+e.half)<=EPS&&hi>-e.half+EPS){
   if(hi>start+EPS){start=hi;startIds.length=0;}
   if(Math.abs(hi-start)<=EPS)startIds.push(n.id);
  }
  if(Math.abs(hi-e.half)<=EPS&&lo<e.half-EPS){
   if(lo<end-EPS){end=lo;endIds.length=0;}
   if(Math.abs(lo-end)<=EPS)endIds.push(n.id);
  }
 }
 if(end-start<.02-EPS)return fail('Det er ikke nok plass mellom hjørneveggene.');
 const u=(start+end)/2,localX=e.alongX?u:e.center,localZ=e.alongX?e.center:u;
 const [x,y,z]=pointToWorld(floor,[localX,floor.h,localZ]);
 const m=normalizeBuilding({...source,x,y,z,l:end-start,angle:e.angle,edgeFit:{floorId:floor.id,side,startTrim:start+e.half,endTrim:e.half-end,startIds,endIds}});
 if(!wallSupported(m,floor))return fail('Veggen vil ikke stå helt oppå gulvet.');
 const geometryError=validModule(m,L,W,others,source.id);
 if(geometryError)return fail(geometryError+' Kontroller vegghøyde, åpning eller tilstøtende vegg.');
 // Opening elements are separate objects. Do not silently leave them behind.
 const previous=others.find(n=>n.id===source.id);
 if(previous&&!samePlacement(previous,m)&&others.some(n=>n.id!==previous.id&&containsOpeningInsert(previous,n)))return fail('Veggen har en innsatt dør eller et vindu. Fjern elementet først, tilpass veggen og sett det inn på nytt.');
 return {module:m,fullLength:2*e.half,startTrim:start+e.half,endTrim:e.half-end,startIds,endIds};
}
const completeRoofTypes=['flatRoof','shedRoof','gableRoof'];
function fitRoofType(m){return !!m&&completeRoofTypes.includes(m.type);}
function roofWallType(m){return !!m&&['solidWall','doorWall','windowWall','wallFrame'].includes(m.type);}
function roofWallPair(floor,direction,others){
 if(!fitFloorType(floor)||![0,90,180,270].includes(direction))return {error:'Velg en gulvmodul og gyldig takretning.'};
 const angle=(floor.angle+direction)%360,span=direction%180===0?floor.l:floor.w,depth=direction%180===0?floor.w:floor.l;
 const basis={...floor,angle},half=span/2,low=[],high=[];
 for(const n of others){
  if(!roofWallType(n)||!wallSupported(n,floor))continue;
  const b=floorLocal(basis,n),f=footprint(b);if(b.angle%180!==90)continue;
  const x0=b.x-f.x,x1=b.x+f.x,z0=b.z-f.z,z1=b.z+f.z;
  if(z1-z0<=EPS)continue;
  const s={wallId:n.id,x0,x1,z0,z1,z:b.z,top:n.y+n.h};
  if(Math.abs(x0+half)<=EPS&&x1<=EPS)low.push(s);
  if(Math.abs(x1-half)<=EPS&&x0>=-EPS)high.push(s);
 }
 if(!low.length||!high.length)return {error:'Det kreves to motstående yttervegger oppå valgt gulv. Kontroller takretning og veggplassering.'};
 if(low.length!==1||high.length!==1)return {error:'Flere vegger funnet på samme takside. CE 0.9 støtter én sammenhengende vegg per motsatt ytterkant.'};
 if(Math.min(low[0].z1,high[0].z1)-Math.max(low[0].z0,high[0].z0)<=EPS)return {error:'Motstående vegger må overlappe i takets lengderetning.'};
 return {angle,span,depth,low:low[0],high:high[0]};
}
function fitRoofOnFloor(source,floor,options,others,L,W){
 const fail=error=>({error});
 if(!fitRoofType(source))return fail('Velg et komplett flatt tak, pulttak eller saltak.');
 const {direction,eave,gable,thickness,autoPitch}=options;let pitch=source.type==='flatRoof'?0:options.pitch;
 if(![eave,gable,thickness].every(Number.isFinite)||[eave,gable].some(v=>v<0||v>1)||thickness<.05-EPS||thickness>.5+EPS)return fail('Takutstikk må være 0–1 m og tykkelse 0,05–0,50 m.');
 const pair=roofWallPair(floor,direction,others);if(pair.error)return pair;
 const {low,high,span,depth,angle}=pair,l=span+2*eave,w=depth+2*gable;
 if(source.type==='shedRoof'&&autoPitch)pitch=Math.atan2(high.top-low.top,high.x1-low.x1)*180/Math.PI;
 if(source.type!=='flatRoof'&&(!Number.isFinite(pitch)||pitch<5-EPS||pitch>60+EPS))return fail('Takvinkel må være 5–60°. Pulttak krever en høyere vegg i stigningsretningen. Bytt retning eller endre vegghøyde.');
 pitch=Math.min(60,Math.max(source.type==='flatRoof'?0:5,pitch));
 if(source.type==='flatRoof'&&Math.abs(low.top-high.top)>EPS)return fail('Flatt tak krever to like høye veggtopper.');
 let m=normalizeBuilding({...source,roofFit:null,x:floor.x,z:floor.z,y:0,l,w,angle,params:source.type==='flatRoof'?{thickness}:{pitch,thickness}});
 const supports=[low,high],maxima=supports.map(s=>Math.max(roofUnderside(m,s.x0),roofUnderside(m,s.x1)));
 const y=Math.min(low.top-maxima[0],high.top-maxima[1]),t=roofThickness(m);
 const seats=supports.map((s,i)=>{
  const level=s.top-y;let cut0=s.x0,cut1=s.x1;
  // Extend the cut towards the ridge to meet the uncut underside where it is
  // lower than the wall top. Also clears end-wall corners of differing thickness.
  if(m.type==='gableRoof'){
   const slope=Math.tan(pitch*Math.PI/180);
   if(i===0)cut1=Math.max(cut1,Math.min(0,-l/2+level/slope));
   else cut0=Math.min(cut0,Math.max(0,l/2-level/slope));
  }
  return {wallId:s.wallId,x0:s.x0,x1:s.x1,cut0,cut1,z:s.z,y:level};
 });
 const residual=seats.map(s=>Math.min(roofUnderside(m,s.cut0),roofUnderside(m,s.cut1))+t-s.y);
 if(residual.some(r=>r<.02-EPS)){
  const suggested=low.top+maxima[1]-maxima[0];
  return fail('Takvinkel og tykkelse passer ikke begge vegghøydene. Øk tykkelsen, reduser vinkelen eller juster veggene. Ønsket motsatt veggtopp ved denne vinkelen: Y ≈ '+suggested.toFixed(3)+' m. Minst 20 mm vertikal taktykkelse må gjenstå ved anlegget (spillregel).');
 }
 m={...m,y,roofFit:{floorId:floor.id,type:m.type,direction,eave,gable,autoPitch:!!autoPitch,pitch,thickness,l,w,seats}};
 const error=validModule(m,L,W,others,source.id);if(error)return fail(error+' Kontroller takutstikk, vegghøyder og andre konstruksjoner.');
 return {module:m,pair,pitch,residual,ridge:y+m.h,contactAreas:supports.map(s=>(s.x1-s.x0)*(s.z1-s.z0))};
}
function sameRoofFit(a,b){
 return !!(a&&b&&samePlacement(a,b)&&a.roofFit&&b.roofFit&&a.type===b.type&&Math.abs(a.roofFit.pitch-b.roofFit.pitch)<=EPS&&Math.abs(a.roofFit.thickness-b.roofFit.thickness)<=EPS&&a.roofFit.seats.every((s,i)=>{
  const q=b.roofFit.seats[i];return q&&s.wallId===q.wallId&&['x0','x1','cut0','cut1','y','z'].every(k=>Math.abs(s[k]-q[k])<=EPS);
 }));
}
function gableWallCandidate(wall,roof){
 if(!wall||!roof||roof.type!=='gableRoof'||!roofWallType(wall))return false;
 const n=floorLocal(roof,wall),b=footprint(n);
 return n.angle%180===0&&Math.abs(n.z)>b.z+EPS&&n.z-b.z>=-roof.w/2-EPS&&n.z+b.z<=roof.w/2+EPS&&n.x-b.x>=-roof.l/2-EPS&&n.x+b.x<=roof.l/2+EPS;
}
function fitGable(source,roof,wall,others,L,W){
 const fail=error=>({error});
 if(!isGable(source)||!gableWallCandidate(wall,roof))return fail('Velg saltak og endevegg parallell med takets tverrsnitt, innenfor takets grunnflate.');
 if(roof.roofFit){
  const floor=others.find(n=>n.id===roof.roofFit.floorId);
  if(fitFloorType(floor)){
   const local=floorLocal({...floor,angle:roof.angle},wall),depth=roof.roofFit.direction%180===0?floor.w:floor.l;
   if(Math.abs(Math.abs(local.z)+wall.w/2-depth/2)>EPS)return fail('Veggen må stå langs bygningens ende, ikke under takutstikket eller inne i rommet.');
  }
 }
 const n=floorLocal(roof,wall),w=source.w??wall.w,inside=!!(source.inside??source.gableFit?.inside);
 if(!Number.isFinite(w)||w<.02-EPS||w>wall.w+EPS)return fail('Gavltykkelsen må være minst 20 mm og ikke større enn endeveggens tykkelse.');
 const a=n.x-wall.l/2,b=n.x+wall.l/2,base=wall.y+wall.h,localZ=n.z+(inside?-1:1)*Math.sign(n.z)*(wall.w-w)/2;
 const segments=[];
 for(const piece of piecesOf(roof)){
  const [p,q]=piece.polygon,lo=Math.max(a,p[0]),hi=Math.min(b,q[0]);
  if(hi-lo<=EPS)continue;
  const y=x=>roof.y+p[1]+(q[1]-p[1])*(x-p[0])/(q[0]-p[0])-base;
  const h0=y(lo),h1=y(hi);
  if(Math.min(h0,h1)<-1e-6)return fail('Endeveggen går inn i taket. Tilpass vegg eller tak før gavlen.');
  if(Math.max(h0,h1)>EPS)segments.push([lo-n.x,hi-n.x,Math.max(0,h0),Math.max(0,h1)]);
 }
 segments.sort((a,b)=>a[0]-b[0]);
 if(!segments.length)return fail('Ingen åpen gavlflate mellom vegg og tak.');
 const h=Math.max(...segments.flatMap(s=>s.slice(2))),[x,y,z]=pointToWorld(roof,[n.x,base-roof.y,localZ]);
 const m=normalizeBuilding({...source,x,y,z,l:wall.l,w,h,angle:roof.angle,gableFit:{roofId:roof.id,wallId:wall.id,type:source.type,l:wall.l,w,h,inside,segments}});
 const previous=others.find(v=>v.id===source.id);
 if(previous&&isOpening(previous)&&others.some(v=>v.id!==m.id&&containsOpeningInsert(previous,v)))return fail('Fjern innsatt vindu før gavlen tilpasses på nytt.');
 const error=validModule(m,L,W,others,source.id);if(error)return fail(error);
 return {module:m,area:segments.reduce((v,s)=>v+(s[1]-s[0])*(s[2]+s[3])/2,0)};
}
function snapModule(m,others,gridSnap,anchorSnap){
 let x=gridSnap?Math.round(m.x*4)/4:m.x,z=gridSnap?Math.round(m.z*4)/4:m.z;
 if(!anchorSnap)return {...m,x,z};
 const a=footprint(m);
 // Snap centerlines or opposing edges; retain the nearest candidate per axis.
 let bx=0.18+EPS,bz=0.18+EPS;
 for(const n of others){
  if(n.id===m.id)continue;
  const b=footprint(n);
  if(Math.abs(m.x-n.x)>a.x+b.x+0.35||Math.abs(m.z-n.z)>a.z+b.z+0.35)continue;
  if(m.y>n.y+n.h+EPS||m.y+m.h<n.y-EPS)continue;
  for(const candidate of [n.x,n.x-b.x-a.x,n.x+b.x+a.x,n.x-b.x+a.x,n.x+b.x-a.x]){
   const d=Math.abs(candidate-m.x);if(d<bx){bx=d;x=candidate;}
  }
  for(const candidate of [n.z,n.z-b.z-a.z,n.z+b.z+a.z,n.z-b.z+a.z,n.z+b.z-a.z]){
   const d=Math.abs(candidate-m.z);if(d<bz){bz=d;z=candidate;}
  }
 }
 const round=v=>Math.round(v*1e6)/1e6;
 return {...m,x:round(x),z:round(z)};
}


function gradeBuildSite(q){
 if(!q||!['completed','archived'].includes(q.status))return null;
 const raw={id:q.id,length:q.x1-q.x0,width:q.z1-q.z0,origin:[q.x0,q.level,q.z0],angle:0,leveled:true,approved:true};
 const r=validateBuildSite(raw);return r.error?null:r.site;
}
function sameSite(a,b){
 return !!(a&&b&&a.id===b.id&&a.length===b.length&&a.width===b.width&&a.angle===b.angle&&a.leveled===true&&a.approved===true&&Array.isArray(a.origin)&&a.origin.length===3&&a.origin.every((v,i)=>v===b.origin[i]));
}
function acceptConstructionPlan(raw,site){
 if(!raw||raw.format!==BUILD_FORMAT||raw.schemaVersion!==BUILD_SCHEMA||raw.status!=='planned'||!sameSite(raw.site,site))return {error:'Byggeplanen samsvarer ikke med den godkjente byggeplassen.'};
 // Recalculate all derived data using the editor's exact geometry functions.
 // Never trust received material totals, tasks, footprint or progress.
 return makeBuildPlan(raw.project,site,raw.planId);
}
function containsPlayer(q,x,z){return !!q&&x>=q.x0&&x<=q.x1&&z>=q.z0&&z<=q.z1;}
function markerLayout(plan){
 const outlines=[{kind:'perimeter',points:plan.setout.world},...plan.setout.foundations.map(f=>({kind:'foundation',moduleId:f.moduleId,points:f.world}))];
 const stakes=new Map(),segments=[];
 for(const o of outlines){
  const pts=o.points;const height=o.kind==='perimeter'?.48:.16;
  for(let i=0;i<pts.length;i++){
   const a=pts[i],b=pts[(i+1)%pts.length],dist=Math.hypot(b[0]-a[0],b[2]-a[2]);
   if(dist<1e-7)continue;
   const n=Math.max(1,Math.ceil(dist/3));
   for(let j=0;j<n;j++){
    const point=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
    const start=point(j/n),end=point((j+1)/n),key=start[0].toFixed(5)+','+start[2].toFixed(5);
    const old=stakes.get(key);
    if(!old||old.height<height+.12)stakes.set(key,{point:start,height:height+.12,kind:o.kind});
    segments.push({a:start,b:end,height,kind:o.kind});
   }
  }
 }
 return {stakes:[...stakes.values()],segments};
}

export {gradeBuildSite,sameSite,acceptConstructionPlan,containsPlayer,markerLayout,BUILD_PROTOCOL};
