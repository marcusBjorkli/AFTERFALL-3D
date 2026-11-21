// AFTERFALL CE 1.1.4C.1.4.2 – independent save slots.
// The existing world snapshot schema (version 2) is preserved.
export const SLOT_FORMAT='afterfall.world-slot.v1';
export function freshWorldSnapshot(seed){
 if(!Number.isInteger(seed))throw Error('Ugyldig verdensfrø.');
 return {
  version:2,seed,heightDatum:'sea-level-zero-v1',revision:0,edits:[],layers:[],slideMass:[],inventory:{selectedTool:'shovel',items:{}},
  harvested:[],treeRegrowth:[],rock:[],piles:[],pileSequence:0,constructionPlans:[],
  openConstructionDoors:[],buildingStores:[],smallStructures:[],terrainMode:{enabled:false,locked:false,target:null},
  survivalNeeds:{hunger:100,warmth:100,torchUntil:0},gradingProjects:[],activeGradeId:null,sawStations:[]
 };
}
export function freshPlayerCheckpoint(seed){
 return {version:557,seed,x:288,z:301,yaw:Math.PI,pitch:0,seconds:0,weatherElapsed:1800};
}
export function playerCheckpoint(seed,player,weatherElapsed=1800){
 const clean={...freshPlayerCheckpoint(seed)};
 for(const key of ['x','z','yaw','pitch','seconds'])if(Number.isFinite(player?.[key]))clean[key]=player[key];
 if(Number.isFinite(weatherElapsed)&&weatherElapsed>=0)clean.weatherElapsed=weatherElapsed;
 return clean;
}
export function makeSlot(world,player,date=Date.now()){
 if(!world||![1,2].includes(world.version)||!Number.isInteger(world.seed))throw Error('Ugyldig spillverden.');
 if(!player||player.seed!==world.seed||!Number.isFinite(player.x)||!Number.isFinite(player.z))throw Error('Ugyldig spillerposisjon.');
 return {format:SLOT_FORMAT,createdAt:date,seed:world.seed,world,player};
}
export function validSlot(slot,seed){
 return !!slot&&slot.format===SLOT_FORMAT&&slot.seed===seed&&slot.world?.seed===seed&&
  [1,2].includes(slot.world.version)&&slot.player?.seed===seed&&Number.isFinite(slot.player.x)&&
  Number.isFinite(slot.player.z)&&slot.player.x>0&&slot.player.z>0;
}
