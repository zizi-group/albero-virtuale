# Controllo di coerenza del catalogo

Risultato di `node docs/catalogo/genera.mjs`: **0 errori**, **0 avvisi**.

> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.

## Che cosa controlla

| Controllo | Esito |
|---|---|
| Ogni attività usa solo gesti della libreria (3-4; gli intermezzi 1-2), mai gli strumenti | ✅ |
| Ogni attività ha fasce, meteo, umori, posto e nuvoletta validi | ✅ |
| Ogni strada ha 12 attività, ognuna con il suo livello | ✅ |
| Le 23 azioni di `azioni.ts` e le 42 attività di `mestieri.ts` ci sono con lo stesso id, fasce, livello, meteo e arredi | ✅ |
| Le 25 voci di `collezione.ts`, i 10 regali e i 21 cantieri ci sono con lo stesso id | ✅ |
| Ogni oggetto citato da un'attività esiste; **ogni oggetto ha almeno un uso** | ✅ |
| Ogni regola di sblocco è scritta bene e cita attività, catene, cantieri e imprese che esistono | ✅ |
| Ogni risorsa consumata si raccoglie da qualche parte; ogni traccia richiesta nasce da qualche parte | ✅ |
| **Ogni catena si chiude**: passi esistenti, almeno 3, finale scritto, risorse e tracce disponibili prima di servire, nessun oggetto che arriva solo dopo, ultimo passo non saltabile | ✅ |
| Ogni cantiere lascia un oggetto che si sblocca con quel cantiere; ogni impresa ha 3 livelli, cantieri, attività e ruoli esistenti | ✅ |

## Errori

Nessuno.

## Avvisi

Nessuno.

## Conteggi

| Che cosa | Quanti |
|---|---|
| Gesti | 74 (11 di oggi, 63 nuovi) |
| Attività | 241 (214 per la giornata, 17 di gruppo, 10 intermezzi) |
| Oggetti | 214 (60 disegni al lancio, 51 anche come regalo) |
| Catene · cantieri · imprese · ruoli | 16 · 43 · 12 · 29 |
| Tracce · risorse | 35 · 10 |

## Gli oggetti meno usati

Gli oggetti con meno attività che li usano davvero (non come «oggetto qualsiasi»): i primi candidati per attività nuove.

| Oggetto | Categoria | Attività |
|---|---|---|
| `capanno-attrezzi` | edificio | 1 |
| `serra` | edificio | 1 |
| `atelier` | edificio | 1 |
| `galleria` | edificio | 1 |
| `biblioteca` | edificio | 1 |
| `mongolfiera` | edificio | 1 |
| `covo` | edificio | 1 |
| `osservatorio` | edificio | 1 |
| `torre-holding` | edificio | 1 |
| `chiosco-agenzia` | edificio | 1 |
| `palco` | edificio | 1 |
| `cucina-aperto` | edificio | 1 |
| `mulino` | edificio | 1 |
| `spogliatoio` | edificio | 1 |
| `insegna` | arredo | 1 |
| `cassaforte` | arredo | 1 |
| `scultura` | arredo | 1 |
| `sbarra` | arredo | 1 |
| `ostacoli` | arredo | 1 |
| `nascondiglio` | arredo | 1 |
| `mercato` | arredo | 1 |
| `tesoro` | arredo | 1 |
| `bacheca` | arredo | 1 |
| `cartelli` | arredo | 1 |
| `scrittoio` | arredo | 1 |

## I gesti mai usati

`siRotola`
