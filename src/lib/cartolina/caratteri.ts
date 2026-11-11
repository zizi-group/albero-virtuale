// I caratteri del sito (Young Serif, Gochi Hand) in TTF da Google Fonts, per le
// immagini fatte con next/og (cartoline). Una volta sola per processo; se la
// rete non risponde si usa il carattere di serie di next/og, e alla volta
// successiva si riprova.

const caratteri = new Map<string, Promise<ArrayBuffer | null>>();

function carattere(famiglia: string): Promise<ArrayBuffer | null> {
  let p = caratteri.get(famiglia);
  if (!p) {
    p = (async () => {
      try {
        const css = await fetch(`https://fonts.googleapis.com/css2?family=${famiglia.replace(/ /g, "+")}`, {
          signal: AbortSignal.timeout(4000),
        }).then((r) => r.text());
        const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
        if (!url) return null;
        const r = await fetch(url, { signal: AbortSignal.timeout(6000) });
        return r.ok ? await r.arrayBuffer() : null;
      } catch {
        return null;
      }
    })();
    caratteri.set(famiglia, p);
    p.then((f) => {
      if (!f) caratteri.delete(famiglia);
    });
  }
  return p;
}

export interface Carattere {
  name: string;
  data: ArrayBuffer;
  weight: 400;
  style: "normal";
}

/** I caratteri per ImageResponse, o undefined (carattere di serie) se non arrivano. */
export async function caratteriCartolina(): Promise<Carattere[] | undefined> {
  const [titolo, mano] = await Promise.all([carattere("Young Serif"), carattere("Gochi Hand")]);
  const elenco: Carattere[] = [];
  if (titolo) elenco.push({ name: "Young Serif", data: titolo, weight: 400, style: "normal" });
  if (mano) elenco.push({ name: "Gochi Hand", data: mano, weight: 400, style: "normal" });
  return elenco.length ? elenco : undefined;
}
