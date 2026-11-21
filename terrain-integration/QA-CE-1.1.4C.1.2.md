# CE 1.1.4C.1.2 – Forhåndsvisning, rotasjon og planeringskrav

## Funksjoner og regler
- Nye småbygg av alle fem C.1-typer krever eksisterende, godkjent eller arkivert planeringsprosjekt.
- Hele det sirkulære sikkerhetsavtrykket (type-definert radius) må ligge innenfor ett og samme planeringsområde, med korrekt kote. Kravet gjøres **før** materialer brukes.
- Forhåndsvisningen bruker nøyaktig samme modell som ferdig småbygg, inkludert sagbukk, og plasseres på terrenget det siktes mot (maks 6,5 m).
- Grønn gjennomsiktig forhåndsvisning betyr godkjent plassering; rødt betyr at spilleren må flytte konstruksjonen eller klargjøre terrenget.
- PC: Q = −15°, R/E = +15°, Enter/Space/klikk = plasser, Esc = avbryt.
- iPhone: −15°, +15°, skyveknapp i 5° steg, Plasser og Avbryt. Trykk på bakken uten å dra for bekreftelse.
- Materialforbruk og lagring skjer bare ved bekreftet, gyldig plassering. Avbrutt forhåndsvisning bruker ingen materialer.
- Eksisterende plasseringer og lagrede småbygg forblir gyldige selv om de ble bygget før denne regelen. Verdenens snapshot-versjon er fortsatt 2.

## Kontroller
- Tidligere C.1-regresjon: 22/22 bestått.
- Valideringsregler for alle fem byggetyper, kotekrav, fullstendig fotavtrykk, vann, beskyttede områder, veggkollisjon, spiller, gamle sagbukker og lagerhauger.
- Rotasjon 5°/15° og wrap-around ved 360°.
- Render av alle fem småbygg med samme modellgenerering og bevart visuell rotasjon.
- Endringsløs og grønn/rød forhåndsvisning kontrollert med isolerte scenemocker.
- Egen verifiseringsside: `verify-c12.html`.

## Praktisk iPhone-test som gjenstår
- [ ] Åpne eldre lagring: tidligere småbygg, sagbukker, store bygg, lager og terrengdata beholdes.
- [ ] Velg Småbygg → Forhåndsvis, se 3D-ghost i grønt eller rødt på siktepunktet.
- [ ] Bygg uten godkjent planering: Plasser skal være sperret, og inventaret uendret.
- [ ] Planer og godkjenn området: prøv ved sentrum, langs ytterkant og ved hindringer.
- [ ] Roter med knapper og skyveknapp; kontrollér orientering i ferdig modell.
- [ ] Avbryt og se at ingen ressurser blir brukt.
- [ ] Bygg en av hver av de fem typene; kontrollér kollisjoner, funksjoner og ressursregnskap.
- [ ] Lagre, last inn igjen og kontroller retning, posisjon, inventar og bygg.
- [ ] Test trykk på spillets terreng, dra/endre sikteretning og fysisk knappplass på iPhone.

## Avgrensning
Ingen automatisk planering, fri plassering uten godkjent terreng eller flytting av allerede oppførte småbygg. Disse krever en egen senere designbeslutning.
