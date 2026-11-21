# AFTERFALL CE 1.1.4C.1 – bygging og funksjonalitet
Implementert 21. november 2026. Alle kostnader og tidsverdier er foreløpige **spillbalanseverdier**.

## De fem vedtatte konstruksjonene
| Konstruksjon | Bygging fra inventaret | Aktiv funksjon |
|---|---|---|
| Bålplass | 12 L stein + 1 ved | Tenn med 1 ved (8 min i virkelig tid), nærvarme innen 4 m, tørk 2 bær til 1 porsjon tørkede bær |
| Lagringskasse | 6 planker + 2 lekter | Oppbevaring inntil 300 kg og 450 L, egne inn-/uttaksknapper |
| Arbeidsbenk | 1 tømmerstokk + 4 planker | Lag fakkel fra 2 pinner + 1 ved, eller 8 pinner + 2 L sagflis fra 1 planke |
| Sagbukk | 1 tømmerstokk + 2 lekter | 1–10 råenheter per sagetrinn; håndsaging uten sagbukk begrenses til 1. Eldre sagbukker bevares |
| Vedskjul | 1 tømmerstokk + 5 planker | Oppbevaring av ved, tømmer, planker, lekter, pinner og sagflis; maks 1800 kg / 4200 L |

C.1 plasseres som mindre konstruksjoner direkte på tørt og noenlunde jevnt terreng; større bygninger fortsetter å kreve godkjent planering og konstruksjonseditor. Byggeoppskrifter krever ressurser i inventaret (maks 300 kg / 150 L). Den gamle byggeverdenen, materialhauger, lagerbygg, planering og deres fremdrift er ikke konvertert eller slettet.

## Overlevelsesfunksjoner
Busker gir pinner og bær, spirer igjen etter fem minutter og blir høstbare etter 15 minutter (også etter at spillet er lukket). Dried berries kan spises og gir +18 matmetthet opptil 100 %. Matmetthet faller langsomt mens spillet er aktivt. Varme faller langsomt, raskere i regn; aktiv bålplass øker varme innen fire meter. Svært lav matmetthet eller varme gir en moderat bevegelsesstraff. Fakkel lyser i fem minutter; vedvarende tid registreres i verdenssnapshot.

## Kompatibilitet og lagring
Uendrede lagringsnøkler og verdens-snapshot versjon 2; frivillige felt `smallStructures` og `survivalNeeds` er lagt til. Manglende felt tolkes som ingen småbygg og standard 100 % mat/varme. Gamle `sawStations` beholdes og nye sagbukker registreres i samme system for trebearbeiding. Fullførte lagerskur og deres `buildingStores` berøres ikke.

## Automatiske kontroller
- 32 regelbaserte sjekker av plassering, materialforbruk, lageroverføring, bålvarme, tørking, matspising, arbeidsbenk, fakkel, gammel lagringsfil.
- Parse-sjekk for hele spillets ES-modulkode og de relevante importerte C.1-funksjonene.
- Egen regresjonstest i `verify-c1.html` kjører i nettleseren uten å lese eller endre spillerdata.

## Manuell iPhone-test (gjenstår)
- [ ] Åpne eksisterende C.0-spill og bekreft at ferdig lagerskur og beholdning fortsatt er der.
- [ ] Bygg hver av de fem småkonstruksjonene fra inventaret på tørt og forholdsvis flatt terreng. Kontroller at ressurser trekkes fra og at ingen objekter overlapper.
- [ ] Legg inn og ta ut planker i en kasse; legg ved i vedskjulet og kontroller at stein avvises.
- [ ] Tenn bål, varm Marcus, høst en busk, tørk bær og spis; kontroller at oppvarming og metthet endres.
- [ ] Lag fakkel på arbeidsbenken, tenn den, og kontroller lys om natten.
- [ ] Bygg sagbukk, sag flere tømmerstokker i ett trinn og bekreft at gamle sagbukker fungerer.
- [ ] Lagre, lukk nettleseren, start igjen og kontroller alle fem objekter, lagerinnhold, brennetid og mat/varme.
- [ ] Test på iPhone at småbygg-knappen ikke hindrer planering, konstruksjonseditor og eksisterende lagerskur.
- [ ] Kontroller spillbarhet og bildefrekvens ved mange objekter over lang tid.

## Kjente avgrensninger
C.1 er en spillmekanisk prototype, ikke en ferdig realisme- eller ernæringssimulator. Bær tørkes ved bål i et enkelt håndverkssystem. Det er ennå ikke NPC-er, kamp, avansert matproduksjon, varmeoverføring gjennom bygninger eller inventar direkte knyttet til arbeidsbenk/vedskjul fra lagerhauger. Disse avgrensningene må ikke presenteres som ferdig implementerte funksjoner.
