import type { Posa, Stadio, Stagione } from "@/lib/albero/tipi";
import { AlberoVivo } from "./vivo/AlberoVivo";

// L'albero di Linfa: un pupazzo snodato e vivo (cartella vivo/).
// Il server disegna la posa ferma, nel browser parte l'animazione: scenette,
// respiro, ciglia, sguardo, e le reazioni a clic, tastiera e trascinamento.
// Sistema di coordinate del personaggio: 240 x 280, il terreno è a y = 262.

export interface AlberoProps {
  posa: Posa;
  stadio?: Stadio;
  stagione?: Stagione;
  /** Neve sulla chioma. */
  innevato?: boolean;
  /** Clic, trascinamento e occhi che seguono il puntatore. Di serie è attivo. */
  interattivo?: boolean;
  /**
   * L'età in giorni: l'albero ha la grandezza di quell'età (da germoglio ad
   * adulto in GIORNI_PER_CRESCERE). Senza, la grandezza tipica dello stadio.
   */
  giorni?: number;
}

/** Il personaggio come gruppo SVG, da mettere dentro una scena. */
export function AlberoGruppo(props: AlberoProps & { titolo?: string }) {
  return <AlberoVivo {...props} />;
}

/**
 * L'albero da solo, in un suo SVG. Con `titolo=""` è un'illustrazione: si anima
 * ma non reagisce a clic e trascinamento e non prende il fuoco (salvo `interattivo` esplicito).
 */
export function Albero({
  className,
  titolo,
  interattivo,
  ...props
}: AlberoProps & { className?: string; titolo?: string }) {
  const decorativo = titolo === "";
  interattivo ??= !decorativo;
  const nome = titolo || "Un albero di Linfa";
  return (
    <svg
      viewBox="-20 -40 280 320"
      className={className}
      role={decorativo ? undefined : interattivo ? "group" : "img"}
      aria-label={decorativo ? undefined : nome}
      aria-hidden={decorativo || undefined}
    >
      <AlberoVivo {...props} titolo={nome} interattivo={interattivo} focusabile={!decorativo} ricorda="auto" />
    </svg>
  );
}
