# Le attività di Linfa

**241 attività** in tutto, di cui **214 per la giornata** (quelle che il codice pesa e l'AI sceglie):

| Gruppo | Quante | Nel progetto (sezione 5) |
|---|---|---|
| Quotidiane (mattino, giorno e pomeriggio, sera, meteo) | 70 | 70 |
| Le altre azioni di oggi (`azioni.ts`) | 13 | — (restano: l'AI le conosce) |
| Di strada (12 per ognuna delle 7) | 84 | 84 |
| Rare | 20 | 20 |
| Passi delle catene e delle imprese libere | 17 | — (servono alle catene della sezione 4.2) |
| Con i giochi e i regali | 10 | — (ogni gioco o regalo apre un'attività, sezione 11) |
| **Per la giornata** | **214** | **~175** |
| Di gruppo | 17 | 17 (sezione 5.4) |
| Intermezzi | 10 | 10 (sezione 5.5) |

Tutte le 23 azioni di `azioni.ts` e le 42 attività di `mestieri.ts` ci sono con il loro id (controllato da `genera.mjs`).

> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.

## Come si legge

- **Quando**: fasce (M mattina · G giorno · P pomeriggio · S sera · N notte) e meteo.
- **Posto · oggetti**: il posto della stanza (casa = dove sta l'albero; giro = cammina per la stanza), poi gli oggetti.
  **in grassetto** = serve (senza, peso 0) · `id`? = lo usa se c'è (×2) · traccia = serve quella traccia nella stanza · ha `x` = ne ha almeno 1.
- **Risorse · tracce**: −2 legna = la consuma · +2 legna = la raccoglie · ▸traccia = resta nella stanza (elenco in fondo).
- **Porta a**: attività che diventano più probabili dopo; ⛓ = passo di una catena (`imprese.md`): il passo dopo vale ×5.
- **Nuvoletta**: la frase che pensa quando gli viene voglia di farla (sezione 9.2).
- **Segni**: ferma (al massimo una al giorno) · mov (almeno una al giorno) · L1-L3 = livello della strada · gruppo = servono due alberi ·
  base=N = base diversa dal solito · quando / p = condizione e probabilità al giorno delle rare.
- **Peso** (sezione 3.3): base (quotidiana 10 · di strada 4 · rara 0,5; proposta per i passi delle catene e i giochi: 4) × strada × impresa × catena × oggetti × umore × meteo × novità.

### Meteo

| Valore | Vuol dire |
|---|---|
| `qualsiasi` | con qualsiasi tempo |
| `asciutto` | senza pioggia né neve (oggi `asciutto`) |
| `pioggia` | pioggia o temporale (oggi `pioggia`) |
| `temporale` | temporale |
| `neve` | neve |
| `nebbia` | nebbia |
| `sole` | cielo di sole |
| `vento` | vento forte (da aggiungere a `Meteo`: Open-Meteo dà la velocità del vento; soglia da decidere) |
| `caldo` | massima dai `SOLE_DA` gradi in su (scena.ts) |
| `freddo` | sotto `FREDDO_SOTTO` gradi o neve (scena.ts) |
| `dopoPioggia` | giornata asciutta dopo un giorno di pioggia, o pozzanghera nella stanza |
| `dopoTemporale` | giornata asciutta dopo un temporale |
| `sereno` | sera senza pioggia né nuvole |

## Quotidiane del mattino (15)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `sveglia` | si sveglia e si stiracchia | M · qualsiasi | assonnato, allegro, energico | sbadiglia → siStiracchia → gratta | casa · `pantofole`? `letto-muschio`? | — | `colazione-rugiada` | «ancora cinque minuti…» | — |
| `colazione-rugiada` | fa colazione con la rugiada | M · asciutto | allegro, curioso, assonnato | raccoglie → beve → saltelloContento | casa · `tazza`? | — | `raccoglie-rugiada` | «che fame di rugiada» | — |
| `annaffiarsi` | si annaffia da solo | MP · asciutto | allegro, assonnato | prendi → versa → siScrolla | casa · `annaffiatoio`? | ▸pozzanghera | — | «un po' d'acqua…» | mov già in azioni.ts |
| `ginnastica-sole` | fa ginnastica col sole | M · sole | energico, allegro, fiero | siChina → saltella → contaDita | prato · `tappetino`? `fascia`? `corda-salto`? | — | `corsa` | «uno, due, uno, due!» | mov |
| `rastrella-foglie` | rastrella le foglie | MGP · asciutto | energico, pensieroso | rastrella → impila → starnutisce | prato · `rastrello`? | +2 foglie ▸mucchio-foglie | `tuffo-foglie` | «quante foglie…» | mov |
| `saluta-uccelli` | saluta gli uccelli | M · asciutto | allegro, curioso | guardaSu → saluta → fischia | rami · `casetta-uccelli`? | +1 piume | ⛓ musica 1/3 `suona-flauto` | «cip cip? cip!» | — |
| `raccoglie-rugiada` | raccoglie la rugiada | M · asciutto | curioso, energico | cammina → raccoglie → versa | prato · `secchio`? `pozzo`? `botte-acqua`? | +1 acqua | `bere-tisana` | «la rugiada è fresca adesso» | mov |
| `spazza` | spazza davanti a casa | M · asciutto | energico, pensieroso | spazza → manoSuiFianchi → spazza | davanti · `scopa`? | ▸stanza-pulita | — | «che disordine!» | mov |
| `dito-bagnato` | controlla il meteo col dito bagnato | M · qualsiasi | curioso, pensieroso | assaggia → indica → annuisce | casa · — | — | — | «che tempo farà?» | — |
| `pettina-foglie` | si pettina le foglie | M · qualsiasi | fiero, allegro | pettina → sbircia → manoSuiFianchi | casa · `pettine`? `specchio`? | — | — | «oggi voglio essere elegante» | — |
| `annaffia-orto` | annaffia l'orto | MS · asciutto | pensieroso, allegro | prendi → versa → esamina | prato · traccia `orto-seminato` `annaffiatoio`? `cappello-paglia`? `serra`? | −1 acqua ▸orto-germogli | ⛓ orto 3/5 `raccoglie-ortaggi` | «l'orto ha sete» | — |
| `letto-muschio` | fa il letto di muschio | M · qualsiasi | assonnato, pensieroso | posa → strofina → manoSuiFianchi | casa · `letto-muschio`? `pantofole`? | — | — | «il letto deve essere perfetto» | — |
| `apre-finestre` | apre le finestre della casetta | M · asciutto | allegro, sognante | cammina → tira → sospira | sfondo · **`casetta`** | — | — | «aria nuova!» | — |
| `fare-valigia` | prepara la valigia per un viaggio immaginario | MS · qualsiasi | curioso, sognante, energico | posa → impila → manoSuiFianchi | casa · `valigia`? `zaino`? | — | `passeggiata` | «e se partissi?» | mov già in azioni.ts |
| `giornale-foglie` | legge il giornale delle foglie | M · qualsiasi | curioso, pensieroso, fiero | legge → esamina → annuisce | casa · `giornale`? `occhiali-tondi`? | — | `pensare` | «chissà che notizie» | ferma |

## Quotidiane del giorno e del pomeriggio (32)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `raccogli-rami` | raccoglie rami | GP · asciutto | energico, curioso | cammina → raccoglie → porta | giro · `legnaia`? `carriola`? | +2 legna | ⛓ fuoco 1/6 `accendi-fuoco` | «serve legna» | mov |
| `cerca-ghiande` | cerca ghiande | GP · asciutto | curioso, furbo | annusa → scava → saltelloContento | giro · `cesto`? | +2 ghiande ▸buca | `baratto-scoiattolo` `cucina-zuppa` | «sento odore di ghiande» | mov |
| `cerca-sassi` | cerca sassi belli | GP · asciutto | curioso, sognante | cammina → raccoglie → esamina | giro · `carriola`? | +2 sassi | ⛓ forno 1/4 `muretto-sassi` `castello-sassi` | «quel sasso brilla» | mov |
| `raccogli-bacche` | raccoglie bacche | GP · asciutto | allegro, curioso | afferra → raccoglie → assaggia | prato · `cesto`? `orecchini-ciliegia`? | +2 bacche | ⛓ marmellata 1/5 ⛓ quadro 1/5 `schiaccia-bacche` `artista.colori-bacche` | «che bacche mature!» | — |
| `intreccia-fili` | intreccia fili d'erba | GPS · qualsiasi | pensieroso, sognante | siediti → intreccia → tira | casa · — | +2 fili | ⛓ altalena 1/4 `intreccia-corda` | «un filo, un altro filo…» | — |
| `gratta-resina` | gratta la resina | GP · asciutto | curioso, furbo | gratta → annusa → scuoteTesta | casa · — | +1 resina | ⛓ luce 1/3 `fa-candele` | «profumo di resina» | — |
| `zappa-aiuola` | zappa l'aiuola | MG · asciutto | energico, fiero | zappa → asciugaFronte → zappa | prato · `zappa`? `cappello-paglia`? | ▸aiuola | ⛓ orto 1/5 `semina` | «qui ci starebbe un orto» | mov |
| `semina` | semina | MGP · asciutto | sognante, allegro | siChina → lancia → posa | prato · traccia `aiuola` `cappello-paglia`? `spaventapasseri`? | −1 semi ▸orto-seminato | ⛓ orto 2/5 `annaffia-orto` | «chissà cosa nascerà» | — |
| `ripara` | ripara qualcosa | GP · qualsiasi | pensieroso, fiero | esamina → martella → annuisce | casa · `martello`? `capanno-attrezzi`? `bici`? | — | — | «questo si è rotto…» | — |
| `muretto-sassi` | costruisce un muretto di sassi | GP · asciutto | energico, fiero | porta → impila → manoSuiFianchi | prato · `carriola`? | −3 sassi ▸muretto | ⛓ forno 2/4 `costruisce-forno` | «un muretto, ecco cosa manca» | mov |
| `bucato` | fa il bucato | MG · sole, vento | energico, allegro | strofina → strizza → posa | prato · `filo-bucato`? `tinozza`? | −1 acqua ▸panni-stesi | — | «giornata da bucato!» | mov |
| `gioca-palla` | gioca a palla | GP · asciutto | energico, allegro | calcia → corre → saltelloContento | prato · **`pallone`** `porta-calcio`? | — | ⛓ calcio 1/3 `gruppo.partita` | «chi gioca?» | mov |
| `aquilone` | fa volare l'aquilone | GP · vento | allegro, sognante, energico | corre → tira → guardaSu | prato · **`aquilone`** | — | `ripara-aquilone` | «oggi c'è il vento giusto» | mov |
| `altalena` | va in altalena | GPS · asciutto | allegro, sognante | siediti → dondola → ride | rami · **`altalena`** | — | ⛓ altalena 4/4 | «su, più in alto!» | mov |
| `tuffo-foglie` | si tuffa nelle foglie | GP · asciutto | allegro, energico | corre → salta → siNasconde | prato · traccia `mucchio-foglie` | ▸foglie-sparse | `rastrella-foglie` | «quel mucchio mi chiama» | mov |
| `bolle` | fa le bolle di sapone | GP · asciutto | allegro, sognante | soffia → corre → afferra | prato · **`soffiabolle`** | — | — | «bolle!» | mov |
| `pesca-pozzanghera` | pesca nella pozzanghera | GP · dopoPioggia | pensieroso, sognante, assonnato | lancia → aspetta → tira | davanti · **`canna-pesca`** traccia `pozzanghera` `cappello-pescatore`? `stivali-pioggia`? | — | — | «oggi abboccano» | — |
| `disegna-terra` | disegna per terra col ramo | GP · asciutto | sognante, curioso | siChina → dipinge → esamina → spazza | davanti · — | ▸disegno-terra | `dipingere` | «un disegno, qui» | — |
| `castello-sassi` | costruisce un castello di sassi | GP · asciutto | allegro, curioso | impila → esamina → indietreggia | davanti · — | −2 sassi +1 sassi ▸castello-sassi | `castello-sassi` | «stavolta sta in piedi» | — |
| `nascondino-scoiattolo` | gioca a nascondino con lo scoiattolo | GP · asciutto | allegro, furbo | siNasconde → contaDita → sbircia | giro · — | — | — | «dove si sarà cacciato?» | mov |
| `prendere-sole` | si gode il sole | GP · sole | assonnato, allegro, sognante | siSdraia → sospira → guardaSu | prato · `asciugamano`? `occhiali`? `costume-righe`? `parasole`? | — | — | «un po' di sole…» | già in azioni.ts |
| `sonnellino` | fa un sonnellino | GP · asciutto | assonnato, malinconico | sbadiglia → siSdraia → russa | casa · `amaca`? `poltrona-muschio`? | — | — | «un pisolino…» | ferma già in azioni.ts |
| `guardare-cielo` | guarda il cielo | MGPS · asciutto | sognante, pensieroso, curioso | siSdraia → indica → ride | prato · — | — | `pensare` | «che nuvole oggi…» | ferma già in azioni.ts |
| `chiacchierare-scoiattolo` | chiacchiera con lo scoiattolo | MGP · asciutto | allegro, curioso, furbo | indica → annuisce → ride | prato · `cuccia-scoiattolo`? `telefono-barattolo`? | — | `baratto-scoiattolo` | «dov'è lo scoiattolo?» | mov già in azioni.ts |
| `baratto-scoiattolo` | fa un baratto con lo scoiattolo | GP · asciutto | furbo, curioso | posa → scuoteTesta → stringeMano | davanti · — | −2 ghiande | — | «due ghiande per quel bottone?» | — |
| `scrive-taccuino` | scrive nel taccuino | GPS · qualsiasi | pensieroso, sognante | siediti → scrive → legge | casa · `quaderno`? `sgabello`? | — | — | «mi segno questa» | ferma |
| `leggere` | legge un libro | GPS · qualsiasi | pensieroso, curioso, assonnato | siediti → legge → ride | casa · `libro`? `occhiali-tondi`? `poltrona-muschio`? `foglia-oro`? | — | `pensare` | «quel libro mi chiama» | ferma già in azioni.ts |
| `telefono-barattolo` | telefona col barattolo | GP · qualsiasi | allegro, curioso | prendi → annuisce → ride | casa · **`telefono-barattolo`** | — | — | «pronto? chi parla?» | — |
| `ballare` | balla da solo | PS · asciutto | allegro, energico | balla → saltella → siInchina | prato · `ghirlanda-fiori`? `cerchio`? | — | `rara.festa` | «che voglia di ballare!» | mov già in azioni.ts |
| `suona-flauto` | suona il flauto di canna | GPS · qualsiasi | sognante, allegro, malinconico | soffia → dondola → scuoteTesta | casa · **`flauto`** | — | ⛓ musica 2/3 `gruppo.coro` `suona-tamburo` | «mi è venuta una melodia» | — |
| `cucina-zuppa` | cucina una zuppa | GS · qualsiasi | allegro, fiero | sega → mescola → assaggia | davanti · **`pentola`** traccia `fuoco` traccia `cesto-verdure` (se c'è) `cappello-cuoco`? `cucina-aperto`? `forno`? | −1 ghiande | ⛓ orto 5/5 `gruppo.cena` | «profumino…» | — |
| `bere-tisana` | beve una tisana | MS · qualsiasi | assonnato, malinconico, pensieroso | versa → soffia → beve | casa · `tazza`? `vestaglia`? | — | — | «una tisana calda» | già in azioni.ts |

## Quotidiane della sera (10)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `accendi-fuoco` | accende il fuoco | S · asciutto | energico, fiero, curioso | siChina → strofina → soffia → indietreggia | davanti · `acciarino`? `cerchio-sassi`? | −2 legna ▸fuoco ▸braci | ⛓ fuoco 2/6 `castagne` `storie-fuoco` | «un fuoco, stasera» | mov |
| `castagne` | arrostisce castagne | S · asciutto | allegro, assonnato | prendi → soffia → assaggia | davanti · traccia `fuoco` `spiedo`? `maglione`? | — | ⛓ fuoco 3/6 `gruppo.cena` `invita-fuoco` | «castagne!» | — |
| `storie-fuoco` | racconta storie al fuoco | S · asciutto | sognante, allegro | indica → sventola → ride | davanti · traccia `fuoco` `sedie-ceppo`? | — | ⛓ fuoco 5/6 ⛓ teatro 1/3 `dormire` `dorme-braci` `prova-teatro` | «c'era una volta un ramo…» | — |
| `tramonto` | guarda il tramonto | S · sole, asciutto | sognante, malinconico | siediti → sospira → guardaSu | casa · `panchina`? `altalena`? | — | — | «guarda che colori» | ferma |
| `lucciole` | conta le lucciole | S · asciutto | curioso, allegro | indica → contaDita → scuoteTesta | prato · — | — | — | «una, due… tre?» | quando=estate |
| `lanterne` | accende le lanterne | S · asciutto | allegro, sognante | cammina → strofina → posa | rami · **`lanterne`** traccia `candele` (se c'è) `faro`? | ▸lanterne-accese | ⛓ luce 3/3 | «un po' di luce» | — |
| `diario-sera` | scrive il diario della giornata | S · qualsiasi | pensieroso, malinconico, sognante | scrive → legge → sospira | casa · `quaderno`? `lampada`? | — | — | «oggi è successo che…» | ferma |
| `notte-pronto` | si prepara per la notte | S · qualsiasi | assonnato | prendi → sbadiglia → soffia | casa · `berretto-notte`? `vestaglia`? | — | `dormire` | «che sonno…» | — |
| `cena-luna` | cena sotto la luna | S · sereno | allegro, sognante | posa → assaggia → brinda | davanti · `tavolino`? | — | `gruppo.cena` | «cena all'aperto!» | — |
| `stelle-sera` | guarda le stelle | S · sereno | sognante, curioso, pensieroso | siSdraia → indica → guardaSu | prato · `mantello-stelle`? `tenda`? | — | `filosofo.stelle` | «quella è l'Orsa? o una padella?» | ferma |

## Con il meteo (13)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `doccia` | si fa la doccia sotto la pioggia | MGPS · pioggia | allegro, energico | strofina → canta → siScrolla | prato · `asciugamano`? | — | — | «una bella doccia!» | mov già in azioni.ts |
| `pozzanghere` | salta nelle pozzanghere | GP · dopoPioggia | allegro, energico | salta → ride → siScrolla | davanti · traccia `pozzanghera` `stivali-pioggia`? `barchetta`? | ▸schizzi | — | «splash?» | mov |
| `secchio-pioggia` | mette il secchio sotto la pioggia | MGP · pioggia | pensieroso, furbo | posa → aspetta → esamina | davanti · `secchio`? `impermeabile`? `botte-acqua`? | +2 acqua | — | «acqua gratis!» | — |
| `leggere-ombrello` | legge sotto l'ombrello | GPS · pioggia | pensieroso, sognante | legge → guardaSu → siScrolla | casa · `ombrello`? `libro`? `impermeabile`? | — | — | «pioggia e un buon libro» | ferma |
| `pupazzo-neve` | fa il pupazzo di neve | GP · neve | allegro, energico | porta → impila → posa | prato · `berretto`? `guanti-lana`? `slittino`? | −1 legna ▸pupazzo-neve | `palle-neve` | «un amico di neve!» | mov |
| `palle-neve` | fa a palle di neve | GP · neve | energico, allegro, furbo | raccoglie → lancia → siNasconde | prato · `guanti-lana`? `berretto`? | — | — | «attento!» | mov |
| `scalda-mani` | si scalda le mani al fuoco | MS · freddo | assonnato, malinconico | strofina → soffia → sospira | davanti · traccia `fuoco` `sciarpa`? `maglione`? | — | — | «brr, che freddo» | — |
| `ventaglio` | si sventola col ventaglio | GP · caldo | assonnato, malinconico | sventola → sospira → siSdraia | casa · `ventaglio`? `parasole`? | — | — | «che caldo…» | — |
| `tinozza` | fa il bagno nella tinozza | GP · caldo | allegro, assonnato | salta → strofina → dondola | davanti · **`tinozza`** `costume-righe`? `pozzo`? `asciugamano`? `soffiabolle`? | −2 acqua ▸schizzi | — | «un bagno, subito» | — |
| `lampi` | si ripara dai lampi | GPS · temporale | malinconico, curioso | siNasconde → sbircia → trema | casa · `poncho`? | — | `rastrella-temporale` | «che rumore…» | — |
| `nebbia` | si perde nella nebbia | MG · nebbia | curioso, sognante | cammina → scuoteTesta → saltelloContento | giro · `lanterna-frontale`? | — | — | «dove sono tutti?» | mov |
| `angelo-neve` | fa l'angelo nella neve | GP · neve | allegro, sognante | siSdraia → sventola → alzati | prato · `sciarpa`? `paraorecchie`? | ▸angelo-neve | — | «un angelo, qui» | mov |
| `rastrella-temporale` | raccoglie i rami del temporale | MG · dopoTemporale | energico, pensieroso | raccoglie → porta → posa | giro · `carriola`? `poncho`? | +3 legna | `accendi-fuoco` | «quanti rami caduti!» | mov |

## Le altre azioni di oggi (libreria `azioni.ts`) (13)

Restano con il loro id: l'AI le conosce già. Valgono per tutti gli alberi; il campo `strade` di azioni.ts resta come affinità (×1,5 prima della rivelazione).

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `passeggiata` | cammina di buon passo | MGPS · qualsiasi | curioso, energico, malinconico | cammina → saluta → guardaSu | giro · `zaino`? `cappello-esploratore`? `cartelli`? `yo-yo`? | — | — | «due passi?» | mov già in azioni.ts |
| `telefonata` | è al telefono da un'ora | MGP · qualsiasi | fiero, furbo, energico | prendi → annuisce → ride | casa · `telefono`? | — | — | «devo fare una telefonata» | già in azioni.ts |
| `corsa` | corre al parco | MP · asciutto | energico, allegro, fiero | corre → asciugaFronte → saltelloContento | giro · `fascia`? `girandola`? | — | — | «voglia di correre!» | mov già in azioni.ts |
| `allenarsi` | solleva pesi fatti di ghiande | MP · qualsiasi | energico, fiero | afferra → contaDita → asciugaFronte | prato · `manubrio`? `tappetino`? | — | — | «dieci sollevamenti…» | mov già in azioni.ts |
| `dipingere` | dipinge un quadro | MGP · asciutto | sognante, allegro, malinconico | esamina → dipinge → indietreggia | prato · `cavalletto`? `pennello`? `basco`? | — | — | «un quadro nuovo!» | già in azioni.ts |
| `scrivere-poesia` | scrive una poesia | GPS · qualsiasi | sognante, malinconico, pensieroso | pensa → scrive → legge | casa · `quaderno`? `piuma`? `scrittoio`? | — | — | «una rima… quale?» | ferma già in azioni.ts |
| `meditare` | medita a gambe incrociate | MS · qualsiasi | pensieroso, assonnato | siediti → sospira → dondola | casa · `sasso-piatto`? `tappetino`? `campanelle-vento`? | — | — | «ommm…» | ferma già in azioni.ts |
| `pensare` | pensa al senso delle foglie | MGPS · qualsiasi | pensieroso, curioso | pensa → guardaSu → annuisce | casa · `scacchiera`? | — | — | «perché le foglie…?» | ferma già in azioni.ts |
| `contare-ghiande` | conta le ghiande, due volte | GS · qualsiasi | furbo, fiero | contaDita → scuoteTesta → contaDita | casa · ha `ghiande` | — | — | «le mie ghiande!» | già in azioni.ts |
| `vendere-ombra` | vende ombra a pagamento | GP · asciutto | furbo, fiero, energico | indica → saluta → contaDita | casa · `cartello`? | +1 ghiande | — | «ombra in saldo!» | già in azioni.ts |
| `studiare-mappa` | studia una mappa del mondo | GS · qualsiasi | curioso, sognante | legge → indica → pensa | casa · `mappa`? `globo`? | — | `fare-valigia` | «dove andrei…?» | già in azioni.ts |
| `giornale-ombrello` | legge i giornali finanziari sotto l'ombrello | MG · pioggia | fiero, furbo | legge → annuisce → contaDita | casa · `ombrello`? `giornale`? `cravatta`? | — | — | «le notizie della Borsa…» | ferma già in azioni.ts |
| `dormire` | dorme come un sasso | N · qualsiasi | assonnato, sognante, malinconico | sbadiglia → russa → sospira | casa · `berretto-notte`? `letto-muschio`? | — | — | «zzz…» | già in azioni.ts |

## L'imprenditore (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `imprenditore.pubblicita` | fa pubblicità col megafono di foglia | MG · asciutto | energico, fiero, allegro | prendi → canta → indica → saluta | davanti · **`bancarella`** `megafono`? | — | `imprenditore.contratta` | «Ombra fresca! Ghiande buone!» | L1 già in mestieri.ts |
| `imprenditore.contratta` | contratta con lo scoiattolo | GP · asciutto | furbo, curioso | indica → scuoteTesta → stringeMano | davanti · **`bancarella`** | +1 ghiande | `imprenditore.incasso` | «trattiamo» | L1 già in mestieri.ts |
| `imprenditore.incasso` | conta l'incasso della giornata | S · qualsiasi | fiero, furbo | contaDita → esamina → manoSuiFianchi | davanti · **`bancarella`** ha `ghiande` | — | `imprenditore.deposito` | «quanto abbiamo fatto oggi?» | L1 già in mestieri.ts |
| `imprenditore.caffe` | beve il caffè alla scrivania | M · qualsiasi | assonnato, fiero | siediti → beve → sospira | prato · **`scrivania`** `tazza`? | — | `imprenditore.telefono` | «prima il caffè» | L2 già in mestieri.ts |
| `imprenditore.telefono` | risponde al telefono | GP · qualsiasi | energico, fiero | prendi → annuisce → ride | prato · **`scrivania`** `telefono`? | — | `imprenditore.contratti` | «drin! affari!» | L2 già in mestieri.ts |
| `imprenditore.contratti` | firma contratti col timbro | GP · qualsiasi | fiero, furbo | legge → scrive → timbra | prato · **`scrivania`** `timbro`? `cravatta`? | — | — | «firma qui, e qui» | L2 già in mestieri.ts |
| `imprenditore.riunione` | fa una riunione con lo scoiattolo | P · asciutto | fiero, energico | indica → contaDita → annuisce | prato · **`scrivania`** `lavagna`? `cravatta`? `torre-holding`? | — | ⛓ negozio 2/3 `imprenditore.negozio` | «riunione alle tre» | L2 già in mestieri.ts |
| `imprenditore.chiude` | chiude l'ufficio e spegne la lampada | S · qualsiasi | assonnato, fiero | posa → soffia → sospira | prato · **`scrivania`** `lampada`? | — | `imprenditore.notte` | «per oggi basta» | L2 già in mestieri.ts |
| `imprenditore.deposito` | mette le ghiande in cassaforte | S · qualsiasi | furbo, fiero | porta → posa → contaDita | prato · **`cassaforte`** | −2 ghiande | — | «al sicuro» | L3 già in mestieri.ts |
| `imprenditore.notte` | si addormenta alla scrivania | N · qualsiasi | assonnato | sbadiglia → siediti → russa | prato · **`scrivania`** | — | — | «solo un attimo…» | L2 già in mestieri.ts |
| `imprenditore.sondaggio` | fa un sondaggio tra le formiche | GP · asciutto | curioso, energico | siChina → indica → scrive | davanti · `quaderno`? | — | ⛓ negozio 1/3 `imprenditore.riunione` | «che cosa vogliono le formiche?» | L1 |
| `imprenditore.negozio` | inaugura un negozio con le forbici | MG · asciutto | fiero, allegro | indica → afferra → applaude → saltelloContento | sfondo · **`insegna`** `forbici`? | ▸coriandoli | ⛓ negozio 3/3 `rara.festa` | «taglio il nastro!» | L2 |

## Il filosofo (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `filosofo.vento` | fa domande al vento | MG · asciutto, vento | pensieroso, curioso | guardaSu → indica → pensa | casa · `campanelle-vento`? | — | — | «vento, dove vai?» | L1 già in mestieri.ts |
| `filosofo.aforismi` | scrive aforismi sulle foglie | GP · qualsiasi | pensieroso, fiero | raccoglie → scrive → annuisce | casa · `toga-filosofo`? | −1 foglie | ⛓ scuola 1/3 `filosofo.lezione` | «una frase per ogni foglia» | L1 già in mestieri.ts |
| `filosofo.formiche` | osserva le formiche con la lente | P · asciutto | curioso, pensieroso | siChina → esamina → annuisce | davanti · `lente`? `fossile`? | — | `filosofo.lumaca` | «dove vanno tutte?» | L1 già in mestieri.ts |
| `filosofo.lumaca` | discute con la lumaca | PS · asciutto | pensieroso, allegro | siediti → indica → scuoteTesta | prato · **`panchina`** | — | — | «la lumaca ha ragione?» | L2 già in mestieri.ts |
| `filosofo.biblioteca` | consulta la biblioteca di cortecce | G · qualsiasi | curioso, pensieroso | esamina → legge → annuisce | sfondo · **`biblioteca`** `occhiali-tondi`? | — | — | «c'era un libro su questo» | ferma L2 già in mestieri.ts |
| `filosofo.stelle` | guarda le stelle col cannocchiale | S · sereno | sognante, curioso | esamina → guardaSu → indica | prato · **`cannocchiale`** `osservatorio`? `mantello-stelle`? | — | — | «quante sono?» | L3 già in mestieri.ts |
| `filosofo.sasso` | medita sul sasso piatto | MS · qualsiasi | pensieroso, assonnato | siediti → sospira → pensa | davanti · `sasso-piatto`? | — | — | «il sasso sa qualcosa» | ferma L1 |
| `filosofo.trattato` | scrive un trattato e lo perde | GP · qualsiasi | pensieroso, fiero | scrive → cammina → scuoteTesta | casa · `quaderno`? `leggio`? | — | — | «il mio capolavoro… dov'è?» | ferma L2 |
| `filosofo.lezione` | tiene lezione agli alberi della stanza (da solo, alle formiche) | P · asciutto | fiero, allegro | indica → scrive → annuisce | prato · `lavagna`? `aula`? `toga-filosofo`? | — | ⛓ scuola 2/3 `filosofo.scuola` | «oggi parliamo dell'ombra» | L2 |
| `filosofo.pozzanghera` | si chiede se esiste mentre si guarda nella pozzanghera | GP · dopoPioggia | pensieroso, malinconico | siChina → sbircia → pensa | davanti · traccia `pozzanghera` | — | — | «quello sono io?» | ferma L1 |
| `filosofo.scacchi` | gioca a scacchi da solo e perde | PS · qualsiasi | pensieroso, furbo | pensa → posa → scuoteTesta | prato · **`scacchiera`** `sgabello`? | — | — | «stavolta vinco io. Cioè, io.» | ferma L2 |
| `filosofo.scuola` | fonda la scuola sotto la chioma | MG · asciutto | fiero, energico | posa → scrive → applaude | prato · **`panchina`** `lavagna`? | — | ⛓ scuola 3/3 `gruppo.lezione` | «una scuola, ecco che cosa ci vuole» | L2 |

## L'artista (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `artista.dipinge` | dipinge un quadro | MG · asciutto | sognante, allegro | esamina → dipinge → indietreggia | prato · **`cavalletto`** `pennello`? `basco`? | — | ⛓ quadro 3/5 `artista.appende` | «oggi la luce è giusta» | L1 già in mestieri.ts |
| `artista.ispirazione` | cerca l'ispirazione | P · qualsiasi | malinconico, sognante | cammina → guardaSu → sospira | giro · — | — | — | «dove sei, ispirazione?» | L1 già in mestieri.ts |
| `artista.colori` | mescola i colori e si sporca | G · asciutto | allegro, curioso | mescola → esamina → ride | davanti · `tavolozza`? `grembiule-pittore`? | ▸macchie-colore | `artista.dipinge` | «più blu. No, più verde» | L1 già in mestieri.ts |
| `artista.scolpisce` | scolpisce un ramo | P · asciutto | pensieroso, fiero | esamina → gratta → colpi → soffia | prato · **`atelier`** `scalpello`? | −1 legna ▸trucioli | — | «c'è qualcosa dentro questo ramo» | L2 già in mestieri.ts |
| `artista.mostra` | fa da guida alla sua mostra | PS · asciutto | fiero, allegro | indica → siInchina → applaude | sfondo · **`galleria`** `papillon`? `scultura`? | — | ⛓ quadro 5/5 | «e questo, signori…» | L3 già in mestieri.ts |
| `artista.colori-bacche` | fa i colori con le bacche | GP · asciutto | curioso, allegro | raccoglie → strizza → mescola | davanti · `vasetti`? `grembiule-pittore`? | −2 bacche ▸macchie-colore | ⛓ quadro 2/5 `artista.dipinge` | «il rosso delle bacche!» | L1 |
| `artista.ritratto` | ritrae gli altri alberi (sembrano patate) | P · asciutto | allegro, furbo | esamina → dipinge → ride | prato · **`cavalletto`** | — | `gruppo.ritratto` | «stai fermo… così» | L2 |
| `artista.neve` | scolpisce la neve | GP · neve | allegro, fiero | raccoglie → gratta → indietreggia | prato · `paraorecchie`? | ▸scultura-neve | — | «una statua di neve!» | L1 |
| `artista.mosaico` | fa un mosaico di sassi | GP · asciutto | pensieroso, sognante | posa → impila → esamina | davanti · — | −3 sassi ▸mosaico | — | «ogni sasso al suo posto» | L1 |
| `artista.appende` | appende un quadro e lo raddrizza tre volte | GP · qualsiasi | pensieroso, fiero | martella → indietreggia → scuoteTesta | sfondo · `martello`? | ▸quadro-appeso | ⛓ quadro 4/5 `artista.mostra` | «è storto… no, ora sì» | L2 |
| `artista.murale` | dipinge un murale sulla casetta | GP · asciutto | energico, sognante | prendi → dipinge → indietreggia | sfondo · **`casetta`** `pennello`? | −2 bacche ▸murale | — | «una parete tutta bianca…» | L2 |
| `artista.vende` | vende un quadro allo scoiattolo per una ghianda | P · asciutto | allegro, furbo | indica → stringeMano → saltelloContento | davanti · traccia `quadro-appeso` | +1 ghiande | — | «un capolavoro, quasi regalato» | L2 |

## Lo sportivo (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `sportivo.stretching` | fa stretching | M · qualsiasi | energico, assonnato | siStiracchia → siChina → contaDita | prato · `tappetino`? `fascia`? `spogliatoio`? | — | `sportivo.corsa` | «prima ci si scalda» | L1 già in mestieri.ts |
| `sportivo.corsa` | corre al parco | MG · asciutto | energico, fiero | corre → asciugaFronte → saltelloContento | giro · `fascia`? | — | — | «un altro giro!» | mov L1 già in mestieri.ts |
| `sportivo.salto` | fa salto in lungo | P · asciutto | energico, fiero | corre → salta → indica | prato · `fettuccia`? `visiera`? | — | `sportivo.record` | «oltre quel sasso!» | mov L1 già in mestieri.ts |
| `sportivo.trazioni` | fa trazioni alla sbarra | GP · asciutto | energico, fiero | afferra → contaDita → asciugaFronte | prato · **`sbarra`** | — | ⛓ torneo 1/5 `sportivo.braccio-ferro` | «dieci! …facciamo otto» | mov L2 già in mestieri.ts |
| `sportivo.ostacoli` | fa il percorso a ostacoli | P · asciutto | energico, fiero | corre → salta → manoSuiFianchi | prato · **`ostacoli`** `canottiera-numero`? | — | — | «tempo record!» | mov L3 già in mestieri.ts |
| `sportivo.premiazione` | si premia sul podio | S · asciutto | fiero, allegro | salta → siInchina → applaude | prato · **`podio`** | — | ⛓ torneo 5/5 | «e il vincitore è… io» | L3 già in mestieri.ts |
| `sportivo.braccio-ferro` | sfida a braccio di ferro (da solo, lo scoiattolo) | P · qualsiasi | fiero, energico | afferra → trema → saltelloContento | davanti · `tavolino`? | — | ⛓ torneo 2/5 `gruppo.braccio-ferro` `sportivo.corsa-stanza` | «chi mi sfida?» | L1 |
| `sportivo.fischietto` | allena lo scoiattolo col fischietto | MG · asciutto | energico, fiero | fischia → indica → applaude | prato · `fischietto`? | — | — | «forza, scoiattolo!» | mov L2 |
| `sportivo.tronchi` | solleva tronchi | MP · asciutto | energico, fiero | siChina → afferra → asciugaFronte | prato · ha `legna` | — | — | «questo è leggero» | mov L1 |
| `sportivo.yoga` | fa yoga al tramonto | S · asciutto | pensieroso, sognante | siStiracchia → dondola → sospira | prato · `tappetino`? | — | — | «respira…» | L1 |
| `sportivo.record` | misura il record con la fettuccia | P · asciutto | fiero, curioso | cammina → indica → scrive | prato · **`fettuccia`** `visiera`? | — | — | «quanto ho fatto?» | L2 |
| `sportivo.corsa-stanza` | organizza la corsa della stanza | MG · asciutto | energico, fiero | fischia → indica → corre | giro · `fischietto`? `bandierine`? | — | ⛓ torneo 3/5 `gruppo.torneo` | «tutti ai blocchi!» | mov L3 |

## Il furfante del bosco (12)

Caricatura innocua del boss da film: cappello, gessato, «affari» di ghiande. Niente parole o simboli della criminalità vera, niente violenza, niente accenti presi in giro. Quello che prende lo restituisce.

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `furfante.nasconde` | nasconde le ghiande | MG · asciutto | furbo | scava → posa → sbircia | prato · `bandana`? `nascondiglio`? | −2 ghiande ▸buca | ⛓ banda 1/6 `furfante.bottino` `furfante.piani` | «qui non le trova nessuno» | L1 già in mestieri.ts |
| `furfante.travestimento` | si traveste da cespuglio | G · asciutto | furbo, allegro | raccoglie → siNasconde → sbircia | prato · `mantello-foglie`? | −2 foglie | `furfante.spia` | «sono un cespuglio» | L1 già in mestieri.ts |
| `furfante.spia` | spia lo scoiattolo | P · asciutto | furbo, curioso | siNasconde → sbircia → indica | giro · `binocolo`? `bandana`? | — | — | «che cosa trama lo scoiattolo?» | L1 già in mestieri.ts |
| `furfante.bottino` | conta il bottino | S · qualsiasi | furbo, fiero | contaDita → ride → contaDita | casa · ha `ghiande` `corona-foglie`? | — | — | «il colpo del secolo… quasi» | L1 già in mestieri.ts |
| `furfante.mercato` | vende ghiande d'importazione | P · asciutto | furbo, energico | sbircia → indica → stringeMano | prato · **`mercato`** | +2 ghiande | — | «roba fina, arrivata stanotte» | L2 già in mestieri.ts |
| `furfante.piani` | disegna piani segreti alla lavagna | GP · qualsiasi | furbo, pensieroso | scrive → indica → ride | prato · `lavagna`? | — | ⛓ banda 2/6 `furfante.galleria` | «il piano perfetto» | L1 |
| `furfante.codice` | manda messaggi in codice con le foglie | GP · asciutto, vento | furbo, curioso | raccoglie → scrive → lancia | prato · — | −1 foglie | — | «la foglia parte a mezzogiorno» | L1 |
| `furfante.guardia` | fa la guardia col cappello calato | S · qualsiasi | furbo, assonnato | manoSuiFianchi → sbircia → sbadiglia | davanti · `cappello-boss`? | — | — | «qui non passa nessuno» | L1 |
| `furfante.specchio` | prova l'aria da duro davanti allo specchio | M · qualsiasi | fiero, furbo | sbircia → manoSuiFianchi → ride | casa · `specchio`? `cappello-boss`? `pettine`? | — | — | «faccia da duro… così?» | L1 |
| `furfante.galleria` | scava una galleria (e sbuca nell'orto) | GP · asciutto | energico, furbo | scava → siNasconde → sbircia | prato · `pala`? `lanterna-frontale`? | ▸galleria-scavata | ⛓ banda 3/6 `furfante.riunione` | «dritto verso il covo» | mov L2 |
| `furfante.riunione` | convoca la riunione della banda di notte | S · qualsiasi | furbo, fiero | indica → contaDita → annuisce | sfondo · `covo`? `lanterne`? `cappello-boss`? `giacca-gessata`? | — | ⛓ banda 4/6 `gruppo.colpo` | «riunione della banda, stanotte» | L2 |
| `furfante.restituisce` | restituisce di nascosto quello che ha preso | M · asciutto | malinconico, furbo | sbircia → posa → corre | giro · — | −1 ghiande | ⛓ banda 6/6 | «forse è meglio ridarla…» | L1 |

## Il viaggiatore (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `viaggiatore.zaino` | prepara lo zaino | M · qualsiasi | curioso, energico | posa → impila → manoSuiFianchi | casa · `zaino`? | — | ⛓ viaggio 1/5 `viaggiatore.mappa` | «borraccia, mappa, ghianda di scorta» | L1 già in mestieri.ts |
| `viaggiatore.mappa` | studia la mappa | G · qualsiasi | curioso, sognante | legge → indica → pensa | casa · `mappa`? `globo`? | — | ⛓ viaggio 2/5 `viaggiatore.binocolo` | «di qua? di là?» | L1 già in mestieri.ts |
| `viaggiatore.binocolo` | guarda lontano col binocolo | P · asciutto | curioso, sognante | prendi → esamina → indica | casa · `binocolo`? `cappello-esploratore`? `faro`? | — | ⛓ viaggio 3/5 `viaggiatore.tenda` | «laggiù c'è il mare? No, è una pozzanghera» | L1 già in mestieri.ts |
| `viaggiatore.cartoline` | scrive cartoline | S · qualsiasi | sognante, allegro | scrive → posa → sospira | sfondo · **`bacheca`** `chiosco-agenzia`? | — | — | «saluti da… qui» | L2 già in mestieri.ts |
| `viaggiatore.partenza` | fa finta di partire, e torna | P · asciutto | energico, sognante | saluta → cammina → saltelloContento | sfondo · **`mongolfiera`** `valigia`? | — | — | «stavolta parto davvero» | L3 già in mestieri.ts |
| `viaggiatore.aereo` | piega un aereo di carta e lo lancia | GP · asciutto, vento | allegro, sognante | strofina → lancia → guardaSu | prato · — | −1 foglie | — | «destinazione: oltre il muretto» | L1 |
| `viaggiatore.foto` | fotografa la stanza con una macchina di cartone | GP · asciutto | curioso, allegro | esamina → indica → ride | giro · **`macchina-cartone`** | — | `viaggiatore.cartoline` | «sorridi, scoiattolo!» | L1 |
| `viaggiatore.tenda` | prova la tenda | PS · asciutto | curioso, energico | tira → posa → siNasconde | prato · **`tenda`** `cappello-esploratore`? | ▸tenda-montata | ⛓ viaggio 4/5 `viaggiatore.racconti` | «si dorme fuori, stanotte?» | L2 |
| `viaggiatore.saluto` | impara un saluto in un'altra lingua | MG · qualsiasi | curioso, allegro | legge → saluta → siInchina | casa · `libro`? | — | — | «come si dice «ciao»?» | L1 |
| `viaggiatore.esotico` | cucina un piatto «esotico» con le ghiande | GS · qualsiasi | curioso, fiero | mescola → annusa → assaggia | davanti · **`pentola`** traccia `fuoco` `cappello-cuoco`? | −2 ghiande | `gruppo.cena` | «una ricetta da lontano (inventata)» | L2 |
| `viaggiatore.racconti` | racconta viaggi mai fatti | S · qualsiasi | sognante, fiero | indica → sventola → ride | casa · `globo`? | — | ⛓ viaggio 5/5 | «quella volta in montagna…» | L1 |
| `viaggiatore.bottiglia` | lancia un messaggio in bottiglia nella pozzanghera | GP · dopoPioggia | sognante, malinconico | scrive → lancia → guardaSu | davanti · traccia `pozzanghera` `bottiglia`? `barchetta`? | — | — | «chissà chi lo troverà» | L1 |

## Il poeta pigro (12)

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `poeta.scrive` | scrive e cancella | MG · qualsiasi | sognante, malinconico | scrive → strofina → sospira | casa · `quaderno`? `piuma`? | — | — | «no. No. Forse.» | ferma L1 già in mestieri.ts |
| `poeta.recita` | recita alle formiche | P · asciutto | fiero, sognante | legge → indica → siInchina | davanti · `piuma`? | — | — | «ascoltate, formiche» | L1 già in mestieri.ts |
| `poeta.rima` | cerca una rima | G · qualsiasi | pensieroso, sognante | pensa → contaDita → annuisce | casa · — | — | ⛓ serata 2/4 `poeta.versi` | «cuore… fiore… trattore?» | ferma L1 già in mestieri.ts |
| `poeta.amaca` | sonnecchia in amaca | P · asciutto | assonnato, sognante | siSdraia → dondola → russa | rami · **`amaca`** | — | — | «solo un verso, poi dormo» | ferma L2 già in mestieri.ts |
| `poeta.versi` | appende un verso al filo | S · asciutto | fiero, sognante | scrive → afferra → posa | rami · **`filo`** | — | ⛓ serata 3/4 `poeta.serata` | «questo merita il filo» | L3 già in mestieri.ts |
| `poeta.detta` | detta una poesia allo scoiattolo | GP · qualsiasi | assonnato, fiero | siSdraia → indica → sbadiglia | casa · `calzini-spaiati`? | — | — | «scrivi tu, io detto» | ferma L1 |
| `poeta.sillabe` | conta le sillabe sulle foglie | GP · qualsiasi | pensieroso, curioso | raccoglie → contaDita → scuoteTesta | casa · — | −1 foglie | ⛓ serata 1/4 `poeta.rima` | «undici? dodici?» | ferma L1 |
| `poeta.gara-rime` | fa una gara di rime (da solo, con l'eco) | PS · qualsiasi | allegro, fiero | indica → ride → applaude | prato · — | — | `gruppo.gara-rime` | «rima con ghianda… chi la manda?» | L2 |
| `poeta.neve` | scrive un verso sulla neve | GP · neve | sognante, allegro | siChina → dipinge → sospira | prato · — | ▸verso-neve | — | «un verso che si scioglie» | L1 |
| `poeta.tramonto` | si commuove per un tramonto | S · sole, asciutto | malinconico, sognante | guardaSu → sospira → asciugaFronte | casa · `panchina`? | — | — | «troppo bello…» | ferma L1 |
| `poeta.serata` | organizza una serata di poesia | S · asciutto | fiero, allegro | posa → indica → siInchina | sfondo · `palco`? `lanterne`? `sedie-ceppo`? `papillon`? `leggio`? | — | ⛓ serata 4/4 `gruppo.coro` | «stasera, poesia per tutti» | L3 |
| `poeta.pisolino` | rinuncia a scrivere e fa un pisolino | GP · qualsiasi | assonnato | scrive → sbadiglia → russa | casa · `calzini-spaiati`? `amaca`? | — | — | «domani. Domani scrivo.» | ferma L1 base=6 |

## Rare (sorprese) (20)

`quando` è la condizione che il codice controlla; `p` è la probabilità al giorno quando la condizione vale (proposta, da tarare con `npm run simula`). Una sorpresa a settimana è garantita (sezione 3.3): se in 7 giorni non ne è uscita nessuna, la prossima giornata ne pesca una tra quelle ammesse.

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `rara.ospite` | accoglie un ospite inatteso e gli offre una tisana | GPS · qualsiasi | curioso, allegro | saluta → versa → siInchina | davanti · `tazza`? | −1 acqua +1 piume | — | «arriva qualcuno?» | quando=sempre p=0,03 |
| `rara.festa` | fa una festa improvvisata | PS · asciutto | allegro, energico | balla → lancia → applaude | prato · `cappello-festa`? `bandierine`? | ▸coriandoli ▸festoni | — | «si festeggia!» | quando=dopo-cantiere p=0,5 |
| `rara.eclissi` | guarda col cannocchiale il sole che si scurisce un attimo | G · asciutto | curioso, sognante | guardaSu → esamina → indica | prato · `cannocchiale`? | — | — | «che succede al sole?» | quando=sempre p=0,002 |
| `rara.tesoro` | trova un tesoro sepolto | GP · asciutto | curioso, energico | scava → esamina → saltelloContento | prato · `pala`? `tesoro`? | ▸buca | — | «qui sotto c'è qualcosa» | quando=dopo-scavo p=0,04 |
| `rara.stelle-cadenti` | esprime un desiderio sotto la pioggia di stelle | SN · sereno | sognante | guardaSu → indica → scrive | prato · `quaderno`? | — | — | «una stella cadente!» | quando=agosto-10-13 p=0,5 |
| `rara.circo` | fa il giocoliere con le ghiande | P · asciutto | allegro, energico | lancia → afferra → siInchina | prato · ha `ghiande` `palline-giocoliere`? `cilindro-circo`? `trottola`? | — | — | «guardate qua!» | quando=sempre p=0,016 |
| `rara.ruscello` | va in gita al ruscello e torna con un sasso speciale | G · asciutto | curioso, allegro | cammina → siChina → raccoglie | giro · `zaino`? `canna-pesca`? | +1 sassi +1 acqua | — | «andiamo al ruscello?» | quando=estate p=0,05 |
| `rara.arcobaleno` | corre a cercare la fine dell'arcobaleno | GP · sole, dopoPioggia | allegro, sognante | indica → corre → scuoteTesta | giro · — | — | — | «la fine è là!» | quando=sole-dopo-pioggia p=0,5 |
| `rara.bottiglia` | trova una lettera nella bottiglia | GP · qualsiasi | curioso, sognante | raccoglie → legge → sospira | davanti · — | — | `viaggiatore.bottiglia` | «che cos'è quel luccichio?» | quando=sempre p=0,01 |
| `rara.primo-fiore` | si commuove per il primo fiore | MG · asciutto | sognante, allegro | siChina → annusa → saluta | prato · `ghirlanda-fiori`? | — | — | «un fiore!» | quando=primo-giorno-primavera p=1 |
| `rara.foglia-oro` | trova la foglia d'oro e la conserva nel libro | GP · asciutto | sognante, fiero | afferra → esamina → posa | casa · `libro`? | — | — | «una foglia d'oro!» | quando=autunno-una-volta p=0,02 |
| `rara.ballo-neve` | balla con i fiocchi della prima neve | GP · neve | allegro, sognante | guardaSu → balla → ride | prato · — | — | — | «la prima neve!» | quando=prima-neve-anno p=1 |
| `rara.notte-lucciole` | la notte delle lucciole: la stanza si accende | S · sereno, caldo | sognante, allegro | indica → dondola → applaude | prato · — | — | — | «quante luci…» | quando=estate p=0,05 |
| `rara.cicale` | dirige il concerto delle cicale con un rametto | P · caldo | allegro, fiero | afferra → sventola → siInchina | casa · `ventaglio`? | — | — | «maestro, attacchi!» | quando=caldo30 p=0,1 |
| `rara.compleanno` | festeggia il compleanno con la torta di muschio | MGPS · qualsiasi | allegro, fiero | soffia → applaude → saltelloContento | prato · `cappello-festa`? | ▸festoni | — | «oggi è il mio giorno» | quando=ogni-365-giorni p=1 |
| `rara.formica` | aiuta una formica col bagaglio del trasloco | GP · asciutto | curioso, allegro | siChina → porta → saluta | giro · — | — | — | «quel bagaglio è enorme» | quando=sempre p=0,01 |
| `rara.sfida-scoiattolo` | sfida lo scoiattolo a una corsa (vince lui) | GP · asciutto | energico, fiero | corre → asciugaFronte → stringeMano | giro · — | — | — | «stavolta ti batto» | mov quando=sempre p=0,01 |
| `rara.sogno` | parla nel sonno: un fumetto buffo | N · qualsiasi | sognante | russa → ride → russa | casa · — | — | — | «zzz… ghiande…» | quando=notte p=0,03 |
| `rara.fossile` | trova una foglia di pietra | GP · asciutto | curioso | scava → esamina → saltelloContento | prato · `pala`? | ▸buca | `filosofo.formiche` | «una foglia… di pietra?» | quando=dopo-scavo p=0,005 |
| `rara.contrario` | fa tutto al contrario e cammina all'indietro | MGPS · qualsiasi | allegro, furbo | indietreggia → saluta → ride | giro · — | — | — | «onroignoub!» | quando=1-aprile p=1 |

## Passi delle catene e delle imprese libere (17)

Non sono nell'elenco della sezione 5 del progetto, ma servono: sono i passi delle catene (sezione 4.2) e le attività delle imprese libere (sezione 6).

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `raccoglie-ortaggi` | raccoglie le verdure dell'orto | MG · asciutto | allegro, fiero | siChina → raccoglie → porta | prato · traccia `orto-germogli` `cesto`? `spaventapasseri`? | +1 semi ▸cesto-verdure | ⛓ orto 4/5 `cucina-zuppa` | «sono pronte!» | mov |
| `schiaccia-bacche` | schiaccia le bacche nella ciotola | GP · qualsiasi | allegro, curioso | strizza → mescola → assaggia | davanti · `pentola`? | −3 bacche ▸bacche-schiacciate | ⛓ marmellata 2/5 `cuoce-marmellata` | «una marmellata, ecco» | — |
| `cuoce-marmellata` | cuoce la marmellata sul fuoco | PS · asciutto | fiero, allegro | mescola → soffia → assaggia | davanti · **`pentola`** traccia `fuoco` traccia `bacche-schiacciate` `cappello-cuoco`? | — | ⛓ marmellata 3/5 `riempie-vasetti` | «che profumo…» | — |
| `riempie-vasetti` | riempie i vasetti di marmellata | GP · qualsiasi | fiero, pensieroso | versa → posa → contaDita | davanti · **`vasetti`** `dispensa`? `orecchini-ciliegia`? | ▸vasetti-pieni | ⛓ marmellata 4/5 `regala-vasetti` | «uno, due, tre vasetti» | — |
| `regala-vasetti` | regala i vasetti allo scoiattolo | GP · asciutto | allegro | porta → saluta → stringeMano | giro · traccia `vasetti-pieni` `cuccia-scoiattolo`? | — | ⛓ marmellata 5/5 | «questo è per te!» | mov |
| `invita-fuoco` | invita gli altri alberi (o lo scoiattolo) al fuoco | S · asciutto | allegro, sognante | saluta → indica → applaude | davanti · traccia `fuoco` `sedie-ceppo`? | — | ⛓ fuoco 4/6 `storie-fuoco` | «venite, c'è posto!» | — |
| `dorme-braci` | si addormenta vicino alle braci | SN · asciutto | assonnato, sognante | sbadiglia → siediti → russa | davanti · traccia `braci` `vestaglia`? | — | ⛓ fuoco 6/6 | «che tepore…» | — |
| `intreccia-corda` | intreccia una corda robusta | GP · qualsiasi | pensieroso, fiero | intreccia → tira → annuisce | casa · — | −3 fili | ⛓ altalena 2/4 `monta-altalena` | «questa regge anche me» | — |
| `monta-altalena` | appende l'altalena al ramo più forte | GP · asciutto | energico, fiero | tira → martella → saltelloContento | rami · **`corda`** `martello`? `sega`? | −1 legna | ⛓ altalena 3/4 `altalena` | «un'altalena tutta mia!» | mov |
| `costruisce-forno` | costruisce il forno di sassi | GP · asciutto | energico, fiero | porta → impila → asciugaFronte | prato · traccia `muretto` | −3 sassi | ⛓ forno 3/4 `impasta-pane` | «un forno, per il pane» | mov |
| `impasta-pane` | impasta il pane di ghiande e lo inforna | MG · qualsiasi | allegro, fiero | strofina → impila → annusa | davanti · **`forno`** traccia `farina` (se c'è) `cappello-cuoco`? | −1 ghiande −1 legna ▸pane | ⛓ forno 4/4 `gruppo.cena` | «profumo di pane» | — |
| `fa-candele` | fa le candele di resina | PS · qualsiasi | pensieroso, sognante | strofina → posa → soffia | casa · — | −2 resina −1 fili ▸candele | ⛓ luce 2/3 `lanterne` | «un po' di luce per la sera» | — |
| `macina-ghiande` | macina le ghiande al mulino | GP · vento | energico, curioso | porta → versa → guardaSu | sfondo · **`mulino`** | −2 ghiande ▸farina | `impasta-pane` | «il mulino gira!» | mov |
| `allena-squadra` | para i rigori dello scoiattolo | GP · asciutto | energico, allegro | salta → afferra → applaude | prato · **`pallone`** **`porta-calcio`** `canottiera-numero`? | — | `gruppo.partita` | «para tutto, oggi» | mov |
| `suona-tamburo` | suona il tamburo di corteccia | GPS · qualsiasi | allegro, energico | colpi → dondola → ride | casa · **`tamburo`** | — | ⛓ musica 3/3 `gruppo.coro` | «bum, bum-bum» | — |
| `prova-teatro` | prova la parte con le maschere | PS · qualsiasi | fiero, sognante | sventola → siInchina → indica | sfondo · **`maschere-teatro`** `teatro`? | — | ⛓ teatro 2/3 `spettacolo-teatro` | «essere o non essere un pino?» | — |
| `spettacolo-teatro` | va in scena davanti al pubblico del bosco | S · asciutto | fiero, allegro | siInchina → canta → applaude | sfondo · **`maschere-teatro`** `teatro`? `sedie-ceppo`? | — | ⛓ teatro 3/3 | «stasera si va in scena!» | — |

## Con i giochi e i regali (10)

Ogni gioco e ogni regalo apre almeno un'attività (sezione 11): si fanno solo se l'oggetto c'è.

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `pedala` | va in bicicletta per la stanza e suona il campanello | GP · asciutto | allegro, energico | siediti → dondola → fischia | giro · **`bici`** | — | — | «drin drin!» | mov |
| `ripara-aquilone` | ripara l'aquilone dopo il temporale | GP · qualsiasi | pensieroso, fiero | esamina → intreccia → annuisce | casa · **`aquilone`** | −1 fili | `aquilone` | «si è strappato…» | — |
| `slittino` | scende con lo slittino dal mucchio di neve | GP · neve | allegro, energico | tira → siediti → ride | prato · **`slittino`** `berretto`? | — | — | «wiiii!» | mov |
| `trottola` | fa girare la trottola | GPS · qualsiasi | curioso, allegro | siChina → lancia → guardaSu | davanti · **`trottola`** | — | — | «quanto gira?» | — |
| `salta-corda` | salta la corda | MGP · asciutto | energico, allegro | dondola → saltella → contaDita | prato · **`corda-salto`** | — | — | «cento! …dieci» | mov |
| `bocce` | gioca a bocce coi sassi | PS · asciutto | pensieroso, furbo | esamina → lancia → annuisce | prato · **`bocce-sassi`** | — | — | «un pelo più a sinistra» | — |
| `domino` | mette in fila il domino di corteccia e lo fa cadere | GP · qualsiasi | pensieroso, allegro | posa → impila → applaude | davanti · **`domino-corteccia`** | — | — | «tutti giù!» | — |
| `yo-yo` | gioca con lo yo-yo | GP · qualsiasi | allegro, curioso | lancia → afferra → ride | casa · **`yo-yo`** | — | — | «su e giù» | — |
| `cerchio` | fa girare il cerchio in vita | GP · asciutto | allegro, energico | dondola → balla → ride | prato · **`cerchio`** | — | — | «non cade, non cade…» | mov |
| `girandola` | corre con la girandola contro il vento | GP · vento | allegro, sognante | afferra → corre → guardaSu | giro · **`girandola`** | — | — | «gira, gira!» | mov |

## Di gruppo (due o più alberi nella stessa stanza) (17)

Si scelgono quando almeno due alberi della stanza sono liberi nella stessa fascia (sezione 5.4). I gesti sono quelli di chi la guida; gli altri fanno la versione del loro ruolo o guardano e applaudono. Le rivalità sono buffe, mai cattive.

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `gruppo.cena` | cenano insieme sotto la luna | S · sereno | allegro, sognante | posa → assaggia → brinda | davanti · `tavolino`? `sedie-ceppo`? traccia `pane` (se c'è) | −1 ghiande | — | «cena tutti insieme?» | gruppo |
| `gruppo.ombra` | litigano per chi ha più ombra | GP · sole | furbo, fiero | indica → scuoteTesta → ride | prato · — | — | — | «quest'ombra è mia!» | gruppo |
| `gruppo.foto` | si mettono in posa per la foto di gruppo | GP · asciutto | allegro, fiero | cammina → manoSuiFianchi → ride | prato · `macchina-cartone`? `occhiali`? | — | ⛓ calcio 3/3 | «tutti dentro!» | gruppo |
| `gruppo.partita` | fanno una partita a palla | GP · asciutto | energico, allegro | calcia → corre → applaude | prato · **`pallone`** `porta-calcio`? `canottiera-numero`? | — | ⛓ calcio 2/3 `gruppo.foto` | «partita!» | mov gruppo |
| `gruppo.bancarella` | tengono la bancarella insieme | GP · asciutto | furbo, allegro | indica → contaDita → stringeMano | davanti · **`bancarella`** | +1 ghiande | — | «affari in società» | gruppo |
| `gruppo.ombrello` | fanno riunione sotto un ombrello solo | GP · pioggia | allegro, pensieroso | siNasconde → annuisce → ride | casa · **`ombrello`** | — | — | «stringetevi!» | gruppo |
| `gruppo.colpo` | il colpo della banda: la mela più rossa del giardino | SN · qualsiasi | furbo, allegro | sbircia → siNasconde → corre | giro · `giacca-gessata`? `cappello-boss`? | — | ⛓ banda 5/6 `furfante.restituisce` | «stanotte, la mela più rossa» | mov gruppo |
| `gruppo.giardiniere` | scappano dal giardiniere (che non arriva mai) | GP · asciutto | allegro, energico | sbircia → corre → siNasconde | giro · — | — | — | «arriva il giardiniere!» | mov gruppo |
| `gruppo.compleanno` | festa di compleanno di un albero della stanza | PS · qualsiasi | allegro | soffia → applaude → balla | prato · `cappello-festa`? `bandierine`? `palline-giocoliere`? | ▸festoni | — | «auguri!» | gruppo |
| `gruppo.lettera` | scrivono una lettera firmata da tutti | S · qualsiasi | sognante, allegro | scrive → annuisce → ride | casa · `quaderno`? | — | — | «firmiamo tutti» | gruppo |
| `gruppo.storie` | raccontano storie al fuoco, a turno | S · asciutto | sognante, allegro | indica → sventola → ride | davanti · traccia `fuoco` `sedie-ceppo`? | — | — | «una storia a testa» | gruppo |
| `gruppo.coro` | il coro della sera | S · qualsiasi | allegro, sognante | canta → dondola → siInchina | prato · `flauto`? `tamburo`? `leggio`? | — | — | «tutti insieme: la-la-la» | gruppo |
| `gruppo.braccio-ferro` | braccio di ferro | P · qualsiasi | fiero, energico | afferra → trema → ride | davanti · `tavolino`? | — | — | «chi vince?» | gruppo |
| `gruppo.gara-rime` | gara di rime | PS · qualsiasi | allegro, fiero | indica → ride → applaude | prato · — | — | — | «rima baciata, rima sbagliata» | gruppo |
| `gruppo.lezione` | la lezione del filosofo | GP · asciutto | pensieroso, curioso | indica → scrive → annuisce | prato · `lavagna`? `aula`? `toga-filosofo`? | — | — | «silenzio, si pensa» | gruppo |
| `gruppo.ritratto` | il ritratto di gruppo dell'artista | P · asciutto | allegro | manoSuiFianchi → dipinge → ride | prato · **`cavalletto`** | — | — | «fermi tutti!» | gruppo |
| `gruppo.torneo` | il torneo della stanza | GP · asciutto | energico, fiero | corre → salta → applaude | prato · `podio`? `bandierine`? `canottiera-numero`? | — | ⛓ torneo 4/5 `sportivo.premiazione` | «che vinca il migliore!» | mov gruppo |

## Intermezzi (pochi secondi tra un ciclo e l'altro) (10)

Si alternano a caso (sezione 5.5), non contano nella giornata e non lasciano tracce.

| Id | Attività | Quando | Umori | Gesti | Posto · oggetti | Risorse · tracce | Porta a | Nuvoletta | Segni |
|---|---|---|---|---|---|---|---|---|---|
| `intermezzo.beve` | beve un sorso | MGPS · qualsiasi | — | beve | casa · `tazza`? | — | — | — | — |
| `intermezzo.stiracchia` | si stiracchia | MGPS · qualsiasi | — | siStiracchia | casa · — | — | — | — | — |
| `intermezzo.sbadiglia` | sbadiglia | MGPS · qualsiasi | — | sbadiglia | casa · — | — | — | — | — |
| `intermezzo.gratta` | si gratta la corteccia | MGPS · qualsiasi | — | gratta | casa · — | — | — | — | — |
| `intermezzo.guarda` | guarda un oggetto e sorride | MGPS · qualsiasi | — | esamina → ride | casa · un trofeo qualsiasi (se c'è) un rarita qualsiasi (se c'è) un stagione qualsiasi (se c'è) `mensola-trofei`? `cassetta-lettere`? | — | — | — | — |
| `intermezzo.sistema` | sistema un oggetto storto | MGPS · qualsiasi | — | posa → manoSuiFianchi | prato · — | — | — | — | — |
| `intermezzo.scoiattolo` | saluta lo scoiattolo che passa | MGP · asciutto | — | saluta | casa · — | — | — | — | — |
| `intermezzo.starnuto` | starnutisce per il polline | MGP · asciutto | — | starnutisce | casa · — | — | — | — | quando=primavera |
| `intermezzo.siede` | si siede un attimo | MGPS · qualsiasi | — | siediti → alzati | casa · `sgabello`? | — | — | — | — |
| `intermezzo.pensa` | pensa (la nuvoletta) | MGPS · qualsiasi | — | pensa | casa · — | — | — | — | — |

## Le rare: quando

| quando | Vuol dire |
|---|---|
| `sempre` | qualsiasi giorno |
| `dopo-cantiere` | il giorno dopo un cantiere finito |
| `dopo-scavo` | in una giornata con un'attività che scava (cerca-ghiande, furfante.nasconde, furfante.galleria, zappa-aiuola) |
| `agosto-10-13` | dal 10 al 13 agosto, sera serena |
| `estate` | in estate (stagioneDa) |
| `primavera` | in primavera (stagioneDa) |
| `autunno-una-volta` | in autunno, una volta l'anno |
| `primo-giorno-primavera` | il primo giorno di primavera vissuto |
| `prima-neve-anno` | la prima neve dell'anno |
| `caldo30` | con la massima a 30 gradi o più |
| `ogni-365-giorni` | al giorno 365, 730, … |
| `notte` | di notte |
| `1-aprile` | il 1° aprile |
| `sole-dopo-pioggia` | giornata di sole dopo un giorno di pioggia |

## Le tracce

| Traccia | Che cosa si vede | Quanto resta | La lasciano | Serve a |
|---|---|---|---|---|
| `pozzanghera` | una pozzanghera davanti a casa | fino a sera; nasce anche da sola dopo la pioggia | `annaffiarsi` | `pesca-pozzanghera` `pozzanghere` `filosofo.pozzanghera` `viaggiatore.bottiglia` |
| `mucchio-foglie` | un mucchio di foglie rastrellate | 2 giorni, o finché ci si tuffa | `rastrella-foglie` | `tuffo-foglie` |
| `foglie-sparse` | foglie sparse dappertutto | 1 giorno | `tuffo-foglie` | — |
| `buca` | una buca appena scavata, con la terra accanto | 1 giorno | `cerca-ghiande` `furfante.nasconde` `rara.tesoro` `rara.fossile` | — |
| `aiuola` | un'aiuola zappata, terra scura | finché non si semina | `zappa-aiuola` | `semina` |
| `orto-seminato` | file di terra con i cartellini dei semi | 3 annaffiature, poi diventa orto-germogli | `semina` | `annaffia-orto` |
| `orto-germogli` | l'orto con i germogli verdi | finché non si raccoglie | `annaffia-orto` | `raccoglie-ortaggi` |
| `cesto-verdure` | un cesto di verdure dell'orto accanto alla porta | finché non si cucina | `raccoglie-ortaggi` | `cucina-zuppa` |
| `muretto` | un muretto di sassi, basso e un po' storto | resta (si può togliere) | `muretto-sassi` | `costruisce-forno` |
| `castello-sassi` | un castello di sassi ancora in piedi | 1 giorno | `castello-sassi` | — |
| `panni-stesi` | panni stesi ad asciugare | fino a sera; con la pioggia si ritirano | `bucato` | — |
| `disegno-terra` | un disegno tracciato col ramo per terra | fino alla prossima pioggia | `disegna-terra` | — |
| `schizzi` | schizzi di fango sul prato | fino a sera | `pozzanghere` `tinozza` | — |
| `pupazzo-neve` | un pupazzo di neve col naso di ramo | finché c'è neve, poi si scioglie piano | `pupazzo-neve` | — |
| `angelo-neve` | la sagoma dell'angelo nella neve | finché c'è neve | `angelo-neve` | — |
| `scultura-neve` | una statua di neve un po' storta | finché c'è neve | `artista.neve` | — |
| `verso-neve` | un verso scritto col dito nella neve | finché c'è neve | `poeta.neve` | — |
| `fuoco` | il fuoco acceso nel cerchio di sassi | fino a notte | `accendi-fuoco` | `cucina-zuppa` `castagne` `storie-fuoco` `scalda-mani` `viaggiatore.esotico` `cuoce-marmellata` `invita-fuoco` `gruppo.storie` |
| `braci` | le braci che fumano | fino al mattino | `accendi-fuoco` | `dorme-braci` |
| `lanterne-accese` | le lanterne accese sui rami | fino a notte | `lanterne` | — |
| `stanza-pulita` | il prato spazzato, la polvere sparita | 1 giorno | `spazza` | — |
| `macchie-colore` | macchie di colore sul prato e sulle foglie | 1 giorno | `artista.colori` `artista.colori-bacche` | — |
| `quadro-appeso` | un quadro appeso, appena raddrizzato | resta finché ne appende un altro | `artista.appende` | `artista.vende` |
| `mosaico` | un mosaico di sassi colorati | resta (si può togliere) | `artista.mosaico` | — |
| `murale` | il murale sulla casetta | resta | `artista.murale` | — |
| `trucioli` | trucioli di legno intorno al ceppo | 1 giorno | `artista.scolpisce` | — |
| `galleria-scavata` | il buco di una galleria, con un cartello «lavori in corso» | 3 giorni | `furfante.galleria` | — |
| `tenda-montata` | la tenda montata sul prato | 1 giorno | `viaggiatore.tenda` | — |
| `coriandoli` | coriandoli di foglie sul prato | 1 giorno | `imprenditore.negozio` `rara.festa` | — |
| `festoni` | festoni di foglie tra i rami | 2 giorni | `rara.festa` `rara.compleanno` `gruppo.compleanno` | — |
| `vasetti-pieni` | vasetti di marmellata in fila sulla dispensa | finché non li regala | `riempie-vasetti` | `regala-vasetti` |
| `bacche-schiacciate` | una ciotola di bacche schiacciate | finché non le cuoce | `schiaccia-bacche` | `cuoce-marmellata` |
| `candele` | candele di resina pronte | finché non le accende | `fa-candele` | `lanterne` |
| `pane` | una pagnotta di ghiande che fuma | 1 giorno | `impasta-pane` | `gruppo.cena` |
| `farina` | un sacchetto di farina di ghiande | finché non impasta | `macina-ghiande` | `impasta-pane` |

## Le risorse

| Risorsa | La raccolgono | La consumano |
|---|---|---|
| legna | `raccogli-rami` `rastrella-temporale` | `accendi-fuoco` `pupazzo-neve` `artista.scolpisce` `monta-altalena` `impasta-pane` |
| ghiande | `cerca-ghiande` `vendere-ombra` `imprenditore.contratta` `artista.vende` `furfante.mercato` `gruppo.bancarella` | `baratto-scoiattolo` `cucina-zuppa` `imprenditore.deposito` `furfante.nasconde` `furfante.restituisce` `viaggiatore.esotico` `impasta-pane` `macina-ghiande` `gruppo.cena` |
| foglie | `rastrella-foglie` | `filosofo.aforismi` `furfante.travestimento` `furfante.codice` `viaggiatore.aereo` `poeta.sillabe` |
| sassi | `cerca-sassi` `castello-sassi` `rara.ruscello` | `muretto-sassi` `castello-sassi` `artista.mosaico` `costruisce-forno` |
| bacche | `raccogli-bacche` | `artista.colori-bacche` `artista.murale` `schiaccia-bacche` |
| acqua | `raccoglie-rugiada` `secchio-pioggia` `rara.ruscello` | `annaffia-orto` `bucato` `tinozza` `rara.ospite` |
| resina | `gratta-resina` | `fa-candele` |
| piume | `saluta-uccelli` `rara.ospite` | — |
| semi | `raccoglie-ortaggi` | `semina` |
| fili | `intreccia-fili` | `intreccia-corda` `fa-candele` `ripara-aquilone` |

Quantità da 0 a 9 per risorsa (sezione 4.1); le risorse non si comprano mai. Le piume arrivano con gli uccelli e gli ospiti; non si consumano nelle attività ma servono all'aquilone (regola di sblocco).
