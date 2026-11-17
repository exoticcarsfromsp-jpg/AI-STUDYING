// Cocina 3D: anima cada paso de la receta (cortar, hervir, saltear, hornear...)
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

const rnd = (a, b) => a + Math.random() * (b - a);

export class KitchenScene {
  constructor(container) {
    this.container = container;
    const w = container.clientWidth || 600, h = container.clientHeight || 360;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.environment = new THREE.PMREMGenerator(this.renderer).fromScene(new RoomEnvironment(), .04).texture;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene.fog = new THREE.Fog(0x14171c, 6, 12);
    this.camera = new THREE.PerspectiveCamera(40, w / h, .05, 40);
    this.camera.position.set(0, 1.6, 1.45);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1.0, 0);
    this.controls.enableDamping = true;
    this.controls.minDistance = .8; this.controls.maxDistance = 5;
    this.controls.maxPolarAngle = Math.PI * .48;

    this.scene.add(new THREE.HemisphereLight(0xfff4e6, 0x302a26, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2); key.position.set(2, 4, 3); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024); this.scene.add(key);
    this.glow = new THREE.PointLight(0xff6a1a, 0, 2); this.glow.position.set(0, 1.0, 0); this.scene.add(this.glow);

    // Encimera y pared
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a3b, roughness: .7 });
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4, .1, 1.8), wood);
    counter.position.y = .85; counter.receiveShadow = true; this.scene.add(counter);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(4, .85, 1.7), new THREE.MeshStandardMaterial({ color: 0x23272e }));
    cab.position.set(0, .42, 0); this.scene.add(cab);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(6, 3), new THREE.MeshStandardMaterial({ color: 0x2a2f36 }));
    wall.position.set(0, 1.5, -.9); this.scene.add(wall);
    // azulejos
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: .3 });
    for (let x = -6; x <= 6; x++) for (let y = 0; y < 4; y++) {
      const t = new THREE.Mesh(new THREE.BoxGeometry(.28, .14, .02), tileMat);
      t.position.set(x * .3 + (y % 2) * .15, .98 + y * .16, -.88); this.scene.add(t);
    }

    this.group = new THREE.Group(); this.scene.add(this.group);
    this.anim = () => {};
    this.clock = new THREE.Clock();
    this._ro = new ResizeObserver(() => {
      const W = container.clientWidth, H = container.clientHeight; if (!W || !H) return;
      this.camera.aspect = W / H; this.camera.updateProjectionMatrix(); this.renderer.setSize(W, H);
    });
    this._ro.observe(container);
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const t = this.clock.getElapsedTime();
      this.anim(t, Math.min(this.clock.getDelta(), .05));
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  clear() {
    this.group.traverse(o => { o.geometry?.dispose?.(); });
    this.scene.remove(this.group);
    this.group = new THREE.Group(); this.scene.add(this.group);
    this.glow.intensity = 0;
    this.anim = () => {};
  }

  m(color, extra = {}) { return new THREE.MeshStandardMaterial({ color, roughness: .5, ...extra }); }

  pieza(ing, s = 1) {
    const c = new THREE.Color(ing.col);
    const mat = this.m(c);
    let geo;
    switch (ing.forma) {
      case 'grano': geo = new THREE.CapsuleGeometry(.012 * s, .025 * s, 3, 6); break;
      case 'hoja': geo = new THREE.SphereGeometry(.06 * s, 10, 6); break;
      case 'loncha': geo = new THREE.BoxGeometry(.1 * s, .01 * s, .07 * s); break;
      case 'esfera': geo = new THREE.SphereGeometry(.03 * s, 12, 10); break;
      case 'filete': geo = new THREE.BoxGeometry(.22 * s, .035 * s, .13 * s); break;
      case 'rodaja': geo = new THREE.CylinderGeometry(.04 * s, .04 * s, .012 * s, 16); break;
      case 'tira': geo = new THREE.BoxGeometry(.12 * s, .015 * s, .02 * s); break;
      case 'polvo': geo = new THREE.SphereGeometry(.008 * s, 6, 4); break;
      case 'huevo': geo = new THREE.SphereGeometry(.04 * s, 14, 10); break;
      case 'pan': geo = new THREE.BoxGeometry(.14 * s, .025 * s, .14 * s); break;
      case 'liquido': geo = new THREE.SphereGeometry(.02 * s, 8, 6); break;
      default: geo = new THREE.BoxGeometry(.035 * s, .035 * s, .035 * s);
    }
    const mesh = new THREE.Mesh(geo, mat);
    if (ing.forma === 'hoja') mesh.scale.set(1, .15, .6);
    mesh.castShadow = true;
    return mesh;
  }

  // ───────── utensilios ─────────
  olla(color = 0xb8bec6) {
    const g = new THREE.Group();
    const mat = this.m(color, { metalness: .8, roughness: .25, side: THREE.DoubleSide });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(.3, .28, .32, 32, 1, true), mat); body.position.y = .16; g.add(body);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.28, 32), mat); bottom.rotation.x = -Math.PI / 2; bottom.position.y = .005; g.add(bottom);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(.05, .012, 8, 16, Math.PI), this.m(0x222222)); h.position.set(s * .31, .27, 0); h.rotation.set(0, s > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI / 2); g.add(h); }
    g.traverse(o => o.castShadow = true);
    return g;
  }
  sarten() {
    const g = new THREE.Group();
    const mat = this.m(0x2b2b2e, { metalness: .5, roughness: .4, side: THREE.DoubleSide });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.3, .25, .07, 32, 1, true), mat); base.position.y = .035; g.add(base);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.25, 32), mat); bottom.rotation.x = -Math.PI / 2; bottom.position.y = .004; g.add(bottom);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(.45, .03, .05), this.m(0x111111)); handle.position.set(.5, .06, 0); handle.rotation.z = .12; g.add(handle);
    g.traverse(o => o.castShadow = true);
    return g;
  }
  bol(color = 0xf1ece2) {
    const pts = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; pts.push(new THREE.Vector2(Math.sin(a) * .26 + .001, (1 - Math.cos(a)) * .2)); }
    const geo = new THREE.LatheGeometry(pts, 40);
    const b = new THREE.Mesh(geo, this.m(color, { side: THREE.DoubleSide })); b.castShadow = true;
    return b;
  }
  plato() {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(.25, 0), new THREE.Vector2(.3, .02), new THREE.Vector2(.38, .045), new THREE.Vector2(.39, .05)];
    const p = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), this.m(0xffffff, { roughness: .2, side: THREE.DoubleSide }));
    p.receiveShadow = true; p.castShadow = true; return p;
  }
  fuego(r = .25) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * .7, .015, 8, 32), new THREE.MeshBasicMaterial({ color: 0x3a8dff }));
    ring.rotation.x = Math.PI / 2; g.add(ring);
    const llamas = [];
    for (let i = 0; i < 18; i++) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(.02, .07, 6), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x3a8dff : 0x7fc0ff, transparent: true, opacity: .85 }));
      const a = i / 18 * Math.PI * 2; f.position.set(Math.cos(a) * r * .7, .035, Math.sin(a) * r * .7); g.add(f); llamas.push(f);
    }
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(r + .08, r + .08, .02, 32), this.m(0x111111));
    plate.position.y = -.01; g.add(plate);
    g.userData.llamas = llamas;
    return g;
  }
  vapor(n = 14, y0 = .3, r = .2) {
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .25, depthWrite: false });
    for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(rnd(.03, .07), 8, 6), mat.clone()); s.userData = { off: Math.random(), x: rnd(-r, r), z: rnd(-r, r) }; g.add(s); }
    g.userData.y0 = y0;
    return g;
  }
  animVapor(g, t) {
    g.children.forEach(s => {
      const k = (t * .35 + s.userData.off) % 1;
      s.position.set(s.userData.x + Math.sin(t + s.userData.off * 6) * .05, g.userData.y0 + k * .7, s.userData.z);
      s.material.opacity = .3 * (1 - k); s.scale.setScalar(1 + k * 1.5);
    });
  }

  ingredientesDe(rec, filtro) {
    let l = rec.ing.filter(i => (filtro ? filtro(i) : true));
    if (!l.length) l = rec.ing;
    return l;
  }

  // ───────── escenas por acción ─────────
  setStep(step, rec, idx) {
    this.clear();
    const G = this.group;
    G.position.y = .9;
    const a = step.a;
    const solidos = this.ingredientesDe(rec, i => !['liquido', 'polvo'].includes(i.forma));
    const liquidos = this.ingredientesDe(rec, i => i.forma === 'liquido');
    const pick = (list, k) => list[(idx + k) % list.length];

    if (a === 'cortar') {
      const board = new THREE.Mesh(new THREE.BoxGeometry(.9, .04, .55), this.m(0xc89b64)); board.position.y = .02; board.castShadow = board.receiveShadow = true; G.add(board);
      const knife = new THREE.Group();
      const blade = new THREE.Mesh(new THREE.BoxGeometry(.32, .07, .006), this.m(0xdfe3e8, { metalness: .95, roughness: .15 })); blade.position.x = -.16; knife.add(blade);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(.13, .035, .025), this.m(0x1b1b1b)); handle.position.x = .07; knife.add(handle);
      knife.rotation.y = -Math.PI / 2.2; G.add(knife);
      const ing = pick(solidos, 0);
      const whole = this.pieza({ ...ing, forma: ing.forma === 'grano' ? 'cubo' : ing.forma }, 3.2); whole.position.set(.12, .09, 0); G.add(whole);
      const cortes = [];
      for (let i = 0; i < 9; i++) { const p = this.pieza(ing, 1.1); p.visible = false; p.position.set(-.05 - (i % 3) * .08 + rnd(-.02, .02), .06, -.12 + Math.floor(i / 3) * .1); p.rotation.y = rnd(0, 3); G.add(p); cortes.push(p); }
      this.anim = (t) => {
        const ciclo = t * 2.4;
        const k = Math.abs(Math.sin(ciclo * Math.PI / 2));
        knife.position.set(.05 - (ciclo % 6) * .015, .1 + k * .14, .02);
        const n = Math.floor(ciclo) % 12;
        cortes.forEach((c, i) => c.visible = i < n);
        whole.scale.setScalar(Math.max(.25, 1 - n / 12));
      };
    }

    else if (a === 'hervir') {
      const f = this.fuego(.27); G.add(f);
      const pot = this.olla(); pot.position.y = .02; G.add(pot);
      const col = liquidos[0] && rec.ing.indexOf(liquidos[0]) >= 0 && /leche|tomate|coco/i.test(liquidos[0].n) ? liquidos[0].col : '#7fb6d9';
      const water = new THREE.Mesh(new THREE.CircleGeometry(.27, 32), this.m(col, { transparent: true, opacity: .85, roughness: .1 }));
      water.rotation.x = -Math.PI / 2; water.position.y = .25; G.add(water);
      const flotan = [];
      for (let i = 0; i < 10; i++) { const p = this.pieza(pick(solidos, i)); p.position.set(rnd(-.18, .18), .25, rnd(-.18, .18)); G.add(p); flotan.push(p); }
      const burbujas = [];
      const bm = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .6 });
      for (let i = 0; i < 25; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(rnd(.008, .02), 8, 6), bm); b.userData = { x: rnd(-.22, .22), z: rnd(-.22, .22), o: Math.random() }; G.add(b); burbujas.push(b); }
      const v = this.vapor(16, .35, .2); G.add(v);
      this.glow.intensity = 1.5;
      this.anim = (t) => {
        burbujas.forEach(b => { const k = (t * 1.5 + b.userData.o) % 1; b.position.set(b.userData.x, .05 + k * .2, b.userData.z); b.scale.setScalar(.5 + k); });
        flotan.forEach((p, i) => { p.position.y = .25 + Math.sin(t * 3 + i) * .012; p.rotation.y += .01; });
        f.userData.llamas.forEach((l, i) => l.scale.y = .8 + Math.sin(t * 20 + i) * .3);
        this.animVapor(v, t);
      };
    }

    else if (a === 'saltear' || a === 'plancha') {
      const f = this.fuego(.27); G.add(f);
      const pan = this.sarten(); pan.position.y = .02; G.add(pan);
      if (a === 'plancha') for (let i = -3; i <= 3; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.48, .012, .015), this.m(0x1a1a1a)); r.position.set(0, .03, i * .065); pan.add(r); }
      const piezas = [];
      if (a === 'plancha') {
        const ing = solidos.find(i => ['filete', 'pan'].includes(i.forma)) || pick(solidos, 0);
        for (let i = 0; i < (ing.forma === 'filete' ? 1 : 3); i++) { const p = this.pieza(ing.forma === 'filete' ? ing : { ...ing, forma: 'pan' }, 1.3); p.position.set((i - 1) * .14 * (ing.forma === 'filete' ? 0 : 1), .06, 0); pan.add(p); piezas.push(p); }
      } else {
        for (let i = 0; i < 22; i++) { const p = this.pieza(pick(solidos, i), 1); p.userData = { x: rnd(-.18, .18), z: rnd(-.15, .15), o: Math.random() }; p.position.set(p.userData.x, .05, p.userData.z); pan.add(p); piezas.push(p); }
      }
      const chispas = [];
      for (let i = 0; i < 20; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(.006, 4, 3), new THREE.MeshBasicMaterial({ color: 0xfff1a8 })); c.userData = { o: Math.random(), x: rnd(-.25, .25), z: rnd(-.2, .2) }; G.add(c); chispas.push(c); }
      const v = this.vapor(10, .15, .2); G.add(v);
      this.glow.intensity = 1.2;
      this.anim = (t) => {
        f.userData.llamas.forEach((l, i) => l.scale.y = .8 + Math.sin(t * 22 + i) * .35);
        if (a === 'saltear') {
          const ciclo = (t * .8) % 1; // salto de la sartén
          const lift = ciclo < .3 ? Math.sin(ciclo / .3 * Math.PI) : 0;
          pan.rotation.z = lift * .18; pan.position.x = -lift * .05;
          piezas.forEach(p => {
            const k = Math.max(0, Math.sin(((t * .8 + p.userData.o * .1) % 1) / .45 * Math.PI));
            p.position.y = .05 + (ciclo < .45 ? k * .25 : 0);
            p.rotation.x += .05 * (ciclo < .45 ? 3 : .2);
          });
        } else {
          const ciclo = (t * .25) % 1;
          piezas.forEach(p => {
            if (ciclo > .8) { const k = (ciclo - .8) / .2; p.position.y = .06 + Math.sin(k * Math.PI) * .25; p.rotation.x = k * Math.PI; }
            else { p.position.y = .06; p.rotation.x = 0; }
            p.material.color.lerp(new THREE.Color(0x6b3b1e), .0015);
          });
        }
        chispas.forEach(c => { const k = (t * 1.3 + c.userData.o) % 1; c.position.set(c.userData.x, .08 + k * .25, c.userData.z); c.visible = k < .6; });
        this.animVapor(v, t);
      };
    }

    else if (a === 'mezclar' || a === 'reposar' || a === 'verter') {
      const bol = this.bol(); G.add(bol);
      const relleno = new THREE.Mesh(new THREE.CircleGeometry(.22, 32), this.m((liquidos[0] || rec.ing[0]).col, { roughness: .3 }));
      relleno.rotation.x = -Math.PI / 2; relleno.position.y = .11; G.add(relleno);
      const piezas = [];
      for (let i = 0; i < 18; i++) { const p = this.pieza(pick(rec.ing, i), .9); p.userData = { r: rnd(.04, .19), a: rnd(0, 6.28), s: rnd(.8, 1.2) }; G.add(p); piezas.push(p); }
      let extra;
      if (a === 'mezclar') {
        extra = new THREE.Group();
        const palo = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .45, 8), this.m(0xa0703c)); palo.position.y = .22; extra.add(palo);
        const cuchara = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 8), this.m(0xa0703c)); cuchara.scale.set(1, .35, 1.4); extra.add(cuchara);
        G.add(extra);
      } else if (a === 'reposar') {
        extra = new THREE.Group();
        const glass = this.m(0xbfe3ff, { transparent: true, opacity: .35 });
        const t1 = new THREE.Mesh(new THREE.ConeGeometry(.08, .14, 20), glass); t1.position.y = .07; t1.rotation.x = Math.PI; extra.add(t1);
        const t2 = new THREE.Mesh(new THREE.ConeGeometry(.08, .14, 20), glass); t2.position.y = .21; extra.add(t2);
        const arena = new THREE.Mesh(new THREE.ConeGeometry(.06, .08, 20), this.m(0xffb347)); arena.position.y = .04; arena.rotation.x = Math.PI; extra.add(arena);
        extra.position.set(.45, .02, .1); G.add(extra);
      } else {
        extra = new THREE.Group();
        const jarra = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .25, 20, 1, true), this.m(0xdfe8ee, { transparent: true, opacity: .5, side: THREE.DoubleSide }));
        extra.add(jarra);
        const liq = new THREE.Mesh(new THREE.CylinderGeometry(.075, .095, .16, 20), this.m((liquidos[0] || rec.ing[0]).col)); liq.position.y = -.04; extra.add(liq);
        extra.position.set(.3, .45, 0); G.add(extra);
        const chorro = new THREE.Mesh(new THREE.CylinderGeometry(.012, .018, .32, 10), this.m((liquidos[0] || rec.ing[0]).col, { transparent: true, opacity: .9 }));
        chorro.position.set(.16, .26, 0); G.add(chorro); extra.userData.chorro = chorro;
      }
      this.anim = (t) => {
        const vel = a === 'mezclar' ? 2.2 : .25;
        piezas.forEach(p => { p.userData.a += .01 * vel / p.userData.r * .05; p.position.set(Math.cos(p.userData.a + t * vel * .3) * p.userData.r, .115 + Math.sin(t * 2 + p.userData.r * 30) * .006, Math.sin(p.userData.a + t * vel * .3) * p.userData.r); });
        if (a === 'mezclar') { extra.position.set(Math.cos(t * 2.4) * .12, .1, Math.sin(t * 2.4) * .12); extra.rotation.z = .35; extra.rotation.y = -t * 2.4; }
        if (a === 'reposar') { extra.rotation.z = Math.floor(t / 3) % 2 ? Math.PI : 0; }
        if (a === 'verter') {
          const k = (t * .25) % 1;
          extra.rotation.z = Math.min(1, k * 4) * 1.9; extra.position.set(.32, .42, 0);
          extra.userData.chorro.visible = k > .2 && k < .9;
          relleno.position.y = .05 + Math.min(1, k) * .08;
          relleno.scale.setScalar(.6 + Math.min(1, k) * .4);
        }
      };
    }

    else if (a === 'batir') {
      const base = new THREE.Mesh(new THREE.BoxGeometry(.28, .16, .28), this.m(0x2b2f36)); base.position.y = .08; G.add(base);
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .02, 16), this.m(0xff6a1a, { emissive: 0xff6a1a, emissiveIntensity: .8 })); btn.rotation.x = Math.PI / 2; btn.position.set(0, .08, .145); G.add(btn);
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(.14, .1, .42, 24, 1, true), this.m(0xdff3ff, { transparent: true, opacity: .3, side: THREE.DoubleSide })); jar.position.y = .37; G.add(jar);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(.145, .145, .03, 24), this.m(0x1b1b1b)); lid.position.y = .59; G.add(lid);
      const cols = rec.ing.map(i => new THREE.Color(i.col));
      const mix = cols.reduce((acc, c) => acc.add(c), new THREE.Color(0, 0, 0)).multiplyScalar(1 / cols.length);
      const liquid = new THREE.Mesh(new THREE.CylinderGeometry(.125, .1, .26, 24), this.m(mix, { roughness: .3 })); liquid.position.y = .3; G.add(liquid);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(.16, .01, .03), this.m(0xdddddd, { metalness: .9 })); blade.position.y = .2; G.add(blade);
      const trozos = [];
      for (let i = 0; i < 16; i++) { const p = this.pieza(pick(rec.ing, i), .8); p.userData = { r: rnd(.03, .1), y: rnd(.22, .42), o: rnd(0, 6) }; G.add(p); trozos.push(p); }
      this.anim = (t) => {
        blade.rotation.y = t * 40;
        G.position.x = Math.sin(t * 60) * .002;
        const k = Math.min(1, (t % 6) / 4);
        trozos.forEach(p => { p.position.set(Math.cos(t * 8 + p.userData.o) * p.userData.r, p.userData.y + Math.sin(t * 5 + p.userData.o) * .05, Math.sin(t * 8 + p.userData.o) * p.userData.r); p.scale.setScalar(1 - k * .9); });
        liquid.scale.y = .8 + Math.sin(t * 12) * .03 + k * .2;
      };
    }

    else if (a === 'horno') {
      const ovenMat = this.m(0x30353d, { metalness: .6, roughness: .3 });
      const oven = new THREE.Group();
      const back = new THREE.Mesh(new THREE.BoxGeometry(.9, .6, .05), ovenMat); back.position.set(0, .3, -.3); oven.add(back);
      for (const s of [-1, 1]) { const side = new THREE.Mesh(new THREE.BoxGeometry(.05, .6, .6), ovenMat); side.position.set(s * .45, .3, 0); oven.add(side); }
      const top = new THREE.Mesh(new THREE.BoxGeometry(.95, .05, .62), ovenMat); top.position.y = .62; oven.add(top);
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(.95, .05, .62), ovenMat); bottom.position.y = 0; oven.add(bottom);
      const door = new THREE.Mesh(new THREE.BoxGeometry(.85, .5, .02), this.m(0xff9a3d, { transparent: true, opacity: .3, emissive: 0xff7a1a, emissiveIntensity: .4 })); door.position.set(0, .3, .31); oven.add(door);
      const res = new THREE.Mesh(new THREE.BoxGeometry(.75, .015, .015), new THREE.MeshBasicMaterial({ color: 0xff4400 })); res.position.set(0, .56, 0); oven.add(res);
      const tray = new THREE.Mesh(new THREE.BoxGeometry(.7, .02, .45), this.m(0x888888, { metalness: .8 })); tray.position.y = .15; oven.add(tray);
      for (let i = 0; i < 9; i++) { const p = this.pieza(pick(solidos, i), 1.2); p.position.set(rnd(-.28, .28), .19, rnd(-.16, .16)); p.rotation.y = rnd(0, 3); oven.add(p); }
      G.add(oven);
      const luz = new THREE.PointLight(0xff7a1a, 2, 1.2); luz.position.set(0, .4, 0); oven.add(luz);
      this.anim = (t) => { luz.intensity = 1.6 + Math.sin(t * 3) * .4; res.material.color.setHSL(.03, 1, .45 + Math.sin(t * 3) * .08); };
    }

    else if (a === 'tostar') {
      const body = new THREE.Mesh(new THREE.BoxGeometry(.4, .25, .22), this.m(0xd8394b, { metalness: .4, roughness: .3 })); body.position.y = .125; G.add(body);
      const lever = new THREE.Mesh(new THREE.BoxGeometry(.06, .02, .03), this.m(0x111111)); lever.position.set(.21, .18, 0); G.add(lever);
      const panes = [];
      const panIng = rec.ing.find(i => i.forma === 'pan') || { col: '#c48a46', forma: 'pan' };
      for (const x of [-.08, .08]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.03, .2, .17), this.m(panIng.col)); p.position.set(x, .2, 0); G.add(p); panes.push(p); }
      this.anim = (t) => {
        const k = (t * .3) % 1;
        const up = k > .85 ? Math.sin((k - .85) / .15 * Math.PI) : 0;
        panes.forEach(p => { p.position.y = .15 + up * .18; p.material.color.lerp(new THREE.Color(0x7a4a1f), k < .85 ? .003 : 0); });
        lever.position.y = k < .85 ? .08 : .18;
        this.glow.intensity = k < .85 ? 1.2 : 0;
      };
    }

    else { // emplatar
      const plato = rec.recipiente === 'bol' ? this.bol(0x1f4e5f) : this.plato();
      if (rec.recipiente === 'vaso') {
        const vaso = new THREE.Mesh(new THREE.CylinderGeometry(.11, .09, .34, 24, 1, true), this.m(0xffffff, { transparent: true, opacity: .25, side: THREE.DoubleSide })); vaso.position.y = .17; G.add(vaso);
        const cols = rec.ing.map(i => new THREE.Color(i.col));
        const mix = cols.reduce((acc, c) => acc.add(c), new THREE.Color(0, 0, 0)).multiplyScalar(1 / cols.length);
        const liq = new THREE.Mesh(new THREE.CylinderGeometry(.105, .088, .3, 24), this.m(mix)); liq.position.y = .15; G.add(liq);
        this.anim = (t) => { const k = Math.min(1, (t % 5) / 2); liq.scale.y = Math.max(.01, k); liq.position.y = .15 * k + .005; };
      } else {
        G.add(plato);
        const piezas = [];
        rec.ing.forEach((ing, i) => {
          const n = ['filete', 'pan', 'huevo'].includes(ing.forma) ? 1 + (ing.forma === 'huevo') : ing.forma === 'polvo' ? 12 : 6;
          const ang = i / rec.ing.length * Math.PI * 2;
          for (let k = 0; k < n; k++) {
            const p = this.pieza(ing, ing.forma === 'filete' ? 1.2 : 1.1);
            const r = i === 0 && rec.recipiente !== 'bol' ? rnd(0, .06) : rnd(.08, .2);
            p.userData = { x: Math.cos(ang) * r + rnd(-.04, .04), z: Math.sin(ang) * r + rnd(-.04, .04), d: i * .5 + k * .08 };
            p.rotation.y = rnd(0, 6);
            G.add(p); piezas.push(p);
          }
        });
        this.anim = (t) => {
          const tt = t % (rec.ing.length * .5 + 3);
          piezas.forEach(p => {
            const k = Math.min(1, Math.max(0, (tt - p.userData.d) / .5));
            const e = 1 - Math.pow(1 - k, 3);
            p.visible = k > 0;
            p.position.set(p.userData.x, .06 + (1 - e) * .6, p.userData.z);
          });
          G.rotation.y = t * .15;
        };
      }
    }
  }

  dispose() {
    cancelAnimationFrame(this._raf); this._ro.disconnect(); this.controls.dispose();
    this.scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
    this.renderer.dispose(); this.renderer.domElement.remove();
  }
}
