// Il catalogo degli oggetti (docs/stanze-e-vita.md, sezione 10).
// Una riga per voce, campi separati da «|»:
//   id | nome | categoria | posto | sblocco | indizio (si legge sulla sagoma) | priorità di disegno
//
// categoria: edificio · arredo · attrezzo · gioco · vestito · trofeo · stagione · rarita
// posto (sezione 2.3): sfondo · prato · davanti · rami · armadio · cassetta · mensola
//   (trofei e album stanno nel catalogo; con la mensola dei trofei si vedono anche nella stanza)
// sblocco: la regola, scritta con i segni di REGOLE in genera.mjs; « o » = una delle due,
//   « + » = tutte e due. «regalo:x» vuol dire che può arrivare anche come regalo (catalogo dei regali).
// priorità: c'è = il disegno esiste già (vivo/disegni.tsx, vivo/arredi.tsx, mestiere.ts)
//           1 = da disegnare per il lancio · 2 = dopo, ogni mese · icona = trofei e album (icone, non disegni)
// Gli id della collezione di oggi (collezione.ts) e dei regali (regali.ts) restano uguali.

export const OGGETTI = `
# ——— Edifici (sfondo): si sbloccano finendo un cantiere ———
casetta | La casetta | edificio | sfondo | cantiere:casetta | Dopo qualche giorno sul prato vorrà un tetto tutto suo. | 1
capanno-attrezzi | Il capanno degli attrezzi | edificio | sfondo | cantiere:capanno-attrezzi | Quando gli attrezzi non stanno più nella cassetta… | 1
forno | Il forno di sassi | edificio | sfondo | fatta:costruisce-forno | Sassi, un muretto, e poi profumo di pane. | 1
pozzo | Il pozzo | edificio | sfondo | cantiere:pozzo | Tanta rugiada raccolta fa venire un'idea. | 1
serra | La serra | edificio | sfondo | cantiere:serra | Un orto che cresce ha bisogno di un riparo. | 1
atelier | L'atelier | edificio | sfondo | cantiere:atelier | L'artista ha bisogno di un posto suo. | 1
galleria | La galleria | edificio | sfondo | cantiere:galleria | Tanti quadri, nessun muro per appenderli. | 1
biblioteca | La biblioteca di cortecce | edificio | sfondo | cantiere:biblioteca | Il filosofo ha bisogno di qualcosa da consultare. | 1
mongolfiera | La mongolfiera di foglie | edificio | sfondo | cantiere:mongolfiera | Il viaggiatore sogna di alzarsi da terra. | 1
covo | Il covo della banda | edificio | sfondo | cantiere:covo | Una banda che cresce ha bisogno di un posto per le riunioni. | 1
aula | L'aula sotto la chioma | edificio | sfondo | cantiere:aula | La scuola del filosofo ha sempre più allievi. | 2
osservatorio | L'osservatorio | edificio | sfondo | cantiere:osservatorio | Le stelle, viste da più vicino. | 2
torre-holding | La torre della holding | edificio | sfondo | cantiere:torre-holding | Ghiande & Co. diventa una cosa seria. | 2
chiosco-agenzia | Il chiosco dell'agenzia | edificio | sfondo | cantiere:chiosco-agenzia | Un'agenzia di viaggi ha bisogno di uno sportello. | 2
palco | Il palco | edificio | sfondo | cantiere:palco | Un festival di poesia senza palco? | 2
teatro | Il teatro del bosco | edificio | sfondo | cantiere:teatro | La compagnia ha provato abbastanza. | 2
cucina-aperto | La cucina all'aperto | edificio | sfondo | cantiere:cucina-aperto | La cucina del bosco cresce. | 2
mulino | Il mulino a vento | edificio | sfondo | cantiere:mulino | Tanti giorni di vento… | 2
spogliatoio | Lo spogliatoio | edificio | sfondo | cantiere:spogliatoio | Il club sportivo ha bisogno di un posto per cambiarsi. | 2
faro | Il faro | edificio | sfondo | cantiere:faro | Tante sere a fare luce… | 2

# ——— Arredi (prato, davanti, rami) ———
bancarella | La bancarella | arredo | davanti | iniziale:imprenditore | L'imprenditore ce l'ha dal primo giorno. | c'è
scrivania | La scrivania | arredo | prato | cantiere:scrivania | Il primo cantiere dell'imprenditore. | c'è
insegna | L'insegna | arredo | sfondo | cantiere:insegna | Ogni attività ha bisogno di un nome. | c'è
cassaforte | La cassaforte di ghiande | arredo | prato | cantiere:cassaforte | Le ghiande vanno messe al sicuro. | c'è
cavalletto | Il cavalletto | arredo | prato | iniziale:artista | L'artista ce l'ha dal primo giorno. | c'è
panchina | La panchina per pensare | arredo | prato | cantiere:panchina | Per pensare bisogna sedersi. | 1
cannocchiale | Il cannocchiale di canna | arredo | prato | cantiere:cannocchiale | Una goccia di rugiada può fare da lente. | 2
scultura | La scultura | arredo | prato | cantiere:scultura | C'è qualcosa dentro quel ramo. | 2
sbarra | La sbarra per le trazioni | arredo | prato | cantiere:sbarra | Lo sportivo vuole tirarsi su. | 1
ostacoli | Il percorso a ostacoli | arredo | prato | cantiere:ostacoli | Correre non basta più. | 2
podio | Il podio | arredo | prato | cantiere:podio | Ci vuole un posto per i vincitori. | 2
nascondiglio | Il nascondiglio | arredo | prato | cantiere:nascondiglio | Una buca segreta (se si ricorda dov'è). | 1
mercato | Il banco del mercato nero | arredo | davanti | cantiere:mercato | Un banco sotto un telo, prezzi in codice. | 2
tesoro | La mappa del tesoro | arredo | rami | cantiere:tesoro | Una X in un punto del prato. | 2
bacheca | La bacheca delle cartoline | arredo | prato | cantiere:bacheca | Le cartoline vanno appese da qualche parte. | 1
cartelli | I cartelli direzionali | arredo | prato | cantiere:cartelli | Frecce per città mai viste. | 2
amaca | L'amaca | arredo | rami | cantiere:amaca | Il poeta pigro cerca un posto comodo. | 1
scrittoio | Lo scrittoio | arredo | prato | cantiere:scrittoio | Un ceppo piatto e un calamaio. | 2
filo | Il filo delle poesie | arredo | rami | cantiere:filo | I versi migliori vanno appesi. | 2
altalena | L'altalena | arredo | rami | fatta:monta-altalena o regalo:altalena | Una corda robusta e un ramo forte. | 1
letto-muschio | Il letto di muschio | arredo | prato | giorni:3 | Dopo tre notti sul prato. | 2
tavolino | Il tavolino | arredo | davanti | baratto o regalo:tavolino | Lo scoiattolo ne ha uno da scambiare. | 2
lanterne | Le lanterne | arredo | rami | fatta:fa-candele o regalo:lanterne | Fare luce con la resina. | 1
specchio | Lo specchio | arredo | prato | baratto o tesoro o regalo:specchio | Lo scoiattolo, o un tesoro sepolto. | 2
filo-bucato | Il filo per il bucato | arredo | rami | fatta:intreccia-corda | Una corda ben intrecciata. | 2
lavagna | La lavagna | arredo | prato | strada:filosofo o strada:furfante o impresa:ghiande-co@2 | Per le lezioni, i piani e le riunioni. | 2
tinozza | La tinozza | arredo | davanti | meteo:caldo30×3 o regalo:tinozza | Tre giorni di gran caldo. | 2
cassetta-lettere | La cassetta delle lettere | arredo | davanti | lettere:1 | Arriva con la prima lettera. | 1
mensola-trofei | La mensola dei trofei | arredo | prato | collezione:10 | Dieci voci nella collezione. | 2
cerchio-sassi | Il cerchio di sassi del fuoco | arredo | davanti | fatta:accendi-fuoco×3 | Tre fuochi accesi. | 1
sgabello | Lo sgabello | arredo | davanti | fatta:ripara×3 | Riparare tre volte qualcosa. | 2
casetta-uccelli | La casetta degli uccelli | arredo | rami | cantiere:casetta-uccelli o fatta:saluta-uccelli×10 | Dieci buongiorno agli uccelli. | 2
campanelle-vento | Le campanelle del vento | arredo | rami | meteo:vento×5 o regalo:campanelle-vento | Cinque giorni di vento. | 2
lampada | La lampada | arredo | prato | impresa:ghiande-co@2 | L'ufficio ha bisogno di luce. | 2
tenda | La tenda | arredo | prato | impresa:agenzia-viaggi@2 o regalo:tenda | Il viaggiatore vuole dormire fuori. | 2
sasso-piatto | Il sasso piatto | arredo | davanti | fatta:cerca-sassi×5 | Tra tanti sassi, uno perfetto per sedersi. | 2
tappetino | Il tappetino | arredo | prato | fatta:ginnastica-sole×5 o regalo:tappetino | Cinque mattine di ginnastica. | 2
porta-calcio | La porta da calcio | arredo | prato | cantiere:porta-calcio | La squadra ha bisogno di una porta. | 2
bandierine | Le bandierine | arredo | rami | cantiere:bandierine | Ogni squadra ha i suoi colori. | 2
parasole | Il parasole di foglie | arredo | prato | fatta:ventaglio×3 | Tre pomeriggi a sventolarsi. | 2
cuccia-scoiattolo | La casetta dello scoiattolo | arredo | rami | fatta:chiacchierare-scoiattolo×10 | Dieci chiacchierate con lo scoiattolo. | 2
dispensa | La dispensa | arredo | prato | cantiere:dispensa o catena:marmellata×2 | Dove si mettono i vasetti? | 2
legnaia | La legnaia | arredo | prato | risorsa:legna:9 | La catasta di legna è piena. | 2
spaventapasseri | Lo spaventapasseri | arredo | prato | cantiere:spaventapasseri | L'orto ha bisogno di un guardiano (gentile). | 2
botte-acqua | La botte dell'acqua | arredo | prato | risorsa:acqua:9 | Tanta acqua raccolta. | 2
leggio | Il leggio | arredo | davanti | cantiere:leggio | Il coro ha bisogno degli spartiti. | 2
poltrona-muschio | La poltrona di muschio | arredo | prato | fatta:sonnellino×10 | Dieci sonnellini. | 2
globo | Il mappamondo | arredo | davanti | fatta:studiare-mappa×5 | Cinque mappe studiate. | 2
sedie-ceppo | Le sedie di ceppo | arredo | davanti | cantiere:sedie-ceppo o catena:fuoco×2 | Per chi viene a sentire le storie. | 2

# ——— Attrezzi (cassetta degli attrezzi: si vedono in mano quando li usa) ———
annaffiatoio | L'annaffiatoio | attrezzo | cassetta | iniziale | Ce l'hanno tutti dal primo giorno. | c'è
martello | Il martello | attrezzo | cassetta | fatta:ripara×2 o cantiere:scrivania | Riparare due volte qualcosa. | c'è
pala | La pala | attrezzo | cassetta | fatta:cerca-ghiande×5 | Cinque volte a scavare per le ghiande. | c'è
sega | La sega | attrezzo | cassetta | fatta:raccogli-rami×10 o cantiere:scrivania | Tanta legna da tagliare. | c'è
forbici | Le forbici | attrezzo | cassetta | impresa:ghiande-co@2 | Per tagliare i nastri delle inaugurazioni. | c'è
pennello | Il pennello | attrezzo | cassetta | iniziale:artista o regalo:pennello | L'artista ce l'ha dal primo giorno. | c'è
megafono | Il megafono di foglia | attrezzo | cassetta | iniziale:imprenditore | L'imprenditore ce l'ha dal primo giorno. | c'è
timbro | Il timbro | attrezzo | cassetta | cantiere:scrivania | Ogni scrivania ha il suo timbro. | c'è
tazza | La tazza della tisana | attrezzo | cassetta | fatta:bere-tisana o regalo:tazza | Bere la prima tisana. | c'è
libro | Il libro | attrezzo | cassetta | fatta:leggere×3 o regalo:libro | Leggere tre volte. | c'è
quaderno | Il quaderno delle poesie | attrezzo | cassetta | fatta:scrivere-poesia×3 o regalo:quaderno | Scrivere tre poesie. | c'è
ombrello | L'ombrello | attrezzo | cassetta | meteo:bagnato×3 o regalo:ombrello | Tre giorni di pioggia. | c'è
valigia | La valigia | attrezzo | prato | fatta:fare-valigia o regalo:valigia | Preparare la valigia per un viaggio immaginario. | c'è
telefono | Il telefono | attrezzo | cassetta | strada:imprenditore | Gli affari chiamano. | c'è
giornale | Il giornale | attrezzo | cassetta | fatta:giornale-foglie×3 | Tre mattine di notizie. | c'è
mappa | La mappa del mondo | attrezzo | cassetta | fatta:studiare-mappa o strada:viaggiatore | Sognare un viaggio. | c'è
manubrio | Il manubrio di ghiande | attrezzo | cassetta | fatta:allenarsi×3 | Tre allenamenti. | c'è
cartello | Il cartello «Ombra in vendita» | attrezzo | prato | fatta:vendere-ombra | Vendere ombra almeno una volta. | c'è
rastrello | Il rastrello | attrezzo | cassetta | fatta:rastrella-foglie×3 | Tre mucchi di foglie a mano. | 1
secchio | Il secchio | attrezzo | cassetta | meteo:pioggia×2 o fatta:raccoglie-rugiada×3 | Raccogliere acqua, in un modo o nell'altro. | 1
acciarino | L'acciarino | attrezzo | cassetta | fatta:accendi-fuoco×10 | Dieci fuochi accesi. | 1
pentola | La pentola | attrezzo | cassetta | fatta:accendi-fuoco×2 o regalo:pentola | Un fuoco acceso fa venire fame. | 1
zappa | La zappa | attrezzo | cassetta | fatta:zappa-aiuola×2 | Due aiuole zappate a mano. | 2
scopa | La scopa | attrezzo | cassetta | fatta:spazza×3 | Tre mattine a spazzare con un ramo. | 2
canna-pesca | La canna da pesca | attrezzo | cassetta | fatta:intreccia-fili×5 o regalo:canna-pesca | Cinque fili d'erba intrecciati. | 2
cesto | Il cesto | attrezzo | cassetta | fatta:intreccia-fili×3 | Tre fili d'erba intrecciati. | 2
tavolozza | La tavolozza | attrezzo | cassetta | fatta:artista.colori×3 | Tre volte a mescolare i colori. | 2
scalpello | Lo scalpello | attrezzo | cassetta | cantiere:atelier | L'atelier è pronto. | 2
fischietto | Il fischietto | attrezzo | cassetta | impresa:club-sportivo@2 | Il club sportivo ha bisogno di un allenatore. | 2
fettuccia | La fettuccia | attrezzo | cassetta | fatta:sportivo.salto×3 | Tre salti in lungo. | 2
lente | La lente | attrezzo | cassetta | strada:filosofo | Il filosofo vuole guardare da vicino. | 2
binocolo | Il binocolo | attrezzo | cassetta | strada:viaggiatore o regalo:binocolo | Il viaggiatore guarda lontano. | 2
pettine | Il pettine di legno | attrezzo | cassetta | fatta:pettina-foglie×3 o regalo:pettine | Tre mattine a pettinarsi con le dita. | 2
corda | La corda | attrezzo | cassetta | fatta:intreccia-corda | Una corda robusta, intrecciata a mano. | 2
vasetti | I vasetti | attrezzo | cassetta | fatta:raccogli-bacche×5 | Tante bacche da mettere da parte. | 2
spiedo | Lo spiedo | attrezzo | cassetta | fatta:castagne×3 | Tre sere di castagne. | 2
carriola | La carriola | attrezzo | prato | fatta:raccogli-rami×5 + fatta:cerca-sassi×5 | Troppi rami e sassi da portare a mano. | 2
ventaglio | Il ventaglio | attrezzo | cassetta | meteo:caldo30 o regalo:ventaglio | Un giorno di gran caldo. | 2
asciugamano | L'asciugamano | attrezzo | cassetta | fatta:prendere-sole×3 o regalo:asciugamano | Tre pomeriggi al sole. | 2
bottiglia | La bottiglia | attrezzo | cassetta | fatta:rara.bottiglia o tesoro | Una bottiglia arrivata da chissà dove. | 2

# ——— Giochi ———
pallone | Il pallone | gioco | davanti | baratto o regalo:pallone | Lo scoiattolo ne ha uno da scambiare. | 1
aquilone | L'aquilone | gioco | prato | regalo:aquilone o fatta:intreccia-corda + meteo:vento×3 o fatta:intreccia-corda + risorsa:piume:3 | Una corda, un po' di vento o qualche piuma. | 1
soffiabolle | Le bolle di sapone | gioco | davanti | fatta:bucato×3 o regalo:soffiabolle | Dopo tanti bucati avanza il sapone. | 2
flauto | Il flauto di canna | gioco | cassetta | fatta:saluta-uccelli×5 o regalo:flauto | Gli uccelli insegnano a fischiare. | 1
telefono-barattolo | Il telefono di barattolo | gioco | davanti | fatta:chiacchierare-scoiattolo×5 o regalo:telefono-barattolo | Per parlare con lo scoiattolo da lontano. | 2
macchina-cartone | La macchina fotografica di cartone | gioco | cassetta | strada:viaggiatore o regalo:macchina-cartone | Il viaggiatore vuole ricordare tutto. | 2
bici | La bicicletta | gioco | prato | regalo:bici | Solo come regalo. | 2
trottola | La trottola | gioco | davanti | baratto o tesoro o regalo:trottola | Lo scoiattolo, o un tesoro sepolto. | 2
scacchiera | La scacchiera | gioco | davanti | fatta:pensare×10 o regalo:scacchiera | Dieci pensieri profondi. | 2
palline-giocoliere | Le palline da giocoliere | gioco | cassetta | fatta:rara.circo o regalo:palline-giocoliere | Il circo del bosco è passato di qui. | 2
corda-salto | La corda per saltare | gioco | cassetta | fatta:intreccia-corda×2 o regalo:corda-salto | Due corde intrecciate. | 2
bocce-sassi | Le bocce di sasso | gioco | davanti | fatta:cerca-sassi×10 | Dieci volte a cercare sassi belli. | 2
slittino | Lo slittino | gioco | prato | meteo:neve×3 o regalo:slittino | Tre giorni di neve. | 2
barchetta | La barchetta | gioco | davanti | fatta:pozzanghere×3 o regalo:barchetta | Tre salti nelle pozzanghere. | 2
domino-corteccia | Il domino di corteccia | gioco | davanti | fatta:gratta-resina×5 | Tanta corteccia grattata. | 2
yo-yo | Lo yo-yo | gioco | cassetta | baratto o tesoro o regalo:yo-yo | Lo scoiattolo, o un tesoro sepolto. | 2
maschere-teatro | Le maschere del teatro | gioco | cassetta | fatta:storie-fuoco×5 o regalo:maschere-teatro | Cinque storie raccontate al fuoco. | 2
tamburo | Il tamburo di corteccia | gioco | davanti | fatta:suona-flauto×5 o regalo:tamburo | Una melodia vuole un ritmo. | 2
cerchio | Il cerchio | gioco | prato | baratto o tesoro o regalo:cerchio | Lo scoiattolo, o un tesoro sepolto. | 2
girandola | La girandola | gioco | cassetta | meteo:vento×3 o regalo:girandola | Tre giorni di vento. | 2

# ——— Vestiti (armadio: non si vede l'armadio, si vede Pino vestito) ———
berretto | Il berretto di lana | vestito | armadio | meteo:freddo o regalo:berretto | Un giorno di freddo. | c'è
sciarpa | La sciarpa | vestito | armadio | meteo:freddo×5 o regalo:sciarpa | Cinque giorni di freddo. | c'è
occhiali | Gli occhiali da sole | vestito | armadio | meteo:soleCaldo o regalo:occhiali | Un giorno di sole e di caldo. | c'è
berretto-notte | Il berretto da notte | vestito | armadio | iniziale | Ce l'hanno tutti dalla prima notte. | c'è
cravatta | La cravatta | vestito | armadio | strada:imprenditore | Quando capisce di essere un imprenditore. | c'è
basco | Il basco | vestito | armadio | strada:artista | Quando capisce di essere un artista. | c'è
fascia | La fascia da sportivo | vestito | armadio | strada:sportivo | Quando capisce di essere uno sportivo. | c'è
bandana | La bandana | vestito | armadio | strada:furfante | Quando capisce di essere un furfante del bosco. | c'è
zaino | Lo zaino | vestito | armadio | strada:viaggiatore | Quando capisce di essere un viaggiatore. | c'è
piuma | La piuma da poeta | vestito | armadio | strada:poeta | Quando capisce di essere un poeta. | c'è
occhiali-tondi | Gli occhiali tondi | vestito | armadio | strada:filosofo | Quando capisce di essere un filosofo. | c'è
cappello-boss | Il cappello a tesa larga | vestito | armadio | impresa:banda-bosco@2 | La banda del bosco cresce. | 2
giacca-gessata | La giacca gessata | vestito | armadio | impresa:banda-bosco@3 | Il re del bosco si veste elegante. | 2
corona-foglie | La corona di foglie | vestito | armadio | impresa:banda-bosco@3 | Il re del bosco ha bisogno di una corona. | 2
grembiule-pittore | Il grembiule da pittore | vestito | armadio | fatta:artista.colori×5 | Troppe macchie di colore. | 2
impermeabile | L'impermeabile | vestito | armadio | meteo:pioggia×10 o regalo:impermeabile | Dieci giorni di pioggia. | 2
stivali-pioggia | Gli stivali di gomma | vestito | armadio | fatta:pozzanghere×3 o regalo:stivali-pioggia | Tre salti nelle pozzanghere. | 2
cappello-paglia | Il cappello di paglia | vestito | armadio | catena:orto o regalo:cappello-paglia | Il primo orto finito. | 2
guanti-lana | I guanti di lana | vestito | armadio | meteo:neve×3 o regalo:guanti-lana | Tre giorni di neve. | 2
paraorecchie | I paraorecchie | vestito | armadio | meteo:gelo×3 | Tre notti di gelo. | 2
mantello-foglie | Il mantello di foglie | vestito | armadio | fatta:furfante.travestimento×3 | Tre travestimenti da cespuglio. | 2
papillon | Il papillon | vestito | armadio | impresa:atelier-artista@3 o impresa:festival-poesia@3 | Per le grandi serate. | 2
cappello-esploratore | Il cappello da esploratore | vestito | armadio | impresa:agenzia-viaggi@2 o regalo:cappello-esploratore | L'agenzia di viaggi apre. | 2
visiera | La visiera | vestito | armadio | fatta:sportivo.salto×5 | Cinque salti in lungo. | 2
canottiera-numero | La canottiera col numero | vestito | armadio | impresa:club-sportivo@3 o cantiere:bandierine | Il campione ha il suo numero. | 2
poncho | Il poncho | vestito | armadio | meteo:temporale×3 o regalo:poncho | Tre temporali. | 2
maglione | Il maglione | vestito | armadio | meteo:freddo×10 o regalo:maglione | Dieci giorni di freddo. | 2
cappello-cuoco | Il cappello da cuoco | vestito | armadio | catena:forno | Il primo pane sfornato. | 2
ghirlanda-fiori | La ghirlanda di fiori | vestito | armadio | fatta:rara.primo-fiore | Il primo fiore di primavera. | 2
cappello-festa | Il cappellino da festa | vestito | armadio | fatta:rara.festa o fatta:rara.compleanno | La prima festa. | 2
cilindro-circo | Il cilindro del circo | vestito | armadio | fatta:rara.circo×2 | Il circo del bosco, due volte. | 2
calzini-spaiati | I calzini spaiati | vestito | armadio | fatta:poeta.pisolino×5 | Cinque pisolini al posto delle poesie. | 2
vestaglia | La vestaglia | vestito | armadio | fatta:notte-pronto×10 o regalo:vestaglia | Dieci sere a prepararsi per la notte. | 2
pantofole | Le pantofole | vestito | armadio | fatta:sveglia×10 o regalo:pantofole | Dieci risvegli. | 2
lanterna-frontale | La lanterna da testa | vestito | armadio | meteo:nebbia×3 o fatta:furfante.galleria×2 | Per vedere nel buio (e nella nebbia). | 2
mantello-stelle | Il mantello con le stelle | vestito | armadio | fatta:stelle-sera×10 o impresa:scuola-chioma@3 | Dieci sere a guardare le stelle. | 2
costume-righe | Il costume a righe | vestito | armadio | meteo:caldo30×5 o regalo:costume-righe | Cinque giorni di gran caldo. | 2
orecchini-ciliegia | Gli orecchini di bacche | vestito | armadio | fatta:raccogli-bacche×10 | Dieci cesti di bacche. | 2
cappello-pescatore | Il cappello da pescatore | vestito | armadio | fatta:pesca-pozzanghera×3 | Tre pomeriggi a pescare nella pozzanghera. | 2
toga-filosofo | La toga del filosofo | vestito | armadio | impresa:scuola-chioma@2 | La scuola sotto la chioma apre. | 2

# ——— Trofei (icone; sulla mensola dei trofei, se c'è) ———
prima-pioggia | La prima pioggia | trofeo | mensola | meteo:bagnato | Vivere un giorno di pioggia. | icona
primo-temporale | Il primo temporale | trofeo | mensola | meteo:temporale | Restare in piedi durante un temporale. | icona
prima-nebbia | La prima nebbia | trofeo | mensola | meteo:nebbia | Vivere un giorno di nebbia. | icona
prima-neve | La prima neve | trofeo | mensola | meteo:neve | Vedere nevicare sul prato. | icona
primo-gelo | Il primo gelo | trofeo | mensola | meteo:gelo | Passare una notte sotto zero. | icona
gran-caldo | Il gran caldo | trofeo | mensola | meteo:caldo30 | Vivere un giorno da 30 gradi. | icona
una-settimana | Una settimana di diario | trofeo | mensola | giorni:7 | Arrivare al giorno 7. | icona
trenta-giorni | Trenta giorni di diario | trofeo | mensola | giorni:30 | Arrivare al giorno 30. | icona
cento-giorni | Cento giorni di diario | trofeo | mensola | giorni:100 | Arrivare al giorno 100. | icona
dieci-cose | Dieci cose diverse | trofeo | mensola | diverse:10 | Fare dieci attività diverse. | icona
la-strada | La strada presa | trofeo | mensola | strada:* | Capire chi diventare. | icona
primo-regalo | Il primo regalo | trofeo | mensola | regali:1 | Ricevere un regalo e decidere che cosa farne. | icona
prima-chiacchierata | La prima chiacchierata | trofeo | mensola | messaggi:1 | Ricevere il primo messaggio dalla persona. | icona
primo-cantiere | Il primo cantiere | trofeo | mensola | cantieri:1 | Finire un cantiere. | icona
tre-cantieri | Tre cantieri | trofeo | mensola | cantieri:3 | Finire tre cantieri. | icona
prima-impresa | La prima impresa | trofeo | mensola | impresa:*@2 | Far crescere un'impresa fino al secondo livello. | icona
impresa-al-massimo | L'impresa al massimo | trofeo | mensola | impresa:*@3 | Portare un'impresa al terzo livello. | icona
primo-sostenitore | Il primo sostenitore | trofeo | mensola | sostenitori:1 | Convincere un altro albero a seguirlo. | icona
prima-catena | La prima catena | trofeo | mensola | catene:1 | Portare a termine una catena, dal primo passo all'ultimo. | icona
dieci-catene | Dieci catene | trofeo | mensola | catene:10 | Portare a termine dieci catene. | icona
primo-raccolto | Il primo raccolto | trofeo | mensola | fatta:raccoglie-ortaggi | Raccogliere le verdure del suo orto. | icona
un-anno | Un anno di diario | trofeo | mensola | giorni:365 | Arrivare al giorno 365. | icona
cinquanta-cose | Cinquanta cose diverse | trofeo | mensola | diverse:50 | Fare cinquanta attività diverse. | icona
prima-lettera | La prima lettera | trofeo | mensola | lettere:1 | Scrivere la prima lettera della settimana. | icona
dieci-lettere | Dieci lettere | trofeo | mensola | lettere:10 | Scrivere dieci lettere. | icona
nuova-stanza | Una stanza nuova | trofeo | mensola | stanze:2 | Avere una seconda stanza. | icona
compagnia | In compagnia | trofeo | mensola | compagni:1 | Dividere la stanza con un altro albero. | icona
primo-ospite | Il primo ospite | trofeo | mensola | fatta:rara.ospite | Accogliere un ospite inatteso. | icona
settimana-bagnata | La settimana bagnata | trofeo | mensola | meteo:bagnato×7 | Sette giorni di pioggia, anche non di fila. | icona
tutte-le-stagioni | Tutte le stagioni | trofeo | mensola | stagione:primavera + stagione:estate + stagione:autunno + stagione:inverno | Vivere un giorno in ogni stagione. | icona

# ——— Album delle stagioni e rarità ———
primavera | La primavera | stagione | mensola | stagione:primavera | Vivere un giorno di primavera. | icona
estate | L'estate | stagione | mensola | stagione:estate | Vivere un giorno d'estate. | icona
autunno | L'autunno | stagione | mensola | stagione:autunno | Vivere un giorno d'autunno. | icona
inverno | L'inverno | stagione | mensola | stagione:inverno | Vivere un giorno d'inverno. | icona
foglia-oro | La foglia d'oro | rarita | mensola | fatta:rara.foglia-oro | Una foglia speciale, in autunno. | icona
fossile | La foglia di pietra | rarita | mensola | fatta:rara.fossile | Scavando, molto in fondo. | icona
sasso-ruscello | Il sasso del ruscello | rarita | mensola | fatta:rara.ruscello | Una gita d'estate. | icona
desiderio | Il biglietto del desiderio | rarita | mensola | fatta:rara.stelle-cadenti | Una notte d'agosto. | icona
lettera-bottiglia | La lettera nella bottiglia | rarita | mensola | fatta:rara.bottiglia | Arriva da chissà dove. | icona
fiore-pressato | Il fiore pressato | rarita | mensola | fatta:rara.primo-fiore | Il primo fiore di primavera. | icona
fiocco-cristallo | Il fiocco di cristallo | rarita | mensola | fatta:rara.ballo-neve | La prima neve dell'anno. | icona
piuma-gufo | La piuma del gufo | rarita | mensola | fatta:rara.ospite×3 | Tre ospiti inattesi. | icona
nastro-arcobaleno | Il nastro dell'arcobaleno | rarita | mensola | fatta:rara.arcobaleno | La fine dell'arcobaleno (quasi). | icona
candelina | La candelina | rarita | mensola | fatta:rara.compleanno | Il primo compleanno. | icona
scatola-tesoro | La scatola del tesoro | rarita | mensola | fatta:rara.tesoro | Un tesoro sepolto. | icona
`;
