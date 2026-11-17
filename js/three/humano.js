// FORJA · Visor 3D profesional de ejercicios.
// Un esqueleto guía invisible calcula la postura de cada ejercicio y un modelo humano riggeado (Xbot, three.js / Mixamo)
// la reproduce hueso a hueso. Los músculos trabajados se colorean sobre la piel del modelo.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/OrbitControls.js';
import { GLTFLoader } from 'three/addons/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

const D = THREE.MathUtils.degToRad;

// ───────────────────── Patrones de movimiento ─────────────────────
// Ángulos en grados. sh*F = flexión de hombro, sh*A = abducción, el = codo, hip*F/A = cadera, kn = rodilla
// lean = inclinación del torso, twist = giro, rx = cabeceo de todo el cuerpo, y/z = posición raíz
// ground: apoya los pies en el suelo · lockHands: [x,y,z] fija las manos en ese punto
const S = (o) => o; // azúcar sintáctico
const P = {
  sentadilla: { ground: true, props: ['barra:espalda'], a: S({ shA: 70, shF: -15, el: 120 }), b: S({ shA: 70, shF: -15, el: 120, hipF: 100, kn: 118, lean: 42, hipA: 12 }) },
  pesomuerto: { ground: true, props: ['barra:manos'], a: S({ lean: 55, shF: 55, hipF: 72, kn: 78, hipA: 6 }), b: S({ hipA: 6 }), dur: 2.6 },
  rumano: { ground: true, props: ['barra:manos'], a: S({ hipA: 6 }), b: S({ lean: 75, shF: 75, hipF: 8, kn: 20, hipA: 6 }), dur: 3 },
  banca: { rx: -90, y: 0.62, props: ['barra:manos', 'banco:plano'], a: S({ shF: 88, shA: 12, hipF: -30, kn: 75 }), b: S({ shF: 25, shA: 55, el: 100, hipF: -30, kn: 75 }) },
  banca_inclinada: { rx: -55, y: 0.78, props: ['barra:manos', 'banco:inclinado'], a: S({ shF: 122, shA: 12, hipF: 30, kn: 85 }), b: S({ shF: 55, shA: 50, el: 100, hipF: 30, kn: 85 }) },
  press_militar: { ground: true, props: ['barra:manos'], a: S({ shF: 40, shA: 40, el: 140 }), b: S({ shF: 172, shA: 12 }) },
  remo: { ground: true, props: ['barra:manos'], a: S({ lean: 60, shF: 60, hipF: 22, kn: 28 }), b: S({ lean: 60, shF: -5, shA: 12, el: 95, hipF: 22, kn: 28 }) },
  remo_sentado: { rx: 0, y: 0.18, props: ['polea:frente-bajo', 'cuerpo:suelo'], a: S({ lean: 20, shF: 70, hipF: 85, kn: 18 }), b: S({ lean: -8, shF: -12, el: 100, hipF: 85, kn: 18 }) },
  dominada: { lockHands: [0, 2.15, 0], props: ['barra_fija'], a: S({ shF: 172, shA: 22, kn: 35, hipF: 10 }), b: S({ shF: 25, shA: 62, el: 135, kn: 35, hipF: 15, lean: -10 }) },
  jalon: { y: 0.55, props: ['polea:alta', 'asiento'], a: S({ shF: 168, shA: 25, hipF: 90, kn: 90 }), b: S({ shF: 20, shA: 60, el: 130, hipF: 90, kn: 90, lean: -12 }) },
  curl: { ground: true, props: ['peso:manos'], a: S({ shF: 5, el: 5 }), b: S({ shF: 12, el: 140 }), dur: 2.2 },
  extension_triceps: { ground: true, props: ['polea:alta-cerca'], a: S({ lean: 12, shF: 18, el: 110 }), b: S({ lean: 12, shF: 2, el: 2 }) },
  press_frances: { rx: -90, y: 0.62, props: ['barra:manos', 'banco:plano'], a: S({ shF: 100, shA: 6, hipF: -30, kn: 75 }), b: S({ shF: 110, shA: 6, el: 120, hipF: -30, kn: 75 }) },
  elevacion_lateral: { ground: true, props: ['mancuernas'], a: S({ shA: 8, el: 12, lean: 6 }), b: S({ shA: 85, el: 15, lean: 6 }) },
  pajaros: { ground: true, props: ['mancuernas'], a: S({ lean: 75, shF: 75, hipF: 20, kn: 25, el: 15 }), b: S({ lean: 75, shF: 75, shA: 80, el: 15, hipF: 20, kn: 25 }) },
  face_pull: { ground: true, props: ['polea:frente-alto'], a: S({ shF: 85, el: 5 }), b: S({ shF: 85, shA: 70, el: 125 }) },
  aperturas: { rx: -90, y: 0.62, props: ['mancuernas', 'banco:plano'], a: S({ shF: 90, shA: 8, el: 15, hipF: -30, kn: 75 }), b: S({ shF: 90, shA: 82, el: 22, hipF: -30, kn: 75 }) },
  flexion: { lockHands: [0, 0.02, 0.0], props: [], a: S({ rx: 72, shF: 78, shA: 6 }), b: S({ rx: 86, shF: 22, shA: 40, el: 95 }) },
  fondos: { lockHands: [0, 1.25, 0], props: ['paralelas'], a: S({ shF: 0, shA: 12, kn: 70, hipF: 20, lean: 8 }), b: S({ shF: -55, shA: 15, el: 100, kn: 70, hipF: 30, lean: 28 }) },
  plancha: { y: 0.22, props: [], a: S({ rx: 90, shF: 90, el: 90 }), b: S({ rx: 88, shF: 90, el: 90 }), dur: 3 },
  crunch: { rx: -90, y: 0.12, props: [], a: S({ shF: 150, shA: 40, el: 140, hipF: 55, kn: 105 }), b: S({ lean: 38, shF: 150, shA: 40, el: 140, hipF: 55, kn: 105 }) },
  elevacion_piernas: { lockHands: [0, 2.15, 0], props: ['barra_fija'], a: S({ shF: 172, shA: 22 }), b: S({ shF: 172, shA: 22, hipF: 100, kn: 15 }) },
  prensa: { rx: -50, y: 0.55, props: ['plataforma', 'asiento:reclinado'], a: S({ hipF: 125, kn: 115, shA: 30 }), b: S({ hipF: 70, kn: 8, shA: 30 }) },
  extension_cuadriceps: { y: 0.62, props: ['asiento', 'rodillo:tobillos'], a: S({ hipF: 90, kn: 90, shA: 25 }), b: S({ hipF: 90, kn: 5, shA: 25 }) },
  curl_femoral: { rx: 90, y: 0.72, props: ['banco:plano-prono', 'rodillo:tobillos'], a: S({ shF: 150, el: 70 }), b: S({ shF: 150, el: 70, kn: 115 }) },
  zancada: { ground: true, props: ['mancuernas'], a: S({ hipF: 5, hipF_r: -5 }), b: S({ hipF: 80, kn: 90, hipF_r: -22, kn_r: 100, lean: 8 }) },
  hip_thrust: { ground: true, props: ['barra:cadera', 'banco:respaldo'], a: S({ rx: -55, hipF: 70, kn: 100, shA: 50 }), b: S({ rx: -88, hipF: 4, kn: 90, shA: 50 }) },
  patada: { ground: true, props: ['polea:baja-tras'], a: S({ lean: 30, shF: 40, hipF_r: 10 }), b: S({ lean: 30, shF: 40, hipF_r: -45, kn_r: 15 }) },
  aductores: { y: 0.62, props: ['asiento'], a: S({ hipF: 90, kn: 90, hipA: 40, shA: 25 }), b: S({ hipF: 90, kn: 90, hipA: 6, shA: 25 }) },
  gemelos: { ground: true, props: ['mancuernas'], a: S({ ank: 0 }), b: S({ ank: 30 }), dur: 1.8, toes: true },
  encogimientos: { ground: true, props: ['mancuernas'], a: S({ sy: 0 }), b: S({ sy: 0.07 }), dur: 1.6 },
  hiperextension: { rx: 45, y: 0.74, props: ['banco:romano'], a: S({ lean: 60, shF: 30, shA: 70, el: 130 }), b: S({ lean: 0, shF: 30, shA: 70, el: 130 }) },
  swing: { ground: true, props: ['kettlebell'], a: S({ lean: 60, shF: 50, hipF: 55, kn: 30, hipA: 12 }), b: S({ shF: 90, hipA: 12 }), dur: 1.4 },
  correr: { ground: true, props: [], a: S({ hipF: 55, kn: 80, hipF_r: -20, kn_r: 35, shF_l: -35, shF_r: 45, el: 85, lean: 8 }), b: S({ hipF: -20, kn: 35, hipF_r: 55, kn_r: 80, shF_l: 45, shF_r: -35, el: 85, lean: 8 }), dur: .9 },
  russian_twist: { y: 0.16, props: ['peso:centro'], a: S({ lean: -38, twist: 40, shF: 75, shA: 20, el: 70, hipF: 72, kn: 85 }), b: S({ lean: -38, twist: -40, shF: 75, shA: 20, el: 70, hipF: 72, kn: 85 }), dur: 1.8 },
};

// Qué malla se ilumina por cada músculo
const MUSC_PARTES = {
  pecho: ['pecs'], hombro: ['deltL', 'deltR'], biceps: ['brazoL', 'brazoR'], triceps: ['brazoL', 'brazoR'], antebrazo: ['antL', 'antR'],
  abdomen: ['abs'], oblicuos: ['abs'], trapecio: ['traps'], dorsal: ['lats'], lumbar: ['lumbar'], gluteo: ['gluteos'],
  cuadriceps: ['musloL', 'musloR'], isquios: ['musloL', 'musloR'], aductores: ['musloL', 'musloR'], gemelo: ['pantL', 'pantR'],
};
const HI = 0xff5a1f, HI2 = 0xffb547, PIEL = 0xc3c9d1;

export class ExerciseViewer {
  constructor(container, ej) {
    this.container = container;
    this.ej = ej;
    this.pat = P[ej.pat] || P.curl;
    this.ej.pri = ej.pri || [];
    this.ej.sec = ej.sec || [];
    this.speed = 1;
    this.playing = true;
    this.t = 0;
    this.init();
  }

  init() {
    const w = this.container.clientWidth || 600, h = this.container.clientHeight || 400;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    this.scene = scene;
    const cam = new THREE.PerspectiveCamera(38, w / h, 0.1, 50);
    cam.position.set(2.6, 1.7, 3.2);
    this.camera = cam;
    const controls = new OrbitControls(cam, renderer.domElement);
    controls.target.set(0, 0.9, 0);
    controls.enableDamping = true;
    controls.minDistance = 1.5; controls.maxDistance = 8;
    controls.maxPolarAngle = Math.PI * 0.53;
    controls.autoRotate = false; controls.autoRotateSpeed = 1.2;
    this.controls = controls;

    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x20242c, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(3, 6, 4); sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 });
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0xff8a3d, 1.2); rim.position.set(-4, 3, -3); scene.add(rim);

    // Suelo de gimnasio
    const floor = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: .9 }));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.1, 3.2, 64), new THREE.MeshBasicMaterial({ color: 0xff6a1a }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .002; scene.add(ring);
    const grid = new THREE.GridHelper(6, 24, 0x2f3540, 0x262b33); grid.position.y = .001; scene.add(grid);

    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
    this.buildBody();
    this.buildProps();
    this.highlight();
    this.ready = this.loadPro(this.ej.model || 'assets/3d/Xbot.glb').catch((e) => console.warn('Modelo 3D no disponible', e));
    if (this.props.respaldo) {
      this.pose(this.pat.b);
      const v = new THREE.Vector3(); this.torsoBarMount.getWorldPosition(v);
      this.props.respaldo.position.set(0, Math.max(.2, v.y - .32), v.z + .05);
    }

    this._resize = () => {
      const W = this.container.clientWidth, H = this.container.clientHeight;
      if (!W || !H) return;
      cam.aspect = W / H; cam.updateProjectionMatrix(); renderer.setSize(W, H);
    };
    this._ro = new ResizeObserver(this._resize); this._ro.observe(this.container);

    this.clock = new THREE.Clock();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(this.clock.getDelta(), 0.05);
      if (this.playing) this.t += dt * this.speed;
      this.update();
      controls.update();
      renderer.render(scene, cam);
    };
    loop();
  }

  mat(color) { return new THREE.MeshStandardMaterial({ color, roughness: .55, metalness: .05 }); }

  buildBody() {
    const skin = 0x8d96a3, dark = 0x3b414c;
    this.parts = {};
    const cap = (r, len, color, name) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 14), this.mat(color));
      m.castShadow = true; if (name) this.parts[name] = m; return m;
    };
    const root = new THREE.Group(); this.root = root; this.scene.add(root);

    const pelvis = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 14), this.mat(dark));
    pelvis.scale.set(1.15, .7, .8); pelvis.castShadow = true; root.add(pelvis);
    const glutes = new THREE.Group(); this.parts.gluteos = glutes;
    for (const s of [-1, 1]) { const g = new THREE.Mesh(new THREE.SphereGeometry(.085, 16, 12), this.mat(skin)); g.position.set(s * .07, -.02, -.08); g.castShadow = true; glutes.add(g); }
    root.add(glutes);

    const torso = new THREE.Group(); torso.position.y = .06; root.add(torso); this.torso = torso;
    const abs = cap(.12, .14, skin, 'abs'); abs.scale.set(1.15, 1, .8); abs.position.y = .1; torso.add(abs);
    const lumbar = new THREE.Mesh(new THREE.BoxGeometry(.18, .16, .04), this.mat(skin)); lumbar.position.set(0, .1, -.09); torso.add(lumbar); this.parts.lumbar = lumbar;
    const chest = cap(.15, .14, dark); chest.scale.set(1.3, 1, .78); chest.position.y = .25; torso.add(chest);
    const pecs = new THREE.Group(); this.parts.pecs = pecs;
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.SphereGeometry(.09, 16, 12), this.mat(skin)); p.scale.set(1.05, .75, .5); p.position.set(s * .075, .29, .08); pecs.add(p); }
    torso.add(pecs);
    const lats = new THREE.Group(); this.parts.lats = lats;
    for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), this.mat(skin)); l.scale.set(.7, 1.4, .45); l.position.set(s * .11, .24, -.075); lats.add(l); }
    torso.add(lats);
    const traps = new THREE.Mesh(new THREE.SphereGeometry(.1, 16, 12), this.mat(skin)); traps.scale.set(1.5, .55, .7); traps.position.set(0, .37, -.03); torso.add(traps); this.parts.traps = traps;
    const neck = cap(.05, .06, dark); neck.position.y = .43; torso.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(.11, 24, 18), this.mat(dark)); head.scale.set(.9, 1.1, 1); head.position.y = .56; head.castShadow = true; torso.add(head);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(.112, 20, 10, -0.9, 1.8, 1.2, .5), new THREE.MeshStandardMaterial({ color: 0xff6a1a, emissive: 0xff6a1a, emissiveIntensity: .6 }));
    visor.position.copy(head.position); visor.scale.copy(head.scale); torso.add(visor);
    this.torsoBarMount = new THREE.Object3D(); this.torsoBarMount.position.set(0, .41, -.1); torso.add(this.torsoBarMount);

    this.sh = {}; this.el = {}; this.hand = {}; this.hip = {}; this.kn = {}; this.ank = {}; this.toe = {};
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const sh = new THREE.Group(); sh.position.set(s * .15, .34, 0); torso.add(sh); this.sh[side] = sh;
      const delt = new THREE.Mesh(new THREE.SphereGeometry(.068, 16, 12), this.mat(skin)); delt.castShadow = true; sh.add(delt); this.parts['delt' + side] = delt;
      const up = cap(.05, .18, skin, 'brazo' + side); up.position.y = -.14; sh.add(up);
      const el = new THREE.Group(); el.position.y = -.28; sh.add(el); this.el[side] = el;
      const fa = cap(.042, .2, skin, 'ant' + side); fa.position.y = -.13; el.add(fa);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 10), this.mat(dark)); hand.position.y = -.28; el.add(hand); this.hand[side] = hand;

      const hip = new THREE.Group(); hip.position.set(s * .08, -.07, 0); root.add(hip); this.hip[side] = hip;
      const th = cap(.075, .3, skin, 'muslo' + side); th.position.y = -.22; hip.add(th);
      const kn = new THREE.Group(); kn.position.y = -.44; hip.add(kn); this.kn[side] = kn;
      const shin = cap(.055, .3, skin, 'pant' + side); shin.position.y = -.21; kn.add(shin);
      const ank = new THREE.Group(); ank.position.y = -.45; kn.add(ank); this.ank[side] = ank;
      const foot = new THREE.Mesh(new THREE.BoxGeometry(.09, .06, .24), this.mat(0xff6a1a)); foot.position.set(0, -.03, .06); foot.castShadow = true; ank.add(foot);
      const heel = new THREE.Object3D(); heel.position.set(0, -.06, -.05); ank.add(heel);
      const toe = new THREE.Object3D(); toe.position.set(0, -.06, .17); ank.add(toe); this.toe[side] = { heel, toe };
    }
  }

  buildProps() {
    this.props = {};
    const metal = new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: .9, roughness: .3 });
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: .6 });
    const red = new THREE.MeshStandardMaterial({ color: 0xd8394b, roughness: .5 });
    const pad = new THREE.MeshStandardMaterial({ color: 0x2a2f38, roughness: .8 });
    const frame = new THREE.MeshStandardMaterial({ color: 0x55606e, metalness: .6, roughness: .4 });
    const addShadow = (o) => { o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; };

    const barbell = () => {
      const g = new THREE.Group();
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(.014, .014, 1.9, 10), metal); bar.rotation.z = Math.PI / 2; g.add(bar);
      for (const s of [-1, 1]) {
        const p1 = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .05, 28), red); p1.rotation.z = Math.PI / 2; p1.position.x = s * .7; g.add(p1);
        const p2 = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .04, 24), plateMat); p2.rotation.z = Math.PI / 2; p2.position.x = s * .75; g.add(p2);
        const col = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .05, 12), metal); col.rotation.z = Math.PI / 2; col.position.x = s * .79; g.add(col);
      }
      return addShadow(g);
    };
    const dumbbell = () => {
      const g = new THREE.Group();
      const h = new THREE.Mesh(new THREE.CylinderGeometry(.016, .016, .22, 8), metal); h.rotation.z = Math.PI / 2; g.add(h);
      for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.065, .065, .06, 6), plateMat); p.rotation.z = Math.PI / 2; p.position.x = s * .1; g.add(p); }
      return addShadow(g);
    };

    const eq = this.ej.equip;
    const lista = this.pat.props.flatMap((sp) => {
      if (eq === 'db' && /^barra:(manos|espalda)/.test(sp)) return ['mancuernas'];
      if (eq === 'bw' && /^(barra:|mancuernas|kettlebell|peso:)/.test(sp)) return [];
      if (eq === 'bar' && sp === 'mancuernas' && /curl|banca|press_militar/.test(this.ej.pat)) return ['barra:manos'];
      return [sp];
    });
    for (const spec of lista) {
      const [tipo, modo] = spec.split(':');
      if (tipo === 'barra') { const b = barbell(); this.scene.add(b); this.props.barra = { obj: b, modo }; }
      if (tipo === 'mancuernas' || tipo === 'peso') {
        if (modo === 'centro') { const d = dumbbell(); this.scene.add(d); this.props.centro = d; }
        else { this.props.db = {}; for (const side of ['L', 'R']) { const d = dumbbell(); this.scene.add(d); this.props.db[side] = d; } }
      }
      if (tipo === 'kettlebell') {
        const g = new THREE.Group();
        const body = new THREE.Mesh(new THREE.SphereGeometry(.11, 20, 16), plateMat); body.position.y = -.14; g.add(body);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(.06, .013, 8, 20, Math.PI), metal); handle.position.y = -.04; g.add(handle);
        this.scene.add(addShadow(g)); this.props.kb = g;
      }
      if (tipo === 'banco') {
        const g = new THREE.Group();
        if (modo === 'plano' || modo === 'plano-prono') {
          const zc = modo === 'plano' ? -.4 : .2;
          const top = new THREE.Mesh(new THREE.BoxGeometry(.3, .08, 1.2), pad); top.position.set(0, .44, zc); g.add(top);
          for (const z of [zc - .45, zc + .45]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.06, .42, .06), frame); leg.position.set(0, .2, z); g.add(leg); }
          if (modo === 'plano') { const rack = new THREE.Group(); for (const s of [-1, 1]) { const up = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.1, .05), frame); up.position.set(s * .55, .55, -.55); rack.add(up); } g.add(rack); }
        } else if (modo === 'inclinado') {
          const seat = new THREE.Mesh(new THREE.BoxGeometry(.3, .08, .4), pad); seat.position.set(0, .62, .08); g.add(seat);
          const back = new THREE.Mesh(new THREE.BoxGeometry(.3, .08, .95), pad); back.position.set(0, .86, -.36); back.rotation.x = D(35); g.add(back);
          const leg = new THREE.Mesh(new THREE.BoxGeometry(.06, .42, .06), frame); leg.position.set(0, .2, .1); g.add(leg);
        } else if (modo === 'respaldo') {
          const top = new THREE.Mesh(new THREE.BoxGeometry(1.0, .4, .3), pad); g.add(top); this.props.respaldo = top;
        } else if (modo === 'romano') {
          const p = new THREE.Mesh(new THREE.BoxGeometry(.4, .1, .3), pad); p.position.set(0, .62, .14); p.rotation.x = D(45); g.add(p);
          const f = new THREE.Mesh(new THREE.BoxGeometry(.06, .6, .06), frame); f.position.set(0, .3, .2); g.add(f);
          const r = new THREE.Mesh(new THREE.BoxGeometry(.06, .06, .9), frame); r.position.set(0, .04, -.2); g.add(r);
        }
        this.scene.add(addShadow(g));
      }
      if (tipo === 'barra_fija' || tipo === 'paralelas') {
        const g = new THREE.Group();
        if (tipo === 'barra_fija') {
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.6, 10), metal); bar.rotation.z = Math.PI / 2; bar.position.set(0, 2.2, 0); g.add(bar);
          for (const s of [-1, 1]) { const up = new THREE.Mesh(new THREE.BoxGeometry(.07, 2.4, .07), frame); up.position.set(s * .8, 1.2, 0); g.add(up); }
        } else {
          for (const s of [-1, 1]) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1.0, 10), metal); bar.rotation.x = Math.PI / 2; bar.position.set(s * .27, 1.2, 0); g.add(bar);
            for (const z of [-.45, .45]) { const up = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.2, .05), frame); up.position.set(s * .27, .6, z); g.add(up); }
          }
        }
        this.scene.add(addShadow(g));
      }
      if (tipo === 'polea') {
        const anchors = { 'alta': [0, 2.3, -.1], 'alta-cerca': [0, 2.2, .45], 'frente-bajo': [0, .35, 1.6], 'frente-alto': [0, 1.6, 1.4], 'baja-tras': [0, .1, -1.1] };
        const a = new THREE.Vector3(...anchors[modo]);
        const g = new THREE.Group();
        const col = new THREE.Mesh(new THREE.BoxGeometry(.18, 2.4, .18), frame);
        col.position.set(a.x, 1.2, a.z + Math.sign(a.z || -1) * .12); g.add(col);
        const pul = new THREE.Mesh(new THREE.TorusGeometry(.05, .015, 8, 16), metal); pul.position.copy(a); g.add(pul);
        this.scene.add(addShadow(g));
        const geo = new THREE.BufferGeometry().setFromPoints([a, a.clone()]);
        const cable = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x111111 }));
        this.scene.add(cable);
        const handle = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, modo.startsWith('alta') && this.ej.pat === 'jalon' ? 1.0 : .3, 8), metal);
        handle.rotation.z = Math.PI / 2; this.scene.add(handle);
        this.props.polea = { anchor: a, cable, handle, pie: modo === 'baja-tras' };
      }
      if (tipo === 'asiento') {
        const g = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(.45, .1, .45), pad); g.add(seat);
        const leg = new THREE.Mesh(new THREE.BoxGeometry(.08, .5, .08), frame); leg.position.y = -.3; g.add(leg);
        if (modo === 'reclinado') { const back = new THREE.Mesh(new THREE.BoxGeometry(.45, .1, .9), pad); back.position.set(0, .3, -.45); back.rotation.x = D(-50) + Math.PI / 2 - D(40); g.add(back); }
        this.scene.add(addShadow(g)); this.props.asiento = { obj: g, modo };
      }
      if (tipo === 'rodillo') {
        const r = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .4, 14), pad); r.rotation.z = Math.PI / 2; this.scene.add(addShadow(r)); this.props.rodillo = r;
      }
      if (tipo === 'plataforma') {
        const p = new THREE.Mesh(new THREE.BoxGeometry(.7, .7, .06), frame); this.scene.add(addShadow(p)); this.props.plataforma = p;
      }
      if (tipo === 'cuerpo') { /* sentado en el suelo */ }
    }
  }

  highlight() {
    const color = (names, c, e) => names.forEach(n => {
      const o = this.parts[n]; if (!o) return;
      o.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.set(c); m.material.emissive = new THREE.Color(c); m.material.emissiveIntensity = e; } });
    });
    for (const m of this.ej.sec) color(MUSC_PARTES[m] || [], HI2, .12);
    for (const m of this.ej.pri) color(MUSC_PARTES[m] || [], HI, .35);
  }

  // ───────── Modelo profesional (Xbot) ─────────
  async loadPro(url) {
    const g = await new GLTFLoader().loadAsync(url);
    if (this._disposed) return;
    const model = g.scene;
    this.scene.add(model);
    model.updateMatrixWorld(true);
    const B = {};
    model.traverse((o) => { if (o.isBone) B[o.name.replace('mixamorig', '')] = o; });
    this.B = B;
    this.rest = new Map();
    for (const n in B) { const q = new THREE.Quaternion(); B[n].getWorldQuaternion(q); this.rest.set(n, { local: B[n].quaternion.clone(), world: q }); }
    // Color por zonas musculares usando pesos de piel y normales en la pose de reposo
    model.traverse((o) => {
      if (!o.isSkinnedMesh) return;
      o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false;
      if (/Joints/.test(o.name)) { o.material = new THREE.MeshStandardMaterial({ color: 0x23272e, metalness: .6, roughness: .35 }); return; }
      const geo = o.geometry, pos = geo.attributes.position, nor = geo.attributes.normal, si = geo.attributes.skinIndex, sw = geo.attributes.skinWeight;
      const bones = o.skeleton.bones.map((b) => b.name.replace('mixamorig', ''));
      const cols = new Float32Array(pos.count * 3), v = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
      const pri = new Set(this.ej.pri), sec = new Set(this.ej.sec);
      const base = new THREE.Color(PIEL), c1 = new THREE.Color(HI), c2 = new THREE.Color(HI2);
      for (let i = 0; i < pos.count; i++) {
        let bi = 0, bw = -1;
        for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } }
        v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        const z = zonaXbot(bones[bi] || '', v, n);
        const c = pri.has(z) ? c1 : sec.has(z) ? c2 : base;
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      o.material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: .15, roughness: .45 });
    });
    // El esqueleto guía deja de verse
    this.root.traverse((o) => { if (o.isMesh) o.visible = false; });
    this.xbot = model;
    this.armature = model.getObjectByName('Armature') || model.children[0];
  }

  // Copia la postura del esqueleto guía al modelo
  retarget() {
    const B = this.B, rest = this.rest, tmpQ = new THREE.Quaternion(), pq = new THREE.Quaternion();
    const setWorld = (name, wq) => {
      const b = B[name]; b.parent.getWorldQuaternion(pq);
      b.quaternion.copy(pq.invert().multiply(wq)); b.updateMatrixWorld(true);
    };
    const rootQ = new THREE.Quaternion(); this.root.getWorldQuaternion(rootQ);
    const torsoQ = this.torso.quaternion.clone();
    const I = new THREE.Quaternion();
    // Cadera y columna
    for (const n in B) B[n].quaternion.copy(rest.get(n).local);
    setWorld('Hips', rootQ.clone().multiply(rest.get('Hips').world));
    const spine = [['Spine', 1 / 3], ['Spine1', 2 / 3], ['Spine2', 1]];
    for (const [n, k] of spine) setWorld(n, rootQ.clone().multiply(I.clone().slerp(torsoQ, k)).multiply(rest.get(n).world));
    for (const n of ['Neck', 'Head', 'LeftShoulder', 'RightShoulder']) setWorld(n, rootQ.clone().multiply(torsoQ).multiply(rest.get(n).world));
    // Posición de la cadera = pelvis del esqueleto guía
    const hp = new THREE.Vector3(); this.root.getWorldPosition(hp);
    const off = new THREE.Vector3(0, .03, 0).applyQuaternion(rootQ); hp.add(off);
    B.Hips.position.copy(B.Hips.parent.worldToLocal(hp)); B.Hips.updateMatrixWorld(true);
    // Extremidades: apuntar cada hueso hacia la articulación del guía
    const aim = (bone, child, from, to) => {
      const a = new THREE.Vector3(), b = new THREE.Vector3(), f = new THREE.Vector3(), t = new THREE.Vector3();
      B[bone].getWorldPosition(a); B[child].getWorldPosition(b); from.getWorldPosition(f); to.getWorldPosition(t);
      const cur = b.sub(a).normalize(), want = t.sub(f).normalize();
      if (cur.lengthSq() < 1e-8 || want.lengthSq() < 1e-8) return;
      tmpQ.setFromUnitVectors(cur, want);
      const wq = new THREE.Quaternion(); B[bone].getWorldQuaternion(wq);
      setWorld(bone, tmpQ.multiply(wq));
    };
    for (const [S, s] of [['Left', 'L'], ['Right', 'R']]) {
      aim(S + 'Arm', S + 'ForeArm', this.sh[s], this.el[s]);
      aim(S + 'ForeArm', S + 'Hand', this.el[s], this.hand[s]);
      aim(S + 'UpLeg', S + 'Leg', this.hip[s], this.kn[s]);
      aim(S + 'Leg', S + 'Foot', this.kn[s], this.ank[s]);
      aim(S + 'Foot', S + 'ToeBase', this.ank[s], this.toe[s].toe);
    }
    // Corrección final: pies en el suelo / manos en la barra con las medidas reales del modelo
    const v = new THREE.Vector3();
    if (this.pat.ground) {
      let minY = Infinity;
      for (const S of ['Left', 'Right']) for (const n of (this.pat.toes ? ['ToeBase', 'Toe_End'] : ['Foot', 'ToeBase', 'Toe_End'])) { B[S + n].getWorldPosition(v); minY = Math.min(minY, v.y - (n === 'Foot' ? .075 : .02)); }
      this.shift(new THREE.Vector3(0, -minY, 0));
    }
    if (this.pat.lockHands) {
      const m = this.gripMid();
      this.shift(new THREE.Vector3(...this.pat.lockHands).sub(m));
    }
  }
  shift(d) {
    const B = this.B, w = new THREE.Vector3(); B.Hips.getWorldPosition(w); w.add(d);
    B.Hips.position.copy(B.Hips.parent.worldToLocal(w)); B.Hips.updateMatrixWorld(true);
  }
  grip(side, out = new THREE.Vector3()) {
    if (!this.xbot) return this.hand[side === 'R' ? 'R' : 'L'].getWorldPosition(out);
    const S = side === 'R' ? 'Right' : 'Left', a = new THREE.Vector3(), b = new THREE.Vector3();
    this.B[S + 'Hand'].getWorldPosition(a); this.B[S + 'HandMiddle1'].getWorldPosition(b);
    return out.copy(a).lerp(b, .7);
  }
  gripMid() { const a = this.grip('L'), b = this.grip('R'); return a.add(b).multiplyScalar(.5); }

  pose(p) {
    const g = (k, d = 0) => (p[k] ?? d);
    const root = this.root;
    root.rotation.set(D(g('rx', this.pat.rx || 0)), 0, 0);
    root.position.set(0, g('y', this.pat.y ?? 0.96), g('z', 0));
    this.torso.rotation.set(D(g('lean')), D(g('twist')), 0);
    for (const [side, s] of [['L', 1], ['R', -1]]) {
      const sf = g('shF_' + side.toLowerCase(), g('shF')), sa = g('shA');
      this.sh[side].rotation.set(-D(sf), 0, s * D(sa), 'XYZ');
      this.sh[side].position.y = .34 + g('sy');
      this.el[side].rotation.set(-D(g('el')), 0, 0);
      const hf = side === 'R' ? g('hipF_r', g('hipF')) : g('hipF');
      const kn = side === 'R' ? g('kn_r', g('kn')) : g('kn');
      this.hip[side].rotation.set(-D(hf), 0, s * D(g('hipA')));
      this.kn[side].rotation.set(D(kn), 0, 0);
      // tobillo: si se apoya en el suelo, mantener el pie plano (suma de cabeceos = 0)
      const ank = g('ank', null);
      const rx = g('rx', this.pat.rx || 0);
      this.ank[side].rotation.x = ank !== null ? D(ank) : this.pat.ground ? D(hf - kn - rx) : 0;
    }
    root.updateMatrixWorld(true);

    const v = new THREE.Vector3();
    if (this.pat.ground) {
      // apoyar los pies: bajar/subir la raíz y centrar los pies en z = 0
      let minY = Infinity; const zs = [];
      for (const side of ['L', 'R']) {
        for (const o of [this.toe[side].heel, this.toe[side].toe]) {
          o.getWorldPosition(v);
          minY = Math.min(minY, this.pat.toes && o === this.toe[side].heel ? Infinity : v.y);
        }
        this.toe[side].heel.getWorldPosition(v); zs.push(v.z);
      }
      root.position.y -= minY;
      root.position.z -= (zs[0] + zs[1]) / 2 + 0.05;
      root.updateMatrixWorld(true);
    }
    if (this.pat.lockHands) {
      const a = new THREE.Vector3(), b = new THREE.Vector3();
      this.hand.L.getWorldPosition(a); this.hand.R.getWorldPosition(b);
      const mid = a.add(b).multiplyScalar(.5);
      const [tx, ty, tz] = this.pat.lockHands;
      root.position.x += tx - mid.x; root.position.y += ty - mid.y; root.position.z += tz - mid.z;
      root.updateMatrixWorld(true);
    }
  }

  update() {
    const dur = (this.pat.dur || 2.4);
    const ph = (this.t % dur) / dur;          // 0..1
    // ida-vuelta con pausa en los extremos
    let k = ph < .5 ? ph * 2 : (1 - ph) * 2;
    k = Math.min(1, Math.max(0, (k - .1) / .8));
    k = k * k * (3 - 2 * k);
    const A = this.pat.a, B = this.pat.b;
    const keys = new Set([...Object.keys(A), ...Object.keys(B)]);
    const p = {};
    for (const key of keys) {
      const def = key === 'rx' ? (this.pat.rx || 0) : key === 'y' ? (this.pat.y ?? 0.96) : 0;
      p[key] = (A[key] ?? def) + ((B[key] ?? def) - (A[key] ?? def)) * k;
    }
    this.pose(p);
    if (this.xbot) this.retarget();
    this.updateProps();
    this.phase = k;
  }

  updateProps() {
    const mid = this.gripMid();
    const bar = this.props.barra;
    if (bar) {
      if (bar.modo === 'manos') bar.obj.position.copy(mid);
      if (bar.modo === 'espalda') { if (this.xbot) { this.B.Neck.getWorldPosition(bar.obj.position); const q = new THREE.Quaternion(); this.B.Spine2.getWorldQuaternion(q); bar.obj.position.add(new THREE.Vector3(0, -.02, -.1).applyQuaternion(q)); } else this.torsoBarMount.getWorldPosition(bar.obj.position); }
      if (bar.modo === 'cadera') { (this.xbot ? this.B.Hips : this.root).getWorldPosition(bar.obj.position); bar.obj.position.y += .14; }
    }
    if (this.props.db) for (const side of ['L', 'R']) {
      const d = this.props.db[side]; this.grip(side, d.position);
      const fq = new THREE.Quaternion();
      if (this.xbot) this.B[(side === 'R' ? 'Right' : 'Left') + 'Hand'].getWorldQuaternion(fq); else this.hand[side].getWorldQuaternion(fq);
      d.quaternion.copy(fq); if (!this.xbot) d.rotateY(Math.PI / 2); else d.rotateZ(Math.PI / 2);
    }
    if (this.props.kb) this.props.kb.position.copy(mid);
    if (this.props.centro) this.props.centro.position.copy(mid);
    if (this.props.polea) {
      const pl = this.props.polea;
      let end = mid;
      if (pl.pie) { (this.xbot ? this.B.RightFoot : this.toe.R.heel).getWorldPosition(end = new THREE.Vector3()); }
      pl.handle.position.copy(end);
      const pos = pl.cable.geometry.attributes.position;
      pos.setXYZ(0, pl.anchor.x, pl.anchor.y, pl.anchor.z); pos.setXYZ(1, end.x, end.y, end.z); pos.needsUpdate = true;
    }
    if (this.props.asiento) {
      const s = this.props.asiento;
      this.root.getWorldPosition(s.obj.position); s.obj.position.y -= .14;
      if (!s._placed) { s._placed = true; }
    }
    if (this.props.rodillo) {
      const v = new THREE.Vector3(), w = new THREE.Vector3(); (this.xbot ? this.B.LeftFoot : this.ank.L).getWorldPosition(v); (this.xbot ? this.B.RightFoot : this.ank.R).getWorldPosition(w);
      this.props.rodillo.position.copy(v.add(w).multiplyScalar(.5));
      this.props.rodillo.position.z += this.ej.pat === 'curl_femoral' ? -.06 : .07;
    }
    if (this.props.plataforma) {
      const v = new THREE.Vector3(), w = new THREE.Vector3(); (this.xbot ? this.B.LeftFoot : this.ank.L).getWorldPosition(v); (this.xbot ? this.B.RightFoot : this.ank.R).getWorldPosition(w);
      const m = v.add(w).multiplyScalar(.5);
      this.props.plataforma.position.copy(m);
      this.props.plataforma.rotation.x = D(-40);
    }
  }

  setSpeed(s) { this.speed = s; }
  toggle() { this.playing = !this.playing; return this.playing; }
  autoRotate(on) { this.controls.autoRotate = on; }
  view(nombre) {
    const v = { frente: [0, 1.4, 4], lado: [4, 1.4, 0], diagonal: [2.6, 1.7, 3.2], arriba: [0.01, 4.5, 0.6] }[nombre];
    if (v) this.camera.position.set(...v);
  }
  dispose() {
    this._disposed = true;
    cancelAnimationFrame(this._raf);
    this._ro?.disconnect();
    this.controls.dispose();
    this.scene.traverse(o => { o.geometry?.dispose?.(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

// Zona muscular de un vértice del Xbot (pose T, mirando a +Z, izquierda = +X)
function zonaXbot(b, v, n) {
  const side = Math.sign(v.x) || 1, inner = n.x * side < -0.45, front = n.z > 0.3, back = n.z < -0.3;
  if (/Hand|Toe|Eye|HeadTop/.test(b)) return '';
  if (/Head/.test(b)) return '';
  if (/Neck/.test(b)) return back ? 'trapecio' : '';
  if (/Shoulder/.test(b)) return back || n.y > .5 ? 'trapecio' : Math.abs(v.x) > .1 ? 'hombro' : 'pecho';
  if (/ForeArm/.test(b)) return 'antebrazo';
  if (/Arm/.test(b)) return Math.abs(v.x) < .26 ? 'hombro' : n.z >= 0 ? 'biceps' : 'triceps';
  if (/UpLeg/.test(b)) return back ? (v.y > .84 ? 'gluteo' : 'isquios') : inner ? 'aductores' : 'cuadriceps';
  if (/Leg/.test(b)) return back || Math.abs(n.x) > .6 ? 'gemelo' : '';
  if (/Foot/.test(b)) return '';
  if (/Spine2/.test(b)) return front ? (v.y > 1.28 ? 'pecho' : 'abdomen') : back ? (Math.abs(v.x) < .06 && v.y > 1.36 ? 'trapecio' : 'dorsal') : v.y > 1.33 ? 'dorsal' : 'oblicuos';
  if (/Spine1/.test(b)) return front ? 'abdomen' : back ? (Math.abs(v.x) > .06 ? 'dorsal' : 'lumbar') : 'oblicuos';
  if (/Spine/.test(b)) return front ? 'abdomen' : back ? 'lumbar' : 'oblicuos';
  if (/Hips/.test(b)) return back && v.y < 1.02 ? 'gluteo' : front && v.y > .95 ? 'abdomen' : '';
  return '';
}
