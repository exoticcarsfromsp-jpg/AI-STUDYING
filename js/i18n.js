// FORJA · Idiomas. La interfaz se escribe en español y se traduce al mostrarse:
// cada texto visible se busca en el diccionario (js/i18n-datos.js), con plantillas para los números (#).
const LANGS = { es: ["Español", "ES", "es-ES"], en: ["English", "EN", "en-GB"], ca: ["Català", "CA", "ca-ES"], fr: ["Français", "FR", "fr-FR"], pt: ["Português", "PT", "pt-PT"] };
let LANG = (() => { try { const l = localStorage.getItem("forja_lang") || (navigator.language || "es").slice(0, 2).toLowerCase(); return LANGS[l] ? l : "es"; } catch (e) { return "es"; } })();
const TRM = new Map();
function trLoad() {
  TRM.clear();
  const ix = { en: 1, ca: 2, fr: 3, pt: 4 }[LANG];
  if (!ix || !window.TRD) return;
  for (const r of window.TRD) if (r[ix]) TRM.set(r[0], r[ix]);
}
const NUMRE = /\d+(?:[.,]\d+)?/g;
function look(t) {
  let r = TRM.get(t);
  if (r != null) return r;
  const nums = [], k = t.replace(NUMRE, (x) => (nums.push(LANG == "en" ? x.replace(",", ".") : x), "#"));
  if (nums.length && (r = TRM.get(k)) != null) { let i = 0; return r.replace(/#/g, () => nums[i++] ?? ""); }
  return null;
}
// Devuelve la traducción o null si no se conoce
function trc(t) {
  let r = look(t);
  if (r != null) return r;
  const m = t.match(/^([^\p{L}\d]*)(.*?)([^\p{L}\d)]*)$/u); // emoji o signos alrededor
  if (m && (m[1] || m[3]) && m[2]) for (let i = 0; i <= m[3].length; i++) if ((r = look(m[2] + m[3].slice(0, i))) != null) return m[1] + r + m[3].slice(i);
  for (const sep of [" · ", " — ", "; ", ": ", " / ", " + ", ", "]) {
    if (!t.includes(sep)) continue;
    const parts = t.split(sep), tp = [];
    // solo si TODAS las partes con letras se traducen (nunca frases a medias)
    for (const x of parts) { const y = x.trim(); if (!/\p{L}{2}/u.test(y) || TRNUM.test(y)) { tp.push(x); continue; } const z = trc(y); if (z == null) { tp.length = 0; break; } tp.push(x.replace(y, z)); }
    if (tp.length) return tp.join(sep);
  }
  return null;
}
// partes que no hace falta traducir: cantidades y unidades
const TRNUM = /^[\d\s.,×x%+\-–≈]*(kg|g|ml|L|kcal|min|cm|s|reps)?[\d\s.,×x%+\-–]*$/;
function tr(s) {
  if (LANG == "es" || !s) return s;
  const t = s.trim();
  if (!t || t.length > 600) return s;
  const r = trc(t);
  return r == null ? s : s.replace(t, r);
}
// Plantilla traducida con argumentos: L("Cuece {0} de {1}", "80 g", "arroz")
function L(tpl, ...a) { let s = LANG == "es" ? tpl : (TRM.get(tpl) ?? tpl); return s.replace(/\{(\d)\}/g, (_, i) => a[+i] ?? ""); }
const Y = () => ({ es: " y ", en: " and ", ca: " i ", fr: " et ", pt: " e " })[LANG];
const SKIP = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE"]);
function trNode(root) {
  if (LANG == "es" || !root) return;
  if (root.nodeType == 3) { const v = tr(root.nodeValue); if (v !== root.nodeValue) root.nodeValue = v; return; }
  if (root.nodeType != 1 || SKIP.has(root.nodeName) || root.closest?.("[data-notr]")) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: (n) => (n.nodeType == 1 && (SKIP.has(n.nodeName) || n.hasAttribute("data-notr")) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  let n = root;
  do {
    if (n.nodeType == 3) { const v = tr(n.nodeValue); if (v !== n.nodeValue) n.nodeValue = v; }
    else for (const at of ["placeholder", "title", "aria-label", "alt"]) { const o = n.getAttribute && n.getAttribute(at); if (o) { const v = tr(o); if (v !== o) n.setAttribute(at, v); } }
  } while ((n = w.nextNode()));
}
const TROBS = new MutationObserver((ms) => { for (const m of ms) { if (m.type == "characterData") trNode(m.target); else m.addedNodes.forEach(trNode); } });
function trStart() {
  trLoad();
  document.documentElement.lang = LANG;
  TROBS.disconnect();
  if (LANG != "es") { trNode(document.body); TROBS.observe(document.body, { childList: true, subtree: true, characterData: true }); }
}
const _confirm = window.confirm.bind(window), _alert = window.alert.bind(window);
window.confirm = (m) => _confirm(tr(m)); window.alert = (m) => _alert(tr(m));
function setLang(l) {
  if (!LANGS[l]) return;
  LANG = l;
  try { localStorage.setItem("forja_lang", l); } catch (e) {}
  const u = typeof U != "undefined" ? U : null;
  if (u) { u.lang = l; sv(); }
  trStart();
  cm();
  if (u && u.p) app(); else if (u && OW) onbR(); else if (u) onb(); else auth();
}
function langSheet() {
  $("#xm").innerHTML = `<div class="sheet mid langs"><div class=row><b style="font-size:19px">🌍 Idioma</b><button class=lnk onclick="cm()">✕</button></div>${Object.entries(LANGS).map(([k, v]) => `<button class="opt ${LANG == k ? "on" : ""}" onclick="setLang('${k}')" data-notr><span class=lc>${v[1]}</span><b>${v[0]}</b></button>`).join("")}</div>`;
  $("#xm").classList.add("open", "mid");
}
