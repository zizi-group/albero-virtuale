# L'albero animato di Linfa

Come si muove l'albero, scenetta per scenetta, e come reagisce alle persone.
Serve a chi lavora sul codice e, domani, come brief per un animatore che volesse
rifare il personaggio in Rive: ogni movimento qui sotto è descritto con i suoi
tempi e le sue varianti.

Il codice è in `src/components/albero/vivo/`. `Albero.tsx`, `Scena.tsx` e
`ScenaCiclica.tsx` lo usano senza cambiare le loro props (c'è solo `interattivo`
in più, attivo di default).

## Come funziona

- **Pupazzo snodato in SVG.** Tronco, chioma, braccia con spalla, gomito e mano,
  gambe-radici con anca, ginocchio e piede, occhi con pupille, palpebre e
  sopracciglia, bocca che cambia forma, oggetti agganciati alle mani.
- **Canali.** Ogni articolazione e ogni espressione è un numero (`canali.ts`):
  per esempio `dxSpalla`, `dxGomito`, `palpebra`, `boccaGiu`, `passo`, `schiuma`.
  Le scenette muovono questi numeri nel tempo con delle chiavi (`copione.ts`).
- **Strati, dal basso:**
  1. la **posa del catalogo** (`azioni.ts`), tradotta in canali;
  2. la **scenetta** dell'azione: 8-15 secondi con inizio e fine, poi ricomincia
     con varianti casuali (`scenette.ts`);
  3. la **reazione** a chi la guarda (saluto, solletico, volo…): ferma la
     scenetta, poi sfuma e la scenetta riprende da dove era (`interazioni.ts`);
  4. lo **strato di vita**, sempre attivo: respiro, ciglia, sguardo, molle della
     chioma e della sciarpa, vento (`motore.ts`, `fotogramma.ts`).
- **Server e browser.** Il server disegna il primo fotogramma (la posa ferma);
  nel browser parte il motore dallo stesso identico fotogramma, quindi niente
  scatti. Un solo orologio (`requestAnimationFrame`) per tutti gli alberi della
  pagina; gli alberi fuori dallo schermo si fermano. A ogni fotogramma si
  scrivono solo gli attributi cambiati, React non ridisegna.
- **Nessuna libreria esterna**: niente GSAP né `motion`, il motore è di poche
  centinaia di righe.

## Il pupazzo

Coordinate del personaggio: 240 × 280, terreno a y = 262.

| Parte | Perno | Note |
|---|---|---|
| Corpo intero | piedi (120, 262) | spostamento, rotazione, schiacciamento (squash & stretch); quando lo sollevi ruota attorno al punto dove lo tieni |
| Busto | — | sale e scende col passo; scende di 22 quando è seduto |
| Chioma | base (120, 132) | molla: segue il corpo in ritardo, ondeggia col vento, si schiaccia quando atterra |
| Braccio | spalla sx (96, 178), dx (144, 178) | omero 24, avambraccio 23; braccio «a tubo» che curva al gomito; può allungarsi come un elastico (`Allunga`) |
| Mano | fine dell'avambraccio | due foglie; gli oggetti si agganciano qui e restano dritti |
| Rametto con foglia | gomito | la foglia trema un po' |
| Gamba-radice | anca sx (108, 214), dx (132, 214) | coscia 18,5, stinco 18,5, piede ellittico; da sollevato spuntano le radichette |
| Occhi | (110, 164) e (130, 164) | pupille mobili, palpebra che scende (anche inclinata, per arrabbiato o furbo), occhi «felici» ad arco, occhiolino, occhi sbarrati |
| Sopracciglia | sopra gli occhi | su e giù, inclinate per la rabbia |
| Bocca | (120, 181) | larghezza, curva sopra e sotto, storta: va dal sorriso alla «o», alla risata con lingua, al broncio |

Per muovere le mani verso un punto preciso c'è la cinematica inversa
(`verso(lato, x, y)` in `canali.ts`): il gomito resta sempre verso l'esterno.

## Lo strato di vita (sempre)

- **Respiro**: il corpo si allunga dell'1% ogni 3,8 s.
- **Ciglia**: un battito ogni 1,8-6,3 s, a volte doppio (0,15 s a battito).
- **Si guarda intorno**: ogni 2-6 s le pupille vanno in un punto a caso per
  0,6-1,8 s e tornano.
- **Chioma**: molla con ritardo sul corpo; vento a raffiche (forte col
  temporale, medio con la pioggia, leggero col sole).
- **Sciarpa**: la coda svolazza col passo, col vento e quando lo sposti.
- **Fiato**: col freddo, uno sbuffo bianco ogni 3 s circa.
- **Oggetti vivi**: la tazza fuma, l'annaffiatoio gocciola.

## Le sei scenette

Tutte partono dalla posa del catalogo e ci tornano. Tra parentesi i tempi.

### Sole (`prendere-sole`, con gli occhiali da sole)

1. Apre gli occhi e abbassa le braccia (0,6 s).
2. *Nell'80% dei giri:* porta la mano destra agli occhiali, li alza sulla
   fronte, la luce lo acceca (strizza gli occhi, sopracciglia giù, oscilla),
   a volte dice «Troppa luce! Occhiali, presto.»; li rimette giù con uno
   scatto, sorriso storto da duro, un luccichio sulla lente (≈ 2,5 s).
3. **Stiracchiata**: braccia in alto, sulle punte, sbadiglio a «o», chioma che
   si allunga; poi si lascia andare con un rimbalzo (≈ 2,3 s).
4. **Si gode il sole**: braccia aperte e faccia al cielo (60%) oppure mani sui
   fianchi; occhi chiusi, sospiro lungo, due luccichii (3-5 s).
5. **Si fa aria** con la mano vicino alla faccia, 3-5 sventolate, bocca a «o»,
   una goccia di sudore; a volte «Uff, che caldo!» (≈ 1,5 s).
6. Torna alla posa (0,8 s). Totale 11-15 s.

### Pioggia: la doccia (`doccia`)

1. Si strofina la chioma insaponata, qualche bolla (1,2-2 s).
2. **Risciacquo**: braccia aperte, faccia alla pioggia, occhi chiusi; la
   schiuma sparisce e le bolle volano via (2 s).
3. **Scrollata come un cane**: si accuccia, poi corpo, faccia e chioma
   oscillano sempre meno per 1,15 s mentre le gocce schizzano tutto intorno;
   finisce con un rimbalzo.
4. Contento, si guarda intorno (50%).
5. **Si insapona**: braccia alla chioma, la schiuma cresce bolla dopo bolla
   (3 s); metà delle volte canta (note e «La la laaa…»).
6. Torna alla posa. Totale 10-13 s.

### Freddo (`passeggiata` con cappello e sciarpa)

1. Si gira e parte a passo svelto verso un lato (fino a 130 unità, ≈ 2 s),
   sbuffi di fiato a ogni passo.
2. Si ferma di fronte, **brividi**: tremolio e denti che battono (0,7 s).
3. *80%:* **si stringe la sciarpa** con due mani, tirandola (la sciarpa si
   stringe, il corpo si schiaccia un poco), poi «mmh» soddisfatto.
4. **Soffia nelle mani** a coppa davanti alla bocca, 2-3 volte con nuvolette,
   poi se le strofina.
5. Torna al suo posto camminando, si rimette di fronte. Totale 10-14 s.

Senza freddo (passeggiata normale): stessa andata e ritorno, ma in mezzo si
guarda intorno e sospira o fa un saltello.

### Notte (`dormire`, berretto da notte)

1. Uno o due **respiri lenti** (3 s l'uno): il corpo si gonfia e sgonfia, la bocca
   si apre all'espiro, esce una «z».
2. **Russa** 1-2 volte: grande inspiro (corpo e chioma si gonfiano), poi una Z
   grande, la chioma vibra, la bocca trema.
3. *20%:* parla nel sonno («…ancora una ghianda… zzz…»).
4. **Si gira**: inclina il corpo da un lato, faccia di tre quarti, una mano
   sulla pancia, bocca che si storce; un respiro così.
5. *55%:* **il berretto scivola** di lato; si mezzo sveglia (palpebre a metà),
   allunga un braccio come un elastico fino in cima alla chioma, rimette dritto
   il berretto, una pacca, e si riaddormenta.
6. Torna dritto e ricomincia. Totale 10-16 s.

### Leggere (`leggere`, libro)

1. **Legge** 2-3 righe: le pupille scorrono da sinistra a destra e tornano a
   capo, la testa segue appena.
2. **Gira pagina**: la mano destra alza l'angolo e lo porta a sinistra, la
   pagina si piega e si gira (0,5 s).
3. Altre 1-2 righe.
4. *60%:* **ride**: occhi ad arco, bocca aperta, guance rosse, scosse di
   risata, il libro balla, segni di risata nell'aria, a volte «Ah ah! Questa è
   bellissima.» *Altrimenti* sorpresa: occhi sbarrati e bocca a «o».
5. *30%:* gira un'altra pagina, altrimenti legge un'altra riga.
6. **Chiude il libro** (piccolo tonfo, sbuffo di polvere), **alza lo sguardo**
   pensieroso (a volte con la stellina del sognatore, a volte guarda te e
   sorride), poi **riapre il libro**. Totale 10-14 s.

### Correre (`corsa`)

1. Scatta verso un lato: corsa vera (gambe e braccia, busto in avanti),
   polvere dietro i piedi, fino quasi al bordo della scena.
2. **Frenata**: si inclina all'indietro, nuvola di polvere, schiacciamento.
3. Si gira e corre fino all'altro lato, nuova frenata.
4. **Fiatone**: mani sulle ginocchia, bocca aperta, respiro veloce (2 s),
   gocce di sudore; a volte «Uff… fiatone…».
5. **Si asciuga la fronte** con il dorso della mano e scrolla la goccia.
6. Torna al centro trotterellando e riparte a correre sul posto. Totale 9-13 s.

Nei riquadri piccoli (catalogo) lo spazio è poco e la corsa è più corta; nel
paesaggio delle pagine l'albero può uscire dal suo riquadro e attraversa la
scena.

## Le altre 17 azioni

Usano già il pupazzo con la loro posa e i loro gesti (saluta, strofina,
pennella, solleva, scrive, conta, balla, galleggia…). In più, a ogni giro di
8-12 s, fanno 2-3 piccoli gesti a sorpresa tra questi, scelti tra quelli
possibili con la posa:

- si guarda intorno (testa e occhi a destra e a sinistra);
- sospira;
- fa l'occhiolino a chi guarda;
- sposta il peso da un piede all'altro (in piedi e fermo);
- batte un piede (con un po' di polvere);
- saltello di gioia (se è allegro);
- si gratta la chioma con un braccio libero (che non tiene niente);
- canticchia, con le note (se non sta già parlando o dormendo).

Gli effetti della posa diventano particelle: «z» che salgono, note, cuori,
stelline, gocce di sudore, bolle; il fumetto del pensiero ondeggia.

**Nei giri successivi** queste diventano scenette vere, con la stessa struttura.

## Transizioni

Quando cambia l'azione o il meteo senza ricaricare la pagina: saltello con
schiacciamento all'atterraggio, la posa nuova arriva con slancio (0,6 s),
cadono tre foglie; accessori e oggetti nuovi compaiono crescendo da zero con
un piccolo rimbalzo. Nella `Scena` il cielo sfuma da un colore all'altro e
pioggia, neve, sole e luna compaiono in dissolvenza.

Nelle pagine con il paesaggio (`Ambiente`), al cambio di azione il contenitore
rimonta l'albero e fa il suo saltello CSS: la scenetta riparte da capo.

## Interazioni

| Gesto | Cosa fa l'albero |
|---|---|
| **Passi vicino col mouse** | Gli occhi ti seguono (entro ~300 unità), la faccia si gira appena verso di te. La prima volta che arrivi vicino **si accorge di te**: occhi sbarrati, sopracciglia su, saltello, sorriso (al massimo ogni 7 s). |
| **Clic o tocco** (o **Invio**/Spazio) | Smette quello che fa, si gira verso di te, saltello, saluta agitando l'avambraccio (la mano libera; se tiene qualcosa usa l'altra) e dice una frase nel fumetto per 3,4 s. Poi riprende la scenetta da dove era. |
| **Clic sulla chioma** | Come sopra, più la chioma che frusta e 5 foglie che cadono ondeggiando; a volte cade una ghianda d'oro. |
| **Clic su un oggetto** (libro, tazza, ombrello, scoiattolo, cartello…) | Saluta, scuote l'oggetto e ne parla («Tisana di corteccia. Vuoi un sorso?»). |
| **3-5 clic di fila** | **Solletico**: occhi ad arco, risata, si abbraccia, si contorce, guance rosse, segni di risata. |
| **6 clic di fila** | **Finta rabbia**: braccia conserte, sopracciglia giù, broncio, guance rosse, pesta un piede, sbuffi di vapore dalla chioma, «Ehi! Sono un albero, mica un campanello!»; poi fa pace con un occhiolino («…va bene, scherzavo.»). |
| **Trascinamento** (mouse: premi e muovi; telefono: pressione lunga 0,4 s e poi trascina) | Lo sollevi: faccia sorpresa, braccia che si agitano, le radici penzolano come un pendolo e ogni tanto scalcia; il corpo oscilla attorno al punto dove lo tieni, la chioma e la sciarpa seguono in ritardo. Se lo scuoti forte perde foglie. Dopo 2 s si lamenta («Mettimi giù! Soffro di vertigini!»). |
| **Lo lasci** | Cade (con la velocità che gli hai dato), atterra schiacciandosi, polvere ai lati; gira la testa a destra e a sinistra, si spolvera con le mani; nel 55% dei casi protesta (mani sui fianchi, «Ho le radici tutte in disordine.»). Poi **resta lì** (la posizione si salva nel browser) **oppure torna a piedi** al suo posto. |
| **Ricarichi la pagina** | Se l'avevi lasciato altrove, parte dal suo posto e ci torna camminando. |

Dettagli:

- La posizione si salva solo in `localStorage`, mai nel database, e solo per
  gli alberi nei paesaggi (dove c'è spazio per muoversi) e nella `Scena`.
- Sul telefono una strisciata normale fa scorrere la pagina: il trascinamento
  parte solo dopo la pressione lunga senza muovere il dito.
- Gli alberi che sono solo un'illustrazione si animano ma non reagiscono e
  non prendono il fuoco: tutti quelli con `titolo=""` (bustine dei prezzi,
  tessera del fan club) e quelli con `interattivo={false}` (biglietto regalo
  della pagina iniziale, ritratto della strada nel giardino, strade e stadi del
  catalogo). L'anello del fuoco esiste solo sugli alberi interattivi.

### Accessibilità

- L'albero è un pulsante raggiungibile con Tab, con un nome leggibile
  («Ottavio legge un libro. Premi Invio per salutarlo; trascinalo per
  spostarlo.»). Invio o Spazio: saluto. Quando ha il fuoco compare un anello
  tratteggiato attorno.
- Le frasi del fumetto vengono lette anche dai lettori di schermo (regione
  `role="status"`).
- **Movimento ridotto** (impostazione del sistema): restano respiro, ciglia,
  sguardo, espressioni e gesti lievi delle braccia. Niente saltelli, scosse,
  scrollate, corse da un lato all'altro (corre piano sul posto), niente calci
  quando è sollevato; quando lo lasci si posa piano. Meno particelle e più
  lente; vento quasi fermo.

## Le frasi

Una sessantina, già scritte in `frasi.ts`, scelte senza ripetere le ultime
quattro: generali, per strada (dall'accessorio: occhiali tondi = filosofo,
cravatta = imprenditore…), per umore o abitudine col meteo (dormiente,
bagnato, infreddolito, al sole, lettore, sportivo, allegro, furbo,
pensieroso), per situazione (solletico, rabbia, pace, atterraggio, volo,
chioma) e per oggetto. Tono di `personaggio.ts`: ironico e gentile, niente
persone o marchi reali.

## Per un animatore (Rive)

- **Ossa**: corpo (perno ai piedi), busto, chioma, 2 × (spalla, gomito, mano),
  2 × (anca, ginocchio, piede), testa (spostamento orizzontale per il tre
  quarti), palpebre, pupille, sopracciglia; la bocca come forma con 5 punti
  di controllo (angoli, curva sopra, curva sotto).
- **State machine**: uno stato per scenetta (le 6 sopra più una «posa viva»
  per le altre azioni), con sotto-animazioni scelte a caso per le varianti;
  un livello sopra per le reazioni (saluto, solletico, rabbia, accorto,
  sollevato, atterraggio) che fermano lo stato sotto e poi tornano.
- **Input**: `azione` (id del catalogo), `meteo` (sole, pioggia, freddo,
  notte), `strada` (accessorio), `sguardoX/Y` (puntatore), `sollevato` (bool),
  `velocitaX` (per il pendolo), `clic` (trigger), `movimentoRidotto` (bool).
- **Secondario**: chioma e sciarpa con molle; le particelle (gocce, foglie,
  polvere, z, note, cuori, stelline, bolle, sbuffi) possono restare nel
  codice.

## File

| File | Cosa contiene |
|---|---|
| `vivo/canali.ts` | Canali, ossa, posa → canali, cinematica inversa, dove si tengono gli oggetti |
| `vivo/copione.ts` | Il copione: chiavi, andamenti (dolce, slancio, molla…), eventi |
| `vivo/scenette.ts` | Le sei scenette, la posa viva con i gesti a sorpresa, il riconoscimento dell'azione dalla posa |
| `vivo/interazioni.ts` | Saluto, solletico, finta rabbia, accorto, atterraggio, ritorno al posto, cambio di posa |
| `vivo/frasi.ts` | Le frasi del fumetto e la scelta per umore e strada |
| `vivo/fotogramma.ts` | Da canali ad attributi SVG (la stessa funzione per il server e per il browser) |
| `vivo/motore.ts` | Orologio unico, strati, molle, particelle, fumetto, trascinamento, eventi del puntatore |
| `vivo/disegni.tsx` | Colori, chioma, accessori, oggetti, forme delle particelle |
| `vivo/AlberoVivo.tsx` | Il componente: disegna il pupazzo e avvia il motore |
| `vivo/vivo.css` | Cursore, anello del fuoco, dissolvenze della Scena (classi `lv-`) |

Le keyframe `l-*` di `globals.css` non servono più all'albero; la `Scena` usa
ancora quelle del cielo (nuvole, pioggia, neve, stelle, lampo).
