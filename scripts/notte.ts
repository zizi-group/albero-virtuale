// Il motore notturno: per ogni albero fa passare un giorno, poi il calendario
// (src/lib/motore/calendario.ts): collezione, cartolina della settimana ogni 7
// giorni, lettera di metà mese per il Premium, fine del mese ogni 30 giorni con
// il riepilogo e la lettera del mese. La domanda del mattino arriva con la giornata.
// Ogni persona può avere più alberi (fase 5): vivono tutti, uno per uno, ognuno
// con la sua giornata. Alla fine si aprono le stanze che la regola concede.
// In produzione si lancia una volta a notte (cron). In locale: npm run notte
import "./_env";
import { createAdminClient } from "../src/lib/supabase/admin";
import { viviGiorni } from "../src/lib/motore/calendario";
import { aggiornaStanze } from "../src/lib/motore/stanze";

async function main() {
  const { data: alberi, error } = await createAdminClient().from("trees").select("id, name, owner_id").order("planted_at");
  if (error) throw error;
  console.log(`Alberi da far vivere: ${alberi.length}`);
  for (const a of alberi) {
    try {
      const r = await viviGiorni(a.id, 1);
      const note: string[] = [];
      if (r.rivelata) note.push(`strada rivelata: ${r.rivelata}`);
      if (r.eventi.sbloccati.length) note.push(`collezione: ${r.eventi.sbloccati.join(", ")}`);
      if (r.eventi.letteraMetaMese) note.push("lettera di metà mese spedita");
      if (r.eventi.settimana) note.push(`cartolina della settimana ${r.eventi.settimana.numero} spedita`);
      if (r.eventi.mese) note.push(`chiuso il mese ${r.eventi.mese.chiuso} («${r.eventi.mese.titolo}»), lettera del mese spedita`);
      console.log(`- ${a.name}: giorno ${r.giorni}${note.length ? `, ${note.join(", ")}` : ""}`);
    } catch (e) {
      console.error(`- ${a.name}: errore`, e instanceof Error ? e.message : e);
    }
  }
  for (const ownerId of new Set(alberi.map((a) => a.owner_id))) {
    try {
      const nuove = await aggiornaStanze(ownerId);
      if (nuove.length) console.log(`Stanze nuove: ${nuove.map((s) => s.name).join(", ")}`);
    } catch (e) {
      console.error("Stanze non aggiornate:", e instanceof Error ? e.message : e);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
