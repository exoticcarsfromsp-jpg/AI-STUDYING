// FORJA · Rangos y mapa muscular
// 9 rangos, del más bajo al más alto (como en la referencia)
const R = ["Bronce", "Hierro", "Plata", "Oro", "Platino", "Diamante", "Esmeralda", "Campeón", "Simétrico"];
const C = ["#b8743c", "#7b828c", "#a9c9c7", "#e9c12e", "#e0394e", "#8fc9f7", "#30c26a", "#8f6cf2", "#2a5fe0"];
const RL = ["#e9b07e", "#b9bec6", "#eaf6f5", "#fff1a6", "#ff9aa6", "#dff1ff", "#a8f5c5", "#d4c8ff", "#9bb8ff"];
const RF = ["escudo", "triangulo", "rombo", "pentagono", "heptagono", "gema", "hexagono", "corona", "circulo"];
const NEUTRO = "#3a3f47";

function shadeHex(hex, amt) {
  const n = parseInt(hex.slice(1), 16), c = (v) => Math.max(0, Math.min(255, v + amt));
  return "#" + ((1 << 24) + (c(n >> 16) << 16) + (c((n >> 8) & 255) << 8) + c(n & 255)).toString(16).slice(1);
}
let BGI = 0;
function badge(i, size = 34) {
  const shapes = {
    escudo: "M20 3 L35 8 L35 22 Q35 33 20 38 Q5 33 5 22 L5 8 Z", triangulo: "M20 3 L37 35 L3 35 Z", rombo: "M20 2 L38 20 L20 38 L2 20 Z",
    pentagono: "M20 2 L38 15 L31 37 L9 37 L2 15 Z", heptagono: "M20 2 L33 8 L38 21 L31 34 L20 38 L9 34 L2 21 L7 8 Z", gema: "M9 4 L31 4 L38 14 L20 38 L2 14 Z",
    hexagono: "M20 2 L35 10 L35 30 L20 38 L5 30 L5 10 Z", corona: "M4 6 L13 13 L20 4 L27 13 L36 6 L33 30 Q20 40 7 30 Z", circulo: "M20 2 A18 18 0 1 1 19.9 2 Z",
  };
  const none = i == null || i < 0, col = none ? NEUTRO : C[i], li = none ? "#5b616b" : RL[i], id = "bg" + BGI++;
  return `<svg class=badge width=${size} height=${size} viewBox="0 0 40 40" aria-label="${none ? "Sin rango" : R[i]}"><defs><linearGradient id=${id} x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color="${li}"/><stop offset=.55 stop-color="${col}"/><stop offset=1 stop-color="${shadeHex(col, -45)}"/></linearGradient></defs><path d="${shapes[none ? "circulo" : RF[i]]}" fill="url(#${id})" stroke="${shadeHex(col, -70)}" stroke-width=1.2 /><path d="M20 13 L22 18 L27 20 L22 22 L20 27 L18 22 L13 20 L18 18 Z" fill="#fff" opacity="${none ? 0.25 : 0.92}"/></svg>`;
}

// Zonas del mapa ← polígonos
const ZP = { CHEST: "pecho", FRONT_DELTOIDS: "hombro", BACK_DELTOIDS: "hombro", BICEPS: "biceps", TRICEPS: "triceps", FOREARM: "antebrazo", ABS: "abdomen", OBLIQUES: "oblicuos",
  TRAPEZIUS: "trapecio", NECK: "trapecio", UPPER_BACK: "dorsal", LOWER_BACK: "lumbar", GLUTEAL: "gluteo", QUADRICEPS: "cuadriceps", HAMSTRING: "isquios", ABDUCTORS: "aductores",
  ABDUCTOR: "aductores", CALVES: "gemelo", LEFT_SOLEUS: "gemelo", RIGHT_SOLEUS: "gemelo" };
const ZN = { pecho: "Pecho", hombro: "Hombros", biceps: "Bíceps", triceps: "Tríceps", antebrazo: "Antebrazos", abdomen: "Abdomen", oblicuos: "Oblicuos", trapecio: "Trapecio",
  dorsal: "Dorsales", lumbar: "Lumbares", gluteo: "Glúteos", cuadriceps: "Cuádriceps", isquios: "Isquiotibiales", aductores: "Aductores", gemelo: "Gemelos" };

// Subtipo de ejercicio dentro de su grupo (usa SUB de datos.js)
const subOf = (g, n) => ((SUB[g] || []).find((s) => s[0].test(n)) || [0, "o"])[1];
// Zonas principales y secundarias que trabaja un ejercicio
function zonesFor(n, g) {
  if (/gemelo|talón/i.test(n)) return { pri: ["gemelo"], sec: [] };
  if (/martillo|muñeca|inverso|zottman/i.test(n)) return { pri: ["antebrazo", "biceps"], sec: [] };
  const s = subOf(g, n), Z = {
    pecho: { press: [["pecho"], ["hombro", "triceps"]], apert: [["pecho"], ["hombro"]], fondos: [["pecho", "triceps"], ["hombro"]], pull: [["pecho", "dorsal"], []], o: [["pecho"], ["triceps"]] },
    espalda: { vert: [["dorsal"], ["biceps", "antebrazo"]], horiz: [["dorsal", "trapecio"], ["biceps", "hombro"]], rear: [["hombro", "trapecio"], []], bis: [["lumbar"], ["gluteo", "isquios"]], pull: [["dorsal"], ["pecho"]], o: [["dorsal"], ["biceps"]] },
    pierna: { squat: [["cuadriceps"], ["gluteo", "aductores"]], bis: [["isquios"], ["gluteo", "lumbar"]], uni: [["cuadriceps", "gluteo"], ["isquios"]], isq: [["isquios"], []], quad: [["cuadriceps"], []], calf: [["gemelo"], []], abd: [["aductores"], ["gluteo"]], plio: [["cuadriceps"], ["gemelo", "gluteo"]], o: [["cuadriceps"], ["gluteo"]] },
    hombro: { lat: [["hombro"], []], front: [["hombro"], []], rear: [["hombro"], ["trapecio"]], trap: [["trapecio"], ["hombro"]], press: [["hombro"], ["triceps", "trapecio"]], o: [["hombro"], []] },
    brazo: { bic: [["biceps"], ["antebrazo"]], tri: [["triceps"], []], o: [["biceps", "triceps"], []] },
    core: { rot: [["oblicuos"], ["abdomen"]], o: [["abdomen"], ["oblicuos"]] },
    glúteo: { abd: [["aductores", "gluteo"], []], bis: [["gluteo", "isquios"], ["lumbar"]], squat: [["gluteo"], ["cuadriceps"]], o: [["gluteo"], ["isquios"]] },
    cardio: { o: [[], ["cuadriceps", "gemelo", "abdomen"]] },
    gemelo: { o: [["gemelo"], []] },
  }[g] || { o: [[], []] };
  const r = Z[s] || Z.o;
  return { pri: r[0], sec: r[1] };
}

function hand(x, y, ang) {
  return `<g transform="translate(${x} ${y}) rotate(${ang - 90})"><path d="M-3.2 0 C-4 3 -4 7 -3 9.5 L-2.4 13 M-1 0 L-0.8 13.5 M1.1 0 L1.3 13 M3 0.4 C3.6 3 3.6 7 3.1 11" stroke="#2b2f36" stroke-width="1.9" stroke-linecap="round" fill="none"/><path d="M-3.6 -1 C-4 2 -3.8 6 -2.6 8 L2.8 8 C3.8 6 4 2 3.6 -1 Z" fill="#30343b" stroke="#0b0d10" stroke-width=".5"/><path d="M3.6 1 L6.2 5.5" stroke="#2b2f36" stroke-width="1.9" stroke-linecap="round"/></g>`;
}
function feet(back) {
  const f = (x, y, w, flip) => `<path d="M${x - w} ${y} L${x + w} ${y} L${x + w + 1.2 * flip} ${y + 6} Q${x} ${y + 9} ${x - w - 1.2 * flip} ${y + 6} Z" fill="#30343b" stroke="#0b0d10" stroke-width=".5"/>`;
  return back ? f(30.3, 219, 4.2, 0) + f(70.4, 219, 4.2, 0) : f(24.5, 195, 4.8, -1) + f(75.6, 195, 4.8, 1) + f(31.4, 194.5, 3.5, 0) + f(68.4, 194.5, 3.5, 0);
}
// Figura: m = {zona: rango}, act = zonas destacadas
function figSVG(m, act, back) {
  act = [].concat(act || []);
  const data = back ? BODY_P : BODY_A;
  let s = "";
  for (const [mu, pts] of data) {
    const z = ZP[mu];
    const fill = z ? (m[z] >= 0 ? C[m[z]] : NEUTRO) : mu === "HEAD" ? "#6b7079" : "#30343b";
    for (const p of pts) {
      s += z
        ? `<polygon points="${p}" data-z="${z}" class="z${act.includes(z) ? " on" : ""}" style="fill:${fill}"><title>${ZN[z]} · ${m[z] >= 0 ? R[m[z]] : "sin rango"}</title></polygon><polygon points="${p}" fill="url(#bsh)" pointer-events="none"/>`
        : `<polygon points="${p}" fill="${fill}" stroke="#0b0d10" stroke-width=".55"/>`;
    }
  }
  const hs = back ? [[4, 106.5, 116.2], [95.9, 106.7, 63.9]] : [[3.9, 100, 117.1], [95.6, 100.4, 62.5]];
  return s + hs.map(([x, y, a]) => hand(x, y, a)).join("") + feet(back);
}
const BDEFS = `<defs><linearGradient id=bsh x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color=#fff stop-opacity=.22 /><stop offset=.45 stop-color=#fff stop-opacity=0 /><stop offset=1 stop-color=#000 stop-opacity=.28 /></linearGradient></defs>`;
function bodyPair(m, act) {
  return `<svg class=bmap viewBox="-9 -2 236 230" role=img aria-label="Mapa muscular">${BDEFS}<g>${figSVG(m, act, 0)}</g><g transform="translate(118 0)">${figSVG(m, act, 1)}</g><text x=50 y=229 class=bcap>FRONTAL</text><text x=168 y=229 class=bcap>POSTERIOR</text></svg>`;
}
function rankLegend(cur) {
  return `<div class=tiers>${R.map((n, i) => `<div class="${i === cur ? "me" : ""}">${badge(i, 30)}<span style="color:${RL[i]}">${n}</span></div>`).join("")}</div>`;
}
