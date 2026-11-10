// Il motore notturno: per ogni albero fa passare un giorno. Ogni 30 giorni vissuti
// si chiude il mese (riepilogo del Premium) e parte la lettera del mese.
// In produzione si lancia una volta a notte (cron). In locale: npm run notte
import "./_env";
import { createAdminClient } from "../src/lib/supabase/admin";
import { apriNuovoMese, meseCorrente, meseFinito } from "../src/lib/motore/extra";
import { faiPassareGiorni, scriviEInviaLettera } from "../src/lib/motore/servizio";

async function main() {
  const { data: alberi, error } = await createAdminClient().from("trees").select("id, name");
  if (error) throw error;
  console.log(`Alberi da far vivere: ${alberi.length}`);
  for (const a of alberi) {
    try {
      const r = await faiPassareGiorni(a.id, 1);
      let nota = r.rivelata ? `, strada rivelata: ${r.rivelata}` : "";
      if (meseFinito(await meseCorrente(a.id), r.giorni)) {
        const m = await apriNuovoMese(a.id);
        await scriviEInviaLettera(a.id, "mensile");
        nota += `, chiuso il mese ${m.chiuso} («${m.titolo}») e spedita la lettera del mese`;
      }
      console.log(`- ${a.name}: giorno ${r.giorni}${nota}`);
    } catch (e) {
      console.error(`- ${a.name}: errore`, e instanceof Error ? e.message : e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
