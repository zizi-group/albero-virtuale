// I suoni d'ambiente del giardino, generati con la Web Audio API: nessun file
// audio, quindi nessuna licenza da citare. Spenti di default.
// - pioggia: rumore filtrato che respira piano;
// - uccellini: cinguettii brevi a intervalli casuali, di giorno;
// - grilli: impulsi acuti e regolari, di notte.

export type TipoSuono = "pioggia" | "uccellini" | "grilli";

export class Suoni {
  private ctx: AudioContext | null = null;
  private uscita: GainNode | null = null;
  private fermi: (() => void)[] = [];
  private tipo: TipoSuono | null = null;

  /** Va chiamato da un gesto della persona (clic): i browser lo richiedono. */
  avvia(tipo: TipoSuono) {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.uscita = this.ctx.createGain();
      this.uscita.gain.value = 0;
      this.uscita.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    if (this.tipo === tipo) return;
    this.svuota();
    this.tipo = tipo;
    const ctx = this.ctx;
    const out = this.uscita!;
    out.gain.cancelScheduledValues(ctx.currentTime);
    out.gain.setTargetAtTime(tipo === "pioggia" ? 0.5 : 0.35, ctx.currentTime, 0.6);
    if (tipo === "pioggia") this.pioggia(ctx, out);
    if (tipo === "uccellini") this.uccellini(ctx, out);
    if (tipo === "grilli") this.grilli(ctx, out);
  }

  ferma() {
    if (this.ctx && this.uscita) this.uscita.gain.setTargetAtTime(0, this.ctx.currentTime, 0.3);
    const ctx = this.ctx;
    setTimeout(() => {
      this.svuota();
      void ctx?.suspend();
    }, 900);
    this.tipo = null;
  }

  chiudi() {
    this.svuota();
    void this.ctx?.close();
    this.ctx = null;
  }

  private svuota() {
    this.fermi.forEach((f) => f());
    this.fermi = [];
  }

  private rumore(ctx: AudioContext) {
    const durata = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * durata, ctx.sampleRate);
    const dati = buffer.getChannelData(0);
    for (let i = 0; i < dati.length; i++) dati[i] = Math.random() * 2 - 1;
    const sorgente = ctx.createBufferSource();
    sorgente.buffer = buffer;
    sorgente.loop = true;
    return sorgente;
  }

  private pioggia(ctx: AudioContext, out: GainNode) {
    const r = this.rumore(ctx);
    const passaAlto = ctx.createBiquadFilter();
    passaAlto.type = "highpass";
    passaAlto.frequency.value = 900;
    const passaBasso = ctx.createBiquadFilter();
    passaBasso.type = "lowpass";
    passaBasso.frequency.value = 6000;
    const volume = ctx.createGain();
    volume.gain.value = 0.35;
    // Il respiro della pioggia: il volume oscilla piano.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.12;
    const profondita = ctx.createGain();
    profondita.gain.value = 0.08;
    lfo.connect(profondita).connect(volume.gain);
    r.connect(passaAlto).connect(passaBasso).connect(volume).connect(out);
    r.start();
    lfo.start();
    this.fermi.push(() => {
      r.stop();
      lfo.stop();
      volume.disconnect();
    });
  }

  private uccellini(ctx: AudioContext, out: GainNode) {
    let attivo = true;
    const cinguettio = () => {
      if (!attivo) return;
      const t = ctx.currentTime;
      const note = 2 + Math.floor(Math.random() * 4);
      const base = 2600 + Math.random() * 1800;
      for (let i = 0; i < note; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const inizio = t + i * (0.09 + Math.random() * 0.05);
        o.type = "sine";
        o.frequency.setValueAtTime(base, inizio);
        o.frequency.exponentialRampToValueAtTime(base * (1.2 + Math.random() * 0.5), inizio + 0.06);
        g.gain.setValueAtTime(0.0001, inizio);
        g.gain.exponentialRampToValueAtTime(0.12, inizio + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, inizio + 0.08);
        o.connect(g).connect(out);
        o.start(inizio);
        o.stop(inizio + 0.1);
      }
      timer = window.setTimeout(cinguettio, 900 + Math.random() * 3200);
    };
    let timer = window.setTimeout(cinguettio, 300);
    this.fermi.push(() => {
      attivo = false;
      clearTimeout(timer);
    });
  }

  private grilli(ctx: AudioContext, out: GainNode) {
    let attivo = true;
    const cri = () => {
      if (!attivo) return;
      const t = ctx.currentTime;
      const freq = 4200 + Math.random() * 500;
      for (let i = 0; i < 3; i++) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        const inizio = t + i * 0.055;
        o.type = "triangle";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, inizio);
        g.gain.exponentialRampToValueAtTime(0.05, inizio + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, inizio + 0.04);
        o.connect(g).connect(out);
        o.start(inizio);
        o.stop(inizio + 0.05);
      }
      timer = window.setTimeout(cri, 480 + Math.random() * 260);
    };
    let timer = window.setTimeout(cri, 200);
    this.fermi.push(() => {
      attivo = false;
      clearTimeout(timer);
    });
  }
}

/**
 * Il suono leggero dello sblocco: due note brevi, solo se i suoni sono accesi
 * (lo decide chi chiama). Un contesto audio suo, chiuso subito dopo.
 */
export function dlin() {
  if (typeof window === "undefined") return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  const ctx = new Ctor();
  const out = ctx.createGain();
  out.gain.value = 0.18;
  out.connect(ctx.destination);
  [880, 1318.5].forEach((f, i) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = f;
    const t = ctx.currentTime + i * 0.12;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + 0.65);
  });
  window.setTimeout(() => void ctx.close(), 1200);
}
