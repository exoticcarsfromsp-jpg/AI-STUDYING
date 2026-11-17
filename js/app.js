// FORJA — aplicación principal (router por hash + vistas)
import { EJERCICIOS, ejercicioById, EQUIPOS, youtubeUrl } from './data/exercises.js';
import { RUTINAS, PLANES, rutinaById, planById } from './data/routines.js';
import { RECETAS, DIETAS, recetaById, dietaById } from './data/recipes.js';
import { SUPLEMENTOS, ACCESORIOS, productoById } from './data/products.js';
import { RANKS, MUSCULOS, badgeSVG, SIN_RANGO } from './data/ranks.js';
import { bodyMapHTML } from './bodymap.js';
import { dishImage, productSVG } from './illustrations.js';
import { store, logsDe, mejorMarca, rangoEjercicio, rangoMusculo, rangoGlobal, pesoActual, rachaSemanas, volumenLog, tdee, uid, hoy, cargaSerie } from './store.js';
import { esc, $, $$, toast, modal, lineChart, SetLogger, startRest, confetti, beep, icon, fmtKg, fmtFecha, celebrarRango } from './ui.js';

const app = $('#app');
let cleanup = [];
const onLeave = (fn) => cleanup.push(fn);

// ───────────── Navegación ─────────────
const NAV = [
  ['inicio', 'Inicio', 'home'], ['entreno', 'Entrenar', 'dumbbell'], ['ejercicios', 'Ejercicios', 'list'],
  ['nutricion', 'Nutrición', 'food'], ['progreso', 'Progreso', 'chart'],
];
const NAV_DESK = [...NAV.slice(0, 3), ['rutinas', 'Rutinas', 'cal'], ['planes', 'Planes', 'trophy'], ['nutricion', 'Nutrición', 'food'], ['equipo', 'Equipo', 'bag'], ['progreso', 'Progreso', 'chart']];
$('#bottomnav').innerHTML = NAV.map(([r, t, i]) => `<a href="#/${r}" data-r="${r}">${icon(i)}<span>${t}</span></a>`).join('');
$('#topnav').innerHTML = NAV_DESK.map(([r, t]) => `<a href="#/${r}" data-r="${r}">${t}</a>`).join('');

const ROUTES = {
  inicio: vInicio, ejercicios: vEjercicios, ejercicio: vEjercicio, rutinas: vRutinas, rutina: vRutina, entreno: vEntreno,
  planes: vPlanes, plan: vPlan, nutricion: vNutricion, receta: vReceta, cocinar: vCocinar, dieta: vDieta,
  equipo: vEquipo, progreso: vProgreso, rangos: vRangos, perfil: vPerfil,
};
const GRUPO_NAV = { ejercicio: 'ejercicios', rutina: 'rutinas', plan: 'planes', receta: 'nutricion', cocinar: 'nutricion', dieta: 'nutricion', rangos: 'inicio', perfil: 'progreso' };

function router() {
  cleanup.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  cleanup = [];
  const [ruta = 'inicio', ...args] = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  const fn = ROUTES[ruta] || vInicio;
  const grupo = GRUPO_NAV[ruta] || ruta;
  $$('[data-r]').forEach(a => a.classList.toggle('on', a.dataset.r === grupo || (grupo === 'rutinas' && a.dataset.r === 'entreno' && innerWidth < 900)));
  app.innerHTML = '';
  $$('.modal-bg').forEach(m => m.remove());
  const view = document.createElement('div'); view.className = 'view'; app.appendChild(view);
  try { fn(view, ...args); } catch (e) { console.error(e); view.innerHTML = `<div class="card">Ups, algo ha fallado: ${esc(e.message)}</div>`; }
  window.scrollTo({ top: 0 });
  pintarChip();
}
addEventListener('hashchange', router);

function pintarChip() {
  const g = rangoGlobal();
  $('#chipRank').innerHTML = `${badgeSVG(g, 26)}<span>${g.nombre}</span>`;
}

// ───────────── Ayudantes visuales ─────────────
const COLOR_MUSC = { pecho: '#d8394b', hombros: '#2457d6', biceps: '#7fbff2', triceps: '#4f8fd6', antebrazos: '#6b7078', abdominales: '#9fc4c2', oblicuos: '#7aa9a7',
  trapecio: '#35c06a', dorsales: '#8a6cf0', lumbares: '#b0703a', gluteos: '#e8336d', cuadriceps: '#ff6a1a', isquios: '#c2364a', aductores: '#e6bf2e', gemelos: '#c9a400' };
const muscIco = (m) => `<div class="musc-ico" style="background:linear-gradient(135deg, ${COLOR_MUSC[m]}, #14171c)">${esc(MUSCULOS[m].slice(0, 2).toUpperCase())}</div>`;

function exItem(ej, extra = '') {
  const r = rangoEjercicio(ej.id);
  return `<a class="item" href="#/ejercicio/${ej.id}">
    <div class="ico">${muscIco(ej.m)}</div>
    <div class="grow"><h4>${esc(ej.nombre)}</h4><div class="sub">${esc(MUSCULOS[ej.m])} · ${esc(EQUIPOS[ej.eq])} · ${esc(ej.nivel)}</div>${extra}</div>
    <div title="${r.rank.nombre}">${badgeSVG(r.rank, 34)}</div>
  </a>`;
}
function recetaCard(r) {
  return `<a class="media-card" href="#/receta/${r.id}">
    <div class="media">${dishImage(r)}<span class="corner tag hot">${esc(r.tipo)}</span></div>
    <div class="body"><h3 style="margin:0">${esc(r.nombre)}</h3>
      <div class="macros"><span class="kcal">${r.macros.kcal} kcal</span><span>P ${r.macros.p} g</span><span>C ${r.macros.c} g</span><span>G ${r.macros.g} g</span></div>
      <div class="small muted">⏱ ${r.tiempo} min · ${esc(r.dificultad)} · 🧑‍🍳 paso a paso 3D</div></div></a>`;
}
function prodCard(p) {
  return `<button class="media-card" data-prod="${p.id}" style="text-align:left;cursor:pointer;padding:0">
    <div class="media" style="aspect-ratio:1/1;background:#14171c">${productSVG(p)}${p.evidencia ? `<span class="corner evid ${p.evidencia}" title="Nivel de evidencia">${p.evidencia}</span>` : ''}</div>
    <div class="body"><h4 style="margin:0">${esc(p.nombre)}</h4><div class="small muted">${esc((p.para || '').split('.')[0])}.</div></div></button>`;
}
function abrirProducto(id) {
  const p = productoById(id); if (!p) return;
  const usado = EJERCICIOS.filter(e => e.acc.includes(p.id));
  modal(`<div class="row" style="align-items:flex-start;gap:16px">
      <div style="width:130px;height:130px;flex:none;border-radius:16px;overflow:hidden;background:#14171c">${productSVG(p)}</div>
      <div class="grow" style="flex:1;min-width:180px"><span class="tag hot">${p.tipo === 'suplemento' ? 'Suplemento' : 'Accesorio'}</span>
        <h2 style="margin-top:8px">${esc(p.nombre)}</h2>
        ${p.evidencia ? `<div class="row small"><span class="evid ${p.evidencia}">${p.evidencia}</span> <span class="muted">Evidencia científica ${{ A: 'fuerte', B: 'moderada', C: 'limitada' }[p.evidencia]}</span></div>` : ''}
      </div></div>
    <dl class="kv" style="margin-top:14px">
      <dt>¿Qué es?</dt><dd>${esc(p.que)}</dd>
      <dt>¿Para qué?</dt><dd>${esc(p.para)}</dd>
      ${p.dosis ? `<dt>Dosis</dt><dd>${esc(p.dosis)}</dd>` : ''}${p.cuando ? `<dt>Cuándo</dt><dd>${esc(p.cuando)}</dd>` : ''}
      ${p.uso ? `<dt>Cómo usarlo</dt><dd>${esc(p.uso)}</dd>` : ''}${p.ojo ? `<dt>Ojo</dt><dd>${esc(p.ojo)}</dd>` : ''}
      <dt>Precio aprox.</dt><dd>${esc(p.precio)}</dd>
    </dl>
    ${usado.length ? `<h3 style="margin-top:16px">Recomendado en</h3><div class="tags">${usado.map(e => `<a class="tag" href="#/ejercicio/${e.id}" onclick="document.querySelector('.modal-bg')?.remove()">${esc(e.nombre)}</a>`).join('')}</div>` : ''}
    <p class="small muted" style="margin-top:14px">Información general, no es consejo médico. Si tienes alguna patología consulta con un profesional.</p>`);
}
document.addEventListener('click', (e) => { const b = e.target.closest('[data-prod]'); if (b) { e.preventDefault(); abrirProducto(b.dataset.prod); } });

function rankCard(ej) {
  const r = rangoEjercicio(ej.id);
  const mb = mejorMarca(ej.id);
  const u = ej.modo === 'tiempo' ? 's' : ej.modo === 'reps' ? 'reps' : 'kg';
  return `<div class="card"><div class="row" style="gap:14px">
    ${badgeSVG(r.rank, 64)}
    <div style="flex:1;min-width:180px">
      <div class="small muted">Tu rango en este ejercicio</div>
      <h2 style="margin:2px 0 6px;color:${r.rank.id === 'none' ? 'var(--text)' : r.rank.claro}">${r.rank.nombre}</h2>
      ${ej.std ? `<div class="progress"><i style="width:${Math.round(r.progreso * 100)}%"></i></div>
      <div class="small muted" style="margin-top:6px">${r.siguiente ? `Siguiente: <b>${r.siguiente.nombre}</b> → ${esc(r.objetivo)}` : '¡Rango máximo alcanzado! 👑'}</div>` : ''}
      ${mb ? `<div class="small" style="margin-top:4px">Mejor marca: <b>${fmtKg(mb.valor)} ${u}</b>${ej.modo === 'peso' || ej.modo === 'corporal' ? ` (${fmtKg(mb.set.kg)} kg × ${mb.set.reps})` : ''} · ${fmtFecha(mb.fecha)}</div>` : ''}
    </div></div></div>`;
}

// ───────────── INICIO ─────────────
function vInicio(v) {
  const st = store.get();
  const g = rangoGlobal();
  const semana = new Set(st.logs.filter(l => (Date.now() - new Date(l.fecha)) / 864e5 < 7).map(l => l.fecha)).size;
  const conMarca = new Set(st.logs.map(l => l.ej)).size;
  const plan = st.perfil.plan && planById(st.perfil.plan);
  v.innerHTML = `
    ${st.activa ? `<a class="card row between" href="#/entreno" style="border-color:var(--accent);margin-bottom:14px"><div><b>Entreno en curso</b><div class="small muted">${esc(st.activa.titulo)}</div></div><span class="btn sm primary">Continuar</span></a>` : ''}
    <section class="hero">
      <div class="row between" style="align-items:flex-start">
        <div style="flex:1;min-width:220px">
          <div class="small muted">${saludo()}${st.perfil.nombre ? ', ' + esc(st.perfil.nombre) : ''}</div>
          <h1>Forja tu <span class="accent">mejor versión</span></h1>
          <p class="muted">Registra tus series, sube de rango cada músculo y come como un campeón.</p>
          <div class="row"><a class="btn primary" href="#/entreno">${icon('play')} Empezar entreno</a><a class="btn" href="#/rutinas">Ver rutinas</a></div>
        </div>
        <a href="#/rangos" style="text-align:center">${badgeSVG(g, 92)}<div style="font-family:var(--font-h);margin-top:4px">${g.nombre.toUpperCase()}</div><div class="small muted">Rango global</div></a>
      </div>
    </section>
    <div class="grid g4 section" style="margin-top:14px">
      <div class="kpi"><b>${semana}</b><span>días entrenados (7 días)</span></div>
      <div class="kpi"><b>${rachaSemanas()}</b><span>semanas de racha 🔥</span></div>
      <div class="kpi"><b>${conMarca}</b><span>ejercicios con marca</span></div>
      <div class="kpi"><b>${fmtKg(pesoActual())} kg</b><span>peso corporal</span></div>
    </div>
    <div class="grid g2 section">
      <div class="card">
        <div class="section-h"><h2>Tu mapa muscular</h2><a href="#/rangos">Cómo funciona →</a></div>
        <div data-map>${bodyMapHTML(rangoMusculo)}</div>
        <div class="legend">${RANKS.map(r => `<div class="${r.id === g.id ? 'me' : ''}">${badgeSVG(r, 34)}<span style="color:${r.claro}">${r.nombre}</span></div>`).join('')}</div>
        <p class="small muted" style="margin-top:8px">Toca un músculo para ver sus ejercicios. Los músculos grises aún no tienen rango: registra un ejercicio para desbloquearlo.</p>
      </div>
      <div class="stack">
        ${plan ? `<div class="card"><div class="small muted">Tu plan activo</div><h2>${plan.icono} ${esc(plan.nombre)}</h2>${planSemana(plan)}<div class="row" style="margin-top:10px"><a class="btn sm" href="#/plan/${plan.id}">Ver plan</a><a class="btn sm primary" href="#/rutina/${plan.rutina}">Entreno de hoy</a></div></div>`
          : `<div class="card"><h2>Elige un plan</h2><p class="muted">Rutina + dieta + progresión semana a semana.</p><div class="grid" style="gap:8px">${PLANES.slice(0, 3).map(p => `<a class="item" href="#/plan/${p.id}"><div class="ico" style="font-size:1.6rem">${p.icono}</div><div class="grow"><h4>${esc(p.nombre)}</h4><div class="sub">${esc(p.objetivo)}</div></div></a>`).join('')}</div></div>`}
        <div class="card"><div class="section-h"><h2>Mejores marcas</h2><a href="#/progreso">Todo →</a></div>${topMarcas()}</div>
        <div class="card"><div class="section-h"><h2>Atajos</h2></div><div class="grid g2" style="gap:8px">
          <a class="btn" href="#/nutricion">🥗 Calorías y dietas</a><a class="btn" href="#/equipo">💊 Suplementos</a>
          <a class="btn" href="#/ejercicios">🏋️ Ejercicios 3D</a><a class="btn" href="#/perfil">⚙️ Mi perfil</a></div></div>
      </div>
    </div>
    <div class="section"><div class="section-h"><h2>Cocina de hoy</h2><a href="#/nutricion">Ver recetas →</a></div>
      <div class="grid g3">${pickDia(RECETAS, 3).map(recetaCard).join('')}</div></div>`;
  $('[data-map]', v).addEventListener('click', (e) => {
    const g = e.target.closest('.musc'); if (g) abrirMusculo(g.dataset.m);
  });
}
function saludo() { const h = new Date().getHours(); return h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; }
function pickDia(list, n) { const d = new Date().getDate(); return Array.from({ length: n }, (_, i) => list[(d * 3 + i * 7) % list.length]); }
function planSemana(plan) {
  const ini = store.get().perfil.planInicio;
  const sem = ini ? Math.min(plan.semanas, Math.floor((Date.now() - new Date(ini)) / (7 * 864e5)) + 1) : 1;
  const fase = plan.fases.find(f => { const [a, b = a] = f.semanas.split('–').map(Number); return sem >= a && sem <= b; }) || plan.fases[0];
  return `<div class="small">Semana <b>${sem}</b> de ${plan.semanas} · <span class="accent">${esc(fase.titulo)}</span></div><div class="progress" style="margin:8px 0"><i style="width:${sem / plan.semanas * 100}%"></i></div><p class="small muted">${esc(fase.texto)}</p>`;
}
function topMarcas() {
  const ids = [...new Set(store.get().logs.map(l => l.ej))];
  if (!ids.length) return `<div class="empty small">Aún no hay registros. Entra en un ejercicio y registra tu primera serie.</div>`;
  return ids.map(id => ({ ej: ejercicioById(id), mb: mejorMarca(id), r: rangoEjercicio(id) })).filter(x => x.ej && x.mb)
    .sort((a, b) => b.r.idx - a.r.idx).slice(0, 5)
    .map(x => `<a class="rank-row" href="#/ejercicio/${x.ej.id}">${badgeSVG(x.r.rank, 36)}<div><b>${esc(x.ej.nombre)}</b><div class="small muted">${x.r.rank.nombre}</div></div><span style="font-family:var(--font-h)">${fmtKg(x.mb.valor)} ${x.ej.modo === 'reps' ? 'reps' : x.ej.modo === 'tiempo' ? 's' : 'kg'}</span></a>`).join('');
}
function abrirMusculo(m) {
  const r = rangoMusculo(m);
  const ejs = EJERCICIOS.filter(e => e.m === m);
  const sec = EJERCICIOS.filter(e => e.sec.includes(m));
  modal(`<div class="row">${badgeSVG(r, 56)}<div><div class="small muted">Músculo</div><h2 style="margin:0">${MUSCULOS[m]}</h2><div style="color:${r.claro}">${r.nombre}</div></div></div>
    <h3 style="margin-top:16px">Ejercicios principales</h3><div class="grid" style="gap:8px">${ejs.map(e => exItem(e)).join('') || '<p class="muted">—</p>'}</div>
    ${sec.length ? `<h3 style="margin-top:16px">También lo trabajan</h3><div class="tags">${sec.map(e => `<a class="tag" href="#/ejercicio/${e.id}">${esc(e.nombre)}</a>`).join('')}</div>` : ''}`,
  (el, close) => el.addEventListener('click', (e) => { if (e.target.closest('a')) close(); }));
}

// ───────────── EJERCICIOS ─────────────
function vEjercicios(v) {
  const st = { q: '', m: 'todos', eq: 'todos' };
  v.innerHTML = `<h1>Ejercicios</h1><p class="muted">${EJERCICIOS.length} ejercicios con modelo 3D animado, vídeo, consejos y registro.</p>
    <input class="search" placeholder="Buscar ejercicio…" data-q>
    <div class="tabs" style="margin-top:12px" data-m><button class="on" data-v="todos">Todos</button>${Object.entries(MUSCULOS).map(([k, n]) => `<button data-v="${k}">${n}</button>`).join('')}</div>
    <div class="tabs" data-eq><button class="on" data-v="todos">Todo el equipo</button>${Object.entries(EQUIPOS).map(([k, n]) => `<button data-v="${k}">${n}</button>`).join('')}</div>
    <div class="grid g2" data-list></div>`;
  const pintar = () => {
    const q = st.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const l = EJERCICIOS.filter(e => (st.m === 'todos' || e.m === st.m || e.sec.includes(st.m)) && (st.eq === 'todos' || e.eq === st.eq)
      && e.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
    $('[data-list]', v).innerHTML = l.map(e => exItem(e)).join('') || '<div class="empty">No hay resultados</div>';
  };
  $('[data-q]', v).oninput = (e) => { st.q = e.target.value; pintar(); };
  for (const k of ['m', 'eq']) $(`[data-${k}]`, v).onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', e.currentTarget).forEach(x => x.classList.toggle('on', x === b)); st[k] = b.dataset.v; pintar();
  };
  pintar();
}

async function montarVisor(contenedor, ej) {
  try {
    const { ExerciseViewer } = await import('./three/mannequin.js');
    const viewer = new ExerciseViewer(contenedor, ej);
    onLeave(() => viewer.dispose());
    return viewer;
  } catch (e) {
    console.error(e);
    contenedor.innerHTML = `<div class="empty">No se pudo cargar el visor 3D en este navegador.<br><a class="btn yt" style="margin-top:10px" target="_blank" rel="noopener" href="${youtubeUrl(ej)}">Ver en YouTube</a></div>`;
  }
}

function vEjercicio(v, id) {
  const ej = ejercicioById(id);
  if (!ej) { v.innerHTML = '<div class="empty">Ejercicio no encontrado</div>'; return; }
  const rutinas = RUTINAS.filter(r => r.dias.some(d => d.ej.some(([x]) => x === id)));
  v.innerHTML = `<a class="small muted" href="#/ejercicios">← Ejercicios</a>
    <div class="ex-layout" style="margin-top:8px">
      <div class="sticky stack">
        <div class="viewer" data-viewer>
          <span class="vhint">Arrastra para girar · pellizca para zoom</span>
          <div class="vlegend"><span><i class="dot" style="background:#ff5a1a"></i>Principal</span><span><i class="dot" style="background:#ffb347"></i>Secundario</span></div>
          <div class="vctl">
            <button data-c="play">⏸ Pausa</button><button data-c="s0.5">0.5×</button><button data-c="s1" class="on">1×</button><button data-c="s1.5">1.5×</button>
            <button data-c="frente">Frente</button><button data-c="lado">Lado</button><button data-c="diagonal">3/4</button><button data-c="rot">⟳ Auto</button>
          </div>
        </div>
        <div class="row"><a class="btn yt" target="_blank" rel="noopener" href="${youtubeUrl(ej)}">${icon('yt')} Ver vídeos en YouTube</a>
          <button class="btn" data-fav>${store.get().favoritas.includes(id) ? '★ Favorito' : '☆ Favorito'}</button></div>
      </div>
      <div class="stack">
        <div><h1 style="margin-bottom:8px">${esc(ej.nombre)}</h1>
          <div class="tags"><span class="tag hot">${MUSCULOS[ej.m]}</span>${ej.sec.map(m => `<span class="tag">${MUSCULOS[m]}</span>`).join('')}<span class="tag">${EQUIPOS[ej.eq]}</span><span class="tag">${ej.nivel}</span></div>
          <div class="row small muted" style="margin-top:10px">🎯 Recomendado: <b style="color:var(--text)">${esc(ej.pres)}</b> · ⏱ Descanso: <b style="color:var(--text)">${Math.floor(ej.descanso / 60)}:${String(ej.descanso % 60).padStart(2, '0')}</b>
            <button class="btn sm" data-rest-start>${icon('timer')} Iniciar descanso</button></div>
        </div>
        ${rankCard(ej)}
        <div class="card"><div class="section-h"><h2>Registrar hoy</h2><span class="small muted">${fmtFecha(hoy())}</span></div><div data-logger></div></div>
        <div class="card"><h2>Cómo se hace</h2><p>${esc(ej.como)}</p>
          <h3 style="margin-top:14px">Tips</h3><ul class="clean tips">${ej.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
          <h3 style="margin-top:14px">Observaciones y errores comunes</h3><ul class="clean tips bad">${ej.err.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>
        ${ej.acc.length ? `<div class="card"><h2>Accesorios recomendados</h2><div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(130px,1fr))">${ej.acc.map(a => productoById(a)).filter(Boolean).map(prodCard).join('')}</div></div>` : ''}
        <div class="card"><h2>Tu evolución</h2><div data-chart></div><h3 style="margin-top:14px">Historial</h3><div data-hist></div></div>
        ${rutinas.length ? `<div class="card"><h2>Aparece en</h2><div class="tags">${rutinas.map(r => `<a class="tag" href="#/rutina/${r.id}">${esc(r.nombre)}</a>`).join('')}</div></div>` : ''}
      </div>
    </div>`;

  let viewer;
  montarVisor($('[data-viewer]', v), ej).then(x => viewer = x);
  $('.vctl', v).onclick = (e) => {
    const b = e.target.closest('button'); if (!b || !viewer) return;
    const c = b.dataset.c;
    if (c === 'play') b.textContent = viewer.toggle() ? '⏸ Pausa' : '▶ Play';
    else if (c.startsWith('s')) { viewer.setSpeed(+c.slice(1)); $$('[data-c^="s"]', v).forEach(x => x.classList.toggle('on', x === b)); }
    else if (c === 'rot') { b.classList.toggle('on'); viewer.autoRotate(b.classList.contains('on')); }
    else viewer.view(c);
  };
  $('[data-rest-start]', v).onclick = () => startRest(ej.descanso);
  $('[data-fav]', v).onclick = (e) => {
    const f = store.get().favoritas; const i = f.indexOf(id);
    i >= 0 ? f.splice(i, 1) : f.push(id); store.save();
    e.target.textContent = i >= 0 ? '☆ Favorito' : '★ Favorito';
  };
  const pintarHist = () => {
    const logs = logsDe(id);
    $('[data-chart]', v).innerHTML = lineChart(porDia(logs, ej), { unidad: ej.modo === 'reps' ? 'reps' : ej.modo === 'tiempo' ? 's' : 'kg' }) + `<div class="small muted">${ej.modo === 'peso' || ej.modo === 'corporal' ? 'Mejor 1RM estimado por día (fórmula de Epley)' : 'Mejor serie por día'}</div>`;
    $('[data-hist]', v).innerHTML = histHTML(logs, ej);
  };
  new SetLogger($('[data-logger]', v), ej, { onSetDone: () => startRest(ej.descanso), onSaved: () => { pintarHist(); refrescarRank(); } });
  const refrescarRank = () => { const c = $$('.card', v).find(x => x.querySelector('.badge') && x.textContent.includes('Tu rango')); if (c) c.outerHTML = rankCard(ej); pintarChip(); };
  pintarHist();
  v.addEventListener('click', (e) => {
    const d = e.target.closest('[data-del]'); if (!d) return;
    if (!confirm('¿Borrar este registro?')) return;
    const st = store.get(); st.logs = st.logs.filter(l => l.id !== d.dataset.del); store.save(); pintarHist(); refrescarRank();
  });
}
function porDia(logs, ej) {
  const m = new Map();
  for (const l of logs) { const best = Math.max(...l.sets.map(s => cargaSerie(ej, s))); m.set(l.fecha, Math.max(m.get(l.fecha) || 0, best)); }
  return [...m.entries()].sort().map(([f, y]) => ({ x: fmtFecha(f), y: Math.round(y * 10) / 10 }));
}
function histHTML(logs, ej) {
  if (!logs.length) return '<div class="empty small">Sin registros todavía</div>';
  let best = 0;
  const marcas = new Set();
  for (const l of logs) for (const s of l.sets) { const c = cargaSerie(ej, s); if (c > best) { best = c; marcas.add(s); } }
  return [...logs].reverse().slice(0, 15).map(l => `<div class="hist-item"><div class="row between"><b>${fmtFecha(l.fecha)}</b><span class="small muted">${ej.modo === 'peso' ? 'Vol. ' + fmtKg(volumenLog(l)) + ' kg · ' : ''}<button class="btn sm ghost" data-del="${l.id}" title="Borrar">🗑</button></span></div>
    ${l.sets.map(s => `<span class="setpill ${marcas.has(s) ? 'pr' : ''}">${ej.modo === 'reps' || ej.modo === 'tiempo' ? s.reps + (ej.modo === 'tiempo' ? ' s' : ' reps') : `${fmtKg(s.kg)}${ej.modo === 'corporal' ? ' lastre' : ''} × ${s.reps}`}${s.rpe ? ' @' + s.rpe : ''}</span>`).join('')}</div>`).join('');
}

// ───────────── RUTINAS ─────────────
function vRutinas(v) {
  v.innerHTML = `<h1>Rutinas</h1><p class="muted">${RUTINAS.length} rutinas para todos los niveles. Elige una y pulsa empezar: FORJA te guía serie a serie.</p>
    <div class="tabs" data-f><button class="on" data-v="">Todas</button>${['Principiante', 'Intermedio', 'Avanzado'].map(n => `<button data-v="${n}">${n}</button>`).join('')}<button data-v="3">3 días</button><button data-v="4">4 días</button><button data-v="6">5–6 días</button></div>
    <div class="grid g2" data-list></div>
    <div class="section card row between"><div><h2>¿Buscas algo más completo?</h2><p class="muted" style="margin:0">Los planes combinan rutina + dieta + progresión.</p></div><a class="btn primary" href="#/planes">Ver planes</a></div>`;
  const pintar = (f = '') => {
    $('[data-list]', v).innerHTML = RUTINAS.filter(r => !f || r.nivel === f || (f === '6' ? r.diasSemana >= 5 : String(r.diasSemana) === f)).map(rutinaCard).join('');
  };
  $('[data-f]', v).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', e.currentTarget).forEach(x => x.classList.toggle('on', x === b)); pintar(b.dataset.v); };
  pintar();
}
function rutinaCard(r) {
  return `<a class="card" href="#/rutina/${r.id}" style="border-left:4px solid ${r.color}">
    <div class="row between"><h2 style="margin:0">${esc(r.nombre)}</h2><span class="tag">${esc(r.nivel)}</span></div>
    <p class="muted small" style="margin:6px 0 10px">${esc(r.desc)}</p>
    <div class="tags"><span class="tag">📅 ${r.diasSemana} días/sem</span><span class="tag">⏱ ${esc(r.duracion)}</span><span class="tag hot">🎯 ${esc(r.objetivo)}</span></div></a>`;
}
function vRutina(v, id) {
  const r = rutinaById(id); if (!r) return vRutinas(v);
  v.innerHTML = `<a class="small muted" href="#/rutinas">← Rutinas</a>
    <div class="hero" style="margin-top:8px;border-left:5px solid ${r.color}"><h1>${esc(r.nombre)}</h1><p class="muted">${esc(r.desc)}</p>
      <div class="tags"><span class="tag">${esc(r.nivel)}</span><span class="tag">📅 ${r.diasSemana} días/sem</span><span class="tag">⏱ ${esc(r.duracion)}</span><span class="tag hot">${esc(r.objetivo)}</span></div></div>
    <div class="grid g2 section">${r.dias.map((d, i) => `<div class="card day-card"><h3>${esc(d.nombre)} <button class="btn sm primary" data-start="${i}">${icon('play')} Empezar</button></h3>
      ${d.ej.map(([eid, pres]) => { const e = ejercicioById(eid); const rk = rangoEjercicio(eid); return `<a class="ex-row" href="#/ejercicio/${eid}">${muscIco(e.m).replace('musc-ico', 'musc-ico ico')}<div style="flex:1"><b>${esc(e.nombre)}</b><div class="small muted">${esc(pres)} · ${MUSCULOS[e.m]}</div></div>${badgeSVG(rk.rank, 26)}</a>`; }).join('')}
    </div>`).join('')}</div>
    <div class="card section"><h3>Cómo progresar</h3><ul class="clean tips"><li>Cuando completes todas las series en el máximo de repeticiones, sube el peso (2,5 kg en básicos, 1–2 kg en mancuernas).</li><li>Deja 1–3 repeticiones en reserva (RPE 7–9) en la mayoría de series.</li><li>Cada 6–8 semanas haz una semana de descarga con la mitad de series.</li></ul></div>`;
  $$('[data-start]', v).forEach(b => b.onclick = () => iniciarSesion(r.id, +b.dataset.start));
}
function iniciarSesion(rutinaId, dia) {
  const st = store.get();
  if (st.activa && !confirm('Ya tienes un entreno en curso. ¿Empezar uno nuevo? (se descartará el actual)')) { location.hash = '#/entreno'; return; }
  const r = rutinaId ? rutinaById(rutinaId) : null;
  st.activa = { id: uid(), rutina: rutinaId, dia, titulo: r ? `${r.nombre} · ${r.dias[dia].nombre}` : 'Entreno libre', inicio: Date.now(),
    items: r ? r.dias[dia].ej.map(([ej, pres]) => ({ ej, pres })) : [], borradores: {} };
  store.save();
  location.hash = '#/entreno';
}

// ───────────── SESIÓN DE ENTRENO ─────────────
function vEntreno(v) {
  const st = store.get();
  if (!st.activa) {
    const plan = st.perfil.plan && planById(st.perfil.plan);
    const sug = plan ? rutinaById(plan.rutina) : null;
    v.innerHTML = `<h1>Entrenar</h1><p class="muted">Elige qué toca hoy. Durante el entreno se rellenan los pesos de la última vez y el descanso se activa solo.</p>
      ${sug ? `<div class="card" style="border-color:var(--accent)"><div class="small muted">Tu plan: ${esc(plan.nombre)}</div><h2>${esc(sug.nombre)}</h2><div class="row">${sug.dias.map((d, i) => `<button class="btn primary" data-s="${sug.id}|${i}">${esc(d.nombre)}</button>`).join('')}</div></div>` : ''}
      <div class="card"><h2>Entreno libre</h2><p class="muted">Empieza vacío y añade los ejercicios que quieras.</p><button class="btn" data-s="|0">+ Entreno libre</button></div>
      <h2 class="section">O elige una rutina</h2>
      <div class="grid g2">${RUTINAS.map(r => `<div class="card" style="border-left:4px solid ${r.color}"><div class="row between"><h3 style="margin:0">${esc(r.nombre)}</h3><span class="tag">${r.nivel}</span></div>
        <div class="row" style="margin-top:10px">${r.dias.map((d, i) => `<button class="btn sm" data-s="${r.id}|${i}">${esc(d.nombre)}</button>`).join('')}</div></div>`).join('')}</div>`;
    v.onclick = (e) => { const b = e.target.closest('[data-s]'); if (!b) return; const [r, d] = b.dataset.s.split('|'); iniciarSesion(r || null, +d); };
    return;
  }
  const a = st.activa;
  v.innerHTML = `<div class="session-head"><div class="row between"><div><div class="small muted">Entreno en curso</div><h2 style="margin:0">${esc(a.titulo)}</h2></div>
      <div class="row"><span class="clock" data-clock>0:00</span><button class="btn primary" data-fin>Terminar</button></div></div>
      <div class="progress" style="margin-top:8px"><i data-prog style="width:0"></i></div></div>
    <div class="stack" data-items></div>
    <div class="row section"><button class="btn" data-add>+ Añadir ejercicio</button><button class="btn ghost" data-cancel>Descartar entreno</button></div>`;
  const loggers = new Map();
  const pintarItems = () => {
    const cont = $('[data-items]', v); cont.innerHTML = '';
    a.items.forEach((it, idx) => {
      const ej = ejercicioById(it.ej); if (!ej) return;
      const card = document.createElement('div'); card.className = 'card';
      const mb = mejorMarca(ej.id);
      card.innerHTML = `<div class="row between"><a href="#/ejercicio/${ej.id}" class="row" style="flex:1;min-width:0">${muscIco(ej.m)}<div><h3 style="margin:0">${idx + 1}. ${esc(ej.nombre)}</h3><div class="small muted">Objetivo ${esc(it.pres || ej.pres)} · descanso ${ej.descanso}s${mb ? ` · récord ${fmtKg(mb.valor)}` : ''}</div></div></a>
        <div class="row"><button class="btn sm ghost" data-up="${idx}" title="Subir">↑</button><button class="btn sm ghost" data-rm="${idx}" title="Quitar">✕</button></div></div><div data-log style="margin-top:8px"></div>`;
      cont.appendChild(card);
      const lg = new SetLogger($('[data-log]', card), ej, {
        pres: it.pres, sesion: true, rows: a.borradores[`${idx}:${ej.id}`],
        onSetDone: () => startRest(ej.descanso),
        onChange: (rows) => { a.borradores[`${idx}:${ej.id}`] = rows.map(r => ({ ...r })); store.save(); progreso(); },
      });
      loggers.set(`${idx}:${ej.id}`, { lg, ej });
    });
    progreso();
  };
  const progreso = () => {
    let tot = 0, hech = 0;
    for (const k in a.borradores) { tot += a.borradores[k].length; hech += a.borradores[k].filter(r => r.done).length; }
    const bar = $('[data-prog]', v); if (bar) bar.style.width = (tot ? hech / tot * 100 : 0) + '%';
  };
  pintarItems();
  const reloj = setInterval(() => {
    const s = Math.floor((Date.now() - a.inicio) / 1000);
    const el = $('[data-clock]', v); if (el) el.textContent = `${Math.floor(s / 3600) ? Math.floor(s / 3600) + ':' : ''}${String(Math.floor(s / 60) % 60).padStart(Math.floor(s / 3600) ? 2 : 1, '0')}:${String(s % 60).padStart(2, '0')}`;
  }, 1000);
  onLeave(() => clearInterval(reloj));

  v.onclick = (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.rm !== undefined) { a.items.splice(+t.dataset.rm, 1); a.borradores = {}; store.save(); pintarItems(); }
    else if (t.dataset.up !== undefined) { const i = +t.dataset.up; if (i > 0) { [a.items[i - 1], a.items[i]] = [a.items[i], a.items[i - 1]]; a.borradores = {}; store.save(); pintarItems(); } }
    else if (t.hasAttribute('data-add')) elegirEjercicio((id) => { a.items.push({ ej: id }); store.save(); pintarItems(); });
    else if (t.hasAttribute('data-cancel')) { if (confirm('¿Descartar el entreno? No se guardará nada.')) { st.activa = null; store.save(); location.hash = '#/inicio'; } }
    else if (t.hasAttribute('data-fin')) terminar();
  };
  const terminar = () => {
    const hechos = [...loggers.values()].filter(({ lg }) => lg.rows.some(r => r.done));
    if (!hechos.length && !confirm('No has marcado ninguna serie como completada (✓). ¿Terminar sin guardar?')) return;
    const fecha = hoy();
    const antes = new Map(hechos.map(({ ej }) => [ej.id, rangoEjercicio(ej.id).idx]));
    const recordsAntes = new Map(hechos.map(({ ej }) => [ej.id, mejorMarca(ej.id)?.valor || 0]));
    const ids = [];
    let vol = 0, series = 0;
    for (const { lg, ej } of hechos) {
      const sets = lg.rows.filter(r => r.done && +r.reps > 0).map(r => ({ kg: +r.kg || 0, reps: +r.reps, rpe: r.rpe ? +r.rpe : undefined }));
      if (!sets.length) continue;
      const log = { id: uid(), ej: ej.id, fecha, sets }; st.logs.push(log); ids.push(log.id);
      vol += volumenLog(log); series += sets.length;
    }
    const dur = Math.round((Date.now() - a.inicio) / 60000);
    st.sesiones.push({ id: a.id, rutina: a.rutina, dia: a.dia, titulo: a.titulo, inicio: a.inicio, fin: Date.now(), logs: ids });
    st.activa = null; store.save();
    const prs = hechos.filter(({ ej }) => (mejorMarca(ej.id)?.valor || 0) > (recordsAntes.get(ej.id) || 0) && recordsAntes.get(ej.id) > 0);
    const subidas = hechos.filter(({ ej }) => rangoEjercicio(ej.id).idx > antes.get(ej.id));
    location.hash = '#/inicio';
    setTimeout(() => { confetti(); beep(880, .12, 2); modal(`<div style="text-align:center"><div style="font-size:3rem">🏆</div><h2>¡Entreno completado!</h2>
      <div class="grid g3" style="grid-template-columns:repeat(3,1fr);margin:14px 0"><div class="kpi"><b>${dur}'</b><span>duración</span></div><div class="kpi"><b>${series}</b><span>series</span></div><div class="kpi"><b>${fmtKg(vol)}</b><span>kg de volumen</span></div></div>
      ${prs.length ? `<p>🔥 Nuevos récords: <b>${prs.map(p => esc(p.ej.nombre)).join(', ')}</b></p>` : ''}
      ${subidas.map(({ ej }) => { const r = rangoEjercicio(ej.id).rank; return `<div class="row" style="justify-content:center">${badgeSVG(r, 40)} <b>${esc(ej.nombre)}</b> → ${r.nombre}</div>`; }).join('')}
      <div class="row" style="justify-content:center;margin-top:14px"><a class="btn primary" href="#/inicio" onclick="document.querySelector('.modal-bg')?.remove()">Ver mi mapa</a><a class="btn" href="#/progreso" onclick="document.querySelector('.modal-bg')?.remove()">Progreso</a></div></div>`); }, 80);
  };
}
function elegirEjercicio(cb) {
  modal(`<h2>Añadir ejercicio</h2><input class="search" placeholder="Buscar…" data-q autofocus><div class="grid" style="gap:8px;margin-top:10px" data-l></div>`, (el, close) => {
    const pintar = (q = '') => { $('[data-l]', el).innerHTML = EJERCICIOS.filter(e => e.nombre.toLowerCase().includes(q.toLowerCase())).map(e => `<button class="item" data-id="${e.id}" style="text-align:left;cursor:pointer;width:100%">${muscIco(e.m).replace('musc-ico', 'musc-ico ico')}<div class="grow"><h4>${esc(e.nombre)}</h4><div class="sub">${MUSCULOS[e.m]} · ${EQUIPOS[e.eq]}</div></div></button>`).join(''); };
    pintar();
    $('[data-q]', el).oninput = (e) => pintar(e.target.value);
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-id]'); if (b) { cb(b.dataset.id); close(); } });
  });
}

// ───────────── PLANES ─────────────
function vPlanes(v) {
  v.innerHTML = `<h1>Planes</h1><p class="muted">Programas completos: rutina, dieta y qué hacer cada semana.</p>
    <div class="grid g2">${PLANES.map(p => `<a class="card" href="#/plan/${p.id}" style="border-top:4px solid ${p.color}">
      <div class="row"><span style="font-size:2rem">${p.icono}</span><div><h2 style="margin:0">${esc(p.nombre)}</h2><div class="small muted">${p.semanas} semanas · ${esc(rutinaById(p.rutina).nombre)} · Dieta ${esc(dietaById(p.dieta).nombre)}</div></div></div>
      <p class="muted" style="margin:10px 0 0">${esc(p.objetivo)}</p>${store.get().perfil.plan === p.id ? '<span class="tag hot" style="margin-top:8px">✓ Plan activo</span>' : ''}</a>`).join('')}</div>`;
}
function vPlan(v, id) {
  const p = planById(id); if (!p) return vPlanes(v);
  const r = rutinaById(p.rutina), d = dietaById(p.dieta);
  const activo = store.get().perfil.plan === id;
  v.innerHTML = `<a class="small muted" href="#/planes">← Planes</a>
    <div class="hero" style="margin-top:8px"><div style="font-size:2.6rem">${p.icono}</div><h1>${esc(p.nombre)}</h1><p class="muted">${esc(p.objetivo)}</p>
      <button class="btn ${activo ? '' : 'primary'}" data-act>${activo ? '✓ Plan activo · Desactivar' : 'Activar este plan'}</button></div>
    ${activo ? `<div class="card section">${planSemana(p)}</div>` : ''}
    <div class="grid g2 section">
      <div class="card"><h2>Fases</h2>${p.fases.map(f => `<div class="phase"><div class="small muted">Semanas ${esc(f.semanas)}</div><b>${esc(f.titulo)}</b><p class="small" style="margin:4px 0 0">${esc(f.texto)}</p></div>`).join('')}</div>
      <div class="stack">${rutinaCard(r)}
        <a class="card" href="#/dieta/${d.id}" style="border-left:4px solid ${d.color}"><h2 style="margin:0">${d.icono} Dieta: ${esc(d.nombre)}</h2><p class="muted small" style="margin:6px 0 0">${esc(d.desc)}</p></a></div>
    </div>`;
  $('[data-act]', v).onclick = () => {
    const pf = store.get().perfil;
    if (activo) { delete pf.plan; } else { pf.plan = id; pf.planInicio = hoy(); pf.objetivo = p.dieta; toast(`✅ Plan "${p.nombre}" activado`); }
    store.save(); router();
  };
}

// ───────────── NUTRICIÓN ─────────────
function vNutricion(v, tab = 'recetas') {
  v.innerHTML = `<h1>Nutrición</h1>
    <div class="tabs" data-t><button data-v="recetas">🍳 Recetas</button><button data-v="dietas">🥗 Dietas</button><button data-v="calc">🔢 Calculadora</button></div>
    <div data-c></div>`;
  const tabs = {
    recetas: (c) => {
      c.innerHTML = `<p class="muted">Cada receta tiene foto, macros y un modo <b>"Cocínalo tú mismo"</b> con animación 3D de cada paso.</p>
        <div class="tabs" data-f><button class="on" data-v="">Todas</button>${['Desayuno', 'Comida', 'Cena', 'Snack', 'Post-entreno'].map(x => `<button data-v="${x}">${x}</button>`).join('')}${DIETAS.map(d => `<button data-v="#${d.id}">${d.icono} ${d.nombre}</button>`).join('')}</div>
        <div class="grid g3" data-l></div>`;
      const pintar = (f = '') => { $('[data-l]', c).innerHTML = RECETAS.filter(r => !f || r.tipo === f || (f[0] === '#' && r.tags.includes(f.slice(1)))).map(recetaCard).join(''); };
      $('[data-f]', c).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; $$('button', e.currentTarget).forEach(x => x.classList.toggle('on', x === b)); pintar(b.dataset.v); };
      pintar();
    },
    dietas: (c) => {
      const base = tdee();
      c.innerHTML = `<p class="muted">Calorías calculadas con tu perfil (gasto estimado: <b>${base} kcal</b>). <a class="accent" href="#/perfil">Ajustar perfil</a></p>
        <div class="grid g2">${DIETAS.map(d => `<a class="card" href="#/dieta/${d.id}" style="border-top:4px solid ${d.color}"><div class="row between"><h2 style="margin:0">${d.icono} ${esc(d.nombre)}</h2><span class="tag hot">${base + d.ajuste} kcal</span></div><p class="muted small" style="margin:8px 0 0">${esc(d.desc)}</p></a>`).join('')}</div>`;
    },
    calc: (c) => {
      const pf = store.get().perfil;
      c.innerHTML = `<div class="grid g2"><div class="card"><h2>Tus datos</h2><div class="grid g2" style="grid-template-columns:1fr 1fr">
          ${campo('peso', 'Peso (kg)', pesoActual())}${campo('altura', 'Altura (cm)', pf.altura)}${campo('edad', 'Edad', pf.edad)}
          <div class="field"><label>Sexo</label><select data-k="sexo"><option value="h" ${pf.sexo === 'h' ? 'selected' : ''}>Hombre</option><option value="m" ${pf.sexo === 'm' ? 'selected' : ''}>Mujer</option></select></div>
          <div class="field" style="grid-column:1/-1"><label>Actividad</label><select data-k="actividad">${[[1.2, 'Sedentario'], [1.375, 'Ligera (1–3 días)'], [1.55, 'Moderada (3–5 días)'], [1.725, 'Alta (6–7 días)'], [1.9, 'Muy alta (trabajo físico + entreno)']].map(([x, t]) => `<option value="${x}" ${+pf.actividad === x ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
          <div class="field" style="grid-column:1/-1"><label>Objetivo</label><select data-k="objetivo">${DIETAS.map(d => `<option value="${d.id}" ${pf.objetivo === d.id ? 'selected' : ''}>${d.nombre}</option>`).join('')}</select></div>
        </div></div><div class="card" data-res></div></div>`;
      const calc = () => {
        const p = { ...pf };
        $$('[data-k]', c).forEach(i => p[i.dataset.k] = i.tagName === 'SELECT' && i.dataset.k === 'sexo' || i.dataset.k === 'objetivo' ? i.value : +i.value);
        Object.assign(pf, { altura: p.altura, edad: p.edad, sexo: p.sexo, actividad: p.actividad, objetivo: p.objetivo });
        if (p.peso && p.peso !== pesoActual()) pf.peso = p.peso;
        store.save();
        $('[data-res]', c).innerHTML = macrosHTML(dietaById(p.objetivo), p.peso, tdee(p, p.peso));
      };
      c.oninput = calc; calc();
    },
  };
  const go = (t) => { $$('[data-t] button', v).forEach(b => b.classList.toggle('on', b.dataset.v === t)); tabs[t]($('[data-c]', v)); };
  $('[data-t]', v).onclick = (e) => { const b = e.target.closest('button'); if (b) go(b.dataset.v); };
  go(tabs[tab] ? tab : 'recetas');
}
const campo = (k, label, val, type = 'number') => `<div class="field"><label>${label}</label><input type="${type}" data-k="${k}" value="${esc(val)}" step="any"></div>`;
function macrosHTML(d, peso, gasto) {
  const kcal = gasto + d.ajuste;
  const p = Math.round(peso * d.proteina), g = Math.round(kcal * d.grasa / 9), c = Math.max(0, Math.round((kcal - p * 4 - g * 9) / 4));
  const tot = p * 4 + g * 9 + c * 4;
  const seg = (val, col) => `<i style="width:${val / tot * 100}%;background:${col}"></i>`;
  return `<div class="small muted">Gasto diario estimado: ${gasto} kcal</div><h2 style="font-size:2.4rem;margin:6px 0">${kcal} <span class="small muted">kcal/día</span></h2>
    <div class="small">${d.icono} ${esc(d.nombre)} (${d.ajuste > 0 ? '+' : ''}${d.ajuste} kcal)</div>
    <div class="progress" style="height:14px;display:flex;margin:12px 0">${seg(p * 4, '#d8394b')}${seg(c * 4, '#e6bf2e')}${seg(g * 9, '#35c06a')}</div>
    <div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px"><div class="kpi"><b style="color:#ff8f9b">${p} g</b><span>Proteína</span></div><div class="kpi"><b style="color:#fff0a3">${c} g</b><span>Carbohidratos</span></div><div class="kpi"><b style="color:#a6f5c2">${g} g</b><span>Grasas</span></div></div>
    <p class="small muted" style="margin-top:10px">Estimación con la fórmula de Mifflin-St Jeor. Ajusta según la evolución de tu peso en 2–3 semanas.</p>
    <a class="btn sm" href="#/dieta/${d.id}">Ver menú de ejemplo →</a>`;
}
function vDieta(v, id) {
  const d = dietaById(id); if (!d) return vNutricion(v, 'dietas');
  v.innerHTML = `<a class="small muted" href="#/nutricion">← Nutrición</a>
    <div class="hero" style="margin-top:8px;border-top:4px solid ${d.color}"><div style="font-size:2.4rem">${d.icono}</div><h1>${esc(d.nombre)}</h1><p class="muted">${esc(d.desc)}</p></div>
    <div class="grid g2 section"><div class="card">${macrosHTML(d, pesoActual(), tdee())}</div>
      <div class="card"><h2>Sí</h2><ul class="clean tips">${d.si.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h2 style="margin-top:12px">Evita</h2><ul class="clean tips bad">${d.no.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    <h2 class="section">Menú de un día</h2>
    <div class="grid g3">${d.menu.map(([m, rid]) => { const r = recetaById(rid); return `<div><div class="small muted" style="margin-bottom:6px;font-family:var(--font-h);text-transform:uppercase;letter-spacing:.08em">${esc(m)}</div>${recetaCard(r)}</div>`; }).join('')}</div>
    <div class="card section"><b>Total del menú:</b> ${d.menu.reduce((a, [, r]) => a + recetaById(r).macros.kcal, 0)} kcal · ${d.menu.reduce((a, [, r]) => a + recetaById(r).macros.p, 0)} g de proteína <span class="small muted">(ajusta las raciones para cuadrar tus calorías)</span></div>
    <div class="card"><h2>Consejos</h2><ul class="clean tips">${d.consejos.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
}

function escalar(cant, f) {
  if (f === 1) return cant;
  return cant.replace(/^(\d+\/\d+|\d+(?:[.,]\d+)?)/, (m) => {
    const n = m.includes('/') ? m.split('/').reduce((a, b) => a / b) : parseFloat(m.replace(',', '.'));
    const r = Math.round(n * f * 10) / 10;
    return String(r).replace('.', ',');
  });
}
function vReceta(v, id) {
  const r = recetaById(id); if (!r) return vNutricion(v);
  let rac = r.raciones;
  v.innerHTML = `<a class="small muted" href="#/nutricion">← Recetas</a>
    <div class="recipe-hero" style="margin-top:8px">${dishImage(r)}</div>
    <div class="row between section" style="margin-top:14px"><div><span class="tag hot">${esc(r.tipo)}</span><h1 style="margin-top:8px">${esc(r.nombre)}</h1>
      <div class="row small muted">⏱ ${r.tiempo} min · ${esc(r.dificultad)} · ${r.pasos.length} pasos</div></div>
      <a class="btn primary" href="#/cocinar/${r.id}" style="font-size:1.05rem;padding:14px 20px">${icon('chef')} Cocínalo tú mismo (paso a paso 3D)</a></div>
    <div class="grid g4" style="margin-top:12px"><div class="kpi"><b class="accent">${r.macros.kcal}</b><span>kcal / ración</span></div><div class="kpi"><b>${r.macros.p} g</b><span>proteína</span></div><div class="kpi"><b>${r.macros.c} g</b><span>carbohidratos</span></div><div class="kpi"><b>${r.macros.g} g</b><span>grasas</span></div></div>
    <div class="grid g2 section">
      <div class="card"><div class="row between"><h2 style="margin:0">Ingredientes</h2><div class="stepper"><button data-r="-1">−</button><input readonly data-rac value="${rac}"><button data-r="1">+</button></div></div>
        <div class="small muted" style="margin:4px 0 6px">Raciones · toca para tachar</div><ul class="clean ing-list" data-ing></ul></div>
      <div class="card"><h2>Pasos</h2><ol class="clean steps-list">${r.pasos.map((p, i) => `<li><span class="n">${i + 1}</span><div>${esc(p.t)}${p.min ? ` <span class="tag">⏱ ${p.min} min</span>` : ''}</div></li>`).join('')}</ol>
        <a class="btn primary block" style="margin-top:12px" href="#/cocinar/${r.id}">${icon('play')} Empezar modo cocina</a></div>
    </div>
    <div class="section"><h2>Te puede gustar</h2><div class="grid g3">${RECETAS.filter(x => x.id !== r.id && x.tags.some(t => r.tags.includes(t))).slice(0, 3).map(recetaCard).join('')}</div></div>`;
  const pintar = () => {
    $('[data-rac]', v).value = rac;
    $('[data-ing]', v).innerHTML = r.ing.map(i => `<li><i class="sw" style="background:${i.col}"></i><span><b>${esc(escalar(i.cant, rac / r.raciones))}</b> ${esc(i.n)}</span></li>`).join('');
  };
  pintar();
  $$('[data-r]', v).forEach(b => b.onclick = () => { rac = Math.max(1, rac + +b.dataset.r); pintar(); });
  $('[data-ing]', v).onclick = (e) => e.target.closest('li')?.classList.toggle('ok');
}

const ACCION_TXT = { cortar: 'Cortar', hervir: 'Hervir / cocer', saltear: 'Saltear', plancha: 'A la plancha', mezclar: 'Mezclar', batir: 'Batir / triturar', horno: 'Horno', tostar: 'Tostar', emplatar: 'Emplatar', reposar: 'Reposar', verter: 'Verter' };
async function vCocinar(v, id) {
  const r = recetaById(id); if (!r) return vNutricion(v);
  let paso = 0, tInt = null, tLeft = 0;
  v.innerHTML = `<a class="small muted" href="#/receta/${r.id}">← ${esc(r.nombre)}</a>
    <h1 style="margin-top:6px">${icon('chef').replace('<svg', '<svg style="width:32px;height:32px;vertical-align:-6px"')} Modo cocina</h1>
    <div class="cook"><div class="stack">
        <div class="cook-stage" data-stage><span class="action" data-act></span></div>
        <div class="step-dots" data-dots>${r.pasos.map(() => '<i></i>').join('')}</div>
      </div>
      <div class="stack">
        <div class="card"><div class="small muted" data-n></div><p class="step-text" data-txt></p>
          <div data-timer></div>
          <div class="row between" style="margin-top:12px"><button class="btn" data-prev>← Anterior</button><button class="btn ghost" data-voz title="Leer en voz alta">${icon('speaker')}</button><button class="btn primary" data-next>Siguiente →</button></div></div>
        <div class="card"><h3>Ingredientes</h3><ul class="clean ing-list">${r.ing.map(i => `<li><i class="sw" style="background:${i.col}"></i><span><b>${esc(i.cant)}</b> ${esc(i.n)}</span></li>`).join('')}</ul></div>
      </div></div>`;
  $('.ing-list', v).onclick = (e) => e.target.closest('li')?.classList.toggle('ok');
  let kitchen;
  try {
    const { KitchenScene } = await import('./three/kitchen.js');
    kitchen = new KitchenScene($('[data-stage]', v));
    onLeave(() => kitchen.dispose());
  } catch (e) { console.error(e); $('[data-stage]', v).insertAdjacentHTML('beforeend', '<div class="empty">Tu navegador no soporta 3D</div>'); }
  onLeave(() => { clearInterval(tInt); speechSynthesis?.cancel?.(); });
  const pintarTimer = () => {
    const p = r.pasos[paso];
    const box = $('[data-timer]', v);
    if (!p.min) { box.innerHTML = ''; return; }
    const m = Math.floor(tLeft / 60), s = tLeft % 60;
    box.innerHTML = `<div class="card" style="background:var(--bg2);text-align:center"><div class="timer-big">${m}:${String(s).padStart(2, '0')}</div>
      <div class="row" style="justify-content:center"><button class="btn sm primary" data-tgo>${tInt ? '⏸ Pausar' : '▶ Iniciar temporizador'}</button><button class="btn sm" data-treset>Reiniciar</button></div></div>`;
  };
  const ir = (n) => {
    paso = Math.max(0, Math.min(r.pasos.length - 1, n));
    const p = r.pasos[paso];
    clearInterval(tInt); tInt = null; tLeft = (p.min || 0) * 60;
    $('[data-n]', v).textContent = `Paso ${paso + 1} de ${r.pasos.length}`;
    $('[data-txt]', v).textContent = p.t;
    $('[data-act]', v).textContent = ACCION_TXT[p.a] || p.a;
    $$('[data-dots] i', v).forEach((d, i) => d.classList.toggle('on', i <= paso));
    $('[data-prev]', v).disabled = paso === 0;
    $('[data-next]', v).textContent = paso === r.pasos.length - 1 ? '¡Terminado! 🎉' : 'Siguiente →';
    kitchen?.setStep(p, r, paso);
    pintarTimer();
  };
  v.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-prev')) ir(paso - 1);
    if (b.hasAttribute('data-next')) {
      if (paso === r.pasos.length - 1) { confetti(); modal(`<div style="text-align:center">${dishImage(r).replace('class="dish-svg"', 'class="dish-svg" style="border-radius:16px"')}<h2 style="margin-top:12px">¡Que aproveche! 💪</h2><p class="muted">${r.macros.kcal} kcal · ${r.macros.p} g de proteína</p><a class="btn primary" href="#/nutricion" onclick="document.querySelector('.modal-bg')?.remove()">Más recetas</a></div>`); }
      else ir(paso + 1);
    }
    if (b.hasAttribute('data-voz') && 'speechSynthesis' in window) {
      speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(r.pasos[paso].t); u.lang = 'es-ES'; speechSynthesis.speak(u);
    }
    if (b.hasAttribute('data-tgo')) {
      if (tInt) { clearInterval(tInt); tInt = null; }
      else tInt = setInterval(() => { tLeft--; if (tLeft <= 0) { clearInterval(tInt); tInt = null; tLeft = 0; beep(990, .25, 4); toast('⏰ ¡Tiempo! Pasa al siguiente paso'); } pintarTimer(); }, 1000);
      pintarTimer();
    }
    if (b.hasAttribute('data-treset')) { clearInterval(tInt); tInt = null; tLeft = (r.pasos[paso].min || 0) * 60; pintarTimer(); }
  });
  const onKey = (e) => { if (e.key === 'ArrowRight') ir(paso + 1); if (e.key === 'ArrowLeft') ir(paso - 1); };
  addEventListener('keydown', onKey); onLeave(() => removeEventListener('keydown', onKey));
  ir(0);
}

// ───────────── EQUIPO ─────────────
function vEquipo(v, tab = 'suplementos') {
  v.innerHTML = `<h1>Suplementos y accesorios</h1><p class="muted">Qué es cada cosa, para qué sirve, cómo se usa y si de verdad merece la pena.</p>
    <div class="tabs" data-t><button data-v="suplementos">💊 Suplementos</button><button data-v="accesorios">🎒 Accesorios</button></div><div data-c></div>`;
  const go = (t) => {
    $$('[data-t] button', v).forEach(b => b.classList.toggle('on', b.dataset.v === t));
    $('[data-c]', v).innerHTML = t === 'suplementos'
      ? `<div class="row small muted" style="margin-bottom:10px"><span class="evid A">A</span> Evidencia fuerte <span class="evid B">B</span> Moderada <span class="evid C">C</span> Limitada</div><div class="grid g4">${SUPLEMENTOS.map(p => prodCard({ ...p, tipo: 'suplemento' })).join('')}</div>`
      : `<div class="grid g4">${ACCESORIOS.map(p => prodCard({ ...p, tipo: 'accesorio' })).join('')}</div>`;
  };
  $('[data-t]', v).onclick = (e) => { const b = e.target.closest('button'); if (b) go(b.dataset.v); };
  go(tab);
}

// ───────────── PROGRESO ─────────────
function vProgreso(v) {
  const st = store.get();
  const ids = [...new Set(st.logs.map(l => l.ej))];
  const volTotal = st.logs.reduce((a, l) => a + volumenLog(l), 0);
  v.innerHTML = `<div class="row between"><h1>Progreso</h1><a class="btn sm" href="#/perfil">⚙️ Perfil y copias</a></div>
    <div class="grid g4"><div class="kpi"><b>${st.sesiones.length}</b><span>entrenos completados</span></div><div class="kpi"><b>${new Set(st.logs.map(l => l.fecha)).size}</b><span>días con registro</span></div>
      <div class="kpi"><b>${fmtKg(Math.round(volTotal / 1000 * 10) / 10)} t</b><span>volumen total</span></div><div class="kpi"><b>${rachaSemanas()}</b><span>semanas de racha</span></div></div>
    <div class="grid g2 section">
      <div class="card"><h2>Peso corporal</h2>
        <div class="row"><div class="stepper"><button data-pc="-0.1">−</button><input inputmode="decimal" data-pcv value="${pesoActual()}"><button data-pc="0.1">+</button></div><span class="muted">kg</span><button class="btn primary" data-pcs>Guardar hoy</button></div>
        <div style="margin-top:12px" data-pcchart></div></div>
      <div class="card"><h2>Evolución por ejercicio</h2>
        ${ids.length ? `<select class="search" style="background-image:none;padding-left:14px" data-sel>${ids.map(id => `<option value="${id}">${esc(ejercicioById(id)?.nombre || id)}</option>`).join('')}</select><div style="margin-top:12px" data-exchart></div>` : '<div class="empty">Registra tu primer ejercicio para ver gráficas</div>'}</div>
    </div>
    <div class="grid g2 section">
      <div class="card"><div class="section-h"><h2>Rangos</h2><a href="#/rangos">Ver todos →</a></div>${topMarcas()}</div>
      <div class="card"><h2>Últimos entrenos</h2>${historialSesiones()}</div>
    </div>`;
  const pintarPC = () => {
    const pts = store.get().pesoCorporal.slice(-30).map(p => ({ x: fmtFecha(p.fecha), y: p.kg }));
    $('[data-pcchart]', v).innerHTML = lineChart(pts);
  };
  pintarPC();
  $$('[data-pc]', v).forEach(b => b.onclick = () => { const i = $('[data-pcv]', v); i.value = Math.round((parseFloat(i.value.replace(',', '.')) + +b.dataset.pc) * 10) / 10; });
  $('[data-pcs]', v).onclick = () => {
    const kg = parseFloat($('[data-pcv]', v).value.replace(',', '.')); if (!kg) return;
    const pc = store.get().pesoCorporal; const f = hoy();
    const ex = pc.find(p => p.fecha === f); ex ? ex.kg = kg : pc.push({ fecha: f, kg });
    pc.sort((a, b) => a.fecha.localeCompare(b.fecha)); store.get().perfil.peso = kg; store.save(); pintarPC(); toast('✅ Peso guardado'); pintarChip();
  };
  const sel = $('[data-sel]', v);
  if (sel) { const pin = () => { const ej = ejercicioById(sel.value); $('[data-exchart]', v).innerHTML = lineChart(porDia(logsDe(sel.value), ej)) + `<a class="btn sm" style="margin-top:8px" href="#/ejercicio/${ej.id}">Abrir ejercicio →</a>`; }; sel.onchange = pin; pin(); }
}
function historialSesiones() {
  const st = store.get();
  const fechas = [...new Set(st.logs.map(l => l.fecha))].sort().reverse().slice(0, 8);
  if (!fechas.length) return '<div class="empty small">Aún no hay entrenos</div>';
  return fechas.map(f => { const ls = st.logs.filter(l => l.fecha === f); return `<div class="hist-item"><div class="row between"><b>${fmtFecha(f)}</b><span class="small muted">${ls.length} ejercicios · ${fmtKg(ls.reduce((a, l) => a + volumenLog(l), 0))} kg</span></div>
    <div class="tags" style="margin-top:4px">${ls.map(l => `<a class="tag" href="#/ejercicio/${l.ej}">${esc(ejercicioById(l.ej)?.nombre || l.ej)} · ${l.sets.length}×</a>`).join('')}</div></div>`; }).join('');
}

// ───────────── RANGOS ─────────────
function vRangos(v) {
  const g = rangoGlobal();
  const ranked = EJERCICIOS.filter(e => e.std);
  v.innerHTML = `<h1>Sistema de rangos</h1>
    <div class="grid g2"><div class="card"><p>Cada ejercicio tiene <b>9 rangos</b>. Tu rango depende de tu <b>1RM estimado</b> (calculado a partir de peso × repeticiones) en relación con tu <b>peso corporal</b>, así que es justo para cualquier tamaño. En ejercicios de abdomen se cuentan repeticiones o segundos.</p>
      <p>Cada músculo del mapa toma el mejor rango de sus ejercicios principales. Tu <b>rango global</b> es la media de tus músculos.</p>
      <p class="small muted">Las mujeres tienen estándares adaptados (configúralo en tu perfil).</p>
      <div class="row">${badgeSVG(g, 60)}<div><div class="small muted">Tu rango global</div><h2 style="margin:0;color:${g.claro}">${g.nombre}</h2></div></div></div>
      <div class="legend" style="margin:0;align-content:center">${RANKS.map((r, i) => `<div>${badgeSVG(r, 40)}<span style="color:${r.claro}">${r.nombre}</span><span class="muted" style="font-family:var(--font)">${Math.round(r.mult * 100)}%</span></div>`).join('')}</div></div>
    <div class="card section"><h2>Tus ejercicios</h2>
      ${ranked.map(e => { const r = rangoEjercicio(e.id); return `<a class="rank-row" href="#/ejercicio/${e.id}">${badgeSVG(r.rank, 38)}<div><b>${esc(e.nombre)}</b><div class="progress" style="margin:5px 0"><i style="width:${r.idx < 0 && !r.ratio ? 0 : Math.round(r.progreso * 100)}%"></i></div><div class="small muted">${r.siguiente ? `→ ${r.siguiente.nombre}: ${esc(r.objetivo)}` : 'Máximo'}</div></div><span class="small" style="color:${r.rank.claro}">${r.rank.nombre}</span></a>`; }).join('')}</div>`;
}

// ───────────── PERFIL ─────────────
function vPerfil(v) {
  const pf = store.get().perfil;
  v.innerHTML = `<h1>Perfil</h1>
    <div class="grid g2"><div class="card"><h2>Tus datos</h2><div class="grid" style="grid-template-columns:1fr 1fr;gap:10px">
      ${campo('nombre', 'Nombre', pf.nombre, 'text')}${campo('peso', 'Peso (kg)', pesoActual())}${campo('altura', 'Altura (cm)', pf.altura)}${campo('edad', 'Edad', pf.edad)}
      <div class="field"><label>Sexo (estándares)</label><select data-k="sexo"><option value="h" ${pf.sexo === 'h' ? 'selected' : ''}>Hombre</option><option value="m" ${pf.sexo === 'm' ? 'selected' : ''}>Mujer</option></select></div>
      <div class="field"><label>Incremento de peso</label><select data-k="incremento">${[1, 1.25, 2, 2.5, 5].map(x => `<option ${+pf.incremento === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
      </div><button class="btn primary" style="margin-top:14px" data-save>Guardar</button></div>
      <div class="card"><h2>Copia de seguridad</h2><p class="muted">Tus datos se guardan en este navegador. Exporta una copia para no perderlos o para pasarlos a otro móvil.</p>
        <div class="row"><button class="btn" data-exp>⬇️ Exportar</button><label class="btn">⬆️ Importar<input type="file" accept="application/json" hidden data-imp></label><button class="btn ghost" data-reset style="color:var(--bad)">Borrar todo</button></div>
        <h3 style="margin-top:18px">Datos de ejemplo</h3><p class="small muted">¿Quieres ver cómo se ve la app con historial? Carga 6 semanas de entrenos de ejemplo.</p><button class="btn sm" data-demo>Cargar demo</button></div></div>`;
  $('[data-save]', v).onclick = () => {
    $$('[data-k]', v).forEach(i => { const k = i.dataset.k; pf[k] = ['nombre', 'sexo'].includes(k) ? i.value : +i.value; });
    store.save(); toast('✅ Perfil guardado'); pintarChip();
  };
  $('[data-exp]', v).onclick = () => {
    const blob = new Blob([JSON.stringify(store.get(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `forja-${hoy()}.json`; a.click();
  };
  $('[data-imp]', v).onchange = async (e) => {
    try { store.import(JSON.parse(await e.target.files[0].text())); toast('✅ Datos importados'); router(); } catch { toast('❌ Archivo no válido'); }
  };
  $('[data-reset]', v).onclick = () => { if (confirm('¿Seguro? Se borrarán todos tus registros.')) { store.reset(); router(); } };
  $('[data-demo]', v).onclick = () => { cargarDemo(); toast('✅ Datos de ejemplo cargados'); location.hash = '#/inicio'; };
}

function cargarDemo() {
  const st = store.get();
  const base = { 'press-banca': 60, 'sentadilla': 80, 'peso-muerto': 100, 'press-militar': 40, 'remo-barra': 55, 'dominadas': 0, 'curl-barra': 25, 'hip-thrust': 80, 'elevaciones-laterales': 8, 'jalon': 50, 'gemelos-pie': 70, 'plancha': 0, 'elevacion-piernas': 0, 'extension-polea': 20, 'peso-muerto-rumano': 70, 'face-pull': 20 };
  const reps = { plancha: 45, 'elevacion-piernas': 10, dominadas: 6 };
  for (let w = 6; w >= 0; w--) for (const d of [0, 2, 4]) {
    const f = new Date(Date.now() - (w * 7 + d) * 864e5).toISOString().slice(0, 10);
    const lista = Object.keys(base).filter((_, i) => i % 3 === d / 2);
    for (const id of lista) {
      const prog = (6 - w) * (id === 'peso-muerto' ? 5 : id === 'sentadilla' ? 3.75 : 2.5) * (base[id] < 15 ? .2 : 1);
      const kg = Math.round((base[id] + prog) / 1.25) * 1.25;
      st.logs.push({ id: uid(), ej: id, fecha: f, sets: [0, 1, 2].map(k => ({ kg, reps: (reps[id] ? reps[id] + (6 - w) * (id === 'plancha' ? 5 : 1) : 8) - k })) });
    }
  }
  for (let i = 30; i >= 0; i -= 3) st.pesoCorporal.push({ fecha: new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), kg: Math.round((78 - i * .03 + Math.sin(i) * .3) * 10) / 10 });
  st.pesoCorporal.sort((a, b) => a.fecha.localeCompare(b.fecha));
  store.save();
}

// Arranque
if (!location.hash) location.hash = '#/inicio';
router();
