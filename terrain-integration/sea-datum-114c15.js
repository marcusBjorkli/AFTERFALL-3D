// AFTERFALL CE 1.1.4C.1.5 – global vertical datum.
// World/render y is now absolute meters above ordinary mean sea level.
// Only wet seabed and other submerged ground may be below the sea surface.
export const SEA_LEVEL=0;
export const DRY_LAND_FLOOR=0.05;
export const RESET_MARKER='afterfall_ce114c15_ocean_datum_reset_v1';
export const RESET_VALUE='done';
export function normalizeDryGround(height,wet=false){
 if(!Number.isFinite(height))return null;
 return wet?height:Math.max(DRY_LAND_FLOOR,height);
}
export function limitDryCut(current,next,wet=false){
 if(!Number.isFinite(current)||!Number.isFinite(next))return null;
 if(wet||next>=DRY_LAND_FLOOR)return next;
 return current>DRY_LAND_FLOOR?DRY_LAND_FLOOR:null;
}
export function datumInvariant(height,wet=false){
 return Number.isFinite(height)&&(wet||height>=DRY_LAND_FLOOR-1e-7);
}
export const LEGACY_TEST_KEYS=Object.freeze([
 'afterfall_ce113_preview_player',
 'afterfall_ce113_preview_world',
 'afterfall_ce113_preview_world-previous-game',
 'afterfall_ce113_preview_inventory',
 'afterfall_ce113_preview_earth',
 'afterfall_ce113_preview_harvest',
 'ce113-preview-seed-206414',
 'ce113-preview-seed-206414-previous-game'
]);
