# Il catalogo dei contenuti di Linfa 0.2

Fase 8 di `docs/stanze-e-vita.md`, la parte che si può fare subito: tutti i
contenuti scritti per esteso, pronti da trasformare in codice quando le
strutture delle fasi 2 (attività, risorse, catene, gesti), 3 (oggetti) e 4
(imprese) saranno su `main`.

| File | Che cosa c'è |
|---|---|
| [`attivita.md`](attivita.md) | 241 attività: 214 per la giornata (70 quotidiane, 13 azioni di oggi, 84 di strada, 20 rare, 17 passi di catena, 10 giochi), 17 di gruppo, 10 intermezzi; più tracce e risorse |
| [`oggetti.md`](oggetti.md) | 214 voci (edifici, arredi, attrezzi, giochi, vestiti, trofei, album) con regola di sblocco, indizio, usi, posto e priorità di disegno (60 al lancio) |
| [`imprese.md`](imprese.md) | 16 catene, 43 cantieri, 12 imprese (7 delle strade e 5 libere) con livelli e 29 ruoli dei sostenitori |
| [`gesti.md`](gesti.md) | 74 gesti (11 di oggi, 63 nuovi) con durata, movimento, versione a movimento ridotto e i 20 da fare per primi |
| [`controllo.md`](controllo.md) | Il controllo di coerenza: che cosa verifica, errori, avvisi, conteggi |

## Come si modifica

I `.md` sono **generati**: i dati stanno in `fonte/` (una riga per voce,
campi separati da `|`, spiegati in testa a ogni file).

```bash
node docs/catalogo/genera.mjs
```

scrive i cinque file e stampa errori e avvisi; esce con codice 1 se c'è un
errore. `--controlla` fa solo il controllo. Il controllo legge anche
`azioni.ts`, `mestieri.ts`, `giornata.ts`, `collezione.ts`, `regali.ts` e
`vivo/gesti.ts`: se il codice cambia id, se ne accorge.

## Come si porta nel codice (fasi 2, 3, 4)

- `fonte/attivita.mjs` → `src/lib/albero/attivita.ts` (o dentro `giornata.ts`):
  fasce, meteo, umori, voglia, ferma/mov sono già nel formato di `INFO`;
  `richiede` diventa requisiti (oggetti, tracce, risorse), `prende`/`lascia` gli
  effetti sulle risorse, `gesti` la sequenza per il copione di `vivo/`.
- `fonte/oggetti.mjs` → `src/lib/albero/oggetti.ts`: ogni `sblocco` è una
  regola deterministica come in `collezione.ts` (il generatore ne controlla la
  grammatica: elenco in `oggetti.md`).
- `fonte/imprese.mjs` → `catene.ts` e `imprese.ts`; i 21 cantieri di
  `mestieri.ts` hanno gli stessi id.
- `fonte/gesti.mjs` → `vivo/gesti.ts`.

## Proposte da confermare

Scelte fatte per completare il catalogo, che non sono decisioni di Federico:

1. **Più voci del previsto**: 214 attività per la giornata invece di ~175
   (le 13 azioni di oggi restano, più 17 passi che servono alle catene della
   sezione 4.2 e 10 attività dei giochi, perché ogni gioco apra
   un'attività); 214 oggetti invece di ~200 (gli attrezzi comprendono gli
   oggetti in mano di oggi: libro, tazza, ombrello…).
2. **Il vento**: `Meteo` oggi non lo ha. Open-Meteo dà la velocità del
   vento; la soglia per «vento forte» è da decidere (serve ad aquilone,
   girandola, mulino, bucato).
3. **Regali**: 51 voci possono arrivare come regalo (la sezione 11 dice ~40).
4. **Imprese**: livello = 1 + cantieri finiti, come i mestieri; il contagio
   parte dal livello 2; ogni impresa di strada ha un cantiere in più dopo il
   terzo livello (un edificio). Le 5 imprese libere si aprono finendo una
   catena.
5. **Base dei pesi** dei passi di catena e dei giochi: 4, come le attività di
   strada. Le probabilità delle rare (`p`) sono da tarare con `npm run simula`.
6. Le priorità di disegno: 60 disegni al lancio (34 ci sono già, 26 da fare,
   10 edifici), come chiede la sezione 10.

## Tono

Tutto segue le regole di `src/lib/motore/personaggio.ts`: ironico e innocuo,
nessuna persona o marchio reale, niente politica, religione o contenuti
inadatti. La banda del bosco è la caricatura del boss da film (cappello,
gessato, «affari» di ghiande), senza parole o simboli della criminalità vera,
senza violenza né accenti presi in giro; quello che prende lo restituisce.
