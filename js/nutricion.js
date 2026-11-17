// FORJA · Motor de nutrición
// Valores por 100 g de alimento tal como se pesa (crudo / escurrido), referencias BEDCA y USDA.
// [proteína, hidratos disponibles, grasa, fibra]  →  kcal según el reglamento UE 1169/2011:
// 4 kcal/g proteína · 4 kcal/g hidratos · 9 kcal/g grasa · 2 kcal/g fibra
const NUT = {
  avena: [13.5, 58.7, 7, 10], leche: [3.2, 4.7, 1.6, 0], plátano: [1.1, 20, 0.3, 2.6], huevo: [12.6, 0.7, 9.5, 0],
  claras: [10.9, 0.7, 0.2, 0], "pan integral": [9.5, 41, 3.4, 7], "yogur griego": [9, 4, 5, 0], nueces: [15, 7, 65, 6.7],
  fruta: [0.7, 12, 0.3, 2], aguacate: [2, 1.8, 15, 6.7], tomate: [0.9, 2.6, 0.2, 1.2], chía: [17, 7.7, 31, 34],
  "bebida de avena": [0.5, 7, 1.5, 0.8], "tortita de arroz": [8, 78, 3, 4], pavo: [22, 0, 1.5, 0], "queso fresco": [11, 3.5, 4, 0],
  pollo: [23, 0, 1.5, 0], arroz: [7, 78, 0.6, 1.3], brócoli: [2.8, 4, 0.4, 2.6], "pasta integral": [13, 62, 2.5, 8],
  atún: [25, 0, 1, 0], ternera: [21, 0, 5, 0], patata: [2, 15.6, 0.1, 2.1], ensalada: [1.3, 1.5, 0.2, 1.5],
  lentejas: [24, 48, 1.5, 11], zanahoria: [0.9, 7, 0.2, 2.8], espinacas: [2.9, 1.4, 0.4, 2.2], salmón: [20, 0, 13, 0],
  quinoa: [14, 57, 6, 7], espárragos: [2.2, 2, 0.1, 2.1], boniato: [1.6, 17, 0.1, 3], "judías verdes": [1.8, 4, 0.2, 2.7],
  garbanzos: [20.5, 48, 6, 12], merluza: [17, 0, 1.8, 0], calabaza: [1, 5.5, 0.1, 1], wrap: [8.5, 49, 7.5, 3],
  gambas: [20, 0, 1, 0], champiñón: [3.1, 0.5, 0.3, 2.5], tofu: [13, 1.5, 7.5, 1], maíz: [3, 14, 1.2, 3.6],
  manzana: [0.3, 12, 0.2, 2.4], almendras: [21, 7, 52, 12], requesón: [11, 3.5, 4, 0], miel: [0.3, 82, 0, 0],
  "crema de cacahuete": [25, 13, 50, 7], hummus: [7.5, 11, 17, 6], "proteína en polvo": [78, 7, 6, 0], "aceite de oliva": [0, 0, 100, 0],
  "cerdo magro": [21.5, 0, 5, 0], cuscús: [12.8, 72, 0.6, 5], calabacín: [1.2, 2.2, 0.3, 1], bacalao: [18, 0, 0.7, 0],
  "judías blancas": [21, 45, 1.5, 18], pimiento: [1, 4.5, 0.3, 1.7], cebolla: [1.1, 7.6, 0.1, 1.7], "salsa de tomate": [1.5, 5.5, 0.3, 1.5],
  "ternera picada": [19, 0, 10, 0], mejillones: [12, 3.5, 2, 0], edamame: [11, 7.6, 5, 5], sardinas: [21, 0, 10, 0],
  berenjena: [1, 2.5, 0.2, 3], pulpo: [15, 2, 1, 0], "mozzarella light": [20, 1.5, 10, 0], caballa: [19, 0, 13, 0],
  sepia: [16, 0.8, 0.7, 0], guisantes: [5.4, 9, 0.4, 5.7], pepino: [0.7, 2.5, 0.1, 0.5], kéfir: [3.4, 4, 3, 0],
  "queso cottage": [11, 3.4, 4.3, 0], arándanos: [0.7, 12, 0.3, 2.4], fresas: [0.7, 6, 0.3, 2], granola: [9, 60, 16, 7],
  "mantequilla de almendra": [21, 8, 55, 10], "pan de centeno": [8.5, 45, 1.7, 6], "jamón serrano": [30, 0, 10, 0],
  tempeh: [19, 6, 11, 5], coliflor: [1.9, 3, 0.3, 2], remolacha: [1.6, 8, 0.2, 2.8], dátiles: [2.5, 66, 0.4, 7],
  "cacao puro": [20, 11, 11, 33], aceitunas: [1, 1, 15, 3], "semillas de calabaza": [30, 5, 49, 6], lubina: [18, 0, 3, 0],
  dorada: [19, 0, 4, 0], "pasta de legumbres": [22, 48, 2.5, 9], "tortilla de maíz": [5.7, 45, 3, 6], "pavo picado": [20, 0, 6, 0],
};
const kcal100 = (a) => { const n = NUT[a] || [0, 0, 0, 0]; return 4 * n[0] + 4 * n[1] + 9 * n[2] + 2 * n[3]; };
// Compatibilidad con el resto de la app (ING = kcal/100 g, MAC = [P, C, G])
for (const a in NUT) ING[a] = kcal100(a);
const MAC = Object.fromEntries(Object.keys(NUT).map((a) => [a, NUT[a].slice(0, 3)]));

// Peso de una unidad para mostrar equivalencias ("2 huevos")
const UNIT = { huevo: [60, "huevo", "huevos"], plátano: [120, "plátano", "plátanos"], manzana: [180, "manzana", "manzanas"], "tortita de arroz": [10, "tortita", "tortitas"],
  wrap: [60, "wrap", "wraps"], "tortilla de maíz": [30, "tortilla", "tortillas"], "pan integral": [35, "rebanada", "rebanadas"], "pan de centeno": [35, "rebanada", "rebanadas"],
  dátiles: [8, "dátil", "dátiles"], aguacate: [150, "aguacate", "aguacates"], "proteína en polvo": [30, "cacito", "cacitos"], "aceite de oliva": [10, "cucharada", "cucharadas"],
  miel: [7, "cucharadita", "cucharaditas"], claras: [33, "clara", "claras"], tomate: [120, "tomate", "tomates"] };
const unitTxt = (a, g) => { const u = UNIT[a]; if (!u) return ""; const n = Math.round((g / u[0]) * 2) / 2; return n >= 0.5 ? `≈ ${String(n).replace(".", ",")} ${n === 1 ? u[1] : u[2]}` : ""; };

const mac = (I) => I.reduce((o, [a, g]) => { const m = NUT[a] || [0, 0, 0, 0]; o.p += (g * m[0]) / 100; o.c += (g * m[1]) / 100; o.f += (g * m[2]) / 100; o.fi += (g * m[3]) / 100; return o; }, { p: 0, c: 0, f: 0, fi: 0 });
const kcl = (I) => I.reduce((s, [a, g]) => s + (g * kcal100(a)) / 100, 0);
const mk = (m) => kcl(m.it);

// Rol de cada alimento para ajustar el día: p = proteico, c = hidratos, f = grasa, v = verdura/fijo
function role(a) {
  const n = NUT[a]; if (!n) return "v";
  const k = kcal100(a);
  if (k < 50) return "v";
  if ((4 * n[0]) / k >= 0.35) return "p";
  return 4 * n[1] >= 9 * n[2] ? "c" : "f";
}
const fine = (a) => ["aceite de oliva", "miel", "cacao puro", "chía", "nueces", "almendras", "semillas de calabaza", "crema de cacahuete", "mantequilla de almendra", "aceitunas", "dátiles", "granola", "proteína en polvo"].includes(a);
const STEP = (a) => (a === "huevo" ? 60 : fine(a) ? 1 : 5);
const rnd = (a, g) => Math.max(STEP(a), Math.round(g / STEP(a)) * STEP(a));

// Resuelve un sistema 3×3 (Cramer)
function solve3(A, b) {
  const d = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = d(A); if (Math.abs(D) < 1e-9) return null;
  return [0, 1, 2].map((k) => d(A.map((r, i) => r.map((v, j) => (j === k ? b[i] : v)))) / D);
}

// Ración máxima razonable por comida (g) para que las cantidades sean comestibles
const CAP = { arroz: 150, "pasta integral": 150, "pasta de legumbres": 150, quinoa: 130, cuscús: 130, avena: 120, patata: 450, boniato: 400, "pan integral": 140, "pan de centeno": 140,
  "tortita de arroz": 60, wrap: 130, "tortilla de maíz": 120, fruta: 300, plátano: 240, manzana: 360, maíz: 200, lentejas: 130, garbanzos: 130, "judías blancas": 130, miel: 30, dátiles: 60,
  granola: 80, nueces: 40, almendras: 40, "crema de cacahuete": 40, "mantequilla de almendra": 40, "aceite de oliva": 25, aceitunas: 60, chía: 40, "semillas de calabaza": 40, hummus: 150,
  huevo: 240, claras: 400, "yogur griego": 400, kéfir: 400, leche: 500, "bebida de avena": 500, "queso cottage": 300, requesón: 300, "queso fresco": 250, "proteína en polvo": 60,
  aguacate: 200, edamame: 250, tofu: 300, tempeh: 250, "mozzarella light": 125, "jamón serrano": 100, "cacao puro": 20, granola2: 0 };
const capOf = (a, base) => CAP[a] || (role(a) === "v" ? 600 : Math.max(350, base * 2.5));
// Alimentos extra para cuadrar el día (según tipo de dieta y alergias)
const ALG = { huevo: "huevo", claras: "huevo", "queso fresco": "lactosa", "yogur griego": "lactosa", tofu: "soja", edamame: "soja", "pan integral": "gluten", avena: "gluten" };
function fillers(kind) {
  const p = U.p, dz = [...(p.dis || [])], al = p.al || [];
  const ok = (a) => !(ALG[a] && al.includes(ALG[a])) && !dz.some((x) => a.includes(x)) && !(p.dt == "veg" && MEAT.includes(a)) && !(p.dt == "vgn" && (MEAT.includes(a) || ANI.includes(a)));
  const L = { c: p.dt == "lc" ? [] : ["arroz", "pan integral", "patata", "avena", "plátano"], p: ["pavo", "pollo", "claras", "queso fresco", "pasta de legumbres", "tofu", "tempeh", "edamame"], f: ["aceite de oliva", "aguacate", "almendras"] }[kind];
  return L.filter(ok);
}
// Plan de un día con raciones exactas para cuadrar kcal y macros del objetivo
const DPC = {};
function dayPlan(d) {
  const t = { ...tgt() }, key = d + "|" + JSON.stringify(U.ch) + "|" + JSON.stringify(t) + "|" + (U.p.dis || []).join(",");
  if (DPC[d] && DPC[d].key === key) return DPC[d].v;
  const meals = act().map((tp) => ({ tp, m: pick(d, tp) })).filter((x) => x.m);
  // 1) cada comida a su porcentaje de calorías del día
  meals.forEach((x) => { const f = Math.min(2.2, Math.max(0.45, (t.k * sh(x.tp)) / mk(x.m))); x.I = x.m.it.map(([a, g]) => [a, g * f]); x.cap = Object.fromEntries(x.m.it.map(([a, g]) => [a, capOf(a, g)])); });
  // 2) factores por rol (proteico, hidratos, grasa) para clavar P, C y G
  const tot = (r) => { const o = { p: 0, c: 0, f: 0 }; meals.forEach((x) => x.I.forEach(([a, g]) => { if (role(a) !== r) return; const n = NUT[a]; o.p += (g * n[0]) / 100; o.c += (g * n[1]) / 100; o.f += (g * n[2]) / 100; })); return o; };
  const fixed = tot("v"), R3 = ["p", "c", "f"].map(tot);
  const T = [t.pr - fixed.p, t.ca - fixed.c, t.fa - fixed.f];
  let x = solve3([[R3[0].p, R3[1].p, R3[2].p], [R3[0].c, R3[1].c, R3[2].c], [R3[0].f, R3[1].f, R3[2].f]], T) || [1, 1, 1];
  x = x.map((v) => (isFinite(v) ? Math.min(4, Math.max(0.3, v)) : 1));
  meals.forEach((m) => (m.I = m.I.map(([a, g]) => { const r = role(a); return [a, Math.min(m.cap[a], r === "v" ? g : g * x["pcf".indexOf(r)])]; })));
  // 3) redondeo y ajuste fino gramo a gramo. La fibra aporta 2 kcal/g (etiquetado UE), así que los hidratos
  //    objetivo se recalculan para que kcal, proteína, hidratos y grasa cuadren a la vez.
  meals.forEach((m) => (m.I = m.I.map(([a, g]) => [a, rnd(a, g)])));
  const all = () => meals.flatMap((m) => m.I);
  const lc = U.p.dt == "lc";
  const tc = () => (lc ? t.ca : Math.max(20, (t.k - 4 * t.pr - 9 * t.fa - 2 * mac(all()).fi) / 4));
  const err = () => {
    const M = mac(all()), K = kcl(all()), C = tc();
    const ec = lc ? Math.max(0, M.c - C) / C : Math.abs(M.c - C) / C;
    return (Math.abs(K - t.k) / t.k) * 1.2 + (Math.abs(M.p - t.pr) / t.pr) + ec * 0.7 + (Math.abs(M.f - t.fa) / t.fa) * 0.7;
  };
  const tune = () => { for (let it = 0; it < 400; it++) {
    let best = null, e0 = err();
    meals.forEach((m) => m.I.forEach((row) => {
      if (role(row[0]) === "v" && !lc) return;
      const st = STEP(row[0]), cap = m.cap[row[0]] ?? 400;
      for (const k of [1, -1, 4, -4, 10, -10]) {
        const s = st * k, ng = row[1] + s;
        if (ng < st || ng > cap) continue;
        row[1] = ng; const e = err(); row[1] -= s;
        if (e < e0 - 1e-7 && (!best || e < best[0])) best = [e, row, s];
      }
    }));
    if (!best) break;
    best[1][1] += best[2];
  } };
  tune();
  // Si con raciones razonables no se llega, se añaden extras (comida, cena, desayuno) y se vuelve a ajustar
  const hosts = ["c", "n", "d", "s", "m"].map((tp) => meals.find((m) => m.tp === tp)).filter(Boolean);
  let add = false;
  for (const k of ["p", "c", "f"]) {
    const ix = "pcf".indexOf(k), M = mac(all());
    let rem = { p: t.pr - M.p, c: tc() - M.c, f: t.fa - M.f }[k];
    const lim = { p: t.pr * 0.02, c: tc() * 0.03, f: t.fa * 0.04 }[k];
    for (const a of fillers(k)) for (const h of hosts) {
      if (rem <= lim) break;
      if (h.I.some((r) => r[0] === a)) continue;
      const per = NUT[a][ix] / 100, cap = Math.min(capOf(a, 100), k === "f" ? 15 : 9e9);
      const g = rnd(a, Math.min(cap, rem / per));
      if (g * per < lim / 2) continue;
      h.I.push([a, g, 1]); h.cap[a] = cap; rem -= g * per; add = true;
      break;
    }
  }
  if (add) tune();
  t.caPlan = tc();
  meals.forEach((m) => { m.M = mac(m.I); m.k = kcl(m.I); });
  const A = all(), M = mac(A);
  const v = { meals, k: kcl(A), p: M.p, c: M.c, f: M.f, fi: M.fi, t, ca: t.caPlan };
  DPC[d] = { key, v };
  return v;
}
// Raciones de una comida concreta dentro del plan del día
function por(m, t, k, d) {
  const dp = dayPlan(d == null ? DD : d), x = dp.meals.find((q) => q.tp === t && q.m === m);
  return x ? x.I : m.it;
}

// Agua: 35 ml por kg + 500 ml por hora de entrenamiento + 250 ml extra si la dieta es alta en proteína
function waterTarget(k) {
  const base = Math.round((bw() * 35) / 50) * 50;
  const entrena = dayStat(k || today()).lg.length > 0;
  return { base, entreno: entrena ? 600 : 0, total: base + (entrena ? 600 : 0) };
}
const waterMl = (k) => { const h = U.hm && U.hm[k] != null ? U.hm[k] : ((U.h || {})[k] || 0) * 250; return h; };

// Supermercados (búsqueda directa en su web)
const SM = {
  mercadona: ["Mercadona", "https://tienda.mercadona.es/search-results?query="],
  lidl: ["Lidl", "https://www.lidl.es/q/search?q="],
  carrefour: ["Carrefour", "https://www.carrefour.es/?q="],
  dia: ["Dia", "https://www.dia.es/search?q="],
  alcampo: ["Alcampo", "https://www.compraonline.alcampo.es/search?q="],
  condis: ["Condis", "https://compraonline.condisline.com/search?q="],
  eroski: ["Eroski", "https://supermercado.eroski.es/es/search/results/?q="],
  eci: ["El Corte Inglés", "https://www.elcorteingles.es/supermercado/buscar/?term="],
  consum: ["Consum", "https://tienda.consum.es/es/s/"],
  bonarea: ["bonÀrea", "https://www.bonarea.com/es/search?q="],
  amazon: ["Amazon", "https://www.amazon.es/s?i=grocery&k="],
};
const shopUrl = (k, q) => { const s = SM[k] || SM.mercadona; return s[1] + encodeURIComponent(q); };
// Búsqueda más útil en el súper que el nombre genérico
const SHOPQ = { pollo: "pechuga de pollo", pavo: "pechuga de pavo", ternera: "filete de ternera", ensalada: "lechuga mezcla ensalada", fruta: "fruta", claras: "claras de huevo",
  "proteína en polvo": "proteína whey", atún: "atún al natural", "salsa de tomate": "tomate triturado", "queso fresco": "queso fresco batido 0%", "yogur griego": "yogur griego",
  "cacao puro": "cacao puro en polvo", "tortita de arroz": "tortitas de arroz", wrap: "tortillas de trigo wrap", "tortilla de maíz": "tortillas de maíz", "pasta de legumbres": "pasta de lentejas" };
const shopQ = (a) => SHOPQ[a] || a;
