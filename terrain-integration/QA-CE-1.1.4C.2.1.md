# AFTERFALL CE 1.1.4C.2.1 – Ferdig lagerskur
Dato: 21. november 2026. Status: Implementert i utviklingsgrenen. Praktisk iPhone-test gjenstår.

## Godkjent hovedplan
C.2 er delt i fem faser: **C.2.1 lagerskur**, C.2.2 enkel hytte, C.2.3 åpent verksted, C.2.4 flere bygninger og C.2.5 integrasjonstesting. Bare C.2.1 er implementert nå. Opprinnelig liste over 12 konstruksjoner, C.3/C.4 og andre spillmekanikker er uendret.

## C.2.1 – Implementert
- Gjenbruker ferdigtegningen og det ferdig implementerte C.0-lageret. Ingen ny lagertype er skapt og ingen opprinnelige materialoppskrifter er endret.
- Materialer har fortsatt faktisk masse og volum. Lageret viser **brukt og ledig vekt/volum**, prosent, separate fremdriftsindikatorer og antall ressurstyper.
- `Legg inn maks` regner ut største gyldige overføringsmengde som fortsatt får plass (tidligere `Legg inn alt` kunne feile når lageret var nesten fullt).
- `Ta maks` regner ut største gyldige uttak innenfor **både** bæremasse 300 kg og inventarvolum 150 L.
- Heltallsressurser overføres i hele stykker; masser og kg-ressurser kan overføres med tre desimaler.
- Flere ferdige lagerskur innenfor 2,8 meter vises i en velger, sortert etter avstand. Kun ferdige bygg med lagerskurklassifisering blir alternativer. Lagerskur har separat ID og separat beholdning.
- Ressurser med innhold i lageret vises først; øvrige ressurser i inventaret sorteres etter navn.
- Alle overføringer går fortsatt gjennom den eksisterende `transferToStore`-valideringen og `worldSave(true)`. Ved lagringsfeil rulles inventar/lager tilbake.
- Det samme `buildingStores`-feltet benyttes i verdenssnapshot `version=2`. Gamle lagringer med og uten dette feltet leses videre uten migrering.

## Automatiske tester
- **32/32** i `verify-c21.html` for lagerskurgjenkjenning, maksimal overføring, vekt, volum, to uavhengige lagre, materialbevaring og lagringskompatibilitet.
- Hovedspillets ES-modulkode parses.
- Gamle regresjonstester og full byggeplan-rotasjonstesting kjøres separat.
- Ingen endringer i C.1, havnivå, terreng, veivalg, vær, mat, dører, kollisjon eller materialoppskrifter.

## Manuell godkjenning på iPhone – ikke bekreftet
- [ ] Bygg et ferdig lagerskur, gå innenfor 2,8 meter og åpne lageret.
- [ ] Kontroller separate indikatorer for vekt, volum og ledig plass.
- [ ] Legg inn noen planker. Brukt kapasitet skal stige nøyaktig, inventaret skal reduseres.
- [ ] Fyll nesten helt opp. `Legg inn maks` skal overføre det som faktisk får plass, i stedet for å avvise.
- [ ] Ta ut maksimalt antall, stopp ved 300 kg/150 L.
- [ ] Bygg et annet lagerskur og kontroller to uavhengige beholdninger. Dersom begge er nær Marcus, velg mellom dem i lagergrensesnittet.
- [ ] Lagre, last inn på nytt og kontroller alle materialene.
- [ ] Kontroller at hytte og verksted ikke vises som lagerskur.
- [ ] Kontroller at gamle C.1-konstruksjoner, havnivå 0 og nytt spill fortsatt fungerer.

## Avgrensninger
Ingen automatisk ressursfordeling mellom lagerskur, ingen teletransport av lagerinnhold, ingen nye produksjonsoppskrifter. Direkte materiellflytting mellom to lagerskur krever fortsatt at Marcus tar ut og bærer materialene.
