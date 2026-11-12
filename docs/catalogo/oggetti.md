# Il catalogo degli oggetti di Linfa

**214 voci** (il progetto ne prevede ~200, sezione 10):

| Categoria | Quante | Nel progetto | Già disegnate | Da disegnare per il lancio |
|---|---|---|---|---|
| Edifici | 20 | 20 | 0 | 10 |
| Arredi | 49 | 50 | 5 | 9 |
| Attrezzi | 40 | 25 | 18 | 4 |
| Giochi | 20 | 20 | 0 | 3 |
| Vestiti | 40 | 40 | 11 | 0 |
| Trofei | 30 | 30 | 0 | 0 |
| Album delle stagioni | 4 | 15 con le rarità | 0 | 0 |
| Rarità | 11 |  | 0 | 0 |

- **Al lancio: 60 disegni** (34 ci sono già, 26 da fare, tra cui 10 edifici); trofei e album sono icone. Le voci «dopo» restano nel catalogo come «in arrivo» e non si sbloccano finché non hanno il disegno (sezione 10).
- **Regali**: 51 voci possono arrivare anche come regalo (`regalo:id` nella regola): è il catalogo dei regali della sezione 11, da 10 a 51. I regali non cambiano mai la strada.
- Gli attrezzi della categoria comprendono gli oggetti che si tengono in mano (libro, tazza, ombrello…): la collezione di oggi li chiama «oggetti».
- Tutte le 25 voci di `collezione.ts` e i 10 regali di `regali.ts` ci sono con il loro id; i 21 arredi dei cantieri di `mestieri.ts` pure.

> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.

## Le regole di sblocco

Le calcola il codice, mai l'AI (come `collezione.ts`): ogni regola restituisce il giorno in cui è scattata.
« **o** » = basta una delle due, « **+** » = servono tutte e due, ×N = N volte.

| Regola | Vuol dire |
|---|---|
| `iniziale` · `iniziale:strada` | ce l'hanno tutti dal primo giorno · ce l'ha chi prende quella strada (gli «iniziali» di mestieri.ts) |
| `fatta:attività×N` | ha fatto quell'attività N volte (dal diario e dalla giornata) |
| `catena:id×N` · `catene:N` | ha finito quella catena N volte · ha finito N catene in tutto |
| `cantiere:id` · `cantieri:N` | ha finito quel cantiere · N cantieri in tutto |
| `impresa:id@N` · `impresa:*@N` | quell'impresa (o una qualsiasi) è arrivata al livello N |
| `strada:x` · `strada:*` | la strada si è rivelata (quella o una qualsiasi) |
| `meteo:x×N` | N giorni con quel tempo: bagnato = pioggia o temporale; pioggia = pioggia; temporale = temporale; neve = neve; nebbia = nebbia; sole = sole; vento = vento forte; freddo = sotto FREDDO_SOTTO gradi o neve; gelo = minima a 0 gradi o meno; caldo30 = massima a 30 gradi o più; soleCaldo = sole con massima da SOLE_DA gradi |
| `stagione:x` | ha vissuto un giorno di quella stagione (stagioneDa) |
| `giorni:N` · `diverse:N` | giorni vissuti · attività diverse fatte |
| `regali:N` · `messaggi:N` · `lettere:N` | regali ricevuti · messaggi della persona · lettere scritte |
| `stanze:N` · `compagni:N` · `sostenitori:N` | stanze sbloccate · altri alberi nella stanza · sostenitori delle sue imprese |
| `collezione:N` · `attrezzi:N` | voci sbloccate · attrezzi posseduti |
| `risorsa:x:N` | ha N di quella risorsa insieme |
| `regalo:id` | arriva come regalo della persona (Premium) |
| `baratto` · `tesoro` | esce da un baratto con lo scoiattolo · da un tesoro sepolto (si pesca tra le voci che lo hanno) |

## Edifici (20)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `casetta` | La casetta | sfondo | cantiere:casetta | Dopo qualche giorno sul prato vorrà un tetto tutto suo. | **apre-finestre**, **artista.murale** | **lancio** |
| `capanno-attrezzi` | Il capanno degli attrezzi | sfondo | cantiere:capanno-attrezzi | Quando gli attrezzi non stanno più nella cassetta… | ripara | **lancio** |
| `forno` | Il forno di sassi | sfondo | fatta:costruisce-forno | Sassi, un muretto, e poi profumo di pane. | cucina-zuppa, **impasta-pane** | **lancio** |
| `pozzo` | Il pozzo | sfondo | cantiere:pozzo | Tanta rugiada raccolta fa venire un'idea. | raccoglie-rugiada, tinozza | **lancio** |
| `serra` | La serra | sfondo | cantiere:serra | Un orto che cresce ha bisogno di un riparo. | annaffia-orto | **lancio** |
| `atelier` | L'atelier | sfondo | cantiere:atelier | L'artista ha bisogno di un posto suo. | **artista.scolpisce** | **lancio** |
| `galleria` | La galleria | sfondo | cantiere:galleria | Tanti quadri, nessun muro per appenderli. | **artista.mostra** | **lancio** |
| `biblioteca` | La biblioteca di cortecce | sfondo | cantiere:biblioteca | Il filosofo ha bisogno di qualcosa da consultare. | **filosofo.biblioteca** | **lancio** |
| `mongolfiera` | La mongolfiera di foglie | sfondo | cantiere:mongolfiera | Il viaggiatore sogna di alzarsi da terra. | **viaggiatore.partenza** | **lancio** |
| `covo` | Il covo della banda | sfondo | cantiere:covo | Una banda che cresce ha bisogno di un posto per le riunioni. | furfante.riunione | **lancio** |
| `aula` | L'aula sotto la chioma | sfondo | cantiere:aula | La scuola del filosofo ha sempre più allievi. | filosofo.lezione, gruppo.lezione | dopo |
| `osservatorio` | L'osservatorio | sfondo | cantiere:osservatorio | Le stelle, viste da più vicino. | filosofo.stelle | dopo |
| `torre-holding` | La torre della holding | sfondo | cantiere:torre-holding | Ghiande & Co. diventa una cosa seria. | imprenditore.riunione | dopo |
| `chiosco-agenzia` | Il chiosco dell'agenzia | sfondo | cantiere:chiosco-agenzia | Un'agenzia di viaggi ha bisogno di uno sportello. | viaggiatore.cartoline | dopo |
| `palco` | Il palco | sfondo | cantiere:palco | Un festival di poesia senza palco? | poeta.serata | dopo |
| `teatro` | Il teatro del bosco | sfondo | cantiere:teatro | La compagnia ha provato abbastanza. | prova-teatro, spettacolo-teatro | dopo |
| `cucina-aperto` | La cucina all'aperto | sfondo | cantiere:cucina-aperto | La cucina del bosco cresce. | cucina-zuppa | dopo |
| `mulino` | Il mulino a vento | sfondo | cantiere:mulino | Tanti giorni di vento… | **macina-ghiande** | dopo |
| `spogliatoio` | Lo spogliatoio | sfondo | cantiere:spogliatoio | Il club sportivo ha bisogno di un posto per cambiarsi. | sportivo.stretching | dopo |
| `faro` | Il faro | sfondo | cantiere:faro | Tante sere a fare luce… | lanterne, viaggiatore.binocolo | dopo |

## Arredi (49)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `bancarella` | La bancarella | davanti | iniziale:imprenditore | L'imprenditore ce l'ha dal primo giorno. | **imprenditore.pubblicita**, **imprenditore.contratta**, **imprenditore.incasso**, **gruppo.bancarella** | c'è |
| `scrivania` | La scrivania | prato | cantiere:scrivania | Il primo cantiere dell'imprenditore. | **imprenditore.caffe**, **imprenditore.telefono**, **imprenditore.contratti**, **imprenditore.riunione**, **imprenditore.chiude**, **imprenditore.notte** | c'è |
| `insegna` | L'insegna | sfondo | cantiere:insegna | Ogni attività ha bisogno di un nome. | **imprenditore.negozio** | c'è |
| `cassaforte` | La cassaforte di ghiande | prato | cantiere:cassaforte | Le ghiande vanno messe al sicuro. | **imprenditore.deposito** | c'è |
| `cavalletto` | Il cavalletto | prato | iniziale:artista | L'artista ce l'ha dal primo giorno. | dipingere, **artista.dipinge**, **artista.ritratto**, **gruppo.ritratto** | c'è |
| `panchina` | La panchina per pensare | prato | cantiere:panchina | Per pensare bisogna sedersi. | tramonto, **filosofo.lumaca**, **filosofo.scuola**, poeta.tramonto | **lancio** |
| `cannocchiale` | Il cannocchiale di canna | prato | cantiere:cannocchiale | Una goccia di rugiada può fare da lente. | **filosofo.stelle**, rara.eclissi | dopo |
| `scultura` | La scultura | prato | cantiere:scultura | C'è qualcosa dentro quel ramo. | artista.mostra | dopo |
| `sbarra` | La sbarra per le trazioni | prato | cantiere:sbarra | Lo sportivo vuole tirarsi su. | **sportivo.trazioni** | **lancio** |
| `ostacoli` | Il percorso a ostacoli | prato | cantiere:ostacoli | Correre non basta più. | **sportivo.ostacoli** | dopo |
| `podio` | Il podio | prato | cantiere:podio | Ci vuole un posto per i vincitori. | **sportivo.premiazione**, gruppo.torneo | dopo |
| `nascondiglio` | Il nascondiglio | prato | cantiere:nascondiglio | Una buca segreta (se si ricorda dov'è). | furfante.nasconde | **lancio** |
| `mercato` | Il banco del mercato nero | davanti | cantiere:mercato | Un banco sotto un telo, prezzi in codice. | **furfante.mercato** | dopo |
| `tesoro` | La mappa del tesoro | rami | cantiere:tesoro | Una X in un punto del prato. | rara.tesoro | dopo |
| `bacheca` | La bacheca delle cartoline | prato | cantiere:bacheca | Le cartoline vanno appese da qualche parte. | **viaggiatore.cartoline** | **lancio** |
| `cartelli` | I cartelli direzionali | prato | cantiere:cartelli | Frecce per città mai viste. | passeggiata | dopo |
| `amaca` | L'amaca | rami | cantiere:amaca | Il poeta pigro cerca un posto comodo. | sonnellino, **poeta.amaca**, poeta.pisolino | **lancio** |
| `scrittoio` | Lo scrittoio | prato | cantiere:scrittoio | Un ceppo piatto e un calamaio. | scrivere-poesia | dopo |
| `filo` | Il filo delle poesie | rami | cantiere:filo | I versi migliori vanno appesi. | **poeta.versi** | dopo |
| `altalena` | L'altalena | rami | fatta:monta-altalena **o** regalo:altalena | Una corda robusta e un ramo forte. | **altalena**, tramonto | **lancio** |
| `letto-muschio` | Il letto di muschio | prato | giorni:3 | Dopo tre notti sul prato. | sveglia, letto-muschio, dormire | dopo |
| `tavolino` | Il tavolino | davanti | baratto **o** regalo:tavolino | Lo scoiattolo ne ha uno da scambiare. | cena-luna, sportivo.braccio-ferro, gruppo.cena, gruppo.braccio-ferro | dopo |
| `lanterne` | Le lanterne | rami | fatta:fa-candele **o** regalo:lanterne | Fare luce con la resina. | **lanterne**, furfante.riunione, poeta.serata | **lancio** |
| `specchio` | Lo specchio | prato | baratto **o** tesoro **o** regalo:specchio | Lo scoiattolo, o un tesoro sepolto. | pettina-foglie, furfante.specchio | dopo |
| `filo-bucato` | Il filo per il bucato | rami | fatta:intreccia-corda | Una corda ben intrecciata. | bucato | dopo |
| `lavagna` | La lavagna | prato | strada:filosofo **o** strada:furfante **o** impresa:ghiande-co@2 | Per le lezioni, i piani e le riunioni. | imprenditore.riunione, filosofo.lezione, filosofo.scuola, furfante.piani, gruppo.lezione | dopo |
| `tinozza` | La tinozza | davanti | meteo:caldo30×3 **o** regalo:tinozza | Tre giorni di gran caldo. | bucato, **tinozza** | dopo |
| `cassetta-lettere` | La cassetta delle lettere | davanti | lettere:1 | Arriva con la prima lettera. | intermezzo.guarda | **lancio** |
| `mensola-trofei` | La mensola dei trofei | prato | collezione:10 | Dieci voci nella collezione. | intermezzo.guarda | dopo |
| `cerchio-sassi` | Il cerchio di sassi del fuoco | davanti | fatta:accendi-fuoco×3 | Tre fuochi accesi. | accendi-fuoco | **lancio** |
| `sgabello` | Lo sgabello | davanti | fatta:ripara×3 | Riparare tre volte qualcosa. | scrive-taccuino, filosofo.scacchi, intermezzo.siede | dopo |
| `casetta-uccelli` | La casetta degli uccelli | rami | cantiere:casetta-uccelli **o** fatta:saluta-uccelli×10 | Dieci buongiorno agli uccelli. | saluta-uccelli | dopo |
| `campanelle-vento` | Le campanelle del vento | rami | meteo:vento×5 **o** regalo:campanelle-vento | Cinque giorni di vento. | meditare, filosofo.vento | dopo |
| `lampada` | La lampada | prato | impresa:ghiande-co@2 | L'ufficio ha bisogno di luce. | diario-sera, imprenditore.chiude | dopo |
| `tenda` | La tenda | prato | impresa:agenzia-viaggi@2 **o** regalo:tenda | Il viaggiatore vuole dormire fuori. | stelle-sera, **viaggiatore.tenda** | dopo |
| `sasso-piatto` | Il sasso piatto | davanti | fatta:cerca-sassi×5 | Tra tanti sassi, uno perfetto per sedersi. | meditare, filosofo.sasso | dopo |
| `tappetino` | Il tappetino | prato | fatta:ginnastica-sole×5 **o** regalo:tappetino | Cinque mattine di ginnastica. | ginnastica-sole, allenarsi, meditare, sportivo.stretching, sportivo.yoga | dopo |
| `porta-calcio` | La porta da calcio | prato | cantiere:porta-calcio | La squadra ha bisogno di una porta. | gioca-palla, **allena-squadra**, gruppo.partita | dopo |
| `bandierine` | Le bandierine | rami | cantiere:bandierine | Ogni squadra ha i suoi colori. | sportivo.corsa-stanza, rara.festa, gruppo.compleanno, gruppo.torneo | dopo |
| `parasole` | Il parasole di foglie | prato | fatta:ventaglio×3 | Tre pomeriggi a sventolarsi. | prendere-sole, ventaglio | dopo |
| `cuccia-scoiattolo` | La casetta dello scoiattolo | rami | fatta:chiacchierare-scoiattolo×10 | Dieci chiacchierate con lo scoiattolo. | chiacchierare-scoiattolo, regala-vasetti | dopo |
| `dispensa` | La dispensa | prato | cantiere:dispensa **o** catena:marmellata×2 | Dove si mettono i vasetti? | riempie-vasetti | dopo |
| `legnaia` | La legnaia | prato | risorsa:legna:9 | La catasta di legna è piena. | raccogli-rami | dopo |
| `spaventapasseri` | Lo spaventapasseri | prato | cantiere:spaventapasseri | L'orto ha bisogno di un guardiano (gentile). | semina, raccoglie-ortaggi | dopo |
| `botte-acqua` | La botte dell'acqua | prato | risorsa:acqua:9 | Tanta acqua raccolta. | raccoglie-rugiada, secchio-pioggia | dopo |
| `leggio` | Il leggio | davanti | cantiere:leggio | Il coro ha bisogno degli spartiti. | filosofo.trattato, poeta.serata, gruppo.coro | dopo |
| `poltrona-muschio` | La poltrona di muschio | prato | fatta:sonnellino×10 | Dieci sonnellini. | sonnellino, leggere | dopo |
| `globo` | Il mappamondo | davanti | fatta:studiare-mappa×5 | Cinque mappe studiate. | studiare-mappa, viaggiatore.mappa, viaggiatore.racconti | dopo |
| `sedie-ceppo` | Le sedie di ceppo | davanti | cantiere:sedie-ceppo **o** catena:fuoco×2 | Per chi viene a sentire le storie. | storie-fuoco, poeta.serata, invita-fuoco, spettacolo-teatro, gruppo.cena, gruppo.storie | dopo |

## Attrezzi (40)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `annaffiatoio` | L'annaffiatoio | cassetta | iniziale | Ce l'hanno tutti dal primo giorno. | annaffiarsi, annaffia-orto | c'è |
| `martello` | Il martello | cassetta | fatta:ripara×2 **o** cantiere:scrivania | Riparare due volte qualcosa. | ripara, artista.appende, monta-altalena | c'è |
| `pala` | La pala | cassetta | fatta:cerca-ghiande×5 | Cinque volte a scavare per le ghiande. | furfante.galleria, rara.tesoro, rara.fossile | c'è |
| `sega` | La sega | cassetta | fatta:raccogli-rami×10 **o** cantiere:scrivania | Tanta legna da tagliare. | monta-altalena | c'è |
| `forbici` | Le forbici | cassetta | impresa:ghiande-co@2 | Per tagliare i nastri delle inaugurazioni. | imprenditore.negozio | c'è |
| `pennello` | Il pennello | cassetta | iniziale:artista **o** regalo:pennello | L'artista ce l'ha dal primo giorno. | dipingere, artista.dipinge, artista.murale | c'è |
| `megafono` | Il megafono di foglia | cassetta | iniziale:imprenditore | L'imprenditore ce l'ha dal primo giorno. | imprenditore.pubblicita | c'è |
| `timbro` | Il timbro | cassetta | cantiere:scrivania | Ogni scrivania ha il suo timbro. | imprenditore.contratti | c'è |
| `tazza` | La tazza della tisana | cassetta | fatta:bere-tisana **o** regalo:tazza | Bere la prima tisana. | colazione-rugiada, bere-tisana, imprenditore.caffe, rara.ospite, intermezzo.beve | c'è |
| `libro` | Il libro | cassetta | fatta:leggere×3 **o** regalo:libro | Leggere tre volte. | leggere, leggere-ombrello, viaggiatore.saluto, rara.foglia-oro | c'è |
| `quaderno` | Il quaderno delle poesie | cassetta | fatta:scrivere-poesia×3 **o** regalo:quaderno | Scrivere tre poesie. | scrive-taccuino, diario-sera, scrivere-poesia, imprenditore.sondaggio, filosofo.trattato, poeta.scrive, rara.stelle-cadenti, gruppo.lettera | c'è |
| `ombrello` | L'ombrello | cassetta | meteo:bagnato×3 **o** regalo:ombrello | Tre giorni di pioggia. | leggere-ombrello, giornale-ombrello, **gruppo.ombrello** | c'è |
| `valigia` | La valigia | prato | fatta:fare-valigia **o** regalo:valigia | Preparare la valigia per un viaggio immaginario. | fare-valigia, viaggiatore.partenza | c'è |
| `telefono` | Il telefono | cassetta | strada:imprenditore | Gli affari chiamano. | telefonata, imprenditore.telefono | c'è |
| `giornale` | Il giornale | cassetta | fatta:giornale-foglie×3 | Tre mattine di notizie. | giornale-foglie, giornale-ombrello | c'è |
| `mappa` | La mappa del mondo | cassetta | fatta:studiare-mappa **o** strada:viaggiatore | Sognare un viaggio. | studiare-mappa, viaggiatore.mappa | c'è |
| `manubrio` | Il manubrio di ghiande | cassetta | fatta:allenarsi×3 | Tre allenamenti. | allenarsi | c'è |
| `cartello` | Il cartello «Ombra in vendita» | prato | fatta:vendere-ombra | Vendere ombra almeno una volta. | vendere-ombra | c'è |
| `rastrello` | Il rastrello | cassetta | fatta:rastrella-foglie×3 | Tre mucchi di foglie a mano. | rastrella-foglie | **lancio** |
| `secchio` | Il secchio | cassetta | meteo:pioggia×2 **o** fatta:raccoglie-rugiada×3 | Raccogliere acqua, in un modo o nell'altro. | raccoglie-rugiada, secchio-pioggia | **lancio** |
| `acciarino` | L'acciarino | cassetta | fatta:accendi-fuoco×10 | Dieci fuochi accesi. | accendi-fuoco | **lancio** |
| `pentola` | La pentola | cassetta | fatta:accendi-fuoco×2 **o** regalo:pentola | Un fuoco acceso fa venire fame. | **cucina-zuppa**, **viaggiatore.esotico**, schiaccia-bacche, **cuoce-marmellata** | **lancio** |
| `zappa` | La zappa | cassetta | fatta:zappa-aiuola×2 | Due aiuole zappate a mano. | zappa-aiuola | dopo |
| `scopa` | La scopa | cassetta | fatta:spazza×3 | Tre mattine a spazzare con un ramo. | spazza | dopo |
| `canna-pesca` | La canna da pesca | cassetta | fatta:intreccia-fili×5 **o** regalo:canna-pesca | Cinque fili d'erba intrecciati. | **pesca-pozzanghera**, rara.ruscello | dopo |
| `cesto` | Il cesto | cassetta | fatta:intreccia-fili×3 | Tre fili d'erba intrecciati. | cerca-ghiande, raccogli-bacche, raccoglie-ortaggi | dopo |
| `tavolozza` | La tavolozza | cassetta | fatta:artista.colori×3 | Tre volte a mescolare i colori. | artista.colori | dopo |
| `scalpello` | Lo scalpello | cassetta | cantiere:atelier | L'atelier è pronto. | artista.scolpisce | dopo |
| `fischietto` | Il fischietto | cassetta | impresa:club-sportivo@2 | Il club sportivo ha bisogno di un allenatore. | sportivo.fischietto, sportivo.corsa-stanza | dopo |
| `fettuccia` | La fettuccia | cassetta | fatta:sportivo.salto×3 | Tre salti in lungo. | sportivo.salto, **sportivo.record** | dopo |
| `lente` | La lente | cassetta | strada:filosofo | Il filosofo vuole guardare da vicino. | filosofo.formiche | dopo |
| `binocolo` | Il binocolo | cassetta | strada:viaggiatore **o** regalo:binocolo | Il viaggiatore guarda lontano. | furfante.spia, viaggiatore.binocolo | dopo |
| `pettine` | Il pettine di legno | cassetta | fatta:pettina-foglie×3 **o** regalo:pettine | Tre mattine a pettinarsi con le dita. | pettina-foglie, furfante.specchio | dopo |
| `corda` | La corda | cassetta | fatta:intreccia-corda | Una corda robusta, intrecciata a mano. | **monta-altalena** | dopo |
| `vasetti` | I vasetti | cassetta | fatta:raccogli-bacche×5 | Tante bacche da mettere da parte. | artista.colori-bacche, **riempie-vasetti** | dopo |
| `spiedo` | Lo spiedo | cassetta | fatta:castagne×3 | Tre sere di castagne. | castagne | dopo |
| `carriola` | La carriola | prato | fatta:raccogli-rami×5 **+** fatta:cerca-sassi×5 | Troppi rami e sassi da portare a mano. | raccogli-rami, cerca-sassi, muretto-sassi, rastrella-temporale | dopo |
| `ventaglio` | Il ventaglio | cassetta | meteo:caldo30 **o** regalo:ventaglio | Un giorno di gran caldo. | ventaglio, rara.cicale | dopo |
| `asciugamano` | L'asciugamano | cassetta | fatta:prendere-sole×3 **o** regalo:asciugamano | Tre pomeriggi al sole. | prendere-sole, doccia, tinozza | dopo |
| `bottiglia` | La bottiglia | cassetta | fatta:rara.bottiglia **o** tesoro | Una bottiglia arrivata da chissà dove. | viaggiatore.bottiglia | dopo |

## Giochi (20)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `pallone` | Il pallone | davanti | baratto **o** regalo:pallone | Lo scoiattolo ne ha uno da scambiare. | **gioca-palla**, **allena-squadra**, **gruppo.partita** | **lancio** |
| `aquilone` | L'aquilone | prato | regalo:aquilone **o** fatta:intreccia-corda **+** meteo:vento×3 **o** fatta:intreccia-corda **+** risorsa:piume:3 | Una corda, un po' di vento o qualche piuma. | **aquilone**, **ripara-aquilone** | **lancio** |
| `soffiabolle` | Le bolle di sapone | davanti | fatta:bucato×3 **o** regalo:soffiabolle | Dopo tanti bucati avanza il sapone. | **bolle**, tinozza | dopo |
| `flauto` | Il flauto di canna | cassetta | fatta:saluta-uccelli×5 **o** regalo:flauto | Gli uccelli insegnano a fischiare. | **suona-flauto**, gruppo.coro | **lancio** |
| `telefono-barattolo` | Il telefono di barattolo | davanti | fatta:chiacchierare-scoiattolo×5 **o** regalo:telefono-barattolo | Per parlare con lo scoiattolo da lontano. | chiacchierare-scoiattolo, **telefono-barattolo** | dopo |
| `macchina-cartone` | La macchina fotografica di cartone | cassetta | strada:viaggiatore **o** regalo:macchina-cartone | Il viaggiatore vuole ricordare tutto. | **viaggiatore.foto**, gruppo.foto | dopo |
| `bici` | La bicicletta | prato | regalo:bici | Solo come regalo. | ripara, **pedala** | dopo |
| `trottola` | La trottola | davanti | baratto **o** tesoro **o** regalo:trottola | Lo scoiattolo, o un tesoro sepolto. | rara.circo, **trottola** | dopo |
| `scacchiera` | La scacchiera | davanti | fatta:pensare×10 **o** regalo:scacchiera | Dieci pensieri profondi. | pensare, **filosofo.scacchi** | dopo |
| `palline-giocoliere` | Le palline da giocoliere | cassetta | fatta:rara.circo **o** regalo:palline-giocoliere | Il circo del bosco è passato di qui. | rara.circo, gruppo.compleanno | dopo |
| `corda-salto` | La corda per saltare | cassetta | fatta:intreccia-corda×2 **o** regalo:corda-salto | Due corde intrecciate. | ginnastica-sole, **salta-corda** | dopo |
| `bocce-sassi` | Le bocce di sasso | davanti | fatta:cerca-sassi×10 | Dieci volte a cercare sassi belli. | **bocce** | dopo |
| `slittino` | Lo slittino | prato | meteo:neve×3 **o** regalo:slittino | Tre giorni di neve. | pupazzo-neve, **slittino** | dopo |
| `barchetta` | La barchetta | davanti | fatta:pozzanghere×3 **o** regalo:barchetta | Tre salti nelle pozzanghere. | pozzanghere, viaggiatore.bottiglia | dopo |
| `domino-corteccia` | Il domino di corteccia | davanti | fatta:gratta-resina×5 | Tanta corteccia grattata. | **domino** | dopo |
| `yo-yo` | Lo yo-yo | cassetta | baratto **o** tesoro **o** regalo:yo-yo | Lo scoiattolo, o un tesoro sepolto. | passeggiata, **yo-yo** | dopo |
| `maschere-teatro` | Le maschere del teatro | cassetta | fatta:storie-fuoco×5 **o** regalo:maschere-teatro | Cinque storie raccontate al fuoco. | **prova-teatro**, **spettacolo-teatro** | dopo |
| `tamburo` | Il tamburo di corteccia | davanti | fatta:suona-flauto×5 **o** regalo:tamburo | Una melodia vuole un ritmo. | **suona-tamburo**, gruppo.coro | dopo |
| `cerchio` | Il cerchio | prato | baratto **o** tesoro **o** regalo:cerchio | Lo scoiattolo, o un tesoro sepolto. | ballare, **cerchio** | dopo |
| `girandola` | La girandola | cassetta | meteo:vento×3 **o** regalo:girandola | Tre giorni di vento. | corsa, **girandola** | dopo |

## Vestiti (40)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `berretto` | Il berretto di lana | armadio | meteo:freddo **o** regalo:berretto | Un giorno di freddo. | pupazzo-neve, palle-neve, slittino | c'è |
| `sciarpa` | La sciarpa | armadio | meteo:freddo×5 **o** regalo:sciarpa | Cinque giorni di freddo. | scalda-mani, angelo-neve | c'è |
| `occhiali` | Gli occhiali da sole | armadio | meteo:soleCaldo **o** regalo:occhiali | Un giorno di sole e di caldo. | prendere-sole, gruppo.foto | c'è |
| `berretto-notte` | Il berretto da notte | armadio | iniziale | Ce l'hanno tutti dalla prima notte. | notte-pronto, dormire | c'è |
| `cravatta` | La cravatta | armadio | strada:imprenditore | Quando capisce di essere un imprenditore. | giornale-ombrello, imprenditore.contratti, imprenditore.riunione | c'è |
| `basco` | Il basco | armadio | strada:artista | Quando capisce di essere un artista. | dipingere, artista.dipinge | c'è |
| `fascia` | La fascia da sportivo | armadio | strada:sportivo | Quando capisce di essere uno sportivo. | ginnastica-sole, corsa, sportivo.stretching, sportivo.corsa | c'è |
| `bandana` | La bandana | armadio | strada:furfante | Quando capisce di essere un furfante del bosco. | furfante.nasconde, furfante.spia | c'è |
| `zaino` | Lo zaino | armadio | strada:viaggiatore | Quando capisce di essere un viaggiatore. | fare-valigia, passeggiata, viaggiatore.zaino, rara.ruscello | c'è |
| `piuma` | La piuma da poeta | armadio | strada:poeta | Quando capisce di essere un poeta. | scrivere-poesia, poeta.scrive, poeta.recita | c'è |
| `occhiali-tondi` | Gli occhiali tondi | armadio | strada:filosofo | Quando capisce di essere un filosofo. | giornale-foglie, leggere, filosofo.biblioteca | c'è |
| `cappello-boss` | Il cappello a tesa larga | armadio | impresa:banda-bosco@2 | La banda del bosco cresce. | furfante.guardia, furfante.specchio, furfante.riunione, gruppo.colpo | dopo |
| `giacca-gessata` | La giacca gessata | armadio | impresa:banda-bosco@3 | Il re del bosco si veste elegante. | furfante.riunione, gruppo.colpo | dopo |
| `corona-foglie` | La corona di foglie | armadio | impresa:banda-bosco@3 | Il re del bosco ha bisogno di una corona. | furfante.bottino | dopo |
| `grembiule-pittore` | Il grembiule da pittore | armadio | fatta:artista.colori×5 | Troppe macchie di colore. | artista.colori, artista.colori-bacche | dopo |
| `impermeabile` | L'impermeabile | armadio | meteo:pioggia×10 **o** regalo:impermeabile | Dieci giorni di pioggia. | secchio-pioggia, leggere-ombrello | dopo |
| `stivali-pioggia` | Gli stivali di gomma | armadio | fatta:pozzanghere×3 **o** regalo:stivali-pioggia | Tre salti nelle pozzanghere. | pesca-pozzanghera, pozzanghere | dopo |
| `cappello-paglia` | Il cappello di paglia | armadio | catena:orto **o** regalo:cappello-paglia | Il primo orto finito. | annaffia-orto, zappa-aiuola, semina | dopo |
| `guanti-lana` | I guanti di lana | armadio | meteo:neve×3 **o** regalo:guanti-lana | Tre giorni di neve. | pupazzo-neve, palle-neve | dopo |
| `paraorecchie` | I paraorecchie | armadio | meteo:gelo×3 | Tre notti di gelo. | angelo-neve, artista.neve | dopo |
| `mantello-foglie` | Il mantello di foglie | armadio | fatta:furfante.travestimento×3 | Tre travestimenti da cespuglio. | furfante.travestimento | dopo |
| `papillon` | Il papillon | armadio | impresa:atelier-artista@3 **o** impresa:festival-poesia@3 | Per le grandi serate. | artista.mostra, poeta.serata | dopo |
| `cappello-esploratore` | Il cappello da esploratore | armadio | impresa:agenzia-viaggi@2 **o** regalo:cappello-esploratore | L'agenzia di viaggi apre. | passeggiata, viaggiatore.binocolo, viaggiatore.tenda | dopo |
| `visiera` | La visiera | armadio | fatta:sportivo.salto×5 | Cinque salti in lungo. | sportivo.salto, sportivo.record | dopo |
| `canottiera-numero` | La canottiera col numero | armadio | impresa:club-sportivo@3 **o** cantiere:bandierine | Il campione ha il suo numero. | sportivo.ostacoli, allena-squadra, gruppo.partita, gruppo.torneo | dopo |
| `poncho` | Il poncho | armadio | meteo:temporale×3 **o** regalo:poncho | Tre temporali. | lampi, rastrella-temporale | dopo |
| `maglione` | Il maglione | armadio | meteo:freddo×10 **o** regalo:maglione | Dieci giorni di freddo. | castagne, scalda-mani | dopo |
| `cappello-cuoco` | Il cappello da cuoco | armadio | catena:forno | Il primo pane sfornato. | cucina-zuppa, viaggiatore.esotico, cuoce-marmellata, impasta-pane | dopo |
| `ghirlanda-fiori` | La ghirlanda di fiori | armadio | fatta:rara.primo-fiore | Il primo fiore di primavera. | ballare, rara.primo-fiore | dopo |
| `cappello-festa` | Il cappellino da festa | armadio | fatta:rara.festa **o** fatta:rara.compleanno | La prima festa. | rara.festa, rara.compleanno, gruppo.compleanno | dopo |
| `cilindro-circo` | Il cilindro del circo | armadio | fatta:rara.circo×2 | Il circo del bosco, due volte. | rara.circo | dopo |
| `calzini-spaiati` | I calzini spaiati | armadio | fatta:poeta.pisolino×5 | Cinque pisolini al posto delle poesie. | poeta.detta, poeta.pisolino | dopo |
| `vestaglia` | La vestaglia | armadio | fatta:notte-pronto×10 **o** regalo:vestaglia | Dieci sere a prepararsi per la notte. | bere-tisana, notte-pronto, dorme-braci | dopo |
| `pantofole` | Le pantofole | armadio | fatta:sveglia×10 **o** regalo:pantofole | Dieci risvegli. | sveglia, letto-muschio | dopo |
| `lanterna-frontale` | La lanterna da testa | armadio | meteo:nebbia×3 **o** fatta:furfante.galleria×2 | Per vedere nel buio (e nella nebbia). | nebbia, furfante.galleria | dopo |
| `mantello-stelle` | Il mantello con le stelle | armadio | fatta:stelle-sera×10 **o** impresa:scuola-chioma@3 | Dieci sere a guardare le stelle. | stelle-sera, filosofo.stelle | dopo |
| `costume-righe` | Il costume a righe | armadio | meteo:caldo30×5 **o** regalo:costume-righe | Cinque giorni di gran caldo. | prendere-sole, tinozza | dopo |
| `orecchini-ciliegia` | Gli orecchini di bacche | armadio | fatta:raccogli-bacche×10 | Dieci cesti di bacche. | raccogli-bacche, riempie-vasetti | dopo |
| `cappello-pescatore` | Il cappello da pescatore | armadio | fatta:pesca-pozzanghera×3 | Tre pomeriggi a pescare nella pozzanghera. | pesca-pozzanghera | dopo |
| `toga-filosofo` | La toga del filosofo | armadio | impresa:scuola-chioma@2 | La scuola sotto la chioma apre. | filosofo.aforismi, filosofo.lezione, gruppo.lezione | dopo |

## Trofei (30)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `prima-pioggia` | La prima pioggia | mensola | meteo:bagnato | Vivere un giorno di pioggia. | e 1 come «oggetto qualsiasi» | icona |
| `primo-temporale` | Il primo temporale | mensola | meteo:temporale | Restare in piedi durante un temporale. | e 1 come «oggetto qualsiasi» | icona |
| `prima-nebbia` | La prima nebbia | mensola | meteo:nebbia | Vivere un giorno di nebbia. | e 1 come «oggetto qualsiasi» | icona |
| `prima-neve` | La prima neve | mensola | meteo:neve | Vedere nevicare sul prato. | e 1 come «oggetto qualsiasi» | icona |
| `primo-gelo` | Il primo gelo | mensola | meteo:gelo | Passare una notte sotto zero. | e 1 come «oggetto qualsiasi» | icona |
| `gran-caldo` | Il gran caldo | mensola | meteo:caldo30 | Vivere un giorno da 30 gradi. | e 1 come «oggetto qualsiasi» | icona |
| `una-settimana` | Una settimana di diario | mensola | giorni:7 | Arrivare al giorno 7. | e 1 come «oggetto qualsiasi» | icona |
| `trenta-giorni` | Trenta giorni di diario | mensola | giorni:30 | Arrivare al giorno 30. | e 1 come «oggetto qualsiasi» | icona |
| `cento-giorni` | Cento giorni di diario | mensola | giorni:100 | Arrivare al giorno 100. | e 1 come «oggetto qualsiasi» | icona |
| `dieci-cose` | Dieci cose diverse | mensola | diverse:10 | Fare dieci attività diverse. | e 1 come «oggetto qualsiasi» | icona |
| `la-strada` | La strada presa | mensola | strada:* | Capire chi diventare. | e 1 come «oggetto qualsiasi» | icona |
| `primo-regalo` | Il primo regalo | mensola | regali:1 | Ricevere un regalo e decidere che cosa farne. | e 1 come «oggetto qualsiasi» | icona |
| `prima-chiacchierata` | La prima chiacchierata | mensola | messaggi:1 | Ricevere il primo messaggio dalla persona. | e 1 come «oggetto qualsiasi» | icona |
| `primo-cantiere` | Il primo cantiere | mensola | cantieri:1 | Finire un cantiere. | e 1 come «oggetto qualsiasi» | icona |
| `tre-cantieri` | Tre cantieri | mensola | cantieri:3 | Finire tre cantieri. | e 1 come «oggetto qualsiasi» | icona |
| `prima-impresa` | La prima impresa | mensola | impresa:*@2 | Far crescere un'impresa fino al secondo livello. | e 1 come «oggetto qualsiasi» | icona |
| `impresa-al-massimo` | L'impresa al massimo | mensola | impresa:*@3 | Portare un'impresa al terzo livello. | e 1 come «oggetto qualsiasi» | icona |
| `primo-sostenitore` | Il primo sostenitore | mensola | sostenitori:1 | Convincere un altro albero a seguirlo. | e 1 come «oggetto qualsiasi» | icona |
| `prima-catena` | La prima catena | mensola | catene:1 | Portare a termine una catena, dal primo passo all'ultimo. | e 1 come «oggetto qualsiasi» | icona |
| `dieci-catene` | Dieci catene | mensola | catene:10 | Portare a termine dieci catene. | e 1 come «oggetto qualsiasi» | icona |
| `primo-raccolto` | Il primo raccolto | mensola | fatta:raccoglie-ortaggi | Raccogliere le verdure del suo orto. | e 1 come «oggetto qualsiasi» | icona |
| `un-anno` | Un anno di diario | mensola | giorni:365 | Arrivare al giorno 365. | e 1 come «oggetto qualsiasi» | icona |
| `cinquanta-cose` | Cinquanta cose diverse | mensola | diverse:50 | Fare cinquanta attività diverse. | e 1 come «oggetto qualsiasi» | icona |
| `prima-lettera` | La prima lettera | mensola | lettere:1 | Scrivere la prima lettera della settimana. | e 1 come «oggetto qualsiasi» | icona |
| `dieci-lettere` | Dieci lettere | mensola | lettere:10 | Scrivere dieci lettere. | e 1 come «oggetto qualsiasi» | icona |
| `nuova-stanza` | Una stanza nuova | mensola | stanze:2 | Avere una seconda stanza. | e 1 come «oggetto qualsiasi» | icona |
| `compagnia` | In compagnia | mensola | compagni:1 | Dividere la stanza con un altro albero. | e 1 come «oggetto qualsiasi» | icona |
| `primo-ospite` | Il primo ospite | mensola | fatta:rara.ospite | Accogliere un ospite inatteso. | e 1 come «oggetto qualsiasi» | icona |
| `settimana-bagnata` | La settimana bagnata | mensola | meteo:bagnato×7 | Sette giorni di pioggia, anche non di fila. | e 1 come «oggetto qualsiasi» | icona |
| `tutte-le-stagioni` | Tutte le stagioni | mensola | stagione:primavera **+** stagione:estate **+** stagione:autunno **+** stagione:inverno | Vivere un giorno in ogni stagione. | e 1 come «oggetto qualsiasi» | icona |

## Album delle stagioni (4)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `primavera` | La primavera | mensola | stagione:primavera | Vivere un giorno di primavera. | e 1 come «oggetto qualsiasi» | icona |
| `estate` | L'estate | mensola | stagione:estate | Vivere un giorno d'estate. | e 1 come «oggetto qualsiasi» | icona |
| `autunno` | L'autunno | mensola | stagione:autunno | Vivere un giorno d'autunno. | e 1 come «oggetto qualsiasi» | icona |
| `inverno` | L'inverno | mensola | stagione:inverno | Vivere un giorno d'inverno. | e 1 come «oggetto qualsiasi» | icona |

## Rarità (11)

| Id | Nome | Posto | Si sblocca | Indizio sulla sagoma | Usi (attività) | Disegno |
|---|---|---|---|---|---|---|
| `foglia-oro` | La foglia d'oro | mensola | fatta:rara.foglia-oro | Una foglia speciale, in autunno. | leggere e 1 come «oggetto qualsiasi» | icona |
| `fossile` | La foglia di pietra | mensola | fatta:rara.fossile | Scavando, molto in fondo. | filosofo.formiche e 1 come «oggetto qualsiasi» | icona |
| `sasso-ruscello` | Il sasso del ruscello | mensola | fatta:rara.ruscello | Una gita d'estate. | e 1 come «oggetto qualsiasi» | icona |
| `desiderio` | Il biglietto del desiderio | mensola | fatta:rara.stelle-cadenti | Una notte d'agosto. | e 1 come «oggetto qualsiasi» | icona |
| `lettera-bottiglia` | La lettera nella bottiglia | mensola | fatta:rara.bottiglia | Arriva da chissà dove. | e 1 come «oggetto qualsiasi» | icona |
| `fiore-pressato` | Il fiore pressato | mensola | fatta:rara.primo-fiore | Il primo fiore di primavera. | e 1 come «oggetto qualsiasi» | icona |
| `fiocco-cristallo` | Il fiocco di cristallo | mensola | fatta:rara.ballo-neve | La prima neve dell'anno. | e 1 come «oggetto qualsiasi» | icona |
| `piuma-gufo` | La piuma del gufo | mensola | fatta:rara.ospite×3 | Tre ospiti inattesi. | e 1 come «oggetto qualsiasi» | icona |
| `nastro-arcobaleno` | Il nastro dell'arcobaleno | mensola | fatta:rara.arcobaleno | La fine dell'arcobaleno (quasi). | e 1 come «oggetto qualsiasi» | icona |
| `candelina` | La candelina | mensola | fatta:rara.compleanno | Il primo compleanno. | e 1 come «oggetto qualsiasi» | icona |
| `scatola-tesoro` | La scatola del tesoro | mensola | fatta:rara.tesoro | Un tesoro sepolto. | e 1 come «oggetto qualsiasi» | icona |

## Pescate dal baratto e dal tesoro

- **Baratto con lo scoiattolo** (`baratto-scoiattolo`): `tavolino` `specchio` `pallone` `trottola` `yo-yo` `cerchio`
- **Tesoro sepolto** (`rara.tesoro`): `specchio` `bottiglia` `trottola` `yo-yo` `cerchio`
