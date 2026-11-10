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
}

/** Il personaggio come gruppo SVG, da mettere dentro una scena. */
export function AlberoGruppo(props: AlberoProps & { titolo?: string }) {
  return <AlberoVivo {...props} />;
}

/** L'albero da solo, in un suo SVG. Con `titolo=""` è decorativo: si anima e si tocca, ma non prende il fuoco. */
export function Albero({
  className,
  titolo,
  interattivo = true,
  ...props
}: AlberoProps & { className?: string; titolo?: string }) {
  const decorativo = titolo === "";
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
