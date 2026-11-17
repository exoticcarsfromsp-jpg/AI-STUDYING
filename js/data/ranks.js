// Sistema de rangos FORJA — 9 rangos, de Bronce a Simétrico.
// Cada rango tiene un multiplicador sobre el "estándar" del ejercicio
// (ratio peso levantado / peso corporal de un levantador avanzado).
export const RANKS = [
  { id: 'bronce',    nombre: 'Bronce',    color: '#b0703a', claro: '#e0a36b', forma: 'escudo',    mult: 0.40 },
  { id: 'hierro',    nombre: 'Hierro',    color: '#6b7078', claro: '#a9aeb6', forma: 'triangulo', mult: 0.55 },
  { id: 'plata',     nombre: 'Plata',     color: '#9fc4c2', claro: '#e4f3f2', forma: 'rombo',     mult: 0.70 },
  { id: 'oro',       nombre: 'Oro',       color: '#e6bf2e', claro: '#fff0a3', forma: 'pentagono', mult: 0.85 },
  { id: 'platino',   nombre: 'Platino',   color: '#d8394b', claro: '#ff8f9b', forma: 'heptagono', mult: 1.00 },
  { id: 'diamante',  nombre: 'Diamante',  color: '#7fbff2', claro: '#d8eeff', forma: 'gema',      mult: 1.15 },
  { id: 'esmeralda', nombre: 'Esmeralda', color: '#35c06a', claro: '#a6f5c2', forma: 'hexagono',  mult: 1.30 },
  { id: 'campeon',   nombre: 'Campeón',   color: '#8a6cf0', claro: '#cfc2ff', forma: 'corona',    mult: 1.50 },
  { id: 'simetrico', nombre: 'Simétrico', color: '#2457d6', claro: '#8fb0ff', forma: 'circulo',   mult: 1.75 },
];

export const SIN_RANGO = { id: 'none', nombre: 'Sin rango', color: '#2b3038', claro: '#4a515c', forma: 'circulo', mult: 0 };

// Grupos musculares que aparecen en el mapa corporal
export const MUSCULOS = {
  pecho:      'Pecho',
  hombros:    'Hombros',
  biceps:     'Bíceps',
  triceps:    'Tríceps',
  antebrazos: 'Antebrazos',
  abdominales:'Abdominales',
  oblicuos:   'Oblicuos',
  trapecio:   'Trapecio',
  dorsales:   'Dorsales',
  lumbares:   'Lumbares',
  gluteos:    'Glúteos',
  cuadriceps: 'Cuádriceps',
  isquios:    'Isquiotibiales',
  aductores:  'Aductores',
  gemelos:    'Gemelos',
};

// Ratio corporal → índice de rango (-1 = sin rango)
export function rankIndexFromRatio(ratio, std) {
  if (!std || !ratio) return -1;
  let idx = -1;
  RANKS.forEach((r, i) => { if (ratio >= r.mult * std) idx = i; });
  return idx;
}

export function rankById(id) {
  return RANKS.find(r => r.id === id) || SIN_RANGO;
}

// Insignia SVG para cada rango (forma inspirada en la referencia)
export function badgeSVG(rank, size = 40) {
  const r = rank || SIN_RANGO;
  const id = 'g' + r.id + Math.random().toString(36).slice(2, 7);
  const shapes = {
    escudo:    'M20 3 L35 8 L35 22 Q35 33 20 38 Q5 33 5 22 L5 8 Z',
    triangulo: 'M20 3 L37 35 L3 35 Z',
    rombo:     'M20 2 L38 20 L20 38 L2 20 Z',
    pentagono: 'M20 2 L38 15 L31 37 L9 37 L2 15 Z',
    heptagono: 'M20 2 L33 8 L38 21 L31 34 L20 38 L9 34 L2 21 L7 8 Z',
    gema:      'M9 4 L31 4 L38 14 L20 38 L2 14 Z',
    hexagono:  'M20 2 L35 10 L35 30 L20 38 L5 30 L5 10 Z',
    corona:    'M4 6 L13 13 L20 4 L27 13 L36 6 L33 30 Q20 40 7 30 Z',
    circulo:   'M20 2 A18 18 0 1 1 19.9 2 Z',
  };
  const d = shapes[r.forma] || shapes.circulo;
  return `<svg class="badge" width="${size}" height="${size}" viewBox="0 0 40 40" aria-label="${r.nombre}">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${r.claro}"/><stop offset="0.55" stop-color="${r.color}"/><stop offset="1" stop-color="${shade(r.color, -35)}"/>
    </linearGradient></defs>
    <path d="${d}" fill="url(#${id})" stroke="${shade(r.color, -50)}" stroke-width="1.2"/>
    <path d="M20 13 L22 18 L27 20 L22 22 L20 27 L18 22 L13 20 L18 18 Z" fill="#fff" opacity="${r.id === 'none' ? 0.25 : 0.9}"/>
  </svg>`;
}

export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
