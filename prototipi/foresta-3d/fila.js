// I sette alberi della pagina varianti.html (e della fila di ritratti).
// Specie, strada e viso sono scelti per mostrarli tutti; il resto (proporzioni,
// sopracciglia, lentiggini, bocca, tono delle foglie) viene dal seme.
export const FILA = [
  { seme: "A731", specie: "quercia", strada: "viaggiatore", viso: "felice" },
  { seme: "B204", specie: "ulivo", strada: "artista", viso: "ridente" },
  { seme: "C118", specie: "pino", strada: "filosofo", viso: "puntini" },
  { seme: "D057", specie: "ciliegio", strada: "poeta-pigro", viso: "assonnato" },
  { seme: "E390", specie: "betulla", strada: "sportivo", viso: "puntini" },
  { seme: "F612", specie: "quercia", strada: "furfante", viso: "furbetto" },
  { seme: "G845", specie: "pino", strada: "imprenditore", viso: "felice" },
];

/** Posizione di ogni albero nella fila, in leggero arco. */
export const inFila = (passo = 2.1, scala = 0.9) =>
  FILA.map((a, i) => {
    const x = (i - (FILA.length - 1) / 2) * passo;
    return { ...a, x, z: 0.4 - 0.025 * x * x, scala, giro: -x * 0.035 };
  });
