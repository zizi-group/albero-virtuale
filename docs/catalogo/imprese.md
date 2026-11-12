# Catene, cantieri e imprese di Linfa

**16 catene** · **43 cantieri** (21 di `mestieri.ts`, 22 nuovi) · **12 imprese** (7 delle strade, 5 libere) · **29 ruoli** dei sostenitori.

> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.

Regole (`docs/stanze-e-vita.md`, sezioni 4.2, 6 e 7):

- Una **catena** si apre col primo passo; il passo dopo vale ×5 nei giorni seguenti. Un passo può saltare (si distrae) e riprendere.
  Un passo «di gruppo» si salta se l'albero è solo nella stanza, tranne nelle catene che dicono «Serve compagnia».
- Un'**impresa** ha tre livelli: livello = 1 + cantieri finiti (massimo 3). I cantieri «dopo» il terzo livello lasciano un edificio in più.
  Le sue attività valgono ×4 per il capo e per i sostenitori.
- Le imprese delle strade si aprono quando la strada si rivela (il mestiere di oggi diventa l'impresa); dal **livello 2** il capo prova a
  coinvolgere gli altri alberi della stanza con il **contagio** (sezione 7.2: carisma del capo × influenzabilità dell'altro × affinità × sostenitori).
- Le **imprese libere** non hanno strada: si aprono finendo una catena, il capo è chi l'ha finita, e tutti possono entrarci (affinità neutra).
- **La banda del bosco** resta la caricatura del boss da film: cappello, gessato, «affari» di ghiande; niente parole o simboli della criminalità vera, niente violenza, niente accenti presi in giro.

## Le catene

| Catena | Di chi | Passi | Come finisce | Sblocca |
|---|---|---|---|---|
| `fuoco` Il fuoco | tutti | `raccogli-rami` → `accendi-fuoco` → `castagne` → `invita-fuoco` → `storie-fuoco` → `dorme-braci` | Si addormenta vicino alle braci; restano il cerchio di sassi e le braci. | `sedie-ceppo` |
| `orto` L'orto | tutti | `zappa-aiuola` → `semina` → `annaffia-orto` → `raccoglie-ortaggi` → `cucina-zuppa` | La zuppa dell'orto; l'orto resta e ricresce. Apre l'impresa «L'orto comunitario». | `cappello-paglia` `impresa orto-comunitario` |
| `marmellata` La marmellata | tutti | `raccogli-bacche` → `schiaccia-bacche` → `cuoce-marmellata` → `riempie-vasetti` → `regala-vasetti` | I vasetti regalati allo scoiattolo. Richiede il fuoco. | `dispensa` |
| `altalena` L'altalena | tutti | `intreccia-fili` → `intreccia-corda` → `monta-altalena` → `altalena` | La prima spinta sull'altalena appena appesa. | — |
| `forno` Il pane | tutti | `cerca-sassi` → `muretto-sassi` → `costruisce-forno` → `impasta-pane` | Il primo pane sfornato. Apre l'impresa «La cucina del bosco». | `cappello-cuoco` `impresa cucina-bosco` |
| `luce` La luce della sera | tutti | `gratta-resina` → `fa-candele` → `lanterne` | Le lanterne accese con le candele fatte da lui. Tre volte: apre il cantiere del faro. | `cantiere faro` |
| `calcio` La squadra | tutti | `gioca-palla` → `gruppo.partita` (gruppo) → `gruppo.foto` (gruppo) | La foto della squadra. Serve compagnia. Apre l'impresa «La squadra di calcio». | `impresa squadra-calcio` |
| `musica` La musica | tutti | `saluta-uccelli` → `suona-flauto` → `suona-tamburo` | Il primo concerto con gli uccelli del ramo. Apre l'impresa «Il coro». | `impresa coro` |
| `teatro` Il teatro | tutti | `storie-fuoco` → `prova-teatro` → `spettacolo-teatro` | Il primo spettacolo. Apre l'impresa «La compagnia del teatro». | `impresa compagnia-teatro` |
| `quadro` Il quadro | artista | `raccogli-bacche` → `artista.colori-bacche` → `artista.dipinge` → `artista.appende` → `artista.mostra` | Inaugura la mostra (serve la galleria). | — |
| `banda` La banda del bosco | furfante | `furfante.nasconde` → `furfante.piani` → `furfante.galleria` → `furfante.riunione` → `gruppo.colpo` (gruppo) → `furfante.restituisce` | Il colpo del secolo (la mela più rossa) e la restituzione il giorno dopo, perché si sente in colpa. | — |
| `torneo` Il torneo | sportivo | `sportivo.trazioni` → `sportivo.braccio-ferro` → `sportivo.corsa-stanza` → `gruppo.torneo` (gruppo) → `sportivo.premiazione` | La premiazione sul podio. | — |
| `scuola` La scuola | filosofo | `filosofo.aforismi` → `filosofo.lezione` → `filosofo.scuola` | Fonda la scuola sotto la chioma; se nella stanza ci sono altri alberi, il giorno dopo la prima lezione di gruppo. | — |
| `negozio` Il negozio | imprenditore | `imprenditore.sondaggio` → `imprenditore.riunione` → `imprenditore.negozio` | Il nastro tagliato e la festa. | — |
| `viaggio` Il grande viaggio (immaginario) | viaggiatore | `viaggiatore.zaino` → `viaggiatore.mappa` → `viaggiatore.binocolo` → `viaggiatore.tenda` → `viaggiatore.racconti` | Racconta un viaggio mai fatto, con tutti i particolari. | — |
| `serata` La serata di poesia | poeta | `poeta.sillabe` → `poeta.rima` → `poeta.versi` → `poeta.serata` | La serata di poesia per tutta la stanza. | — |

## Le imprese

### Ghiande & Co. (`ghiande-co`)

- **Strada**: imprenditore · **si apre**: `strada:imprenditore`
- **Livelli**: 1. La bancarella · 2. L'ufficio sotto la chioma · 3. La holding del bosco
- **Attività dell'impresa** (×4): `imprenditore.pubblicita` `imprenditore.contratta` `imprenditore.incasso` `imprenditore.caffe` `imprenditore.telefono` `imprenditore.contratti` `imprenditore.riunione` `imprenditore.chiude` `imprenditore.deposito` `imprenditore.notte` `imprenditore.sondaggio` `imprenditore.negozio` `vendere-ombra` `contare-ghiande` `telefonata` `gruppo.bancarella`
- **Sblocca**: `lavagna (liv. 2)` `lampada (liv. 2)` `forbici (liv. 2)`

| Ruolo | Che cosa fa |
|---|---|
| Socio (`socio`) | `imprenditore.riunione` `gruppo.bancarella` `imprenditore.contratti` |
| Contabile (`contabile`) | `imprenditore.incasso` `contare-ghiande` |
| Fattorino (`fattorino`) | `imprenditore.pubblicita` `cerca-ghiande` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `scrivania` La scrivania | `scrivania` | `livello:1` | raccoglie i rami per la scrivania → sega e inchioda (e si martella un dito) → monta il piano e mette una ghianda sotto la gamba corta → inaugura la scrivania col nastro rosso |
| `insegna` L'insegna | `insegna` | `livello:2` | disegna le lettere dell'insegna → dipinge l'insegna → appende l'insegna, storta, e la raddrizza |
| `cassaforte` La cassaforte di ghiande | `cassaforte` | `livello:3` | scava la buca della cassaforte → monta lo sportello della cassaforte → sceglie la combinazione e la dimentica subito |
| `torre-holding` La torre della holding | `torre-holding` | `cantiere:cassaforte` | disegna il progetto su una foglia gigante → impila i ceppi fino al terzo piano → ci mette in cima una bandierina con una ghianda |

### La scuola sotto la chioma (`scuola-chioma`)

- **Strada**: filosofo · **si apre**: `strada:filosofo`
- **Livelli**: 1. Il pensatore del prato · 2. La scuola sotto la chioma · 3. L'osservatorio
- **Attività dell'impresa** (×4): `filosofo.vento` `filosofo.aforismi` `filosofo.formiche` `filosofo.lumaca` `filosofo.biblioteca` `filosofo.stelle` `filosofo.sasso` `filosofo.trattato` `filosofo.lezione` `filosofo.pozzanghera` `filosofo.scacchi` `filosofo.scuola` `pensare` `meditare` `gruppo.lezione`
- **Sblocca**: `toga-filosofo (liv. 2)` `mantello-stelle (liv. 3)`

| Ruolo | Che cosa fa |
|---|---|
| Allievo (`allievo`) | `gruppo.lezione` `leggere` `filosofo.formiche` |
| Assistente (`assistente`) | `filosofo.biblioteca` `filosofo.aforismi` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `panchina` La panchina per pensare | `panchina` | `livello:1` | sceglie il ramo giusto per la panchina → inchioda la panchina → ci si siede per la prima volta e pensa |
| `biblioteca` La biblioteca di cortecce | `biblioteca` | `livello:2` | raccoglie le cortecce → ci scrive sopra i titoli → le mette in ordine, poi le rimette in disordine |
| `cannocchiale` Il cannocchiale di canna | `cannocchiale` | `livello:3` | taglia una canna → ci mette una goccia di rugiada come lente → guarda la luna per la prima volta |
| `aula` L'aula sotto la chioma | `aula` | `impresa:scuola-chioma@2 + sostenitori:1` | pianta quattro pali → stende un tetto di foglie → mette i banchi di ceppo in fila |
| `osservatorio` L'osservatorio | `osservatorio` | `cantiere:cannocchiale` | costruisce una torretta di rami → ci monta sopra il cannocchiale → dà un nome a una stella (inventato) |

### L'atelier (`atelier-artista`)

- **Strada**: artista · **si apre**: `strada:artista`
- **Livelli**: 1. Il pittore del prato · 2. L'atelier all'aperto · 3. La mostra
- **Attività dell'impresa** (×4): `artista.dipinge` `artista.ispirazione` `artista.colori` `artista.scolpisce` `artista.mostra` `artista.colori-bacche` `artista.ritratto` `artista.neve` `artista.mosaico` `artista.appende` `artista.murale` `artista.vende` `dipingere` `gruppo.ritratto`
- **Sblocca**: `papillon (liv. 3)`

| Ruolo | Che cosa fa |
|---|---|
| Modello (`modello`) | `gruppo.ritratto` `artista.ritratto` |
| Assistente (`assistente`) | `artista.colori-bacche` `artista.colori` `raccogli-bacche` |
| Critico (`critico`) | `artista.mostra` `pensare` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `atelier` L'atelier | `atelier` | `livello:1` | tende un filo tra due rami → appende le tele ad asciugare → dà un nome all'atelier |
| `scultura` La scultura | `scultura` | `livello:2` | sceglie un ramo da scolpire → scolpisce e si riempie di trucioli → scopre che sembra lo scoiattolo |
| `galleria` La galleria | `galleria` | `livello:3` | costruisce le cornici → appende i quadri → inaugura la mostra |

### Il club sportivo (`club-sportivo`)

- **Strada**: sportivo · **si apre**: `strada:sportivo`
- **Livelli**: 1. L'atleta del prato · 2. La palestra all'aperto · 3. Il campione
- **Attività dell'impresa** (×4): `sportivo.stretching` `sportivo.corsa` `sportivo.salto` `sportivo.trazioni` `sportivo.ostacoli` `sportivo.premiazione` `sportivo.braccio-ferro` `sportivo.fischietto` `sportivo.tronchi` `sportivo.yoga` `sportivo.record` `sportivo.corsa-stanza` `corsa` `allenarsi` `gruppo.torneo` `gruppo.braccio-ferro`
- **Sblocca**: `fischietto (liv. 2)` `canottiera-numero (liv. 3)`

| Ruolo | Che cosa fa |
|---|---|
| Compagno di squadra (`compagno-squadra`) | `gruppo.torneo` `sportivo.corsa` `sportivo.stretching` |
| Allenatore (`allenatore`) | `sportivo.fischietto` `sportivo.corsa-stanza` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `sbarra` La sbarra per le trazioni | `sbarra` | `livello:1` | pianta due pali → ci lega la sbarra → prova la prima trazione |
| `ostacoli` Il percorso a ostacoli | `ostacoli` | `livello:2` | allinea i sassi → monta gli ostacoli di rami → fa il primo giro cronometrato |
| `podio` Il podio | `podio` | `livello:3` | impila tre ceppi → ci scrive 1, 2, 3 → si premia da solo |
| `spogliatoio` Lo spogliatoio | `spogliatoio` | `impresa:club-sportivo@2 + sostenitori:1` | monta le pareti di corteccia → appende i ganci per le fasce → ci scrive «Vietato l'ingresso agli scoiattoli» |

### La banda del bosco (`banda-bosco`)

- **Strada**: furfante · **si apre**: `strada:furfante`
- **Livelli**: 1. Il ladruncolo di ghiande · 2. Il mercato nero del bosco · 3. Il re del bosco
- **Attività dell'impresa** (×4): `furfante.nasconde` `furfante.travestimento` `furfante.spia` `furfante.bottino` `furfante.mercato` `furfante.piani` `furfante.codice` `furfante.guardia` `furfante.specchio` `furfante.galleria` `furfante.riunione` `furfante.restituisce` `contare-ghiande` `gruppo.colpo`
- **Sblocca**: `cappello-boss (liv. 2)` `giacca-gessata (liv. 3)` `corona-foglie (liv. 3)`

| Ruolo | Che cosa fa |
|---|---|
| Palo (`palo`) | `furfante.guardia` `furfante.spia` |
| Contabile delle ghiande (`contabile-ghiande`) | `furfante.bottino` `contare-ghiande` |
| Galoppino (`galoppino`) | `furfante.codice` `furfante.nasconde` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `nascondiglio` Il nascondiglio | `nascondiglio` | `livello:1` | scava una buca segreta → la copre di foglie → dimentica dov'è |
| `mercato` Il banco del mercato nero | `mercato` | `livello:2` | monta un banco sotto un telo → scrive i prezzi in codice → apre con un sussurro |
| `tesoro` La mappa del tesoro | `tesoro` | `livello:3` | disegna la mappa → nasconde il tesoro → lo ritrova, dopo molto cercare |
| `covo` Il covo della banda | `covo` | `impresa:banda-bosco@2 + sostenitori:1` | scava l'ingresso dietro un cespuglio → ci mette un tavolo e una lanterna → inventa la parola d'ordine (e la dimentica) |

### L'agenzia di viaggi (`agenzia-viaggi`)

- **Strada**: viaggiatore · **si apre**: `strada:viaggiatore`
- **Livelli**: 1. Il sognatore di viaggi · 2. L'agenzia di viaggi del prato · 3. Il capitano della mongolfiera
- **Attività dell'impresa** (×4): `viaggiatore.zaino` `viaggiatore.mappa` `viaggiatore.binocolo` `viaggiatore.cartoline` `viaggiatore.partenza` `viaggiatore.aereo` `viaggiatore.foto` `viaggiatore.tenda` `viaggiatore.saluto` `viaggiatore.esotico` `viaggiatore.racconti` `viaggiatore.bottiglia` `passeggiata` `studiare-mappa` `fare-valigia`
- **Sblocca**: `tenda (liv. 2)` `cappello-esploratore (liv. 2)`

| Ruolo | Che cosa fa |
|---|---|
| Compagno di viaggio (`compagno-viaggio`) | `passeggiata` `viaggiatore.tenda` |
| Cartografo (`cartografo`) | `viaggiatore.mappa` `studiare-mappa` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `bacheca` La bacheca delle cartoline | `bacheca` | `livello:1` | pianta un pannello di corteccia → ci appende le cartoline |
| `cartelli` I cartelli direzionali | `cartelli` | `livello:2` | taglia le frecce → ci scrive città che non ha mai visto → li pianta tutti nella direzione sbagliata |
| `mongolfiera` La mongolfiera di foglie | `mongolfiera` | `livello:3` | cuce le foglie → intreccia la cesta → lega le corde → la gonfia → si alza di un palmo e torna giù felice |
| `chiosco-agenzia` Il chiosco dell'agenzia | `chiosco-agenzia` | `impresa:agenzia-viaggi@2 + sostenitori:1` | monta lo sportello → appende i manifesti di posti inventati → apre con un fischio |

### Il festival di poesia (`festival-poesia`)

- **Strada**: poeta · **si apre**: `strada:poeta`
- **Livelli**: 1. Il poeta del prato · 2. Lo scrittoio sotto la chioma · 3. Il festival di poesia
- **Attività dell'impresa** (×4): `poeta.scrive` `poeta.recita` `poeta.rima` `poeta.amaca` `poeta.versi` `poeta.detta` `poeta.sillabe` `poeta.gara-rime` `poeta.neve` `poeta.tramonto` `poeta.serata` `poeta.pisolino` `scrivere-poesia` `gruppo.gara-rime`
- **Sblocca**: `papillon (liv. 3)`

| Ruolo | Che cosa fa |
|---|---|
| Lettore (`lettore`) | `poeta.recita` `leggere` |
| Pubblico (`pubblico`) | `gruppo.gara-rime` `tramonto` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `amaca` L'amaca | `amaca` | `livello:1` | intreccia l'amaca → la lega a due rami → ci si sdraia e non si alza più |
| `scrittoio` Lo scrittoio | `scrittoio` | `livello:2` | trova un ceppo piatto → ci mette il calamaio → scrive la prima riga |
| `filo` Il filo delle poesie | `filo` | `livello:3` | tende un filo tra i rami → ci appende i versi |
| `palco` Il palco | `palco` | `impresa:festival-poesia@2 + sostenitori:1` | inchioda le assi → appende una tenda di foglie → prova il microfono (è una ghianda) |

### L'orto comunitario (`orto-comunitario`)

- **Strada**: libera · **si apre**: `catena:orto`
- **Livelli**: 1. L'aiuola · 2. L'orto · 3. L'orto comunitario
- **Attività dell'impresa** (×4): `zappa-aiuola` `semina` `annaffia-orto` `raccoglie-ortaggi` `cucina-zuppa`
- **Sblocca**: —

| Ruolo | Che cosa fa |
|---|---|
| Ortolano (`ortolano`) | `zappa-aiuola` `semina` |
| Annaffiatore (`annaffiatore`) | `annaffia-orto` `raccoglie-rugiada` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `spaventapasseri` Lo spaventapasseri | `spaventapasseri` | `impresa:orto-comunitario@1` | incrocia due bastoni → gli mette un cappello vecchio → gli dà un nome |
| `serra` La serra | `serra` | `impresa:orto-comunitario@2` | monta i telai → ci tende le foglie più trasparenti → ci porta dentro i germogli più piccoli |

### La cucina del bosco (`cucina-bosco`)

- **Strada**: libera · **si apre**: `catena:forno`
- **Livelli**: 1. Il fornello · 2. La cucina · 3. La trattoria del bosco
- **Attività dell'impresa** (×4): `impasta-pane` `macina-ghiande` `cucina-zuppa` `castagne` `cuoce-marmellata` `gruppo.cena`
- **Sblocca**: —

| Ruolo | Che cosa fa |
|---|---|
| Aiuto cuoco (`aiuto-cuoco`) | `cucina-zuppa` `impasta-pane` |
| Assaggiatore (`assaggiatore`) | `castagne` `gruppo.cena` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `dispensa` La dispensa | `dispensa` | `impresa:cucina-bosco@1` | inchioda le mensole → ci mette i vasetti in fila → scrive le etichette |
| `cucina-aperto` La cucina all'aperto | `cucina-aperto` | `impresa:cucina-bosco@2` | costruisce il bancone → appende i mestoli → scrive il menù del giorno (zuppa) |

### La squadra di calcio (`squadra-calcio`)

- **Strada**: libera · **si apre**: `catena:calcio`
- **Livelli**: 1. La squadra · 2. Il campionato del prato · 3. La coppa del bosco
- **Attività dell'impresa** (×4): `gioca-palla` `allena-squadra` `gruppo.partita` `gruppo.foto`
- **Sblocca**: —

| Ruolo | Che cosa fa |
|---|---|
| Portiere (`portiere`) | `allena-squadra` |
| Attaccante (`attaccante`) | `gioca-palla` `gruppo.partita` |
| Tifoso (`tifoso`) | `gruppo.partita` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `porta-calcio` La porta da calcio | `porta-calcio` | `impresa:squadra-calcio@1` | pianta i pali → intreccia la rete → para il primo tiro (dello scoiattolo) |
| `bandierine` Le bandierine | `bandierine` | `impresa:squadra-calcio@2` | sceglie i colori della squadra → ritaglia le bandierine → le appende tra i rami |

### Il coro (`coro`)

- **Strada**: libera · **si apre**: `catena:musica`
- **Livelli**: 1. Le prove · 2. Il coro del prato · 3. Il gran concerto
- **Attività dell'impresa** (×4): `suona-flauto` `suona-tamburo` `gruppo.coro` `saluta-uccelli`
- **Sblocca**: —

| Ruolo | Che cosa fa |
|---|---|
| Voce (`voce`) | `gruppo.coro` |
| Musicista (`musicista`) | `suona-flauto` `suona-tamburo` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `leggio` Il leggio | `leggio` | `impresa:coro@1` | taglia un ramo a forcella → ci appoggia una corteccia piatta → ci mette sopra gli spartiti |
| `casetta-uccelli` La casetta degli uccelli | `casetta-uccelli` | `impresa:coro@2` | inchioda quattro assi → ci fa un buco rotondo → la appende al ramo (gli uccelli entrano nel coro) |

### La compagnia del teatro (`compagnia-teatro`)

- **Strada**: libera · **si apre**: `catena:teatro`
- **Livelli**: 1. La compagnia · 2. Il teatrino · 3. Il teatro del bosco
- **Attività dell'impresa** (×4): `prova-teatro` `spettacolo-teatro` `storie-fuoco` `gruppo.storie`
- **Sblocca**: —

| Ruolo | Che cosa fa |
|---|---|
| Attore (`attore`) | `prova-teatro` `spettacolo-teatro` |
| Suggeritore (`suggeritore`) | `leggere` `prova-teatro` |
| Pubblico (`pubblico`) | `spettacolo-teatro` `gruppo.storie` |

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `sedie-ceppo` Le sedie di ceppo | `sedie-ceppo` | `impresa:compagnia-teatro@1` | taglia i ceppi → li allinea in file → prova tutte le sedie, una per una |
| `teatro` Il teatro del bosco | `teatro` | `impresa:compagnia-teatro@2` | monta il palcoscenico → cuce il sipario di foglie → apre e chiude il sipario dieci volte |

## I cantieri liberi

Non sono di un'impresa: si aprono per tutti quando vale la regola.

| Cantiere | Lascia | Si apre | Passi |
|---|---|---|---|
| `casetta` La casetta | `casetta` | `giorni:10` | raccoglie le assi → monta le pareti → mette il tetto (e una finestra tonda) |
| `capanno-attrezzi` Il capanno degli attrezzi | `capanno-attrezzi` | `attrezzi:5` | sceglie il posto → monta il capanno → appende gli attrezzi, ognuno al suo chiodo |
| `pozzo` Il pozzo | `pozzo` | `fatta:raccoglie-rugiada×10` | scava → impila i sassi in tondo → cala il secchio per la prima volta |
| `mulino` Il mulino a vento | `mulino` | `meteo:vento×10` | costruisce la torretta → monta le pale di foglie → aspetta il vento |
| `faro` Il faro | `faro` | `catena:luce×3` | impila i sassi in una torre alta → ci mette in cima una lanterna → la accende per la prima volta |
