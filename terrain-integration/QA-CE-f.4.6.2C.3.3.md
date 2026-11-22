# AFTERFALL CE f.4.6.2C.3.3 – Alpine lake / river junction

## Scope
Focused correction in `terrain-integration/index.html`. Do not alter save-file formats, hydrology routing, construction, earthwork persistence, or unrelated gameplay.

## Changes
- Both the mountain-lake mesh and river mesh now use the same signed alpine lake-coverage field, including the same radial boundary and submerged terrain condition.
- Fix the outlet river water-height datum: the lake mesh uses `level + 0.045` in world-relative rendering coordinates, so the river outlet must use the same frame, rather than subtracting `PAD_H` a second time.
- Extend the outlet's blending reach from 16 m to 24 m and cover the final 8 m inside the lake shoreline.
- Increase local channel-bed correction from 0.38 m to 0.48 m for the outlet profile only.
- Update visible release identifier and diagnostic revision to C.3.3.

## Verification completed
- Read and modified the source on `construction-integration`, not the stale `main` branch.
- JavaScript syntax of the inline module passes parsing after removing static import declarations for a non-module syntax check.
- No browser/WebGL runtime verification has been performed.

## Browser acceptance tests (pending)
1. At multiple mountain-lake outlets, inspect the radius boundary at low and high camera elevation. There should be no abrupt raised wedge, separated water heights, or missing water polygons.
2. In Diagnostics, run the actual 3D mesh test. Compare `alpineOutletWetGap`, `alpineOutletLevelDeviationMax`, `alpineRiverOverlap` and `alpineMissing` against the C.3.2 baseline.
3. Repeat at chunk seams and different LODs, including mobile view.
4. Confirm that excavation/filling, grading projects, builds, saves, and lake levels remain unchanged.

Do not merge into the deployed branch until visual and geometry QA passes.
