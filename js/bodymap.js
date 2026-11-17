// Mapa muscular (frontal + posterior) coloreado según el rango de cada músculo.
// Se dibuja la mitad izquierda y se refleja para conseguir simetría perfecta.
import { RANKS, SIN_RANGO, MUSCULOS, shade } from './data/ranks.js';

const P = (pts) => 'M' + pts.map(p => p.join(' ')).join(' L') + ' Z';

// Silueta (mitad izquierda, eje x = 100)
const SILUETA = [[100, 50], [92, 50], [91, 62], [72, 69], [60, 76], [54, 92], [51, 112], [48, 150], [43, 180], [40, 206], [34, 222], [36, 238], [44, 240], [49, 224], [51, 208],
  [58, 172], [63, 150], [66, 124], [70, 150], [72, 186], [68, 212], [65, 250], [68, 290], [70, 305], [68, 335], [74, 372], [72, 388], [92, 392], [91, 372],
  [93, 330], [93, 305], [95, 275], [97, 248], [100, 236]];

const FRONT = {
  trapecio:    [[[99, 60], [92, 58], [80, 66], [76, 70], [92, 70], [99, 68]]],
  hombros:     [[[74, 70], [62, 77], [56, 92], [55, 104], [62, 108], [68, 96], [74, 82]]],
  pecho:       [[[76, 72], [74, 82], [70, 96], [72, 112], [84, 118], [99, 114], [99, 74], [90, 70]]],
  biceps:      [[[56, 106], [53, 126], [54, 146], [61, 146], [65, 128], [66, 112], [62, 108]]],
  antebrazos:  [[[53, 150], [48, 172], [44, 196], [49, 204], [54, 186], [60, 162], [62, 148]]],
  oblicuos:    [[[72, 116], [86, 121], [87, 192], [75, 196], [72, 170], [70, 140]]],
  abdominales: [[[88, 120], [99, 118], [99, 210], [91, 204], [87, 170]]],
  cuadriceps:  [[[70, 210], [67, 246], [69, 282], [74, 300], [86, 300], [92, 276], [94, 246], [90, 226], [80, 214]]],
  aductores:   [[[92, 226], [95, 244], [94, 266], [97, 258], [99, 240], [98, 230]]],
  gemelos:     [[[71, 312], [70, 336], [76, 364], [82, 366], [86, 340], [90, 312], [80, 306]]],
};

const BACK = {
  trapecio:    [[[99, 54], [92, 58], [78, 68], [74, 74], [88, 86], [99, 132]]],
  hombros:     [[[74, 72], [62, 78], [56, 92], [55, 104], [64, 106], [70, 92], [80, 80]]],
  triceps:     [[[56, 106], [53, 126], [54, 146], [61, 146], [65, 128], [66, 110], [62, 106]]],
  antebrazos:  [[[53, 150], [48, 172], [44, 196], [49, 204], [54, 186], [60, 162], [62, 148]]],
  dorsales:    [[[72, 88], [68, 112], [70, 150], [74, 168], [84, 176], [97, 144], [88, 92], [80, 84]]],
  lumbares:    [[[84, 178], [97, 148], [99, 150], [99, 202], [80, 202], [76, 190]]],
  gluteos:     [[[74, 202], [68, 220], [70, 238], [84, 246], [99, 242], [99, 204]]],
  isquios:     [[[69, 242], [67, 270], [71, 296], [78, 302], [88, 300], [93, 276], [96, 250], [84, 248]]],
  gemelos:     [[[71, 308], [69, 334], [74, 360], [82, 366], [88, 344], [92, 312], [82, 304]]],
};

// Detalles decorativos (líneas de definición) — también se reflejan
const DETALLE_FRONT = 'M88 140 L99 139 M88 160 L99 159 M88 180 L99 180 M80 250 Q82 270 84 296 M76 90 Q86 100 99 98 M58 120 Q60 132 59 142';
const DETALLE_BACK = 'M99 70 L99 200 M76 120 Q84 140 92 150 M84 222 Q90 230 99 230 M80 260 Q82 280 83 298 M78 320 L80 350';

function figura(map, detalle, rankFor, lado) {
  const mirror = (inner) => `<g>${inner}</g><g transform="translate(200 0) scale(-1 1)">${inner}</g>`;
  let musculos = '';
  for (const [m, polys] of Object.entries(map)) {
    const r = rankFor(m);
    const fill = r.id === 'none' ? '#3a3f48' : r.color;
    const inner = polys.map(pts => `<path d="${P(pts)}" />`).join('');
    musculos += `<g class="musc" data-m="${m}" fill="${fill}" stroke="${shade(fill, -60)}" stroke-width="1.1" stroke-linejoin="round">
      <title>${MUSCULOS[m]} — ${r.nombre}</title>${mirror(inner)}</g>`;
  }
  const sil = mirror(`<path d="${P(SILUETA)}" />`);
  return `<svg class="bodymap" viewBox="20 6 160 392" role="img" aria-label="Mapa muscular ${lado}">
    <g fill="${lado === 'frontal' ? '#1f2329' : '#5b6068'}" stroke="#0b0d10" stroke-width="1.6" stroke-linejoin="round">${sil}
    <ellipse cx="100" cy="30" rx="15" ry="20"/></g>
    ${musculos}
    <g stroke="#0b0d10" stroke-width=".9" fill="none" opacity=".55">${mirror(`<path d="${detalle}"/>`)}</g>
  </svg>`;
}

export function bodyMapHTML(rankForMuscle) {
  const rankFor = (m) => rankForMuscle(m) || SIN_RANGO;
  return `<div class="bodymap-wrap">
    <figure>${figura(FRONT, DETALLE_FRONT, rankFor, 'frontal')}<figcaption>Frontal</figcaption></figure>
    <figure>${figura(BACK, DETALLE_BACK, rankFor, 'posterior')}<figcaption>Posterior</figcaption></figure>
  </div>`;
}

export { RANKS };
