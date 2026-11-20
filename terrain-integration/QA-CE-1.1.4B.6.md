# AFTERFALL CE 1.1.4B.6 – integrasjon og spilltesting
Dato: 20. november 2026

## Omfang
Dette er en stabiliseringsversjon av CE 1.1.4B.5.2, ikke en ny konstruksjonsserie:
- Fysisk kollisjon mot monterte moduler, dørbladets rotasjon, gulvhøyde, og romlig indeksering av kollisjonsdeler.
- Materiallevering fra inventar **eller** eksisterende hauger innen 5 m fra både spilleren og byggeplassen. Kilder kan ikke fjernleveres fra.
- Transaksjonell levering: fysisk lager, byggeplan og inventar lagres samlet; feil ved lagring ruller tilbake endringer i minnet.
- Ferdige byggeprosjekter beholder geometrien, men skjuler «Lever / monter».
- Prosjektering, godkjenning, planering, eksisterende trær og eldre lagringsfiler beholdes.
- Den godkjente CE 1.1.4C-planen ligger i ROADMAP-CE-1.1.4C.md.

## Automatiserte kontroller utført
**12 / 12 simuleringer godkjent**: lagerskur (11 moduler), enkel hytte (15) og verksted (13), i 0, 90, 180 og 270 grader.
Hver test sjekket:
1. Ferdigtegning og godkjent byggeplan.
2. At ingen modul kan monteres gratis før materialene er levert.
3. Levering fra materialhauger, nøyaktig reduksjon av fysisk lager og ingen ressursduplisering.
4. Montering til alle modulene er komplette og omklassifisering til «complete».
5. Bevaring av fremdrift ved simulert lagring og gjenoppretting, både delvis og komplett.
6. Ferdig gulvhøyde, veggkollisjon, lukket dør, farbar åpen dør og fri ferdsel utenfor bygningen.
7. Parse-test av nettleserens modulkode og kontroll av at ferdige byggeplasser skjuler byggepanelet.

Separat testet: fysisk kollisjon med utsvingt dørblad, romlig kollisjonsindeks, rotert byggeplass, 5 m leveringsgrense, og at leveringsberegning ikke muterer ubrukte lagre.

## Manuell testliste – må utføres i nettleser
- [ ] Last inn en eksisterende CE 1.1.4B.5.2-lagring på iPhone; ferdig lager står fremdeles og materialmenyen er skjult.
- [ ] Gå mot alle fire vegger og hjørner; Marcus stoppes, men kan passere en åpen dør.
- [ ] Gå på gulvet, lukk døren fra begge sider og kontroller at dørbladet ikke sveiper gjennom Marcus.
- [ ] Hogg trær, sag tømmer, transporter til hauger nær byggeplassen, og lever uten ekstra inventaromlasting.
- [ ] Flytt en haug mer enn fem meter vekk og kontroller at fjernlevering avvises.
- [ ] Lagre midt i monteringsprosessen, last inn igjen og kontroller materiallager, inventar, byggeprogresjon og kollisjon.
- [ ] Test med to eller flere bygninger på forskjellige steder, ulike rotasjoner og lange spilløkter.
- [ ] Test iPhone ytelse, menyer, nettsideoppdatering, berøringskontroller og eventuelle kollisjonsproblemer i svært bratt terreng.

**Begrensninger:** De automatiserte testene er ikke en erstatning for praktisk spilltesting på iPhone. Kollisjonsmodellen er en forenklet spillfysikk med sirkelformet horisontalt fotavtrykk og vertikalt spillerintervall. Komplekse skråplan, kontinuerlig fysikk og stiger er ikke inkludert. CE 1.1.4C.1–C.4 er planlagte, ikke implementerte.
