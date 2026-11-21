# AFTERFALL CE 1.1.4C.0 – Lagerfunksjonalitet og migrering
Implementert 21. november 2026.

## Funksjoner
- Gjenkjenner **ferdige** lagerskur også i tidligere B.5/B.6-lagringer. Opprinnelig ferdigtegning med 11 moduler og navngitte lager-/skurbygninger med gulv, dør og tak støttes.
- Åpne lager fra kontekstknappen inntil 2,8 m fra selve bygningens omriss, ikke hele byggeplassen.
- Beholder opptil **12,6 m³ og 14 400 kg** i standard lagerskur 3 × 3 m. Større skur skalerer innenfor faste grenser.
- Innlevering og uttak, «Legg inn alt» og «Ta maks». Ressursmengder, spillinventar og lagerkapasitet kontrolleres i samme overføring.
- Separat lagringsbeholdning per byggeplan-ID. Andre skur får ikke automatisk samme ressurser.
- Eksisterende planeringsdata, ferdigmonterte byggekomponenter, ressursinventar, fysiske hauger, tremodning, dørstatus og resten av verdenslagringen forblir urørt.
- Lagret som frivillig tilleggsfelt `buildingStores` i eksisterende verdenssnapshot (versjon 2). Fraværende felt tolkes som tomme lagre – ingen gamle lagringsfiler trenger konvertering.
- Hvis en overføring ikke kan lagres, settes inventar og lager tilbake til tilstanden før overføringen.

## Automatiserte tester
- 12 ferdigtegninger/rotasjoner validert: 4 lagerskur identifiseres, 4 hytter og 4 verksteder identifiseres ikke som lagerskur.
- Eksisterende ferdigbygget 11-modulers lagerskur fungerer uten ny montering.
- Inn-/uttak, ledig bærekapasitet, full lagerkapasitet, ugyldige/fraksjonerte treenheter og tilstrekkelige ressurser.
- Separate lagre, serialisering og gjenoppretting i nytt verdensfelt.
- Parsing av hovedspillets og editorens ES-modulkode og egen testside.

## Manuell test på iPhone (gjenstår)
- [ ] Åpne et eldre lagret Lagerskur med 11/11 moduler, gå inntil veggen eller inn gjennom døren og se «📦 Åpne lager».
- [ ] Legg inn f.eks. 5 planker og 1 tømmer, og kontroller at inventaret reduseres nøyaktig.
- [ ] Lagre/oppdater nettleseren. Kontrollér at samme materialmengder finnes i skuret.
- [ ] Ta ut igjen; test at bærekapasiteten 300 kg / 150 L aldri overskrides.
- [ ] Bygg et annet lagerskur og bekreft at de to lagrene er uavhengige.
- [ ] Test nærhet: ingen lagerknapp utenfor 2,8 m fra skuret.
- [ ] Prøv å fylle lageret utover 12,6 m³ / 14,4 tonn; overføringen skal avvises.
- [ ] Kontroller at B.6-ferdigskuret står på samme sted, kollisjon og dør fungerer, og byggeprogresjon og gamle materialhauger er uendret.

## Avgrensninger
Ingen 3D-rendering av hver enkelt lagret planke inne i skuret; lagring håndteres av et UI. Ingen funksjonalitet for bålplass, lagringskasse, smie osv. – disse er planlagt i CE 1.1.4C.1–C.4.
