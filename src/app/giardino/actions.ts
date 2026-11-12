"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { voce } from "@/lib/albero/oggetti";
import { NOMI_USO } from "@/lib/albero/regali";
import { INFO_STRADE } from "@/lib/albero/strade";
import { apriNuovoMese, cambiaPacchetto, faiRegaloDelMese } from "@/lib/motore/extra";
import { chiudiSettimana, controllaSblocchi, viviGiorni } from "@/lib/motore/calendario";
import { nuovoBuongiorno, rispondiAllaPersona, scriviEInviaLettera } from "@/lib/motore/servizio";
import { apriPacchi, sbloccaPerProva, segnaVisti, spostaOggetto, type OggettoArrivato } from "@/lib/motore/stanza";
import { NOMI_PACCHETTO } from "@/lib/piani";
import { createClient, getUtente } from "@/lib/supabase/server";

export interface Esito {
  ok?: boolean;
  messaggio?: string;
  /** Una pagina da aprire dopo (la lettera appena scritta, il riepilogo del mese). */
  link?: { href: string; testo: string };
}

/** L'albero della persona collegata: ogni azione lo ricontrolla da sé. */
async function alberoDellaPersona() {
  const utente = await getUtente();
  if (!utente) redirect("/accedi");
  const supabase = await createClient();
  const { data } = await supabase.from("trees").select("id, name").eq("owner_id", utente.id).maybeSingle();
  if (!data) redirect("/pianta");
  return data;
}

const errore = (e: unknown): Esito => ({
  ok: false,
  messaggio: e instanceof Error ? e.message : "Qualcosa è andato storto.",
});

const MAILPIT = process.env.NEXT_PUBLIC_MAILPIT_URL || "http://127.0.0.1:54324";

/** Strumenti della demo: giorni, lettera del mese, inizio mese, mattina, fine settimana, pacchetto. */
export async function azioneDemo(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    if (form.get("cosa") === "pacchetto") {
      const piano = await cambiaPacchetto(albero.id, String(form.get("piano") ?? ""));
      revalidatePath("/giardino", "layout");
      return { ok: true, messaggio: `Ora ${albero.name} ha il pacchetto ${NOMI_PACCHETTO[piano]}. Demo: nessun pagamento.` };
    }
    if (form.get("cosa") === "oggetti") {
      const n = Math.min(6, Math.max(1, Number(form.get("quanti") ?? 1)));
      const presi = await sbloccaPerProva(albero.id, n);
      revalidatePath("/giardino");
      if (!presi.length) return { ok: true, messaggio: `${albero.name} ha già tutto quello che il catalogo sa disegnare.` };
      const nomi = presi.map((id) => voce(id)?.nome).filter(Boolean);
      return { ok: true, messaggio: `Nella stanza ${presi.length === 1 ? "c'è un pacco" : "ci sono dei pacchi"} da aprire: ${nomi.join(", ")}. ${presi.length === 1 ? "Toccalo!" : "Toccali!"}` };
    }
    if (form.get("cosa") === "mese") {
      const m = await apriNuovoMese(albero.id);
      revalidatePath("/giardino", "layout");
      return {
        ok: true,
        messaggio: `Comincia il mese ${m.nuovo}. Il mese ${m.chiuso} (${m.giorni} giorni) si intitola «${m.titolo}».`,
        link: { href: `/giardino/mese/${m.chiuso}`, testo: `Apri il riepilogo del mese ${m.chiuso}` },
      };
    }
    if (form.get("cosa") === "mattina") {
      const b = await nuovoBuongiorno(albero.id);
      revalidatePath("/giardino");
      return { ok: true, messaggio: `${albero.name} ti chiede: «${b.domanda}» Rispondi nel pannello Buongiorno (B).` };
    }
    if (form.get("cosa") === "settimana") {
      const s = await chiudiSettimana(albero.id);
      revalidatePath("/giardino");
      return {
        ok: true,
        messaggio: `Settimana ${s.numero} chiusa (giorni ${s.primo}–${s.ultimo}): la cartolina «${s.oggetto}» è partita per email.`,
        link: { href: MAILPIT, testo: "Apri la casella di prova" },
      };
    }
    if (form.get("cosa") === "lettera") {
      const l = await scriviEInviaLettera(albero.id, "mensile");
      revalidatePath("/giardino");
      return { ok: true, messaggio: `${albero.name} ti ha scritto: «${l.subject}». La trovi qui sotto e nella casella di prova.` };
    }
    // I giorni passano dal calendario: collezione, cartolina della settimana, lettere, fine del mese.
    const r = await viviGiorni(albero.id, Number(form.get("giorni") ?? 1));
    revalidatePath("/giardino");
    let messaggio =
      r.vissuti === 1
        ? `È passato un giorno: ${albero.name} è al giorno ${r.giorni}.`
        : `Sono passati ${r.vissuti} giorni: ${albero.name} è al giorno ${r.giorni}.`;
    if (r.rivelata) messaggio += ` Ha capito chi è: ${INFO_STRADE[r.rivelata].nome.toLowerCase()}!`;
    if (r.lettera) messaggio += " Ti ha scritto una lettera.";
    const nuovi = r.eventi.sbloccati.map((id) => voce(id)?.nome).filter(Boolean);
    if (nuovi.length) messaggio += ` Nella collezione: ${nuovi.join(", ")}.`;
    if (r.eventi.letteraMetaMese) messaggio += " È arrivata la lettera di metà mese.";
    if (r.eventi.mese) messaggio += ` Finito il mese ${r.eventi.mese.chiuso}: c'è la lettera del mese.`;
    if (r.eventi.settimana) {
      messaggio += ` La cartolina della settimana ${r.eventi.settimana.numero} è partita per email.`;
      return { ok: true, messaggio, link: { href: MAILPIT, testo: "Apri la casella di prova" } };
    }
    return { ok: true, messaggio };
  } catch (e) {
    return errore(e);
  }
}

export async function inviaMessaggio(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  const testo = String(form.get("testo") ?? "").trim();
  if (!testo) return { ok: false, messaggio: "Scrivi qualcosa prima di spedire." };
  try {
    await rispondiAllaPersona(albero.id, testo);
    // «La prima chiacchierata» entra nella collezione.
    await controllaSblocchi(albero.id);
    revalidatePath("/giardino");
    return { ok: true };
  } catch (e) {
    revalidatePath("/giardino");
    return errore(e);
  }
}

/** Il regalo del mese (Premium): l'albero risponde con una lettera. */
export async function faiRegalo(_prima: Esito, form: FormData): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    const r = await faiRegaloDelMese(albero.id, String(form.get("regalo") ?? ""));
    // «Il primo regalo» entra nella collezione.
    await controllaSblocchi(albero.id);
    revalidatePath("/giardino", "layout");
    return {
      ok: true,
      messaggio: `${albero.name} ha scartato ${r.regalo.articolo}. ${NOMI_USO[r.uso]}: ${r.come}`,
      link: { href: `/giardino/lettere/${r.lettera.id}`, testo: "Leggi la sua lettera" },
    };
  } catch (e) {
    return errore(e);
  }
}

// ——— La stanza: pacchi, oggetti, catalogo ———

/** Apre i pacchi: Pino sistema da solo le cose nuove (docs/stanze-e-vita.md, 9.3). */
export async function apriIPacchi(items: string[]): Promise<{ ok: boolean; arrivati: OggettoArrivato[]; messaggio?: string }> {
  const albero = await alberoDellaPersona();
  try {
    const arrivati = await apriPacchi(albero.id, items.slice(0, 40).map(String));
    revalidatePath("/giardino");
    return { ok: true, arrivati };
  } catch (e) {
    return { ok: false, arrivati: [], messaggio: errore(e).messaggio };
  }
}

/** La persona sposta un oggetto della stanza, o lo mette via (posto null). */
export async function spostaNellaStanza(item: string, posto: string | null): Promise<Esito> {
  const albero = await alberoDellaPersona();
  try {
    await spostaOggetto(albero.id, String(item), posto === null ? null : String(posto));
    revalidatePath("/giardino");
    return { ok: true };
  } catch (e) {
    return errore(e);
  }
}

/** Ha guardato il catalogo: le etichette «Nuovo» se ne vanno alla prossima visita. */
export async function catalogoVisto(): Promise<void> {
  const albero = await alberoDellaPersona();
  await segnaVisti(albero.id);
}
