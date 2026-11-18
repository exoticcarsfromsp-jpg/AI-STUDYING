// FORJA · Modo cocina: genera los pasos de cada plato a partir de sus ingredientes y gramos,
// y los anima en 3D (js/three/cocina.js)
const ICOL = {
  avena: ["#d9b77c", "grano"], leche: ["#f7f3ea", "liquido"], plátano: ["#f3d04a", "rodaja"], huevo: ["#f6c642", "huevo"], claras: ["#fffbe8", "liquido"],
  "pan integral": ["#a8703a", "pan"], "yogur griego": ["#fbfbf7", "liquido"], nueces: ["#9c6b3c", "cubo"], fruta: ["#e5304a", "esfera"], aguacate: ["#7fb547", "rodaja"],
  tomate: ["#e0322b", "rodaja"], chía: ["#3b3b3b", "grano"], "bebida de avena": ["#efe6d6", "liquido"], "tortita de arroz": ["#f1e6c8", "rodaja"], pavo: ["#f0c9b0", "loncha"],
  "queso fresco": ["#fbf8ef", "cubo"], pollo: ["#f2d4b0", "filete"], arroz: ["#f7f4ec", "grano"], brócoli: ["#2f9a3e", "esfera"], "pasta integral": ["#d6a85a", "tira"],
  atún: ["#d9b2a0", "grano"], ternera: ["#a2382c", "filete"], patata: ["#e8c98a", "cubo"], ensalada: ["#7fc25a", "hoja"], lentejas: ["#7a5230", "grano"],
  zanahoria: ["#ef7d22", "rodaja"], espinacas: ["#2f8f3a", "hoja"], salmón: ["#f2845c", "filete"], quinoa: ["#e8d9a8", "grano"], espárragos: ["#5aa64a", "tira"],
  boniato: ["#e57a2e", "cubo"], "judías verdes": ["#4f9e35", "tira"], garbanzos: ["#e1b96b", "esfera"], merluza: ["#f6f1e8", "filete"], calabaza: ["#f08a24", "cubo"],
  wrap: ["#e9d3a3", "pan"], gambas: ["#f39a7a", "tira"], champiñón: ["#d9c7ad", "rodaja"], tofu: ["#f4ecd2", "cubo"], maíz: ["#f5d142", "grano"], manzana: ["#d8392b", "rodaja"],
  almendras: ["#b07a46", "cubo"], requesón: ["#fbfbf7", "cubo"], miel: ["#e8a317", "liquido"], "crema de cacahuete": ["#b07a3a", "liquido"], hummus: ["#d9c08a", "liquido"],
  "proteína en polvo": ["#c9a36b", "polvo"], "aceite de oliva": ["#c9b13a", "liquido"], "cerdo magro": ["#e8b6a0", "filete"], cuscús: ["#ead49a", "grano"], calabacín: ["#5f9a3e", "rodaja"],
  bacalao: ["#f6f1e8", "filete"], "judías blancas": ["#f1ead9", "esfera"], pimiento: ["#d9262c", "tira"], cebolla: ["#efe0d0", "tira"], "salsa de tomate": ["#c8281f", "liquido"],
  "ternera picada": ["#a8463a", "grano"], mejillones: ["#2b2b3a", "esfera"], edamame: ["#79c043", "esfera"], sardinas: ["#8fa3b5", "filete"], berenjena: ["#4b2a5a", "rodaja"],
  pulpo: ["#c46a7a", "rodaja"], "mozzarella light": ["#fbf8ef", "rodaja"], caballa: ["#7f95a8", "filete"], sepia: ["#f2ece2", "tira"], guisantes: ["#6dbb45", "esfera"],
  pepino: ["#66a84a", "rodaja"], kéfir: ["#f7f6f0", "liquido"], "queso cottage": ["#fbfbf7", "grano"], arándanos: ["#3b4aa8", "esfera"], fresas: ["#e5304a", "rodaja"],
  granola: ["#c9893c", "grano"], "mantequilla de almendra": ["#b98a5a", "liquido"], "pan de centeno": ["#6e4a2c", "pan"], "jamón serrano": ["#b8423e", "loncha"],
  tempeh: ["#c9a46a", "cubo"], coliflor: ["#f3efe2", "esfera"], remolacha: ["#8a1e3c", "rodaja"], dátiles: ["#5a3418", "esfera"], "cacao puro": ["#3e2415", "polvo"],
  aceitunas: ["#4a5a24", "esfera"], "semillas de calabaza": ["#5f7a3a", "grano"], lubina: ["#cfd6dc", "filete"], dorada: ["#d4d0c2", "filete"],
  "pasta de legumbres": ["#d98a3a", "tira"], "tortilla de maíz": ["#f0d58a", "pan"], "pavo picado": ["#e6b7a0", "grano"], "fideos de arroz": ["#f3efe3", "tira"], "salsa de soja": ["#3a1f10", "liquido"], "queso parmesano": ["#f3dc8a", "polvo"], "leche de coco light": ["#fbf8ef", "liquido"],
};
// Crudo → cocido (multiplicador de peso)
const COCIDO = { "fideos de arroz": 2.4, arroz: 2.5, "pasta integral": 2.2, "pasta de legumbres": 2.2, quinoa: 2.7, cuscús: 2.5, lentejas: 2.5, garbanzos: 2.2, "judías blancas": 2.3 };
const N = (a) => tr(a); // nombre del ingrediente en el idioma activo
const gtxt = (a, g) => L("{0} g de {1}", g, N(a));
const lista = (I) => { const x = I.map(([a, g]) => gtxt(a, g)); return x.length > 1 ? x.slice(0, -1).join(", ") + Y() + x[x.length - 1] : x.join(""); };

function pasos(m, I) {
  const n = m.n.toLowerCase(), has = (a) => I.find((x) => x[0] === a), S = [];
  const batido = /batido|smoothie/.test(n);
  if (batido) {
    S.push({ a: "verter", t: L("Pon en la batidora los líquidos: {0}.", lista(I.filter(([a]) => ICOL[a]?.[1] === "liquido"))) });
    const resto = I.filter(([a]) => ICOL[a]?.[1] !== "liquido");
    if (resto.length) S.push({ a: "cortar", t: L("Añade troceado: {0}.", lista(resto)) });
    S.push({ a: "batir", t: L("Bate a máxima potencia hasta que quede sin grumos."), min: 1 });
    S.push({ a: "emplatar", t: L("Sírvelo en un vaso grande y bébelo al momento.") });
    return S;
  }
  const crudos = ["tomate", "ensalada", "pepino", "zanahoria", "aguacate", "remolacha", "fruta", "fresas", "plátano", "manzana", "cebolla", "pimiento", "calabacín", "berenjena", "champiñón", "calabaza", "patata", "boniato", "coliflor", "brócoli"];
  const cortar = I.filter(([a]) => crudos.includes(a));
  const carb = I.filter(([a]) => COCIDO[a]);
  const prot = I.filter(([a]) => ["pollo", "pavo", "ternera", "cerdo magro", "ternera picada", "pavo picado", "salmón", "merluza", "bacalao", "lubina", "dorada", "sardinas", "caballa", "sepia", "pulpo", "gambas", "mejillones", "tofu", "tempeh"].includes(a));
  const huevos = I.filter(([a]) => a === "huevo" || a === "claras");
  const verdCoc = I.filter(([a]) => ["brócoli", "judías verdes", "espárragos", "coliflor", "calabacín", "berenjena", "pimiento", "champiñón", "espinacas", "calabaza", "cebolla", "guisantes"].includes(a));
  const horno = /horno|gratinad|rellen|asad/.test(n);
  const crema = /crema de|puré/.test(n);
  if (cortar.length) S.push({ a: "cortar", t: L("Lava y corta: {0}.", lista(cortar)) });
  // Hidratos que hay que cocer
  for (const [a, g] of carb) {
    const c = Math.round(g * COCIDO[a]);
    if (/lentejas|garbanzos|judías/.test(a)) S.push({ a: "hervir", t: L("Usa {0} cocidas de bote ({1} g escurridas equivalen a tus {2} g en seco) o cuécelas de antemano. Caliéntalas 5 minutos.", N(a), c, g), min: 5 });
    else if (a === "cuscús") S.push({ a: "reposar", t: L("Pon {0} g de cuscús en un bol, cubre con {0} ml de agua hirviendo con sal y tapa 5 minutos. Separa los granos con un tenedor (≈ {1} g cocido).", g, c), min: 5 });
    else S.push({ a: "hervir", t: L("Cuece {0} en agua con sal (quedarán ≈ {1} g cocidos).", gtxt(a, g), c), min: a === "arroz" || a === "quinoa" ? 12 : 10 });
  }
  if (has("avena") && !/tortita|tortilla/.test(n)) S.push({ a: "hervir", t: has("leche") || has("bebida de avena") ? L("Calienta {0} con {1} removiendo hasta que espese.", gtxt("avena", has("avena")[1]), gtxt(has("leche") ? "leche" : "bebida de avena", (has("leche") || has("bebida de avena"))[1])) : L("Calienta {0} con agua removiendo hasta que espese.", gtxt("avena", has("avena")[1])), min: 4 });
  if (has("patata") || has("boniato")) {
    const tub = I.filter(([a]) => a === "patata" || a === "boniato");
    if (horno || has("boniato")) S.push({ a: "horno", t: L("Asa {0} en dados a 200 °C.", lista(tub)), min: 25 });
    else S.push({ a: "hervir", t: L("Cuece {0} en agua con sal hasta que estén tiernas.", lista(tub)), min: 18 });
  }
  // Huevos
  if (huevos.length) {
    const h = lista(huevos);
    if (/tortilla|tortitas/.test(n)) { S.push({ a: "batir", t: has("avena") ? L("Bate {0} con una pizca de sal y {1}.", h, gtxt("avena", has("avena")[1])) : L("Bate {0} con una pizca de sal.", h) }); S.push({ a: "plancha", t: L("Cuaja en la sartén a fuego medio, dale la vuelta y termina."), min: 4 }); }
    else if (/revuelto|revueltos/.test(n)) { S.push({ a: "batir", t: L("Bate {0}.", h) }); S.push({ a: "saltear", t: L("Remueve en la sartén a fuego bajo hasta que cuaje cremoso."), min: 3 }); }
    else if (/al plato/.test(n)) S.push({ a: "horno", t: L("Casca {0} sobre la salsa y hornea a 200 °C hasta que cuaje la clara.", h), min: 10 });
    else S.push({ a: "hervir", t: L("Cuece {0} 10 minutos, enfría en agua fría y pela.", h), min: 10 });
  }
  // Proteína principal
  for (const [a, g] of prot) {
    if (/picad/.test(a)) S.push({ a: "saltear", t: L("Dora {0} desmenuzándola.", gtxt(a, g)), min: 6 });
    else if (a === "pavo" && /tortita|sándwich|pan de|tostada|tomate$/i.test(n)) S.push({ a: "verter", t: L("Sirve {0}.", gtxt(a, g)) }); // pavo en lonchas
    else if (a === "gambas") S.push({ a: "saltear", t: L("Saltea {0} a fuego fuerte.", gtxt(a, g)), min: 3 });
    else if (a === "mejillones") S.push({ a: "hervir", t: L("Haz {0} al vapor con la olla tapada hasta que se abran.", gtxt(a, g)), min: 5 });
    else if (a === "pulpo") S.push({ a: "hervir", t: L("Calienta {0} (ya cocido) y córtalo en rodajas.", gtxt(a, g)), min: 3 });
    else if (a === "tofu" || a === "tempeh") S.push({ a: "saltear", t: L("Seca y corta en dados {0}; dóralo por todos los lados.", gtxt(a, g)), min: 7 });
    else if (horno && /salmón|merluza|bacalao|lubina|dorada/.test(a)) S.push({ a: "horno", t: L("Hornea {0} a 200 °C con sal y limón.", gtxt(a, g)), min: /lubina|dorada/.test(a) ? 18 : 12 });
    else S.push({ a: "plancha", t: /pollo|pavo|cerdo/.test(a) ? L("Haz {0} a la plancha con sal y pimienta hasta que esté bien hecho por dentro.", gtxt(a, g)) : L("Haz {0} a la plancha con sal y pimienta.", gtxt(a, g)), min: /pollo|pavo|cerdo/.test(a) ? 8 : /ternera/.test(a) ? 4 : 5 });
  }
  if (verdCoc.length) {
    if (crema) { S.push({ a: "hervir", t: L("Cuece {0} cubiertos de agua.", lista(verdCoc)), min: 15 }); S.push({ a: "batir", t: L("Tritura con parte del caldo hasta que quede fina."), min: 1 }); }
    else if (verdCoc.every(([a]) => ["brócoli", "judías verdes", "espárragos", "coliflor", "guisantes"].includes(a))) S.push({ a: "hervir", t: L("Cuece al vapor {0}.", lista(verdCoc)), min: 5 });
    else S.push({ a: "saltear", t: has("aceite de oliva") ? L("Saltea {0} con {1}.", lista(verdCoc), gtxt("aceite de oliva", has("aceite de oliva")[1])) : L("Saltea {0}.", lista(verdCoc)), min: 5 });
  }
  if (has("pan integral") || has("pan de centeno")) S.push({ a: "tostar", t: L("Tuesta {0}.", lista(I.filter(([a]) => /^pan/.test(a)))), min: 3 });
  if (has("wrap") || has("tortilla de maíz")) S.push({ a: "plancha", t: L("Calienta {0} 30 segundos por lado.", lista(I.filter(([a]) => a === "wrap" || a === "tortilla de maíz"))), min: 1 });
  const frios = I.filter(([a]) => ["yogur griego", "kéfir", "queso cottage", "requesón", "queso fresco", "hummus", "leche", "bebida de avena", "salsa de tomate"].includes(a) && !(a === "leche" && has("avena")));
  if (frios.length) S.push({ a: "verter", t: L("Sirve {0}.", lista(frios)) });
  const top = I.filter(([a]) => ["nueces", "almendras", "chía", "miel", "granola", "semillas de calabaza", "cacao puro", "crema de cacahuete", "mantequilla de almendra", "arándanos", "dátiles", "aceitunas", "mozzarella light", "jamón serrano", "atún", "maíz", "edamame", "proteína en polvo"].includes(a));
  if (top.length) S.push({ a: "mezclar", t: L("Añade y mezcla: {0}.", lista(top)) });
  const oil = has("aceite de oliva");
  S.push({ a: "emplatar", t: oil ? L("Emplata y aliña con {0} (≈ {1} cucharadas). ¡Listo!", gtxt("aceite de oliva", oil[1]), String(Math.round((oil[1] / 10) * 10) / 10).replace(".", ",")) : L("Emplata. ¡Listo!") });
  return S;
}
const recipiente = (n) => (/batido|smoothie|kéfir con|pudin/i.test(n) ? "vaso" : /bowl|crema|yogur|porridge|gachas|lentejas|curry|ensalada|hummus|requesón|cottage|edamame|aceitunas/i.test(n) ? "bol" : "plato");

let CK = null;
async function cook(d, tp) {
  const x = dayPlan(d).meals.find((q) => q.tp === tp); if (!x) return;
  const steps = pasos(x.m, x.I), rec = { id: x.m.n, ing: x.I.map(([a]) => ({ n: a, col: (ICOL[a] || ["#ccc"])[0], forma: (ICOL[a] || [0, "cubo"])[1] })), recipiente: recipiente(x.m.n) };
  CK = { steps, i: 0, rec, scene: null, t: 0, int: null };
  $("#xm").innerHTML = `<div class="sheet cook"><div class=row><div><small>👩‍🍳 Cocínalo tú · ${Math.round(x.k)} kcal · ${f1(x.M.p)} g proteína</small><br><b style="font-size:19px">${esc(x.m.n)}</b></div><button class=lnk onclick="cm()">✕</button></div>
<div class=ck3d id=ck3d><span class=cka id=cka></span></div><div class=sdots id=sdots>${steps.map(() => "<i></i>").join("")}</div>
<p class=ckt id=ckt></p><div id=ckm></div>
<div class=row style="gap:8px"><button class="btn ghost" onclick="ckGo(-1)">← Anterior</button><button class="btn ghost" style="width:auto" onclick="ckVoz()" title="Leer en voz alta">🔊</button><button class=btn id=ckn onclick="ckGo(1)">Siguiente →</button></div>
<h2>Ingredientes</h2><div class=ckig>${x.I.map(([a, g]) => `<label><input type=checkbox><i style="background:${(ICOL[a] || ["#ccc"])[0]}"></i><b>${g} g</b> ${a}${unitTxt(a, g) ? ` <small>${unitTxt(a, g)}</small>` : ""}</label>`).join("")}</div></div>`;
  $("#xm").classList.add("open");
  try {
    const { KitchenScene } = await import("./three/cocina.js");
    if (!CK || !$("#ck3d")) return;
    CK.scene = new KitchenScene($("#ck3d"));
  } catch (e) { console.error("3D cocina", e); $("#ck3d").insertAdjacentHTML("beforeend", "<small style='padding:20px;display:block'>Tu navegador no puede mostrar el 3D.</small>"); }
  ckGo(0);
}
const CKN = { cortar: "Cortar", hervir: "Cocer", saltear: "Saltear", plancha: "A la plancha", mezclar: "Mezclar", batir: "Batir", horno: "Horno", tostar: "Tostar", emplatar: "Emplatar", reposar: "Reposar", verter: "Servir" };
function ckGo(dx) {
  if (!CK) return;
  if (dx > 0 && CK.i === CK.steps.length - 1) { boom(); toast("¡Que aproveche! 💪"); return cm(); }
  CK.i = Math.max(0, Math.min(CK.steps.length - 1, CK.i + dx));
  const s = CK.steps[CK.i];
  clearInterval(CK.int); CK.int = null; CK.t = (s.min || 0) * 60;
  $("#cka").textContent = `Paso ${CK.i + 1}/${CK.steps.length} · ${CKN[s.a] || s.a}`;
  $("#ckt").textContent = s.t; $("#ckt").setAttribute("data-notr", "");
  document.querySelectorAll("#sdots i").forEach((d, i) => d.classList.toggle("on", i <= CK.i));
  $("#ckn").textContent = CK.i === CK.steps.length - 1 ? "¡Terminado! 🎉" : "Siguiente →";
  CK.scene?.setStep(s, CK.rec, CK.i);
  ckT();
}
function ckT() {
  const s = CK.steps[CK.i], el = $("#ckm"); if (!el) return;
  if (!s.min) { el.innerHTML = ""; return; }
  el.innerHTML = `<div class=cktm><b>${Math.floor(CK.t / 60)}:${String(CK.t % 60).padStart(2, "0")}</b><button class="btn sm" onclick="ckPlay()">${CK.int ? "⏸ Pausar" : "▶ Temporizador"}</button></div>`;
}
function ckPlay() {
  if (CK.int) { clearInterval(CK.int); CK.int = null; return ckT(); }
  CK.int = setInterval(() => { CK.t--; if (CK.t <= 0) { clearInterval(CK.int); CK.int = null; CK.t = 0; try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (e) {} toast("⏰ ¡Tiempo! Pasa al siguiente paso"); } ckT(); }, 1000);
  ckT();
}
function ckVoz() { if (!("speechSynthesis" in window) || !CK) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(CK.steps[CK.i].t); u.lang = LANGS[LANG][2]; speechSynthesis.speak(u); }
function ckClose() { if (!CK) return; clearInterval(CK.int); try { speechSynthesis.cancel(); } catch (e) {} CK.scene?.dispose(); CK = null; }
