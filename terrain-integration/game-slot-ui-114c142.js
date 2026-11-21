// AFTERFALL CE 1.1.4C.1.4.2 – reversible menu action for two world saves.
// Depends on the existing snapshot and database functions, supplied by the game.
import {freshWorldSnapshot,freshPlayerCheckpoint,playerCheckpoint,makeSlot,validSlot} from './game-slots-114c142.js';
export function installGameSlots(ctx){
 const $=id=>document.getElementById(id);
 let action=null,busy=false,checking=false;
 async function otherSlot(){
  let slot=null;
  const database=ctx.getDB();
  if(database)slot=await ctx.readDB(database,ctx.otherKey);
  if(slot==null){
   const raw=localStorage.getItem(ctx.otherFallback);
   if(raw)slot=JSON.parse(raw);
  }
  return slot;
 }
 async function refresh(){
  if(busy||checking)return;
  checking=true;
  try{
   const other=await otherSlot(),valid=validSlot(other,ctx.seed);
   $('newGame').disabled=other!==null;
   $('switchGame').disabled=!valid;
   $('saveSlotStatus').textContent=valid
    ?'To spillverdener finnes. «Bytt til forrige spill» bevarer også den nåværende verdenen.'
    :other!==null
     ?'En sikkerhetskopi finnes, men kan ikke åpnes. «Nytt spill» er sperret for å beskytte den.'
     :'Én spillverden. «Nytt spill» tar sikkerhetskopi før du starter på nytt.';
  }catch(e){
   $('newGame').disabled=true;$('switchGame').disabled=true;
   $('saveSlotStatus').textContent='Lagringene kan ikke kontrolleres: '+e.message;
  }finally{checking=false}
 }
 function close(){
  if(busy)return;
  $('newGameDialog').hidden=true;action=null;
 }
 function open(next){
  if(busy||!['new','switch'].includes(next))return;
  action=next;
  $('newGameTitle').textContent=next==='new'?'🌱 Start nytt spill?':'↔ Bytt spillverden?';
  $('newGameDescription').textContent=next==='new'
   ?'Marcus starter på nytt med tomt inventar og ubebygd terreng. Den eksisterende verdenen, bygningene og ressursene sikkerhetskopieres og kan gjenopprettes fra spillmenyen.'
   :'Den andre spillverdenen åpnes. Den du spiller nå, lagres samtidig i den andre plassen. Du kan bytte tilbake senere.';
  $('newGameConfirm').textContent=next==='new'?'Ja, start nytt spill':'Ja, bytt verden';
  $('newGameFeedback').textContent='';
  $('newGameDialog').hidden=false;
  $('newGameCancel').focus();
 }
 async function confirm(){
  if(busy||!['new','switch'].includes(action))return;
  busy=true;$('newGameConfirm').disabled=true;$('newGameCancel').disabled=true;
  $('newGameFeedback').textContent='Sikrer spillverdener …';
  try{
   const previous=await otherSlot();
   if(action==='new'&&previous!==null)throw Error('Det finnes allerede to verdener. Bytt til forrige spill i stedet.');
   if(action==='switch'&&!validSlot(previous,ctx.seed))throw Error('Den forrige verdenen kan ikke leses.');
   await ctx.saveWorld(true);await ctx.waitSaves();
   const current=makeSlot(ctx.getWorldSnapshot(),playerCheckpoint(ctx.seed,ctx.getPlayer(),ctx.getWeatherElapsed()));
   const target=action==='new'?makeSlot(freshWorldSnapshot(ctx.seed),freshPlayerCheckpoint(ctx.seed)):previous;
   if(!validSlot(current,ctx.seed)||!validSlot(target,ctx.seed))throw Error('Kunne ikke validere spillverdensdata.');
   const database=ctx.getDB();
   if(database){
    const prior=localStorage.getItem(ctx.playerKey);
    localStorage.setItem(ctx.playerKey,JSON.stringify(target.player));
    try{await ctx.writePairDB(database,target.world,current)}
    catch(e){
     try{if(prior===null)localStorage.removeItem(ctx.playerKey);else localStorage.setItem(ctx.playerKey,prior)}catch(rollback){console.error('Spillerposisjon kunne ikke tilbakeføres',rollback)}
     throw e;
    }
    // Refresh fallback without risking the successful IndexedDB transaction.
    try{localStorage.setItem(ctx.mainFallback,JSON.stringify(target.world))}
    catch(e){try{localStorage.removeItem(ctx.mainFallback)}catch(_){}console.warn('Fallback ikke skrevet',e)}
    try{localStorage.removeItem(ctx.otherFallback)}catch(e){console.warn('Utdatert alternativ lagring',e)}
   }else{
    ctx.writePairFallback(target.world,current,target.player);
   }
   $('newGameFeedback').textContent='Begge spillverdener er lagret. Åpner valgt verden …';
   ctx.reload();
  }catch(e){
   $('newGameFeedback').textContent='Kunne ikke bytte spillverden: '+e.message+'\nIngen lagrede spillverdener skal være slettet.';
   busy=false;$('newGameConfirm').disabled=false;$('newGameCancel').disabled=false;
   refresh();
  }
 }
 $('newGame').onclick=()=>open('new');
 $('switchGame').onclick=()=>open('switch');
 $('newGameCancel').onclick=close;
 $('newGameConfirm').onclick=confirm;
 return {refresh,close,open,confirm};
}
