// Server statico minimo per le pagine di prova che importano da /src e
// /node_modules (per esempio club.html). Serve la radice del repository.
//   node prototipi/foresta-3d/servi.mjs [porta]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const radice = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const porta = Number(process.argv[2] ?? 4318);
const TIPI = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".glb": "model/gltf-binary", ".png": "image/png", ".jpg": "image/jpeg" };

createServer(async (req, res) => {
  const percorso = normalize(decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname));
  const file = join(radice, percorso);
  if (!file.startsWith(radice)) return res.writeHead(403).end();
  try {
    const dati = await readFile(file);
    res.writeHead(200, { "content-type": TIPI[extname(file)] ?? "application/octet-stream" }).end(dati);
  } catch {
    res.writeHead(404).end("non trovato");
  }
}).listen(porta, "127.0.0.1", () => console.log(`http://localhost:${porta}/prototipi/foresta-3d/club.html?n=1000`));
