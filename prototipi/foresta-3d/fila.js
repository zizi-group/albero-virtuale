// I sette alberi della pagina varianti.html (e della fila di ritratti).
// Specie e strada sono scelte per mostrarle tutte; il resto (proporzioni,
// occhi, sopracciglia, lentiggini, bocca, tono delle foglie) viene dal seme.
export const FILA = [
  { seme: "A731", specie: "quercia", strada: "viaggiatore" },
  { seme: "B204", specie: "ulivo", strada: "artista" },
  { seme: "C118", specie: "pino", strada: "filosofo" },
  { seme: "D057", specie: "ciliegio", strada: "poeta-pigro" },
  { seme: "E390", specie: "betulla", strada: "sportivo" },
  { seme: "F612", specie: "quercia", strada: "furfante" },
  { seme: "G845", specie: "pino", strada: "imprenditore" },
];

/** Posizione di ogni albero nella fila, in leggero arco. */
export const inFila = (passo = 2.1, scala = 0.9) =>
  FILA.map((a, i) => {
    const x = (i - (FILA.length - 1) / 2) * passo;
    return { ...a, x, z: 0.4 - 0.025 * x * x, scala, giro: -x * 0.035 };
  });
