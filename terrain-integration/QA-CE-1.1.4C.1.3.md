# AFTERFALL CE 1.1.4C.1.3 – Gjenbruk og utvidelse av planerte områder
Dato: 21. november 2026

## Spillerens rapport og årsak
Småbygg kunne ikke bygges på den allerede planerte tomten til et ferdig lagerskur. To separate sperrer forklarte dette:
1. `validateSmallGround` krevde at hele småbyggets avtrykk lå innenfor én godkjent planeringsprosjekt-ID.
2. `earthRestricted` sperret samtlige posisjoner innenfor et godkjent område når et større bygg var knyttet til området, også utenfor bygningens faktiske geometri.

## Implementert
- **Fysisk kote avgjør:** Hele småbyggets sirkelavtrykk kontrolleres på samme kote (maks 0,025 m avvik), med senter, ytterkant, indre prøver og berørte heltallsnoder. Registrering i et planeringsprosjekt er ikke nødvendig hvis terrenget faktisk er jevnt.
- **Unngå byggekonflikter:** Vann, verdenskanten, faktisk kollisjon med store bygg, eksisterende småbygg, gamle sagbukker, materialhauger og Marcus kan fortsatt sperre plassering. Nybygging i et aktivt, uferdig planeringsprosjekt er sperret.
- **Gjenbruk av gamle tomter:** Byggevalideringen unntar hele-tomt-reservasjonen for allerede ferdigbygde områder, uten å endre forbudet mot graving i det gamle området.
- **Utvid valgt område:** Vis et tidligere godkjent planeringsprosjekt i Planering-menyen og trykk «↗ Utvid valgt område». Marker to hjørner i nytt område langs en side, opprett en tilstøtende flate på eksakt samme kote, planer og godkjenn den. Ett felt kan være 1–20 m på hver side.
- **Ingen inngrep i eldre byggeplass:** Den gamle tomtens ID, areal, underlag og kobling til hus/lagerskur endres ikke. Utvidelsen lagres som et separat planeringsprosjekt med `parentGradeId` i eksisterende `gradingProjects`, og nytt felt har egen status.
- Tilstøtende prosjekter kan dele en grenselinje hvis de er godkjente og har samme kote. Arealoverlapp, ulik kote eller kun berøring i ett hjørne er ikke gyldig.
- Foreldretomter med tilknyttede utvidelser kan ikke slettes, og tomter med eksisterende småbygg kan ikke gjenåpnes eller slettes for graving.

## Verifikasjon
- 18 målrettede automatiske kontroller bestått, inkludert en simulering av spillets faktiske `gradeCreate` med en ferdigbygget, reservert lagertomt.
- Samme ferdige tomt tillater småbygg når avtrykket er flatt og fritt; aktiv uferdig tomt, vann, kollisjon og terrengvariasjon avvises.
- JS-modulen parses uten feil. Eksisterende verdenssnapshot-versjon 2, construction-plan-ID, inventar, ferdige bygg og individuelle småbygg lagres fortsatt i uendrede strukturer.
- Nettlesertester: `verify-c13.html`.

## Må testes manuelt på iPhone
- [ ] Last inn eksisterende lagerskur og finn en ledig flat del av tomten, uten å bygge om lageret.
- [ ] Forhåndsvis en kasse ved siden av bygningen: grønn hvis flatt og fritt; rød ved vegg/annen konstruksjon.
- [ ] Åpne Planering, velg «Vis prosjekt» for lagertomten og trykk «Utvid valgt område».
- [ ] Sett A/B-hjørner langs en side av gammel tomt (felles grense), opprett utvidelse.
- [ ] Planer bare det nye feltet, godkjenn, plasser kasse/sagbukk der.
- [ ] Gå inn og ut av det gamle lageret og kontroller at det har samme innhold og plassering.
- [ ] Test feiltilfeller: planering med ulik kote, overlapp, kun diagonalt hjørne, hav/elv eller fysisk hindring.
- [ ] Lagre og last inn igjen. Kontrollér gamle og nye prosjekter og konstruksjoner.

## Begrensninger
Utvidelser er egne tilstøtende planeringsfelter, ikke en omtegning av eksisterende byggs byggeplan. Store bygninger prosjekteres fortsatt mot ett felt av gangen (maks 20 × 20 m); flere separate bygg kan stå på tilstøtende felt. Det finnes ingen automatisk masseflytting. Fysiske terrengprøver kan avvise et sted som visuelt virker flatt, hvis høydeforskjellen overskrider 2,5 cm.
