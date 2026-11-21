# AFTERFALL CE 1.1.4C.1.4 – Rutenettbasert terrengmodell og målkotelås
Dato: 21. november 2026
Status: Implementert i utviklingsgrenen. Mobil/nettlesertesting hos spilleren gjenstår.

## Endringer i spillet
- 1 × 1 m visuelt rutenett tegnet over terreng-overflaten, basert på samme `ground(x,z)` som landskap, kollisjon og graving; dette endrer ikke det eksisterende 1 m høydenettet.
- Hver av de 49 synlige rutene viser avrundet terrengkote (0,1 m). Linjer og etiketter følger terrenget. Farge viser avvik mot valgt målkote: grønt innen ±0,02 m når hele ruten er jevn, oransje over og blått under.
- Høydemodus er en av/på-knapp i spadens grensesnitt. Siktepunktsmåling kan lese bakke innen 42 m og overføre høyden til en redigerbar målkote på 0,01 m oppløsning.
- Valgfri grave-/fyllås til målkoten. Eksisterende 0,1 m gravetrinn kortes ned til målkoten ved siste steg, uten å passere den. Låsen påvirker både direkte grave-/fylloperasjoner og masseutjevning i omliggende terreng.
- Fortsatt fysisk massebalanse: materialer må kunne bæres, fylling krever masser og ustabile skråninger kan avvise inngrep.
- Automatisk registrering av sammenhengende terrengnoder på samme kote, beregnet ved behov (ingen kunstig høyde eller ny terrengmutasjon).
- Store bygninger får automatisk byggetomt på flat mark fra 3 × 3 til 20 × 20 m, dersom hele arealet (inkludert cellemidtpunkter) holder ±2 cm og ikke er under vann, reservert eller fysisk blokkert. Ingen prosjektopprettelse kreves for å åpne konstruksjonseditoren.
- Automatisk tomt opprettes og lagres først når byggeplanen faktisk godkjennes. Dersom lagring mislykkes, rulles både ny byggetomt og plan tilbake i minnet. Konstruksjonseditoren, materialregnskapet og montasjeforløpet er ellers uendret.
- Eksisterende manuelle planeringsprosjekter kan fortsatt brukes. Eksisterende bygninger og deres reserverte tomter kan ikke graves opp.
- `terrainMode` er et **valgfritt** nytt felt i eksisterende verdenssnapshot (fortsatt `version=2`). Eldre verdenslagringer åpnes med høydemodus/lås deaktivert og får eksisterende kote og terrengdata uendret. Målkote og av/på-valg bevares etter lagring.

## Teknisk avgrensning
- Automatisk sammenhengende flathet er en **geometrisk måling**, ikke automatisk graving: bare fysiske grave-/fylltrinn endrer landskapet.
- Nøyaktig plassering og beskyttelse er styrt av faktisk kote, vann, andre bygg, lagre og skråningsstabilitet.
- For store bygninger velges en aksejustert kvadratisk tilgjengelig byggeflate med sentrum rundt spilleren, maksimalt 20 m per side. Det er ikke automatisk union av alle manuelle prosjektpolygoner til én kjempetomt; flere bygninger kan fortsatt oppføres på hver sin flate.
- Det visuelle rutenettet viser ett desimal for lesbarhet, men målkote og terrengregnskap bruker centimeterpresisjon.
- Høydemodus oppdateres ca. to ganger i sekundet for mobil ytelse.
- Kotehøydene er spillets lokale koordinatsystem (ikke offisiell norsk NN2000).

## Automatiske tester
- 50 låste grave-/fyllehøyder omkring målkoten: aldri overgraving eller overfylling.
- Høyderuter: cellemåling, klassifisering av graving/fylling/flatt/ujevnt, reell utjevning.
- Sammenhengende flate: BFS ved like kotehøyder, barrierer, lokale toleranser.
- Automatisk byggetomt: flat 20 m, avgrenset område, avvisning av enkelte flate punkter, mellomliggende høydeavvik og hindringer.
- Full byggeplan -> materialregnskap -> ferdigmontert bygg -> lagring/gjenoppretting for lagerskur, hytte og verksted på automatisk tomt.
- Gamle C.1 og C.1.3-regresjonstester bestått (22/22 + 18/18).
- Hele hovedspillets ES-modul er parsbar.

## Manuell sjekkliste for iPhone (gjenstår)
- [ ] Åpne gammelt lagerskur, åpne lageret og kontroller uendret beholdning og dørkollisjon.
- [ ] Utstyr spaden, aktiver Høyderutenett, sikt mot terreng 2–40 m unna og les koteetiketter på rutene.
- [ ] Velg målkote fra siktekorset, lås og grav en rute med høyere kote. Siste slag må stoppe på valgt kote.
- [ ] Grav under valgt kote med låsen på: ingen gravetrinn skal godtas. Slå av låsen og kontroller at fri graving fungerer.
- [ ] Fyll en lav rute opp til målkoten med masser fra inventaret, uten å fylle høyere.
- [ ] Kontroller fargene: grønn, oransje, blå, og at de oppdateres etter grave-/fylletrinn.
- [ ] Grav en ny sammenhengende flat flekk uten å opprette prosjekt; kontroller registrert antall flate rutenoder.
- [ ] Prøv småbygg og bygg via editoren på den flate flekken uten å opprette prosjekt.
- [ ] Lagre, last inn, og kontroller gamle planerte tomter, det nye bygget, terrengendringer og målkotelås.
- [ ] Test på mobil med lang spilløkt for ytelse og interaksjon med andre UI-elementer.
