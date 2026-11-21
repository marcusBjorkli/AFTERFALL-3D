# AFTERFALL CE 1.1.4C.1.5 – Endelig havnivå og engangsreset
Dato: 21. november 2026
Status: Implementert i GitHub. Automatisk testet; praktisk iPhone-test gjenstår.

## 1.5.1 – Fysisk havreferanse
- `SEA_LEVEL = 0` er fysisk og synlig 0,00 m på havoverflaten. `PAD_BASE = rawHeight(288,283)` bevarer det opprinnelige startområdets topografi (ca. 46,98 moh.).
- Tidligere `PAD_H` var lik startområdets høyde og ble trukket fra `ground()`. Nå settes PAD_H til 0. Alle høydeutregninger for terreng, vann og bygg bruker dermed ett felles datumsystem.
- Spillverdenens koteverdier er **fiktiv ordinær havflate**, ikke norske NN2000.

## 1.5.2 – Strandlinje, tørt land og sjøbunn
- Tørt land har minimum kote +0,05 m. `drySurfaceAt` beholder negative høyder bare ved hav-, innsjø- eller faktisk undervanns elveprofil.
- Rent numeriske 4 km × 4 km stikkprøver (32 m mellomrom) ga 16 641 punkter, 0 under den tørre minimumskoten i en deterministisk test med syntetisk vannklassifisering, og 2 743 negative punkter i sjøområdet. Klassifiseringen i faktisk spill styres av full hydrologimodell, ikke denne testforenklingen.
- Sjøbunn løftes ikke. Dagens hydrologi, vannpolygonklipping og elvebånd videreføres. Kystgeometri skal manuelt kontrolleres på mobil.

## 1.5.3 – Grave-/fyllesystem, planering og bygg
- Direkte gravehandlinger og ras-/massestabilisering kan ikke kutte tørt land under +0,05 m; beregnet massebevegelse reduseres ved grensen.
- Ved graving under vann bevares de negative koteverdiene.
- Graving, fylling, målkotelås, kotevisning, planeringsprosjekter, terrengmasker, konstruksjonseditor, byggesystem og kollisjon benytter samme fysiske høydefunksjon.
- Tidligere farger for terrengets høydebånd ble bevart ved å bruke opprinnelig visuell referanse i fargeberegningen, uten å endre ny fysisk kote.
- Ingen nye konstruksjoner, materialoppskrifter eller overlevelsesmekanikker ble lagt til.

## 1.5.4 – Engangssletting av testprogresjon
- Ved første C.1.5-oppstart kontrolleres `afterfall_ce114c15_ocean_datum_reset_v1`.
- Mangler ferdigmarkør, slettes de to lagringspostene `ce113-preview-seed-206414` og tilhørende «previous-game» fra IndexedDB (database: `AFTERFALL_3D_WORLD`, objectStore `world`).
- I tillegg slettes **åtte navngitte localStorage-nøkler** som tilhører den nåværende 3D-testverdenen (spillposisjon, fallbackverden, forrige verden, inventar, jordarbeid, trehøsting, samt eventuelle tilsvarende seed-nøkler).
- Kun disse nøklene berøres. Ingen kildekode, Git-historikk eller andre prosjekter endres.
- Markøren settes til `done` **etter** vellykket sletting; avbrutt sletting kan forsøkes igjen. Etter ferdig reset foretas ikke ny automatisk sletting.
- Den nye lagringsverdenen starter med 0 byggeplaner, 0 planeringsprosjekter, 0 småbygg, 0 masselagre, tomt inventar og Marcus ved X 288 / Z 301. Verdensfrø: 206414.
- Formatversjon 2 videreføres, og `heightDatum: "sea-level-zero-v1"` følger nye snapshots.
- **Viktig:** GitHub kan ikke fjerne lokal nettleserlagring fra brukerens iPhone; slettingen kjøres først ved faktisk åpning av den publiserte versjonen på samme enhet og nettleser.

## 1.5.5 – Integrasjon og testing
- 26/26 tester bestått i `verify-c15.html`: havnivå, minimum høyde tørt land, negative sjøbunnshøyder, gravegrense, tomme nye verdener, lagringsformat, terrengmåling og byggested.
- Separat end-to-end regresjonstest av **den faktiske resetfunksjonen** med en simuleringsdatabase og localStorage: alle angitte gamle lagringer fjernet, uvedkommende nøkkel bevart, gjentatt reset gjorde ingenting.
- Kompilering/parsing av komplett modulscript gjennomført.
- Eksisterende C.1-, C.1.3- og C.1.4-regresjonssett skal også kjøres før ferdigstillelse.

## Akseptansetest på iPhone (ikke gjennomført)
- [ ] Første oppstart: gammel verden og forrige spilleplass er tomme; Marcus starter på X 288 / Z 301.
- [ ] Spilleren står på ca. kote +46,98 m ved start, ikke kote 0.
- [ ] Høyderutenettet, koter i Planering og målkote-sikting viser samme havreferanse.
- [ ] Kysten: sjøoverflaten er 0,00 m; alle tørre strandpunkter er >0; negativ sjøbunn forblir under vann.
- [ ] Elver og innsjøer har konsistente vannspeil og dekker de tilsiktede polygonene uten sjakter, hull eller z-fighting.
- [ ] Grav/fyll med lås både over havnivå og ved kysten. Ingen gravetrinn under +0,05 m på tørt land.
- [ ] Opprett automatisk planert byggeflate og bygg lagerskur; test kollisjon, dør, materiallevering, lagring.
- [ ] Start nytt spill, bytt lagringsplass og kontroller at fremtidige nye spill ikke slettes av engangsreset.
- [ ] Kontroller iPhone-ytelse ved kysten, i terrenggrid og ved lange økter.
