// Catene, cantieri e imprese (docs/stanze-e-vita.md, sezioni 4.2, 6 e 7).
// Gli id dei cantieri di mestieri.ts restano uguali.

// ——— Catene ———
// id | nome | strada (tutti = ogni albero) | passi in ordine (id di attività) | come finisce
// Un passo segnato «gruppo» nelle attività si salta se l'albero è solo nella stanza,
// tranne nelle catene segnate «serve compagnia».
export const CATENE = `
fuoco | Il fuoco | tutti | raccogli-rami accendi-fuoco castagne invita-fuoco storie-fuoco dorme-braci | Si addormenta vicino alle braci; restano il cerchio di sassi e le braci.
orto | L'orto | tutti | zappa-aiuola semina annaffia-orto raccoglie-ortaggi cucina-zuppa | La zuppa dell'orto; l'orto resta e ricresce. Apre l'impresa «L'orto comunitario».
marmellata | La marmellata | tutti | raccogli-bacche schiaccia-bacche cuoce-marmellata riempie-vasetti regala-vasetti | I vasetti regalati allo scoiattolo. Richiede il fuoco.
altalena | L'altalena | tutti | intreccia-fili intreccia-corda monta-altalena altalena | La prima spinta sull'altalena appena appesa.
forno | Il pane | tutti | cerca-sassi muretto-sassi costruisce-forno impasta-pane | Il primo pane sfornato. Apre l'impresa «La cucina del bosco».
luce | La luce della sera | tutti | gratta-resina fa-candele lanterne | Le lanterne accese con le candele fatte da lui. Tre volte: apre il cantiere del faro.
calcio | La squadra | tutti | gioca-palla gruppo.partita gruppo.foto | La foto della squadra. Serve compagnia. Apre l'impresa «La squadra di calcio».
musica | La musica | tutti | saluta-uccelli suona-flauto suona-tamburo | Il primo concerto con gli uccelli del ramo. Apre l'impresa «Il coro».
teatro | Il teatro | tutti | storie-fuoco prova-teatro spettacolo-teatro | Il primo spettacolo. Apre l'impresa «La compagnia del teatro».
quadro | Il quadro | artista | raccogli-bacche artista.colori-bacche artista.dipinge artista.appende artista.mostra | Inaugura la mostra (serve la galleria).
banda | La banda del bosco | furfante | furfante.nasconde furfante.piani furfante.galleria furfante.riunione gruppo.colpo furfante.restituisce | Il colpo del secolo (la mela più rossa) e la restituzione il giorno dopo, perché si sente in colpa.
torneo | Il torneo | sportivo | sportivo.trazioni sportivo.braccio-ferro sportivo.corsa-stanza gruppo.torneo sportivo.premiazione | La premiazione sul podio.
scuola | La scuola | filosofo | filosofo.aforismi filosofo.lezione filosofo.scuola | Fonda la scuola sotto la chioma; se nella stanza ci sono altri alberi, il giorno dopo la prima lezione di gruppo.
negozio | Il negozio | imprenditore | imprenditore.sondaggio imprenditore.riunione imprenditore.negozio | Il nastro tagliato e la festa.
viaggio | Il grande viaggio (immaginario) | viaggiatore | viaggiatore.zaino viaggiatore.mappa viaggiatore.binocolo viaggiatore.tenda viaggiatore.racconti | Racconta un viaggio mai fatto, con tutti i particolari.
serata | La serata di poesia | poeta | poeta.sillabe poeta.rima poeta.versi poeta.serata | La serata di poesia per tutta la stanza.
`;

// ——— Cantieri ———
// id | nome | lascia (id di oggetto) | di (impresa, oppure «libero») | si apre quando (regola) | passi separati da «;»
// I 21 cantieri di mestieri.ts si aprono uno dopo l'altro (carrieraAlGiorno); gli altri quando vale la regola.
export const CANTIERI = `
scrivania | La scrivania | scrivania | ghiande-co | livello:1 | raccoglie i rami per la scrivania; sega e inchioda (e si martella un dito); monta il piano e mette una ghianda sotto la gamba corta; inaugura la scrivania col nastro rosso
insegna | L'insegna | insegna | ghiande-co | livello:2 | disegna le lettere dell'insegna; dipinge l'insegna; appende l'insegna, storta, e la raddrizza
cassaforte | La cassaforte di ghiande | cassaforte | ghiande-co | livello:3 | scava la buca della cassaforte; monta lo sportello della cassaforte; sceglie la combinazione e la dimentica subito
torre-holding | La torre della holding | torre-holding | ghiande-co | cantiere:cassaforte | disegna il progetto su una foglia gigante; impila i ceppi fino al terzo piano; ci mette in cima una bandierina con una ghianda
panchina | La panchina per pensare | panchina | scuola-chioma | livello:1 | sceglie il ramo giusto per la panchina; inchioda la panchina; ci si siede per la prima volta e pensa
biblioteca | La biblioteca di cortecce | biblioteca | scuola-chioma | livello:2 | raccoglie le cortecce; ci scrive sopra i titoli; le mette in ordine, poi le rimette in disordine
cannocchiale | Il cannocchiale di canna | cannocchiale | scuola-chioma | livello:3 | taglia una canna; ci mette una goccia di rugiada come lente; guarda la luna per la prima volta
aula | L'aula sotto la chioma | aula | scuola-chioma | impresa:scuola-chioma@2 + sostenitori:1 | pianta quattro pali; stende un tetto di foglie; mette i banchi di ceppo in fila
osservatorio | L'osservatorio | osservatorio | scuola-chioma | cantiere:cannocchiale | costruisce una torretta di rami; ci monta sopra il cannocchiale; dà un nome a una stella (inventato)
atelier | L'atelier | atelier | atelier-artista | livello:1 | tende un filo tra due rami; appende le tele ad asciugare; dà un nome all'atelier
scultura | La scultura | scultura | atelier-artista | livello:2 | sceglie un ramo da scolpire; scolpisce e si riempie di trucioli; scopre che sembra lo scoiattolo
galleria | La galleria | galleria | atelier-artista | livello:3 | costruisce le cornici; appende i quadri; inaugura la mostra
sbarra | La sbarra per le trazioni | sbarra | club-sportivo | livello:1 | pianta due pali; ci lega la sbarra; prova la prima trazione
ostacoli | Il percorso a ostacoli | ostacoli | club-sportivo | livello:2 | allinea i sassi; monta gli ostacoli di rami; fa il primo giro cronometrato
podio | Il podio | podio | club-sportivo | livello:3 | impila tre ceppi; ci scrive 1, 2, 3; si premia da solo
spogliatoio | Lo spogliatoio | spogliatoio | club-sportivo | impresa:club-sportivo@2 + sostenitori:1 | monta le pareti di corteccia; appende i ganci per le fasce; ci scrive «Vietato l'ingresso agli scoiattoli»
nascondiglio | Il nascondiglio | nascondiglio | banda-bosco | livello:1 | scava una buca segreta; la copre di foglie; dimentica dov'è
mercato | Il banco del mercato nero | mercato | banda-bosco | livello:2 | monta un banco sotto un telo; scrive i prezzi in codice; apre con un sussurro
tesoro | La mappa del tesoro | tesoro | banda-bosco | livello:3 | disegna la mappa; nasconde il tesoro; lo ritrova, dopo molto cercare
covo | Il covo della banda | covo | banda-bosco | impresa:banda-bosco@2 + sostenitori:1 | scava l'ingresso dietro un cespuglio; ci mette un tavolo e una lanterna; inventa la parola d'ordine (e la dimentica)
bacheca | La bacheca delle cartoline | bacheca | agenzia-viaggi | livello:1 | pianta un pannello di corteccia; ci appende le cartoline
cartelli | I cartelli direzionali | cartelli | agenzia-viaggi | livello:2 | taglia le frecce; ci scrive città che non ha mai visto; li pianta tutti nella direzione sbagliata
mongolfiera | La mongolfiera di foglie | mongolfiera | agenzia-viaggi | livello:3 | cuce le foglie; intreccia la cesta; lega le corde; la gonfia; si alza di un palmo e torna giù felice
chiosco-agenzia | Il chiosco dell'agenzia | chiosco-agenzia | agenzia-viaggi | impresa:agenzia-viaggi@2 + sostenitori:1 | monta lo sportello; appende i manifesti di posti inventati; apre con un fischio
amaca | L'amaca | amaca | festival-poesia | livello:1 | intreccia l'amaca; la lega a due rami; ci si sdraia e non si alza più
scrittoio | Lo scrittoio | scrittoio | festival-poesia | livello:2 | trova un ceppo piatto; ci mette il calamaio; scrive la prima riga
filo | Il filo delle poesie | filo | festival-poesia | livello:3 | tende un filo tra i rami; ci appende i versi
palco | Il palco | palco | festival-poesia | impresa:festival-poesia@2 + sostenitori:1 | inchioda le assi; appende una tenda di foglie; prova il microfono (è una ghianda)
spaventapasseri | Lo spaventapasseri | spaventapasseri | orto-comunitario | impresa:orto-comunitario@1 | incrocia due bastoni; gli mette un cappello vecchio; gli dà un nome
serra | La serra | serra | orto-comunitario | impresa:orto-comunitario@2 | monta i telai; ci tende le foglie più trasparenti; ci porta dentro i germogli più piccoli
dispensa | La dispensa | dispensa | cucina-bosco | impresa:cucina-bosco@1 | inchioda le mensole; ci mette i vasetti in fila; scrive le etichette
cucina-aperto | La cucina all'aperto | cucina-aperto | cucina-bosco | impresa:cucina-bosco@2 | costruisce il bancone; appende i mestoli; scrive il menù del giorno (zuppa)
porta-calcio | La porta da calcio | porta-calcio | squadra-calcio | impresa:squadra-calcio@1 | pianta i pali; intreccia la rete; para il primo tiro (dello scoiattolo)
bandierine | Le bandierine | bandierine | squadra-calcio | impresa:squadra-calcio@2 | sceglie i colori della squadra; ritaglia le bandierine; le appende tra i rami
leggio | Il leggio | leggio | coro | impresa:coro@1 | taglia un ramo a forcella; ci appoggia una corteccia piatta; ci mette sopra gli spartiti
casetta-uccelli | La casetta degli uccelli | casetta-uccelli | coro | impresa:coro@2 | inchioda quattro assi; ci fa un buco rotondo; la appende al ramo (gli uccelli entrano nel coro)
sedie-ceppo | Le sedie di ceppo | sedie-ceppo | compagnia-teatro | impresa:compagnia-teatro@1 | taglia i ceppi; li allinea in file; prova tutte le sedie, una per una
teatro | Il teatro del bosco | teatro | compagnia-teatro | impresa:compagnia-teatro@2 | monta il palcoscenico; cuce il sipario di foglie; apre e chiude il sipario dieci volte
casetta | La casetta | casetta | libero | giorni:10 | raccoglie le assi; monta le pareti; mette il tetto (e una finestra tonda)
capanno-attrezzi | Il capanno degli attrezzi | capanno-attrezzi | libero | attrezzi:5 | sceglie il posto; monta il capanno; appende gli attrezzi, ognuno al suo chiodo
pozzo | Il pozzo | pozzo | libero | fatta:raccoglie-rugiada×10 | scava; impila i sassi in tondo; cala il secchio per la prima volta
mulino | Il mulino a vento | mulino | libero | meteo:vento×10 | costruisce la torretta; monta le pale di foglie; aspetta il vento
faro | Il faro | faro | libero | catena:luce×3 | impila i sassi in una torre alta; ci mette in cima una lanterna; la accende per la prima volta
`;

// ——— Imprese ———
export const IMPRESE = [
  {
    id: "ghiande-co",
    nome: "Ghiande & Co.",
    strada: "imprenditore",
    livelli: ["La bancarella", "L'ufficio sotto la chioma", "La holding del bosco"],
    si_apre: "strada:imprenditore",
    cantieri: ["scrivania", "insegna", "cassaforte", "torre-holding"],
    attivita: ["imprenditore.*", "vendere-ombra", "contare-ghiande", "telefonata", "gruppo.bancarella"],
    ruoli: [
      { id: "socio", nome: "Socio", fa: ["imprenditore.riunione", "gruppo.bancarella", "imprenditore.contratti"] },
      { id: "contabile", nome: "Contabile", fa: ["imprenditore.incasso", "contare-ghiande"] },
      { id: "fattorino", nome: "Fattorino", fa: ["imprenditore.pubblicita", "cerca-ghiande"] },
    ],
  },
  {
    id: "scuola-chioma",
    nome: "La scuola sotto la chioma",
    strada: "filosofo",
    livelli: ["Il pensatore del prato", "La scuola sotto la chioma", "L'osservatorio"],
    si_apre: "strada:filosofo",
    cantieri: ["panchina", "biblioteca", "cannocchiale", "aula", "osservatorio"],
    attivita: ["filosofo.*", "pensare", "meditare", "gruppo.lezione"],
    ruoli: [
      { id: "allievo", nome: "Allievo", fa: ["gruppo.lezione", "leggere", "filosofo.formiche"] },
      { id: "assistente", nome: "Assistente", fa: ["filosofo.biblioteca", "filosofo.aforismi"] },
    ],
  },
  {
    id: "atelier-artista",
    nome: "L'atelier",
    strada: "artista",
    livelli: ["Il pittore del prato", "L'atelier all'aperto", "La mostra"],
    si_apre: "strada:artista",
    cantieri: ["atelier", "scultura", "galleria"],
    attivita: ["artista.*", "dipingere", "gruppo.ritratto"],
    ruoli: [
      { id: "modello", nome: "Modello", fa: ["gruppo.ritratto", "artista.ritratto"] },
      { id: "assistente", nome: "Assistente", fa: ["artista.colori-bacche", "artista.colori", "raccogli-bacche"] },
      { id: "critico", nome: "Critico", fa: ["artista.mostra", "pensare"] },
    ],
  },
  {
    id: "club-sportivo",
    nome: "Il club sportivo",
    strada: "sportivo",
    livelli: ["L'atleta del prato", "La palestra all'aperto", "Il campione"],
    si_apre: "strada:sportivo",
    cantieri: ["sbarra", "ostacoli", "podio", "spogliatoio"],
    attivita: ["sportivo.*", "corsa", "allenarsi", "gruppo.torneo", "gruppo.braccio-ferro"],
    ruoli: [
      { id: "compagno-squadra", nome: "Compagno di squadra", fa: ["gruppo.torneo", "sportivo.corsa", "sportivo.stretching"] },
      { id: "allenatore", nome: "Allenatore", fa: ["sportivo.fischietto", "sportivo.corsa-stanza"] },
    ],
  },
  {
    id: "banda-bosco",
    nome: "La banda del bosco",
    strada: "furfante",
    livelli: ["Il ladruncolo di ghiande", "Il mercato nero del bosco", "Il re del bosco"],
    si_apre: "strada:furfante",
    cantieri: ["nascondiglio", "mercato", "tesoro", "covo"],
    attivita: ["furfante.*", "contare-ghiande", "gruppo.colpo"],
    ruoli: [
      { id: "palo", nome: "Palo", fa: ["furfante.guardia", "furfante.spia"] },
      { id: "contabile-ghiande", nome: "Contabile delle ghiande", fa: ["furfante.bottino", "contare-ghiande"] },
      { id: "galoppino", nome: "Galoppino", fa: ["furfante.codice", "furfante.nasconde"] },
    ],
  },
  {
    id: "agenzia-viaggi",
    nome: "L'agenzia di viaggi",
    strada: "viaggiatore",
    livelli: ["Il sognatore di viaggi", "L'agenzia di viaggi del prato", "Il capitano della mongolfiera"],
    si_apre: "strada:viaggiatore",
    cantieri: ["bacheca", "cartelli", "mongolfiera", "chiosco-agenzia"],
    attivita: ["viaggiatore.*", "passeggiata", "studiare-mappa", "fare-valigia"],
    ruoli: [
      { id: "compagno-viaggio", nome: "Compagno di viaggio", fa: ["passeggiata", "viaggiatore.tenda"] },
      { id: "cartografo", nome: "Cartografo", fa: ["viaggiatore.mappa", "studiare-mappa"] },
    ],
  },
  {
    id: "festival-poesia",
    nome: "Il festival di poesia",
    strada: "poeta",
    livelli: ["Il poeta del prato", "Lo scrittoio sotto la chioma", "Il festival di poesia"],
    si_apre: "strada:poeta",
    cantieri: ["amaca", "scrittoio", "filo", "palco"],
    attivita: ["poeta.*", "scrivere-poesia", "gruppo.gara-rime"],
    ruoli: [
      { id: "lettore", nome: "Lettore", fa: ["poeta.recita", "leggere"] },
      { id: "pubblico", nome: "Pubblico", fa: ["gruppo.gara-rime", "tramonto"] },
    ],
  },
  {
    id: "orto-comunitario",
    nome: "L'orto comunitario",
    strada: null,
    livelli: ["L'aiuola", "L'orto", "L'orto comunitario"],
    si_apre: "catena:orto",
    cantieri: ["spaventapasseri", "serra"],
    attivita: ["zappa-aiuola", "semina", "annaffia-orto", "raccoglie-ortaggi", "cucina-zuppa"],
    ruoli: [
      { id: "ortolano", nome: "Ortolano", fa: ["zappa-aiuola", "semina"] },
      { id: "annaffiatore", nome: "Annaffiatore", fa: ["annaffia-orto", "raccoglie-rugiada"] },
    ],
  },
  {
    id: "cucina-bosco",
    nome: "La cucina del bosco",
    strada: null,
    livelli: ["Il fornello", "La cucina", "La trattoria del bosco"],
    si_apre: "catena:forno",
    cantieri: ["dispensa", "cucina-aperto"],
    attivita: ["impasta-pane", "macina-ghiande", "cucina-zuppa", "castagne", "cuoce-marmellata", "gruppo.cena"],
    ruoli: [
      { id: "aiuto-cuoco", nome: "Aiuto cuoco", fa: ["cucina-zuppa", "impasta-pane"] },
      { id: "assaggiatore", nome: "Assaggiatore", fa: ["castagne", "gruppo.cena"] },
    ],
  },
  {
    id: "squadra-calcio",
    nome: "La squadra di calcio",
    strada: null,
    livelli: ["La squadra", "Il campionato del prato", "La coppa del bosco"],
    si_apre: "catena:calcio",
    cantieri: ["porta-calcio", "bandierine"],
    attivita: ["gioca-palla", "allena-squadra", "gruppo.partita", "gruppo.foto"],
    ruoli: [
      { id: "portiere", nome: "Portiere", fa: ["allena-squadra"] },
      { id: "attaccante", nome: "Attaccante", fa: ["gioca-palla", "gruppo.partita"] },
      { id: "tifoso", nome: "Tifoso", fa: ["gruppo.partita"] },
    ],
  },
  {
    id: "coro",
    nome: "Il coro",
    strada: null,
    livelli: ["Le prove", "Il coro del prato", "Il gran concerto"],
    si_apre: "catena:musica",
    cantieri: ["leggio", "casetta-uccelli"],
    attivita: ["suona-flauto", "suona-tamburo", "gruppo.coro", "saluta-uccelli"],
    ruoli: [
      { id: "voce", nome: "Voce", fa: ["gruppo.coro"] },
      { id: "musicista", nome: "Musicista", fa: ["suona-flauto", "suona-tamburo"] },
    ],
  },
  {
    id: "compagnia-teatro",
    nome: "La compagnia del teatro",
    strada: null,
    livelli: ["La compagnia", "Il teatrino", "Il teatro del bosco"],
    si_apre: "catena:teatro",
    cantieri: ["sedie-ceppo", "teatro"],
    attivita: ["prova-teatro", "spettacolo-teatro", "storie-fuoco", "gruppo.storie"],
    ruoli: [
      { id: "attore", nome: "Attore", fa: ["prova-teatro", "spettacolo-teatro"] },
      { id: "suggeritore", nome: "Suggeritore", fa: ["leggere", "prova-teatro"] },
      { id: "pubblico", nome: "Pubblico", fa: ["spettacolo-teatro", "gruppo.storie"] },
    ],
  },
];
