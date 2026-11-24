# AFTERFALL CE f.4.6.2C.3.5 – fjellvann/elv, faktisk geometri

## Diagnostisk utgangspunkt
Kilde: brukerens 3D-meshrapport `afterfall-f462c34-utlop-2026-11-24.json` (24. november 2026).
Verdensfrø **206414**, spiller **X 2721,27 / Z 2759,07**, fjellvann **ID 6**, chunk **42,43**, innsjøkote **+126,713243 m**.

| Måling C.3.4 | Verdi |
|---|---:|
| Lastede punkter i 8 m nett | 441/441 |
| Forventet elvevann uten synlig elvemesh | 5 |
| Fjellvann: forventet / synlig | 16 / 16 |
| Fjellvannutløp kontrollpunkter / hull | 2 / 0 |
| Maksimalt avvik mot tidligere beregnet utløpsprofil | 0,405 m |
| Ekstra overgangstriangler / vertices | 104 / 299 |

**Viktig:** 0,405 m var avvik fra en eldre forventningsberegning; et nytt felles høydesystem krever ny direkte sammenligning. Ingen C.3.5-resultater fra faktisk WebGL er ennå målt.

## Endret kode i C.3.5
- Ett felles `alpineOutletWaterHeight()` for **begge** overgangsmeshene. Verdien er identisk med innsjøens plane vannflate ved radius 26 m og med eksisterende elv ved 50 m.
- Utløpsbredden utvides ved innsjømunningen og avtar gradvis nedstrøms; både utskåret bunn og overgangsmeshen bruker den samme `alpineJunctionWidth()`.
- `alpineOutletTerrainCorrection()` kutter den virkelige terrengmeshen (aldri en separat terrengplate) med myk avtrapping. Den **hever ikke naturlig terreng** i en kunstig ring, og avstår ved lagrede grav-/fyllpunkter og byggeprosjekter.
- Eksisterende elvetriangler fra samme fjellvann klippes ut innen radius 50 m før overgangsmeshen genereres. En kort (0,75 m) overlapp ved innsjøen dekkes med 8 mm høydeforskjell for å hindre z-fighting. Utenfor radius 50 m møtes overgang og ordinær elv ved samme vannhøyde.
- Nye delte normaler for tilstøtende tverrsnitt i knekkpunktene minimerer åpne trekantkiler.
- Fjellvann med for korte registrerte utløp bruker tidligere geometri; denne korreksjonen endrer ikke rutingen i hydrologirasteret.
- Ingen endring i lagringsformat, vannruting, anleggseditor, byggesystem eller overlevelsesfunksjoner er tilsiktet.

## Ny målbar kontroll
`shoreMeshQa()` legger nå til `fineAlpineJunction` i JSON-rapporten:
- 1 meters prøver langs/over nærmeste fjellvannutløp.
- Raycasting mot faktiske lastede land-, elve- og fjellvannmesher.
- Teller: `wetExpected`, `missingWater`, `terrainIntrusion`, `heightMismatch`, `multipleRiverStages`, `lakeRiverOverlaps` og `chunkSeamSamples`.
- Inntil 120 koordinatfestede anomalier i `anomalies` med x/z, forventet/målt kote og gjeldende chunk.

Denne finmålingen gjelder bare nærmeste utløp innen 110 meter; er det intet aktuelt utløp, returneres en eksplisitt `valid:false` med forklaring. Gamle 8 m-målinger beholdes for sammenligning. Beskyttede lagrede terrengpunkter utelates fra forventet vann-dekning.

## Verifisering
- `construction-integration` oppdatert.
- JavaScript syntaktisk kontrollert.
- Enhetskontroll av faktisk høydesfunksjon: innsjøleppen matcher innsjøkoten +0,045 m, nedstrøms ende matcher ordinær elv, terrengkorrigering kutter bare og fader til null.

## Gjenstående akseptansetester i mobil-/PC-nettleser
1. Åpne C.3.5 ved frø 206414 og X 2721,27 / Z 2759,07. Sjekk om sandterrassene og kileformen er redusert.
2. Velg **Meny → Diagnose → Mål ekte 3D-mesher → Last ned 3D-rapport**.
3. Kontrollér `fineAlpineJunction.valid===true` og `alpineId===6` før øvrige tall tolkes.
4. Gjennomgå koordinater med `missing-water`, `water-level-mismatch`, `terrain-in-water`, `duplicate-river-stages`.
5. Test ved radial ~26 m og ~50 m, på chunkgrensen Z=2752 og på forskjellige LOD-nivåer.
6. Kontroller tidligere graving/fylling, prosjekter og bygninger. Ingen lokal lagring skal slettes av versjonsbyttet.

**Status:** Klar for visuell test. WebGL/brukertest er ennå ikke verifisert.
