# Linfa — prototipo di stile 3D (foresta)

Bozza piccola per far vedere lo stile grafico 3D: una radura vista dall'alto
con Linfa al centro. **Non è il prodotto** e non tocca il sito: tutto vive in
questa cartella, senza build e senza dipendenze da installare.

![La radura](screenshot/1-radura.jpg)

| Linfa da vicino | Linfa saluta |
|---|---|
| ![](screenshot/2-linfa-da-vicino.jpg) | ![](screenshot/3-linfa-saluta.jpg) |

## Come aprirla

Serve un piccolo server statico (i moduli JS non partono da `file://`).
Dalla radice del repository:

```bash
npx serve prototipi/foresta-3d -l 4317
```

Poi http://localhost:4317 (porta diversa dalla 3000 del sito).

- Clic su Linfa: saluta (braccio-ramo in avanti, saltello, occhi sorridenti).
- Il mouse sposta appena la camera.
- `?vicino`: camera vicina a Linfa. `?foto`: tiene l'ultimo fotogramma nel
  canvas, solo per fare catture dello schermo.
- In alto a destra: fotogrammi al secondo e chiamate di disegno.

## Che cosa c'è

| File | Che cosa fa |
|---|---|
| `index.html` | Pagina, import map di three.js, vignettatura |
| `scena.js` | Terreno dipinto, luci, nebbia, disposizione dei modelli in istanze, pulviscolo, raggi di luce, clic |
| `linfa.js` | Il personaggio in 3D, costruito in codice con le proporzioni del disegno 2D, e la sua animazione |
| `modelli/kenney-nature-kit/` | I 22 modelli `.glb` usati, con la licenza originale |
| `vendor/three/` | three.js 0.187.0 (MIT), solo i file che servono |
| `LICENZE.md` | Fonti e licenze |

## Modelli usati (Kenney Nature Kit, CC0)

Alberi `tree_detailed_dark`, `tree_oak_dark`, `tree_fat_darkh`,
`tree_pineTallA_detailed`, `tree_pineRoundC`; ceppi `stump_oldTall`,
`stump_roundDetailed`; tronco `log_large`; rocce `rock_largeA`, `rock_largeC`,
`rock_tallB`, `rock_smallC`, `rock_smallFlatA`; cespugli `plant_bushDetailed`,
`plant_bushLarge`; felci e foglie `grass_leafsLarge`, `plant_flatTall`; erba
`grass_large`; funghi `mushroom_redGroup`, `mushroom_tanTall`, `mushroom_red`;
fiori `flower_yellowA`. Licenza CC0: vedi `LICENZE.md`.

I colori originali di Kenney (verde acqua, toni pastello) sono sostituiti in
codice con una tavolozza profonda e satura, con variazione per ogni copia.

## Come è fatta (velocità)

- **Ombre precalcolate**: la mappa delle ombre del sole (4096²) si calcola una
  sola volta (`shadowMap.autoUpdate = false`). Linfa si muove, quindi non
  proietta ombre vere: ha una macchia morbida stesa lontano dal sole.
- **Istanze**: ogni modello ripetuto è una sola `InstancedMesh` per parte
  (≈ 900 oggetti in 129 chiamate di disegno, ≈ 218 000 triangoli).
- **Shader leggeri**: occlusione finta (più scuro alla base) e vento sulle
  foglie dentro i materiali, senza post-processing.
- **Misura** (pannello del browser di Claude, 1024×768, densità 2):
  ≈ 3–4,6 ms per fotogramma, cioè ampio margine sui 60 fps.

## Limiti

- I modelli Kenney sono low-poly a colori piatti, senza texture dipinte:
  servono a provare luce, inquadratura e composizione, non la qualità finale.
- Il personaggio è fatto in codice (forme sfaccettate): una bozza delle
  proporzioni, non un modello d'artista.
