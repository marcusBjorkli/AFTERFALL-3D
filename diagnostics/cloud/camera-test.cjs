const {chromium}=require('playwright');
const fs=require('node:fs');
const crypto=require('node:crypto');
const http=require('node:http');
const path=require('node:path');
const root=process.cwd(), out=path.join(root,'diagnostic-output');
fs.mkdirSync(out,{recursive:true});
const report={bridgeVersion:'DB 0.3M.3',testId:'CAM-001',timestamp:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,passed:false,cameras:[],errors:[]};
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
 if(s.revision!=='f.4.6.2C.3.7'||s.seed!==206414||Math.hypot(s.position.x-2725.93,s.position.z-2751.93)>.001||!s.terrain.ready||s.terrain.activeChunks!==49)throw Error('Invalid GEO-001 setup');
 // Measure real loaded geometry before changing the visual presentation.
 const mesh=await page.evaluate(()=>window.AFTERFALL_DIAGNOSTICS.runMeshTest());
 fs.writeFileSync(path.join(out,'geometry-report.json'),JSON.stringify(mesh,null,2));
 const c=mesh.counters||{}, fine=mesh.fineAlpineJunction||{};
 const required=['dryClassifiedWithWater','classifiedWetWithoutWater','multipleWaterTypes','terrainRayMiss','alpineMissing','alpineFalseWet','alpineOutletWetGap','riverExpectedWithoutMesh','riverBankBelowWater'];
 const valid=mesh.valid===true&&mesh.revision===s.revision&&Math.hypot(mesh.center.x-2725.93,mesh.center.z-2751.93)<=.001&&mesh.radius===96&&mesh.step===8&&c.samplePoints===441&&c.loaded===441&&c.unloaded===0&&mesh.preflight?.playerChunkFound===true&&required.every(k=>Number.isFinite(c[k]))&&Number.isFinite(fine.suspendedBankSamples)&&Number.isFinite(fine.maxSuspendedBankHeight);
 const findings=Object.fromEntries(required.map(k=>[k,c[k]]));
 findings.suspendedBankSamples=fine.suspendedBankSamples;
 findings.maxSuspendedBankHeight=fine.maxSuspendedBankHeight;
 report.geometry={testId:'MESH-001',valid,findings,geometryClean:valid&&Object.values(findings).every(v=>v===0),file:'geometry-report.json'};
 if(!valid)throw Error('Invalid or incomplete geometry report');
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
 report.passed=report.geometry.valid&&report.httpStatus===200&&report.cameras.length===6&&report.cameras.every(c=>c.passed)&&report.uniqueImages===6&&report.restoration.cleared&&Math.hypot(report.restoration.position.x-2725.93,report.restoration.position.z-2751.93)<=.001&&report.errors.length===0;
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
