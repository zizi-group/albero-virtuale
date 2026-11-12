// La libreria dei gesti (docs/stanze-e-vita.md, sezione 8).
// Una riga per gesto, campi separati da «|»:
//   id | gruppo | durata in secondi | movimento | con «movimento ridotto» | stato
// gruppo: base (strumenti, non si usano nelle sequenze), movimento, mani, viso, corpo, testa.
// stato: «c'è» = già in src/components/albero/vivo/gesti.ts; «nuovo» = da fare.
// Gli id nuovi seguono lo stile di gesti.ts (camelCase, verbo).

export const GESTI = `
luogo | base | 0 | Traduce il posto della stanza nelle coordinate del busto: non si vede, serve agli altri gesti. | uguale | c'è
mano | base | 0 | Porta una mano a un punto del mondo (cinematica inversa): non si vede da solo. | uguale | c'è
prendi | mani | 0,1 | Prende o lascia un attrezzo, di scatto. | uguale | c'è
cammina | movimento | 0,5-3 | Si gira verso la meta, passo con le braccia a pendolo, poi si rimette di fronte o guarda da una parte. | passo più corto e lento | c'è
siediti | movimento | 0,65 | Si abbassa sul sedere con un piccolo rimbalzo. | senza rimbalzo | c'è
alzati | movimento | 0,55 | Si rialza con una piccola spinta e torna dritto. | senza spinta | c'è
colpi | mani | 0,4 a colpo | Alza l'attrezzo e lo batte N volte, con un piccolo contraccolpo. | colpi più lenti, senza scossa | c'è
sospira | viso | 1 | Gonfia il petto, chiude gli occhi, sbuffa piano. | uguale | c'è
asciugaFronte | mani | 0,9 | Il dorso della mano passa sulla fronte da una parte all'altra. | uguale | c'è
manoSuiFianchi | corpo | 0,4 | Mani sui fianchi, busto un po' indietro: soddisfatto o deciso. | uguale | c'è
saltelloContento | corpo | 0,6 | Un saltello sul posto con le braccia in su. | si alza sulle punte, senza salto | c'è
corre | movimento | 2 | Corsa a ginocchia alte, braccia a pendolo, le foglie che sobbalzano. | cammina svelto | nuovo
saltella | movimento | 1,2 | Tre saltelli di fila spostandosi di lato. | tre passetti | nuovo
salta | movimento | 1 | Si accuccia, salta in alto o in lungo, atterra piegando le ginocchia. | si alza sulle punte e allunga un passo | nuovo
calcia | movimento | 0,6 | Gamba indietro e tiro, la chioma che segue il movimento. | spinge col piede, piano | nuovo
siChina | movimento | 0,6 | Si piega in avanti dal busto, la chioma si inclina. | uguale | nuovo
siSdraia | movimento | 1 | Si stende sul prato sulla schiena, la chioma fa da cuscino. | uguale, più lento | nuovo
siRotola | movimento | 1,5 | Rotola su un fianco e torna su. | si dondola sdraiato | nuovo
indietreggia | movimento | 0,6 | Due passi indietro di colpo, braccia in avanti. | un passo indietro lento | nuovo
siNasconde | movimento | 0,8 | Si accuccia dietro una cosa o si copre di foglie; spuntano solo gli occhi. | si accuccia senza scatto | nuovo
raccoglie | mani | 0,8 | Si china, chiude la mano su una cosa a terra e la porta su. | uguale | nuovo
porta | mani | 1,5 | Tiene una cosa a due mani davanti a sé mentre cammina (va con «cammina»). | uguale | nuovo
posa | mani | 0,6 | Appoggia una cosa a terra o su un ripiano e la sistema con un colpetto. | uguale | nuovo
versa | mani | 1,2 | Inclina un recipiente: un filo d'acqua o di tisana, gocce. | uguale | nuovo
mescola | mani | 1,5 | Gira il cucchiaio in tondo in una pentola o una ciotola, vapore. | uguale | nuovo
martella | mani | 1,2 | Variante di «colpi» col martello: il chiodo entra a ogni colpo. | colpi lenti | nuovo
sega | mani | 1,5 | Avanti e indietro col braccio, trucioli che cadono. | uguale, meno trucioli | nuovo
scava | mani | 1,5 | Con la pala o le mani, la terra che vola dietro. | la terra si ammucchia accanto, senza volare | nuovo
zappa | mani | 1,5 | Alza la zappa sopra la testa e la abbassa. | la alza a metà | nuovo
rastrella | mani | 1,5 | Tira il rastrello verso di sé a colpi lunghi, le foglie si ammucchiano. | uguale | nuovo
spazza | mani | 1,2 | Scopa a destra e a sinistra, una nuvoletta di polvere. | uguale | nuovo
strofina | mani | 1 | Mani che sfregano su una superficie o tra loro (c'è già come movimento del braccio nelle pose). | uguale | nuovo
strizza | mani | 0,8 | Torce un panno o una manciata di bacche, gocce che cadono. | uguale | nuovo
intreccia | mani | 1,5 | Mani vicine che girano una sull'altra, il filo si allunga. | uguale | nuovo
gratta | mani | 0,8 | Le dita grattano la corteccia, la sua o quella di un ceppo. | uguale | nuovo
impila | mani | 1,2 | Posa una cosa sopra l'altra con cura; la pila oscilla un attimo. | la pila non oscilla | nuovo
lancia | mani | 0,7 | Braccio indietro e poi avanti, la cosa vola via. | lancio corto | nuovo
afferra | mani | 0,5 | Allunga la mano di scatto e chiude: prende al volo. | allunga piano | nuovo
sventola | mani | 1 | Agita un ventaglio, una foglia o una bandierina. | uguale | nuovo
dipinge | mani | 1,5 | Pennellate sulla tela (oggi «pennella» nelle pose). | uguale | nuovo
scrive | mani | 1,5 | Matita sul quaderno a piccoli scatti (oggi «scrive» nelle pose). | uguale | nuovo
timbra | mani | 0,6 | Alza il timbro e lo batte: tac! | senza scossa | nuovo
indica | mani | 0,6 | Braccio teso verso un punto, il dito di foglia. | uguale | nuovo
applaude | mani | 1 | Mani che battono davanti al petto. | uguale | nuovo
saluta | mani | 1 | Mano alzata che oscilla (oggi «saluta» nelle pose). | uguale | nuovo
contaDita | mani | 1,5 | Alza le dita una alla volta muovendo le labbra (oggi «conta» nelle pose). | uguale | nuovo
stringeMano | mani | 0,8 | Allunga la mano e la scuote con un altro albero o con la zampa dello scoiattolo. | uguale | nuovo
brinda | mani | 0,8 | Alza la tazza verso qualcuno, cin. | uguale | nuovo
pettina | mani | 1,2 | Passa un pettine di legno tra le foglie della chioma. | uguale | nuovo
tira | mani | 1,2 | Due mani su una corda, tira puntando i piedi. | tira senza puntare i piedi | nuovo
esamina | mani | 1 | Avvicina una cosa agli occhi e la gira. | uguale | nuovo
soffia | viso | 0,8 | Guance gonfie, bocca a O, soffio: bolle, fuoco, tisana. | uguale | nuovo
beve | viso | 1 | Porta la tazza alla bocca, inclina, sospiro contento. | uguale | nuovo
assaggia | viso | 0,8 | Avvicina alla bocca, mastica, occhi in su: buono o no. | uguale | nuovo
annusa | viso | 0,8 | Si china verso una cosa, il naso fremente. | uguale | nuovo
sbadiglia | viso | 1,2 | Bocca larghissima, occhi chiusi, braccia in su. | braccia a metà | nuovo
starnutisce | viso | 0,8 | Testa indietro, «etciù», le foglie tremano. | senza scossa | nuovo
fischia | viso | 1 | Bocca a O piccola, una nota che esce. | uguale | nuovo
canta | viso | 2 | Bocca che si apre a tempo, note che salgono. | uguale | nuovo
ride | viso | 1 | Occhi chiusi felici, il busto sobbalza. | sorride, senza sobbalzi | nuovo
sbircia | viso | 0,8 | Si sporge di lato con un occhio solo. | gira solo la testa | nuovo
russa | viso | 2 | Occhi chiusi, petto su e giù, «zzz». | uguale | nuovo
siStiracchia | corpo | 1,2 | Braccia in su, si allunga sulle punte, scricchiolio. | senza punte | nuovo
dondola | corpo | 2 | Avanti e indietro: su un'altalena, un'amaca o sul posto. | dondolio piccolo | nuovo
trema | corpo | 1 | Piccole scosse, per il freddo, la paura o lo sforzo. | si stringe nelle spalle, senza scosse | nuovo
siScrolla | corpo | 0,8 | Scuote la chioma come un cane bagnato, gocce. | si liscia le foglie con le mani | nuovo
balla | corpo | 2 | Passi di danza, un giro su se stesso, braccia in su. | ondeggia a tempo senza girare | nuovo
siInchina | corpo | 0,8 | Si piega in avanti con una mano sul petto. | uguale | nuovo
aspetta | corpo | 2 | Fermo, batte un piede, si guarda intorno. | senza battere il piede | nuovo
legge | testa | 2 | Tiene il libro aperto, gli occhi scorrono, gira la pagina. | uguale | nuovo
guardaSu | testa | 1 | Testa e occhi verso il cielo o i rami. | uguale | nuovo
annuisce | testa | 0,6 | Testa su e giù, convinto. | uguale | nuovo
scuoteTesta | testa | 0,6 | Testa a destra e a sinistra. | uguale | nuovo
pensa | testa | 1,5 | Mano al mento, occhi in alto, una piccola nuvoletta. | uguale | nuovo
`;
