# I gesti di Linfa

**74 gesti**: 11 ci sono già in `src/components/albero/vivo/gesti.ts` (2 sono strumenti), 63 nuovi.
Il progetto (`docs/stanze-e-vita.md`, sezione 8) ne chiede circa 50; i 13 in più servono al catalogo
delle attività (leggere, guardare in su, annuire, pensare, brindare, tirare una corda…).

> File generato da `node docs/catalogo/genera.mjs` a partire da `docs/catalogo/fonte/`. Si modifica la fonte, poi si rigenera.

- **Durata**: secondi del gesto da solo, proposta da tarare nel browser. Un'attività ne mette in fila 3-4 e gira a ciclo in 8-15 s (sezione 3.1).
- **Movimento ridotto**: che cosa fa quando il sistema chiede meno movimento (niente salti, scosse né corse; sezione 8).
- **Usato da**: in quante attività del catalogo compare.
- **Fase 2**: i 20 gesti nuovi più usati, da fare per primi.
- Gli id nuovi seguono lo stile di `gesti.ts` (camelCase, verbo). «strofina», «dipinge», «scrive», «saluta» e «contaDita» esistono già come movimenti del braccio nelle pose di `azioni.ts` (`anim`): diventano gesti veri.

## Strumenti (non si vedono da soli)

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `luogo` | 0 | Traduce il posto della stanza nelle coordinate del busto: non si vede, serve agli altri gesti. | uguale | c'è | — |
| `mano` | 0 | Porta una mano a un punto del mondo (cinematica inversa): non si vede da solo. | uguale | c'è | — |

## Movimento

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `cammina` | 0,5-3 | Si gira verso la meta, passo con le braccia a pendolo, poi si rimette di fronte o guarda da una parte. | passo più corto e lento | c'è | 13 |
| `siediti` | 0,65 | Si abbassa sul sedere con un piccolo rimbalzo. | senza rimbalzo | c'è | 14 |
| `alzati` | 0,55 | Si rialza con una piccola spinta e torna dritto. | senza spinta | c'è | 2 |
| `corre` | 2 | Corsa a ginocchia alte, braccia a pendolo, le foglie che sobbalzano. | cammina svelto | nuovo · **fase 2** | 17 |
| `saltella` | 1,2 | Tre saltelli di fila spostandosi di lato. | tre passetti | nuovo | 3 |
| `salta` | 1 | Si accuccia, salta in alto o in lungo, atterra piegando le ginocchia. | si alza sulle punte e allunga un passo | nuovo | 8 |
| `calcia` | 0,6 | Gamba indietro e tiro, la chioma che segue il movimento. | spinge col piede, piano | nuovo | 2 |
| `siChina` | 0,6 | Si piega in avanti dal busto, la chioma si inclina. | uguale | nuovo · **fase 2** | 15 |
| `siSdraia` | 1 | Si stende sul prato sulla schiena, la chioma fa da cuscino. | uguale, più lento | nuovo | 8 |
| `siRotola` | 1,5 | Rotola su un fianco e torna su. | si dondola sdraiato | nuovo | 0 |
| `indietreggia` | 0,6 | Due passi indietro di colpo, braccia in avanti. | un passo indietro lento | nuovo | 8 |
| `siNasconde` | 0,8 | Si accuccia dietro una cosa o si copre di foglie; spuntano solo gli occhi. | si accuccia senza scatto | nuovo | 11 |

## Mani

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `prendi` | 0,1 | Prende o lascia un attrezzo, di scatto. | uguale | c'è | 10 |
| `colpi` | 0,4 a colpo | Alza l'attrezzo e lo batte N volte, con un piccolo contraccolpo. | colpi più lenti, senza scossa | c'è | 2 |
| `asciugaFronte` | 0,9 | Il dorso della mano passa sulla fronte da una parte all'altra. | uguale | c'è | 9 |
| `raccoglie` | 0,8 | Si china, chiude la mano su una cosa a terra e la porta su. | uguale | nuovo · **fase 2** | 16 |
| `porta` | 1,5 | Tiene una cosa a due mani davanti a sé mentre cammina (va con «cammina»). | uguale | nuovo | 10 |
| `posa` | 0,6 | Appoggia una cosa a terra o su un ripiano e la sistema con un colpetto. | uguale | nuovo · **fase 2** | 28 |
| `versa` | 1,2 | Inclina un recipiente: un filo d'acqua o di tisana, gocce. | uguale | nuovo | 7 |
| `mescola` | 1,5 | Gira il cucchiaio in tondo in una pentola o una ciotola, vapore. | uguale | nuovo | 6 |
| `martella` | 1,2 | Variante di «colpi» col martello: il chiodo entra a ogni colpo. | colpi lenti | nuovo | 3 |
| `sega` | 1,5 | Avanti e indietro col braccio, trucioli che cadono. | uguale, meno trucioli | nuovo | 1 |
| `scava` | 1,5 | Con la pala o le mani, la terra che vola dietro. | la terra si ammucchia accanto, senza volare | nuovo | 5 |
| `zappa` | 1,5 | Alza la zappa sopra la testa e la abbassa. | la alza a metà | nuovo | 2 |
| `rastrella` | 1,5 | Tira il rastrello verso di sé a colpi lunghi, le foglie si ammucchiano. | uguale | nuovo | 1 |
| `spazza` | 1,2 | Scopa a destra e a sinistra, una nuvoletta di polvere. | uguale | nuovo | 3 |
| `strofina` | 1 | Mani che sfregano su una superficie o tra loro (c'è già come movimento del braccio nelle pose). | uguale | nuovo | 11 |
| `strizza` | 0,8 | Torce un panno o una manciata di bacche, gocce che cadono. | uguale | nuovo | 3 |
| `intreccia` | 1,5 | Mani vicine che girano una sull'altra, il filo si allunga. | uguale | nuovo | 3 |
| `gratta` | 0,8 | Le dita grattano la corteccia, la sua o quella di un ceppo. | uguale | nuovo | 5 |
| `impila` | 1,2 | Posa una cosa sopra l'altra con cura; la pila oscilla un attimo. | la pila non oscilla | nuovo | 10 |
| `lancia` | 0,7 | Braccio indietro e poi avanti, la cosa vola via. | lancio corto | nuovo | 11 |
| `afferra` | 0,5 | Allunga la mano di scatto e chiude: prende al volo. | allunga piano | nuovo · **fase 2** | 15 |
| `sventola` | 1 | Agita un ventaglio, una foglia o una bandierina. | uguale | nuovo | 7 |
| `dipinge` | 1,5 | Pennellate sulla tela (oggi «pennella» nelle pose). | uguale | nuovo | 7 |
| `scrive` | 1,5 | Matita sul quaderno a piccoli scatti (oggi «scrive» nelle pose). | uguale | nuovo · **fase 2** | 20 |
| `timbra` | 0,6 | Alza il timbro e lo batte: tac! | senza scossa | nuovo | 1 |
| `indica` | 0,6 | Braccio teso verso un punto, il dito di foglia. | uguale | nuovo · **fase 2** | 46 |
| `applaude` | 1 | Mani che battono davanti al petto. | uguale | nuovo · **fase 2** | 17 |
| `saluta` | 1 | Mano alzata che oscilla (oggi «saluta» nelle pose). | uguale | nuovo · **fase 2** | 13 |
| `contaDita` | 1,5 | Alza le dita una alla volta muovendo le labbra (oggi «conta» nelle pose). | uguale | nuovo · **fase 2** | 21 |
| `stringeMano` | 0,8 | Allunga la mano e la scuote con un altro albero o con la zampa dello scoiattolo. | uguale | nuovo | 7 |
| `brinda` | 0,8 | Alza la tazza verso qualcuno, cin. | uguale | nuovo | 2 |
| `pettina` | 1,2 | Passa un pettine di legno tra le foglie della chioma. | uguale | nuovo | 1 |
| `tira` | 1,2 | Due mani su una corda, tira puntando i piedi. | tira senza puntare i piedi | nuovo | 8 |
| `esamina` | 1 | Avvicina una cosa agli occhi e la gira. | uguale | nuovo · **fase 2** | 26 |

## Viso

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `sospira` | 1 | Gonfia il petto, chiude gli occhi, sbuffa piano. | uguale | c'è | 18 |
| `soffia` | 0,8 | Guance gonfie, bocca a O, soffio: bolle, fuoco, tisana. | uguale | nuovo · **fase 2** | 13 |
| `beve` | 1 | Porta la tazza alla bocca, inclina, sospiro contento. | uguale | nuovo | 4 |
| `assaggia` | 0,8 | Avvicina alla bocca, mastica, occhi in su: buono o no. | uguale | nuovo | 9 |
| `annusa` | 0,8 | Si china verso una cosa, il naso fremente. | uguale | nuovo | 5 |
| `sbadiglia` | 1,2 | Bocca larghissima, occhi chiusi, braccia in su. | braccia a metà | nuovo | 10 |
| `starnutisce` | 0,8 | Testa indietro, «etciù», le foglie tremano. | senza scossa | nuovo | 2 |
| `fischia` | 1 | Bocca a O piccola, una nota che esce. | uguale | nuovo | 4 |
| `canta` | 2 | Bocca che si apre a tempo, note che salgono. | uguale | nuovo | 4 |
| `ride` | 1 | Occhi chiusi felici, il busto sobbalza. | sorride, senza sobbalzi | nuovo · **fase 2** | 33 |
| `sbircia` | 0,8 | Si sporge di lato con un occhio solo. | gira solo la testa | nuovo · **fase 2** | 14 |
| `russa` | 2 | Occhi chiusi, petto su e giù, «zzz». | uguale | nuovo | 8 |

## Testa

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `legge` | 2 | Tiene il libro aperto, gli occhi scorrono, gira la pagina. | uguale | nuovo · **fase 2** | 14 |
| `guardaSu` | 1 | Testa e occhi verso il cielo o i rami. | uguale | nuovo · **fase 2** | 20 |
| `annuisce` | 0,6 | Testa su e giù, convinto. | uguale | nuovo · **fase 2** | 22 |
| `scuoteTesta` | 0,6 | Testa a destra e a sinistra. | uguale | nuovo · **fase 2** | 14 |
| `pensa` | 1,5 | Mano al mento, occhi in alto, una piccola nuvoletta. | uguale | nuovo | 10 |

## Corpo

| Gesto | Durata (s) | Movimento | Con movimento ridotto | Stato | Usato da |
|---|---|---|---|---|---|
| `manoSuiFianchi` | 0,4 | Mani sui fianchi, busto un po' indietro: soddisfatto o deciso. | uguale | c'è | 13 |
| `saltelloContento` | 0,6 | Un saltello sul posto con le braccia in su. | si alza sulle punte, senza salto | c'è | 14 |
| `siStiracchia` | 1,2 | Braccia in su, si allunga sulle punte, scricchiolio. | senza punte | nuovo | 4 |
| `dondola` | 2 | Avanti e indietro: su un'altalena, un'amaca o sul posto. | dondolio piccolo | nuovo · **fase 2** | 12 |
| `trema` | 1 | Piccole scosse, per il freddo, la paura o lo sforzo. | si stringe nelle spalle, senza scosse | nuovo | 3 |
| `siScrolla` | 0,8 | Scuote la chioma come un cane bagnato, gocce. | si liscia le foglie con le mani | nuovo | 4 |
| `balla` | 2 | Passi di danza, un giro su se stesso, braccia in su. | ondeggia a tempo senza girare | nuovo | 5 |
| `siInchina` | 0,8 | Si piega in avanti con una mano sul petto. | uguale | nuovo · **fase 2** | 12 |
| `aspetta` | 2 | Fermo, batte un piede, si guarda intorno. | senza battere il piede | nuovo | 2 |
