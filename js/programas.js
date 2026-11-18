// FORJA · Programas por semanas: cada fase cambia series, repeticiones e intensidad (RIR = repeticiones en reserva)
// fases: [semanaInicio, semanaFin, nombre, series, repeticiones, consejo]
const PROGS = [
  { id: "ini8", ic: "🌱", n: "Iniciación", w: 8, sty: "fb", lvl: "Principiante", d: "Aprende la técnica de los básicos, crea el hábito y gana tus primeros kilos.",
    f: [[1, 2, "Técnica", 3, "12-15", "RIR 4: peso cómodo. Graba alguna serie para revisar la técnica."], [3, 6, "Progresión lineal", 3, "10-12", "Cuando completes todas las series, sube 1–2,5 kg."], [7, 7, "Descarga", 2, "10-12", "Mitad de series para que el cuerpo asimile."], [8, 8, "Test", 3, "8-10", "Busca récords y mira cómo suben tus rangos."]] },
  { id: "hip12", ic: "💪", n: "Hipertrofia", w: 12, sty: "ppl", lvl: "Intermedio", d: "Periodización por bloques para ganar el máximo músculo con 5–6 días.",
    f: [[1, 4, "Acumulación", 3, "10-12", "RIR 3: mucho volumen con técnica impecable."], [5, 8, "Intensificación", 4, "8-10", "RIR 2: sube el peso respecto al bloque anterior."], [9, 11, "Sobrecarga", 4, "6-8", "RIR 1: las series más duras del programa."], [12, 12, "Descarga", 2, "10", "Recupera; la semana que viene empiezas un ciclo más fuerte."]] },
  { id: "fue8", ic: "🏋️", n: "Fuerza 5×5", w: 8, sty: "ul", lvl: "Intermedio", d: "Sube tus marcas en sentadilla, banca, peso muerto y press militar.",
    f: [[1, 3, "Base", 5, "5", "Empieza con el 75 % de tu 1RM y suma 2,5 kg por sesión."], [4, 6, "Intensidad", 5, "3", "Series de 3 al 85 %. Descansa 3–4 min."], [7, 7, "Pico", 3, "2", "Dobles pesados al 90 %, técnica perfecta."], [8, 8, "Test", 3, "1-3", "Prueba tu 1RM o 3RM y registra la marca."]] },
  { id: "phul", ic: "⚡", n: "PHUL potencia + hipertrofia", w: 10, sty: "ul", lvl: "Avanzado", d: "Torso y pierna 4 días: dos de fuerza y dos de volumen.",
    f: [[1, 4, "Bloque 1", 4, "5-8", "Días 1–2 pesados (3–5 reps); días 3–4 de volumen (8–12)."], [5, 8, "Bloque 2", 4, "6-10", "Sube 2,5 kg en los básicos cada 2 semanas."], [9, 9, "Descarga", 2, "8", "Mitad de volumen."], [10, 10, "Test", 3, "3-5", "Récords en los básicos."]] },
  { id: "def10", ic: "🔥", n: "Definición", w: 10, sty: "def", lvl: "Todos", d: "Pierde grasa manteniendo la fuerza, con cardio progresivo.",
    f: [[1, 4, "Adaptación", 3, "12-15", "Déficit suave y 8.000 pasos al día."], [5, 8, "Quema", 4, "10-12", "Mantén los pesos; sube a 10.000 pasos."], [9, 9, "Descarga", 2, "12", "Baja el volumen, mantén la dieta."], [10, 10, "Recta final", 3, "10-12", "Fotos y medidas: compara con la semana 1."]] },
  { id: "glu12", ic: "🍑", n: "Glúteo de acero", w: 12, sty: "glu", lvl: "Todos", d: "Prioriza glúteos e isquios con progresión en hip thrust y sentadilla.",
    f: [[1, 4, "Activación", 3, "12-15", "Conexión mente-músculo y pausa de 1 s arriba."], [5, 8, "Carga", 4, "8-12", "Sube peso en hip thrust cada semana si puedes."], [9, 11, "Fuerza", 4, "6-8", "Series pesadas en los básicos de cadera."], [12, 12, "Descarga", 2, "12", "Recupera y mide tu progreso."]] },
  { id: "cal8", ic: "🌳", n: "Calistenia", w: 8, sty: "cal", lvl: "Todos", d: "Domina tu peso corporal: dominadas, fondos y pistol.",
    f: [[1, 3, "Base", 3, "AMRAP-2", "Deja 2 repeticiones en reserva."], [4, 6, "Progresiones", 4, "6-10", "Pasa a la variante más difícil cuando hagas 10."], [7, 7, "Descarga", 2, "8", "Calidad sobre cantidad."], [8, 8, "Test", 3, "AMRAP", "¿Cuántas dominadas seguidas haces ahora?"]] },
  { id: "exp6", ic: "⏱️", n: "Express 30 min", w: 6, sty: "fb", mins: 30, lvl: "Todos", d: "Poco tiempo: sesiones intensas de media hora.",
    f: [[1, 3, "Circuito", 3, "12", "Descansos de 45–60 s entre series."], [4, 6, "Densidad", 3, "10", "Mismo trabajo en menos tiempo: descansa 40 s."]] },
  { id: "vuelta4", ic: "🔄", n: "Vuelta tras un parón", w: 4, sty: "fb", lvl: "Todos", d: "Recupera la forma sin lesionarte tras semanas sin entrenar.",
    f: [[1, 2, "Reactivación", 2, "12-15", "Pesos al 50–60 % de lo que movías antes."], [3, 4, "Recuperación", 3, "10-12", "Sube poco a poco; la fuerza vuelve rápido."]] },
  { id: "arn12", ic: "🏆", n: "Arnold clásico", w: 12, sty: "arn", lvl: "Avanzado", d: "Pecho+espalda, hombro+brazo y pierna, como en la edad de oro.",
    f: [[1, 6, "Volumen", 4, "8-12", "Superseries pecho-espalda; mucho bombeo."], [7, 11, "Intensidad", 4, "6-10", "Sube peso y añade una serie al primer ejercicio."], [12, 12, "Descarga", 2, "10", "Recupera para el siguiente ciclo."]] },
];
const progById = (id) => PROGS.find((x) => x.id === id);
function progWeek() {
  const P = U.prog && progById(U.prog.id); if (!P) return null;
  const w = Math.min(P.w, Math.floor((new Date(today()) - new Date(U.prog.start)) / (7 * 864e5)) + 1);
  const f = P.f.find((x) => w >= x[0] && w <= x[1]) || P.f[P.f.length - 1];
  return { P, w, f, done: (new Date(today()) - new Date(U.prog.start)) / (7 * 864e5) >= P.w };
}
// Series y repeticiones de un ejercicio según la fase del programa
function progEx(e) {
  const pw = progWeek();
  if (!pw || e.g == "cardio" || e.g == "personal") return { s: e.s, r: e.r };
  const iso = /plancha|hollow|l-sit|isométric/i.test(e.n);
  return { s: pw.f[3], r: iso ? "30-60 s" : pw.f[4] };
}
function progStart(id) {
  const P = progById(id); if (!P) return;
  U.prog = { id, start: today() };
  U.p.sty = P.sty;
  if (P.mins) U.p.mins = P.mins;
  U.routine = gen(U.p); D = 0;
  sv(); cm(); app(); boom(); toast(`Programa "${P.n}" activado 💪`);
}
function progStop() { delete U.prog; sv(); app(); }
function progCard() {
  const pw = progWeek();
  if (!pw) return `<div class="card prog"><div class=row><div><b>📈 Sigue un programa</b><br><small>Progresión semana a semana con descargas y test de fuerza.</small></div><button class="btn sm" onclick="progSheet()">Ver programas</button></div></div>`;
  const { P, w, f } = pw;
  return `<div class="card prog on"><div class=row><div><small>${P.ic} Programa · semana ${w} de ${P.w}</small><br><b style="font-size:18px">${P.n}: ${f[2]}</b></div><button class=lnk onclick="progSheet()">Cambiar</button></div><div class=pweeks>${Array.from({ length: P.w }, (_, i) => { const fz = P.f.find((x) => i + 1 >= x[0] && i + 1 <= x[1]); return `<i class="${i + 1 < w ? "d" : i + 1 == w ? "c" : ""} ${/descarga/i.test(fz[2]) ? "dl" : /test|pico/i.test(fz[2]) ? "ts" : ""}" title="Semana ${i + 1}: ${fz[2]}"></i>`; }).join("")}</div><p style="margin:8px 0 0"><b>${f[3]} series × ${f[4]}</b> · ${f[5]}</p>${pw.done ? `<p class=mut style="margin:6px 0 0">🎉 ¡Programa completado! Elige el siguiente.</p>` : ""}</div>`;
}
function progSheet() {
  const cur = U.prog && U.prog.id;
  $("#xm").innerHTML = `<div class=sheet><div class=row><b style="font-size:19px">📈 Programas</b><button class=lnk onclick="cm()">✕</button></div><p class=mut style="margin:4px 0 12px">Al activar uno, tu rutina se adapta a su estilo y las series y repeticiones cambian cada semana según la fase.</p>
${PROGS.map((P) => `<div class="card pcard ${cur == P.id ? "on" : ""}"><div class=row><div style="display:flex;gap:12px;align-items:center"><span class=pic>${P.ic}</span><div><b>${P.n}</b><br><small>${P.w} semanas · ${STYN[P.sty]} · ${P.lvl}</small></div></div>${cur == P.id ? `<button class="btn sm ghost" onclick="progStop();cm()">Dejar</button>` : `<button class="btn sm" onclick="progStart('${P.id}')">Empezar</button>`}</div><p style="margin:8px 0 6px;font-size:14px">${P.d}</p><div class=phs>${P.f.map((x) => `<span><b>S${x[0]}${x[1] != x[0] ? "–" + x[1] : ""}</b> ${x[2]} · ${x[3]}×${x[4]}</span>`).join("")}</div></div>`).join("")}</div>`;
  $("#xm").classList.add("open");
}
