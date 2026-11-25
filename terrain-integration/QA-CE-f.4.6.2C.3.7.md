# CE f.4.6.2C.3.7 – utløpsgeometri og strandlinje-QA

## Baseline fra C.3.6, 25. november 2026
Seed 206414, fjellvann ID 6, spiller X 2713,81 / Z 2725,43. Rapporten har to identiske tester. 105/105 finprøver var lastet med vann, ingen terrenggjennomtrengning eller manglende vann, maksimalt nivåavvik 0,0074 m. 26 eldre «suspendedBankSamples» var inne i den våte kanalen, og kan være normal dybde. Én dobbelt vannflate ble målt ved X 2720 / Z 2734 (0,049 m høydeforskjell). To mulige hull i den grove utløpsmålingen.

## Endringer
- Deterministisk breddevariasjon langs fjellvannutløpet, maks ±8,5 %, avtagende til null ved overgang til eksisterende elv.
- Terrengets bankskråning nær vannkanten stiger gradvis til over vannstanden og fases ut til opprinnelig terreng. Bunndybde, hydrologiske ruter, vannstand og lagringsformat beholdes.
- Vannpolygonenes faktiske skjæringslinje mot den gjengitte terrengviften løses med åtte biseksjonssteg, i stedet for lineær approksimasjon.
- Original elv starter igjen ved radial 50,5 m, og overgangsstripen avsluttes ved 50,58 m: bare 8 cm overlapp. Dette er ment å redusere dobbel geometri.
- Ny `shorelineEdgeControl` i geometrirapporten måler den virkelige strandlinjen på begge sider med ~2 m intervall og skiller `wetInsideMissing` fra `waterOutsideBank`; avvik får X/Z-koordinater.

## Kontroll / akseptanse
JavaScript-syntaks kontrollert. Isolerte geometriprofiltester passerer. Full nettleser-/WebGL-verifisering er ikke gjennomført.
Test i C.3.7 fra tørt land ved X 2713,81 / Z 2725,43; undersøk sjø-/elv-overgang, naturlig strandlinje og eventuelle polygonbrudd. Bruk Meny → Diagnose → Mål ekte 3D-mesher → Last ned 3D-rapport. Kontrollér `shorelineEdgeControl.valid`, `alpineId=6`, `probes`, `wetInsideMissing`, `waterOutsideBank`, og `anomalies`. Sammenlign med C.3.6 og test ved chunk-grense Z 2752. Regresjonstest bygg, graving/fylling, planering, lagring og andre vannforekomster.