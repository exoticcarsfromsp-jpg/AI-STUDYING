// Ilustraciones SVG generadas: fotos de platos y de productos.
// Si añades una foto real en assets/img/recetas/<id>.jpg y la indicas en la receta con `foto`, se usará esa.
import { shade } from './data/ranks.js';

function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function pieza(forma, x, y, s, col, rot, R) {
  const d = shade(col, -40), l = shade(col, 40);
  const t = `transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})"`;
  switch (forma) {
    case 'grano': {
      let out = '';
      for (let i = 0; i < 7; i++) out += `<ellipse cx="${((R() - .5) * s * 2).toFixed(1)}" cy="${((R() - .5) * s * 2).toFixed(1)}" rx="${(s * .32).toFixed(1)}" ry="${(s * .16).toFixed(1)}" transform="rotate(${(R() * 180).toFixed(0)})" fill="${col}" stroke="${d}" stroke-width=".4"/>`;
      return `<g ${t}>${out}</g>`;
    }
    case 'hoja': return `<g ${t}><path d="M${-s} 0 Q0 ${-s * 1.1} ${s} 0 Q0 ${s * 1.1} ${-s} 0Z" fill="${col}" stroke="${d}" stroke-width=".8"/><path d="M${-s} 0 L${s} 0" stroke="${l}" stroke-width=".8"/></g>`;
    case 'loncha': return `<g ${t}><path d="M${-s} ${-s * .5} Q0 ${-s * .9} ${s} ${-s * .5} L${s * .9} ${s * .5} Q0 ${s * .8} ${-s * .9} ${s * .5}Z" fill="${col}" stroke="${d}" stroke-width=".8"/></g>`;
    case 'esfera': return `<g ${t}><circle r="${s * .6}" fill="${col}" stroke="${d}" stroke-width=".8"/><circle cx="${-s * .2}" cy="${-s * .2}" r="${s * .18}" fill="${l}" opacity=".7"/></g>`;
    case 'rodaja': return `<g ${t}><circle r="${s * .75}" fill="${col}" stroke="${d}" stroke-width="1.2"/><circle r="${s * .45}" fill="${l}" opacity=".55"/><circle r="${s * .12}" fill="${d}" opacity=".5"/></g>`;
    case 'filete': return `<g ${t}><path d="M${-s * 1.6} ${-s * .3} Q${-s} ${-s * 1.1} ${s * .6} ${-s * .9} Q${s * 1.8} ${-s * .4} ${s * 1.4} ${s * .6} Q${0} ${s * 1.2} ${-s * 1.3} ${s * .7}Z" fill="${col}" stroke="${d}" stroke-width="1"/>
      <path d="M${-s} ${-s * .2} L${s * .9} ${-s * .4} M${-s * .9} ${s * .3} L${s} ${s * .1}" stroke="${d}" stroke-width="1.6" opacity=".45"/></g>`;
    case 'tira': return `<g ${t}><rect x="${-s * 1.2}" y="${-s * .18}" width="${s * 2.4}" height="${s * .36}" rx="${s * .18}" fill="${col}" stroke="${d}" stroke-width=".6"/></g>`;
    case 'huevo': return `<g ${t}><path d="M0 ${-s * 1.1} Q${s * 1.3} ${-s * .8} ${s} ${s * .4} Q${s * .2} ${s * 1.2} ${-s * .9} ${s * .6} Q${-s * 1.4} ${-s * .4} 0 ${-s * 1.1}Z" fill="#fffaf0" stroke="#e6dcc5" stroke-width=".8"/><circle r="${s * .45}" fill="${col}"/><circle cx="${-s * .12}" cy="${-s * .12}" r="${s * .12}" fill="#fff6c9"/></g>`;
    case 'pan': return `<g ${t}><path d="M${-s * 1.2} ${s * .8} L${-s * 1.2} ${-s * .2} Q${-s * 1.3} ${-s * 1.1} 0 ${-s * 1.1} Q${s * 1.3} ${-s * 1.1} ${s * 1.2} ${-s * .2} L${s * 1.2} ${s * .8}Z" fill="${col}" stroke="${d}" stroke-width="1.2"/><path d="M${-s * .95} ${s * .6} L${-s * .95} ${-s * .15} Q${-s} ${-s * .85} 0 ${-s * .85} Q${s} ${-s * .85} ${s * .95} ${-s * .15} L${s * .95} ${s * .6}Z" fill="${l}" opacity=".6"/></g>`;
    case 'polvo': return `<g ${t}>${Array.from({ length: 10 }, () => `<circle cx="${((R() - .5) * s * 1.6).toFixed(1)}" cy="${((R() - .5) * s * 1.6).toFixed(1)}" r="${(.6 + R()).toFixed(1)}" fill="${col}" opacity=".8"/>`).join('')}</g>`;
    case 'liquido': return `<g ${t}><path d="M${-s} 0 Q${-s * .9} ${-s * .9} 0 ${-s * .8} Q${s * 1.1} ${-s * .7} ${s * .9} ${s * .2} Q${s * .5} ${s} ${-s * .3} ${s * .8} Q${-s * 1.1} ${s * .6} ${-s} 0Z" fill="${col}" opacity=".85"/></g>`;
    default: return `<g ${t}><rect x="${-s * .5}" y="${-s * .5}" width="${s}" height="${s}" rx="${s * .15}" fill="${col}" stroke="${d}" stroke-width=".8"/><rect x="${-s * .5}" y="${-s * .5}" width="${s}" height="${s * .3}" rx="${s * .15}" fill="${l}" opacity=".5"/></g>`;
  }
}

export function dishSVG(rec) {
  const R = rng(rec.id);
  const W = 320, H = 220, cx = W / 2, cy = H / 2 + 4;
  const bg = ['#3a2a20', '#2c2f36', '#3b3026', '#24303a'][Math.floor(R() * 4)];
  let defs = `<defs>
    <radialGradient id="pl${rec.id}" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#e9e6df"/><stop offset="1" stop-color="#c9c4b8"/></radialGradient>
    <radialGradient id="sh${rec.id}" cx=".5" cy=".5" r=".5"><stop offset=".6" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
    <pattern id="wd${rec.id}" width="40" height="12" patternUnits="userSpaceOnUse"><rect width="40" height="12" fill="${bg}"/><path d="M0 6 Q10 3 20 6 T40 6" stroke="${shade(bg, 12)}" fill="none"/></pattern>
  </defs>`;
  let body = `<rect width="${W}" height="${H}" fill="url(#wd${rec.id})"/>`;
  // servilleta y cubiertos
  body += `<rect x="18" y="40" width="46" height="150" rx="4" fill="${['#d8394b', '#2457d6', '#35c06a', '#e6bf2e'][Math.floor(R() * 4)]}" opacity=".85"/>
    <rect x="34" y="50" width="5" height="120" rx="2" fill="#cfd4da"/><rect x="45" y="50" width="5" height="120" rx="2" fill="#cfd4da"/>`;

  if (rec.recipiente === 'vaso') {
    const cols = rec.ing.filter(i => i.forma === 'liquido' || i.forma === 'polvo').map(i => i.col);
    const mix = mixColors(cols.length ? cols : rec.ing.map(i => i.col));
    body += `<ellipse cx="${cx}" cy="196" rx="52" ry="10" fill="url(#sh${rec.id})"/>
      <path d="M${cx - 42} 30 L${cx + 42} 30 L${cx + 34} 192 Q${cx} 200 ${cx - 34} 192 Z" fill="#ffffff22" stroke="#ffffff88" stroke-width="2"/>
      <path d="M${cx - 39} 52 L${cx + 39} 52 L${cx + 34} 190 Q${cx} 197 ${cx - 34} 190 Z" fill="${mix}"/>
      <ellipse cx="${cx}" cy="52" rx="39" ry="6" fill="${shade(mix, 25)}"/>
      <path d="M${cx - 30} 60 L${cx - 26} 180" stroke="#ffffff55" stroke-width="5" stroke-linecap="round"/>
      <rect x="${cx + 12}" y="6" width="6" height="70" rx="3" fill="#ff5722" transform="rotate(14 ${cx + 15} 40)"/>`;
    const deco = rec.ing.filter(i => !['liquido', 'polvo'].includes(i.forma)).slice(0, 3);
    deco.forEach((i, k) => { body += pieza(i.forma, cx - 18 + k * 18, 50, 9, i.col, R() * 360, R); });
    deco.forEach((i, k) => { body += pieza(i.forma, cx + 72 + (k % 2) * 22, 150 + k * 18, 11, i.col, R() * 360, R); });
  } else {
    const bol = rec.recipiente === 'bol';
    const rad = bol ? 82 : 92;
    body += `<ellipse cx="${cx + 4}" cy="${cy + 8}" rx="${rad + 10}" ry="${rad * .78 + 10}" fill="url(#sh${rec.id})"/>`;
    if (bol) {
      body += `<ellipse cx="${cx}" cy="${cy}" rx="${rad}" ry="${rad * .78}" fill="${['#1f4e5f', '#f1ece2', '#3c3c3c', '#8c4b2f'][Math.floor(R() * 4)]}"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rad - 9}" ry="${rad * .78 - 8}" fill="${shade(rec.ing[0].col, -10)}"/>`;
    } else {
      body += `<ellipse cx="${cx}" cy="${cy}" rx="${rad}" ry="${rad * .78}" fill="url(#pl${rec.id})" stroke="#bdb6a8"/>
        <ellipse cx="${cx}" cy="${cy}" rx="${rad - 18}" ry="${rad * .78 - 14}" fill="none" stroke="#d6d0c4" stroke-width="1.5"/>`;
    }
    // reparto en sectores
    const ing = rec.ing.filter(i => i.forma !== 'polvo' || rec.ing.length < 4);
    const n = ing.length;
    const inner = rad - (bol ? 18 : 26);
    ing.forEach((it, idx) => {
      const ang = (idx / n) * Math.PI * 2 + R() * .3;
      const dist = idx === 0 && !bol ? 0 : inner * (.45 + R() * .25);
      const px = cx + Math.cos(ang) * dist, py = cy + Math.sin(ang) * dist * .78;
      const cnt = it.forma === 'filete' || it.forma === 'pan' || it.forma === 'liquido' ? 1 + Math.floor(R() * 2) : 3 + Math.floor(R() * 4);
      const size = it.forma === 'filete' ? 20 : it.forma === 'pan' ? 18 : it.forma === 'liquido' ? 16 : 9 + R() * 4;
      for (let k = 0; k < cnt; k++) {
        body += pieza(it.forma, px + (R() - .5) * 26, py + (R() - .5) * 20, size, it.col, R() * 360, R);
      }
    });
    // especias / brillo
    for (let k = 0; k < 18; k++) body += `<circle cx="${(cx + (R() - .5) * inner * 1.7).toFixed(1)}" cy="${(cy + (R() - .5) * inner * 1.3).toFixed(1)}" r="${(.6 + R() * .9).toFixed(1)}" fill="${R() > .5 ? '#2f6b2a' : '#3a2a1a'}" opacity=".7"/>`;
  }
  // vapor para platos calientes
  if (rec.pasos.some(p => ['hervir', 'saltear', 'horno', 'plancha'].includes(p.a))) {
    body += `<g class="vapor" stroke="#ffffff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M${cx - 20} 40 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M${cx + 4} 36 q-8 -12 0 -24 q8 -12 0 -24"/><path d="M${cx + 28} 42 q-8 -12 0 -24 q8 -12 0 -24"/></g>`;
  }
  return `<svg class="dish-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${rec.nombre}">${defs}${body}</svg>`;
}

function mixColors(cols) {
  let r = 0, g = 0, b = 0;
  cols.forEach(c => { const n = parseInt(c.slice(1), 16); r += n >> 16; g += (n >> 8) & 255; b += n & 255; });
  const k = cols.length || 1;
  return '#' + [r, g, b].map(v => Math.round(v / k).toString(16).padStart(2, '0')).join('');
}

export function dishImage(rec) {
  if (rec.foto) return `<img class="dish-photo" src="${rec.foto}" alt="${rec.nombre}" loading="lazy">`;
  return dishSVG(rec);
}

// ───────────── Productos ─────────────
export function productSVG(p) {
  const c = p.color, d = shade(c, -45), l = shade(c, 45);
  const lab = (p.etiqueta || '').slice(0, 5);
  const bgId = 'pb' + p.id;
  const wrap = (inner) => `<svg class="prod-svg" viewBox="0 0 160 160" role="img" aria-label="${p.nombre}">
    <defs><radialGradient id="${bgId}" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="${shade(c, 70)}" stop-opacity=".35"/><stop offset="1" stop-color="#14171c" stop-opacity="0"/></radialGradient>
    <linearGradient id="${bgId}m" x1="0" x2="1"><stop offset="0" stop-color="${d}"/><stop offset=".35" stop-color="${l}"/><stop offset=".6" stop-color="${c}"/><stop offset="1" stop-color="${d}"/></linearGradient></defs>
    <rect width="160" height="160" fill="url(#${bgId})"/><ellipse cx="80" cy="140" rx="46" ry="7" fill="#000" opacity=".35"/>${inner}</svg>`;
  const M = `url(#${bgId}m)`;
  const label = (x, y, w, h, txt = lab) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#111" opacity=".85"/><text x="${x + w / 2}" y="${y + h / 2 + 5}" text-anchor="middle" font-family="Oswald,Arial Black,sans-serif" font-weight="700" font-size="${Math.min(16, (w / Math.max(txt.length, 2)) * 1.5)}" fill="#fff">${txt}</text>`;
  switch (p.icono) {
    case 'bote': return wrap(`<rect x="44" y="28" width="72" height="16" rx="4" fill="#1b1b1b"/><rect x="40" y="40" width="80" height="100" rx="12" fill="${M}"/>${label(46, 70, 68, 30)}<rect x="46" y="108" width="68" height="4" rx="2" fill="#fff" opacity=".5"/>`);
    case 'tarro': return wrap(`<rect x="50" y="40" width="60" height="14" rx="3" fill="#2d2d2d"/><rect x="46" y="52" width="68" height="88" rx="8" fill="${M}" stroke="#bbb"/>${label(52, 78, 56, 28)}`);
    case 'pastillero': return wrap(`<rect x="56" y="34" width="48" height="18" rx="4" fill="#f0f0f0"/><rect x="50" y="50" width="60" height="90" rx="10" fill="${M}"/>${label(54, 80, 52, 26)}
      <ellipse cx="122" cy="132" rx="9" ry="5" fill="#fff"/><ellipse cx="34" cy="134" rx="9" ry="5" fill="${l}"/>`);
    case 'capsulas': return wrap(`<rect x="54" y="36" width="52" height="16" rx="4" fill="#333"/><rect x="48" y="50" width="64" height="90" rx="10" fill="#4a3216"/>${label(52, 80, 56, 26)}
      ${[0, 1, 2].map(i => `<g transform="translate(${120 + i * 6} ${126 - i * 10}) rotate(${30 + i * 20})"><rect x="-10" y="-5" width="20" height="10" rx="5" fill="${c}" stroke="${d}"/><rect x="-10" y="-5" width="10" height="10" rx="5" fill="${l}"/></g>`).join('')}`);
    case 'botella': return wrap(`<rect x="70" y="18" width="20" height="14" rx="3" fill="#222"/><path d="M66 32 L94 32 L100 50 L100 136 Q100 142 94 142 L66 142 Q60 142 60 136 L60 50Z" fill="${M}" opacity=".9"/>${label(62, 80, 36, 22)}`);
    case 'shaker': return wrap(`<rect x="56" y="22" width="48" height="20" rx="5" fill="#222"/><path d="M52 40 L108 40 L100 140 L60 140Z" fill="${c}" opacity=".9"/><path d="M60 70 L100 70" stroke="#fff" opacity=".5"/><path d="M60 95 L98 95" stroke="#fff" opacity=".5"/>`);
    case 'cinturon': return wrap(`<path d="M20 74 Q80 54 140 74 L140 106 Q80 86 20 106Z" fill="${M}" stroke="${d}" stroke-width="2"/><rect x="68" y="62" width="26" height="38" rx="4" fill="none" stroke="#d6d6d6" stroke-width="5"/>
      ${[0, 1, 2, 3].map(i => `<circle cx="${108 + i * 8}" cy="${84 - i * .5}" r="2.4" fill="#222"/>`).join('')}<path d="M20 80 Q80 60 140 80" stroke="#fff" stroke-dasharray="4 4" opacity=".4" fill="none"/>`);
    case 'straps': return wrap(`<path d="M30 40 Q60 30 70 70 L74 140" stroke="${c}" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M130 40 Q100 30 90 70 L86 140" stroke="#555" stroke-width="16" fill="none" stroke-linecap="round"/>
      <path d="M30 40 Q60 30 70 70" stroke="#ff9800" stroke-width="3" fill="none" stroke-dasharray="6 6"/><rect x="58" y="60" width="44" height="8" fill="#888"/>`);
    case 'munequera': return wrap(`<circle cx="80" cy="82" r="44" fill="${c}"/><circle cx="80" cy="82" r="26" fill="#14171c"/><circle cx="80" cy="82" r="36" fill="none" stroke="${l}" stroke-width="2"/><rect x="110" y="100" width="26" height="36" rx="4" fill="${l}"/>`);
    case 'rodillera': return wrap(`<path d="M50 24 L110 24 L118 136 L42 136Z" fill="${M}"/><ellipse cx="80" cy="80" rx="20" ry="24" fill="none" stroke="${l}" stroke-width="3"/><path d="M48 40 L112 40 M44 120 L116 120" stroke="#fff" opacity=".3"/>`);
    case 'magnesia': return wrap(`<path d="M40 70 Q40 40 80 40 Q120 40 120 70 L116 132 Q80 146 44 132Z" fill="#e0e0e0"/><ellipse cx="80" cy="64" rx="34" ry="12" fill="#fff"/><circle cx="66" cy="62" r="5" fill="#fafafa"/><circle cx="88" cy="66" r="6" fill="#f2f2f2"/>${label(56, 92, 48, 22, 'CHALK')}`);
    case 'bandas': return wrap(['#e53935', '#ff9800', '#43a047', '#1e88e5'].map((k, i) => `<ellipse cx="80" cy="${60 + i * 18}" rx="${58 - i * 6}" ry="16" fill="none" stroke="${k}" stroke-width="${8 - i}"/>`).join(''));
    case 'rodillo': return wrap(`<rect x="30" y="60" width="100" height="50" rx="25" fill="${M}"/><ellipse cx="130" cy="85" rx="12" ry="25" fill="${l}"/>${[0, 1, 2, 3, 4].map(i => `<rect x="${42 + i * 17}" y="62" width="6" height="46" fill="${d}" opacity=".5"/>`).join('')}`);
    case 'guantes': return wrap(`<path d="M50 140 L50 70 Q50 60 58 60 L58 40 Q58 32 64 32 Q70 32 70 40 L70 58 L72 30 Q72 22 78 22 Q84 22 84 30 L84 58 L86 34 Q86 26 92 26 Q98 26 98 34 L98 62 L100 46 Q100 40 106 40 Q112 40 112 46 L112 100 Q112 140 96 140Z" fill="${c}" stroke="#777" stroke-width="2"/><rect x="50" y="112" width="62" height="16" fill="#e53935"/>`);
    case 'cuerda': return wrap(`<path d="M40 50 Q20 140 80 130 Q140 120 120 50" stroke="${c}" stroke-width="5" fill="none"/><rect x="32" y="22" width="14" height="36" rx="6" fill="#222"/><rect x="114" y="22" width="14" height="36" rx="6" fill="#222"/>`);
    case 'mancuerna': return wrap(`<rect x="40" y="76" width="80" height="10" rx="4" fill="#c0c0c0"/>${[24, 36, 112, 124].map(x => `<rect x="${x}" y="${x === 36 || x === 112 ? 56 : 62}" width="12" height="${x === 36 || x === 112 ? 50 : 38}" rx="3" fill="${M}"/>`).join('')}`);
    case 'kettlebell': return wrap(`<path d="M58 66 Q56 30 80 30 Q104 30 102 66" stroke="${c}" stroke-width="12" fill="none"/><circle cx="80" cy="100" r="40" fill="${M}"/><text x="80" y="108" text-anchor="middle" font-family="Oswald,sans-serif" font-size="20" fill="#e6bf2e" font-weight="700">16</text>`);
    case 'zapatilla': return wrap(`<path d="M24 120 L24 90 Q40 60 70 66 L96 80 Q130 86 140 104 L140 122 Z" fill="${c}"/><path d="M24 122 L140 122 L140 132 L24 132 Z" fill="#222"/><path d="M24 132 L56 132 L56 112 L24 116Z" fill="#5d4037"/><path d="M62 74 L86 86 M58 82 L80 92" stroke="#fff" stroke-width="3"/>`);
    case 'banco': return wrap(`<rect x="22" y="80" width="80" height="14" rx="4" fill="${c}" stroke="#555"/><rect x="96" y="44" width="16" height="50" rx="4" fill="${c}" transform="rotate(30 104 70)" stroke="#555"/><rect x="40" y="94" width="8" height="40" fill="#888"/><rect x="90" y="94" width="8" height="40" fill="#888"/><rect x="28" y="130" width="84" height="6" fill="#666"/>`);
    case 'barra': return wrap(`<rect x="16" y="50" width="128" height="10" rx="5" fill="#c0c0c0"/><rect x="20" y="40" width="10" height="30" rx="2" fill="${c}"/><rect x="130" y="40" width="10" height="30" rx="2" fill="${c}"/><path d="M60 60 L60 70 M100 60 L100 70" stroke="#888" stroke-width="4"/>`);
    case 'reloj': return wrap(`<rect x="66" y="22" width="28" height="30" rx="4" fill="#333"/><rect x="66" y="114" width="28" height="30" rx="4" fill="#333"/><circle cx="80" cy="84" r="38" fill="#222" stroke="#ff7a3d" stroke-width="5"/><text x="80" y="92" text-anchor="middle" font-family="Oswald,monospace" font-size="20" fill="#7CFC00">01:30</text>`);
    default: return wrap(`<circle cx="80" cy="80" r="40" fill="${c}"/>`);
  }
}
