// AFTERFALL CE 1.1.4C.2.1 – storehouse user-experience logic.
// Extends C.0 storage without changing saves, build recipes or inventory rules.
import {storeCapacity,resourceTotals,validateStoreItems} from './construction-storage-114c0.js';
const EPS=1e-7;
const asPercent=(used,capacity)=>Math.max(0,Math.min(100,capacity>0?Math.round(used/capacity*1000)/10:0));
const positive=n=>Number.isFinite(n)&&n>=0;
export function storehouseOverview({plan,stored,catalog}){
 const verified=validateStoreItems(stored,plan,catalog);
 if(verified.error)return {error:verified.error};
 const totals=resourceTotals(verified.items,catalog);
 if(totals.error)return {error:totals.error};
 const capacity=storeCapacity(plan),entries=Object.values(verified.items).filter(n=>n>0).length;
 return {
  mass:totals.mass,volume:totals.volume,
  massCapacity:capacity.mass,volumeCapacity:capacity.volume,
  massRemaining:Math.max(0,capacity.mass-totals.mass),
  volumeRemaining:Math.max(0,capacity.volume-totals.volume),
  massPercent:asPercent(totals.mass,capacity.mass),
  volumePercent:asPercent(totals.volume,capacity.volume),entries
 };
}
export function maxStoreTransfer({inventory,stored,resource,direction,plan,catalog,inventoryLimit}){
 const meta=catalog?.[resource];
 if(!meta||!['deposit','withdraw'].includes(direction)||!positive(meta.mass)||!positive(meta.volume)||(!meta.mass&&!meta.volume))return 0;
 const verified=validateStoreItems(stored,plan,catalog);
 if(verified.error)return 0;
 const carried=resourceTotals(inventory,catalog),saved=resourceTotals(verified.items,catalog);
 if(carried.error||saved.error)return 0;
 const cap=storeCapacity(plan);
 const limits=direction==='deposit'
 ? {items:inventory,used:saved,maxMass:cap.mass,maxVolume:cap.volume}
 : {items:verified.items,used:carried,maxMass:inventoryLimit?.mass,maxVolume:inventoryLimit?.volume};
 if(!positive(limits.maxMass)||!positive(limits.maxVolume))return 0;
 const available=limits.items?.[resource]||0;
 if(!positive(available)||!available)return 0;
 const roomMass=meta.mass>0?Math.max(0,(limits.maxMass-limits.used.mass)/meta.mass):Infinity;
 const roomVolume=meta.volume>0?Math.max(0,(limits.maxVolume-limits.used.volume)/meta.volume):Infinity;
 const max=Math.min(available,roomMass,roomVolume);
 if(!Number.isFinite(max)||max<=EPS)return 0;
 // transferToStore requires integer pieces or 3-decimal bulk quantities.
 const units=meta.unit==='stk'?1:1000;
 const whole=Math.floor((max+EPS)*units)/units;
 return Math.max(0,Math.min(whole,Math.floor((available+EPS)*units)/units));
}
export function storehouseList(plans,x,z,distanceToStorehouse,limit=2.8){
 if(!Number.isFinite(x)||!Number.isFinite(z))return [];
 return [...plans.values()]
 .filter(p=>p?.status==='complete')
 .map(plan=>({plan,distance:distanceToStorehouse(plan,x,z)}))
 .filter(p=>Number.isFinite(p.distance)&&p.distance<=limit+EPS)
 .sort((a,b)=>a.distance-b.distance||String(a.plan.planId).localeCompare(String(b.plan.planId)));
}
