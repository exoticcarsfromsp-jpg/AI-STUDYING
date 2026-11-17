// Componentes de interfaz reutilizables
import { store, logsDe, mejorMarca, cargaSerie, e1rm, uid, hoy, rangoEjercicio, pesoActual } from './store.js';
import { badgeSVG } from './data/ranks.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
export const fmtKg = (n) => (Math.round(n * 100) / 100).toLocaleString('es-ES', { maximumFractionDigits: 2 });
export const fmtFecha = (f) => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

// ───── Toast ─────
let toastT;
export function toast(html, ms = 2600) {
  const t = $('#toast'); t.innerHTML = html; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms);
}

// ───── Modal ─────
export function modal(html, onMount) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal" role="dialog"><button class="btn sm ghost close" aria-label="Cerrar">✕</button>${html}</div>`;
  const close = () => { bg.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  bg.addEventListener('click', (e) => { if (e.target === bg || e.target.closest('.close')) close(); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  onMount?.(bg.querySelector('.modal'), close);
  return close;
}

// ───── Sonido / vibración ─────
let actx;
export function beep(freq = 880, dur = .15, n = 1) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < n; i++) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
      const t0 = actx.currentTime + i * (dur + .08);
      g.gain.setValueAtTime(.25, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
      o.start(t0); o.stop(t0 + dur);
    }
  } catch { /* sin audio */ }
  navigator.vibrate?.([120, 60, 120]);
}

// ───── Temporizador de descanso ─────
const rest = { total: 0, left: 0, int: null };
export function startRest(sec) {
  rest.total = rest.left = sec;
  const box = $('#rest'); box.classList.add('show');
  clearInterval(rest.int);
  const paint = () => {
    const m = Math.floor(Math.max(0, rest.left) / 60), s = Math.max(0, rest.left) % 60;
    $('#restT').textContent = `${m}:${String(s).padStart(2, '0')}`;
    $('#restArc').style.strokeDashoffset = 94.2 * (1 - rest.left / rest.total);
  };
  paint();
  rest.int = setInterval(() => {
    rest.left--; paint();
    if (rest.left === 3) beep(660, .1);
    if (rest.left <= 0) { clearInterval(rest.int); beep(990, .2, 3); toast('⏱️ ¡Descanso terminado! A por la siguiente serie'); setTimeout(() => box.classList.remove('show'), 1200); }
  }, 1000);
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-rest]'); if (!b) return;
  const v = b.dataset.rest;
  if (v === 'skip') { clearInterval(rest.int); $('#rest').classList.remove('show'); return; }
  rest.left = Math.max(1, rest.left + +v); rest.total = Math.max(rest.total, rest.left);
});

// ───── Confeti ─────
export function confetti() {
  const c = document.createElement('canvas'); c.className = 'confetti'; document.body.appendChild(c);
  c.width = innerWidth; c.height = innerHeight;
  const ctx = c.getContext('2d');
  const cols = ['#ff6a1a', '#e6bf2e', '#35c06a', '#7fbff2', '#8a6cf0', '#d8394b'];
  const ps = Array.from({ length: 140 }, () => ({ x: innerWidth / 2, y: innerHeight / 3, vx: (Math.random() - .5) * 14, vy: Math.random() * -14 - 3, r: Math.random() * 6 + 3, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }));
  let f = 0;
  const tick = () => {
    ctx.clearRect(0, 0, c.width, c.height);
    ps.forEach(p => { p.vy += .35; p.x += p.vx; p.y += p.vy; p.a += .2; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    if (++f < 150) requestAnimationFrame(tick); else c.remove();
  };
  tick();
}

// ───── Gráfica de línea SVG ─────
export function lineChart(pts, { unidad = 'kg', h = 190 } = {}) {
  if (pts.length < 2) return `<div class="empty small">Registra al menos dos días para ver tu evolución 📈</div>`;
  const W = 600, H = h, pl = 38, pr = 12, pt = 14, pb = 26;
  const ys = pts.map(p => p.y);
  let min = Math.min(...ys), max = Math.max(...ys);
  if (max === min) { max += 1; min -= 1; }
  const pad = (max - min) * .15; min -= pad; max += pad;
  const X = (i) => pl + (i / (pts.length - 1)) * (W - pl - pr);
  const Y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  const area = `${d} L${X(pts.length - 1)} ${H - pb} L${pl} ${H - pb} Z`;
  const grid = [0, .5, 1].map(k => { const v = min + (max - min) * k; return `<line class="gd" x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}"/><text x="4" y="${Y(v) + 3}">${Math.round(v)}</text>`; }).join('');
  const step = Math.ceil(pts.length / 6);
  const labels = pts.map((p, i) => (i % step === 0 || i === pts.length - 1) ? `<text x="${X(i)}" y="${H - 8}" text-anchor="middle">${esc(p.x)}</text>` : '').join('');
  const dots = pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="3.5"><title>${esc(p.x)}: ${fmtKg(p.y)} ${unidad}</title></circle>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6a1a" stop-opacity=".6"/><stop offset="1" stop-color="#ff6a1a" stop-opacity="0"/></linearGradient></defs>${grid}<path class="ar" d="${area}"/><path class="ln" d="${d}"/>${dots}${labels}</svg>`;
}

// ───── Discos por lado (barra olímpica de 20 kg) ─────
const DISCOS = [[25, '#d8394b', 46], [20, '#2457d6', 44], [15, '#e6bf2e', 40], [10, '#35c06a', 36], [5, '#eef1f5', 28], [2.5, '#1d1f24', 24], [1.25, '#9aa0a8', 20]];
export function discosHTML(kg, barra = 20) {
  let lado = (kg - barra) / 2;
  if (lado < 0) return '<span class="small muted">Menos que la barra vacía (20 kg)</span>';
  const usados = [];
  for (const [p] of DISCOS) while (lado >= p - 1e-9) { usados.push(p); lado -= p; }
  const vis = usados.map(p => { const d = DISCOS.find(x => x[0] === p); return `<i style="height:${d[2]}px;background:${d[1]};${p === 2.5 ? 'border:1px solid #555' : ''}" title="${p} kg"></i>`; });
  return `<div class="row between"><div class="plates">${[...vis].reverse().join('')}<span class="barp"></span>${vis.join('')}</div>
    <span class="small muted">Por lado: ${usados.length ? usados.join(' + ') + ' kg' : 'barra vacía'}${lado > 0.01 ? ` (+${fmtKg(lado)} sin disco)` : ''}</span></div>`;
}

// ───── Registro de series ─────
function parsePres(pres) {
  const m = /(\d+)\s*×\s*(\d+)/.exec(pres || '');
  return { series: m ? +m[1] : 3, reps: m ? +m[2] : 10 };
}

export class SetLogger {
  constructor(el, ej, { pres, sesion = false, onSetDone, onSaved, rows, onChange } = {}) {
    this.onChange = onChange;
    this.el = el; this.ej = ej; this.sesion = sesion; this.onSetDone = onSetDone; this.onSaved = onSaved;
    const prev = logsDe(ej.id).at(-1);
    this.prev = prev?.sets || [];
    const p = parsePres(pres || ej.pres);
    const n = Math.max(p.series, this.prev.length || 0);
    this.rows = Array.from({ length: n }, (_, i) => {
      const ps = this.prev[i] || this.prev.at(-1);
      return { kg: ps ? +ps.kg : (ej.eq === 'barra' ? 20 : 0), reps: ps ? +ps.reps : p.reps, rpe: '', done: false };
    });
    if (rows?.length) this.rows = rows;
    this.paso = ej.eq === 'mancuernas' || ej.eq === 'kettlebell' ? 1 : (store.get().perfil.incremento || 2.5);
    this.recordPrevio = mejorMarca(ej.id)?.valor || 0;
    this.render();
  }

  get usaKg() { return this.ej.modo === 'peso' || this.ej.modo === 'corporal'; }

  render() {
    const ej = this.ej;
    const kgLabel = ej.modo === 'corporal' ? 'Lastre kg' : ej.eq === 'mancuernas' ? 'kg (c/u)' : 'kg';
    const repsLabel = ej.modo === 'tiempo' ? 'Seg' : 'Reps';
    this.el.innerHTML = `<div class="logger">
      <table>
        <thead><tr><th>Serie</th>${this.usaKg ? `<th>${kgLabel}</th>` : ''}<th>${repsLabel}</th><th>RPE</th><th>✓</th></tr></thead>
        <tbody>${this.rows.map((r, i) => this.rowHTML(r, i)).join('')}</tbody>
      </table>
      <div class="row between" style="margin-top:6px">
        <div class="row"><button class="btn sm" data-a="add">+ Serie</button><button class="btn sm ghost" data-a="del">− Serie</button></div>
        ${this.sesion ? '' : '<button class="btn primary" data-a="save">Guardar registro</button>'}
      </div>
      <div class="live" style="margin-top:10px" data-live></div>
      ${ej.eq === 'barra' ? '<div style="margin-top:8px" data-plates></div>' : ''}
    </div>`;
    this.bind();
    this.updateLive();
  }

  rowHTML(r, i) {
    const ps = this.prev[i];
    const prevTxt = ps ? (this.usaKg ? `${fmtKg(+ps.kg)}×${ps.reps}` : `${ps.reps}`) : '—';
    return `<tr data-i="${i}" class="${r.done ? 'done' : ''}">
      <td><span class="setn">${i + 1}</span></td>
      ${this.usaKg ? `<td><div class="stepper"><button data-s="kg" data-d="-1" aria-label="Menos peso">−</button><input inputmode="decimal" data-f="kg" value="${r.kg}" aria-label="Peso"><button data-s="kg" data-d="1" aria-label="Más peso">+</button></div><span class="ghost-prev">Anterior: ${prevTxt}</span></td>` : ''}
      <td><div class="stepper reps"><button data-s="reps" data-d="-1">−</button><input inputmode="numeric" data-f="reps" value="${r.reps}" aria-label="Repeticiones"><button data-s="reps" data-d="1">+</button></div>${this.usaKg ? '' : `<span class="ghost-prev">Anterior: ${prevTxt}</span>`}</td>
      <td><div class="rpe"><select data-f="rpe" aria-label="Esfuerzo percibido"><option value="">–</option>${[6, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => `<option ${+r.rpe === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div></td>
      <td><button class="chk" data-a="done" aria-label="Serie completada">✓</button></td>
    </tr>`;
  }

  bind() {
    this.el.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const tr = b.closest('tr'); const i = tr ? +tr.dataset.i : -1;
      if (b.dataset.s) {
        const f = b.dataset.s, d = +b.dataset.d;
        const step = f === 'kg' ? this.paso : 1;
        this.rows[i][f] = Math.max(0, Math.round(((+this.rows[i][f] || 0) + d * step) * 100) / 100);
        // al cambiar una serie, propaga a las siguientes no completadas
        for (let k = i + 1; k < this.rows.length; k++) if (!this.rows[k].done && f === 'kg') this.rows[k].kg = this.rows[i].kg;
        this.repaintInputs(); this.updateLive();
      } else if (b.dataset.a === 'done') {
        const r = this.rows[i]; r.done = !r.done;
        tr.classList.toggle('done', r.done);
        if (r.done) { this.onSetDone?.(r, i); this.checkPR(r, tr); }
        this.updateLive();
      } else if (b.dataset.a === 'add') {
        const last = this.rows.at(-1) || { kg: 0, reps: 10 };
        this.rows.push({ kg: last.kg, reps: last.reps, rpe: '', done: false }); this.render();
      } else if (b.dataset.a === 'del') {
        if (this.rows.length > 1) { this.rows.pop(); this.render(); }
      } else if (b.dataset.a === 'save') this.save();
    };
    this.el.oninput = (e) => {
      const inp = e.target; const tr = inp.closest('tr'); if (!tr || !inp.dataset.f) return;
      const v = inp.dataset.f === 'rpe' ? inp.value : parseFloat(String(inp.value).replace(',', '.')) || 0;
      this.rows[+tr.dataset.i][inp.dataset.f] = v;
      this.updateLive();
    };
  }

  repaintInputs() {
    $$('tbody tr', this.el).forEach((tr, i) => {
      const k = tr.querySelector('[data-f="kg"]'); if (k) k.value = this.rows[i].kg;
      tr.querySelector('[data-f="reps"]').value = this.rows[i].reps;
    });
  }

  checkPR(r, tr) {
    const v = cargaSerie(this.ej, r);
    if (this.recordPrevio && v > this.recordPrevio + 1e-6) {
      tr.classList.add('pr-flash');
      toast('🔥 <b>¡Nuevo récord!</b> ' + (this.usaKg ? `1RM estimado ${fmtKg(this.ej.modo === 'corporal' ? v : v)} kg` : `${r.reps}`));
      beep(1200, .12, 2);
    }
  }

  updateLive() {
    const done = this.rows.filter(r => r.done);
    const base = done.length ? done : this.rows;
    const vol = base.reduce((a, r) => a + (+r.kg || 0) * (+r.reps || 0), 0);
    const best = Math.max(0, ...base.map(r => cargaSerie(this.ej, r)));
    const rec = this.recordPrevio;
    const live = $('[data-live]', this.el);
    const u = this.usaKg ? 'kg' : (this.ej.modo === 'tiempo' ? 's' : 'reps');
    live.innerHTML = `${this.usaKg ? `<span>Volumen <b>${fmtKg(vol)} kg</b></span>` : ''}
      <span>${this.usaKg ? '1RM est.' : 'Mejor'} <b>${fmtKg(best)} ${u}</b></span>
      <span>Récord <b>${rec ? fmtKg(rec) + ' ' + u : '—'}</b></span>
      ${rec && best > rec ? '<span class="accent"><b>▲ PR</b></span>' : ''}`;
    const pl = $('[data-plates]', this.el);
    if (pl) { const top = Math.max(...this.rows.map(r => +r.kg || 0)); pl.innerHTML = discosHTML(top); }
    this.onChange?.(this.rows);
  }

  // Series válidas para guardar (las completadas, o todas si no se marcó ninguna)
  series() {
    const done = this.rows.filter(r => r.done);
    return (done.length ? done : this.rows).filter(r => +r.reps > 0).map(r => ({ kg: +r.kg || 0, reps: +r.reps, rpe: r.rpe ? +r.rpe : undefined }));
  }

  save(fecha = hoy()) {
    const sets = this.series();
    if (!sets.length) { toast('Añade al menos una serie con repeticiones'); return null; }
    const antes = rangoEjercicio(this.ej.id);
    const log = { id: uid(), ej: this.ej.id, fecha, sets };
    store.get().logs.push(log);
    store.save();
    const despues = rangoEjercicio(this.ej.id);
    if (despues.idx > antes.idx) celebrarRango(this.ej, despues.rank);
    else if (!this.sesion) toast('✅ Registro guardado');
    this.onSaved?.(log);
    return log;
  }
}

export function celebrarRango(ej, rank) {
  confetti(); beep(880, .12, 3);
  modal(`<div style="text-align:center;padding:10px 0 4px">
    ${badgeSVG(rank, 110)}
    <h2 style="margin-top:10px">¡Rango ${esc(rank.nombre)}!</h2>
    <p class="muted">Has subido de rango en <b>${esc(ej.nombre)}</b>. Mira cómo cambia tu mapa muscular.</p>
    <a class="btn primary" href="#/inicio" onclick="document.querySelector('.modal-bg')?.remove()">Ver mi mapa</a>
  </div>`);
}

export function icon(name) {
  const i = {
    home: '<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    food: '<path d="M7 3v8a3 3 0 0 0 3 3v7M10 3v6M4 3v6a3 3 0 0 0 3 3M17 3c-2 2-3 5-3 8h3v10"/>',
    chart: '<path d="M3 3v18h18M7 15l4-4 3 3 6-6"/>',
    bag: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
    play: '<path d="M7 4l13 8-13 8z"/>',
    yt: '<path d="M22 8s0-3-3-3H5C2 5 2 8 2 8v8s0 3 3 3h14c3 0 3-3 3-3zM10 9l5 3-5 3z"/>',
    cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4c0 3 1 5 3 5M17 6h3c0 3-1 5-3 5"/>',
    chef: '<path d="M6 14a4 4 0 1 1 2-7.5A4 4 0 0 1 16 6a4 4 0 1 1 2 8v6H6z M6 17h12"/>',
    timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
    speaker: '<path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8"/>',
  }[name] || '';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i}</svg>`;
}

export { pesoActual, e1rm };
