# Linfa 0.2 — le stanze, la vita di Pino e le foreste

Progetto del 12/11/2026, dalle indicazioni di Federico. I numeri marcati
«proposta» si decidono insieme; quelli segnati «da decidere» aspettano una
risposta (sezione 16).

> **A che punto siamo (12/11/2026).** Fase 1 fatta: giornata a fasce con pesi
> e regole contro la noia (`src/lib/albero/giornata.ts`), nuvoletta del
> pensiero, decisione del buongiorno con zoom, fumetto e 5 minuti da
> pensieroso, lettere chiuse e aperte distinte, giardino di nuovo in 2D.
>
> **Fase 2 fatta** (branch `0.1.2-catene-e-lettera-settimanale`):
> - **Lettera settimanale** (sezione 12): ogni 7 giorni vissuti, per tutti i
>   piani, su Opus, nella stessa email della cartolina (`calendario.ts`,
>   `chiudiSettimana`; tipo `settimanale`, `tree_weeks.letter_id`). Niente più
>   lettera di fine mese e di metà mese. La stima dei costi AI in
>   `modello-di-business.md` è segnata da rifare.
> - **Risorse e catene** (sezione 4): `risorse.ts` (le 10 risorse, 0-9),
>   `catene.ts` (catene del fuoco, dell'orto e della marmellata, effetti delle
>   attività, memoria), colonne `trees.risorse` e `trees.memoria`. Il motore
>   notturno decide la giornata dalla memoria e l'AI sceglie tra quelle
>   attività l'azione del giorno. Pesi della sezione 3.3 applicati: base
>   quotidiana/di strada (1 e 0,4), catena ×5 per il passo dopo, ×3 per chi
>   raccoglie quello che manca, ×2 per cominciare una catena, novità (×2 mai
>   fatta; la stessa principale nella stessa fascia al massimo una volta ogni 3
>   giorni). La pioggia spegne le braci e annaffia l'orto; una catena ferma da
>   10 giorni si lascia perdere. Tracce nella scena: catasta, cerchio del falò
>   con le braci, orto in 4 stadi, vasetti sulla mensola, mucchio di foglie,
>   sassi, ghiande, cesto, secchio, verdure.
> - **30 attività quotidiane nuove** (sezione 5.1, `quotidiane.ts`) con la loro
>   scenetta (`vivo/attivita.ts`) e una sequenza di gesti diversa per ognuna;
>   **39 gesti nuovi** in `vivo/gesti.ts` (chinarsi, raccogliere, posare,
>   portare, versare, mescolare, zappare, rastrellare, spazzare, strofinare,
>   strizzare, intrecciare, tirare, impilare, lanciare, indicare, contare sulle
>   dita, soffiare, bere, assaggiare, annusare, sbadigliare, stiracchiarsi,
>   starnutire, fischiare, ridere, scrollarsi, tremare, inchinarsi, applaudire,
>   salutare, guardare lontano, sfregare i bastoncini, saltare, annuire, dire
>   di no, mano al mento, grattarsi la corteccia); 15 attrezzi nuovi; oggetti
>   animati (il fuoco che crepita, la pentola, il cespuglio, il filo del
>   bucato, la tinozza, la pozzanghera, l'uccellino, le stelle unite col dito,
>   lo scoiattolo) ed effetti nuovi (scintille, fumo, succo). I 10 intermezzi
>   della sezione 5.5 tra un ciclo e l'altro (30% delle volte).
> - Sul telefono il prato delle tracce si stringe attorno all'albero.
> - Prove: `npm run simula -- --giorni 30 --senza-ai --meteo-finto` su 8 semi:
>   fuoco, orto e marmellata si chiudono (da 1 a 3 volte la marmellata, fino a
>   3 il fuoco, fino a 2 l'orto; un seme su otto non ne chiude nessuna in 30
>   giorni), 0-1 volte la stessa principale nella stessa fascia entro 3
>   giorni, al massimo 2-3 giorni di fila con la stessa attività. Nel giardino
>   le 30 attività girano senza errori, computer e telefono, movimento pieno e
>   ridotto.
> - Restano da collegare, ora che le fasi sono unite: gli oggetti che le
>   attività richiedono (catalogo della fase 3), il fattore impresa ×4 nei pesi
>   della giornata (`fattoreImpresa` della fase 4) e le imprese libere
>   dell'orto e della marmellata con le catene di `catene.ts`. Poi le altre
>   ~145 attività (catalogo della fase 8), le catene del quadro, della banda e
>   del torneo, la sorpresa garantita a settimana.
>
> **Fase 3 (12/11/2026, branch `0.1.2-oggetti-e-sblocchi`).** Catalogo in
> `src/lib/albero/oggetti.ts`: 124 voci (le 25 della collezione con lo stesso
> id, 59 nuove sbloccabili, 40 «in arrivo» senza disegno), 64 oggetti disegnati
> in `vivo/oggettiStanza.tsx` di cui 10 edifici. Tabella `room_items` e colonne
> `unlocks.opened_at` / `seen_at`; pacco, coriandoli, volo, festa di Pino e
> banner in `src/app/giardino/Stanza.tsx`; il pannello Collezione è il catalogo.
> I 10 regali diventano oggetti con almeno due attività. Pino sistema da solo
> (proposta 16.6 applicata, la persona sposta o mette via): se i posti di un
> tipo sono pieni, la cosa più vecchia va in deposito.
>
> **Fase 4 (12/11/2026, sul motore puro).** Imprese in `src/lib/albero/imprese.ts`,
> contagio e rivalità in `contagio.ts`, attività di gruppo in `gruppo.ts`,
> carisma e influenzabilità in `strade.ts` (`nascita`, `carattereDa`), migrazione
> `20261112120000_imprese_contagio.sql`. Si provano con `npm run simula --
> --alberi 3` (sezione 7.3). Il collegamento al database e al giardino arriva
> con le stanze (fase 5).
>
> **Fase 5 (12/11/2026, sul branch delle stanze).** Più alberi per persona
> fino al numero del pacchetto, stanze con la regola di 2.1 (i numeri
> «proposta» sono costanti in `src/lib/stanze.ts`), festa quando se ne apre
> una, trasloco e nome della stanza dall'elenco «Le tue stanze» in alto, da 1 a
> 4 alberi nella stessa scena 2D (il protagonista davanti, gli altri con la
> loro giornata; toccarne uno lo mette davanti). Strumenti della demo: pacchetto
> Albero/Famiglia/Foresta, «Pianta un altro albero», «Simula un rinnovo».
> Ancora da fare: Pino che va a vedere la stanza nuova il giorno dopo, gli
> arredi (aspettano `room_items` della fase 3: l'aggancio è pronto), il
> trascinamento dalla foresta 3D (fase 6). Scelte prese senza conferma:
> ogni rinnovo dà un seme per ogni albero del pacchetto (dalla tabella dei
> pacchetti nuovi); una stanza aperta resta aperta anche se il pacchetto
> scende; gli alberi di una stanza vedono il cielo dell'albero scelto.
>
> **Fase 6 fatta (12/11/2026): la tua foresta** in `/foresta` (dettagli e
> misure in fondo alla sezione 13). Senza le stanze della fase 5 legge l'unico
> albero e lo mette nella stanza 1, con un adattatore (`src/lib/foresta/dati.ts`).
>
> **Fase 7 fatta (12/11/2026)**: la foresta del club in `/club` (3D a istanze,
> mappa 2D di ripiego), consenso alla semina e revoca, vista `club_forest` con i
> soli campi pubblici, contatori veri. Per la demo (16, punto 4) c'è uno
> strumento che crea alberi d'esempio segnati come tali: la scelta resta di
> Federico. Dettagli e misure in `src/lib/giardino3d/README.md`.

Questo documento non butta via niente di quello che c'è: estende i mestieri
delle strade (`docs/routine-strade.md`, `src/lib/albero/mestieri.ts`: 7 strade,
21 cantieri, 42 attività), la collezione (`collezione.ts`, 25 voci), i regali
(`regali.ts`, 10) e il pupazzo animato 2D (`vivo/`, 11 gesti in `gesti.ts`).
«Pino» qui sta per qualsiasi albero: ognuno ha il nome che gli dà la persona.

## 0. Che cosa cambia, in breve

| Oggi | Domani |
|---|---|
| Un albero, una scena | Tre livelli: **la tua foresta** (3D), **la stanza** (2D, dove si gioca), **la foresta del club** (3D) |
| Il 3D al posto del 2D nel giardino | Il 2D per giocare; il 3D per guardare dall'alto i tuoi alberi e quelli del club |
| Un'azione al giorno, spesso «scrive» | Una giornata in 4 fasce, scelta tra ~175 attività pesate, collegate in catene, senza ripetersi |
| La decisione del buongiorno non si vede | Zoom su Pino, fumetto con la risposta, poi pensieroso per qualche minuto |
| Niente pensieri visibili | La nuvoletta del pensiero: che cosa vorrebbe fare, che cosa gli manca |
| Lettere ogni 30 giorni (15 nel Premium) | **Una lettera a settimana per tutti** (Federico, 12/11/2026), insieme alla cartolina (fatto, fase 2) |
| Collezione di 25 voci | Catalogo di ~200 voci, sbloccate dalle decisioni di Pino, con il momento dello sblocco |
| Arredi nel prato del mestiere | Stanze arredabili: regali, oggetti trovati e costruzioni di Pino |
| Ogni albero per conto suo | Carisma e influenzabilità: un albero forte trascina gli altri nelle sue imprese |

**La chiave** (Federico): ogni volta che entri, Pino sta facendo qualcosa di
diverso e ti stupisce. Mai fermo tutto il giorno, mai la stessa cosa.

## 1. I tre livelli

### 1.1 La tua foresta (3D, vista d'insieme)

- La pagina d'arrivo dopo l'accesso: dall'alto, i tuoi alberi digitali divisi
  nelle loro **stanze** (radure con un recinto basso e un cartello col nome).
  Riusa il motore 3D di oggi (`src/lib/giardino3d/`, 30 modelli): gli alberi
  si muovono poco, è una vista, non il gioco.
- Un pannello con i **numeri veri**: alberi veri piantati, dove, specie, da
  quanti anni; giorni vissuti, lettere ricevute, oggetti sbloccati, stanze.
  Su CO2 e «bene al pianeta» vedi 1.4: servono fonte e verifica legale.
- **Tocchi un albero (o una stanza) → entri nella sua stanza in 2D**, con una
  transizione (la telecamera scende sulla radura e sfuma nel disegno 2D).
- Le stanze bloccate si vedono come radure incolte con un lucchetto di rami e
  la regola per aprirle («Pianta altri 3 alberi»).

### 1.2 La stanza (2D, dove si gioca)

- Il giardino di oggi in 2D diventa una stanza: un prato con i suoi **posti**
  (sezione 2.3), gli alberi che ci vivono (da 1 a più) e gli oggetti.
- Tutto quello che c'è oggi resta (lettere, diario, buongiorno, regalo,
  collezione, conversazione); si aggiungono pensieri, decisioni a schermo e
  oggetti con cui Pino gioca da solo.
- Con più alberi nella stanza ognuno fa la sua giornata, e a volte la fanno
  insieme (attività di gruppo, sezione 5.4).

### 1.3 La foresta del club (3D, community)

- Una mega foresta 3D con i pini piantati dagli altri membri del club, il
  nome sopra. Non fanno nulla: stanno lì, ondeggiano, crescono. Il senso è
  «**aiutaci a rendere questa foresta sempre più fitta**».
- Il tuo albero ha un segno (bandierina) e la telecamera parte da lì.
- Contatore: quanti alberi nel club, quanti piantati questo mese (numeri veri
  dal database, mai inventati).
- **Privacy**: nel club compare solo chi ha detto sì (consenso esplicito alla
  semina, revocabile), con il **nome dell'albero** e al massimo il nome di
  battesimo o le iniziali del proprietario. È già la regola del «bosco dei
  veterani» in `modello-di-business.md`.
- **Nella demo locale** non ci sono altri iscritti: da decidere se mostrare
  alberi d'esempio segnati come tali o aspettare i dati veri (16, punto 4).
- Prestazioni: centinaia di alberi con istanze (un modello, tante copie) e
  livelli di dettaglio; i nomi solo per quelli vicini alla telecamera.

### 1.4 CO2 e «bene al pianeta»: attenzione

`modello-di-business.md` ha già una regola (direttiva UE 2024/825 sulle
dichiarazioni ambientali): si racconta il fatto (un albero vero, dove, con
chi), **mai l'effetto sul clima** («compensi la CO2», «impatto zero») senza
una base solida. Proposta:

- Sempre visibili: alberi veri piantati, specie, luogo, partner, anni di cura,
  foto. Sono fatti.
- CO2 solo se: c'è una **fonte citata** per la specie e il luogo (assorbimento
  stimato per anno di età), la cifra è presentata come **stima** con il
  metodo spiegato, e un legale ha approvato il testo. Mai «compensato».
- Finché non c'è la fonte, il pannello mostra solo i fatti. Nessuna cifra
  inventata.

## 2. Le stanze

### 2.1 Quante e come si sbloccano (Federico, 12/11/2026)

- Si parte con **1 stanza**. Massimo **10**.
- **+1 ogni 5 alberi piantati** (più ne pianti, più ne sblocchi).
- **+1 a ogni rinnovo annuale**, gratis.
- **I piani più costosi** danno più stanze. Proposta: Albero 1, Famiglia 2,
  Foresta 3 (da decidere, 16 punto 3).
- Regola di calcolo: `stanze = min(10, base_del_piano + floor(alberi_piantati / 5) + rinnovi)`.
  «Alberi piantati» = alberi digitali che la persona ha avuto in tutto (ognuno
  corrisponde a un albero vero). Da confermare se contano anche quelli
  regalati ad altri (16, punto 5).
- Quando una stanza si sblocca: momento di festa (sezione 9), e Pino ci va
  a dare un'occhiata il giorno dopo.

### 2.2 Chi abita dove

- Ogni albero vive in una stanza; la persona può spostarlo (trascinandolo
  nella tua foresta 3D o con un pulsante «trasloca»).
- Capienza per stanza, proposta: **fino a 4 alberi**. Oltre diventa
  illeggibile su un telefono.
- Alberi nella stessa stanza si influenzano (sezione 7); in stanze diverse no,
  salvo le attività di foresta del pacchetto Foresta.

### 2.3 I posti della stanza

La stanza 2D ha **posti fissi**, così il disegno resta ordinato:

| Posto | Quanti | Per che cosa |
|---|---|---|
| Sfondo | 2 | Edifici (casetta, serra, faro, galleria…) |
| Prato sinistro e destro | 2 + 2 | Arredi grandi (scrivania, banco, sbarra, amaca) |
| Davanti | 2 | Arredi piccoli (falò, lanterna, sgabello, pallone) |
| Rami | 2 | Cose appese (altalena, lanterne, filo delle poesie) |
| Armadio | 1 | Vestiti (non si vede l'armadio aperto: si vede Pino vestito) |
| Cassetta degli attrezzi | 1 | Attrezzi (si vedono in mano quando li usa) |

**Chi arreda**: proposta, **Pino sistema da solo** le cose nuove (e ogni tanto
sposta qualcosa: entri e la stanza è un po' cambiata); la persona può spostare
e togliere, trascinando. Così c'è sorpresa senza lavoro obbligatorio
(da confermare, 16 punto 6).

## 3. La giornata di Pino

### 3.1 Quattro fasce, quattro attività

Ogni giorno vissuto (motore notturno, una chiamata ad Haiku come oggi) produce
la **giornata**: un'attività per ciascuna fascia (mattina, giorno, pomeriggio,
sera; di notte dorme, ma col suo stile). Quando entri vedi l'attività della
fascia dell'ora vera della sua città. Chi entra alle 9 e alle 18 vede due cose
diverse; chi entra due giorni di fila alla stessa ora pure.

Dentro la fascia l'attività gira a ciclo (8-15 s) con **varianti**: non è mai
identica due volte. Tra un ciclo e l'altro, ogni tanto, **un intermezzo**
(sezione 5.5): beve, si stiracchia, guarda un oggetto, pensa.

### 3.2 Chi sceglie

- **Il codice** calcola i **pesi** di tutte le attività ammesse (sezione 3.3)
  ed estrae, per ogni fascia, **3-4 candidate**, con un caso riproducibile
  (seme = id dell'albero + giorno).
- **L'AI** (Haiku, nella chiamata della giornata) sceglie una candidata per
  fascia e la racconta nel diario. Così il comportamento resta vario e sotto
  controllo, e la scrittura resta viva.
- Cantieri, imprese, sblocchi e contagio li decide **solo il codice**.

### 3.3 I pesi

Peso di un'attività = **base × strada × impresa × catena × oggetti × umore × meteo × novità**

| Fattore | Valori (proposta) | Note |
|---|---|---|
| Base | quotidiana 10 · di strada 4 · rara 0,5 | Le quotidiane si vedono più spesso |
| Strada | ×3 se è della sua strada; ×0,3 se di un'altra | Prima della rivelazione: ×1,5 per le due strade più alte (i «provini») |
| Impresa | ×4 se appartiene a un'impresa attiva in cui è capo o sostenitore | Sezione 6 |
| Catena | ×5 se è il passo successivo di una catena iniziata | Sezione 4.2 |
| Oggetti | ×2 se usa un oggetto che ha; 0 se gli manca un oggetto richiesto | |
| Umore | ×1,5 se adatta all'umore di oggi (energico → movimento, assonnato → calma) | |
| Meteo | 0 se incompatibile (fuoco con la pioggia); ×2 se ideale (aquilone col vento) | Come `azioni.ts` |
| Novità | ×0,1 se fatta ieri nella stessa fascia; ×0,4 se negli ultimi 3 giorni; ×2 se mai fatta | È la regola anti-noia |

**Garanzie contro la noia** (regole fisse):

- La stessa attività al massimo **una volta ogni 3 giorni** nella stessa fascia.
- Al massimo **una attività «ferma»** (scrivere, leggere, meditare, dormicchiare) per giornata.
- Almeno **una attività di movimento** al giorno (cammina, costruisce, gioca).
- **Una sorpresa a settimana** garantita: un'attività rara o un evento.

## 4. Risorse e catene

### 4.1 Le risorse

Pino raccoglie e consuma cose; si vedono nella stanza come mucchietti che
crescono e calano (la catasta di legna, il cesto di ghiande).

| Risorsa | Si raccoglie con | Serve per |
|---|---|---|
| Legna | Raccogliere rami, potare, dopo un temporale | Fuoco, cantieri, mobili |
| Ghiande | Cercare ghiande, autunno, affari | Imprese (banco, cassaforte), baratti, cucina |
| Foglie | Rastrellare, autunno | Mongolfiera, travestimenti, letto, carta |
| Sassi | Cercare sassi, ruscello | Muretti, forno, percorso, giochi |
| Bacche | Raccogliere bacche, estate | Colori, marmellata, tisane |
| Acqua | Pioggia (secchio), ruscello | Annaffiare, tisane, colori, cucina |
| Resina | Grattare la corteccia | Colla, candele, cantieri |
| Piume | Trovate (rare), uccelli ospiti | Scrivere, cappelli, aquilone |
| Semi | Fiori sfioriti, regalo dello scoiattolo | Orto, aiuola, scambi |
| Fili d'erba | Intrecciare | Corde, amaca, cesti |

Regole: le quantità sono piccole (0-9 per risorsa, si vede il mucchietto);
non c'è commercio con la persona, **le risorse non si comprano mai**.

### 4.2 Le catene

Una catena è una sequenza di attività legate da risorse, oggetti e voglia. Il
primo passo la apre, i passi dopo diventano molto più probabili (×5) nei
giorni seguenti; ogni passo può anche saltare (Pino si distrae) e riprendere.
Il codice tiene la **memoria**: catene aperte, risorse, ultime attività.

Esempi (l'elenco completo è nella colonna «Porta a» del catalogo, sezione 5):

- **Il fuoco**: raccoglie legna → accende il fuoco (non con la pioggia) →
  arrostisce castagne → invita gli altri alberi → racconta storie → si
  addormenta vicino alle braci. *Traccia*: il cerchio di sassi e le braci.
- **L'orto**: trova semi → zappa un'aiuola → semina → annaffia (per giorni) →
  spunta il germoglio → raccoglie → cucina una zuppa. *Traccia*: l'orto cresce.
- **La marmellata**: raccoglie bacche → le schiaccia → cuoce col fuoco →
  riempie i vasetti → li regala allo scoiattolo. Richiede il fuoco.
- **Il quadro** (artista): raccoglie bacche → fa i colori → dipinge → appende
  il quadro → prepara la mostra (cantiere) → inaugura.
- **La banda del bosco** (furfante): accumula ghiande → costruisce il
  nascondiglio → fonda la banda (impresa) → scava il covo → riunioni di notte →
  coinvolge l'albero timido → «il colpo del secolo»: sottrarre la mela più
  rossa del giardino (e restituirla il giorno dopo perché si sente in colpa).
- **Il torneo** (sportivo): costruisce la sbarra → si allena → sfida gli altri
  alberi → organizza il torneo (impresa) → premiazione sul podio.

## 5. Il catalogo delle attività (~175)

Colonne: **Gesti** = la sequenza (sezione 8); **Posto/oggetti**; **Lascia** =
traccia nella stanza o risorsa; **Porta a** = attività che diventano più
probabili dopo. Le attività già nel catalogo dei mestieri hanno l'id di oggi.

### 5.1 Quotidiane (70, tutti gli alberi)

**Mattina**

| Attività | Gesti | Posto/oggetti | Lascia | Porta a |
|---|---|---|---|---|
| Si sveglia e si stiracchia | sbadiglia, stiracchia, si gratta | — | — | colazione |
| Fa colazione con la rugiada | raccoglie, beve, soddisfatto | tazza | — | lavori |
| Si annaffia | prende, versa, scrolla | annaffiatoio | pozzanghera | — |
| Fa ginnastica col sole | piega, salta, conta | — | — | corsa |
| Rastrella le foglie | rastrella, ammucchia, starnuta | rastrello | mucchio di foglie | tuffo nelle foglie |
| Saluta gli uccelli | guarda su, saluta, fischia | ramo | — | concerto |
| Raccoglie la rugiada | cammina, raccoglie, versa | secchio | acqua | tisana, colori |
| Spazza davanti a casa | spazza, si appoggia, spazza | scopa | stanza pulita | — |
| Controlla il meteo col dito bagnato | lecca il dito, alza, annuisce | — | — | — |
| Si pettina le foglie | pettina, specchio, sistema | specchio | — | — |
| Annaffia l'orto | prende, versa, controlla | annaffiatoio, orto | orto più alto | raccolto |
| Fa il letto di muschio | sistema, sprimaccia, ammira | letto | — | — |
| Apre le finestre della casetta | cammina, apre, respira | casetta | — | — |
| Prepara lo zaino | piega, infila, chiude | zaino | — | passeggiata |
| Legge il giornale delle foglie | apre, legge, gira | giornale | — | pensare |

**Giorno e pomeriggio**

| Attività | Gesti | Posto/oggetti | Lascia | Porta a |
|---|---|---|---|---|
| Raccoglie rami | cammina, raccoglie, porta (×3) | — | legna | fuoco, cantieri |
| Cerca ghiande | annusa, scava, trova | — | ghiande | baratto, cucina |
| Cerca sassi belli | cammina, raccoglie, esamina | — | sassi | muretto, gioco |
| Raccoglie bacche | allunga, raccoglie, assaggia | cesto | bacche | marmellata, colori |
| Intreccia fili d'erba | siede, intreccia, tira | — | corda | amaca, cesto, altalena |
| Gratta la resina | gratta, annusa, appiccica | — | resina | colla, candele |
| Zappa l'aiuola | zappa, si asciuga la fronte | zappa | aiuola | semina |
| Semina | apre, sparge, copre | semi | orto seminato | annaffia |
| Ripara qualcosa | esamina, martella, prova | martello | oggetto riparato | — |
| Costruisce un muretto di sassi | porta, impila, sistema | sassi | muretto | — |
| Fa il bucato | strofina, strizza, stende | filo | panni stesi | — |
| Gioca a palla | calcia, rincorre, esulta | pallone | — | gioca con gli altri |
| Fa volare l'aquilone | corre, tira, guarda su | aquilone | — | (solo con vento) |
| Va in altalena | siede, dondola, ride | altalena | — | — |
| Si tuffa nelle foglie | rincorsa, salta, sparisce | mucchio di foglie | foglie sparse | rastrella |
| Fa le bolle di sapone | soffia, insegue, scoppia | bolle | — | — |
| Pesca nella pozzanghera | lancia, aspetta, tira | canna da pesca | — | (con pozzanghera) |
| Disegna per terra col ramo | traccia, guarda, cancella | ramo | disegno | — |
| Costruisce un castello di sassi | impila, aggiusta, crolla | sassi | — | riprova |
| Gioca a nascondino con lo scoiattolo | copre gli occhi, conta, cerca | — | — | — |
| Prende il sole | sdraia, occhiali, sospira | asciugamano | — | (sole) |
| Fa il pisolino all'ombra | sbadiglia, si accoccola, russa | — | — | — |
| Osserva le nuvole | sdraia, indica, ride | — | — | pensare |
| Chiacchiera con lo scoiattolo | gesticola, ascolta, ride | — | — | baratto |
| Fa un baratto con lo scoiattolo | mostra, scuote la testa, stretta | ghiande | oggetto nuovo | — |
| Scrive nel taccuino | apre, scrive, rilegge | taccuino | — | lettera |
| Legge un libro | apre, gira, ride | libro | — | pensare |
| Telefona col barattolo | prende, parla, annuisce | telefono di barattolo | — | — |
| Balla da solo | gira, batte i piedi, inchino | — | — | festa |
| Suona il flauto di canna | soffia, dondola, stona | flauto | note | concerto |
| Cucina una zuppa | taglia, mescola, assaggia | pentola, fuoco | — | invita |
| Prepara la tisana | versa, mescola, soffia | tazza, fuoco | — | — |

**Sera**

| Attività | Gesti | Posto/oggetti | Lascia | Porta a |
|---|---|---|---|---|
| Accende il fuoco | si china, sfrega, soffia, salta indietro | legna | fuoco, braci | castagne, storie |
| Arrostisce castagne | infilza, gira, soffia, morde | fuoco | — | invita |
| Racconta storie al fuoco | gesticola, fa le ombre con le mani | fuoco | — | dorme |
| Guarda il tramonto | siede, sospira, sorride | panchina | — | — |
| Conta le lucciole | indica, conta, si confonde | — | — | (estate) |
| Accende le lanterne | cammina, accende, appende | lanterne | luce | — |
| Scrive il diario della giornata | scrive, rilegge, chiude | taccuino | — | — |
| Si prepara per la notte | berretto, sbadiglia, spegne | berretto da notte | — | dorme |
| Cena sotto la luna | apparecchia, mangia, brinda | tavolino | — | — |
| Guarda le stelle | sdraia, indica, unisce i puntini | — | — | cannocchiale |

**Con il meteo** (sostituiscono o affiancano le altre, come oggi)

| Attività | Meteo | Gesti | Lascia |
|---|---|---|---|
| Doccia sotto la pioggia | pioggia | strofina, canta, scrolla | — |
| Salta nelle pozzanghere | dopo la pioggia | salta, schizza, ride | schizzi |
| Mette il secchio sotto la pioggia | pioggia | posa, aspetta, controlla | acqua |
| Legge sotto l'ombrello | pioggia | apre, legge, gocciola | — |
| Fa il pupazzo di neve | neve | rotola, impila, naso di ramo | pupazzo di neve |
| Battaglia di palle di neve | neve | appallottola, lancia, si ripara | — |
| Si scalda le mani al fuoco | freddo | strofina, soffia, sospira | — |
| Si sventola col ventaglio | caldo | sventola, sbuffa, si sdraia | — |
| Bagno nella tinozza | caldo | entra, schizza, galleggia | — |
| Si ripara dai lampi | temporale | si copre, sbircia, trema | — |
| Si perde nella nebbia | nebbia | brancola, chiama, ritrova | — |
| Fa l'angelo nella neve | neve | si sdraia, muove le braccia | sagoma nella neve |
| Rastrella i rami del temporale | dopo il temporale | raccoglie, porta | legna |

### 5.2 Di strada (12 per strada, 84)

Le attività di oggi in `mestieri.ts` restano (marcate *già*); se ne aggiungono
fino a 12 per strada. Ogni strada ha anche le sue **imprese** (sezione 6).

**Imprenditore** — *già*: pubblicità col megafono, contratta con lo
scoiattolo, conta l'incasso, caffè alla scrivania, risponde al telefono, firma
contratti, riunione alla lavagna, chiude l'ufficio, mette le ghiande in
cassaforte, dorme alla scrivania. *Nuove*: fa un sondaggio tra le formiche ·
inaugura un negozio con le forbici.

**Filosofo** — *già*: domande al vento, aforismi sulle foglie, osserva le
formiche con la lente, discute con la lumaca, consulta la biblioteca, guarda le
stelle. *Nuove*: medita sul sasso piatto · scrive un trattato e lo perde ·
tiene lezione agli alberi della stanza · si chiede se esiste mentre si guarda
nella pozzanghera · gioca a scacchi da solo e perde · fonda una scuola (impresa).

**Artista** — *già*: dipinge, cerca l'ispirazione, mescola i colori,
scolpisce, fa da guida alla mostra. *Nuove*: fa i colori con le bacche ·
ritrae gli altri alberi (sembrano patate) · scolpisce la neve · fa un mosaico di
sassi · appende un quadro e lo raddrizza tre volte · dipinge un murale sulla
casetta · vende un quadro allo scoiattolo per una ghianda.

**Sportivo** — *già*: stretching, corsa, salto in lungo, trazioni, ostacoli,
premiazione. *Nuove*: sfida gli altri alberi a braccio di ferro · allena lo
scoiattolo col fischietto · solleva tronchi · fa yoga al tramonto · misura il
record con la fettuccia · organizza la corsa della stanza.

**Furfante** (banda del bosco, caricatura innocua) — *già*: nasconde le
ghiande, si traveste da cespuglio, spia lo scoiattolo, conta il bottino, vende
ghiande d'importazione. *Nuove*: disegna piani segreti alla lavagna · manda
messaggi in codice con le foglie · fa la guardia col cappello calato · prova
l'aria da duro davanti allo specchio · scava una galleria (e sbuca nell'orto) ·
convoca la riunione della banda di notte · restituisce di nascosto quello che
ha preso.

**Viaggiatore** — *già*: prepara lo zaino, studia la mappa, guarda col
binocolo, scrive cartoline, fa finta di partire. *Nuove*: piega un aereo di
carta e lo lancia · fotografa la stanza con una macchina di cartone · prova la
tenda · impara un saluto in un'altra lingua · cucina un piatto «esotico» con le
ghiande · racconta viaggi mai fatti · lancia un messaggio in bottiglia nella
pozzanghera.

**Poeta pigro** — *già*: scrive e cancella, recita alle formiche, cerca una
rima, sonnecchia in amaca, appende un verso. *Nuove*: detta una poesia allo
scoiattolo · conta le sillabe sulle foglie · fa una gara di rime con gli altri
alberi · scrive un verso sulla neve · si commuove per un tramonto · organizza
una serata di poesia (impresa) · rinuncia a scrivere e fa un pisolino (spesso).

### 5.3 Rare (20, sorprese)

| Attività | Quando | Che cosa si vede |
|---|---|---|
| L'ospite inatteso | ~1 volta al mese | Un riccio, una lumaca col cappello, un gufo: Pino lo accoglie, gli offre una tisana |
| La festa improvvisata | dopo un cantiere finito | Festoni, coriandoli, ballo |
| L'eclissi | rarissima, mai annunciata | Pino col cannocchiale, tutto si scurisce un attimo |
| Il tesoro sepolto | scavando | Trova una scatola: dentro un oggetto del catalogo |
| La pioggia di stelle | notti d'agosto | Esprime un desiderio (lo scrive nel diario) |
| Il circo del bosco | ~1 volta ogni due mesi | Pino fa il giocoliere con le ghiande |
| La gita al ruscello | estate | Pino torna con un sasso speciale |
| L'arcobaleno | dopo la pioggia col sole | Pino corre a cercarne la fine |
| La lettera nella bottiglia | rara | Pino ne trova una (scritta dall'AI, innocua) |
| Il primo fiore | primavera | Si commuove, chiama tutti |
| La foglia d'oro | autunno | La conserva nel libro |
| Il ballo della neve | prima neve dell'anno | Balla con i fiocchi |
| La notte delle lucciole | estate | La stanza si accende |
| Il concerto delle cicale | caldo | Dirige con un rametto |
| Il compleanno | ogni 365 giorni | Torta di muschio, candeline |
| Il trasloco della formica | rara | Aiuta una formica col bagaglio |
| La sfida allo scoiattolo | rara | Gara di corsa, vince sempre lo scoiattolo |
| Il sogno ad alta voce | notte, raro | Parla nel sonno: fumetto buffo |
| Il fossile | scavando, rarissimo | Una foglia di pietra: va in collezione |
| Il giorno al contrario | 1 aprile | Fa tutto al contrario, cammina all'indietro |

### 5.4 Di gruppo (con più alberi nella stessa stanza)

Si scelgono quando due o più alberi della stanza sono liberi nella stessa
fascia. Elenco già previsto in `modello-di-business.md` per Famiglia e Foresta,
più quelle che vengono dalle catene: cena sotto la luna, litigio per l'ombra,
foto di gruppo, partita a palla, bancarella insieme, riunione sotto un ombrello
solo, il colpo della banda, fuga dal giardiniere, festa di compleanno, lettera
firmata da tutti, storie al fuoco, coro della sera, braccio di ferro, gara di
rime, lezione del filosofo, ritratto di gruppo dell'artista, torneo.

### 5.5 Intermezzi (tra un ciclo e l'altro, pochi secondi)

Beve, si stiracchia, sbadiglia, si gratta la corteccia, guarda un oggetto e
sorride, sistema un oggetto storto, saluta lo scoiattolo che passa, starnutisce
per il polline, si siede un attimo, pensa (nuvoletta). Sono 10, si alternano
a caso: bastano a far sembrare viva anche un'attività lunga.

## 6. Le imprese

Un'impresa è un progetto lungo legato a una strada: si fonda, cresce di
livello con i cantieri finiti e le attività fatte, ha un capo e dei
sostenitori, rende molto più probabili le sue attività (×4) e sblocca i suoi
oggetti ed edifici. I tre livelli dei mestieri di oggi diventano i livelli
dell'impresa principale di ogni strada.

| Strada | Impresa | Livelli (oggi in `mestieri.ts`) | Edifici e oggetti | Ruoli dei sostenitori |
|---|---|---|---|---|
| Imprenditore | Ghiande & Co. | Bancarella → Ufficio → Holding | banco, scrivania, insegna, cassaforte | socio, contabile, fattorino |
| Filosofo | La scuola sotto la chioma | Pensatore → Scuola → Osservatorio | panchina, biblioteca, cannocchiale, lavagna | allievo, assistente |
| Artista | L'atelier | Pittore → Atelier → Mostra | cavalletto, atelier, scultura, galleria | modello, assistente, critico |
| Sportivo | Il club sportivo | Atleta → Palestra → Campione | sbarra, ostacoli, podio | compagno di squadra, allenatore |
| Furfante | La banda del bosco | Ladruncolo → Mercato nero → Re del bosco | nascondiglio, banco sotto il telo, mappa, covo | palo, contabile delle ghiande, galoppino |
| Viaggiatore | L'agenzia di viaggi | Sognatore → Agenzia → Mongolfiera | bacheca, cartelli, mongolfiera | compagno di viaggio, cartografo |
| Poeta | Il festival di poesia | Poeta → Scrittoio → Festival | amaca, scrittoio, filo delle poesie, palco | lettore, pubblico |

Imprese libere (non legate a una strada, più rare, aperte da catene): l'orto
comunitario, la cucina del bosco, la squadra di calcio, il coro, il teatro.

**Nel codice** (`src/lib/albero/imprese.ts`, fase 4):

- `TIPI_IMPRESA`: le 7 principali (livelli, cantieri e attività sono quelli di
  `MESTIERI`, più nome, oggetti e ruoli della tabella) e le 5 libere, ognuna
  con la catena che la apre (`orto`, `marmellata`, `palla`, `concerto`,
  `storie`). Livelli, cantieri e attività delle libere sono una **proposta**.
- Lo stato di un'impresa (`Impresa`): capo, sostenitori con ruolo e giorno di
  entrata, passi di cantiere fatti. Il livello è 1 più i cantieri finiti.
- Crescita (proposta, `LAVORO_CAPO` e `LAVORO_SOSTENITORE`): ogni giorno il capo
  aggiunge 0,2 passi e ogni sostenitore 0,1. Da solo un passo ogni 5 giorni
  (il livello 2 dell'imprenditore in circa 20 giorni, il 3 in circa 35); con
  due sostenitori il doppio più veloce.
- **Per i pesi della giornata**: `fattoreImpresa(attivita, albero, imprese)`
  restituisce ×4 (`MOLTIPLICATORE_IMPRESA`) se l'attività è di un'impresa di
  cui l'albero è capo o sostenitore. Vale per gli id dei mestieri e delle
  libere e, finché la giornata usa le 23 azioni di oggi, per le azioni della
  strada dell'impresa. `giornata.ts` non è cambiato: lo collega la fase 2.
- Chi ha una strada fonda l'impresa principale della sua strada; se nella
  stanza c'è già, ci entra come sostenitore (il capo resta chi l'ha fondata).
  Un albero può essere capo della sua impresa e sostenitore di **una** altra.

**La banda del bosco** resta la caricatura del boss da film: cappello,
gessato, «affari» di ghiande, riunioni di «famiglia». Niente parole o simboli
della mafia vera, niente violenza, niente accenti presi in giro (regola già in
`modello-di-business.md` e in `personaggio.ts`).

## 7. Carattere: carisma e influenzabilità

### 7.1 I due valori

Ogni albero nasce con due numeri fissi, 5-95, accanto ai sette tratti di oggi:

- **Carisma**: quanto trascina gli altri. Alla nascita: media di ambizione,
  socievolezza ed energia, più un po' di caso.
- **Influenzabilità**: quanto si lascia trascinare. Alla nascita: alta con
  socievolezza e pigrizia, bassa con ambizione e furbizia, più un po' di caso.

Gli alberi già nati li ricevono calcolati dai loro tratti (nessun dato perso).
Non si vedono come numeri: si capiscono dal comportamento, e il diario li
racconta («Ulivetta dice sempre di sì a tutti. Anche a me.»).

Nel codice (`strade.ts`): `nascita()` dà tratti, carisma e influenzabilità
di un albero nuovo (±10 di caso); `carattereDaiTratti()` è lo stesso calcolo
senza caso, usato dalla migrazione per gli alberi già nati.
Influenzabilità = media di socievolezza, pigrizia, 100 − ambizione e
100 − furbizia. `descriviCarattere()` lo dice a parole nel prompt, mai in numeri.

### 7.2 Il contagio

Ogni giorno, per ogni impresa attiva in una stanza, il capo prova a coinvolgere
ciascun albero della stanza che non ne fa già parte:

```
probabilità = 0,12 × (carisma del capo / 100) × (influenzabilità dell'altro / 100) × affinità × sostenitori
affinità:     ×1,5 se la strada dell'altro è vicina, ×0,5 se lontana
sostenitori:  ×(1 + 0,2 per ogni sostenitore che ha già)   (la banda che cresce attira)
```

Proposta di numeri da tarare con `npm run simula`: con un capo molto
carismatico (90) e un albero molto influenzabile (85) circa un giorno su dieci;
con un albero testardo (20) quasi mai.

- Chi accetta diventa **sostenitore** con un ruolo (tabella in 6): fa le
  attività dell'impresa nel suo ruolo (il palo fa la guardia mentre il capo
  conta), e l'impresa cresce più in fretta.
- Ogni giorno un sostenitore poco convinto può **andarsene** (probabilità
  piccola, più alta se la sua strada è lontana). Lo racconta il diario.
- **Prima che la strada si riveli**, il contagio aggiunge punti alla strada del
  capo: un germoglio influenzabile in una stanza con un boss carismatico ha più
  probabilità di diventare furfante. È naturale, e usa le regole di oggi.
- **Dopo la rivelazione**, cambiare strada è **raro e annunciato** (proposta):
  solo dopo almeno 60 giorni da sostenitore, con una piccola probabilità al
  giorno; diventa un grande evento nel diario e una lettera. Nessuna strada
  delude: anche il poeta diventato furfante resta un personaggio simpatico.
- Due capi carismatici nella stessa stanza: **rivalità** buffa (attività di
  gruppo «chi ha più ombra», gara tra imprese), mai cattiveria.

### 7.3 Com'è fatto e che cosa dà la simulazione (fase 4)

`giornoDellaStanza()` in `src/lib/albero/contagio.ts`, una volta al giorno per
stanza, prima delle giornate: fondazioni, rivalità, abbandoni, contagio,
punti alla strada, cambio di strada, lavoro delle imprese, attività di gruppo.
`raccontaFatti()` ne fa frasi per ognuno degli alberi coinvolti, che entrano
nel prompt della giornata (`GiornoDaVivere.fattiStanza`) perché il diario le
racconti; `applicaStanza()` (`vita.ts`) aggiunge i punti e il cambio di strada
allo stato. Tutti i numeri sono in `CONTAGIO` e `CAMBIO_STRADA`:

| Parametro | Valore (proposta) | Perché |
|---|---|---|
| Formula | 0,12 × carisma × influenzabilità^1,5 × affinità × (1 + 0,2 per sostenitore) | L'esponente 1,5 sull'influenzabilità (con 1 il testardo entrerebbe un giorno su 46) |
| Affinità | ×1,5 stessa strada o vicina, ×0,5 lontana, ×1 le altre | Vicine: filosofo-poeta, filosofo-viaggiatore, artista-poeta, artista-viaggiatore, imprenditore-furfante, imprenditore-sportivo, sportivo-viaggiatore. Lontane: filosofo-sportivo, poeta-sportivo, poeta-imprenditore, filosofo-furfante, artista-imprenditore |
| Abbandono | 0,02 × (1,5 − influenzabilità) × (1,5 − carisma del capo) × affinità (×0,25 stessa strada, ×0,5 vicina, ×2 lontana) | Chi è poco convinto se ne va, con garbo |
| Punti alla strada | +1 o +2 al giorno alla strada del capo (2 × influenzabilità, arrotondato), solo prima della rivelazione | Il germoglio influenzabile tende alla strada del capo |
| Cambio di strada | dopo 60 giorni da sostenitore, 1% al giorno × influenzabilità; `CAMBIO_STRADA.attivo = false` lo spegne | **Da confermare** (16, punto 7) |
| Rivalità | due capi con carisma ≥ 60 nella stessa stanza: non si reclutano a vicenda e ogni tanto si sfidano | Mai cattiveria |
| Attività di gruppo | ~30% dei giorni con almeno due alberi (`PROBABILITA_GRUPPO`), compleanno sempre | 19 attività in `gruppo.ts` (sezione 5.4 più le due della rivalità) |

Risultati di `npm run simula -- --alberi 3 --giorni 60 --caratteri 90/30,50/85,50/20 --strade furfante,-,- --prove 300 --seme 1`
(300 stanze, senza AI, 12/11/2026):

- capo 90 → albero influenzabile 85: entra **un giorno su 10** in cui può
  entrare; in 284 stanze su 300 entra almeno una volta, in media il giorno 10;
- capo 90 → albero testardo 20: **un giorno su 91**; entra almeno una volta
  in 120 stanze su 300, in media il giorno 28 (quasi mai giorno per giorno,
  ma in due mesi capita a circa 4 stanze su 10);
- con 4 alberi (carismi 85 e 75): circa una sfida tra rivali e 18 attività
  di gruppo ogni 60 giorni;
- le imprese crescono: in 60 giorni circa 5 cantieri finiti per stanza, e
  quasi tutte le imprese fondate nelle prime settimane arrivano al livello 3
  (le giornate finte rivelano la strada presto; con l'AI la rivelazione
  arriva quando arriva);
- in 200 giorni un poeta influenzabile (85) nella banda di un capo 90 cambia
  strada in circa 4 stanze su 10 (0,41 cambi a stanza). Se è troppo, si
  abbassa `CAMBIO_STRADA.probabilita`.

Con l'AI (`npm run simula -- --alberi 3 --giorni 60 --caratteri 90/30,50/85,55/20
--nomi Pino,Ulivetta,Quercino`, Haiku, 12/11/2026): Quercino (testardo) e Pino
(capo 90) diventano poeta e furfante e fondano il festival e la banda;
Ulivetta (influenzabile) entra nel festival come lettore il giorno 23 e il
giorno dopo si rivela poeta; Quercino non entra mai in niente. Entrambe le
imprese arrivano al livello 3 in 60 giorni. Il diario racconta tutto con i
nomi degli altri («Pino dice che non è ballo, io dico che è un verso con le
gambe»); nessuna parola fuori tono (il controllo di `simula` segnalava
«picchio», l'uccello: corretto).

I numeri esatti cambiano col seme: si rifanno con `--prove` dopo ogni ritocco.

## 8. Le animazioni: perché non sembri sempre la stessa cosa

Ogni attività è costruita con più strati; due attività diverse non hanno mai
tutti gli strati uguali.

1. **Gesti** in sequenza (3-4 per attività). Oggi `gesti.ts` ne ha 11
   (luogo, mano, prendi, cammina, siediti, alzati, colpi, sospira,
   asciugaFronte, manoSuiFianchi, saltelloContento). Ne servono circa **50**:
   - movimento: cammina, corre, saltella, si china, si sdraia, si rotola,
     indietreggia, si nasconde;
   - mani: raccoglie, porta, posa, versa, mescola, martella, sega, scava,
     zappa, rastrella, spazza, strofina, strizza, intreccia, gratta, impila,
     lancia, afferra, sventola, dipinge, scrive, timbra, indica, applaude,
     saluta, conta sulle dita;
   - viso e testa: soffia, beve, assaggia, annusa, sbadiglia, starnutisce,
     fischia, canta, ride, sbircia;
   - corpo: si stiracchia, dondola, trema, si scrolla, balla, s'inchina.
2. **Spostamenti**: Pino cammina verso il posto dell'attività (sezione 2.3).
3. **Oggetti animati**: il fuoco crepita, la pentola fuma, l'altalena dondola,
   la tela si colora, il mucchio cresce.
4. **Effetti**: fumo, scintille, note, trucioli, bolle, lucciole, foglie,
   gocce, stelline. Un sistema di particelle leggero in SVG/CSS.
5. **Tracce che restano** (colonna «Lascia»): entri e vedi che cosa ha fatto.
6. **Viso**: espressione dell'attività (concentrato, soddisfatto, frustrato
   se il fuoco non parte) mescolata all'umore del giorno.
7. **Gli altri alberi**: aiutano, guardano, fanno il tifo.

Priorità di disegno: le **quotidiane** hanno le animazioni più curate (si
vedono di più); le rare possono essere più semplici, sorprendono già.

Il «movimento ridotto» resta: niente salti, scosse né corse, ma la stanza
cambia lo stesso (tracce, oggetti, posizione).

## 9. Le decisioni, i pensieri, gli sblocchi a schermo

### 9.1 La decisione del buongiorno

1. Apri la domanda: la scena **zooma su Pino** (300-500 ms) e lo inquadra;
   lui guarda verso di te, in attesa.
2. Tocchi una risposta: Pino risponde con un **fumetto** (la frase la scrive
   già l'AI col buongiorno: si aggiunge una frase di reazione per risposta).
3. Lo zoom torna indietro e per **qualche minuto** (proposta: 5 minuti reali,
   salvati in `localStorage` con l'ora) Pino è **pensieroso**: mano al mento,
   nuvoletta con l'icona della questione, ogni tanto annuisce da solo.
4. Il giorno dopo il diario racconta che cosa ha deciso (come oggi).

### 9.2 La nuvoletta del pensiero

- Ogni 40-90 secondi, se Pino non è impegnato in un gesto grande, compare la
  nuvoletta (a puntini, diversa dal fumetto delle parole) per 3-4 secondi.
- Dentro un'**icona** e a volte due parole: che cosa vorrebbe fare dopo (il
  passo successivo della catena: un fuoco), che cosa gli manca («legna?»), a
  chi pensa (un altro albero), il regalo che ha ricevuto.
- Toccarla: Pino lo dice ad alta voce in un fumetto.
- È anche il modo di **anticipare**: se pensa al fuoco, domani lo accenderà.

### 9.3 Lo sblocco

- Compare nella stanza un **pacco con il nastro** (o il cantiere finito
  coperto da un telo). Pino ci gira intorno, curioso.
- Tocchi: si apre con coriandoli e un suono leggero (se l'audio è attivo),
  l'oggetto vola al suo posto, Pino reagisce (fumetto, saltello).
- In alto: «**Nuovo nella collezione: l'altalena · 24 su 200**».
- Nel catalogo l'oggetto ha l'etichetta **Nuovo** finché non lo guardi.
- Se non entri, il pacco aspetta (al massimo 3 pacchi, poi si accumulano in
  uno solo «tante novità»).

## 10. La collezione diventa un catalogo (~200)

| Categoria | Quanti (proposta) | Come si sbloccano |
|---|---|---|
| Edifici | 20 | Cantieri delle imprese e delle catene |
| Arredi | 50 | Catene, imprese, regali, baratti, tesori |
| Attrezzi | 25 | Attività fatte più volte (dieci fuochi → l'acciarino) |
| Giochi | 20 | Catene di gioco, regali, rare |
| Vestiti | 40 | Meteo, strada, imprese, stagioni, regali |
| Trofei | 30 | Traguardi di vita (quelli di oggi più nuovi) |
| Album delle stagioni e rarità | 15 | Stagioni, eventi rari, fossili, foglia d'oro |

- **Le regole sono nel codice**, mai decise dall'AI (come `collezione.ts`).
- Le **voci bloccate** si vedono come sagome con un indizio («Pino deve
  accendere tanti fuochi»): fa venire voglia di tornare.
- **Si sbloccano solo vivendo**, mai comprando: è la regola di oggi.
- Partenza realistica: **circa 60 oggetti disegnati** al lancio (tra cui una
  decina di edifici), il resto aggiunto ogni mese. Il catalogo nel codice può
  avere già tutte le voci, quelle senza disegno restano «in arrivo» e non si
  sbloccano.

## 11. I regali

- Il regalo che fai diventa **un oggetto della stanza** (o un vestito
  nell'armadio, un attrezzo, un gioco, un edificio piccolo da montare).
- Pino decide da solo che cosa farne, come oggi; ma ora lo **usa davvero**:
  ogni regalo apre almeno due attività (l'aquilone → «fa volare l'aquilone»,
  «ripara l'aquilone dopo il temporale»).
- Il catalogo dei regali passa da 10 a circa 40, con le stesse categorie
  degli oggetti.
- Le regole di `modello-di-business.md` restano: i regali non cambiano mai la
  strada né le classifiche, e non si vende l'influenza sulla vita dell'albero.

## 12. Le lettere: una a settimana

- **Una lettera a settimana per tutti i piani** (Federico, 12/11/2026), ogni 7
  giorni vissuti, nella **stessa email** della cartolina della settimana.
- Sostituisce la lettera di fine mese e quella di metà mese del Premium.
- Resta su **Opus** (`compito: "scrittura"`). Da 1-2 a circa 4 lettere al mese
  per albero: la voce AI delle lettere cresce di 2-4 volte; il costo vero va
  misurato con le prime settimane (in `modello-di-business.md` oggi c'è una
  stima per anno, da rifare).
- La lettera racconta la settimana: le catene, le imprese, gli sblocchi, gli
  altri alberi. La riga «Lettere all'anno» dei pacchetti va aggiornata.

### Lettere chiuse e aperte, ben distinte

| | Chiusa (nuova) | Aperta (letta) |
|---|---|---|
| Busta | Chiusa, color crema acceso, ombra marcata | Aperta, piatta, carta più chiara |
| Sigillo | Ceralacca rossa a forma di foglia | Sigillo rotto, o assente |
| Segno | Bollino «Nuova» e un leggero dondolio | Spunta discreta e data di lettura |
| Nella stanza | La cassetta delle lettere con la bandierina alzata, Pino ogni tanto la guarda | Bandierina abbassata |
| Elenco | In cima, testo in grassetto | Sotto, testo normale |

## 13. Le due foreste 3D, nel dettaglio

- **Riuso**: motore di oggi (`creaGiardino`), con un modo «panoramica»: telecamera
  alta, alberi raggruppati per stanza, niente routine pesanti (solo respiro e
  vento). Il seme dell'albero sceglie il modello come oggi.
- **Tua foresta**: fino a 10 radure (stanze), fino a 4 alberi ciascuna;
  tocchi → stanza 2D. Pannello dei numeri (1.1 e 1.4).
- **Foresta del club**: un modello leggero, centinaia di copie; nomi solo
  vicini; la telecamera si sposta trascinando; la tua bandierina; «aiutaci a
  rendere questa foresta sempre più fitta» con il pulsante per regalare un seme
  (già previsto: «Seme da regalare»).
- Senza WebGL o su dispositivi lenti: una mappa 2D con le radure e i numeri
  (lo stesso ripiego di oggi).

### La tua foresta: com'è fatta (fase 6)

- **Pagina** `/foresta` (`src/app/foresta/`): la vista a tutto schermo, il
  pannello dei numeri a destra (computer) o in basso (telefono), «Al giardino»
  e, nel giardino, il bottone «Foresta» per tornare qui.
- **Motore**: `src/lib/giardino3d/panoramica.js`, file a parte (non tocca
  `index.js`, che usa anche la foresta del club). Radure in una griglia sciolta
  (2 colonne sul telefono in verticale), recinto di pali con il varco davanti,
  cartello col nome della stanza e degli alberi, sentieri fra le radure, bosco
  morbido intorno e solo cespugli davanti (non coprono i cartelli). Le chiuse:
  prato incolto, cespugli, lucchetto di rami che ondeggia piano e cartello con
  la regola («Pianta altri 4 alberi»). Si vedono le prossime 2 da aprire.
- **Movimento**: respiro, oscillazione col vento (più forte con pioggia e
  temporale), braccia che si muovono appena; con il movimento ridotto è tutto
  fermo e la discesa è immediata.
- **Il passaggio**: tocchi un albero o una radura → la camera scende in 1,25 s
  sulla radura (o sull'albero), la pagina sfuma nel colore della carta e si apre
  `/giardino?stanza=<id>&albero=<id>&da=foresta`; il giardino entra con un velo
  che si scioglie e un piccolo zoom. Il giardino oggi usa `albero` (se è della
  persona); `stanza` è pronto per la fase 5.
- **Numeri veri**: alberi piantati, giorni vissuti (somma), lettere ricevute,
  oggetti sbloccati, stanze aperte su 10. Gli alberi veri in Italia: nessun dato
  nel database, il pannello scrive «in arrivo» (`NumeriForesta.alberiVeri =
  null`). Nessuna cifra di CO2 (1.4).
- **Stanze aperte** (`src/lib/foresta/regole.ts`): la regola di 2.1 con base 1
  per tutti i piani (16.3 da decidere) e rinnovi 0 (il dato non c'è ancora).
- **Prove della demo**: `?esempi=1` aggiunge 3 stanze d'esempio, `?esempi=pieno`
  la foresta più grande (10 stanze, 37 alberi); gli esempi hanno il cartello
  «esempio della demo», non si aprono e non entrano nei numeri. `?vista=mappa`
  forza il ripiego, `?meteo=` come nel giardino.
- **Ripiego 2D**: senza WebGL, se la scheda grafica si perde o se dopo
  l'avvio resta sopra i 50 ms per fotogramma (la stessa regola e lo stesso
  segno `linfa-3d-lento` del giardino 3D di prima): mappa disegnata con le
  radure, gli alberelli colorati per strada e i lucchetti.
- **Prestazioni**: oltre 12 alberi i personaggi si «congelano» (i pezzi fermi
  di corpo, chioma, braccia e gambe uniti per materiale: da ~140 disegni ad
  albero a una ventina); il viso resta fermo, il respiro e il vento restano.
  Ombre calcolate una volta sola, qualità adattiva come nel giardino. In
  sviluppo `window.__foresta.misura()` dà i ms per fotogramma.

| Foresta (computer di sviluppo, misura di 240 fotogrammi) | Disegni | ms per fotogramma |
|---|---|---|
| 4 radure + 2 chiuse, 10 alberi, 2560×1600 | 791 | ≈ 8,7–10,3 |
| 10 radure, 37 alberi, senza congelare, 2560×1600 | 2552 | ≈ 28 |
| 10 radure, 37 alberi, congelati, 2240×1400 | 760 | ≈ 12 |
| 4 radure + 2 chiuse, telefono 375×812 (emulato, 750×1624 px) | 791 | ≈ 14 |

Il telefono è stato provato solo con l'emulazione del browser sul computer:
le misure su un telefono vero sono da fare.

## 14. Dati e database

Nel codice (cataloghi, come oggi): `attivita.ts` (le ~175, con pesi, gesti,
posti, requisiti, effetti), `catene.ts`, `imprese.ts` (estende `mestieri.ts`),
`oggetti.ts` (catalogo ~200, estende `collezione.ts` e `regali.ts`),
`risorse.ts`.

Nel database (migrazioni nuove):

| Tabella o colonna | Che cosa tiene |
|---|---|
| `rooms` | stanza: proprietario, numero, nome, sbloccata quando |
| `trees.room_id` | dove abita l'albero |
| `trees.carisma`, `trees.influenzabilita` | i due valori fissi |
| `trees.risorse jsonb` | le quantità di risorse |
| `trees.memoria jsonb` | catene aperte, ultime attività per fascia (anti-ripetizione) |
| `trees.giornata jsonb` | le 4 attività di oggi (già previsto in `routine-strade.md`) |
| `room_items` | oggetto, stanza, posto, da chi viene (decisione, regalo, costruzione), nuovo sì/no |
| `ventures` | imprese: strada, stanza, capo, livello, fondata quando |
| `venture_members` | sostenitori: albero, ruolo, da quando |
| `unlocks` | resta, con le categorie nuove |
| `club_consent` | consenso a comparire nella foresta del club, con data |

RLS come oggi: la persona legge solo le sue righe; scritture solo dal server.
La foresta del club legge una **vista** con i soli campi pubblici (nome
dell'albero, iniziali se consentite, specie del modello, posizione).

## 15. Costi AI

- La giornata resta **una chiamata ad Haiku al giorno** per albero: il prompt
  si allunga (candidate per 4 fasce, memoria, imprese) e la risposta pure
  (4 righe di diario invece di una). Il costo in più va misurato con
  `npm run simula` prima di decidere.
- Contagio, catene, sblocchi, risorse: **codice, costo zero**.
- Lettere: Opus, una a settimana (sezione 12).

## 16. Da decidere

1. **CO2**: chi trova la fonte (Federico o Claude con proposta da approvare) e
   chi fa la verifica legale. Finché manca, solo fatti.
2. ~~Lettere ogni giorno~~ → **una a settimana per tutti** (Federico,
   12/11/2026). Resta da confermare: su Opus, sostituisce mensile e metà mese.
3. **Stanze per piano**: proposta Albero 1, Famiglia 2, Foresta 3.
4. **Foresta del club nella demo**: alberi d'esempio segnati come tali, o
   aspettare i dati veri?
5. **Alberi piantati**: per lo sblocco delle stanze contano anche i semi
   regalati ad altri?
6. **Chi arreda**: Pino sistema da solo e la persona sposta (proposta), o
   sistema la persona?
7. **Cambio di strada per contagio**: raro e annunciato dopo 60 giorni
   (proposta), o mai?
8. **Capienza** di una stanza: 4 alberi (proposta)?
9. **Audio**: suoni leggeri per sblocchi e lettere, spenti di default?

## 17. Piano di lavoro

| Fase | Che cosa | Dipende da |
|---|---|---|
| 1 | **Pino vivo nel 2D**: giornata a 4 fasce con i pesi e l'anti-noia sulle attività che ci sono già, intermezzi, nuvoletta, decisione con zoom e fumetto, lettere chiuse e aperte distinte; il giardino torna al 2D | niente |
| 2 | Lettera settimanale; risorse e catene quotidiane (fuoco, orto, marmellata); prime 30 attività nuove; ~20 gesti nuovi | 16.2 |
| 3 | Catalogo degli oggetti e momento dello sblocco; regali che diventano oggetti; le prime 60 voci disegnate | 16.6 |
| 4 | Imprese e contagio (carisma, influenzabilità, ruoli); attività di gruppo — **motore puro fatto** (12/11/2026), il database lo collega la fase 5 | 16.7 |
| 5 | Stanze: database, posti, arredo, sblocco, trasloco | 16.3, 16.5, 16.8 |
| 6 | La tua foresta 3D con i numeri | 16.1 |
| 7 | La foresta del club 3D con consenso | 16.4 |
| 8 | Le altre attività fino a ~175, oggetti fino a ~200 (poi ogni mese) | — |

Ogni fase si chiude con prove nel browser (telefono e computer, movimento pieno
e ridotto) e `npm run simula` per controllare che in 30 giorni simulati
l'albero non si ripeta e che le probabilità diano i risultati attesi.
