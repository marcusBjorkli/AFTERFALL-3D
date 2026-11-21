# AFTERFALL – godkjent konstruksjonsplan CE 1.1.4C
Dato: 20. november 2026 · Status: **C.0–C.1.4 implementert; C.2–C.4 planlagt**

## CE 1.1.4C.0 – Grunnleggende bygningsinteraksjon og lagring
**Implementert 21. november 2026.** Eksisterende ferdige lagerskur har nå et interaktivt lager som kan fylles fra inventaret og tømmes tilbake til inventaret. Innholdet lagres per byggeplan og eksisterende B.6-spilltilstand leses videre uten migrering av verdens-/inventarformat. Dette er en funksjonalitetsfase før nye C.1-konstruksjoner.

## CE 1.1.4C.1 – Grunnleggende overlevelseskonstruksjoner
**Implementert 21. november 2026.** Fem småkonstruksjoner kan plasseres direkte i terrenget med reelt materialforbruk: bålplass, lagringskasse, arbeidsbenk, sagbukk og vedskjul.

Spillfunksjoner: bålvarme, vedforbruk og tørking av bær; to fysiske lagringskonstruksjoner med ulike kapasiteter; arbeidsbenk med oppskrifter for fakkel og trepinner; sagbukk med effektiv satsvis saging og støtte for eldre lagringsfiler. Busker gir bær og vokser tilbake etter 15 minutter. Enkle målere for matmetthet og varme, samt bærspising og fakkelbelysning, inngår som første trinn i overlevelsessystemet.

## CE 1.1.4C.1.2 – Godkjent småbyggplassering (forbedring etter C.1)
Implementert 21. november 2026. Nye småbygg må nå plasseres **innenfor én ferdig godkjent planeringsflate**, med hele byggeavtrykket innenfor området og kontroll av terrengkote, vann, tidligere bygninger, ressurslager og spilleren. Spilleren velger plass ved å sikte på terrenget, ser nøyaktig forhåndsvisning (grønn/rød), roterer med 5° skyveknapp eller 15°-knapper og bekrefter separat. Dette gjelder bålplass, lagringskasse, arbeidsbenk, sagbukk og vedskjul. Eksisterende småbygg og lagringsfiler beholdes uten ombygging.

## CE 1.1.4C.1.3 – Gjenbruk og utvidelse av planert terreng
**Implementert 21. november 2026.** Småbygg valideres mot faktisk flat kote og fysisk kollisjon; registrert prosjekttilknytning er ikke lenger et krav. Ledig del av en tomt med ferdig bygg kan gjenbrukes. Planering → «Utvid valgt område» oppretter et selvstendig tilstøtende felt på samme kote, med felles grense og referanse til originaltomten. Opprinnelig byggeplan, lagerskur, inventar og lagringsfiler endres ikke. Eksisterende småbygg beholder posisjon og retning.

## CE 1.1.4C.1.4 – Høyderutenett og automatisk planering
**Implementert 21. november 2026.** Spaden har dynamisk 1 × 1 m høydemodus som følger terrenget, med lokale koteetiketter og fargekodet høydeforskjell (grønn = flat/på kote, oransje = grave, blå = fylle). Siktekote kan hentes fra terrenget opptil 42 m unna. Valgfri målkotelås hindrer direkte graving, fylling og lokal masseutjevning i å gå forbi valgt kote. Prosjektfrie gravetrinn bruker eksisterende materialregnskap og terrenglagring.

Sammenhengende plane terrengnoder registreres løpende uten å opprette et prosjekt. Nye store bygg kan prosjekteres på en fysisk flat, egnet byggeflate på minst 3 × 3 m. Automatisk byggegrunn på inntil 20 × 20 m er kun en midlertidig kandidat inntil byggeplanen godkjennes; da opprettes en kompatibel automatisk reservert tomt. Småbygg benytter fortsatt fysisk kontroll av sin egen byggeflate. Manuell prosjektbasert planering beholdes som valgfritt verktøy.

Gammel terrengmodell, høydenett, masser, trær, konstruksjoner, lagringsformater og planeringsprosjekter er beholdt.

## Utviklingsrekkefølge
CE 1.1.4B.6: Samlet integrasjon og spilltesting av allerede eksisterende konstruksjonssystem (**implementert**).
CE 1.1.4C.0: Grunnleggende bygningsinteraksjon og lager for ferdige lagerskur (**implementert**).
CE 1.1.4C.1: Grunnleggende førindustrielle overlevelseskonstruksjoner (**implementert**).
Deretter CE 1.1.4C.2–C.4 med de **12 tidligere avtalte** førindustrielle konstruksjonene. Ikke erstatt listen uten en ny eksplisitt beslutning.

| Fase | Konstruksjon | Opprinnelig materialgrunnlag | Spillfunksjon / utviklingsmål | Eksisterende funksjoner |
|---|---|---|---|---|
| C.1 | Bålplass | Stein, ved | Varme og matlaging | Ny |
| C.1 | Lagringskasse | Planker, lekter | Ressurslagring | Ny |
| C.1 | Arbeidsbenk | Tømmer, planker | Håndverk og oppskrifter | Ny |
| C.1 | Sagbukk | Tømmer, lekter | Trebearbeiding | Enkel sagbukk finnes allerede |
| C.1 | Vedskjul | Tømmer, planker | Oppbevaring av ved | Ny |
| C.2 | Lagerskur | Stein, tømmer, planker, lekter | Materiallagring | Ferdigtegning finnes |
| C.2 | Enkel hytte | Stein, tømmer, planker, lekter | Opphold og ly | Ferdigtegning finnes |
| C.2 | Åpent verksted | Stein, tømmer, planker | Produksjonsområde | Verksted-ferdigtegning finnes; åpen variant gjenstår |
| C.3 | Leireovn | Stein, leire, sand | Keramikk / varmebehandling | Ny |
| C.3 | Kullmile | Ved, jord | Trekullproduksjon | Ny |
| C.4 | Jernvinneovn | Stein, leire, sand | Jernutvinning (krever jernmalm som innsats) | Ny |
| C.4 | Smie | Stein, leire, tømmer, planker | Metallbearbeiding | Ny |

Materialene er konstruksjonsgrunnlag fra den godkjente listen. Brensel og innsatsråvarer til drift legges til separat når produksjonssystemene utvikles.

## Godkjente spilldesignprinsipper
1. Førindustriell overlevelse, ikke en BIM-kalkulator. Materialbehov skal være begripelig i spillet; skjulte interne volum- og geometritall kan sikre konsistens.
2. Spilleren kan velge **ferdigtegning** eller **fri modulbygging** for bygninger som egner seg til det. Små konstruksjoner kan plasseres raskere uten full prosjekteringsprosess.
3. Eksisterende terreng, godkjent planering for større bygg, fysisk materialinnsamling, transport og gradvis montering bevares.
4. All ny konstruksjon får konkret spillfunksjon; innfør nødvendig spillmekanikk sammen med konstruksjonen, eller marker den eksplisitt som uferdig.
5. Gjenbruk dagens sagbukk, lagerskur, hytte og verksted fremfor å duplisere dem.
6. Råvarer skal ikke oppstå gratis ved konstruksjon; inventar og fysiske lagerhauger må bevares ved levering, montering og lagring.
7. Kollisjon, døråpninger, lagringskompatibilitet og iPhone-betjening inngår i akseptansekravene.

## Planlagte faser
### CE 1.1.4C.1 – Grunnleggende overlevelseskonstruksjoner
Bålplass, lagringskasse, arbeidsbenk, sagbukk og vedskjul. Etabler varme/matlaging, fysisk lager og håndverksproduksjon. Revider eksisterende sagbukk til C.1-systemet uten å bryte gamle lagringsfiler.

### CE 1.1.4C.2 – Boliger og produksjonsbygninger
Lagerskur, enkel hytte og åpent verksted. Videreutvikle eksisterende ferdigtegninger, introduksjon av lagrings- og oppholdsfunksjoner og test av mange bygninger på ulike plasser.

### CE 1.1.4C.3 – Keramikk og trekull
Leireovn og kullmile. Ressursflyt, varmebehandling, brenselforbruk, tidsbruk og lagring av produkter. Ingen moderne industrimaskiner.

### CE 1.1.4C.4 – Førindustriell metallurgi
Jernvinneovn og smie. Foregående kullmile gir trekull; jernmalm og varmebehandling leverer råjern som smien kan bearbeide. Verktøy og redskaper får konkrete bruksområder.

## Ikke besluttet
Produksjonstider, nøyaktige oppskrifter, oppvarmingsverdier, holdbarhet, teknologikrav og balansetall blir fastsatt i hver respektive C-fase. Konstruksjoner utenfor denne listen er ikke inkludert i denne godkjenningen.
