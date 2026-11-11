# Le routine delle strade: l'albero che fa le cose

Progetto dell'11/11/2026, approvato da Federico il giorno stesso. Oggi l'albero sceglie ogni giorno una
delle 23 azioni del catalogo e la recita in una scenetta. Qui la sua vita
diventa un mestiere: in base alla strada che prende costruisce le sue cose
(una scrivania, un'insegna, un'amaca), le usa ogni giorno con orari suoi e
cresce di livello. Il prato si riempie poco a poco di quello che ha fatto.

> **A che punto siamo (11/11/2026).** Fatte le fasi 1 e 2: il catalogo delle
> sette strade (`src/lib/albero/mestieri.ts`) e il pilota animato
> dell'imprenditore, visibile in `/catalogo` («Il mestiere dell'imprenditore»):
> si sceglie il giorno della carriera e l'ora, e lui fa quello che farebbe.
> Da fare: fase 3 (motore e database, il giardino che passa `mestiere` e `ora`
> all'albero), fase 4 (le altre sei strade), fase 5 (rifiniture). Com'è fatto
> il pilota: sezione 8.

Per non perdere il tono (`personaggio.ts`): tutto resta ironico e innocuo,
niente soldi veri, marchi o persone reali. Il furfante resta da favola.

## 1. Gli strati, dal più grande al più piccolo

| Strato | Che cos'è | Quanto dura | Chi lo decide |
|---|---|---|---|
| **Strada** | Chi è diventato: filosofo, imprenditore, artista, sportivo, furfante, viaggiatore, poeta | Per sempre (si rivela con i punteggi, come oggi) | Il motore, come oggi |
| **Livello** | A che punto è della sua carriera: 1, 2, 3 | Settimane | Una regola: sale di livello ogni cantiere finito |
| **Cantiere** | Una cosa che costruisce, in 3-4 passi, un passo per giornata di lavoro | 4-10 giorni | L'AI decide *se* oggi lavora al cantiere, la regola decide *quale* e *quale passo* |
| **Arredo** | Quello che resta nel prato a cantiere finito (scrivania, insegna…) | Per sempre | Il cantiere |
| **Giornata** | Le attività del giorno divise per fasce: mattina, giorno, pomeriggio, sera; di notte dorme | Un giorno | L'AI, scegliendo tra le attività ammesse |
| **Attività** | Una scenetta animata di 8-15 s con varianti (rispondere al telefono, firmare un contratto…) | Una fascia oraria, a ciclo | La giornata |
| **Gesto** | Un mattoncino riusato da tutte le attività: sedersi, camminare fino a, raccogliere, martellare, scrivere, telefonare, timbrare | 1-3 s | Le attività |

E gli strati che stanno sopra tutto, come oggi:

- **Meteo**: vince sempre, ma ogni strada ha la sua variante. Con la pioggia
  l'imprenditore telefona sotto l'ombrello invece di farsi la doccia; con il
  freddo il poeta scrive col cappello e la sciarpa e si soffia sulle dita.
- **Strato di vita**: respiro, ciglia, sguardo, molle della chioma.
- **Interazioni**: il saluto, il solletico e il trascinamento restano uguali,
  ma con le frasi e i gesti della strada. Toccare un arredo fa qualcosa
  (il cassetto della scrivania si apre, l'amaca dondola).
- **Regali** del Premium: un regalo può diventare un arredo («ha messo il
  berretto sulla lampada della scrivania»).

### Prima che la strada si riveli: i provini

Il germoglio prova un po' di tutto, goffamente: telefona con una foglia al
posto del telefono, prova a fare una trazione e resta appeso, scrive una rima
e la cancella. Le attività di prova vengono dalle due strade più alte in
classifica, così si vedono gli indizi senza nominare la strada.

## 2. Un esempio completo: l'imprenditore

### Livelli e cantieri

| Livello | Nome | Arredi nel prato |
|---|---|---|
| 1 | La bancarella | Cassetta di legno capovolta come banco, cartello «OMBRA» (c'è già) |
| 2 | L'ufficio sotto la chioma | + scrivania con sedia-ceppo, + insegna «Ghiande & Co.» |
| 3 | La holding del bosco | + cassaforte di ghiande, + telefono col filo di liana, lo scoiattolo diventa socio (cappellino) |

**Cantiere 1 · La scrivania** (porta al livello 2)

1. *Raccoglie i rami.* Va avanti e indietro, prova i rami caduti piegandoli
   (uno si spezza, faccia offesa), li impila accanto a sé.
2. *Sega e inchioda.* Sega di foglia, segatura che vola, martella tre chiodi;
   al terzo si colpisce un dito, saltella soffiandoci sopra.
3. *Monta il piano.* Appoggia il piano, controlla con la livella: una gamba è
   corta, ci infila sotto una ghianda. Soddisfatto.
4. *Inaugura.* Nastro rosso, lo taglia, lo scoiattolo applaude, si siede per la
   prima volta e fa un giro sulla sedia.

**Cantiere 2 · L'insegna** (3 passi): disegna le lettere su una tavola (una
al contrario, la corregge), la pittura, la appende storta e la raddrizza con
un colpetto.

**Cantiere 3 · La cassaforte di ghiande** (3 passi): scava, la fodera di
corteccia, sceglie la combinazione segreta (la dimentica subito e la scrive su una foglia).

### Le attività, per fascia

| Fascia | Livello 1 | Livello 2-3 |
|---|---|---|
| Mattina | Apre la bancarella e fa pubblicità con un megafono di foglia | Apre l'ufficio (toglie il telo), caffè alla scrivania con i piedi sopra |
| Giorno | Vende ombra, contratta con lo scoiattolo | **Risponde al telefono**: squilla, lo cerca, risponde, cammina avanti e indietro gesticolando, risata finta, riattacca e annota. **Firma contratti** col timbro a forma di foglia |
| Pomeriggio | Conta le ghiande, due volte | Riunione con lo scoiattolo alla lavagnetta (grafico che sale, lo scoiattolo si addormenta); oppure lavora al cantiere |
| Sera | Chiude la bancarella e conta l'incasso | Conta l'incasso sulla calcolatrice di sassolini, spegne la lampada |
| Notte | Dorme | Dorme seduto alla scrivania, cravatta allentata |

Varianti col meteo: con la pioggia telefona sotto l'ombrello e legge i
giornali finanziari; col sole prende il sole col telefono all'orecchio; col
freddo fa i conti soffiandosi sulle dita.

Reazioni: al clic «Ha un appuntamento? Le fisso un quarto d'ora fra tre
anni.»; se lo sollevi «Attento, ho una riunione!»; clic sulla scrivania: apre
il cassetto e tira fuori un biglietto da visita.

## 3. Le altre strade, in breve

Stessa struttura: 3 livelli, 3 cantieri, 6-8 attività. Da rifinire una alla volta.

| Strada | Cantieri (arredi) | Attività tipiche |
|---|---|---|
| **Filosofo** | Panchina per pensare · Biblioteca di cortecce · Cannocchiale di canna | Dialoga col vento, scrive aforismi sulle foglie e li appende, osserva le formiche con la lente, medita, fa domande alla lumaca |
| **Artista** | Cavalletto (c'è già) · Atelier con le tele appese · Scultura di un ramo | Dipinge (il quadro cambia ogni giorno), scolpisce, cerca l'ispirazione, organizza una mostra per lo scoiattolo, si sporca di colore |
| **Sportivo** | Sbarra per trazioni · Percorso a ostacoli · Podio | Trazioni, salto in lungo misurato con la fettuccia, stretching, corsa a ostacoli, lo scoiattolo fa l'allenatore col fischietto, premiazione |
| **Furfante** | Nascondiglio delle ghiande · Banco del mercato nero (sotto un telo) · Mappa del tesoro | Nasconde ghiande e dimentica dove, si traveste da cespuglio, sbircia lo scoiattolo, conta il bottino, vende ghiande «d'importazione» |
| **Viaggiatore** | Bacheca delle cartoline · Cartelli direzionali · Mongolfiera di foglie (lunga: 5 passi) | Prepara lo zaino, studia la mappa, scrive cartoline, guarda lontano col binocolo, fa finta di partire e torna |
| **Poeta** | Amaca · Scrittoio · Filo delle poesie appese ai rami | Scrive e cancella, recita alle formiche, sonnecchia in amaca, cerca una rima, appende un verso |

## 4. I dati

### Il catalogo dei mestieri (`src/lib/albero/mestieri.ts`, nuovo)

```ts
type Fascia = "mattina" | "giorno" | "pomeriggio" | "sera";

interface Attivita {
  id: string;                 // "imprenditore.telefono"
  etichetta: string;          // «risponde al telefono»
  fasce: Fascia[];
  meteo: CompatibilitaMeteo;  // come le azioni di oggi
  livello: 1 | 2 | 3;         // da che livello è possibile
  richiede: string[];         // arredi necessari, es. ["scrivania"]
  scenetta: string;           // id della scenetta animata
}

interface Cantiere {
  id: string;                 // "imprenditore.scrivania"
  nome: string;
  richiede: string[];         // arredi da avere prima
  passi: { etichetta: string; scenetta: string }[];
  lascia: string;             // l'arredo che resta nel prato
}

interface Mestiere {
  strada: Strada;
  livelli: { nome: string }[];          // il livello sale a ogni cantiere finito
  cantieri: Cantiere[];                 // in ordine
  attivita: Attivita[];
  provini: string[];                    // attività goffe prima della rivelazione
}
```

### Lo stato di ogni albero (database)

Tre colonne nuove in `trees` (una migrazione):

- `arredi text[]`: le cose costruite, in ordine («imprenditore.scrivania»…).
- `cantiere jsonb`: il cantiere in corso e il passo, oppure null.
- `giornata jsonb`: le attività di oggi per fascia, scelte dall'AI.

Il livello non si salva: è il numero di cantieri finiti.

### Il motore (`vita.ts`)

Oggi l'AI sceglie per ogni giorno un'`azione`. In più sceglierà:

- `giornata`: un'attività per fascia, dall'elenco ammesso (strada, livello,
  arredi, meteo del giorno);
- `cantiere`: true se oggi lavora al cantiere (al massimo un passo al giorno,
  almeno un giorno di pausa tra un cantiere e l'altro).

Le regole (non l'AI) decidono quale cantiere viene dopo, quando finisce e quando
si sale di livello: così l'avanzamento è prevedibile e si vede. Il diario
racconta il passo del cantiere («Ho martellato tre chiodi. Il terzo era il mio
dito.»). La chiamata resta una sola al giorno sul modello piccolo: si allunga
di poche righe.

## 5. L'animazione

- **Gesti**: una libreria di mattoncini (`vivo/gesti.ts`) da cui si montano tutte
  le attività: cammina fino a un punto, siediti e alzati, raccogli, porta,
  martella, sega, scrivi, timbra, telefona, indica, applaudi, bevi. Le sei
  scenette di oggi si riscrivono con gli stessi mattoncini.
- **Arredi**: disegni nuovi con i loro punti d'uso (dove si siede, dove appoggia
  il telefono). Stanno ai lati dell'albero, dentro il suo SVG che nel paesaggio
  può uscire dal riquadro; l'albero ci cammina davanti. Al massimo tre o quattro
  vicino a lui; i più vecchi si spostano verso i bordi.
- **Oggetti nuovi in mano**: martello, sega, timbro, lavagnetta, megafono,
  livella, binocolo, fischietto…
- **Fascia oraria**: decide l'ora vera della città (il giardino la conosce già).
  Di notte dorme, ma col suo stile di strada.
- **Props nuove e facoltative di `<Albero>`**: `mestiere` (strada, arredi,
  cantiere, giornata) e `ora`. Senza, l'albero fa quello che fa oggi.

## 6. Piano di lavoro

1. **Catalogo**: `mestieri.ts` con le sette strade (nomi, cantieri, attività,
   frasi). Si rilegge con Federico prima di disegnare.
2. **Pilota: l'imprenditore, solo animazione.** Gesti, arredi, i tre cantieri e
   le attività dei tre livelli, visibili nel catalogo e negli strumenti della
   demo («fai finta che sia il giorno 20, livello 2, pomeriggio»). Niente
   database.
3. **Motore e database**: migrazione, scelta della giornata e dei cantieri in
   `vita.ts`, salvataggio in `servizio.ts`, `npm run simula` che mostra la
   carriera; il giardino passa `mestiere` e `ora` all'albero. Da fare insieme
   alla sessione che oggi lavora sul motore.
4. **Le altre sei strade**, una alla volta, con lo stesso schema.
5. **Rifiniture**: provini prima della rivelazione, regali che diventano arredi,
   attività di stagione (il poeta raccoglie le foglie d'autunno).

## 7. Da decidere

1. ~~Si parte dall'imprenditore come pilota?~~ Sì (Federico, 11/11/2026): fatto.
2. Le attività del giorno le sceglie l'AI tra quelle ammesse (più varietà, quasi
   gratis) o seguono un orario fisso per strada (più prevedibile)? Proposta: AI.
3. Gli arredi restano per sempre nel prato (proposta: sì, con un massimo visibile)?
4. La fascia oraria segue l'ora vera della città dell'albero (proposta: sì) o
   ogni visita mostra l'attività principale del giorno?

## 8. Il pilota dell'imprenditore: com'è fatto

**Dove si vede.** `/catalogo`, sezione «Il mestiere dell'imprenditore»
(`src/components/albero/VetrinaMestiere.tsx`). Il cursore sceglie il giorno da
quando ha preso la strada (0-22), i bottoni l'ora; sotto, le attività possibili
in quel momento e, se quel giorno lavora a un cantiere, il cantiere. Quando
cambi, l'albero ci va camminando da dov'è.

**La carriera di prova** (`carrieraAlGiorno` in `mestieri.ts`): tre giorni per
ambientarsi, un passo di cantiere al giorno, due giorni di pausa tra un
cantiere e l'altro. Scrivania dal giorno 3 al 6 (livello 2 dal 7), insegna dal 9
all'11, cassaforte dal 14 al 16 (livello 3 dal 17). I cantieri si fanno di
giorno e di pomeriggio.

**Che cosa è animato**

| | Scene |
|---|---|
| Livello 1, alla bancarella | Pubblicità col megafono di foglia (grida, indica il cartello, occhiolino) · Contratta con lo scoiattolo (arriva, no col capo, mano al mento, stretta di mano, una ghianda vola sul banco) · Conta l'incasso (e lo riconta) |
| Livello 2, alla scrivania | Caffè (sorsi, si appoggia indietro, sospiro) · Telefono (squilla, salta sulla sedia, risponde, si alza e cammina gesticolando, risata finta, riattacca, annota) · Contratti col timbro (la scrivania sobbalza, soffia sull'inchiostro, archivia) · Riunione alla lavagna (il grafico sale, lo scoiattolo si addormenta, colpo di bacchetta) · Chiude (conta, sbadiglia, spegne la lampada, la riaccende per «un ultimo conto») · Notte (dorme sulla scrivania) |
| Livello 3 | Mette le ghiande in cassaforte (aria furba, sportello, combinazione) |
| Cantiere scrivania | Raccoglie i rami (tre viaggi, uno si spezza) · Sega e inchioda (segatura, il martello sul dito, saltella) · Monta il piano (livella, la gamba corta, la ghianda sotto) · Inaugura (discorso, forbici, nastro, stelline, si siede e gira sulla sedia) |
| Cantiere insegna | Disegna le lettere (seduto per terra, ne corregge una) · La dipinge · La appende storta e la raddrizza con un colpetto |
| Cantiere cassaforte | Scava · Monta la cassa e la fissa col martello · Sceglie la combinazione, la scrive su una foglia e la dimentica |

Ogni cantiere si vede per intero la prima volta (il lavoro vero, con l'arredo
che cresce); poi l'albero fa i ritocchi a ciclo (qualche colpo, un passo
indietro a guardare, il sudore). Le attività hanno un ciclo di 8-15 secondi con
varianti casuali, come le scenette.

**Com'è fatto nel codice**

- `src/lib/albero/mestieri.ts`: il catalogo delle sette strade, livelli,
  cantieri, attività, fasce orarie e le regole (livello, attività ammesse,
  prossimo cantiere, carriera di prova).
- `vivo/mestiere.ts`: le scene dell'imprenditore (posto, postura, ciclo e, per
  i cantieri, il lavoro vero), lo stato da passare all'albero (`StatoMestiere`).
- `vivo/gesti.ts`: i mattoncini (camminare fino a, sedersi, alzarsi, prendere un
  attrezzo, colpi ripetuti, asciugarsi la fronte, mani sui fianchi…).
- `vivo/arredi.tsx`: i disegni (bancarella, scrivania con lampada, telefono e
  pila di carte, sedia-ceppo, insegna, cassaforte, lavagna, lo scoiattolo) con i
  loro stadi di costruzione, e i 14 attrezzi che compaiono in mano.
- `<Albero mestiere={…} />`: prop facoltativa. `{ strada, arredi, adesso }`, dove
  `adesso` è `{ attivita: "imprenditore.telefono" }` oppure
  `{ cantiere: "scrivania", passo: 1 }`. Senza, l'albero fa quello che dice la posa.
- Gli arredi stanno ai lati dell'albero (`POSTI` in `arredi.tsx`): nel paesaggio
  delle pagine escono dal riquadro dell'albero, che lì è libero di farlo.

**Prova e limiti**

- Provato nel browser con tutti i giorni e le ore, a movimento pieno e ridotto:
  nessun errore, nessun valore non valido.
- Gli arredi crescono con l'albero (stanno nel suo sistema di coordinate): un
  albero piccolo ha una scrivania piccola.
- Le altre sei strade hanno il catalogo ma non l'animazione: senza scena
  animata l'albero usa la posa viva.
