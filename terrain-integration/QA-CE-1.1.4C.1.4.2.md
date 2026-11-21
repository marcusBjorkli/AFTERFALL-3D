# AFTERFALL CE 1.1.4C.1.4.2 – Nytt spill
Dato: 21. november 2026
Status: Implementert; praktisk testing på iPhone gjenstår.

## Utviklingsgrunnlag
Brukeren ba om en «Nytt spill»-funksjon. Den finnes i hovedmenyen og innebærer ikke destruktiv sletting. Det eksisterende spillet skal alltid kunne hentes tilbake.

## Ny funksjonalitet
- To separate lokale spillverdener. Den aktive verdenen lagres som før på `CE_WORLD_KEY` i den eksisterende IndexedDB-databasen. Den andre verdenen lagres på en ny, uavhengig nøkkel i samme object store.
- Spilleren velger «🌱 Nytt spill» → bekrefter eksplisitt. Først lagres den aktive verdenen. Den gamle tilstanden pakkes som sikkerhetskopi med spillerens nåværende posisjon, terreng, inventar, bygninger, lager, småbygg og overlevelsesdata. Den nye verdenen lages med samme verdensfrø, men tom verden og startposisjon.
- Med «↔ Bytt til forrige spill» gjøres en toveis bytteoperasjon: den nåværende verdenen lagres i reserveplassen, og den andre gjenopprettes. Begge kan dermed brukes videre.
- Nytt spill er sperret når reserveplassen allerede er i bruk; en uleselig reserveplass blir ikke automatisk overskrevet. Det er maksimum to plasser i denne versjonen.
- I IndexedDB skrives begge verdener i én transaksjon. Hvis transaksjonen mislykkes, forblir både den gamle verdenen og den andre verdensplassen uendret. Spillerposisjon i localStorage forsøkes tilbakeført.
- Hvis IndexedDB ikke er tilgjengelig, brukes en egen localStorage-reserveplass. Skrivefeil gir best-effort tilbakerulling av alle tre aktuelle lokale nøklene. Enheten kan ha for lite lokal lagringsplass for to komplette verdener; i så fall avbrytes operasjonen.
- Eksisterende verdenssnapshot har fortsatt `version:2`. Ingen gamle lagringsnøkler er konvertert, og den eksisterende konstruksjonsmotoren er uendret.

## Verifikasjon utført
- Pure model: start med tom verden, gyldig verdensfrø, standard startposisjon, bevarte hus- og lagerdata i gammel slot.
- Simulert navigasjonsflyt: åpne bekreftelsesdialog; avbryt uten å endre noe; start ny verden; bytt tilbake til lageret; bytt igjen til den nye verdenen.
- Test av full databevaring i gammel slot, inkludert spillposisjon og lagerinnhold.
- Simulert feil ved IndexedDB-transaksjon: begge databasenøkler uendret; spillerposisjon tilbakeført; feilmelding vises.
- Simulert localStorage kvotefeil: alle nøkler tilbakeført; vanlig fallback-bytte fungerer.
- Full parsing av hovedspillets ES-modul; tidligere C.1, C.1.3 og C.1.4-terrentestene gjennomføres uten endringer.

## Manuell akseptansetest på iPhone (gjenstår)
- [ ] Åpne lagret spill og kontroller eksisterende lager og inventar.
- [ ] Åpne Meny → «🌱 Nytt spill». Kontroller bekreftelsesdialog og avbryt første gang.
- [ ] Start nytt spill og kontroller spawn, tomt inventar og fravær av tidligere bygg/terrenginngrep.
- [ ] Åpne Meny → «↔ Bytt til forrige spill» og bekreft. Kontroller gamle bygninger, lagerinnhold, terreng, materialhauger og posisjon.
- [ ] Bytt tilbake til den nye verdenen; begge skal være bevart.
- [ ] Avslutt nettleseren og kom tilbake. Kontroller at begge verdener fortsatt finnes.

## Begrensninger
Dette er lokale spillagringer for nettleseren/enheten, ikke skysynkronisering. Å fjerne nettstedsdata, bruke privat nettlesing eller bytte enhet kan gjøre lagringene utilgjengelige. Versjonen støtter bare to separate verdener.