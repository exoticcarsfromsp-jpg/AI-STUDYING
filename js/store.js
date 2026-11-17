// Persistencia local (localStorage) + cálculos de 1RM, récords y rangos
import { EJERCICIOS, ejercicioById } from './data/exercises.js';
import { RANKS, SIN_RANGO, rankIndexFromRatio } from './data/ranks.js';

const KEY = 'forja.v2';
const DEFAULT = {
  perfil: { nombre: '', peso: 75, altura: 175, edad: 28, sexo: 'h', actividad: 1.55, objetivo: 'recomposicion', incremento: 2.5 },
  logs: [],          // { id, ej, fecha, sets: [{kg, reps, rpe}], nota }
  pesoCorporal: [],  // { fecha, kg }
  sesiones: [],      // { id, rutina, dia, inicio, fin, logs: [ids] }
  activa: null,      // sesión en curso
  favoritas: [],
};

let state;
try { state = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; }
catch { state = structuredClone(DEFAULT); }
state.perfil = { ...DEFAULT.perfil, ...state.perfil };

// Migración: si existían datos de la versión anterior de FORJA, intenta conservarlos
try {
  const old = localStorage.getItem('forja') || localStorage.getItem('forjaData');
  if (old && !state.logs.length) state._legacy = JSON.parse(old);
} catch { /* nada */ }

const listeners = new Set();
export const store = {
  get: () => state,
  save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* modo privado */ } listeners.forEach(f => f(state)); },
  on(f) { listeners.add(f); return () => listeners.delete(f); },
  reset() { state = structuredClone(DEFAULT); this.save(); },
  import(json) { state = { ...DEFAULT, ...json }; this.save(); },
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export const hoy = () => new Date().toISOString().slice(0, 10);

export function pesoActual() {
  const pc = state.pesoCorporal;
  return pc.length ? pc[pc.length - 1].kg : state.perfil.peso;
}

// ───── 1RM estimado (Epley, con corrección para reps bajas) ─────
export function e1rm(kg, reps) {
  if (!reps) return 0;
  if (reps === 1) return kg;
  return kg * (1 + reps / 30);
}

// Carga efectiva de una serie según el modo del ejercicio
export function cargaSerie(ej, set, bw = pesoActual()) {
  if (ej.modo === 'corporal') return e1rm((bw + (+set.kg || 0)) * ej.factor, +set.reps);
  if (ej.modo === 'reps' || ej.modo === 'tiempo') return +set.reps || 0;
  return e1rm(+set.kg || 0, +set.reps);
}

export function logsDe(ejId) { return state.logs.filter(l => l.ej === ejId).sort((a, b) => a.fecha.localeCompare(b.fecha)); }

export function mejorMarca(ejId) {
  const ej = ejercicioById(ejId);
  let best = null;
  for (const l of logsDe(ejId)) for (const s of l.sets) {
    const v = cargaSerie(ej, s);
    if (!best || v > best.valor) best = { valor: v, set: s, fecha: l.fecha };
  }
  return best;
}

export function ratioDe(ejId) {
  const ej = ejercicioById(ejId);
  const b = mejorMarca(ejId);
  if (!b) return 0;
  if (ej.modo === 'reps' || ej.modo === 'tiempo') return b.valor; // se compara directamente con std
  return b.valor / pesoActual();
}

const ajusteSexo = () => (state.perfil.sexo === 'm' ? 0.68 : 1);

export function rangoEjercicio(ejId) {
  const ej = ejercicioById(ejId);
  if (!ej?.std) return { rank: SIN_RANGO, idx: -1, progreso: 0, siguiente: RANKS[0] };
  const std = ej.std * ((ej.modo === 'reps' || ej.modo === 'tiempo') ? (state.perfil.sexo === 'm' ? 0.8 : 1) : ajusteSexo());
  const ratio = ratioDe(ejId);
  const idx = rankIndexFromRatio(ratio, std);
  const actualMin = idx >= 0 ? RANKS[idx].mult * std : 0;
  const sig = RANKS[idx + 1];
  const progreso = sig ? Math.max(0, Math.min(1, (ratio - actualMin) / (sig.mult * std - actualMin))) : 1;
  // Objetivo concreto para el siguiente rango
  let objetivo = null;
  if (sig) {
    const meta = sig.mult * std;
    if (ej.modo === 'reps') objetivo = `${Math.ceil(meta)} reps`;
    else if (ej.modo === 'tiempo') objetivo = `${Math.ceil(meta)} s`;
    else if (ej.modo === 'corporal') objetivo = `1RM total ≈ ${Math.ceil(meta * pesoActual() / ej.factor)} kg (corporal + lastre)`;
    else objetivo = `1RM ≈ ${redondea(meta * pesoActual())} kg`;
  }
  return { rank: idx >= 0 ? RANKS[idx] : SIN_RANGO, idx, progreso, siguiente: sig, ratio, objetivo };
}

export function rangoMusculo(m) {
  let best = -1;
  for (const ej of EJERCICIOS) {
    if (ej.m !== m) continue;
    const r = rangoEjercicio(ej.id);
    if (r.idx > best) best = r.idx;
  }
  // los secundarios cuentan con un rango menos
  if (best < 0) for (const ej of EJERCICIOS) {
    if (!ej.sec.includes(m)) continue;
    const r = rangoEjercicio(ej.id);
    if (r.idx - 1 > best) best = r.idx - 1;
  }
  return best >= 0 ? RANKS[best] : SIN_RANGO;
}

export function rangoGlobal() {
  const musculos = ['pecho', 'hombros', 'biceps', 'triceps', 'dorsales', 'cuadriceps', 'isquios', 'gluteos', 'abdominales', 'lumbares'];
  const idxs = musculos.map(m => RANKS.indexOf(rangoMusculo(m)));
  const conRango = idxs.filter(i => i >= 0);
  if (!conRango.length) return SIN_RANGO;
  const media = idxs.reduce((a, i) => a + Math.max(i, -1), 0) / idxs.length;
  return RANKS[Math.max(0, Math.round(media))] || SIN_RANGO;
}

export const redondea = (kg, paso = 2.5) => Math.round(kg / paso) * paso;

export function volumenLog(l) { return l.sets.reduce((a, s) => a + (+s.kg || 0) * (+s.reps || 0), 0); }

export function rachaSemanas() {
  // semanas consecutivas con al menos un entreno
  const semanas = new Set(state.logs.map(l => semanaISO(l.fecha)));
  let n = 0, d = new Date();
  while (semanas.has(semanaISO(d.toISOString().slice(0, 10)))) { n++; d.setDate(d.getDate() - 7); }
  return n;
}
function semanaISO(f) {
  const d = new Date(f + 'T12:00:00');
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return d.getFullYear() + '-' + (1 + Math.round(((d - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7));
}

// Calorías (Mifflin-St Jeor)
export function tdee(p = state.perfil, peso = pesoActual()) {
  const bmr = 10 * peso + 6.25 * p.altura - 5 * p.edad + (p.sexo === 'm' ? -161 : 5);
  return Math.round(bmr * p.actividad);
}
