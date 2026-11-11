// «Animazioni complete»: costanti condivise tra il server (layout) e il browser.
// <html data-movimento="pieno"> forza tutte le animazioni anche quando il sistema
// chiede movimento ridotto. Le regole del movimento ridotto vanno scritte sotto
// :root:not([data-movimento="pieno"]).

export const CHIAVE_MOVIMENTO = "linfa-movimento";
export const EVENTO_MOVIMENTO = "linfa-movimento";

/** Da eseguire prima del primo disegno: segna che c'è JavaScript e applica la scelta salvata. */
export const SCRIPT_MOVIMENTO = `document.documentElement.dataset.js="1";try{if(localStorage.getItem("${CHIAVE_MOVIMENTO}")==="pieno")document.documentElement.dataset.movimento="pieno"}catch(e){}`;
