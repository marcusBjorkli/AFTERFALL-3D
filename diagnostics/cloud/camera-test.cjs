const {chromium}=require('playwright');
const fs=require('node:fs');
const crypto=require('node:crypto');
const http=require('node:http');
const path=require('node:path');
const root=process.cwd(), out=path.join(root,'diagnostic-output');
fs.mkdirSync(out,{recursive:true});
const report={bridgeVersion:'DB 0.3.1',testId:'CAM-001',timestamp:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,passed:false,cameras:[],errors:[]};
const server=http.createServer((req,res)=>{
 const p=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
 if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 const f=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;
 const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.wasm':'application/wasm'};
 fs.readFile(f,(e,b)=>{if(e){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(b);});
});
async function main(){
 let browser,page;
 try{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
 browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 page.on('pageerror',e=>report.errors.push(e.message));
 const url='http://127.0.0.1:'+server.address().port+'/terrain-integration/?diagnostics=1';
 report.target='checked-out commit (not live Pages)';
 const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:120000});
 report.httpStatus=response.status();
 await page.waitForFunction(()=>window.AFTERFALL_DIAGNOSTICS?.bridgeVersion==='DB 0.3 phase E',null,{timeout:180000});
 report.setup=await page.evaluate(async()=>{
 const a=window.AFTERFALL_DIAGNOSTICS;
 a.setPlayerPosition(2725.93,2751.93);
 return {revision:a.getVersion(),seed:a.getSeed(),position:a.getPlayerPosition(),terrain:await a.waitForTerrain(),presets:a.getCameraPresets()};
 });
 const s=report.setup;
 if(s.revision!=='f.4.6.2C.3.9C.3'||s.seed!==206414||Math.hypot(s.position.x-2725.93,s.position.z-2751.93)>.001||!s.terrain.ready||s.terrain.activeChunks!==49)throw Error('Invalid GEO-001 setup');
 // Measure real loaded geometry before changing the visual presentation.
 const mesh=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.runMeshTest());
 fs.writeFileSync(path.join(out,'geometry-report.json'),JSON.stringify(mesh,null,2));
 const c=mesh.counters||{}, fine=mesh.fineAlpineJunction||{};
 const required=['dryClassifiedWithWater','classifiedWetWithoutWater','multipleWaterTypes','terrainRayMiss','alpineMissing','alpineFalseWet','alpineOutletWetGap','riverExpectedWithoutMesh','riverBankBelowWater'];
 const valid=mesh.valid===true&&mesh.revision===s.revision&&Math.hypot(mesh.center.x-2725.93,mesh.center.z-2751.93)<=.001&&mesh.radius===96&&mesh.step===8&&c.samplePoints===441&&c.loaded===441&&c.unloaded===0&&mesh.preflight?.playerChunkFound===true&&required.every(k=>Number.isFinite(c[k]))&&Number.isFinite(fine.suspendedBankSamples)&&Number.isFinite(fine.maxSuspendedBankHeight);
 const edge=mesh.shorelineEdgeControl||{};
 const fineValid=fine.valid===true&&fine.alpineId===6&&fine.samples===101&&fine.loaded===101&&fine.unloaded===0&&edge.valid===true&&edge.probes===48&&edge.unloaded===0;
 const findings=Object.fromEntries(required.map(k=>[k,c[k]]));
 findings.suspendedBankSamples=fine.suspendedBankSamples;
 findings.maxSuspendedBankHeight=fine.maxSuspendedBankHeight;
 for(const k of ['missingWater','terrainIntrusion','heightMismatch','multipleRiverStages','lakeRiverOverlaps'])findings['fine_'+k]=fine[k];
 for(const k of ['wetInsideMissing','waterOutsideBank','maxWaterAboveDryBank'])findings['edge_'+k]=edge[k];
 report.geometry={testId:'MESH-001',valid:valid&&fineValid&&Object.values(findings).every(Number.isFinite),findings,geometryClean:valid&&fineValid&&Object.values(findings).every(v=>v===0),file:'geometry-report.json'};
 if(!report.geometry.valid)throw Error('Invalid or incomplete geometry report');
 const profiles=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.runCrossSections());
 fs.writeFileSync(path.join(out,'cross-sections.json'),JSON.stringify(profiles,null,2));
 const summary=[];
 for(const p of profiles.profiles){
  const pts=p.points, validPoints=pts.filter(q=>q.loaded&&['T0','T1','T2','T3','T4'].every(k=>Number.isFinite(q[k]))&&Array.isArray(q.water)&&q.water.every(Number.isFinite));
  const maxSlope=validPoints.length===401?Math.max(...pts.slice(1).map((q,i)=>Math.abs(q.T4-pts[i].T4)/.1)):null;
  // Candidate ditch: local minimum bracketed by higher dry mesh on both sides within 5m.
  let ditch=null;
  for(let i=1;i<pts.length-1;i++){
   const q=pts[i];if(!Number.isFinite(q.T4)||q.water.length||q.T4>pts[i-1].T4||q.T4>pts[i+1].T4)continue;
   const left=pts.slice(Math.max(0,i-50),i).filter(v=>!v.water.length&&Number.isFinite(v.T4));
   const right=pts.slice(i+1,i+51).filter(v=>!v.water.length&&Number.isFinite(v.T4));
   if(!left.length||!right.length)continue;
   const l=left.reduce((a,b)=>a.T4>b.T4?a:b),r=right.reduce((a,b)=>a.T4>b.T4?a:b);
   const depth=Math.min(l.T4,r.T4)-q.T4;
   if(depth>0&&(!ditch||depth>ditch.depth))ditch={offset:q.offset,depth,width:r.offset-l.offset,left:l.offset,right:r.offset};
  }
  const corrected=pts.filter(q=>Math.abs(q.T2-q.stages.legacy)>.05);
  const transitionWidth=corrected.length?corrected.at(-1).offset-corrected[0].offset:0;
  summary.push({id:p.id,along:p.along,validPoints:validPoints.length,maxSlope,ditchCandidate:ditch,correctionSpanAbove5cm:transitionWidth,maxModelMeshDelta:validPoints.length?Math.max(...validPoints.map(q=>Math.abs(q.T3-q.T4))):null});
  const vals=validPoints.flatMap(q=>[q.T0,q.T1,q.T2,q.T3,q.T4,...q.water]);
  if(!vals.length)continue;
  const lo=Math.min(...vals)-.1,hi=Math.max(...vals)+.1,X=q=>60+(q.offset+20)*22,Y=h=>390-(h-lo)/(hi-lo)*340;
  const colors={T0:'#999999',T1:'#a16a35',T2:'#27854d',T3:'#7754a6',T4:'#202020'};
  const paths=Object.keys(colors).map(k=>'<polyline fill="none" stroke="'+colors[k]+'" stroke-width="1.5" points="'+validPoints.map(q=>X(q)+','+Y(q[k])).join(' ')+'"/>').join('');
  const water=validPoints.flatMap(q=>q.water.map(h=>'<circle cx="'+X(q)+'" cy="'+Y(h)+'" r="1.5" fill="#1685c2"/>')).join('');
  const legend=Object.keys(colors).map((k,i)=>'<text x="'+(60+i*105)+'" y="420" fill="'+colors[k]+'">'+k+'</text>').join('');
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="450" viewBox="0 0 1000 450"><rect width="1000" height="450" fill="white"/><g font-family="sans-serif" font-size="13"><text x="60" y="25">'+p.id+' | GEO-001 | along '+p.along+' m</text><path d="M60 50 V390 H940" fill="none" stroke="#888"/><text x="5" y="55">'+hi.toFixed(2)+' m</text><text x="5" y="390">'+lo.toFixed(2)+' m</text><text x="60" y="405">-20 m</text><text x="910" y="405">20 m</text>'+paths+water+legend+'<text x="650" y="420" fill="#1685c2">Water mesh</text></g></svg>';
  fs.writeFileSync(path.join(out,p.id+'.svg'),svg);
 }
 fs.writeFileSync(path.join(out,'profile-summary.json'),JSON.stringify({definitions:profiles.definitions,method:'ditch candidate: dry local minimum bracketed by dry maxima within 5 m each side; correction span: outermost samples exceeding 5 cm correction, may include gaps',profiles:summary},null,2));
 const baseline={revision:'f.4.6.2C.3.7',runId:46057327201,points:8421,maxDitchDepth:.7727987781652246,maxCorrectionSpan:15.4,suspendedBankSamples:14,maxSuspendedBankHeight:.3256,riverExpectedWithoutMesh:4,alpineOutletWetGap:2};
 const after={maxDitchDepth:Math.max(0,...summary.map(p=>p.ditchCandidate?.depth||0)),maxCorrectionSpan:Math.max(...summary.map(p=>p.correctionSpanAbove5cm)),suspendedBankSamples:fine.suspendedBankSamples,maxSuspendedBankHeight:fine.maxSuspendedBankHeight,riverExpectedWithoutMesh:c.riverExpectedWithoutMesh,alpineOutletWetGap:c.alpineOutletWetGap};
 const delta=Object.fromEntries(Object.keys(after).map(k=>[k,after[k]-baseline[k]]));
 const comparison={baseline,after,delta,targets:{maxDitchDepth:.05,maxSuspendedBankHeight:.05,suspendedBankSamples:0,riverExpectedWithoutMesh:0,alpineOutletWetGap:0},accepted:after.maxDitchDepth<=.05&&after.maxSuspendedBankHeight<=.05&&after.suspendedBankSamples===0&&after.riverExpectedWithoutMesh===0&&after.alpineOutletWetGap===0&&fine.terrainIntrusion===0&&fine.lakeRiverOverlaps===0};
 fs.writeFileSync(path.join(out,'before-after.json'),JSON.stringify(comparison,null,2));
 report.comparison=comparison;
 report.crossSections={valid:profiles.profiles.length===21&&summary.every(p=>p.validPoints===401),profiles:summary.length,points:summary.reduce((n,p)=>n+p.validPoints,0)};
 if(!report.crossSections.valid)throw Error('Incomplete cross-section coverage');
 const wide=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.runCrossSections(80));
 fs.writeFileSync(path.join(out,'cross-sections-80m.json'),JSON.stringify(wide,null,2));
 const wideSummary=wide.profiles.map((p,i)=>{
  const pts=p.points, narrow=profiles.profiles[i].points;
  const valid=pts.length===801&&pts.every(q=>q.loaded&&['T0','T1','T2','T3','T4'].every(k=>Number.isFinite(q[k]))&&Array.isArray(q.water)&&q.water.every(Number.isFinite));
  const overlap=narrow.every((q,j)=>{const w=pts[j+200];return w&&Math.hypot(q.x-w.x,q.z-w.z)<1e-8&&Math.abs(q.T4-w.T4)<1e-6&&JSON.stringify(q.water)===JSON.stringify(w.water);});
  let maxArtificialDepth=0,offset=null;
  for(let j=1;j<pts.length-1;j++){
   const q=pts[j];if(q.water.length||q.T4>pts[j-1].T4||q.T4>pts[j+1].T4)continue;
   const l=pts.slice(Math.max(0,j-50),j).filter(v=>!v.water.length),r=pts.slice(j+1,j+51).filter(v=>!v.water.length);
   if(!l.length||!r.length)continue;
   const depth=k=>Math.max(0,Math.min(Math.max(...l.map(v=>k(v))),Math.max(...r.map(v=>k(v))))-k(q));
   const artificial=Math.max(0,depth(v=>v.T4)-depth(v=>v.stages.alpineShore));
   if(artificial>maxArtificialDepth){maxArtificialDepth=artificial;offset=q.offset;}
  }
  const vals=pts.flatMap(q=>[q.T4,q.stages.alpineShore,...q.water]),lo=Math.min(...vals)-.1,hi=Math.max(...vals)+.1;
  const X=q=>60+(q.offset+40)*11,Y=h=>390-(h-lo)/(hi-lo)*340;
  const line=(fn,color)=>'<polyline fill="none" stroke="'+color+'" points="'+pts.map(q=>X(q)+','+Y(fn(q))).join(' ')+'"/>';
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="450"><rect width="1000" height="450" fill="white"/><g font-family="sans-serif" font-size="13"><text x="60" y="25">'+p.id+' | 80m | pre-outlet gray, mesh black, water blue</text>'+line(q=>q.stages.alpineShore,'#999')+line(q=>q.T4,'#222')+pts.flatMap(q=>q.water.map(h=>'<circle cx="'+X(q)+'" cy="'+Y(h)+'" r="1.5" fill="#1685c2"/>')).join('')+'<text x="60" y="420">-40m</text><text x="900" y="420">+40m</text><text x="5" y="50">'+hi.toFixed(2)+'</text><text x="5" y="390">'+lo.toFixed(2)+'</text></g></svg>';
  fs.writeFileSync(path.join(out,p.id+'-80m.svg'),svg);
  return {id:p.id,valid,overlap,maxArtificialDepth,offset,waterHits:pts.filter(q=>q.water.length).length};
 });
 const waterHits=profiles.profiles.flatMap(p=>p.points).filter(q=>q.water.length).length;
 report.wideProfiles={valid:wide.profiles.length===21&&wideSummary.every(p=>p.valid&&p.overlap),points:wide.profiles.reduce((n,p)=>n+p.points.length,0),maxArtificialDepth:Math.max(...wideSummary.map(p=>p.maxArtificialDepth)),profiles:wideSummary};
 report.waterComparison={referenceC37:2108,referenceC38:1988,current:waterHits,deltaFromC38:waterHits-1988};
 report.waterComparison.referenceC381=1962;
 report.waterComparison.deltaFromC381=waterHits-1962;
 report.comparison.previousC381={maxDitchDepth:.1062,maxSuspendedBankHeight:.2815,suspendedBankSamples:12,riverExpectedWithoutMesh:4,alpineOutletWetGap:2};
 report.comparison.previousC38={maxDitchDepth:.4149,maxSuspendedBankHeight:.2815,suspendedBankSamples:12,riverExpectedWithoutMesh:4,alpineOutletWetGap:2};
 report.comparison.accepted=report.comparison.accepted&&report.wideProfiles.valid&&report.wideProfiles.maxArtificialDepth<=.05;
 fs.writeFileSync(path.join(out,'before-after.json'),JSON.stringify({...report.comparison,wideProfiles:report.wideProfiles,waterComparison:report.waterComparison},null,2));
 if(!report.wideProfiles.valid)throw Error('Incomplete wide profile coverage or inconsistent overlap');
 report.comparison.previousC392={runId:46063884004,waterHits:1962,wideWaterHits:2064,triangles:2623,connectorTriangles:468,boundarySamples:360,above5cm:140,below5cm:1,maxAbsoluteGap:.30556};
 const boundary=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.runWaterBoundaryTest());
 fs.writeFileSync(path.join(out,'water-boundaries.json'),JSON.stringify(boundary,null,2));
 report.waterBoundary={method:boundary.method,samples:boundary.samples.length,excluded:boundary.excluded,maxGap:boundary.maxGap,above5cm:boundary.above5cm,below5cm:boundary.below5cm,maxAbsoluteGap:boundary.maxAbsoluteGap,internal:boundary.internal,missingTerrain:boundary.missingTerrain};
 report.comparison.previousC391={runId:46062887574,waterHits:1975,wideWaterHits:2077,triangles:2769,connectorTriangles:614,boundarySamples:624,above5cm:115,below5cm:3,maxAbsoluteGap:.3055625528097181};
 report.comparison.accepted=report.comparison.accepted&&boundary.maxAbsoluteGap<=.05&&boundary.missingTerrain===0;
 fs.writeFileSync(path.join(out,'before-after.json'),JSON.stringify(report.comparison,null,2));
 if(!boundary.samples.length||!boundary.samples.every(p=>Number.isFinite(p.gap)))throw Error('Invalid water boundary coverage');
 report.comparison.previousC39={waterHits:1962,wideWaterHits:2064,triangles:15598,connectorTriangles:3785,maxDitchDepth:.1062,suspendedBankSamples:12,maxSuspendedBankHeight:.2815};
 // Hide all body-level UI except the renderer canvas, only in this browser.
 const hud=await page.addStyleTag({content:'body > :not(canvas:first-child) { visibility: hidden !important; } body > canvas:first-child { visibility: visible !important; }'});
 report.hud=await page.evaluate(()=>({rendererVisible:document.body.firstElementChild?.tagName==='CANVAS'&&getComputedStyle(document.body.firstElementChild).visibility==='visible',visibleOverlays:[...document.body.children].filter(e=>e!==document.body.firstElementChild&&!['SCRIPT','STYLE','LINK'].includes(e.tagName)&&getComputedStyle(e).visibility==='visible'&&getComputedStyle(e).display!=='none').length}));
 if(!report.hud.rendererVisible||report.hud.visibleOverlays!==0)throw Error('HUD isolation failed');
 const expected=[['CAM-01',0,0,1.72,0,0],['CAM-02',0,0,1.72,-90,0],['CAM-03',0,0,1.72,180,0],['CAM-04',0,0,1.72,90,0],['CAM-05',0,0,60,0,-90],['CAM-06',30,30,Math.sqrt(1800),45,-45]];
 for(const [id,dx,dz,h,yaw,pitch] of expected){
 const c=await page.evaluate(id=>window.AFTERFALL_DIAGNOSTICS.setDiagnosticCamera(id),id);
 const error=Math.hypot(c.position.x-2725.93-dx,c.position.y-126.13055759548618-h,c.position.z-2751.93-dz);
 const filename='GEO-001_'+id+'.png';
 const b=await page.screenshot({path:path.join(out,filename),timeout:60000});
 const player=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.getPlayerPosition());
 report.cameras.push({...c,filename,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),positionError:error,passed:c.id===id&&error<=.001&&c.yaw===yaw&&c.pitch===pitch&&c.fov===73&&Math.abs(c.aspect-16/9)<.001&&b.readUInt32BE(16)===1600&&b.readUInt32BE(20)===900&&Math.hypot(player.x-2725.93,player.z-2751.93)<=.001});
 }
 await hud.evaluate(e=>e.remove());
 report.restoration=await page.evaluate(()=>{const a=window.AFTERFALL_DIAGNOSTICS;a.clearDiagnosticCamera();return {cleared:a.getDiagnosticCamera()===null,position:a.getPlayerPosition()};});
 report.uniqueImages=new Set(report.cameras.map(c=>c.sha256)).size;
 report.passed=report.wideProfiles.valid&&report.crossSections.valid&&report.geometry.valid&&report.httpStatus===200&&report.cameras.length===6&&report.cameras.every(c=>c.passed)&&report.uniqueImages===6&&report.restoration.cleared&&Math.hypot(report.restoration.position.x-2725.93,report.restoration.position.z-2751.93)<=.001&&report.errors.length===0;
 }catch(e){report.failure=String(e);if(page)await page.screenshot({path:path.join(out,'failure.png'),timeout:10000}).catch(()=>{});}
 finally{
 report.passed=report.passed&&report.errors.length===0;
 fs.writeFileSync(path.join(out,'camera-test.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(browser)await browser.close();
 server.close();
 if(!report.passed)process.exitCode=1;
 }
}
main().catch(e=>{console.error(e);process.exitCode=1});
