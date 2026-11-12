// Il catalogo delle attività (docs/stanze-e-vita.md, sezione 5).
// Una riga per attività, campi separati da «|» («-» = niente):
//
//  1 id          gli id di azioni.ts e mestieri.ts restano uguali
//  2 etichetta   terza persona, per la didascalia: «Pino … »
//  3 fasce       M mattina · G giorno · P pomeriggio · S sera · N notte
//  4 meteo       quando ha senso (vedi METEO in genera.mjs); più valori = uno qualsiasi
//  5 umori       umori adatti (×1,5), dai 9 di personaggio.ts
//  6 gesti       sequenza dalla libreria (gesti.mjs), 3-4; gli intermezzi 1-2
//  7 posto       casa (dove sta l'albero) · prato · davanti · sfondo · rami · giro (cammina per la stanza)
//  8 richiede    oggetto = serve (senza, peso 0) · ?oggetto = lo usa se c'è (×2)
//                ~traccia = serve quella traccia nella stanza · $risorsa = ne ha almeno 1
//                ?*categoria = un oggetto qualsiasi di quella categoria, se c'è
//  9 prende      risorse consumate («legna:2»)
// 10 lascia      risorse raccolte
// 11 tracce      tracce che restano nella stanza (TRACCE, sotto)
// 12 porta      attività che diventano più probabili dopo (i passi delle catene si aggiungono da soli)
// 13 voglia      la frase della nuvoletta (sezione 9.2)
// 14 note        segni: ferma · mov · L2/L3 (livello della strada) · gruppo (servono 2 alberi)
//                base=N · quando=… (condizione delle rare, verificabile dal codice) · da=azioni|mestieri

export const TRACCE = `
pozzanghera | una pozzanghera davanti a casa | fino a sera; nasce anche da sola dopo la pioggia
mucchio-foglie | un mucchio di foglie rastrellate | 2 giorni, o finché ci si tuffa
foglie-sparse | foglie sparse dappertutto | 1 giorno
buca | una buca appena scavata, con la terra accanto | 1 giorno
aiuola | un'aiuola zappata, terra scura | finché non si semina
orto-seminato | file di terra con i cartellini dei semi | 3 annaffiature, poi diventa orto-germogli
orto-germogli | l'orto con i germogli verdi | finché non si raccoglie
cesto-verdure | un cesto di verdure dell'orto accanto alla porta | finché non si cucina
muretto | un muretto di sassi, basso e un po' storto | resta (si può togliere)
castello-sassi | un castello di sassi ancora in piedi | 1 giorno
panni-stesi | panni stesi ad asciugare | fino a sera; con la pioggia si ritirano
disegno-terra | un disegno tracciato col ramo per terra | fino alla prossima pioggia
schizzi | schizzi di fango sul prato | fino a sera
pupazzo-neve | un pupazzo di neve col naso di ramo | finché c'è neve, poi si scioglie piano
angelo-neve | la sagoma dell'angelo nella neve | finché c'è neve
scultura-neve | una statua di neve un po' storta | finché c'è neve
verso-neve | un verso scritto col dito nella neve | finché c'è neve
fuoco | il fuoco acceso nel cerchio di sassi | fino a notte
braci | le braci che fumano | fino al mattino
lanterne-accese | le lanterne accese sui rami | fino a notte
stanza-pulita | il prato spazzato, la polvere sparita | 1 giorno
macchie-colore | macchie di colore sul prato e sulle foglie | 1 giorno
quadro-appeso | un quadro appeso, appena raddrizzato | resta finché ne appende un altro
mosaico | un mosaico di sassi colorati | resta (si può togliere)
murale | il murale sulla casetta | resta
trucioli | trucioli di legno intorno al ceppo | 1 giorno
galleria-scavata | il buco di una galleria, con un cartello «lavori in corso» | 3 giorni
tenda-montata | la tenda montata sul prato | 1 giorno
coriandoli | coriandoli di foglie sul prato | 1 giorno
festoni | festoni di foglie tra i rami | 2 giorni
vasetti-pieni | vasetti di marmellata in fila sulla dispensa | finché non li regala
bacche-schiacciate | una ciotola di bacche schiacciate | finché non le cuoce
candele | candele di resina pronte | finché non le accende
pane | una pagnotta di ghiande che fuma | 1 giorno
farina | un sacchetto di farina di ghiande | finché non impasta
`;

export const SEZIONI = [
  {
    id: "mattina",
    titolo: "Quotidiane del mattino",
    tipo: "quotidiana",
    righe: `
sveglia | si sveglia e si stiracchia | M | qualsiasi | assonnato allegro energico | sbadiglia siStiracchia gratta | casa | ?pantofole ?letto-muschio | - | - | - | colazione-rugiada | ancora cinque minuti… | -
colazione-rugiada | fa colazione con la rugiada | M | asciutto | allegro curioso assonnato | raccoglie beve saltelloContento | casa | ?tazza | - | - | - | raccoglie-rugiada | che fame di rugiada | -
annaffiarsi | si annaffia da solo | M P | asciutto | allegro assonnato | prendi versa siScrolla | casa | ?annaffiatoio | - | - | pozzanghera | - | un po' d'acqua… | mov da=azioni
ginnastica-sole | fa ginnastica col sole | M | sole | energico allegro fiero | siChina saltella contaDita | prato | ?tappetino ?fascia ?corda-salto | - | - | - | corsa | uno, due, uno, due! | mov
rastrella-foglie | rastrella le foglie | M G P | asciutto | energico pensieroso | rastrella impila starnutisce | prato | ?rastrello | - | foglie:2 | mucchio-foglie | tuffo-foglie | quante foglie… | mov
saluta-uccelli | saluta gli uccelli | M | asciutto | allegro curioso | guardaSu saluta fischia | rami | ?casetta-uccelli | - | piume:1 | - | suona-flauto | cip cip? cip! | -
raccoglie-rugiada | raccoglie la rugiada | M | asciutto | curioso energico | cammina raccoglie versa | prato | ?secchio ?pozzo ?botte-acqua | - | acqua:1 | - | bere-tisana | la rugiada è fresca adesso | mov
spazza | spazza davanti a casa | M | asciutto | energico pensieroso | spazza manoSuiFianchi spazza | davanti | ?scopa | - | - | stanza-pulita | - | che disordine! | mov
dito-bagnato | controlla il meteo col dito bagnato | M | qualsiasi | curioso pensieroso | assaggia indica annuisce | casa | - | - | - | - | - | che tempo farà? | -
pettina-foglie | si pettina le foglie | M | qualsiasi | fiero allegro | pettina sbircia manoSuiFianchi | casa | ?pettine ?specchio | - | - | - | - | oggi voglio essere elegante | -
annaffia-orto | annaffia l'orto | M S | asciutto | pensieroso allegro | prendi versa esamina | prato | ~orto-seminato ?annaffiatoio ?cappello-paglia ?serra | acqua:1 | - | orto-germogli | - | l'orto ha sete | -
letto-muschio | fa il letto di muschio | M | qualsiasi | assonnato pensieroso | posa strofina manoSuiFianchi | casa | ?letto-muschio ?pantofole | - | - | - | - | il letto deve essere perfetto | -
apre-finestre | apre le finestre della casetta | M | asciutto | allegro sognante | cammina tira sospira | sfondo | casetta | - | - | - | - | aria nuova! | -
fare-valigia | prepara la valigia per un viaggio immaginario | M S | qualsiasi | curioso sognante energico | posa impila manoSuiFianchi | casa | ?valigia ?zaino | - | - | - | passeggiata | e se partissi? | mov da=azioni
giornale-foglie | legge il giornale delle foglie | M | qualsiasi | curioso pensieroso fiero | legge esamina annuisce | casa | ?giornale ?occhiali-tondi | - | - | - | pensare | chissà che notizie | ferma
`,
  },
  {
    id: "giorno",
    titolo: "Quotidiane del giorno e del pomeriggio",
    tipo: "quotidiana",
    righe: `
raccogli-rami | raccoglie rami | G P | asciutto | energico curioso | cammina raccoglie porta | giro | ?legnaia ?carriola | - | legna:2 | - | accendi-fuoco | serve legna | mov
cerca-ghiande | cerca ghiande | G P | asciutto | curioso furbo | annusa scava saltelloContento | giro | ?cesto | - | ghiande:2 | buca | baratto-scoiattolo cucina-zuppa | sento odore di ghiande | mov
cerca-sassi | cerca sassi belli | G P | asciutto | curioso sognante | cammina raccoglie esamina | giro | ?carriola | - | sassi:2 | - | muretto-sassi castello-sassi | quel sasso brilla | mov
raccogli-bacche | raccoglie bacche | G P | asciutto | allegro curioso | afferra raccoglie assaggia | prato | ?cesto ?orecchini-ciliegia | - | bacche:2 | - | - | che bacche mature! | -
intreccia-fili | intreccia fili d'erba | G P S | qualsiasi | pensieroso sognante | siediti intreccia tira | casa | - | - | fili:2 | - | - | un filo, un altro filo… | -
gratta-resina | gratta la resina | G P | asciutto | curioso furbo | gratta annusa scuoteTesta | casa | - | - | resina:1 | - | - | profumo di resina | -
zappa-aiuola | zappa l'aiuola | M G | asciutto | energico fiero | zappa asciugaFronte zappa | prato | ?zappa ?cappello-paglia | - | - | aiuola | - | qui ci starebbe un orto | mov
semina | semina | M G P | asciutto | sognante allegro | siChina lancia posa | prato | ~aiuola ?cappello-paglia ?spaventapasseri | semi:1 | - | orto-seminato | - | chissà cosa nascerà | -
ripara | ripara qualcosa | G P | qualsiasi | pensieroso fiero | esamina martella annuisce | casa | ?martello ?capanno-attrezzi ?bici | - | - | - | - | questo si è rotto… | -
muretto-sassi | costruisce un muretto di sassi | G P | asciutto | energico fiero | porta impila manoSuiFianchi | prato | ?carriola | sassi:3 | - | muretto | - | un muretto, ecco cosa manca | mov
bucato | fa il bucato | M G | sole vento | energico allegro | strofina strizza posa | prato | ?filo-bucato ?tinozza | acqua:1 | - | panni-stesi | - | giornata da bucato! | mov
gioca-palla | gioca a palla | G P | asciutto | energico allegro | calcia corre saltelloContento | prato | pallone ?porta-calcio | - | - | - | gruppo.partita | chi gioca? | mov
aquilone | fa volare l'aquilone | G P | vento | allegro sognante energico | corre tira guardaSu | prato | aquilone | - | - | - | ripara-aquilone | oggi c'è il vento giusto | mov
altalena | va in altalena | G P S | asciutto | allegro sognante | siediti dondola ride | rami | altalena | - | - | - | - | su, più in alto! | mov
tuffo-foglie | si tuffa nelle foglie | G P | asciutto | allegro energico | corre salta siNasconde | prato | ~mucchio-foglie | - | - | foglie-sparse | rastrella-foglie | quel mucchio mi chiama | mov
bolle | fa le bolle di sapone | G P | asciutto | allegro sognante | soffia corre afferra | prato | soffiabolle | - | - | - | - | bolle! | mov
pesca-pozzanghera | pesca nella pozzanghera | G P | dopoPioggia | pensieroso sognante assonnato | lancia aspetta tira | davanti | canna-pesca ~pozzanghera ?cappello-pescatore ?stivali-pioggia | - | - | - | - | oggi abboccano | -
disegna-terra | disegna per terra col ramo | G P | asciutto | sognante curioso | siChina dipinge esamina spazza | davanti | - | - | - | disegno-terra | dipingere | un disegno, qui | -
castello-sassi | costruisce un castello di sassi | G P | asciutto | allegro curioso | impila esamina indietreggia | davanti | - | sassi:2 | sassi:1 | castello-sassi | castello-sassi | stavolta sta in piedi | -
nascondino-scoiattolo | gioca a nascondino con lo scoiattolo | G P | asciutto | allegro furbo | siNasconde contaDita sbircia | giro | - | - | - | - | - | dove si sarà cacciato? | mov
prendere-sole | si gode il sole | G P | sole | assonnato allegro sognante | siSdraia sospira guardaSu | prato | ?asciugamano ?occhiali ?costume-righe ?parasole | - | - | - | - | un po' di sole… | da=azioni
sonnellino | fa un sonnellino | G P | asciutto | assonnato malinconico | sbadiglia siSdraia russa | casa | ?amaca ?poltrona-muschio | - | - | - | - | un pisolino… | ferma da=azioni
guardare-cielo | guarda il cielo | M G P S | asciutto | sognante pensieroso curioso | siSdraia indica ride | prato | - | - | - | - | pensare | che nuvole oggi… | ferma da=azioni
chiacchierare-scoiattolo | chiacchiera con lo scoiattolo | M G P | asciutto | allegro curioso furbo | indica annuisce ride | prato | ?cuccia-scoiattolo ?telefono-barattolo | - | - | - | baratto-scoiattolo | dov'è lo scoiattolo? | mov da=azioni
baratto-scoiattolo | fa un baratto con lo scoiattolo | G P | asciutto | furbo curioso | posa scuoteTesta stringeMano | davanti | - | ghiande:2 | - | - | - | due ghiande per quel bottone? | -
scrive-taccuino | scrive nel taccuino | G P S | qualsiasi | pensieroso sognante | siediti scrive legge | casa | ?quaderno ?sgabello | - | - | - | - | mi segno questa | ferma
leggere | legge un libro | G P S | qualsiasi | pensieroso curioso assonnato | siediti legge ride | casa | ?libro ?occhiali-tondi ?poltrona-muschio ?foglia-oro | - | - | - | pensare | quel libro mi chiama | ferma da=azioni
telefono-barattolo | telefona col barattolo | G P | qualsiasi | allegro curioso | prendi annuisce ride | casa | telefono-barattolo | - | - | - | - | pronto? chi parla? | -
ballare | balla da solo | P S | asciutto | allegro energico | balla saltella siInchina | prato | ?ghirlanda-fiori ?cerchio | - | - | - | rara.festa | che voglia di ballare! | mov da=azioni
suona-flauto | suona il flauto di canna | G P S | qualsiasi | sognante allegro malinconico | soffia dondola scuoteTesta | casa | flauto | - | - | - | gruppo.coro | mi è venuta una melodia | -
cucina-zuppa | cucina una zuppa | G S | qualsiasi | allegro fiero | sega mescola assaggia | davanti | pentola ~fuoco ?~cesto-verdure ?cappello-cuoco ?cucina-aperto ?forno | ghiande:1 | - | - | gruppo.cena | profumino… | -
bere-tisana | beve una tisana | M S | qualsiasi | assonnato malinconico pensieroso | versa soffia beve | casa | ?tazza ?vestaglia | - | - | - | - | una tisana calda | da=azioni
`,
  },
  {
    id: "sera",
    titolo: "Quotidiane della sera",
    tipo: "quotidiana",
    righe: `
accendi-fuoco | accende il fuoco | S | asciutto | energico fiero curioso | siChina strofina soffia indietreggia | davanti | ?acciarino ?cerchio-sassi | legna:2 | - | fuoco braci | castagne storie-fuoco | un fuoco, stasera | mov
castagne | arrostisce castagne | S | asciutto | allegro assonnato | prendi soffia assaggia | davanti | ~fuoco ?spiedo ?maglione | - | - | - | gruppo.cena | castagne! | -
storie-fuoco | racconta storie al fuoco | S | asciutto | sognante allegro | indica sventola ride | davanti | ~fuoco ?sedie-ceppo | - | - | - | dormire | c'era una volta un ramo… | -
tramonto | guarda il tramonto | S | sole asciutto | sognante malinconico | siediti sospira guardaSu | casa | ?panchina ?altalena | - | - | - | - | guarda che colori | ferma
lucciole | conta le lucciole | S | asciutto | curioso allegro | indica contaDita scuoteTesta | prato | - | - | - | - | - | una, due… tre? | quando=estate
lanterne | accende le lanterne | S | asciutto | allegro sognante | cammina strofina posa | rami | lanterne ?~candele ?faro | - | - | lanterne-accese | - | un po' di luce | -
diario-sera | scrive il diario della giornata | S | qualsiasi | pensieroso malinconico sognante | scrive legge sospira | casa | ?quaderno ?lampada | - | - | - | - | oggi è successo che… | ferma
notte-pronto | si prepara per la notte | S | qualsiasi | assonnato | prendi sbadiglia soffia | casa | ?berretto-notte ?vestaglia | - | - | - | dormire | che sonno… | -
cena-luna | cena sotto la luna | S | sereno | allegro sognante | posa assaggia brinda | davanti | ?tavolino | - | - | - | gruppo.cena | cena all'aperto! | -
stelle-sera | guarda le stelle | S | sereno | sognante curioso pensieroso | siSdraia indica guardaSu | prato | ?mantello-stelle ?tenda | - | - | - | filosofo.stelle | quella è l'Orsa? o una padella? | ferma
`,
  },
  {
    id: "meteo",
    titolo: "Con il meteo",
    tipo: "quotidiana",
    righe: `
doccia | si fa la doccia sotto la pioggia | M G P S | pioggia | allegro energico | strofina canta siScrolla | prato | ?asciugamano | - | - | - | - | una bella doccia! | mov da=azioni
pozzanghere | salta nelle pozzanghere | G P | dopoPioggia | allegro energico | salta ride siScrolla | davanti | ~pozzanghera ?stivali-pioggia ?barchetta | - | - | schizzi | - | splash? | mov
secchio-pioggia | mette il secchio sotto la pioggia | M G P | pioggia | pensieroso furbo | posa aspetta esamina | davanti | ?secchio ?impermeabile ?botte-acqua | - | acqua:2 | - | - | acqua gratis! | -
leggere-ombrello | legge sotto l'ombrello | G P S | pioggia | pensieroso sognante | legge guardaSu siScrolla | casa | ?ombrello ?libro ?impermeabile | - | - | - | - | pioggia e un buon libro | ferma
pupazzo-neve | fa il pupazzo di neve | G P | neve | allegro energico | porta impila posa | prato | ?berretto ?guanti-lana ?slittino | legna:1 | - | pupazzo-neve | palle-neve | un amico di neve! | mov
palle-neve | fa a palle di neve | G P | neve | energico allegro furbo | raccoglie lancia siNasconde | prato | ?guanti-lana ?berretto | - | - | - | - | attento! | mov
scalda-mani | si scalda le mani al fuoco | M S | freddo | assonnato malinconico | strofina soffia sospira | davanti | ~fuoco ?sciarpa ?maglione | - | - | - | - | brr, che freddo | -
ventaglio | si sventola col ventaglio | G P | caldo | assonnato malinconico | sventola sospira siSdraia | casa | ?ventaglio ?parasole | - | - | - | - | che caldo… | -
tinozza | fa il bagno nella tinozza | G P | caldo | allegro assonnato | salta strofina dondola | davanti | tinozza ?costume-righe ?pozzo ?asciugamano ?soffiabolle | acqua:2 | - | schizzi | - | un bagno, subito | -
lampi | si ripara dai lampi | G P S | temporale | malinconico curioso | siNasconde sbircia trema | casa | ?poncho | - | - | - | rastrella-temporale | che rumore… | -
nebbia | si perde nella nebbia | M G | nebbia | curioso sognante | cammina scuoteTesta saltelloContento | giro | ?lanterna-frontale | - | - | - | - | dove sono tutti? | mov
angelo-neve | fa l'angelo nella neve | G P | neve | allegro sognante | siSdraia sventola alzati | prato | ?sciarpa ?paraorecchie | - | - | angelo-neve | - | un angelo, qui | mov
rastrella-temporale | raccoglie i rami del temporale | M G | dopoTemporale | energico pensieroso | raccoglie porta posa | giro | ?carriola ?poncho | - | legna:3 | - | accendi-fuoco | quanti rami caduti! | mov
`,
  },
  {
    id: "azioni",
    titolo: "Le altre azioni di oggi (libreria `azioni.ts`)",
    tipo: "quotidiana",
    nota: "Restano con il loro id: l'AI le conosce già. Valgono per tutti gli alberi; il campo `strade` di azioni.ts resta come affinità (×1,5 prima della rivelazione).",
    righe: `
passeggiata | cammina di buon passo | M G P S | qualsiasi | curioso energico malinconico | cammina saluta guardaSu | giro | ?zaino ?cappello-esploratore ?cartelli ?yo-yo | - | - | - | - | due passi? | mov da=azioni
telefonata | è al telefono da un'ora | M G P | qualsiasi | fiero furbo energico | prendi annuisce ride | casa | ?telefono | - | - | - | - | devo fare una telefonata | da=azioni
corsa | corre al parco | M P | asciutto | energico allegro fiero | corre asciugaFronte saltelloContento | giro | ?fascia ?girandola | - | - | - | - | voglia di correre! | mov da=azioni
allenarsi | solleva pesi fatti di ghiande | M P | qualsiasi | energico fiero | afferra contaDita asciugaFronte | prato | ?manubrio ?tappetino | - | - | - | - | dieci sollevamenti… | mov da=azioni
dipingere | dipinge un quadro | M G P | asciutto | sognante allegro malinconico | esamina dipinge indietreggia | prato | ?cavalletto ?pennello ?basco | - | - | - | - | un quadro nuovo! | da=azioni
scrivere-poesia | scrive una poesia | G P S | qualsiasi | sognante malinconico pensieroso | pensa scrive legge | casa | ?quaderno ?piuma ?scrittoio | - | - | - | - | una rima… quale? | ferma da=azioni
meditare | medita a gambe incrociate | M S | qualsiasi | pensieroso assonnato | siediti sospira dondola | casa | ?sasso-piatto ?tappetino ?campanelle-vento | - | - | - | - | ommm… | ferma da=azioni
pensare | pensa al senso delle foglie | M G P S | qualsiasi | pensieroso curioso | pensa guardaSu annuisce | casa | ?scacchiera | - | - | - | - | perché le foglie…? | ferma da=azioni
contare-ghiande | conta le ghiande, due volte | G S | qualsiasi | furbo fiero | contaDita scuoteTesta contaDita | casa | $ghiande | - | - | - | - | le mie ghiande! | da=azioni
vendere-ombra | vende ombra a pagamento | G P | asciutto | furbo fiero energico | indica saluta contaDita | casa | ?cartello | - | ghiande:1 | - | - | ombra in saldo! | da=azioni
studiare-mappa | studia una mappa del mondo | G S | qualsiasi | curioso sognante | legge indica pensa | casa | ?mappa ?globo | - | - | - | fare-valigia | dove andrei…? | da=azioni
giornale-ombrello | legge i giornali finanziari sotto l'ombrello | M G | pioggia | fiero furbo | legge annuisce contaDita | casa | ?ombrello ?giornale ?cravatta | - | - | - | - | le notizie della Borsa… | ferma da=azioni
dormire | dorme come un sasso | N | qualsiasi | assonnato sognante malinconico | sbadiglia russa sospira | casa | ?berretto-notte ?letto-muschio | - | - | - | - | zzz… | da=azioni
`,
  },
  {
    id: "imprenditore",
    titolo: "L'imprenditore",
    tipo: "strada",
    strada: "imprenditore",
    righe: `
imprenditore.pubblicita | fa pubblicità col megafono di foglia | M G | asciutto | energico fiero allegro | prendi canta indica saluta | davanti | bancarella ?megafono | - | - | - | imprenditore.contratta | Ombra fresca! Ghiande buone! | L1 da=mestieri
imprenditore.contratta | contratta con lo scoiattolo | G P | asciutto | furbo curioso | indica scuoteTesta stringeMano | davanti | bancarella | - | ghiande:1 | - | imprenditore.incasso | trattiamo | L1 da=mestieri
imprenditore.incasso | conta l'incasso della giornata | S | qualsiasi | fiero furbo | contaDita esamina manoSuiFianchi | davanti | bancarella $ghiande | - | - | - | imprenditore.deposito | quanto abbiamo fatto oggi? | L1 da=mestieri
imprenditore.caffe | beve il caffè alla scrivania | M | qualsiasi | assonnato fiero | siediti beve sospira | prato | scrivania ?tazza | - | - | - | imprenditore.telefono | prima il caffè | L2 da=mestieri
imprenditore.telefono | risponde al telefono | G P | qualsiasi | energico fiero | prendi annuisce ride | prato | scrivania ?telefono | - | - | - | imprenditore.contratti | drin! affari! | L2 da=mestieri
imprenditore.contratti | firma contratti col timbro | G P | qualsiasi | fiero furbo | legge scrive timbra | prato | scrivania ?timbro ?cravatta | - | - | - | - | firma qui, e qui | L2 da=mestieri
imprenditore.riunione | fa una riunione con lo scoiattolo | P | asciutto | fiero energico | indica contaDita annuisce | prato | scrivania ?lavagna ?cravatta ?torre-holding | - | - | - | - | riunione alle tre | L2 da=mestieri
imprenditore.chiude | chiude l'ufficio e spegne la lampada | S | qualsiasi | assonnato fiero | posa soffia sospira | prato | scrivania ?lampada | - | - | - | imprenditore.notte | per oggi basta | L2 da=mestieri
imprenditore.deposito | mette le ghiande in cassaforte | S | qualsiasi | furbo fiero | porta posa contaDita | prato | cassaforte | ghiande:2 | - | - | - | al sicuro | L3 da=mestieri
imprenditore.notte | si addormenta alla scrivania | N | qualsiasi | assonnato | sbadiglia siediti russa | prato | scrivania | - | - | - | - | solo un attimo… | L2 da=mestieri
imprenditore.sondaggio | fa un sondaggio tra le formiche | G P | asciutto | curioso energico | siChina indica scrive | davanti | ?quaderno | - | - | - | - | che cosa vogliono le formiche? | L1
imprenditore.negozio | inaugura un negozio con le forbici | M G | asciutto | fiero allegro | indica afferra applaude saltelloContento | sfondo | insegna ?forbici | - | - | coriandoli | rara.festa | taglio il nastro! | L2
`,
  },
  {
    id: "filosofo",
    titolo: "Il filosofo",
    tipo: "strada",
    strada: "filosofo",
    righe: `
filosofo.vento | fa domande al vento | M G | asciutto vento | pensieroso curioso | guardaSu indica pensa | casa | ?campanelle-vento | - | - | - | - | vento, dove vai? | L1 da=mestieri
filosofo.aforismi | scrive aforismi sulle foglie | G P | qualsiasi | pensieroso fiero | raccoglie scrive annuisce | casa | ?toga-filosofo | foglie:1 | - | - | - | una frase per ogni foglia | L1 da=mestieri
filosofo.formiche | osserva le formiche con la lente | P | asciutto | curioso pensieroso | siChina esamina annuisce | davanti | ?lente ?fossile | - | - | - | filosofo.lumaca | dove vanno tutte? | L1 da=mestieri
filosofo.lumaca | discute con la lumaca | P S | asciutto | pensieroso allegro | siediti indica scuoteTesta | prato | panchina | - | - | - | - | la lumaca ha ragione? | L2 da=mestieri
filosofo.biblioteca | consulta la biblioteca di cortecce | G | qualsiasi | curioso pensieroso | esamina legge annuisce | sfondo | biblioteca ?occhiali-tondi | - | - | - | - | c'era un libro su questo | ferma L2 da=mestieri
filosofo.stelle | guarda le stelle col cannocchiale | S | sereno | sognante curioso | esamina guardaSu indica | prato | cannocchiale ?osservatorio ?mantello-stelle | - | - | - | - | quante sono? | L3 da=mestieri
filosofo.sasso | medita sul sasso piatto | M S | qualsiasi | pensieroso assonnato | siediti sospira pensa | davanti | ?sasso-piatto | - | - | - | - | il sasso sa qualcosa | ferma L1
filosofo.trattato | scrive un trattato e lo perde | G P | qualsiasi | pensieroso fiero | scrive cammina scuoteTesta | casa | ?quaderno ?leggio | - | - | - | - | il mio capolavoro… dov'è? | ferma L2
filosofo.lezione | tiene lezione agli alberi della stanza (da solo, alle formiche) | P | asciutto | fiero allegro | indica scrive annuisce | prato | ?lavagna ?aula ?toga-filosofo | - | - | - | - | oggi parliamo dell'ombra | L2
filosofo.pozzanghera | si chiede se esiste mentre si guarda nella pozzanghera | G P | dopoPioggia | pensieroso malinconico | siChina sbircia pensa | davanti | ~pozzanghera | - | - | - | - | quello sono io? | ferma L1
filosofo.scacchi | gioca a scacchi da solo e perde | P S | qualsiasi | pensieroso furbo | pensa posa scuoteTesta | prato | scacchiera ?sgabello | - | - | - | - | stavolta vinco io. Cioè, io. | ferma L2
filosofo.scuola | fonda la scuola sotto la chioma | M G | asciutto | fiero energico | posa scrive applaude | prato | panchina ?lavagna | - | - | - | gruppo.lezione | una scuola, ecco che cosa ci vuole | L2
`,
  },
  {
    id: "artista",
    titolo: "L'artista",
    tipo: "strada",
    strada: "artista",
    righe: `
artista.dipinge | dipinge un quadro | M G | asciutto | sognante allegro | esamina dipinge indietreggia | prato | cavalletto ?pennello ?basco | - | - | - | - | oggi la luce è giusta | L1 da=mestieri
artista.ispirazione | cerca l'ispirazione | P | qualsiasi | malinconico sognante | cammina guardaSu sospira | giro | - | - | - | - | - | dove sei, ispirazione? | L1 da=mestieri
artista.colori | mescola i colori e si sporca | G | asciutto | allegro curioso | mescola esamina ride | davanti | ?tavolozza ?grembiule-pittore | - | - | macchie-colore | artista.dipinge | più blu. No, più verde | L1 da=mestieri
artista.scolpisce | scolpisce un ramo | P | asciutto | pensieroso fiero | esamina gratta colpi soffia | prato | atelier ?scalpello | legna:1 | - | trucioli | - | c'è qualcosa dentro questo ramo | L2 da=mestieri
artista.mostra | fa da guida alla sua mostra | P S | asciutto | fiero allegro | indica siInchina applaude | sfondo | galleria ?papillon ?scultura | - | - | - | - | e questo, signori… | L3 da=mestieri
artista.colori-bacche | fa i colori con le bacche | G P | asciutto | curioso allegro | raccoglie strizza mescola | davanti | ?vasetti ?grembiule-pittore | bacche:2 | - | macchie-colore | - | il rosso delle bacche! | L1
artista.ritratto | ritrae gli altri alberi (sembrano patate) | P | asciutto | allegro furbo | esamina dipinge ride | prato | cavalletto | - | - | - | gruppo.ritratto | stai fermo… così | L2
artista.neve | scolpisce la neve | G P | neve | allegro fiero | raccoglie gratta indietreggia | prato | ?paraorecchie | - | - | scultura-neve | - | una statua di neve! | L1
artista.mosaico | fa un mosaico di sassi | G P | asciutto | pensieroso sognante | posa impila esamina | davanti | - | sassi:3 | - | mosaico | - | ogni sasso al suo posto | L1
artista.appende | appende un quadro e lo raddrizza tre volte | G P | qualsiasi | pensieroso fiero | martella indietreggia scuoteTesta | sfondo | ?martello | - | - | quadro-appeso | - | è storto… no, ora sì | L2
artista.murale | dipinge un murale sulla casetta | G P | asciutto | energico sognante | prendi dipinge indietreggia | sfondo | casetta ?pennello | bacche:2 | - | murale | - | una parete tutta bianca… | L2
artista.vende | vende un quadro allo scoiattolo per una ghianda | P | asciutto | allegro furbo | indica stringeMano saltelloContento | davanti | ~quadro-appeso | - | ghiande:1 | - | - | un capolavoro, quasi regalato | L2
`,
  },
  {
    id: "sportivo",
    titolo: "Lo sportivo",
    tipo: "strada",
    strada: "sportivo",
    righe: `
sportivo.stretching | fa stretching | M | qualsiasi | energico assonnato | siStiracchia siChina contaDita | prato | ?tappetino ?fascia ?spogliatoio | - | - | - | sportivo.corsa | prima ci si scalda | L1 da=mestieri
sportivo.corsa | corre al parco | M G | asciutto | energico fiero | corre asciugaFronte saltelloContento | giro | ?fascia | - | - | - | - | un altro giro! | mov L1 da=mestieri
sportivo.salto | fa salto in lungo | P | asciutto | energico fiero | corre salta indica | prato | ?fettuccia ?visiera | - | - | - | sportivo.record | oltre quel sasso! | mov L1 da=mestieri
sportivo.trazioni | fa trazioni alla sbarra | G P | asciutto | energico fiero | afferra contaDita asciugaFronte | prato | sbarra | - | - | - | - | dieci! …facciamo otto | mov L2 da=mestieri
sportivo.ostacoli | fa il percorso a ostacoli | P | asciutto | energico fiero | corre salta manoSuiFianchi | prato | ostacoli ?canottiera-numero | - | - | - | - | tempo record! | mov L3 da=mestieri
sportivo.premiazione | si premia sul podio | S | asciutto | fiero allegro | salta siInchina applaude | prato | podio | - | - | - | - | e il vincitore è… io | L3 da=mestieri
sportivo.braccio-ferro | sfida a braccio di ferro (da solo, lo scoiattolo) | P | qualsiasi | fiero energico | afferra trema saltelloContento | davanti | ?tavolino | - | - | - | gruppo.braccio-ferro | chi mi sfida? | L1
sportivo.fischietto | allena lo scoiattolo col fischietto | M G | asciutto | energico fiero | fischia indica applaude | prato | ?fischietto | - | - | - | - | forza, scoiattolo! | mov L2
sportivo.tronchi | solleva tronchi | M P | asciutto | energico fiero | siChina afferra asciugaFronte | prato | $legna | - | - | - | - | questo è leggero | mov L1
sportivo.yoga | fa yoga al tramonto | S | asciutto | pensieroso sognante | siStiracchia dondola sospira | prato | ?tappetino | - | - | - | - | respira… | L1
sportivo.record | misura il record con la fettuccia | P | asciutto | fiero curioso | cammina indica scrive | prato | fettuccia ?visiera | - | - | - | - | quanto ho fatto? | L2
sportivo.corsa-stanza | organizza la corsa della stanza | M G | asciutto | energico fiero | fischia indica corre | giro | ?fischietto ?bandierine | - | - | - | gruppo.torneo | tutti ai blocchi! | mov L3
`,
  },
  {
    id: "furfante",
    titolo: "Il furfante del bosco",
    tipo: "strada",
    strada: "furfante",
    nota: "Caricatura innocua del boss da film: cappello, gessato, «affari» di ghiande. Niente parole o simboli della criminalità vera, niente violenza, niente accenti presi in giro. Quello che prende lo restituisce.",
    righe: `
furfante.nasconde | nasconde le ghiande | M G | asciutto | furbo | scava posa sbircia | prato | ?bandana ?nascondiglio | ghiande:2 | - | buca | furfante.bottino | qui non le trova nessuno | L1 da=mestieri
furfante.travestimento | si traveste da cespuglio | G | asciutto | furbo allegro | raccoglie siNasconde sbircia | prato | ?mantello-foglie | foglie:2 | - | - | furfante.spia | sono un cespuglio | L1 da=mestieri
furfante.spia | spia lo scoiattolo | P | asciutto | furbo curioso | siNasconde sbircia indica | giro | ?binocolo ?bandana | - | - | - | - | che cosa trama lo scoiattolo? | L1 da=mestieri
furfante.bottino | conta il bottino | S | qualsiasi | furbo fiero | contaDita ride contaDita | casa | $ghiande ?corona-foglie | - | - | - | - | il colpo del secolo… quasi | L1 da=mestieri
furfante.mercato | vende ghiande d'importazione | P | asciutto | furbo energico | sbircia indica stringeMano | prato | mercato | - | ghiande:2 | - | - | roba fina, arrivata stanotte | L2 da=mestieri
furfante.piani | disegna piani segreti alla lavagna | G P | qualsiasi | furbo pensieroso | scrive indica ride | prato | ?lavagna | - | - | - | - | il piano perfetto | L1
furfante.codice | manda messaggi in codice con le foglie | G P | asciutto vento | furbo curioso | raccoglie scrive lancia | prato | - | foglie:1 | - | - | - | la foglia parte a mezzogiorno | L1
furfante.guardia | fa la guardia col cappello calato | S | qualsiasi | furbo assonnato | manoSuiFianchi sbircia sbadiglia | davanti | ?cappello-boss | - | - | - | - | qui non passa nessuno | L1
furfante.specchio | prova l'aria da duro davanti allo specchio | M | qualsiasi | fiero furbo | sbircia manoSuiFianchi ride | casa | ?specchio ?cappello-boss ?pettine | - | - | - | - | faccia da duro… così? | L1
furfante.galleria | scava una galleria (e sbuca nell'orto) | G P | asciutto | energico furbo | scava siNasconde sbircia | prato | ?pala ?lanterna-frontale | - | - | galleria-scavata | - | dritto verso il covo | mov L2
furfante.riunione | convoca la riunione della banda di notte | S | qualsiasi | furbo fiero | indica contaDita annuisce | sfondo | ?covo ?lanterne ?cappello-boss ?giacca-gessata | - | - | - | gruppo.colpo | riunione della banda, stanotte | L2
furfante.restituisce | restituisce di nascosto quello che ha preso | M | asciutto | malinconico furbo | sbircia posa corre | giro | - | ghiande:1 | - | - | - | forse è meglio ridarla… | L1
`,
  },
  {
    id: "viaggiatore",
    titolo: "Il viaggiatore",
    tipo: "strada",
    strada: "viaggiatore",
    righe: `
viaggiatore.zaino | prepara lo zaino | M | qualsiasi | curioso energico | posa impila manoSuiFianchi | casa | ?zaino | - | - | - | - | borraccia, mappa, ghianda di scorta | L1 da=mestieri
viaggiatore.mappa | studia la mappa | G | qualsiasi | curioso sognante | legge indica pensa | casa | ?mappa ?globo | - | - | - | - | di qua? di là? | L1 da=mestieri
viaggiatore.binocolo | guarda lontano col binocolo | P | asciutto | curioso sognante | prendi esamina indica | casa | ?binocolo ?cappello-esploratore ?faro | - | - | - | - | laggiù c'è il mare? No, è una pozzanghera | L1 da=mestieri
viaggiatore.cartoline | scrive cartoline | S | qualsiasi | sognante allegro | scrive posa sospira | sfondo | bacheca ?chiosco-agenzia | - | - | - | - | saluti da… qui | L2 da=mestieri
viaggiatore.partenza | fa finta di partire, e torna | P | asciutto | energico sognante | saluta cammina saltelloContento | sfondo | mongolfiera ?valigia | - | - | - | - | stavolta parto davvero | L3 da=mestieri
viaggiatore.aereo | piega un aereo di carta e lo lancia | G P | asciutto vento | allegro sognante | strofina lancia guardaSu | prato | - | foglie:1 | - | - | - | destinazione: oltre il muretto | L1
viaggiatore.foto | fotografa la stanza con una macchina di cartone | G P | asciutto | curioso allegro | esamina indica ride | giro | macchina-cartone | - | - | - | viaggiatore.cartoline | sorridi, scoiattolo! | L1
viaggiatore.tenda | prova la tenda | P S | asciutto | curioso energico | tira posa siNasconde | prato | tenda ?cappello-esploratore | - | - | tenda-montata | - | si dorme fuori, stanotte? | L2
viaggiatore.saluto | impara un saluto in un'altra lingua | M G | qualsiasi | curioso allegro | legge saluta siInchina | casa | ?libro | - | - | - | - | come si dice «ciao»? | L1
viaggiatore.esotico | cucina un piatto «esotico» con le ghiande | G S | qualsiasi | curioso fiero | mescola annusa assaggia | davanti | pentola ~fuoco ?cappello-cuoco | ghiande:2 | - | - | gruppo.cena | una ricetta da lontano (inventata) | L2
viaggiatore.racconti | racconta viaggi mai fatti | S | qualsiasi | sognante fiero | indica sventola ride | casa | ?globo | - | - | - | - | quella volta in montagna… | L1
viaggiatore.bottiglia | lancia un messaggio in bottiglia nella pozzanghera | G P | dopoPioggia | sognante malinconico | scrive lancia guardaSu | davanti | ~pozzanghera ?bottiglia ?barchetta | - | - | - | - | chissà chi lo troverà | L1
`,
  },
  {
    id: "poeta",
    titolo: "Il poeta pigro",
    tipo: "strada",
    strada: "poeta",
    righe: `
poeta.scrive | scrive e cancella | M G | qualsiasi | sognante malinconico | scrive strofina sospira | casa | ?quaderno ?piuma | - | - | - | - | no. No. Forse. | ferma L1 da=mestieri
poeta.recita | recita alle formiche | P | asciutto | fiero sognante | legge indica siInchina | davanti | ?piuma | - | - | - | - | ascoltate, formiche | L1 da=mestieri
poeta.rima | cerca una rima | G | qualsiasi | pensieroso sognante | pensa contaDita annuisce | casa | - | - | - | - | - | cuore… fiore… trattore? | ferma L1 da=mestieri
poeta.amaca | sonnecchia in amaca | P | asciutto | assonnato sognante | siSdraia dondola russa | rami | amaca | - | - | - | - | solo un verso, poi dormo | ferma L2 da=mestieri
poeta.versi | appende un verso al filo | S | asciutto | fiero sognante | scrive afferra posa | rami | filo | - | - | - | - | questo merita il filo | L3 da=mestieri
poeta.detta | detta una poesia allo scoiattolo | G P | qualsiasi | assonnato fiero | siSdraia indica sbadiglia | casa | ?calzini-spaiati | - | - | - | - | scrivi tu, io detto | ferma L1
poeta.sillabe | conta le sillabe sulle foglie | G P | qualsiasi | pensieroso curioso | raccoglie contaDita scuoteTesta | casa | - | foglie:1 | - | - | - | undici? dodici? | ferma L1
poeta.gara-rime | fa una gara di rime (da solo, con l'eco) | P S | qualsiasi | allegro fiero | indica ride applaude | prato | - | - | - | - | gruppo.gara-rime | rima con ghianda… chi la manda? | L2
poeta.neve | scrive un verso sulla neve | G P | neve | sognante allegro | siChina dipinge sospira | prato | - | - | - | verso-neve | - | un verso che si scioglie | L1
poeta.tramonto | si commuove per un tramonto | S | sole asciutto | malinconico sognante | guardaSu sospira asciugaFronte | casa | ?panchina | - | - | - | - | troppo bello… | ferma L1
poeta.serata | organizza una serata di poesia | S | asciutto | fiero allegro | posa indica siInchina | sfondo | ?palco ?lanterne ?sedie-ceppo ?papillon ?leggio | - | - | - | gruppo.coro | stasera, poesia per tutti | L3
poeta.pisolino | rinuncia a scrivere e fa un pisolino | G P | qualsiasi | assonnato | scrive sbadiglia russa | casa | ?calzini-spaiati ?amaca | - | - | - | - | domani. Domani scrivo. | ferma L1 base=6
`,
  },
  {
    id: "rare",
    titolo: "Rare (sorprese)",
    tipo: "rara",
    nota: "`quando` è la condizione che il codice controlla; `p` è la probabilità al giorno quando la condizione vale (proposta, da tarare con `npm run simula`). Una sorpresa a settimana è garantita (sezione 3.3): se in 7 giorni non ne è uscita nessuna, la prossima giornata ne pesca una tra quelle ammesse.",
    righe: `
rara.ospite | accoglie un ospite inatteso e gli offre una tisana | G P S | qualsiasi | curioso allegro | saluta versa siInchina | davanti | ?tazza | acqua:1 | piume:1 | - | - | arriva qualcuno? | quando=sempre p=0,03
rara.festa | fa una festa improvvisata | P S | asciutto | allegro energico | balla lancia applaude | prato | ?cappello-festa ?bandierine | - | - | coriandoli festoni | - | si festeggia! | quando=dopo-cantiere p=0,5
rara.eclissi | guarda col cannocchiale il sole che si scurisce un attimo | G | asciutto | curioso sognante | guardaSu esamina indica | prato | ?cannocchiale | - | - | - | - | che succede al sole? | quando=sempre p=0,002
rara.tesoro | trova un tesoro sepolto | G P | asciutto | curioso energico | scava esamina saltelloContento | prato | ?pala ?tesoro | - | - | buca | - | qui sotto c'è qualcosa | quando=dopo-scavo p=0,04
rara.stelle-cadenti | esprime un desiderio sotto la pioggia di stelle | S N | sereno | sognante | guardaSu indica scrive | prato | ?quaderno | - | - | - | - | una stella cadente! | quando=agosto-10-13 p=0,5
rara.circo | fa il giocoliere con le ghiande | P | asciutto | allegro energico | lancia afferra siInchina | prato | $ghiande ?palline-giocoliere ?cilindro-circo ?trottola | - | - | - | - | guardate qua! | quando=sempre p=0,016
rara.ruscello | va in gita al ruscello e torna con un sasso speciale | G | asciutto | curioso allegro | cammina siChina raccoglie | giro | ?zaino ?canna-pesca | - | sassi:1 acqua:1 | - | - | andiamo al ruscello? | quando=estate p=0,05
rara.arcobaleno | corre a cercare la fine dell'arcobaleno | G P | sole dopoPioggia | allegro sognante | indica corre scuoteTesta | giro | - | - | - | - | - | la fine è là! | quando=sole-dopo-pioggia p=0,5
rara.bottiglia | trova una lettera nella bottiglia | G P | qualsiasi | curioso sognante | raccoglie legge sospira | davanti | - | - | - | - | viaggiatore.bottiglia | che cos'è quel luccichio? | quando=sempre p=0,01
rara.primo-fiore | si commuove per il primo fiore | M G | asciutto | sognante allegro | siChina annusa saluta | prato | ?ghirlanda-fiori | - | - | - | - | un fiore! | quando=primo-giorno-primavera p=1
rara.foglia-oro | trova la foglia d'oro e la conserva nel libro | G P | asciutto | sognante fiero | afferra esamina posa | casa | ?libro | - | - | - | - | una foglia d'oro! | quando=autunno-una-volta p=0,02
rara.ballo-neve | balla con i fiocchi della prima neve | G P | neve | allegro sognante | guardaSu balla ride | prato | - | - | - | - | - | la prima neve! | quando=prima-neve-anno p=1
rara.notte-lucciole | la notte delle lucciole: la stanza si accende | S | sereno caldo | sognante allegro | indica dondola applaude | prato | - | - | - | - | - | quante luci… | quando=estate p=0,05
rara.cicale | dirige il concerto delle cicale con un rametto | P | caldo | allegro fiero | afferra sventola siInchina | casa | ?ventaglio | - | - | - | - | maestro, attacchi! | quando=caldo30 p=0,1
rara.compleanno | festeggia il compleanno con la torta di muschio | M G P S | qualsiasi | allegro fiero | soffia applaude saltelloContento | prato | ?cappello-festa | - | - | festoni | - | oggi è il mio giorno | quando=ogni-365-giorni p=1
rara.formica | aiuta una formica col bagaglio del trasloco | G P | asciutto | curioso allegro | siChina porta saluta | giro | - | - | - | - | - | quel bagaglio è enorme | quando=sempre p=0,01
rara.sfida-scoiattolo | sfida lo scoiattolo a una corsa (vince lui) | G P | asciutto | energico fiero | corre asciugaFronte stringeMano | giro | - | - | - | - | - | stavolta ti batto | mov quando=sempre p=0,01
rara.sogno | parla nel sonno: un fumetto buffo | N | qualsiasi | sognante | russa ride russa | casa | - | - | - | - | - | zzz… ghiande… | quando=notte p=0,03
rara.fossile | trova una foglia di pietra | G P | asciutto | curioso | scava esamina saltelloContento | prato | ?pala | - | - | buca | filosofo.formiche | una foglia… di pietra? | quando=dopo-scavo p=0,005
rara.contrario | fa tutto al contrario e cammina all'indietro | M G P S | qualsiasi | allegro furbo | indietreggia saluta ride | giro | - | - | - | - | - | onroignoub! | quando=1-aprile p=1
`,
  },
  {
    id: "catene",
    titolo: "Passi delle catene e delle imprese libere",
    tipo: "catena",
    nota: "Non sono nell'elenco della sezione 5 del progetto, ma servono: sono i passi delle catene (sezione 4.2) e le attività delle imprese libere (sezione 6).",
    righe: `
raccoglie-ortaggi | raccoglie le verdure dell'orto | M G | asciutto | allegro fiero | siChina raccoglie porta | prato | ~orto-germogli ?cesto ?spaventapasseri | - | semi:1 | cesto-verdure | cucina-zuppa | sono pronte! | mov
schiaccia-bacche | schiaccia le bacche nella ciotola | G P | qualsiasi | allegro curioso | strizza mescola assaggia | davanti | ?pentola | bacche:3 | - | bacche-schiacciate | - | una marmellata, ecco | -
cuoce-marmellata | cuoce la marmellata sul fuoco | P S | asciutto | fiero allegro | mescola soffia assaggia | davanti | pentola ~fuoco ~bacche-schiacciate ?cappello-cuoco | - | - | - | - | che profumo… | -
riempie-vasetti | riempie i vasetti di marmellata | G P | qualsiasi | fiero pensieroso | versa posa contaDita | davanti | vasetti ?dispensa ?orecchini-ciliegia | - | - | vasetti-pieni | - | uno, due, tre vasetti | -
regala-vasetti | regala i vasetti allo scoiattolo | G P | asciutto | allegro | porta saluta stringeMano | giro | ~vasetti-pieni ?cuccia-scoiattolo | - | - | - | - | questo è per te! | mov
invita-fuoco | invita gli altri alberi (o lo scoiattolo) al fuoco | S | asciutto | allegro sognante | saluta indica applaude | davanti | ~fuoco ?sedie-ceppo | - | - | - | - | venite, c'è posto! | -
dorme-braci | si addormenta vicino alle braci | S N | asciutto | assonnato sognante | sbadiglia siediti russa | davanti | ~braci ?vestaglia | - | - | - | - | che tepore… | -
intreccia-corda | intreccia una corda robusta | G P | qualsiasi | pensieroso fiero | intreccia tira annuisce | casa | - | fili:3 | - | - | - | questa regge anche me | -
monta-altalena | appende l'altalena al ramo più forte | G P | asciutto | energico fiero | tira martella saltelloContento | rami | corda ?martello ?sega | legna:1 | - | - | altalena | un'altalena tutta mia! | mov
costruisce-forno | costruisce il forno di sassi | G P | asciutto | energico fiero | porta impila asciugaFronte | prato | ~muretto | sassi:3 | - | - | - | un forno, per il pane | mov
impasta-pane | impasta il pane di ghiande e lo inforna | M G | qualsiasi | allegro fiero | strofina impila annusa | davanti | forno ?~farina ?cappello-cuoco | ghiande:1 legna:1 | - | pane | gruppo.cena | profumo di pane | -
fa-candele | fa le candele di resina | P S | qualsiasi | pensieroso sognante | strofina posa soffia | casa | - | resina:2 fili:1 | - | candele | lanterne | un po' di luce per la sera | -
macina-ghiande | macina le ghiande al mulino | G P | vento | energico curioso | porta versa guardaSu | sfondo | mulino | ghiande:2 | - | farina | impasta-pane | il mulino gira! | mov
allena-squadra | para i rigori dello scoiattolo | G P | asciutto | energico allegro | salta afferra applaude | prato | pallone porta-calcio ?canottiera-numero | - | - | - | gruppo.partita | para tutto, oggi | mov
suona-tamburo | suona il tamburo di corteccia | G P S | qualsiasi | allegro energico | colpi dondola ride | casa | tamburo | - | - | - | gruppo.coro | bum, bum-bum | -
prova-teatro | prova la parte con le maschere | P S | qualsiasi | fiero sognante | sventola siInchina indica | sfondo | maschere-teatro ?teatro | - | - | - | spettacolo-teatro | essere o non essere un pino? | -
spettacolo-teatro | va in scena davanti al pubblico del bosco | S | asciutto | fiero allegro | siInchina canta applaude | sfondo | maschere-teatro ?teatro ?sedie-ceppo | - | - | - | - | stasera si va in scena! | -
`,
  },
  {
    id: "giochi",
    titolo: "Con i giochi e i regali",
    tipo: "gioco",
    nota: "Ogni gioco e ogni regalo apre almeno un'attività (sezione 11): si fanno solo se l'oggetto c'è.",
    righe: `
pedala | va in bicicletta per la stanza e suona il campanello | G P | asciutto | allegro energico | siediti dondola fischia | giro | bici | - | - | - | - | drin drin! | mov
ripara-aquilone | ripara l'aquilone dopo il temporale | G P | qualsiasi | pensieroso fiero | esamina intreccia annuisce | casa | aquilone | fili:1 | - | - | aquilone | si è strappato… | -
slittino | scende con lo slittino dal mucchio di neve | G P | neve | allegro energico | tira siediti ride | prato | slittino ?berretto | - | - | - | - | wiiii! | mov
trottola | fa girare la trottola | G P S | qualsiasi | curioso allegro | siChina lancia guardaSu | davanti | trottola | - | - | - | - | quanto gira? | -
salta-corda | salta la corda | M G P | asciutto | energico allegro | dondola saltella contaDita | prato | corda-salto | - | - | - | - | cento! …dieci | mov
bocce | gioca a bocce coi sassi | P S | asciutto | pensieroso furbo | esamina lancia annuisce | prato | bocce-sassi | - | - | - | - | un pelo più a sinistra | -
domino | mette in fila il domino di corteccia e lo fa cadere | G P | qualsiasi | pensieroso allegro | posa impila applaude | davanti | domino-corteccia | - | - | - | - | tutti giù! | -
yo-yo | gioca con lo yo-yo | G P | qualsiasi | allegro curioso | lancia afferra ride | casa | yo-yo | - | - | - | - | su e giù | -
cerchio | fa girare il cerchio in vita | G P | asciutto | allegro energico | dondola balla ride | prato | cerchio | - | - | - | - | non cade, non cade… | mov
girandola | corre con la girandola contro il vento | G P | vento | allegro sognante | afferra corre guardaSu | giro | girandola | - | - | - | - | gira, gira! | mov
`,
  },
  {
    id: "gruppo",
    titolo: "Di gruppo (due o più alberi nella stessa stanza)",
    tipo: "gruppo",
    nota: "Si scelgono quando almeno due alberi della stanza sono liberi nella stessa fascia (sezione 5.4). I gesti sono quelli di chi la guida; gli altri fanno la versione del loro ruolo o guardano e applaudono. Le rivalità sono buffe, mai cattive.",
    righe: `
gruppo.cena | cenano insieme sotto la luna | S | sereno | allegro sognante | posa assaggia brinda | davanti | ?tavolino ?sedie-ceppo ?~pane | ghiande:1 | - | - | - | cena tutti insieme? | gruppo
gruppo.ombra | litigano per chi ha più ombra | G P | sole | furbo fiero | indica scuoteTesta ride | prato | - | - | - | - | - | quest'ombra è mia! | gruppo
gruppo.foto | si mettono in posa per la foto di gruppo | G P | asciutto | allegro fiero | cammina manoSuiFianchi ride | prato | ?macchina-cartone ?occhiali | - | - | - | - | tutti dentro! | gruppo
gruppo.partita | fanno una partita a palla | G P | asciutto | energico allegro | calcia corre applaude | prato | pallone ?porta-calcio ?canottiera-numero | - | - | - | - | partita! | mov gruppo
gruppo.bancarella | tengono la bancarella insieme | G P | asciutto | furbo allegro | indica contaDita stringeMano | davanti | bancarella | - | ghiande:1 | - | - | affari in società | gruppo
gruppo.ombrello | fanno riunione sotto un ombrello solo | G P | pioggia | allegro pensieroso | siNasconde annuisce ride | casa | ombrello | - | - | - | - | stringetevi! | gruppo
gruppo.colpo | il colpo della banda: la mela più rossa del giardino | S N | qualsiasi | furbo allegro | sbircia siNasconde corre | giro | ?giacca-gessata ?cappello-boss | - | - | - | furfante.restituisce | stanotte, la mela più rossa | mov gruppo
gruppo.giardiniere | scappano dal giardiniere (che non arriva mai) | G P | asciutto | allegro energico | sbircia corre siNasconde | giro | - | - | - | - | - | arriva il giardiniere! | mov gruppo
gruppo.compleanno | festa di compleanno di un albero della stanza | P S | qualsiasi | allegro | soffia applaude balla | prato | ?cappello-festa ?bandierine ?palline-giocoliere | - | - | festoni | - | auguri! | gruppo
gruppo.lettera | scrivono una lettera firmata da tutti | S | qualsiasi | sognante allegro | scrive annuisce ride | casa | ?quaderno | - | - | - | - | firmiamo tutti | gruppo
gruppo.storie | raccontano storie al fuoco, a turno | S | asciutto | sognante allegro | indica sventola ride | davanti | ~fuoco ?sedie-ceppo | - | - | - | - | una storia a testa | gruppo
gruppo.coro | il coro della sera | S | qualsiasi | allegro sognante | canta dondola siInchina | prato | ?flauto ?tamburo ?leggio | - | - | - | - | tutti insieme: la-la-la | gruppo
gruppo.braccio-ferro | braccio di ferro | P | qualsiasi | fiero energico | afferra trema ride | davanti | ?tavolino | - | - | - | - | chi vince? | gruppo
gruppo.gara-rime | gara di rime | P S | qualsiasi | allegro fiero | indica ride applaude | prato | - | - | - | - | - | rima baciata, rima sbagliata | gruppo
gruppo.lezione | la lezione del filosofo | G P | asciutto | pensieroso curioso | indica scrive annuisce | prato | ?lavagna ?aula ?toga-filosofo | - | - | - | - | silenzio, si pensa | gruppo
gruppo.ritratto | il ritratto di gruppo dell'artista | P | asciutto | allegro | manoSuiFianchi dipinge ride | prato | cavalletto | - | - | - | - | fermi tutti! | gruppo
gruppo.torneo | il torneo della stanza | G P | asciutto | energico fiero | corre salta applaude | prato | ?podio ?bandierine ?canottiera-numero | - | - | - | sportivo.premiazione | che vinca il migliore! | mov gruppo
`,
  },
  {
    id: "intermezzi",
    titolo: "Intermezzi (pochi secondi tra un ciclo e l'altro)",
    tipo: "intermezzo",
    nota: "Si alternano a caso (sezione 5.5), non contano nella giornata e non lasciano tracce.",
    righe: `
intermezzo.beve | beve un sorso | M G P S | qualsiasi | - | beve | casa | ?tazza | - | - | - | - | - | -
intermezzo.stiracchia | si stiracchia | M G P S | qualsiasi | - | siStiracchia | casa | - | - | - | - | - | - | -
intermezzo.sbadiglia | sbadiglia | M G P S | qualsiasi | - | sbadiglia | casa | - | - | - | - | - | - | -
intermezzo.gratta | si gratta la corteccia | M G P S | qualsiasi | - | gratta | casa | - | - | - | - | - | - | -
intermezzo.guarda | guarda un oggetto e sorride | M G P S | qualsiasi | - | esamina ride | casa | ?*trofeo ?*rarita ?*stagione ?mensola-trofei ?cassetta-lettere | - | - | - | - | - | -
intermezzo.sistema | sistema un oggetto storto | M G P S | qualsiasi | - | posa manoSuiFianchi | prato | - | - | - | - | - | - | -
intermezzo.scoiattolo | saluta lo scoiattolo che passa | M G P | asciutto | - | saluta | casa | - | - | - | - | - | - | -
intermezzo.starnuto | starnutisce per il polline | M G P | asciutto | - | starnutisce | casa | - | - | - | - | - | - | quando=primavera
intermezzo.siede | si siede un attimo | M G P S | qualsiasi | - | siediti alzati | casa | ?sgabello | - | - | - | - | - | -
intermezzo.pensa | pensa (la nuvoletta) | M G P S | qualsiasi | - | pensa | casa | - | - | - | - | - | - | -
`,
  },
];
