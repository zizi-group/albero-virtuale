# Giardino 3D (motore)

Il giardino di Linfa in 3D: una radura con fino a 7 alberi-personaggio, meteo,
ora del giorno e stagioni. Moduli ES in JavaScript con JSDoc; dipendenza
`three` 0.187.0 (import da `three` e `three/addons/loaders/GLTFLoader.js`).
Modelli e licenze del bosco in `public/giardino3d/` (Kenney Nature Kit, CC0).

## API

```js
import { creaGiardino, MODELLI, modelloDalSeme } from "@/lib/giardino3d";

const g = creaGiardino(canvas, {
  alberi: [{ id, seme, modello?, strada?, nome, giorni, principale }], // fino a 7
  meteo: { cielo: "sole", temperatura: 18 },  // sole, nuvole, pioggia, temporale, neve, nebbia
  ora: "giorno",                               // alba, giorno, tramonto, notte
  stagione: "estate",
  azione: "leggere",                           // una delle 23 di src/lib/albero/azioni.ts
  umore: "curioso",                            // 9 umori
  movimentoRidotto: false,
  margini: { sopra: 0.3, sotto: 0.22 },     // facoltativo: riquadri della pagina sopra e sotto
});
g.imposta({ ora: "notte" });          // qualsiasi parte, con transizioni morbide
                                      // anche g.imposta({ margini }) se cambiano i riquadri
g.reagisci("lettera");                // saluta, lettera, festa, carezza
const togli = g.su("tocca-albero", ({ id }) => …); // pronto, tocca-albero, tocca-cassetta, tocca-taccuino, trascina-albero
g.letteraLetta();                     // la bandierina della cassetta torna giù
g.distruggi();                        // libera GPU, eventi, timer
```

Solo nel browser (usa `document` e il canvas): in React va dentro `useEffect`.

### Modo «panoramica» (la tua foresta)

```js
import { creaPanoramica } from "@/lib/giardino3d/panoramica";

const p = creaPanoramica(canvas, {
  stanze: [{ id, numero, nome, alberi: [{ id, nome, seme, strada, giorni, umore }], esempio? }], // fino a 10, 4 alberi
  bloccate: [{ numero, regola: "Pianta altri 4 alberi" }],
  ora: "giorno", stagione: "estate", cielo: "sole", movimentoRidotto: false,
  margini: { sopra, sotto, sinistra, destra },   // frazioni coperte dai riquadri della pagina
});
p.su("tocca-stanza", ({ stanza, albero }) => p.entra(stanza, albero)); // la camera scende
p.su("tocca-bloccata", ({ numero, regola }) => …);
p.su("entrata", ({ stanza, albero }) => …);   // fine della discesa
p.margini({ destra: 0.3 });  p.distruggi();
```

File a parte (`panoramica.js`): riusa `creaAlbero`, il bosco morbido e le
texture senza toccare `index.js`. Telecamera alta (54°) che inquadra tutte le
radure nella fascia libera; gli alberi respirano e ondeggiano col vento (niente
routine); ombre calcolate una volta sola.
Il canvas si dimensiona con il CSS; il motore lo segue con un ResizeObserver.

## File

| File | Che cosa fa |
|---|---|
| `index.js` | `creaGiardino`, camera, puntatore (clic, trascinamento, sguardo), ciclo, qualità adattiva |
| `ambiente.js` | Radura, bosco Kenney in istanze, luci dell'ora, meteo, stagioni, cassetta e taccuino |
| `albero.js` | L'albero-personaggio: tronco, chioma di foglie in istanze, braccia, gambe, accessori della strada |
| `viso.js` | Viso «cucciolo»: umori, espressioni brevi, ciglia, sguardo, bocca che parla |
| `comportamento.js` | Posa a strati, routine, sonno, meteo, reazioni, trascinamento |
| `azioni.js` | Le 23 azioni del giorno |
| `oggetti.js` | Oggetti 3D delle azioni e delle routine |
| `modelli.js` | 16 specie e 30 modelli; `modelloDalSeme` |
| `texture.js` | Foglie, cortecce, guance, stoffe e sprite dipinti su canvas |

## Prestazioni

Ombre del bosco precalcolate (si rifanno solo quando cambia la luce); alberi e
foglie in istanze; pixel ratio al massimo 2, che scende fino a 1 se il computer
fatica; pausa con la scheda nascosta. Misure (computer di sviluppo):

| Scena | 2560×1600 | 1280×800 |
|---|---|---|
| 1 albero | ≈ 6,3–6,6 ms | non misurato |
| 7 alberi | ≈ 8,2–8,4 ms | ≈ 4,4 ms |

Panoramica (`/foresta`, misurata con `_prove.misura()`): vedi la tabella in
`docs/stanze-e-vita.md`, sezione 13.

Pagine di prova (fuori da Next): `prototipi/foresta-3d/giardino.html` (comandi
per tutto) e `prototipi/foresta-3d/modelli30.html` (foglio dei 30 modelli).
