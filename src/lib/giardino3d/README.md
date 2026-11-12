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
| `club.js` | La foresta del club: `creaForestaClub`, centinaia di alberi leggeri in istanze, due livelli di dettaglio, nomi vicini, bandierina |
| `clubPosti.js` | Posti stabili della foresta del club e modello dal numero della vista (senza three) |

## Prestazioni

Ombre del bosco precalcolate (si rifanno solo quando cambia la luce); alberi e
foglie in istanze; pixel ratio al massimo 2, che scende fino a 1 se il computer
fatica; pausa con la scheda nascosta. Misure (computer di sviluppo):

| Scena | 2560×1600 | 1280×800 |
|---|---|---|
| 1 albero | ≈ 6,3–6,6 ms | non misurato |
| 7 alberi | ≈ 8,2–8,4 ms | ≈ 4,4 ms |

### Foresta del club (`club.js`)

Una geometria per forma di chioma (8, dal catalogo delle specie) in due
dettagli: vicino (chiome a bolle, entro ~34 m, al massimo 260 alberi) e
lontano (icosaedri). Tronco e chioma nella stessa geometria; il colore della
chioma per istanza, quello del tronco con un attributo per istanza; il vento è
nel vertex shader. Una mesh sola per tutte le ombre a terra. In tutto 23
disegni per fotogramma, con 300 o 1000 alberi. I nomi sono `div` sopra la tela
(al massimo 14 vicini, più il tuo), senza sovrapporsi.

Misure del 12/11/2026 (Chrome headless sul computer di sviluppo, pagina di
prova `prototipi/foresta-3d/club.html?misura=1`: ms di lavoro per fotogramma
compresa l'attesa della scheda grafica, mediana; fotogrammi sempre a 120 al
secondo):

| Scena | 300 alberi | 1000 alberi |
|---|---|---|
| 1280×800 | ≈ 3,6–3,9 ms | ≈ 4,3–4,6 ms |
| 2560×1600 (pixel ×2) | non misurato | ≈ 5,7–6,2 ms |
| Telefono 390×844 (pixel ×2) | non misurato | ≈ 4,4–4,5 ms |
| Telefono, processore 4 volte più lento | non misurato | ≈ 3,9–5,1 ms |

Il telefono è emulato (misure, pixel e processore rallentato), non un telefono
vero. Se dopo l'avvio i fotogrammi restano sopra i 50 ms la pagina passa alla
mappa 2D (`linfa-club-lento` in `sessionStorage`); senza WebGL parte già 2D.

Pagine di prova (fuori da Next): `prototipi/foresta-3d/giardino.html` (comandi
per tutto) e `prototipi/foresta-3d/modelli30.html` (foglio dei 30 modelli).
