# AFTERFALL CE f.4.6.2C.3.4 – elv/fjellvann

## Implementert
- Oppretter en høyoppløst (maks 0,65 m mellom profilsnitt) sammenhengende utløpsstripe langs den eksisterende, rutede utløpspolylinjen fra fjellvann.
- Overgangsstripen starter 0,75 m innenfor eksisterende fjellvannsgrense og fortsetter 24 m nedstrøms. Vannhøyden interpoleres mellom innsjøens faktiske kote og eksisterende elvemesh.
- Utløpets terrengkorrigering velger samme senterlinje som stripen fremfor tilfeldig nærmeste elvestrekning.
- Geometrien klippes til chunk i globale koordinater og bruker samme terreng-LOD for høydekontroll som øvrige vannmesher.
- Diagnostikktellere: `connectorTriangles`, `connectorVertices`, `connectorMaxStageDelta`.

## Kontroll gjennomført
JavaScript-modulens kropp er syntakskontrollert, og commit er skrevet direkte til `construction-integration`.

## Tester som gjenstår før godkjenning
1. Bekreft at faktisk nettleser bygger og viser stripen i minst to fjellvannutløp.
2. Sammenlign før/etter skjermbilde fra samme posisjon, sjekk eventuelle overlapp/z-fighting.
3. Kjør 3D-meshtesten og sammenlign `alpineOutletWetGap`, `alpineMissing`, `alpineRiverOverlap` og `alpineOutletLevelDeviationMax`.
4. Inspiser chunkgrenser og LOD-overganger, særlig rundt utsiden av overgangsstripen.
5. Verifiser eldre planeringsprosjekter, graving/fylling, lagringer og bygninger. Hydrologisk ruting og lagringsformat er ikke bevisst endret.

**Begrensning:** Dette er en målrettet fjellvannutløpskorrigering. Ordinære hydrologiske innsjøer bruker fortsatt separat lake/river klipping. Nettleser/WebGL-test er ikke gjennomført fra dette verktøyet.
