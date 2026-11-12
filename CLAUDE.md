@AGENTS.md

# Linfa (albero-virtuale)

Linfa è un albero digitale in abbonamento: la persona pianta un albero con un
carattere tutto suo, che vive con il meteo vero della sua città, decide da solo
chi diventare (filosofo, imprenditore, artista, sportivo, furfante del bosco,
viaggiatore, poeta pigro), scrive lettere per email e risponde ai messaggi.
Il progetto è spiegato nel PDF «Linfa — il progetto spiegato in due pagine».
Oggi è una **demo locale**: niente pagamenti, email solo nella casella di prova.

Tutto in italiano: codice (nomi), testi, commit, report.

## Stack

- Next.js 16 (App Router, Turbopack, Tailwind 4) in `src/`. Il middleware in
  Next 16 si chiama **proxy** (`src/proxy.ts`). Prima di usare un'API di Next
  leggi `node_modules/next/dist/docs/` (vedi `AGENTS.md`). `cacheComponents`
  è spento: modello di cache classico.
- Supabase **in locale** con la CLI (Docker): Auth con link magico e codice a
  6 cifre, Postgres con RLS, Mailpit per le email.
- Claude tramite `@anthropic-ai/sdk`, due modelli (Federico, 11/11/2026, per il
  costo): le giornate dell'albero su `claude-haiku-5-5` (`LINFA_AI_MODEL_GIORNATE`),
  lettere e risposte su `claude-opus-5-5` (`LINFA_AI_MODEL`). Fallback lato server
  (`server-side-fallback-2026-07-01`, `fallbacks: "default"`) solo dove esistono:
  Haiku 5.5 non li ha e il parametro non si manda. Output strutturati con zod
  (`client.beta.messages.parse` + `zodOutputFormat`). Si sceglie con
  `compito: "giornata" | "scrittura"` in `chiediStrutturato` (`src/lib/motore/ai.ts`).
- Meteo da Open-Meteo, gratuito e senza chiave.

## Avvio in locale

1. Docker Desktop acceso. Nella Bash di Claude il comando `docker` non è nel
   PATH: `export PATH="/c/Program Files/Docker/Docker/resources/bin:$PATH"`.
2. `supabase start` (applica le migrazioni di `supabase/migrations`).
3. `.env` con `ANTHROPIC_API_KEY` (già presente, escluso da git). `.env.local`
   con le chiavi di Supabase locale: si rigenera da `supabase status -o env`
   (vedi README). Mai stampare i valori.
4. `npm run dev` → http://localhost:3000. Email di prova: http://127.0.0.1:54324.
   Studio di Supabase: http://127.0.0.1:54323.

## Comandi

| Comando | Che cosa fa |
|---|---|
| `npm run dev` | Sito in sviluppo |
| `npm run build` | Build di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | Tipi delle route + `tsc` |
| `npm run notte` | Motore notturno: un giorno per ogni albero, poi il calendario (collezione, cartolina della settimana, lettere, fine del mese) |
| `npm run simula -- --giorni 7 [--lettera]` | Albero in memoria, senza database: per provare prompt e motore |
| `npm run simula -- --alberi 3 --giorni 60 [--senza-ai] [--prove 300]` | Più alberi nella stessa stanza: imprese, contagio, attività di gruppo; `--prove` dà le statistiche senza AI |
| `supabase gen types typescript --local > src/lib/supabase/database.types.ts` | Tipi dopo una migrazione |

## Dove sta cosa

- `src/lib/albero/`: vocabolario visivo e crescita (`tipi.ts`), libreria delle
  23 azioni con la compatibilità col meteo (`azioni.ts`), tratti e strade
  (`strade.ts`), regole delle abitudini col meteo (`scena.ts`), catalogo dei
  regali e quando compaiono nella scena (`regali.ts`), collezione di trofei,
  oggetti, vestiti e stagioni con le sue regole (`collezione.ts`).
- `src/lib/piani.ts`: i tre pacchetti (`albero`, `premium-annuale`,
  `premium-mensile`) e `isPremium`, usati dalla demo; i loro prezzi e testi
  per il giardino sono in `src/components/landing/Pacchetti.tsx`.
- Pagina iniziale (vetrina, 0.1): `src/app/page.tsx`, stile in
  `src/app/vetrina.css` (tutto sotto `.vetrina`), pezzi in
  `src/components/vetrina/` e immagini in `public/vetrina/`. Mostra i pacchetti
  nuovi Albero, Famiglia, Foresta (`PianiVetrina.tsx`), che la demo non ha
  ancora: i bottoni portano alla semina. Bozza grafica di riferimento in
  `docs/bozze/landing-foresta.html`. Il giardino resta in 2D.
- `src/components/albero/`: `Albero.tsx` (l'albero nel suo SVG) e `Scena.tsx`
  (con il cielo) usano il pupazzo animato e interattivo di `vivo/`: scenette,
  strato di vita, clic, trascinamento, fumetti. Motore a fotogrammi senza
  librerie, CSS con prefisso `lv-` in `vivo/vivo.css`. Come si muove, scenetta
  per scenetta: `docs/animazioni-albero.md`. Le classi `l-*` di `globals.css`
  servono solo al cielo della `Scena`. Il disegno fermo del personaggio sta in
  `vivo/figura.tsx` (senza hook): lo animano `AlberoVivo` nel browser e
  `fermo.ts` lo trasforma in SVG per le immagini fatte sul server.
- **Progetto 0.2** (Federico, 12/11/2026): `docs/stanze-e-vita.md`. Il gioco
  si fa in 2D (la stanza); il 3D servirà per la vista d'insieme «la tua
  foresta» e per la foresta del club. Fase 1 fatta: il giardino è tornato al 2D.
- **La giornata a fasce** (`src/lib/albero/giornata.ts`): per mattina, giorno,
  pomeriggio e sera 3 attività pesate (strada, umore, meteo) che non si
  ripetono rispetto ai due giorni prima; l'azione dell'AI è la principale di
  una fascia, salvo se l'ha già scelta di recente. Il giardino mostra quella
  della fascia di adesso (a turno ogni 45 minuti) e durante la visita passa
  alla successiva ogni 3,5 minuti. Deterministica: seme = id + giorno.
- **Imprese e contagio** (fase 4 della 0.2, motore puro): `imprese.ts`
  (imprese principali dai mestieri e libere dalle catene, capo, sostenitori,
  ruoli, crescita, `fattoreImpresa` ×4 per i pesi della giornata),
  `contagio.ts` (`giornoDellaStanza`: contagio, abbandoni, punti alla strada,
  cambio di strada spegnibile con `CAMBIO_STRADA.attivo`, rivalità),
  `gruppo.ts` (attività di gruppo). Carisma e influenzabilità in `strade.ts`
  (`nascita`), colonne `trees.carisma` e `trees.influenzabilita`, tabelle
  `ventures` e `venture_members`. Numeri e prove: sezione 7.3 di
  `docs/stanze-e-vita.md`.
- **Voci dell'albero** (`EVENTO_VOCE` in `vivo/AlberoVivo.tsx`): il giardino
  lo fa parlare (fumetto) o pensare (nuvoletta con le bollicine). La
  nuvoletta compare ogni 35-75 s (che cosa farà dopo, il suo umore).
  Rispondere al buongiorno manda `linfa-decisione` (`Buongiorno.tsx`): zoom
  su di lui, risponde in un fumetto, poi è pensieroso 5 minuti
  (`localStorage` `linfa-pensieroso`). Gli strumenti della demo provano
  umore, azione e fascia con `linfa-prova`.
- **Motore 3D** (non più nel giardino, tenuto per le foreste della 0.2):
  `src/components/giardino3d/Scena3D.tsx` carica il motore three.js di
  `src/lib/giardino3d/` (JavaScript con JSDoc; API in
  `src/components/giardino3d/tipi.ts`) con modelli e texture in
  `public/giardino3d/`: 30 modelli in 16 specie scelti dal seme, visi per i 9
  umori, routine e le 23 azioni. Guida: `src/lib/giardino3d/README.md`;
  pagina di prova `prototipi/foresta-3d/giardino.html`.
- `src/lib/motore/`: `personaggio.ts` (prompt di sistema fisso, eventi),
  `vita.ts` (giornate: parte pura, gira anche in memoria), `scritture.ts`
  (lettere e risposte), `servizio.ts` (collegato a database ed email),
  `email.ts` (SMTP di Mailpit), `ai.ts` (unico punto che chiama Claude),
  `extra.ts` (extra mensili del Premium: mesi dell'albero, regalo del mese,
  riepilogo, cambio pacchetto della demo), `calendario.ts` (quello che succede
  dopo le giornate: `viviGiorni` = giornate + collezione, lettera di metà mese,
  settimana, fine del mese).
- `src/lib/cartolina/`: caratteri per `next/og` e la cartolina della settimana
  (`settimana.tsx`, PNG 1200×900 allegato all'email). Il paesaggio delle
  cartoline è `src/app/giardino/mese/[numero]/cartolina/scena.ts`.
- `src/app/`: `/` landing, `/accedi`, `/auth/conferma`, `/auth/esci`,
  `/pianta`, `/giardino` (con gli strumenti della demo e `?meteo=`),
  `/giardino/lettere/[id]`, `/giardino/mese/[numero]` (riepilogo illustrato
  del mese) con `cartolina` (PNG con `next/og`, `?formato=storia|sfondo`,
  `&scarica=1`), `/catalogo`.
- `supabase/`: `config.toml`, migrazioni, template dell'email di accesso.

## Regole

- Le scritture nel database passano solo dal server con la chiave segreta
  (`createAdminClient`), dopo aver verificato che l'albero è della persona
  collegata. La persona legge solo le sue righe (RLS).
- Il personaggio ha regole di tono fisse in `personaggio.ts`: ironico e
  innocuo, nessuna strada delude, niente persone o marchi reali, politica,
  religione o contenuti inadatti. Si cambiano lì, non nei singoli prompt.
- L'AI sceglie solo azioni della libreria: una nuova azione si aggiunge in
  `azioni.ts` (posa) e, se serve, con oggetti o indumenti nuovi in
  `vivo/disegni.tsx` e `vivo/figura.tsx`; la sua scenetta in
  `vivo/scenette.ts` (senza scenetta usa la posa viva con gesti a sorpresa).
- **Extra del Premium** (regalo, riepilogo, cartolina): solo per i piani
  Premium; chi ha l'Albero vede un invito garbato, mai un blocco. Il mese
  dell'albero dura 30 giorni vissuti (`tree_months`); nella demo «Inizio mese»
  lo chiude subito. L'albero decide da solo che cosa fare del regalo; i regali
  entrano nei prompt (`StatoAlbero.regali`) e non cambiano mai la strada.
- **Il buongiorno** (tutti i piani): ogni mattina una domanda breve con 2-3
  risposte da un tocco (`morning_questions`, una per il prossimo giorno da
  vivere). La scrive la giornata precedente nella stessa chiamata ad Haiku
  (`viviGiornate`), oppure `scriviBuongiorno` alla semina e con «Mattina» della
  demo. La risposta arriva all'AI come consiglio: l'albero decide da solo.
- **Il calendario** (`calendario.ts`, dopo ogni giornata): ogni 7 giorni la
  cartolina della settimana per email a tutti (`tree_weeks`, Haiku per nota e
  momento migliore, immagine con `next/og` allegata nell'email); lettera ogni
  30 giorni per tutti a fine mese, e per il Premium anche quella di metà mese
  al 15° giorno (`meta-mese`): una ogni 15 giorni. Lettere sempre su Opus.
- **Collezione** (tutti i piani): trofei, oggetti, vestiti e album delle
  stagioni si sbloccano vivendo, mai comprando (`unlocks`). Le regole sono nel
  codice (`collezione.ts`), mai decise dall'AI; le novità entrano una volta nel
  prompt delle giornate (`ContestoVita.novita`) perché l'albero possa nominarle
  nel diario, poi `mentioned = true`.
- **Script fuori da Next** (`npm run notte`): i file con JSX usati dal motore
  (`src/lib/cartolina/settimana.tsx`) hanno il pragma `@jsxRuntime automatic`,
  altrimenti tsx usa il JSX classico e `next/og` si ferma su «React is not defined».
- **Crescita**: l'albero nasce germoglio e diventa adulto in
  `GIORNI_PER_CRESCERE` giorni (`tipi.ts`, oggi 90). Per l'albero vero si passa
  `giorni` ad `Albero`/`Scena`; senza `giorni` vale la grandezza tipica dello
  stadio (illustrazioni del sito).
- Il sistema con «movimento ridotto» ferma pioggia, neve e nuvole; il
  personaggio tiene solo i movimenti lievi (niente salti, scosse né corse).
  Sul PC di sviluppo Windows ha gli effetti di animazione spenti: il browser
  chiede movimento ridotto. L'interruttore «Animazioni complete» del sito
  (`<html data-movimento="pieno">`) lo scavalca, albero compreso.

## Branch e versioni

Regola comune ai repository di ZIZI Group (Federico, 24/10/2026). Il testo
completo è nel file di regia `Progetti lavorativi GitHub/CLAUDE.md`, che esiste
solo sul PC di Federico: questa sezione basta per lavorare anche dalle sessioni
cloud e dalle routine.

- **Versione in corso: 0.1.2** (12/11/2026: Pino vivo nel giardino 2D, fase 1 della 0.2; tag `v0.1`, `v0.1.1`). La copia di `main` di una
  versione è un branch con il solo numero (per esempio `1.0`): non ci si fanno
  commit. Le versioni maggiori e minori le decide solo Federico.
- **Versione di correzione dopo ogni merge** (Federico, 26/10/2026): ogni
  lavoro unito a `main` apre la versione successiva (`1.0` → `1.0.1` →
  `1.0.2`), senza chiedere. Claude scrive qui il numero nuovo (commit diretto
  su `main`), crea da `main` il branch con il solo numero e lo pubblica, poi
  trasforma il branch della versione precedente nel tag `v<numero>` e lo
  cancella. I commit diretti di sola documentazione non aprono una versione.
- **Branch di lavoro**: `<versione>-<descrizione-breve>`, per esempio
  `1.0-fix-login`. Se lo strumento crea il branch con un altro nome
  (`claude/<nome>`), Claude lo rinomina prima del primo push con
  `git branch -m`; se il push con il nome giusto non è permesso, mette la
  versione all'inizio del titolo della pull request (`[1.0] …`).
- **Durata massima: 7 giorni** dall'ultimo commit. Dopo il merge nel branch
  principale il branch si cancella subito, in locale e su GitHub, insieme al
  suo worktree.
- **Pulizia a ogni lavoro**: prima di aprire un branch nuovo, Claude esegue
  `git fetch --prune` e cancella i branch di lavoro con l'ultimo commit di più
  di 7 giorni fa. Un branch non ancora unito al branch principale si conserva
  prima con il tag `archivio/<nome-branch>`.
- **Non si toccano mai** `main`, il branch predefinito, i branch di versione e
  i tag.
- **Push e merge**: Claude chiede prima di fare push e prima di fare merge su
  `main`.
