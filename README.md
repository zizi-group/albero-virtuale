# Linfa

**Compri un albero. Non sai chi diventerà.**

Linfa è un albero digitale tutto tuo, con un carattere e una vita propria. Vive con
il meteo vero della tua città, ti scrive lettere, risponde ai tuoi messaggi e
decide da solo che strada prendere. Questa è la prima demo, che gira tutta in locale.

## Che cosa c'è nella demo

- **Sito** (`/`): la presentazione del prodotto, con la scena animata che passa
  da pioggia a sole, freddo e notte.
- **Accesso** (`/accedi`): link magico o codice a 6 cifre, con Supabase in locale.
- **Semina** (`/pianta`): nome dell'albero, il tuo nome, città e piano (nessun
  pagamento). L'albero nasce con tratti a caso e ti scrive subito la prima lettera.
- **Giardino** (`/giardino`): l'albero animato col meteo vero della sua città, il
  diario, le lettere, la conversazione e gli strumenti della demo per far passare
  un giorno o una settimana, chiedere la lettera del mese e provare il meteo
  (`?meteo=sole|pioggia|freddo|neve|notte`).
- **Catalogo** (`/catalogo`): tutte le azioni animate, le abitudini col meteo, le
  strade e la crescita.

## Che cosa serve

- Node.js 22 o più recente
- Docker Desktop, acceso
- Supabase CLI (`supabase --version`)
- Una chiave dell'API di Anthropic in `.env`:

  ```
  ANTHROPIC_API_KEY=...
  ```

## Avvio

```bash
npm install
```

```bash
supabase start
```

Il primo `supabase start` scarica le immagini Docker e richiede qualche minuto. Poi
scrivi le chiavi locali in `.env.local` (il file è escluso da git):

```bash
supabase status -o json | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);require('fs').writeFileSync('.env.local',['NEXT_PUBLIC_SUPABASE_URL='+j.API_URL,'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='+j.PUBLISHABLE_KEY,'SUPABASE_SECRET_KEY='+j.SECRET_KEY,'NEXT_PUBLIC_SITE_URL=http://localhost:3000','NEXT_PUBLIC_MAILPIT_URL=http://127.0.0.1:54324','SMTP_HOST=127.0.0.1','SMTP_PORT=54325',''].join('\n'))})"
```

```bash
npm run dev
```

Apri http://localhost:3000, entra con un'email qualsiasi (per esempio
`giulia@linfa.test`) e prendi il link o il codice nella casella di prova:
http://127.0.0.1:54324. Nessuna email esce davvero dal computer.

## Comandi utili

| Comando | Che cosa fa |
|---|---|
| `npm run notte` | Il motore notturno: un giorno per ogni albero, la lettera del mese ogni 30 giorni |
| `npm run simula -- --giorni 7 --citta Pescara --lettera` | Un albero in memoria, senza database, per provare il motore |
| `npm run build` | Build di produzione |
| `npm run lint` / `npm run typecheck` | Controlli |
| `supabase stop` | Ferma Supabase (i dati restano) |
| `supabase db reset` | Riparte da zero: cancella alberi e account di prova |

## Come funziona il motore

- Ogni albero ha sette tratti (curiosità, ambizione, pigrizia, furbizia,
  creatività, socievolezza, energia), casuali alla nascita.
- Ogni giorno l'AI (Claude, modello `claude-haiku-5-5`; le lettere e le risposte
  le scrive `claude-opus-5-5`) sceglie cosa fa l'albero da
  una libreria di 23 azioni già animate, in base al carattere, al meteo del giorno
  e a qualche evento a caso, e scrive il diario. Le giornate spingono l'albero
  verso una strada; quando una strada supera le altre, l'albero lo scopre e
  scrive una lettera.
- Le abitudini col meteo valgono sempre: di notte dorme col berretto, con la
  pioggia si fa la doccia, col freddo mette cappello e sciarpa, col sole gli
  occhiali.
- Le richieste all'AI hanno i fallback lato server attivi: se una richiesta
  viene rifiutata dai filtri di sicurezza, l'API la ripete su un modello di riserva.

## Limiti della demo

- Nessun pagamento: il piano scelto viene solo salvato.
- I boschi condivisi sono annunciati ma non ancora fatti.
- Una persona, un albero.
- Il motore notturno si lancia a mano (`npm run notte`): in produzione andrà in un
  cron.
- Il personaggio è disegnato in SVG e animato in CSS: è il punto di partenza
  per il personaggio definitivo (per esempio in Rive).
