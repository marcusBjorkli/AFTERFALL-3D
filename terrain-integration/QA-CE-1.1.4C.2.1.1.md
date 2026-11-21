# AFTERFALL CE 1.1.4C.2.1.1 – Mobil-HUD uten overlapp
Dato: 21. november 2026
Status: Implementert, automatiske kontroller bestått. Praktisk iPhone-tapping og synstest gjenstår.

## Utgangspunkt
Brukeren rapporterte at man på iPhone ikke lenger kunne grave eller fylle fordi spadens lange høydepanel, planering, lagerhaug, diagnose, inventar og småbygg overlappet. I desktop ble det opplevd som bedre.

## Implementering
- **Bare mobil/narrow viewport**: `@media(max-width:700px)` og alternativt grovt pekeverktøy med lav visningshøyde. PC over terskelen beholder originalt panel.
- Spadens `#earthTools` ligger nå nederst til høyre med maks 198 px bredde. Grav og Fyll er 50 px høye berøringsmål med uendret `pointerdown` og hold-500-ms-logikk.
- Høyderutenett, målkote, målkote fra siktekors og gravedybdestopp skjules bak knappen **⛰️ Koteinnstillinger**. Verdiene og terrengmodus beholdes selv når panelet lukkes.
- Innstillingspanelet åpnes som modal over de andre kontrollene; eget lukkekryss, trykk utenfor og Escape støttes. Graving kan ikke starte så lenge dialogen er åpen. Å bytte verktøy lukker panelet.
- Kompakt spiller-HUD: tittel og status forkortes visuelt, diagnostikk, lager, planering og småbygg fordeles i separate plasseringer, og et kort kote-felt vises over overlevelsesstatus. På spesielt korte mobildisplayer skjules sekundære informasjonspaneler.
- Lagerhaug-knapp er plassert over grav-docken og overlapper ikke hovedknappene. Ingen fullskjermskontroll skal ligge foran dem under normal spilling.
- Normal grav-dock ligger **under** inventar/andre dialoger i z-indeks. Ved åpning av kote-dialog brukes eksplisitt backdrop for å forhindre skjult interaksjon.

## Sikkerhet og kompatibilitet
- Uendret terrenggeometri, målkoteregel, materialregnskap, rasbalanse, bygg, inventar, dører, overlevelse, NPC-er, lagrings- og innlastingsrutiner.
- Ingen nye verdensfelt eller lagringsmigrering. Gamle lagringer støttes fortsatt.
- Databehandling og 3D-motor endres ikke av mobilrettelsen.
- Oppdatert informasjon i spillets Meny.

## Verifisert i kildekode og simulerte kontroller
- 19/19 automatiske tilstandskontroller bestått: lukket mobilpanel ved oppstart, åpne/lukke, backdrop, Escape, fokus, aria-expanded, skrivebordsgjenoppretting, verktøybytte, uendret grave-hold, vedvarende saves og modulsyntaks.
- 121/121 eksisterende automatiske tester bestått: 22 overlevelse, 18 planeringsplassering, 23 høyderutenett, 26 havnivå og 32 lagerskur.
- Nettleserbasert layouttest: `verify-c211.html` kan åpnes på mobil for geometriske overlappskontroller ved 320×568, 375×667 og 390×844 CSS-piksler. Resultatene på faktiske iPhone-enheter er ennå ikke observert.

## Manuell test på iPhone – nødvendig før endelig godkjenning
- [ ] Åpne spillet med spaden valgt. Grav og Fyll skal synes nederst til høyre uten at andre knapper ligger over dem.
- [ ] Trykk én gang Grav og Fyll i en egnet rute, og kontroller at masser faktisk trekkes fra/legges i inventaret.
- [ ] Hold Grav eller Fyll inne, kontroller gjentatte slag; løft fingeren og verifiser at arbeidet stanser.
- [ ] Trykk **⛰️ Koteinnstillinger**. Endre målkote, skru høyderutenett og målkotelås på/av.
- [ ] Lukk koteinnstillingene. Grav og Fyll skal ligge på akkurat samme plass; målkote/lås beholder verdiene.
- [ ] Kontroller at inventar, lagerskur, Småbygg, Planering og Diagnose åpner og lukker uten å legge seg over aktive gravekontroller.
- [ ] Test både liten iPhone, større iPhone og landskapsmodus.
- [ ] På PC skal opprinnelige høydeinnstillinger være synlige som før.
- [ ] Lagre og gjenopprett. Ingen ressurser, konstruksjoner eller gamle verdener skal endres av UI-rettelsen.
