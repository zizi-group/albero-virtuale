# Licenze del prototipo «foresta 3D»

## Modelli: Kenney — Nature Kit 2.1

- Pagina ufficiale: https://kenney.nl/assets/nature-kit (licenza indicata sulla
  pagina: «Creative Commons CC0», verificata l'11/11/2026).
- Licenza: Creative Commons Zero (CC0 1.0, pubblico dominio),
  https://creativecommons.org/publicdomain/zero/1.0/
- Uso libero anche commerciale; citare Kenney non è obbligatorio.
- Il file `modelli/kenney-nature-kit/License.txt` è quello originale del pacchetto.
- Scaricato dalla pagina ufficiale (pulsante di download, senza donazione).
  Nel prototipo ci sono solo i 22 modelli `.glb` usati (cartella
  `modelli/kenney-nature-kit/`), non l'intero pacchetto.

## Libreria: three.js 0.187.0

- https://threejs.org, pacchetto npm `three`; licenza MIT
  (`vendor/three/LICENSE`).
- Copiati solo `build/three.module.js`, `build/three.core.js`,
  `GLTFLoader` e le due utilità che importa.

## Fatto in casa

Il personaggio Linfa (`linfa.js`), il terreno dipinto, il pulviscolo, i raggi di
luce e le ombre finte sono costruiti in codice per questo prototipo, a partire
dal disegno 2D del progetto (`src/components/albero/vivo/figura.tsx`).
