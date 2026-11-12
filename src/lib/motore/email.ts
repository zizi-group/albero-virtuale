import { createTransport, type Transporter } from "nodemailer";

// Spedizione delle lettere. In locale vanno alla casella di prova di Supabase
// (Mailpit, http://127.0.0.1:54324): nessuna email esce davvero.

const SITO = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let trasporto: Transporter | null = null;
function smtp() {
  trasporto ??= createTransport({
    host: process.env.SMTP_HOST || "127.0.0.1",
    port: Number(process.env.SMTP_PORT || 54325),
    secure: false,
    ignoreTLS: true,
  });
  return trasporto;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function inviaLettera({
  a,
  nomeAlbero,
  oggetto,
  testo,
  letteraId,
}: {
  a: string;
  nomeAlbero: string;
  oggetto: string;
  testo: string;
  letteraId: string;
}) {
  const link = `${SITO}/giardino/lettere/${letteraId}`;
  const paragrafi = paragrafiHtml(testo);

  const html = `<!doctype html><html lang="it"><body style="margin:0;background:#f3ecdc;font-family:Georgia,serif;color:#23261d;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:36px 14px;background:#f3ecdc;"><tr><td align="center">
<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fffaf0;border:1px solid #e6dbc2;border-radius:14px;padding:34px;">
<tr><td>
<p style="margin:0 0 4px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#3f5a2a;">Una lettera da ${esc(nomeAlbero)}</p>
<h1 style="margin:0 0 22px;font-size:22px;font-weight:normal;">${esc(oggetto)}</h1>
<div style="font-size:17px;line-height:1.65;">${paragrafi}</div>
<p style="margin:26px 0 0;"><a href="${link}" style="display:inline-block;background:#3f5a2a;color:#fffaf0;text-decoration:none;padding:12px 22px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;">Vai a trovarlo nel giardino</a></p>
</td></tr></table>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8a846f;margin-top:18px;">Linfa · Compri un albero. Non sai chi diventerà.</p>
</td></tr></table></body></html>`;

  await smtp().sendMail({
    from: `"${nomeAlbero.replace(/"/g, "")} (Linfa)" <lettere@linfa.local>`,
    to: a,
    subject: oggetto,
    text: `${testo}\n\nVai a trovarlo: ${link}`,
    html,
  });
}

/** I paragrafi di una lettera in HTML (una riga vuota separa i paragrafi). */
function paragrafiHtml(testo: string, margine = 16) {
  return testo
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 ${margine}px;">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/**
 * La settimana: la cartolina del momento migliore (allegata dentro l'email,
 * cid, così si vede anche senza aprire il sito), due-tre righe e, sotto, la
 * lettera della settimana. Una sola email ogni sette giorni.
 */
export async function inviaNotaSettimana({
  a,
  nomeAlbero,
  oggetto,
  nota,
  numero,
  immagine,
  lettera = null,
}: {
  a: string;
  nomeAlbero: string;
  oggetto: string;
  nota: string;
  numero: number;
  immagine: Buffer | null;
  /** La lettera della settimana, se l'albero è riuscito a scriverla. */
  lettera?: { testo: string; id: string } | null;
}) {
  const link = lettera ? `${SITO}/giardino/lettere/${lettera.id}` : `${SITO}/giardino`;
  const righe = nota
    .split(/\n\s*\n|\n/)
    .map((p) => `<p style="margin:0 0 10px;">${esc(p)}</p>`)
    .join("");
  const figura = immagine
    ? `<img src="cid:cartolina-settimana@linfa" width="520" alt="La cartolina della settimana di ${esc(nomeAlbero)}" style="display:block;width:100%;max-width:520px;height:auto;border-radius:10px;margin:0 0 20px;">`
    : "";

  const html = `<!doctype html><html lang="it"><body style="margin:0;background:#f3ecdc;font-family:Georgia,serif;color:#23261d;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 14px;background:#f3ecdc;"><tr><td align="center">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;background:#fffaf0;border:1px solid #e6dbc2;border-radius:14px;padding:30px;">
<tr><td>
<p style="margin:0 0 14px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#3f5a2a;">La settimana ${numero} di ${esc(nomeAlbero)}</p>
${figura}
<div style="font-size:${lettera ? 15 : 17}px;line-height:1.6;${lettera ? "font-style:italic;color:#5b5a4c;" : ""}">${righe}</div>
${
  lettera
    ? `<hr style="border:none;border-top:1px dashed #d8cba9;margin:22px 0;">
<p style="margin:0 0 14px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:#3f5a2a;">La lettera della settimana</p>
<div style="font-size:17px;line-height:1.65;">${paragrafiHtml(lettera.testo)}</div>`
    : ""
}
<p style="margin:18px 0 0;"><a href="${link}" style="display:inline-block;background:#3f5a2a;color:#fffaf0;text-decoration:none;padding:11px 20px;border-radius:999px;font-family:Arial,sans-serif;font-size:14px;">${lettera ? "Leggila nel giardino" : "Vai nel giardino"}</a></p>
</td></tr></table>
<p style="font-family:Arial,sans-serif;font-size:12px;color:#8a846f;margin-top:16px;">Linfa · una lettera ogni sette giorni</p>
</td></tr></table></body></html>`;

  await smtp().sendMail({
    from: `"${nomeAlbero.replace(/"/g, "")} (Linfa)" <lettere@linfa.local>`,
    to: a,
    subject: oggetto,
    text: `${nota}${lettera ? `\n\n— La lettera della settimana —\n\n${lettera.testo}` : ""}\n\nVai nel giardino: ${link}`,
    html,
    attachments: immagine
      ? [{ filename: `settimana-${numero}.png`, content: immagine, cid: "cartolina-settimana@linfa", contentType: "image/png" }]
      : [],
  });
}
