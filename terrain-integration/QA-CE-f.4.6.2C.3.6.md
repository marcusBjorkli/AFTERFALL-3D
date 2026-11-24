# CE f.4.6.2C.3.6 — Utløpselv følger utskåret kanal

## Bakgrunn (24.11.2026)
Skjermbilde fra C.3.5 viser en synlig hevet elveflate som går over tørt terreng nær fjellvann ID 6 ved X ≈2725, Z ≈2751. Eksportert 8 m-rapport:
- Gyldig rapport: 441 av 441 punkter med lastet terreng.
- Fjellvann: 19 forventede / 19 synlige punkter, én marginal overlapp på 0,00724 m.
- 11 hydrologisk våte punkter uten vannmesh; 15 rapporterte elvepunkter uten vannmesh. Den gamle klassifiseringen brukte for bred elvekorridor, ikke faktisk vannmesh-bredde.
- Den nye `fineAlpineJunction` var *ikke til stede i eksportert JSON* og må kontrolleres i C.3.6.

## Kodeendringer (testgrenen `construction-integration`)
1. `alpineJunctionStage(q)`: vannstanden følger samme ruteprofil som utløpet, ikke et konstant tillegg til terrenget. Profilen går fra fjellvannets faste kote til den hydrologiske utløpskoten. Ved avslutningen brukes en 6 m overgang til opprinnelig elvemesh.
2. `alpineOutletTerrainCorrection()`: den **faktiske terrengmeshen** senkes mot én felles kanalbunn (mål 0,48 m under vannstanden), og en avtrappet banke bygges langs våt kant. Korrigeringen er begrenset til utløpssonen og stopper ved beskyttede bygg, prosjekter og lagrede terrengredigeringer.
3. `emitConnector()`: vannpolygonene klippes mot både samme terrengvifte og en faktisk våt halvbredderegel på 72 % av tidligere korridorbredden. Ingen brede vannrektangler skal tegnes over tørt land.
4. Tverrsnitt er underdelt i fire bånd, inkludert en samplbar senterlinje. Dette er nødvendig fordi hjørnebasert polygonklipping ellers kan forkaste hele et bredt triangel når begge ytterhjørnene ligger på land.
5. Overgangsmeshen overlapper den eksisterende elven med 1 m etter radius 50 m, med marginal (<=6 mm) høydedifferanse som elimineres ved ytterkanten.
6. QA: nytt felt `suspendedBankSamples` og `maxSuspendedBankHeight` i `fineAlpineJunction` for mulig svevende vann langs kantene. Tolkningen av forventet elv i den gamle 8 m-målingen følger nå den faktiske elvebredden, ikke hele erosjonskorridoren.

## Verifisering
- Inline JavaScript er syntaktisk kontrollert etter at statiske ES-modulimporter ble utelatt fra isolert parse.
- Syntetiske profilenhetstester bestått: innløp matcher innsjøkote +0,045 m, uttak ved 50 m matcher eldre elv, kanal kuttes, ytterbank kan heves, og korrigering avtar til null ved utløpets ende.
- Ingen nettleser-/WebGL-integrasjonstest er kjørt gjennom denne tilkoblingen, og ingen testdata er slettet.

## Praktisk akseptansetesting
1. Kontroller synlig versjon C.3.6 og besøk X 2725,12 / Z 2750,89 (frø 206414).
2. Vurder høyden til elven og om den synlige vannrektangelen over tørt land har forsvunnet.
3. **Meny → Diagnose → Mål ekte 3D-mesher → Last ned 3D-rapport.**
4. Kontroller at `meshGeometryTests[0].fineAlpineJunction` finnes og `valid=true`, helst med `alpineId=6`.
5. Rapporter alle koordinatfestede feil av type `suspended-water-bank`, `missing-water`, `water-level-mismatch` og `terrain-in-water`.
6. Sammenlign ved Z=2752 (chunkgrense), og kontroller at opprettede bygg, planering, verktøy, lagringer og elver utenfor fjellvannutløp virker som før.

**Status:** implementert som ny testversjon, geometrisk kvalitet i nettleser ikke bekreftet.
