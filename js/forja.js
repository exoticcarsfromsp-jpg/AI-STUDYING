// FORJA · Aplicación (inicio, rutina, progreso, dieta, tienda, perfil, coach IA)
let U = null,
  DBR = null,
  tm,
  T = "ini",
  D = 0,
  DD = (new Date().getDay() + 6) % 7;
const esc = (s) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const v = (id) => $("#" + id).value,
  today = () => dk(new Date());
const dk = (d) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");
function toast(t) {
  const o = $("#toast");
  if (o) o.remove();
  const e = document.createElement("div");
  e.id = "toast";
  e.textContent = t;
  document.body.append(e);
  setTimeout(() => e.remove(), 2600);
}
const CFG = window.FORJA_CFG || {};
let SB = null,
  SBU = null;
const hasAI = () => !!window.claude || !!SB;
async function getAI() {
  if (window.claude) {
    try {
      return await window.claude.use("sample");
    } catch (e) {}
  }
  return SB ? SBAI : null;
}
function imgB64(f) {
  return new Promise((ok, no) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, 1280 / Math.max(im.width, im.height)),
          c = document.createElement("canvas");
        c.width = Math.round(im.width * k);
        c.height = Math.round(im.height * k);
        c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/jpeg", 0.82).split(",")[1]);
      };
      im.onerror = no;
      im.src = r.result;
    };
    r.onerror = no;
    r.readAsDataURL(f);
  });
}
async function SBAI(prompt, o) {
  o = o || {};
  const content = [];
  if (o.images)
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: await imgB64(o.images),
      },
    });
  content.push({ type: "text", text: prompt });
  const msgs = [{ role: "user", content }],
    tools = (o.tools || []).map((x) => ({
      name: x.name,
      description: x.description,
      input_schema: x.inputSchema,
    }));
  let text = "";
  for (let i = 0; i < 6; i++) {
    const { data, error } = await SB.functions.invoke("ai", {
      body: {
        messages: msgs,
        tools: tools.length ? tools : undefined,
        max_tokens: 1200,
      },
    });
    if (error || !data || data.error) {
      const st = error && error.context && error.context.status;
      throw Object.assign(new Error("ai"), {
        code: st == 429 || (data && data.error == "limit") ? "limit" : "fail",
      });
    }
    const tx = (data.content || [])
      .filter((b) => b.type == "text")
      .map((b) => b.text)
      .join("");
    if (tx) {
      text = tx;
      if (o.onText) o.onText({ text });
    }
    if (data.stop_reason != "tool_use") break;
    msgs.push({ role: "assistant", content: data.content });
    const res = [];
    for (const b of data.content.filter((b) => b.type == "tool_use")) {
      const x = (o.tools || []).find((q) => q.name == b.name);
      let out;
      try {
        out = x ? await x.execute(b.input) : { error: "tool" };
      } catch (e) {
        out = { error: String(e) };
      }
      res.push({
        type: "tool_result",
        tool_use_id: b.id,
        content: JSON.stringify(out),
      });
    }
    msgs.push({ role: "user", content: res });
  }
  return { text };
}
SBAI.limits = async () => ({
  images: { maxCount: 1, mediaTypes: ["image/jpeg"] },
});
async function sbInit() {
  SB = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  const { data } = await SB.auth.getSession();
  if (data && data.session) {
    await sbLoad(data.session.user);
    return true;
  }
  return false;
}
async function sbLoad(u) {
  SBU = u;
  let row = null;
  try {
    const r = await SB.from("user_state")
      .select("data")
      .eq("user_id", u.id)
      .maybeSingle();
    row = r.data;
  } catch (e) {}
  U = {
    name: "",
    p: null,
    routine: [],
    logs: {},
    weights: [],
    ch: {},
    sm: "mercadona",
  };
  if (row && row.data) Object.assign(U, row.data);
  let imp = false;
  if (!U.p) {
    let g = null;
    try {
      g = (JSON.parse(localStorage.getItem("forja_root") || "{}").acc || {})
        .guest;
    } catch (e) {}
    if (g && g.u && g.u.p) {
      const nm = U.name;
      Object.assign(U, g.u);
      if (nm) U.name = nm;
      imp = true;
    }
  }
  if (!U.name)
    U.name =
      (u.user_metadata &&
        (u.user_metadata.name || u.user_metadata.full_name)) ||
      "";
  ROOT = { acc: { [u.id]: { e: u.email || "", u: U } }, last: u.id };
  if (U.p) D = nxt();
  U.p ? app() : onb();
  if (imp) sv();
}
const HERO = () => `<div class=hero><div class=blob></div><div class="blob b2"></div><div class=wrap><span class=kick>Entrena · Come · Progresa</span><h1>FORJA<span>.</span></h1><p class=sub>Tu rutina y tu dieta a medida en 2 minutos: ejercicios en 3D, platos con foto y gramos exactos, lista de la compra y rangos de Bronce a Simétrico.</p>
<div class=heroimg><svg viewBox="-9 -2 236 230">${BDEFS}<g>${figSVG({ pecho: 6, hombro: 8, biceps: 5, abdomen: 2, oblicuos: 2, cuadriceps: 4, aductores: 4, gemelo: 3, trapecio: 2 }, [], 0)}</g><g transform="translate(118 0)">${figSVG({ trapecio: 2, hombro: 8, dorsal: 8, triceps: 5, lumbar: 4, gluteo: 8, isquios: 4, gemelo: 3, aductores: 4 }, [], 1)}</g></svg>${rankLegend(-1)}</div>
<ul class=feat><li>🧍 Cada ejercicio en 3D</li><li>🍽 Dieta al gramo</li><li>🛒 Compra en tu súper</li><li>🤖 Coach IA</li></ul>`;
function sbAuth() {
  $("#cw").style.display = "none";
  A.innerHTML = `${HERO()}<div class="card auth"><button class=btn onclick="guest()">Empezar sin cuenta</button><p class=mut style="text-align:center;margin:8px 0 0;font-size:13px">Sin registrarte: tus datos se guardan en este navegador y el chat y el análisis de fotos funcionan igual.</p></div>
<div class="card auth"><div class=tabs2><button class="${mode == "reg" ? "on" : ""}" onclick="mode='reg';auth()">Crear cuenta</button><button class="${mode != "reg" ? "on" : ""}" onclick="mode='log';auth()">Iniciar sesión</button></div><p class=mut style="margin:8px 0 10px;font-size:13px">Con una cuenta tu plan te sigue a cualquier dispositivo y la sesión se queda abierta.</p>${mode == "reg" ? '<label>Nombre</label><input id=nm placeholder="Tu nombre" autocomplete=name>' : ""}<label>Email</label><input id=em type=email placeholder="tu@email.com" autocomplete=email><label>Contraseña (6+ caracteres)</label><input id=pw type=password placeholder="••••••" autocomplete="${mode == "reg" ? "new-password" : "current-password"}" onkeydown="if(event.key=='Enter')sbEmail()">
<div id=er style="color:#ff5d6c;min-height:20px"></div><button class=btn onclick="sbEmail()">${mode == "reg" ? "Crear cuenta" : "Entrar"}</button></div></div></div>`;
}
function guest() {
  try {
    const l = JSON.parse(localStorage.getItem("forja_root") || "null");
    if (l && l.acc) ROOT = Object.assign({ acc: {}, last: null }, l);
  } catch (e) {}
  if (!ROOT.acc.guest)
    ROOT.acc.guest = {
      e: "invitado",
      h: "",
      u: {
        name: "",
        p: null,
        routine: [],
        logs: {},
        weights: [],
        ch: {},
        sm: "mercadona",
      },
    };
  ROOT.last = "guest";
  U = ROOT.acc.guest.u;
  sv();
  if (U.p) D = nxt();
  U.p ? app() : onb();
}
function toReg() {
  ROOT.last = null;
  sv();
  U = null;
  mode = "reg";
  auth();
}
async function sbEmail() {
  const e = v("em").trim().toLowerCase(),
    p = v("pw"),
    er = $("#er");
  if (!e.includes("@") || p.length < 6)
    return (er.textContent = "Email válido y contraseña de 6+ caracteres");
  if (mode == "reg") {
    const { data, error } = await SB.auth.signUp({
      email: e,
      password: p,
      options: { data: { name: v("nm") } },
    });
    if (error) return (er.textContent = error.message);
    if (!data.session)
      return (er.textContent =
        "Te hemos enviado un email para confirmar tu cuenta. Confírmalo y vuelve a entrar.");
    return sbLoad(data.user);
  }
  const { data, error } = await SB.auth.signInWithPassword({
    email: e,
    password: p,
  });
  if (error) return (er.textContent = "Email o contraseña incorrectos");
  sbLoad(data.user);
}
async function logout() {
  if (SBU) {
    try {
      await SB.auth.signOut();
    } catch (e) {}
    SBU = null;
    ROOT = { acc: {}, last: null };
  } else {
    ROOT.last = null;
    sv();
  }
  U = null;
  auth();
}
let ROOT = { acc: {}, last: null },
  mode = "reg";
function sv() {
  clearTimeout(tm);
  tm = setTimeout(async () => {
    try {
      if (SBU) {
        const { error } = await SB.from("user_state").upsert({
          user_id: SBU.id,
          data: U,
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
      } else if (DBR) await DBR.set(ROOT);
      else localStorage.setItem("forja_root", JSON.stringify(ROOT));
    } catch (e) {
      toast("No se pudo guardar");
    }
  }, 400);
}
async function hs(s) {
  try {
    const b = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode("forja:" + s),
    );
    return [...new Uint8Array(b)]
      .map((x) => x.toString(16).padStart(2, "0"))
      .join("");
  } catch (e) {
    let x = 5381;
    for (const c of s) x = (x * 33) ^ c.charCodeAt(0);
    return "" + (x >>> 0);
  }
}
async function init() {
  if (!window.claude && CFG.SUPABASE_URL && window.supabase) {
    if (await sbInit()) return;
  }
  try {
    const c = window.claude,
      db = c && (await c.use("db")),
      us = c && (await c.use("user")),
      id = db && us && (await us.id());
    if (id) {
      DBR = db.collection("data/users/" + id).doc("state");
      const s = await DBR.get();
      if (s.exists) {
        const d = s.data();
        if (d.acc) ROOT = Object.assign(ROOT, d);
        else if (d.p) ROOT.legacy = d;
      }
    }
  } catch (e) {
    DBR = null;
  }
  if (!DBR) {
    try {
      const l = localStorage.getItem("forja_root");
      if (l) ROOT = Object.assign(ROOT, JSON.parse(l));
    } catch (e) {}
  }
  if (ROOT.last && ROOT.acc[ROOT.last]) {
    U = ROOT.acc[ROOT.last].u;
    if (U.p) D = nxt();
    U.p ? app() : onb();
  } else auth();
}
function auth() {
  if (SB) return sbAuth();
  $("#cw").style.display = "none";
  A.innerHTML = `${HERO()}<div class="card auth"><div class=tabs2><button class="${mode == "reg" ? "on" : ""}" onclick="mode='reg';auth()">Crear cuenta</button><button class="${mode != "reg" ? "on" : ""}" onclick="mode='log';auth()">Iniciar sesión</button></div>${mode == "reg" ? '<label>Nombre</label><input id=nm placeholder="Tu nombre">' : ""}<label>Email</label><input id=em type=email placeholder="tu@email.com"><label>Contraseña (6+ caracteres)</label><input id=pw type=password placeholder="••••••" onkeydown="if(event.key=='Enter')go()">
<div id=er style="color:#ff5d6c;min-height:20px"></div><button class=btn onclick="go()">${mode == "reg" ? "Crear cuenta" : "Entrar"}</button>
<p class=mut style="margin:8px 0 0;font-size:12px">${DBR ? "☁️ Tus cuentas se guardan en la nube de tu sesión de Claude." : "💾 Sin sesión de Claude: las cuentas se guardan solo en este navegador."}</p></div></div></div>`;
}
async function go() {
  const e = v("em").trim().toLowerCase(),
    p = v("pw"),
    er = $("#er");
  if (!e.includes("@") || p.length < 6)
    return (er.textContent = "Email válido y contraseña de 6+ caracteres");
  const k = (await hs("k:" + e)).slice(0, 20),
    h = await hs(e + p);
  if (mode == "reg") {
    if (ROOT.acc[k])
      return (er.textContent = "Ese email ya existe: inicia sesión");
    const u = {
      name: v("nm") || "Atleta",
      p: null,
      routine: [],
      logs: {},
      weights: [],
      ch: {},
      sm: "mercadona",
    };
    if (ROOT.legacy) {
      Object.assign(u, ROOT.legacy);
      delete ROOT.legacy;
    }
    ROOT.acc[k] = { e, h, u };
  } else if (!ROOT.acc[k] || ROOT.acc[k].h != h)
    return (er.textContent = "Email o contraseña incorrectos");
  ROOT.last = k;
  U = ROOT.acc[k].u;
  sv();
  if (U.p) D = nxt();
  U.p ? app() : onb();
}
let OW = null, OS = 0;
const OSTEPS = ["Sobre ti", "Objetivo", "Entreno", "Comida", "Tu plan"];
function onb() {
  const p = U.p || {};
  OW = { nm: U.name || "", sx: p.sx || "m", age: p.age || "", h: p.h || "", w: p.w || "", act: p.act || "sed", goal: p.goal || "musculo", focus: p.focus || "eq", where: p.where || "gym", days: p.days || 4, lv: p.lv || "b", mins: p.mins || 60, sty: p.sty || "auto", dt: p.dt || "omni", own: !!p.own, likes: (p.likes || []).join(", "), dis: (p.dis || []).join(", "), al: [...(p.al || [])] };
  OS = 0;
  onbR();
}
const opt = (k, v, ic, t, d) => `<button class="opt ${OW[k] == v ? "on" : ""}" onclick="onbS('${k}','${v}')"><span>${ic}</span><b>${t}</b>${d ? `<small>${d}</small>` : ""}</button>`;
function onbS(k, v) { onbRead(); OW[k] = isNaN(+v) || k == "nm" ? v : +v; onbR(); }
function onbRead() {
  document.querySelectorAll("[data-ow]").forEach((el) => (OW[el.dataset.ow] = el.type == "number" ? el.value : el.value));
  const al = document.querySelectorAll(".al");
  if (al.length) OW.al = [...al].filter((x) => x.checked).map((x) => x.value);
}
function onbGo(d) {
  onbRead();
  if (d > 0 && OS == 0) {
    const a = +OW.age, h = +OW.h, w = +OW.w;
    if (!a || !h || !w) return toast("Rellena edad, altura y peso");
    if (a < 10 || a > 100) return toast("Revisa tu edad");
    if (h < 120 || h > 230) return toast("Revisa tu altura (en cm)");
    if (w < 30 || w > 250) return toast("Revisa tu peso (en kg)");
  }
  OS = Math.max(0, Math.min(OSTEPS.length - 1, OS + d));
  onbR();
  scrollTo(0, 0);
}
function onbR() {
  $("#cw").style.display = "none";
  const W = OW, i = (k, t, ph, ty = "number", st = "") => `<div><label>${t}</label><input data-ow=${k} type=${ty} ${st} placeholder="${ph}" value="${esc(W[k])}"></div>`;
  let body = "";
  if (OS == 0)
    body = `<h2>Cuéntame sobre ti</h2><div class=card>${i("nm", "Nombre", "Tu nombre", "text")}<label>Sexo</label><div class=opts2>${opt("sx", "m", "♂", "Hombre")}${opt("sx", "f", "♀", "Mujer")}</div><div class=g3>${i("age", "Edad", "años")}${i("h", "Altura (cm)", "175")}${i("w", "Peso (kg)", "75", "number", "step=.1")}</div></div>
<div class=card><label>¿Cómo es tu día a día (sin contar el entreno)?</label><div class=opts>${opt("act", "sed", "🪑", "Sedentario", "Oficina, estudias, poco movimiento")}${opt("act", "lig", "🚶", "Ligero", "De pie o caminas bastante")}${opt("act", "act", "🏃", "Activo", "Trabajo físico moderado")}${opt("act", "muy", "🏗️", "Muy activo", "Trabajo físico duro")}</div></div>`;
  if (OS == 1)
    body = `<h2>¿Qué quieres conseguir?</h2><div class=opts>${opt("goal", "grasa", "🔥", "Perder grasa", "Definir manteniendo el músculo")}${opt("goal", "musculo", "💪", "Ganar músculo", "Volumen limpio")}${opt("goal", "fuerza", "🏋️", "Ganar fuerza", "Subir tus marcas")}${opt("goal", "mantener", "⚖️", "Mantenerme", "Salud y forma")}</div>
<h2>¿Qué zona quieres priorizar?</h2><div class=opts>${opt("focus", "eq", "🧍", "Equilibrado", "Todo el cuerpo por igual")}${opt("focus", "sup", "🦾", "Tren superior", "Pecho, espalda, brazos")}${opt("focus", "inf", "🍑", "Piernas y glúteo", "Tren inferior")}</div>`;
  if (OS == 2)
    body = `<h2>Tu entreno</h2><div class=card><label>¿Dónde entrenas?</label><div class=opts>${opt("where", "gym", "🏢", "Gimnasio")}${opt("where", "home", "🏠", "Casa")}${opt("where", "park", "🌳", "Parque")}</div>
<label>Días por semana</label><div class=chips>${[2, 3, 4, 5, 6].map((n) => `<button class="chip ${W.days == n ? "on" : ""}" onclick="onbS('days',${n})">${n} días</button>`).join("")}</div>
<label>Tiempo por sesión</label><div class=chips>${[30, 45, 60, 90].map((n) => `<button class="chip ${W.mins == n ? "on" : ""}" onclick="onbS('mins',${n})">${n} min</button>`).join("")}</div>
<label>Experiencia</label><div class=opts2>${opt("lv", "b", "🌱", "Principiante", "Menos de 1 año entrenando")}${opt("lv", "i", "🔥", "Intermedio / avanzado", "Más de 1 año")}</div>
<label>¿Ya tienes rutina?</label><div class=opts2>${opt("own", 0, "✨", "Genérame una")}${opt("own", 1, "✍️", "La añadiré yo")}</div>
<details style="margin-top:8px"><summary class=mut>Elegir estilo manualmente</summary><select data-ow=sty><option value=auto ${W.sty == "auto" ? "selected" : ""}>Recomendado por FORJA</option>${Object.entries(STYN).map(([k, t]) => `<option value=${k} ${W.sty == k ? "selected" : ""}>${t}</option>`).join("")}</select></details></div>`;
  if (OS == 3)
    body = `<h2>Tu alimentación</h2><div class=opts>${opt("dt", "omni", "🍗", "Omnívora")}${opt("dt", "med", "🫒", "Mediterránea")}${opt("dt", "veg", "🥚", "Vegetariana")}${opt("dt", "vgn", "🌱", "Vegana")}${opt("dt", "lc", "🥑", "Baja en hidratos")}</div>
<div class=card><label>¿Qué te gusta comer? (separado por comas)</label><input data-ow=likes placeholder="pollo, arroz, plátano…" value="${esc(W.likes)}"><label>¿Algo que no quieras ver en tu dieta?</label><input data-ow=dis placeholder="pescado, champiñón…" value="${esc(W.dis)}"><label>Alergias / intolerancias</label><div class=chk>${["gluten", "lactosa", "frutos secos", "huevo", "pescado", "marisco", "soja"].map((a) => `<label><input type=checkbox value="${a}" class=al ${W.al.includes(a) ? "checked" : ""}>${a}</label>`).join("")}</div></div>`;
  if (OS == 4) {
    const p = onbP(), t = tgtFor(p, p.w), r = recSty(p), sty = p.sty != "auto" ? p.sty : r.k, ml = Math.round((p.w * 35) / 50) * 50;
    body = `<h2>Tu plan personalizado</h2><div class="card plan"><small>Rutina recomendada</small><div class=big>${STYN[sty]}</div><p class=mut style="margin:4px 0 0">${p.sty != "auto" ? "Elegida por ti." : r.why}</p><div class=tags><span>📅 ${p.days} días/semana</span><span>⏱ ${p.mins} min</span><span>${{ gym: "🏢 Gimnasio", home: "🏠 Casa", park: "🌳 Parque" }[p.where]}</span><span>🎯 ${GN[p.goal]}</span><span>${SR[p.goal][0]} series × ${SR[p.goal][1]} reps</span></div></div>
<div class="card plan"><small>Tu nutrición diaria</small><div class=stats style="grid-template-columns:repeat(4,1fr);margin-top:8px"><div><b>${t.k}</b><small>kcal</small></div><div><b>${t.pr} g</b><small>proteína</small></div><div><b>${t.ca} g</b><small>hidratos</small></div><div><b>${t.fa} g</b><small>grasas</small></div></div><p class=mut style="margin:8px 0 0;font-size:13px">Metabolismo basal ${t.bmr} kcal · ${MS[p.goal].length} comidas al día · 💧 ${(ml / 1000).toFixed(1).replace(".", ",")} L de agua (+600 ml los días de entreno)</p></div>
<div class="card plan"><small>Además tendrás</small><ul class=feat><li>📸 Fotos de cada plato con gramos exactos y receta paso a paso en 3D</li><li>🛒 Lista de la compra con enlaces a Mercadona, Lidl, Carrefour, Dia, Condis…</li><li>🏅 Rangos de Bronce a Simétrico en tu mapa muscular</li><li>🧍 Cada ejercicio en 3D, con vídeo y técnica</li></ul></div>`;
  }
  A.innerHTML = `<div class="wrap onb"><div class=onbh><span class=logo>FORJA<span>.</span></span><small>Paso ${OS + 1} de ${OSTEPS.length} · ${OSTEPS[OS]}</small></div><div class=bar style="margin-bottom:14px"><i style="width:${((OS + 1) / OSTEPS.length) * 100}%"></i></div>
${OS == 0 ? `<h1 style="font-size:38px;margin:10px 0 4px">Hola${OW.nm ? ", " + esc(OW.nm) : ""} 👋</h1><p class=sub>Responde 5 pasos y te monto rutina, dieta y suplementación a tu medida.</p>` : ""}${body}
<div class=row style="margin-top:16px;gap:10px">${OS ? `<button class="btn ghost" style="width:auto" onclick="onbGo(-1)">← Atrás</button>` : ""}${OS < OSTEPS.length - 1 ? `<button class=btn onclick="onbGo(1)">Siguiente →</button>` : `<button class=btn onclick="saveP()">Crear mi plan 🚀</button>`}</div></div>`;
}
function onbP() {
  const W = OW;
  return { sty: W.sty, dt: W.dt, sx: W.sx, age: +W.age, h: +W.h, w: +W.w, act: W.act, goal: W.goal, focus: W.focus, where: W.where, days: +W.days, mins: +W.mins, lv: W.lv, own: !!+W.own,
    likes: String(W.likes).toLowerCase().split(",").map((s) => s.trim()).filter(Boolean), dis: String(W.dis).toLowerCase().split(",").map((s) => s.trim()).filter(Boolean), al: W.al };
}
function saveP() {
  onbRead();
  const p = onbP();
  if (!p.w || !p.h || !p.age) { OS = 0; onbR(); return toast("Rellena edad, altura y peso"); }
  U.name = OW.nm || U.name || "Atleta";
  U.ch = {};
  U.p = p;
  if (!U.weights.length) U.weights.push({ d: today(), w: p.w });
  U.routine = gen(U.p);
  D = 0;
  T = "ini";
  sv();
  app();
  toast("¡Plan creado! 💪");
}
const SUB = {
  pecho: [
    [/aperturas|cruces|peck/i, "apert"],
    [/fondos/i, "fondos"],
    [/pullover/i, "pull"],
    [/press|flexion|floor|svend|landmine/i, "press"],
  ],
  espalda: [
    [/dominad|jalón|australian|muscle|lever/i, "vert"],
    [/pullover/i, "pull"],
    [/peso muerto|hiperextens|buenos días/i, "bis"],
    [/face pull/i, "rear"],
    [/remo|superman|meadows|yates|pendlay/i, "horiz"],
  ],
  pierna: [
    [/curl femoral|nordic|isquios/i, "isq"],
    [/peso muerto|rumano|buenos/i, "bis"],
    [/extensión de cuádriceps/i, "quad"],
    [/gemelo|talón/i, "calf"],
    [/abductor|abducción/i, "abd"],
    [/zancada|step|búlgara|skater/i, "uni"],
    [/sentadilla|prensa|hack|goblet|pistol|shrimp|sissy/i, "squat"],
    [/salto|sprint|rana|escaleras/i, "plio"],
  ],
  hombro: [
    [/lateral/i, "lat"],
    [/frontal/i, "front"],
    [
      /pájaros|face pull|posterior|elevación en y|elevaciones en y|círculos/i,
      "rear",
    ],
    [/encogimientos|remo al mentón/i, "trap"],
    [
      /press|pike|handstand|arnold|plancha|hold|swing|planche|escápulas|fondos/i,
      "press",
    ],
  ],
  brazo: [
    [/curl|dominadas supinas|dominadas agarre|dominadas australianas/i, "bic"],
    [
      /tríceps|francés|fondos|press cerrado|diamante|patada|extensión|cerradas|flexiones/i,
      "tri",
    ],
  ],
  core: [
    [/plancha|hollow|l-sit/i, "iso"],
    [
      /elevación de piernas|rodillas|toes|dragon|crunch inverso|v-ups|tijeras/i,
      "legs",
    ],
    [/russian|giro|leñador|oblicuos|windshield|pallof|lateral/i, "rot"],
    [/crunch|abdominal|rueda|bicicleta/i, "crunch"],
    [/mountain|dead bug|bird|oruga|escalador/i, "dyn"],
  ],
  glúteo: [
    [/hip thrust|puente/i, "thrust"],
    [/patada|kickback|hidrante|clamshell/i, "kick"],
    [/abducción|abductor/i, "abd"],
    [/peso muerto|rumano|good morning|hiperextens/i, "bis"],
    [/sentadilla|zancada|step|búlgara|salto/i, "squat"],
  ],
};
const PRI = {
  pecho: ["press", "apert", "fondos", "pull"],
  espalda: ["vert", "horiz", "rear", "bis"],
  pierna: ["squat", "bis", "uni", "isq", "quad", "calf"],
  hombro: ["press", "lat", "rear", "front", "trap"],
  brazo: ["bic", "tri"],
  core: ["iso", "crunch", "rot", "legs", "dyn"],
  glúteo: ["thrust", "bis", "kick", "squat", "abd"],
};
function pickEx(g, where, n, i, lv) {
  const L = [...new Set(G[g][where])].filter((x) =>
      lv == "b" ? dif(x) <= 2 : dif(x) <= 4,
    ),
    sub = (x) => ((SUB[g] || []).find((s) => s[0].test(x)) || [0, "o"])[1],
    by = {};
  L.forEach((x) => (by[sub(x)] = by[sub(x)] || []).push(x));
  let keys = [
    ...(PRI[g] || []).filter((k) => by[k]),
    ...Object.keys(by).filter((k) => !(PRI[g] || []).includes(k)),
  ];
  if (!keys.length) return [];
  if (n < keys.length) {
    const r = Math.floor(i / 2) % (keys.length - 1 || 1),
      rest = keys.slice(1);
    keys = [keys[0], ...rest.slice(r), ...rest.slice(0, r)];
  }
  const out = [];
  for (let rd = 0; rd < 5 && out.length < n; rd++)
    for (const k of keys) {
      if (out.length >= n) break;
      const x = by[k][(i + rd) % by[k].length];
      if (!out.includes(x)) out.push(x);
    }
  return out;
}
const STYN = { fb: "Full body", ul: "Torso / Pierna", ppl: "Push / Pull / Legs", bro: "Un músculo por día", glu: "Enfoque glúteo y pierna", def: "Definición con cardio", arn: "Estilo Arnold", sup: "Énfasis tren superior", inf: "Énfasis tren inferior", cal: "Calistenia (parque)", hiit: "Cardio y HIIT" };
// Elige el mejor estilo de rutina para la persona y explica por qué
function recSty(p) {
  const d = p.days, b = p.lv == "b";
  if (p.where == "park") return { k: "cal", why: "Entrenas en parque: calistenia con progresiones de dominadas, fondos y piernas." };
  if (p.focus == "inf") return { k: d >= 5 ? "glu" : "inf", why: "Quieres priorizar piernas y glúteo: más volumen de tren inferior manteniendo el torso." };
  if (p.focus == "sup") return { k: "sup", why: "Quieres priorizar el tren superior: pecho, espalda y brazos más veces por semana." };
  if (p.goal == "grasa") return d >= 5 ? { k: "def", why: "Con 5–6 días y objetivo de perder grasa combinamos fuerza (para no perder músculo) y cardio." } : { k: d <= 3 ? "fb" : "ul", why: `Con ${d} días, ${d <= 3 ? "full body" : "torso/pierna"} trabaja cada músculo 2 veces por semana y quema más calorías por sesión.` };
  if (p.goal == "fuerza") return { k: d <= 3 ? "fb" : "ul", why: "Para ganar fuerza conviene repetir los básicos (sentadilla, press, peso muerto) varias veces por semana." };
  if (d <= 3) return { k: "fb", why: `${b ? "Eres principiante y" : "Con"} ${d} días: full body es lo más eficiente, cada músculo 2–3 veces por semana.` };
  if (d == 4) return { k: "ul", why: "Con 4 días, torso/pierna da la frecuencia ideal (2 veces por semana) con sesiones asumibles." };
  return { k: b ? "ul" : "ppl", why: b ? "Aunque tienes 5–6 días, siendo principiante torso/pierna te deja recuperar mejor." : "Con 5–6 días, Push/Pull/Legs reparte mucho volumen y deja recuperar cada músculo." };
}
function gen(p) {
  const [s0, r] = SR[p.goal],
    s = p.lv == "b" ? Math.max(2, s0 - 1) : s0,
    lv = p.lv == "b" || p.age < 16 ? "b" : "i",
    sty = p.sty && p.sty != "auto" ? p.sty : recSty(p).k,
    L = STY[sty] || SP[p.days],
    adj = p.mins ? (p.mins <= 30 ? -1 : p.mins >= 90 ? 1 : 0) : 0;
  return Array.from({ length: p.days }, (_, i) => L[i % L.length]).map((gs, i) => ({
    t: `Día ${i + 1} · ${gs.map((g) => g[0].toUpperCase() + g.slice(1)).join(" + ")}`,
    ex: p.own
      ? []
      : gs.flatMap((g) => {
          const n = Math.max(1, (gs.length == 1 ? 5 : gs.length == 2 ? 3 : 2) + adj),
            w = sty == "cal" ? "park" : p.where;
          return pickEx(g, w, n, i, lv).map((x) => (g == "cardio" ? { n: x, g, s: 1, r: p.mins && p.mins <= 30 ? "10-15 min" : "15-20 min" } : { n: x, g, s, r }));
        }),
  }));
}
const bw = () => (U.weights.length ? U.weights[U.weights.length - 1].w : U.p.w);
const DIFT = {
  0: [10, 20, 30, 45, 60, 90, 120, 180],
  1: [8, 15, 20, 30, 40, 50, 65, 80],
  2: [4, 8, 12, 16, 22, 30, 40, 50],
  3: [2, 4, 6, 9, 12, 16, 21, 28],
  4: [1, 2, 3, 5, 7, 9, 12, 16],
  5: [1, 2, 3, 4, 5, 7, 9, 12],
};
// Umbrales de 1RM estimado / peso corporal (× factor del ejercicio) para los 9 rangos
const TH = [0.4, 0.6, 0.8, 1.0, 1.25, 1.5, 1.8, 2.2];
function dif(n) {
  n = n.toLowerCase();
  if (/plancha|hollow|isométric|l-sit/.test(n) && !/hold de pino/.test(n))
    return 0;
  if (
    /muscle-up|front lever|dragon flag|shrimp|handstand push|pistol/.test(n) &&
    !/asistid|progresión|tuck/.test(n)
  )
    return 5;
  if (
    /lastrad|toes to bar|windshield|explosiv|arqueras|pseudo planche|tuck front|planche lean|handstand|hold de pino|dominadas en l|nordic|pistol|dragon|anillas|pike push-up elevado|en pica elevado|muscle|lever|shrimp/.test(
      n,
    )
  )
    return 4;
  if (
    /dominad|fondos|pike|con pausa|diamante|declinadas|colgado|con salto|burpee|australian|invertido|palmada|hindú|espartanas|a una pierna|rodillas al pecho/.test(
      n,
    )
  )
    return 3;
  if (
    /crunch|superman|hidrante|clamshell|mountain|dead bug|bird|bicicleta abdominal|tijeras|oruga|caminata|jumping|inclinadas|con apoyo|con banda|con toalla|rodillas altas|skipping|comba/.test(
      n,
    )
  )
    return 1;
  return 2;
}
const MFT = [
  [/prensa/, 1.8],
  [/hack/, 1.3],
  [/rumano/, 1.2],
  [/peso muerto/, 1.5],
  [/hip thrust|puente de glúteo con barra/, 1.4],
  [/sentadilla frontal/, 1],
  [/sentadilla/, 1.25],
  [/zancada|búlgara|step|pistol/, 0.5],
  [/press banca/, 1],
  [/press inclinado|press en máquina|press convergente/, 0.85],
  [/press militar|press con barra sentado|press z/, 0.65],
  [
    /arnold|press con mancuernas|press unilateral|press con kettlebell|press landmine/,
    0.4,
  ],
  [/remo en t|remo con barra|pendlay|yates|meadows/, 0.9],
  [/remo/, 0.7],
  [/jalón/, 0.8],
  [/curl con barra|curl barra z|predicador|curl 21/, 0.45],
  [/curl.*polea|curl con cuerda/, 0.35],
  [/curl/, 0.2],
  [/francés|tríceps en polea|tríceps con cuerda|press cerrado/, 0.5],
  [/patada de tríceps|extensión sobre/, 0.2],
  [/elevaciones laterales|pájaros|elevaciones posteriores/, 0.12],
  [/elevaciones frontales|elevación en y/, 0.15],
  [/face pull|remo al mentón/, 0.35],
  [/encogimientos/, 0.7],
  [/aperturas|cruces|peck/, 0.25],
  [/extensión de cuádriceps/, 0.8],
  [/curl femoral/, 0.6],
  [/abductor|abducción/, 1],
  [/gemelo/, 1.1],
  [/swing/, 0.4],
  [/goblet/, 0.5],
  [/pullover/, 0.3],
  [
    /leñador|crunch en polea|abdominal en polea|oblicuos|crunch con carga|plancha con/,
    0.35,
  ],
  [/kickback|patada/, 0.3],
];
function mf(n) {
  n = n.toLowerCase();
  let b = (MFT.find((x) => x[0].test(n)) || [
    0,
    { bar: 0.8, cab: 0.6, db: 0.35, bw: 0.6 }[WT(n)] || 0.6,
  ])[1];
  if (b > 0.3 && /mancuerna|kettlebell|garrafa|goblet/.test(n)) b *= 0.45;
  return b;
}
function rk(w, r, n) {
  n = n || "";
  const bwv = bw(),
    isbw = n && WT(n) == "bw";
  let x,
    th,
    m = false;
  if (w > 0 && !isbw) {
    x = (w * (1 + r / 30)) / bwv;
    th = TH.map((q) => q * mf(n));
    m = true;
  } else {
    x = isbw && w > 0 ? r * (1 + w / bwv) : r;
    th = DIFT[n ? dif(n) : 2];
  }
  const i = th.filter((q) => x >= q).length,
    lo = i ? th[i - 1] : 0,
    hi = th[i] || th[th.length - 1] * 1.3;
  return {
    i,
    pct: i >= th.length ? 100 : Math.min(100, Math.round(((x - lo) / (hi - lo)) * 100)),
    sc: x,
    th,
    m,
  };
}
const bdg = (i) => `<span class=bdg style="--c:${C[i]}">${badge(i, 18)}${R[i]}</span>`;
const best = (n) =>
  (U.logs[n] || []).reduce((b, l) => {
    const k = rk(l.w, l.r, n);
    return !b || k.sc > b.sc ? k : b;
  }, null);
const WT = (n) => {
  n = n.toLowerCase();
  if (
    /polea|máquina|prensa|jalón|peck|cuerda|hack|extensión de cuádriceps|curl femoral|abductores|abducción|kickback|trineo/.test(
      n,
    )
  )
    return "cab";
  if (
    /barra|banca|peso muerto|press militar|hip thrust|landmine|pendlay|good morning|smith/.test(
      n,
    )
  )
    return "bar";
  if (/mancuerna|kettlebell|garrafa|goblet|mochila|disco|botellas/.test(n))
    return "db";
  if (
    /flexion|dominad|fondos|plancha|crunch|elevación de piernas|pike|handstand|zancada|sentadilla|puente|burpee|comba|mountain|superman|l-sit|nordic|salto|step|remo invertido|australian|muscle|lever|carrera|sprint|cinta|bicic|elíptica|caminata|trote/.test(
      n,
    )
  )
    return "bw";
  return "db";
};
const wtt = (e) => (e.g == "cardio" ? "bw" : WT(e.n));
const eg = (e) => (/gemelo|talón/i.test(e.n) ? "gemelo" : e.g);
function body(m, act, big) {
  if (big) {
    const cs = [["Torso", ["pecho", "dorsal", "abdomen", "oblicuos", "trapecio", "lumbar"]], ["Brazos", ["hombro", "biceps", "triceps", "antebrazo"]], ["Piernas", ["cuadriceps", "isquios", "gluteo", "aductores"]], ["Gemelos", ["gemelo"]]],
      mx = (zs) => { const v = zs.map((z) => m[z]).filter((x) => x >= 0); return v.length ? Math.max(...v) : -1; };
    return `<div class="fig${big == 1 ? " big" : ""}">${big == 1 ? rankLegend(rankGlobal(m)) : ""}${bodyPair(m, act)}${big == 1 ? `<div class=cos>${cs.map(([n, zs]) => { const i = mx(zs); return `<div>${badge(i, 30)}<span>${n}<br><small style="color:${i >= 0 ? RL[i] : "#8a949e"}">${i >= 0 ? R[i] : "sin datos"}</small></span></div>`; }).join("")}</div>` : ""}</div>`;
  }
  act = [].concat(act || []);
  const back = act.length && act.every((z) => ["dorsal", "lumbar", "gluteo", "isquios", "trapecio", "triceps"].includes(z));
  return `<div class=fig><svg class=bmap viewBox="-9 -2 118 230">${BDEFS}${figSVG(m, act, back)}</svg></div>`;
}
const rankGlobal = (m) => { const v = Object.values(m).filter((x) => x >= 0); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : -1; };
function zm() {
  const m = {};
  for (const n in U.logs) {
    const g = GI[n] || (U.routine.flatMap((d) => d.ex).find((e) => e.n == n) || {}).g, b = best(n);
    if (!b || !g || g == "cardio" || g == "personal") continue;
    for (const z of zonesFor(n, g).pri) m[z] = Math.max(m[z] ?? -1, b.i);
  }
  return m;
}
const zonesOf = (e) => zonesFor(e.n, eg(e));
function zc(j, e, i) {
  const zs = zonesOf(e).pri;
  document.querySelectorAll("#fg" + j + " [data-z]").forEach((el) => { if (zs.includes(el.dataset.z)) el.style.fill = C[i]; });
}
const pvh = (w, r, need, n) => {
  if (!r)
    return "<small>Desliza las repeticiones para ver tu rango en directo.</small>";
  if (need && !w) return "<small>Elige el peso para ver tu rango.</small>";
  const k = rk(w, r, n),
    nx = k.m
      ? Math.ceil(k.th[k.i] * bw()) + " kg de 1RM est."
      : k.th[k.i] + (n && dif(n) == 0 ? " s" : " reps");
  return `<div class=lad>${R.map((n, i) => `<i class="${i < k.i ? "d" : i == k.i ? "c" : ""}" style="--c:${C[i]}"></i>`).join("")}</div><div class=row>${bdg(k.i)}<small>${k.m ? "1RM est. " + Math.round(k.sc * bw()) + " kg · " : ""}${k.i < R.length - 1 ? "siguiente " + R[k.i + 1] + ": " + nx : "¡Rango máximo!"}</small></div><div class=bar><i style="width:${k.pct}%"></i></div>`;
};
const spark = (n) => {
  const a = (U.logs[n] || []).slice(-8).map((l) => rk(l.w, l.r, n).sc);
  if (a.length < 2) return "";
  const mn = Math.min(...a),
    mx = Math.max(...a) || 1,
    p = a
      .map(
        (y, i) =>
          `${i * (100 / (a.length - 1))},${22 - ((y - mn) / (mx - mn || 1)) * 20}`,
      )
      .join(" ");
  return `<svg viewBox="0 0 100 24" width=90 height=22><polyline points="${p}" fill=none stroke="var(--acc)" stroke-width=2 stroke-linecap=round /></svg>`;
};
const stp = (j, f, d, ph) =>
  `<div class=st><button onclick="st(${j},'${f}',-${d})">−</button><input id=${f}${j} type=number inputmode=decimal step=${d} placeholder="${ph}" oninput="pv(${j})"><button onclick="st(${j},'${f}',${d})">+</button></div>`;
function st(j, f, d) {
  const el = $("#" + f + j);
  el.value = Math.round(Math.max(0, (+el.value || 0) + d) * 10) / 10;
  pv(j);
}
function pv(j) {
  const e = U.routine[D].ex[j],
    w = +$("#w" + j).value || 0,
    r = +$("#r" + j).value || 0,
    need = wtt(e) != "bw";
  $("#pv" + j).innerHTML = pvh(w, r, need, e.n);
  if (r && (w || !need)) zc(j, e, rk(w, r, e.n).i);
}
function rg(j, el) {
  el.style.setProperty("--p", (el.value / el.max) * 100 + "%");
  $("#rv" + j).textContent = el.value;
  pv(j);
}
function boom() {
  const c = ["#B20606", "#FFA7A3", "#E6E595", "#808251"];
  for (let i = 0; i < 34; i++) {
    const d = document.createElement("div");
    d.className = "cf";
    d.style.cssText = `left:${Math.random() * 100}vw;background:${c[i % 4]};animation-delay:${Math.random() * 0.4}s`;
    document.body.append(d);
    setTimeout(() => d.remove(), 2400);
  }
}
const PC = {
    25: ["#e53935", 74],
    20: ["#1e6fe0", 66],
    15: ["#f2c200", 56],
    10: ["#2fa84f", 46],
    5: ["#f1f1f1", 36],
    2.5: ["#222", 28],
    1.25: ["#aab", 22],
  },
  DBW = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40],
  PLS = {};
function pinit(j, w0) {
  let rem = Math.max(0, ((+w0 || 20) - 20) / 2);
  const P = [];
  for (const p of [25, 20, 15, 10, 5, 2.5, 1.25])
    while (rem >= p - 1e-9 && P.length < 8) {
      P.push(p);
      rem -= p;
    }
  PLS[j] = P;
}
const ptot = (j) => 20 + 2 * PLS[j].reduce((a, b) => a + b, 0);
function plh(j) {
  const P = PLS[j];
  let s = "",
    x = 190,
    x2 = 110;
  P.forEach((p) => {
    const [c, h] = PC[p];
    s += `<rect class=pp x=${x} y=${50 - h / 2} width=10 height=${h} rx=2 fill="${c}" stroke="#0007"/><rect class=pp x=${x2 - 10} y=${50 - h / 2} width=10 height=${h} rx=2 fill="${c}" stroke="#0007"/>`;
    x += 11;
    x2 -= 11;
  });
  return `<svg viewBox="0 0 300 100"><rect x=10 y=47 width=280 height=6 rx=3 fill="#9aa4ad"/><rect x=100 y=44 width=100 height=12 rx=2 fill="#7d8791"/>${s}</svg><div class=row><b class=big>${ptot(j)} kg</b><span class=pcs>${[25, 20, 15, 10, 5, 2.5, 1.25].map((p) => `<button class=pcb style="background:${PC[p][0]};color:${p == 5 || p == 15 ? "#000" : "#fff"}" onclick="pa(${j},${p})">${p}</button>`).join("")}<button class=pcb style="background:var(--bg);color:var(--fg)" onclick="pu(${j})">↩</button></span></div><small>Toca los discos para cargarlos a cada lado (barra de 20 kg)</small>`;
}
function plu(j) {
  PLS[j].sort((a, b) => b - a);
  $("#pl" + j).innerHTML = plh(j);
  $("#w" + j).value = ptot(j);
  pv(j);
}
function pa(j, p) {
  if (PLS[j].length < 8) {
    PLS[j].push(p);
    plu(j);
  } else toast("Máximo 8 discos por lado");
}
function pu(j) {
  PLS[j].pop();
  plu(j);
}
function wadj(j, d) {
  const el = $("#w" + j);
  el.value = Math.max(2.5, (+el.value || 0) + d);
  $("#wl" + j).textContent = el.value + " kg";
  pv(j);
}
function wset(j, x, b) {
  $("#w" + j).value = x;
  $("#wl" + j).textContent = x + " kg";
  b.parentNode
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.toggle("on", c === b));
  pv(j);
}
function sd(ev, j) {
  if (ev.type == "pointermove" && !(ev.buttons & 1)) return;
  const el = ev.currentTarget,
    r = el.getBoundingClientRect(),
    k = Math.max(
      0,
      Math.min(19, Math.floor(((ev.clientY - r.top) / r.height) * 20)),
    );
  if (ev.type == "pointerdown")
    try {
      el.setPointerCapture(ev.pointerId);
    } catch (e) {}
  [...el.children].forEach(
    (c, i) => (c.className = i < k ? "up" : i == k ? "pin" : ""),
  );
  $("#w" + j).value = (k + 1) * 5;
  $("#wl" + j).textContent = (k + 1) * 5 + " kg";
  pv(j);
}
function wid(j, e, w0) {
  const ty = wtt(e);
  if (ty == "bar") {
    pinit(j, w0);
    return `<input type=hidden id=w${j} value="${ptot(j)}"><div id=pl${j}>${plh(j)}</div>`;
  }
  if (ty == "cab") {
    const k = Math.min(19, Math.max(0, Math.round((w0 || 10) / 5) - 1)),
      bt = (d, l) =>
        `<button class=pcb style="width:auto;padding:0 10px;background:var(--bg);color:var(--fg)" onclick="wadj(${j},${d})">${l}</button>`;
    return `<input type=hidden id=w${j} value="${(k + 1) * 5}"><div class=row><b class=big id=wl${j}>${(k + 1) * 5} kg</b><small>arrastra el pasador por la pila</small></div><div class=row style="justify-content:center;gap:14px">${bt(-2.5, "−2,5")}<div class=stk id=sk${j} onpointerdown="sd(event,${j})" onpointermove="sd(event,${j})">${Array.from({ length: 20 }, (_, i) => `<i class="${i < k ? "up" : i == k ? "pin" : ""}"></i>`).join("")}</div>${bt(2.5, "+2,5")}</div>`;
  }
  if (ty == "db")
    return `<input type=hidden id=w${j} value="${w0 || ""}"><div class=row><b class=big id=wl${j}>${w0 ? w0 + " kg" : "— kg"}</b><small>peso por mancuerna o carga</small></div><div class=chips>${DBW.map((x) => `<button class="chip ${x == w0 ? "on" : ""}" onclick="wset(${j},${x},this)">${x}</button>`).join("")}</div>`;
  return `<label>Lastre extra (vacío = peso corporal)</label>${stp(j, "w", 2.5, "0")}`;
}
function rut() {
  const rt = U.routine,
    d = rt[D] || rt[0],
    zmap = zm();
  return (
    `<h2>Tu semana</h2><div class=chips>${rt.map((x, i) => `<button class="chip ${i == D ? "on" : ""}" onclick="D=${i};app()">${x.t}</button>`).join("")}</div>` +
    d.ex
      .map((e, j) => {
        const L = (U.logs[e.n] || []).slice(-1)[0],
          iso = pat(e)[1] == "Isométrico",
          mx = iso ? 90 : dif(e.n) <= 1 ? 50 : 30,
          r0 = L ? L.r : iso ? 30 : 10,
          w0 = L ? L.w : 0;
        return `<div class=card style="--i:${j}"><div class=row><div><b class=exn onclick="info(${j})">${esc(e.n)} ⓘ</b><br><small>${e.g} · objetivo ${e.s}×${e.r}</small></div><span class=row style="gap:4px"><button class=vid style="background:none;cursor:pointer" onclick="info(${j})">ⓘ Explicación</button><a class=vid target=_blank rel=noopener href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.n + " técnica correcta")}">▶ Vídeo</a><button class=lnk onclick="rm(${j})">✕</button></span></div>
<div style="margin-top:10px">${wid(j, e, w0)}</div>
<div class=row style="margin-top:12px"><label>${iso ? "Segundos · desliza" : "Repeticiones · desliza"}</label><b class=big id=rv${j}>${r0}</b></div><input id=r${j} class=rg type=range min=0 max=${mx} value=${r0} style="--p:${(r0 / mx) * 100}%" oninput="rg(${j},this)">
<div class=g2 style="align-items:end;margin-top:6px"><div><label>Series</label><input id=s${j} type=number value=${parseInt(e.s) || 3}></div><button class=btn style="margin-bottom:10px" onclick="logEx(${j})">Guardar ✓</button></div>
<div class=row style="gap:12px"><div id=fg${j} style="width:96px;flex:none">${body(zmap, zonesOf(e).pri)}</div><div id=pv${j} style="flex:1">${L ? pvh(L.w, L.r, wtt(e) != "bw", e.n) : pvh(0, 0)}</div></div>${L ? `<div class=row style="margin-top:6px"><small>Último: ${L.w ? L.w + " kg" : "peso corporal"} × ${L.r} · ${L.d}</small>${spark(e.n)}</div>` : ""}</div>`;
      })
      .join("") +
    `<div class=card><label>Catálogo (${new Set(Object.values(G).flatMap((x) => [...x.gym, ...x.home, ...x.park])).size} ejercicios) · añadir al día</label><div class=g2><select id=cg onchange="$('#ce').innerHTML=cl(this.value)">${Object.keys(
      G,
    )
      .map((g) => `<option>${g}</option>`)
      .join(
        "",
      )}</select><select id=ce>${cl("pecho")}</select></div><button class=btn onclick="addCat()">Añadir</button><label style="margin-top:12px;display:block">O escribe uno propio</label><div class=row><input id=nx placeholder="Ej: Press banca" style="margin:0"><button class=btn style="width:auto" onclick="addEx()">+</button></div></div>
<button class=lnk onclick="onb()">⚙️ Rehacer mi plan</button>`
  );
}
const cl = (g) =>
  [...new Set([...G[g].gym, ...G[g].park, ...G[g].home])]
    .map((x) => `<option>${x}</option>`)
    .join("");
function addCat() {
  U.routine[D].ex.push({ n: v("ce"), g: v("cg"), s: 3, r: "8-12" });
  sv();
  app();
}
function rm(j) {
  U.routine[D].ex.splice(j, 1);
  sv();
  app();
}
function addEx() {
  const n = v("nx").trim();
  if (!n) return;
  U.routine[D].ex.push({ n, g: "personal", s: 3, r: "8-12" });
  sv();
  app();
}
function logEx(j) {
  const e = U.routine[D].ex[j],
    w = +v("w" + j) || 0,
    r = +v("r" + j),
    s = +v("s" + j) || 1;
  if (!r) return toast("Desliza las repeticiones");
  if (wtt(e) != "bw" && !w) return toast("Elige el peso primero");
  const pb = best(e.n);
  (U.logs[e.n] = U.logs[e.n] || []).push({ d: today(), w, r, s });
  sv();
  const k = rk(w, r, e.n);
  app();
  rest(rsec(e));
  if (pb && k.i > pb.i) {
    boom();
    toast(`🎉 ¡Subes a ${R[k.i]} en ${e.n}!`);
  } else if (!pb || k.sc > pb.sc) toast(`🏆 Nuevo récord · rango ${R[k.i]}`);
  else toast(`Guardado · ${R[k.i]}`);
}
function prog() {
  const W = U.weights,
    f = W[0].w,
    l = W[W.length - 1].w,
    df = (l - f).toFixed(1),
    nx = new Date(new Date(W[W.length - 1].d).getTime() + 7 * 864e5)
      .toISOString()
      .slice(0, 10);
  let ch = "";
  if (W.length > 1) {
    const mn = Math.min(...W.map((x) => x.w)) - 1,
      mx = Math.max(...W.map((x) => x.w)) + 1,
      pt = W.map(
        (x, i) =>
          `${20 + i * (280 / (W.length - 1))},${110 - ((x.w - mn) / (mx - mn)) * 100}`,
      );
    ch = `<svg viewBox="0 0 320 120"><polyline points="${pt.join(" ")}" fill=none stroke="var(--acc)" stroke-width=3 stroke-linecap=round stroke-linejoin=round pathLength=1 stroke-dasharray=1 stroke-dashoffset=0><animate attributeName=stroke-dashoffset from=1 to=0 dur=1.2s /></polyline>${pt.map((p) => `<circle cx=${p.split(",")[0]} cy=${p.split(",")[1]} r=4 fill="var(--acc)"/>`).join("")}</svg>`;
  }
  const ex = Object.keys(U.logs)
    .map((n) => [n, best(n)])
    .filter((x) => x[1]);
  return `<h2>Pesaje semanal</h2><div class=card><div class=stats style="grid-template-columns:repeat(3,1fr)"><div><b>${l} kg</b><small>actual</small></div><div><b style="color:${df <= 0 ? "var(--acc)" : "inherit"}">${df > 0 ? "+" : ""}${df}</b><small>desde el inicio</small></div><div><b>${nx.slice(5)}</b><small>próximo pesaje</small></div></div>${ch}
<label style="margin-top:10px;display:block">Pésate en ayunas, una vez por semana</label><div class=row><input id=nw type=number step=.1 placeholder="kg" style="margin:0"><button class=btn style="width:auto" onclick="addW()">Guardar</button></div></div>
<h2>Tu mapa muscular</h2><div class=card style="text-align:center">${body(zm(), null, 1)}<small>Cada músculo toma el color de tu mejor rango en él (gris oscuro = sin registros).</small></div><h2>Tus rangos</h2>${ex.length ? ex.map(([n, k], i) => `<div class="card rk" style="--i:${i}">${badge(k.i, 40)}<div style="flex:1"><div class=row><b>${esc(n)}</b>${bdg(k.i)}</div><div class=bar><i style="width:${k.pct}%"></i></div><small>${k.i < R.length - 1 ? "Siguiente: " + R[k.i + 1] : "¡Rango máximo!"}</small></div></div>`).join("") : "<div class=card><small>Registra series en “Rutina” y aquí verás tu rango en cada ejercicio.</small></div>"}
<small>Rango estimado con tu 1RM (fórmula de Epley) frente a tu peso corporal; en ejercicios sin peso se usan las repeticiones.</small>`;
}
function addW() {
  const w = +v("nw");
  if (!w) return;
  U.weights.push({ d: today(), w });
  sv();
  app();
  toast("Peso guardado ⚖️");
}
// Necesidades diarias (Mifflin-St Jeor + actividad + entrenos + objetivo)
const ACTF = { sed: 1.2, lig: 1.3, act: 1.45, muy: 1.6 };
function tgtFor(p, w) {
  const bmr = 10 * w + 6.25 * p.h - 5 * p.age + (p.sx == "m" ? 5 : -161),
    fa = p.act ? ACTF[p.act] + 0.05 * p.days : 1.2 + 0.06 * p.days,
    k = Math.round(bmr * fa + { grasa: p.age < 18 ? 0 : -450, musculo: 300, fuerza: 200, mantener: 0 }[p.goal]),
    pr = Math.round((p.age < 18 ? 1.6 : p.age >= 60 ? 1.5 : p.goal == "grasa" ? 2.2 : 2) * w),
    fa2 = Math.round((p.dt == "lc" ? 1.2 : 0.9) * w);
  if (p.dt == "lc") { const ca = Math.round((0.2 * k) / 4); return { k, pr, ca, fa: Math.round((k - pr * 4 - ca * 4) / 9), bmr: Math.round(bmr) }; }
  return { k, pr, fa: fa2, ca: Math.round((k - pr * 4 - fa2 * 9) / 4), bmr: Math.round(bmr) };
}
const tgt = () => tgtFor(U.p, bw());
const CARB = [
    "arroz",
    "pasta integral",
    "pasta de legumbres",
    "patata",
    "avena",
    "pan integral",
    "pan de centeno",
    "quinoa",
    "cuscús",
    "boniato",
    "tortita de arroz",
    "wrap",
    "tortilla de maíz",
    "lentejas",
    "garbanzos",
    "judías blancas",
    "plátano",
    "granola",
    "dátiles",
    "miel",
    "maíz",
    "remolacha",
  ],
  RED = ["ternera", "ternera picada", "cerdo magro", "jamón serrano"],
  MED = [
    "salmón",
    "merluza",
    "bacalao",
    "sardinas",
    "caballa",
    "dorada",
    "lubina",
    "atún",
    "garbanzos",
    "lentejas",
    "judías blancas",
    "aceitunas",
    "aceite de oliva",
  ];
function pool(t) {
  const p = U.p,
    xd =
      p.dt == "veg"
        ? MEAT
        : p.dt == "vgn"
          ? [...MEAT, ...ANI]
          : p.dt == "lc"
            ? CARB
            : p.dt == "med"
              ? RED
              : [],
    dz = [...(p.dis || []), ...xd],
    a = MEALS[t == "m" ? "s" : t].filter(
      (m) =>
        !m.al.some((x) => p.al.includes(x)) &&
        !dz.some(
          (x) =>
            m.n.toLowerCase().includes(x) || m.it.some((i) => i[0].includes(x)),
        ),
    ),
    lk = (m) =>
      p.likes.some(
        (l) =>
          m.n.toLowerCase().includes(l) || m.it.some((i) => i[0].includes(l)),
      ),
    sc = (m) =>
      p.dt == "med" ? m.it.filter((i) => MED.includes(i[0])).length : 0;
  return [...a.filter(lk), ...a.filter((m) => !lk(m))].sort(
    (x, y) => sc(y) - sc(x),
  );
}
function pick(d, t) {
  const P = pool(t);
  if (!P.length) return null;
  const c = U.ch[d + t];
  return P[(c != null ? c : d + (t == "s" ? 3 : 0)) % P.length];
}
function shop() {
  const S = {};
  for (let d = 0; d < 7; d++) dayPlan(d).meals.forEach((x) => x.I.forEach(([a, g]) => (S[a] = (S[a] || 0) + g)));
  const L = Object.entries(S).sort((a, b) => a[0].localeCompare(b[0], "es")), sm = SM[U.sm] ? U.sm : "mercadona";
  const txt = "🛒 Lista de la compra FORJA (7 días)\n" + L.map(([a, g]) => `• ${a}: ${g >= 1000 ? (g / 1000).toFixed(2).replace(".", ",") + " kg" : g + " g"}`).join("\n");
  window.SHOPTXT = txt;
  return `<h2 id=compra>🛒 Lista de la compra (7 días)</h2><div class=card><small>Elige tu supermercado: los enlaces abren la búsqueda de cada producto en su web.</small><div class=chips style="margin-top:8px">${Object.entries(SM).map(([k, x]) => `<button class="chip ${sm == k ? "on" : ""}" onclick="U.sm='${k}';sv();app();setTimeout(()=>$('#compra').scrollIntoView(),50)">${x[0]}</button>`).join("")}</div>
${L.map(([a, g]) => `<div class=shr><span><b>${a}</b><small>${g >= 1000 ? (g / 1000).toFixed(2).replace(".", ",") + " kg" : g + " g"}${unitTxt(a, g) ? " · " + unitTxt(a, g) : ""}</small></span><span class=row style="gap:6px"><a class="vid buy" target=_blank rel=noopener href="${shopUrl(sm, shopQ(a))}">Comprar en ${SM[sm][0]}</a><details class=more><summary>Otras</summary><div>${Object.entries(SM).filter(([k]) => k != sm).map(([k, x]) => `<a target=_blank rel=noopener href="${shopUrl(k, shopQ(a))}">${x[0]}</a>`).join("")}</div></details></span></div>`).join("")}
<div class=row style="margin-top:12px;gap:8px;justify-content:flex-start"><button class="btn sm" onclick="navigator.clipboard.writeText(window.SHOPTXT).then(()=>toast('Lista copiada ✅'))">📋 Copiar lista</button><a class="btn sm ghost" target=_blank rel=noopener href="https://wa.me/?text=${encodeURIComponent(txt)}">Enviar por WhatsApp</a></div></div>
<small>Pesos en crudo y escurrido para 7 días. Precio y disponibilidad dependen de cada tienda.</small>`;
}
function mealImg(m, cls) {
  const f = (window.FOTOS || {})[m.n];
  return f
    ? `<figure class="mph ${cls || ""}"><img loading=lazy src="${f.f}" alt="${esc(m.n)}"><figcaption><a target=_blank rel=noopener href="${f.u}">📷 ${esc(f.a)} · ${f.l}</a></figcaption></figure>`
    : `<figure class="mph ph0 ${cls || ""}"><span>🍽</span></figure>`;
}
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString("es");
function precRow(l, v, t, u, min) {
  const d = v - t, ok = min ? d >= -Math.max(1, t * 0.02) : Math.abs(d) <= Math.max(1, t * 0.02);
  return `<div class=prow><span>${l}</span><b>${u == "kcal" ? Math.round(v) : f1(v)} ${u}</b><small>objetivo ${u == "kcal" ? t : f1(t)} ${u}</small><em class="${ok ? "ok" : ""}">${d > 0 ? "+" : ""}${u == "kcal" ? Math.round(d) : f1(d)}</em><div class=bar><i style="width:${Math.min(100, (v / t) * 100)}%"></i></div></div>`;
}
function diet() {
  const t = tgt(), p = U.p, dp = dayPlan(DD), wt = waterTarget(), fib = Math.round((t.k / 1000) * 14), sm = SM[U.sm] ? U.sm : "mercadona";
  return (
    `<h2>Tu dieta · ${GN[p.goal]} · ${act().length} comidas al día</h2><div class=stats style="grid-template-columns:repeat(5,1fr)">${[[t.k, "kcal"], [t.pr + " g", "proteína"], [t.ca + " g", "hidratos"], [t.fa + " g", "grasas"], [(wt.base / 1000).toFixed(1).replace(".", ",") + " L", "agua"]].map(([a, b], i) => `<div style="animation-delay:${i * 80}ms"><b>${a}</b><small>${b}</small></div>`).join("")}</div>
<details class="card how"><summary>¿Cómo se calcula?</summary><small>Metabolismo basal con la fórmula de Mifflin-St Jeor (${p.sx == "m" ? "hombre" : "mujer"}, ${p.age} años, ${p.h} cm, ${bw()} kg) × tu nivel de actividad y entrenos, ${{ grasa: "−450 kcal para perder grasa", musculo: "+300 kcal para ganar músculo", fuerza: "+200 kcal para fuerza", mantener: "sin ajuste" }[p.goal]}. Proteína ${f1(t.pr / bw())} g/kg, grasa ${f1(t.fa / bw())} g/kg y el resto en hidratos. Las raciones de cada día se ajustan gramo a gramo para clavar estas cifras. Agua: 35 ml por kg (${wt.base} ml) + 600 ml los días que entrenas. Valores nutricionales de las tablas BEDCA y USDA; kcal según el etiquetado europeo.</small></details>
${p.age < 18 ? "<div class=card><small>Estás en edad de crecimiento, así que no se aplica déficit de calorías. Come variado, no te saltes comidas y, si quieres cambiar tu peso, habla antes con tu médico.</small></div>" : ""}${hasAI() ? foodcard() : ""}<div class=chips style="margin-top:12px">${DN.map((n, i) => `<button class="chip ${i == DD ? "on" : ""}" onclick="DD=${i};app()">${n}${i == wdx() ? " · hoy" : ""}</button>`).join("")}</div>
<div class="card prec"><b>Precisión del ${["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"][DD]}</b>${precRow("Energía", dp.k, t.k, "kcal")}${precRow("Proteína", dp.p, t.pr, "g")}${U.p.dt == "lc" ? precRow("Hidratos (máx.)", t.ca * 2 - dp.c, t.ca, "g", 1).replace(f1(t.ca * 2 - dp.c), f1(dp.c)) : precRow("Hidratos", dp.c, Math.round(dp.ca), "g")}${precRow("Grasas", dp.f, t.fa, "g")}${precRow("Fibra (mín.)", dp.fi, fib, "g", 1)}<small>En verde: a menos de un 2 % del objetivo.</small></div>` +
    dp.meals
      .map((x, j) => {
        const P = pool(x.tp), m = x.m;
        return `<div class="card meal-card" style="--i:${j}">${mealImg(m)}<div class=row style="margin-top:10px"><div><small>${MT[x.tp][1]} ${MT[x.tp][0]}</small><br><b style="font-size:17px">${esc(m.n)}</b></div><span class=kc><b>${Math.round(x.k)}</b> kcal</span></div>
<div class=macros><span>P <b>${f1(x.M.p)}</b> g</span><span>H <b>${f1(x.M.c)}</b> g</span><span>G <b>${f1(x.M.f)}</b> g</span><span>Fibra <b>${f1(x.M.fi)}</b> g</span></div>
<table class=ingt><tr><th>Ingrediente</th><th>Cantidad</th><th>kcal</th><th>Prot.</th><th></th></tr>${x.I.map(([a, g, ex]) => `<tr${ex ? " class=extra" : ""}><td>${a}${ex ? ' <span class=xtag title="Añadido para cuadrar tus macros del día">+ extra</span>' : ""}${unitTxt(a, g) ? `<small> ${unitTxt(a, g)}</small>` : ""}</td><td><b>${g} g</b></td><td>${Math.round((g * kcal100(a)) / 100)}</td><td>${f1((g * NUT[a][0]) / 100)} g</td><td><a class=buy1 title="Comprar en ${SM[sm][0]}" target=_blank rel=noopener href="${shopUrl(sm, shopQ(a))}">🛒</a></td></tr>`).join("")}</table>
<div class=row style="gap:8px;margin-top:10px;justify-content:flex-start;flex-wrap:wrap"><button class="btn sm" onclick="cook(${DD},'${x.tp}')">👩‍🍳 Cocínalo tú · paso a paso 3D</button>${hasAI() ? `<button class="btn sm ghost" onclick="rec('${x.tp}')">🤖 Receta con IA</button>` : ""}<label class=sel>🛒 Comprar en <select onchange="U.sm=this.value;sv();app()">${Object.entries(SM).map(([k, s]) => `<option value=${k} ${k == sm ? "selected" : ""}>${s[0]}</option>`).join("")}</select></label></div>
<details class=opts><summary>Cambiar plato (${P.length} opciones)</summary><div class=chips>${P.map((y, i) => `<button class="chip ${y === m ? "on" : ""}" onclick="U.ch['${DD}${x.tp}']=${i};sv();app()">${esc(y.n)}</button>`).join("")}</div></details></div>`;
      })
      .join("") +
    shop() +
    `<small style="display:block;margin-top:8px">Orientativo; para patologías consulta a un dietista-nutricionista. Fotos de los platos: Flickr, con licencias Creative Commons que permiten su uso (autor en cada foto).</small>`
  );
}
let CH = [],
  busy = 0;
const md = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>");
function rc() {
  $("#cm").innerHTML = CH.map(
    (m) => `<div class="m ${m.r}">${m.t ? md(m.t) : "…"}</div>`,
  ).join("");
  $("#cm").scrollTop = 1e9;
  $("#cs").innerHTML =
    CH.length <= 1
      ? [
          "Me duele la rodilla",
          "No me gusta el pescado",
          "Cambia mi cena del lunes",
          "¿Cómo hago bien la sentadilla?",
        ]
          .map((x) => `<button class=chip onclick="send('${x}')">${x}</button>`)
          .join("")
      : "";
}
function tg() {
  $("#cp").classList.toggle("open");
  if (!CH.length)
    CH.push({
      r: "a",
      t: "¡Hola! Soy tu coach. Dime si te duele algo, si quieres cambiar una comida o ejercicio, o pídeme una receta.",
    });
  rc();
}
function rec(tp) {
  const m = pick(DD, tp),
    I = por(m, tp, tgt().k);
  $("#cp").classList.add("open");
  if (!CH.length) CH.push({ r: "a", t: "¡Hola! Soy tu coach." });
  send(
    `Dame la receta paso a paso de "${m.n}" con estos pesos: ${I.map(([a, g]) => g + " g " + a).join(", ")}`,
  );
}
function bp(txt) {
  const p = U.p;
  return `Eres el coach de FORJA (app de gimnasio y dieta). Responde en español, cercano y breve (máx 120 palabras salvo recetas). Cuando el usuario pida cambiar el plan usa las herramientas y confirma qué cambiaste. Molestias o dolor: pregunta zona e intensidad si falta, ofrece sustituir ejercicios, sugiere descanso y ver a un médico o fisio si es fuerte o persistente; no diagnostiques. Recetas: pasos cortos con los gramos del plan. No inventes datos del usuario. Si es menor de 18 años: no recomiendes cafeína, creatina, quemagrasas ni dietas de déficit, y deriva cualquier suplemento a su médico o pediatra.
PERFIL: ${JSON.stringify({ objetivo: GN[p.goal], lugar: p.where, dias: p.days, nivel: p.lv, alergias: p.al, gustos: p.likes, noGustos: p.dis || [], molestias: p.notes || [], kcal: tgt().k, edad: p.age, pesoKg: bw(), pilaSuplementos: U.stk || [] })}
RUTINA: ${U.routine.map((d, i) => i + 1 + ") " + d.t + ": " + d.ex.map((e) => e.n).join(", ")).join(" | ")}
DIETA (0=Lun..6=Dom; d=desayuno m=media mañana c=comida s=merienda n=cena r=recena): ${DN.map(
    (n, d) =>
      d +
      ": " +
      act()
        .map((tp) => {
          const m = pick(d, tp);
          return tp + "=" + (m ? m.n : "-");
        })
        .join("; "),
  ).join(" | ")}
OPCIONES PERMITIDAS: ${act()
    .map(
      (tp) =>
        tp +
        ": " +
        pool(tp)
          .map((m) => m.n)
          .join(", "),
    )
    .join(" || ")}
CHAT PREVIO: ${CH.slice(-9, -2)
    .map((m) => (m.r == "u" ? "Usuario: " : "Coach: ") + m.t)
    .join("\n")}
Usuario: ${txt}`;
}
const tl = (ch) => [
  {
    name: "swap_meal",
    description:
      "Cambia la comida elegida de un día. day 0=Lunes..6=Domingo; type d=desayuno,m=media mañana,c=comida,s=merienda,n=cena,r=recena; name = nombre o parte del nombre de una opción permitida.",
    inputSchema: {
      type: "object",
      properties: {
        day: { type: "integer" },
        type: { type: "string", enum: ["d", "m", "c", "s", "n", "r"] },
        name: { type: "string" },
      },
      required: ["day", "type", "name"],
    },
    execute: ({ day, type, name }) => {
      const P = pool(type),
        i = P.findIndex((m) =>
          m.n.toLowerCase().includes(String(name).toLowerCase()),
        );
      if (i < 0) return { ok: false, options: P.map((m) => m.n) };
      U.ch[day + type] = i;
      ch.v = 1;
      return { ok: true, set: P[i].n };
    },
  },
  {
    name: "dislike_food",
    description:
      "El usuario no quiere un alimento o plato: se excluye de toda su dieta.",
    inputSchema: {
      type: "object",
      properties: { food: { type: "string" } },
      required: ["food"],
    },
    execute: ({ food }) => {
      (U.p.dis = U.p.dis || []).push(String(food).toLowerCase());
      U.ch = {};
      ch.v = 1;
      return { ok: true };
    },
  },
  {
    name: "swap_exercise",
    description:
      "Sustituye un ejercicio de la rutina por otro (por molestia o gusto). day empieza en 1.",
    inputSchema: {
      type: "object",
      properties: {
        day: { type: "integer" },
        old: { type: "string" },
        replacement: { type: "string" },
      },
      required: ["day", "old", "replacement"],
    },
    execute: ({ day, old, replacement }) => {
      const d = U.routine[day - 1];
      if (!d) return { ok: false };
      const i = d.ex.findIndex((e) =>
        e.n.toLowerCase().includes(String(old).toLowerCase()),
      );
      if (i < 0) return { ok: false, exercises: d.ex.map((e) => e.n) };
      d.ex[i].n = String(replacement);
      ch.v = 1;
      return { ok: true };
    },
  },
  {
    name: "note_discomfort",
    description: "Guarda una molestia o lesión que menciona el usuario.",
    inputSchema: {
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    },
    execute: ({ text }) => {
      (U.p.notes = U.p.notes || []).push(String(text).slice(0, 120));
      ch.v = 1;
      return { ok: true };
    },
  },
];
async function send(txt) {
  txt = txt || $("#ci").value.trim();
  if (!txt || busy) return;
  $("#ci").value = "";
  CH.push({ r: "u", t: txt }, { r: "a", t: "" });
  busy = 1;
  rc();
  let s = null;
  try {
    s = await getAI();
  } catch (e) {}
  if (!s) {
    CH[CH.length - 1].t = "Inicia sesión para usar el chat.";
    busy = 0;
    return rc();
  }
  const ch = { v: 0 };
  try {
    const r = await s(bp(txt), {
      cache: false,
      tools: tl(ch),
      onText: (u) => {
        CH[CH.length - 1].t = u.text;
        rc();
      },
    });
    CH[CH.length - 1].t = r.text || "Hecho ✅";
  } catch (e) {
    CH[CH.length - 1].t =
      e && e.code == "not_granted"
        ? "Necesito tu permiso para poder responderte."
        : e && e.code == "limit"
          ? "Has llegado al límite diario de la IA. Vuelve mañana."
          : "Ahora mismo no puedo responder, inténtalo de nuevo.";
  }
  busy = 0;
  rc();
  if (ch.v) {
    sv();
    app();
  }
}
const GM = {
  pecho: ["Pectoral mayor", "Deltoides anterior y tríceps"],
  espalda: [
    "Dorsal ancho, trapecio y romboides",
    "Bíceps, deltoides posterior y antebrazo",
  ],
  pierna: ["Cuádriceps e isquios", "Glúteo, gemelos y core"],
  hombro: ["Deltoides (anterior, lateral y posterior)", "Tríceps y trapecio"],
  brazo: ["Bíceps y tríceps", "Antebrazo y hombro"],
  core: ["Recto abdominal y oblicuos", "Transverso y zona lumbar"],
  glúteo: ["Glúteo mayor y medio", "Isquios y core"],
  cardio: ["Corazón y pulmones", "Piernas y core"],
  gemelo: ["Gemelos y sóleo", "Tibial y planta del pie"],
};
const PAT = [
  [
    /plancha|hollow|l-sit|isométric|hold/i,
    "Isométrico",
    "Mantienes una posición rígida sin moverte, contrayendo el core y los estabilizadores. La calidad importa más que el tiempo.",
    "Abdomen y zona lumbar firmes y un temblor suave; la espalda no debe hundirse ni doler.",
    "Aprieta glúteos, cuerpo en línea recta y respira sin aguantar el aire. Para si pierdes la postura.",
  ],
  [
    /curl femoral|nordic|isquio/i,
    "Isquios",
    "Flexionas la rodilla contra resistencia para trabajar la parte trasera del muslo.",
    "Tensión y quemazón en la parte trasera del muslo, sin tirón en la rodilla.",
    "Baja lento (3 s) y evita arquear la espalda baja.",
  ],
  [
    /gemelo|talón/i,
    "Gemelos",
    "Elevas los talones contra resistencia para trabajar las pantorrillas.",
    "Quemazón en la pantorrilla, con estiramiento completo abajo y pausa arriba.",
    "Recorrido completo, pausa de 1 s arriba y sin rebotes.",
  ],
  [
    /tríceps|francés|extensión sobre|extensión en|patada de tríceps|fondos en silla|fondos en banco|fondos entre|press cerrado|diamante|cerradas/i,
    "Extensión de codo",
    "Extiendes los codos empujando contra la resistencia para trabajar la parte trasera del brazo.",
    "Quemazón en la parte trasera del brazo, con los codos quietos y pegados.",
    "Mantén los codos fijos, no balancees el cuerpo y baja hasta estirar bien el tríceps.",
  ],
  [
    /curl|martillo|predicador|concentrado|zottman|spider/i,
    "Flexión de codo",
    "Flexionas el codo llevando la carga hacia el hombro para trabajar el bíceps.",
    "Contracción en el bíceps y bombeo en la parte delantera del brazo.",
    "Codos pegados al cuerpo, sin balanceo y baja controlando 2-3 s.",
  ],
  [
    /elevaciones laterales|elevaciones frontales|elevación en y|encogimientos|remo al mentón|pájaros|face pull/i,
    "Aislamiento de hombro",
    "Mueves el brazo contra la resistencia para aislar una cabeza del deltoides.",
    "Quemazón en el lateral o la parte trasera del hombro, no en el cuello.",
    "Peso moderado, codos ligeramente flexionados y sin encoger los hombros hacia las orejas.",
  ],
  [
    /dominad|jalón|pullover|lever|muscle-up|australian/i,
    "Tirón vertical",
    "Llevas la barra hacia ti o tu cuerpo hacia la barra tirando con la espalda.",
    "Los dorsales tiran de los codos hacia las costillas; el bíceps ayuda.",
    "Empieza bajando las escápulas, no tires solo con los brazos y evita balancearte.",
  ],
  [
    /sentadilla|prensa|hack|goblet|pistol|shrimp|sissy|extensión de cuádriceps/i,
    "Sentadilla y empuje de pierna",
    "Flexionas cadera y rodillas bajando controlado y subes empujando el suelo.",
    "Cuádriceps y glúteos cargados, con el core firme y la espalda neutra.",
    "Rodillas en línea con los pies, talones apoyados y baja hasta paralelo si tu movilidad lo permite.",
  ],
  [
    /zancada|step|búlgara|skater/i,
    "Unilateral de pierna",
    "Trabajas una pierna cada vez dando un paso o apoyándola, mejorando fuerza y equilibrio.",
    "Carga en cuádriceps y glúteo de la pierna adelantada, con estabilidad en cadera y tobillo.",
    "Rodilla alineada con el pie, torso firme y paso lo bastante largo.",
  ],
  [
    /cinta|estática|elíptica|comba|burpee|sprint|carrera|salto|jump|trote|caminata|hiit|battle|assault|escalad|circuito|fartlek|ergómetro|cuesta|baile|escalera|trineo|swing|skipping|shadow|tabata|patinador|intervalos|spinning|plank jacks|shuffle/i,
    "Cardio",
    "Trabajo continuo o por intervalos que eleva tu frecuencia cardíaca.",
    "Respiración agitada pero pudiendo hablar en frases cortas a ritmo moderado.",
    "Calienta antes, mantén la técnica y ajusta la intensidad por tiempo.",
  ],
  [
    /remo|superman/i,
    "Tirón horizontal",
    "Tiras de una carga hacia tu torso para trabajar la espalda media y los dorsales.",
    "Contracción entre las escápulas y tensión en la espalda; los brazos solo conectan.",
    "Pecho abierto, espalda neutra, lleva los codos atrás y aprieta 1 s al final.",
  ],
  [
    /peso muerto|buenos días|good morning|rumano|hiperextens/i,
    "Bisagra de cadera",
    "Llevas la cadera hacia atrás con la espalda neutra y vuelves extendiendo la cadera.",
    "Estiramiento y carga en isquios y glúteo; la espalda baja solo estabiliza.",
    "Rodillas ligeramente flexionadas, carga pegada al cuerpo y sin redondear la espalda.",
  ],
  [
    /hip thrust|puente|patada|kickback|hidrante|clamshell|abducc|abductor/i,
    "Glúteo",
    "Extiendes la cadera contra la resistencia para activar el glúteo.",
    "Contracción fuerte en el glúteo arriba, no en la zona lumbar.",
    "Empuja con los talones, pelvis neutra y aprieta 1-2 s arriba.",
  ],
  [
    /crunch|abdominal|elevación de piernas|rodillas|russian|giro|leñador|mountain|dead bug|bird|oruga|tijeras|v-ups|dragon|toes|windshield|rueda|pallof|oblicuos/i,
    "Core dinámico",
    "Flexionas o rotas el tronco, o elevas las piernas, para trabajar el abdomen.",
    "Quemazón en abdomen y oblicuos, sin tirar del cuello.",
    "Movimiento lento, exhala al contraer y evita el impulso.",
  ],
  [
    /press|fondos|flexion|pike|push|svend|floor|landmine|aperturas|cruces|peck|handstand|planche/i,
    "Empuje",
    "Empujas la carga lejos del cuerpo extendiendo codos y cerrando hombros.",
    "Tensión en el músculo principal al empujar y buen estiramiento al bajar, sin dolor articular.",
    "Escápulas atrás y abajo, core firme, muñecas neutras y recorrido controlado.",
  ],
];
function pat(e) {
  const g = eg(e);
  if (g == "cardio") return PAT[9];
  if (g == "gemelo") return PAT[2];
  return (
    PAT.find((p) => p[0].test(e.n)) || [
      null,
      "Ejercicio de " + g,
      "Ejercicio de fuerza para esta zona: hazlo con recorrido completo y control.",
      "Tensión en el músculo trabajado, sin dolor articular.",
      "Elige un peso con el que mantengas buena técnica en todas las repeticiones.",
    ]
  );
}
function rcm(e) {
  const p = U.p,
    [s, r] = SR[p.goal],
    ty = pat(e)[1];
  if (ty == "Isométrico") return { s: 3, r: "30-60 s", d: "45-60 s" };
  if (ty == "Cardio") return { s: 1, r: "15-25 min", d: "—" };
  const iso =
    /curl|elevaciones|extensión|patada|aperturas|pájaros|face pull|gemelo|cruces|talón/i.test(
      e.n,
    );
  return {
    s: p.lv == "b" ? Math.max(2, s - 1) : s,
    r: iso && p.goal != "fuerza" ? "10-15" : r,
    d:
      p.goal == "fuerza"
        ? "2-3 min"
        : p.goal == "musculo"
          ? "60-90 s"
          : "45-60 s",
  };
}
function evo(n) {
  const L = U.logs[n] || [];
  if (!L.length)
    return "<small>Aún no tienes registros de este ejercicio: guarda tu primera serie y aquí verás tu evolución.</small>";
  const e1 = (x) => (x.w ? x.w * (1 + x.r / 30) : x.r),
    f = L[0],
    l = L[L.length - 1],
    d = Math.round((e1(l) / e1(f) - 1) * 100),
    vol = Math.round(L.reduce((s, x) => s + (x.w || bw()) * x.r * x.s, 0)),
    all = Object.values(U.logs),
    ses = all.reduce((s, a) => s + a.length, 0),
    vt = Math.round(
      all.flat().reduce((s, x) => s + (x.w || bw()) * x.r * x.s, 0),
    );
  const ln = (a, c) => {
    const mn = Math.min(...a),
      mx = Math.max(...a),
      p = a.map((y, i) => [
        10 + i * (300 / Math.max(1, a.length - 1)),
        mx == mn ? 55 : 105 - ((y - mn) / (mx - mn)) * 90,
      ]);
    return (
      `<polyline points="${p.map((q) => q.join(",")).join(" ")}" fill=none stroke="${c}" stroke-width=3 stroke-linecap=round stroke-linejoin=round />` +
      p.map((q) => `<circle cx=${q[0]} cy=${q[1]} r=3.5 fill="${c}"/>`).join("")
    );
  };
  return `<div class=stats style="grid-template-columns:repeat(4,1fr)"><div><b>${L.length}</b><small>sesiones</small></div><div><b style="color:${d >= 0 ? "var(--acc)" : "#ff4d6d"}">${d > 0 ? "+" : ""}${d}%</b><small>fuerza est.</small></div><div><b>${f.w || "PC"}→${l.w || "PC"}</b><small>kg</small></div><div><b>${f.r}→${l.r}</b><small>reps</small></div></div>${
    L.length > 1
      ? `<svg viewBox="0 0 320 120">${ln(
          L.map((x) => x.w || x.r),
          "var(--acc)",
        )}${ln(
          L.map((x) => x.r),
          "var(--y)",
        )}</svg><div class=lg><span><i style="background:var(--acc)"></i>${f.w ? "peso" : "reps"}</span><span><i style="background:var(--y)"></i>reps</span></div>`
      : ""
  }<small>Volumen en este ejercicio: ${vol.toLocaleString("es")} kg · En total: ${ses} registros y ${vt.toLocaleString("es")} kg movidos.</small>`;
}
function info(j) {
  const e = U.routine[D].ex[j],
    g = eg(e),
    [, ty, ds, fe, tp] = pat(e),
    m = GM[g] || GM.pierna,
    r = rcm(e),
    k = best(e.n);
  const zs = zonesOf(e), acc = ACC.filter((a) => a.r && a.r.test(e.n)).slice(0, 4);
  $("#xm").innerHTML =
    `<div class=sheet><div class=row><b style="font-size:19px">${esc(e.n)}</b><button class=lnk onclick="cm()">✕</button></div><small>${ty} · ${g} · ${zs.pri.map((z) => ZN[z]).join(", ")}</small>
<div class=v3d id=v3d><span class=vload>Cargando modelo 3D…</span><div class=vleg><span><i style="background:#ff5a1f"></i>Principal</span><span><i style="background:#ffb547"></i>Secundario</span></div><div class=vctl><button onclick="v3c('play',this)">⏸</button><button onclick="v3c(0.5,this)">0,5×</button><button class=on onclick="v3c(1,this)">1×</button><button onclick="v3c('frente',this)">Frente</button><button onclick="v3c('lado',this)">Lado</button><button onclick="v3c('diagonal',this)">3/4</button><button onclick="v3c('rot',this)">⟳</button></div></div>
<div class=row style="gap:12px;margin-top:10px;align-items:flex-start"><div style="width:170px;flex:none">${body(zm(), zs.pri, 2)}</div><div style="flex:1;font-size:13px"><b>Músculo principal</b><br>${m[0]}<b style="display:block;margin-top:6px">Secundarios</b>${m[1]}<b style="display:block;margin-top:6px">Recomendado</b>${r.s} series × ${r.r}${r.d != "—" ? "<br>descanso " + r.d : ""}<b style="display:block;margin-top:6px">Dificultad</b><span style="color:var(--acc)">${"★".repeat(Math.max(1, dif(e.n)))}${"☆".repeat(5 - Math.max(1, dif(e.n)))}</span><br><small>Tu rango se ajusta a este ejercicio</small>${k ? `<br><span class=bdg style="--c:${C[k.i]};margin-top:6px">Tu rango: ${R[k.i]}</span>` : ""}</div></div>
${acc.length ? `<h2>Accesorios recomendados</h2><div class=accs>${acc.map((a) => `<a class=acc target=_blank rel=noopener href="${ACRT[0][1] + encodeURIComponent(a.s)}"><span>${a.ic}</span><b>${a.n}</b><small>${a.why}</small></a>`).join("")}</div>` : ""}<h2>En qué consiste</h2><p style="margin:0">${ds}</p><h2>Qué deberías notar</h2><p style="margin:0">${fe}</p><h2>Consejo técnico</h2><p style="margin:0">${tp}</p>
<h2>Tu evolución</h2><div class=card style="margin:0">${evo(e.n)}</div>
<div class=row style="margin-top:14px;gap:8px"><a class=vid target=_blank rel=noopener href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.n + " técnica correcta")}">▶ Vídeo</a>${hasAI() ? `<button class=btn style="width:auto" onclick="aiex(${j})">🤖 Explícamelo a mi nivel</button>` : ""}</div><div id=aiex style="margin-top:10px">${U.exinfo && U.exinfo[e.n] ? `<div class=card>${md(U.exinfo[e.n])}</div>` : ""}</div></div>`;
  $("#xm").classList.add("open");
  mount3d(e);
}
// Animación 3D según el nombre del ejercicio
const ANIM = [
  [/inclinad/i, "banca_inclinada"], [/apertura|cruces|peck|pullover/i, "aperturas"], [/francés/i, "press_frances"], [/fondos/i, "fondos"],
  [/press banca|declinad|floor press|press con mancuernas(?! sentado)|press en máquina(?! de hombro)|convergente|svend|press en smith|press con agarre|press en banco|press cerrado|press suelo/i, "banca"],
  [/flexion|push-up|pike|planche|plancha a pica/i, "flexion"], [/dominad|muscle-up|lever/i, "dominada"], [/jalón|pullover en polea/i, "jalon"],
  [/remo en polea|remo sentado|remo en máquina|remo con banda sentado|remo ergómetro|remo 2000|remo en máquina a ritmo|remo intervalos/i, "remo_sentado"],
  [/remo|pendlay|meadows|yates|australian/i, "remo"], [/rumano|piernas rígidas|buenos días|good morning/i, "rumano"], [/peso muerto/i, "pesomuerto"],
  [/hiperextens|superman/i, "hiperextension"], [/hip thrust|puente|elevación de cadera/i, "hip_thrust"], [/patada|kickback|hidrante|burro/i, "patada"],
  [/abduc|aductor|clamshell/i, "aductores"], [/zancada|búlgara|step|skater|split/i, "zancada"], [/prensa|hack/i, "prensa"], [/extensión de cuádriceps|sissy|extensión de cadera/i, "extension_cuadriceps"],
  [/curl femoral|nordic|nórdico|isquios con toalla/i, "curl_femoral"], [/gemelo|talón/i, "gemelos"], [/sentadilla|goblet|pistol|shrimp|pared/i, "sentadilla"],
  [/press|handstand|hold de pino/i, "press_militar"], [/elevaciones? (laterales|frontales)|elevación en y|elevaciones en y/i, "elevacion_lateral"], [/pájaros|posterior/i, "pajaros"],
  [/face pull|remo al mentón|remo alto/i, "face_pull"], [/encogimiento|escápulas/i, "encogimientos"], [/tríceps|extensión sobre|extensión tras|extensión con|extensión en/i, "extension_triceps"],
  [/curl/i, "curl"], [/plancha|hollow|l-sit|dead bug|bird dog|isométric/i, "plancha"], [/colgado|rodillas al pecho|toes to bar|elevación de piernas en paralelas|elevación de piernas en barra/i, "elevacion_piernas"],
  [/russian|giro|leñador|oblicuos|windshield|pallof|crunch lateral/i, "russian_twist"], [/crunch|abdominal|v-ups|rueda|elevación de piernas|tijeras/i, "crunch"],
  [/swing|kettlebell/i, "swing"],
];
const ANIMG = { pecho: "banca", espalda: "remo", pierna: "sentadilla", hombro: "press_militar", brazo: "curl", core: "crunch", glúteo: "hip_thrust", cardio: "correr", gemelo: "gemelos" };
const animOf = (e) => (eg(e) == "cardio" ? "correr" : (ANIM.find(([r]) => r.test(e.n)) || [0, ANIMG[eg(e)] || "curl"])[1]);
let V3 = null;
async function mount3d(e) {
  const el = $("#v3d"); if (!el) return;
  try {
    const { ExerciseViewer } = await import("./three/humano.js");
    if (!document.body.contains(el)) return;
    const z = zonesOf(e);
    V3 = new ExerciseViewer(el, { pat: animOf(e), equip: wtt(e), pri: z.pri, sec: z.sec });
    V3.ready.then(() => el.classList.add("ok"));
  } catch (x) { console.error("3D", x); el.innerHTML = "<small style='padding:16px;display:block'>Tu navegador no puede mostrar el modelo 3D.</small>"; }
}
function v3c(c, b) {
  if (!V3) return;
  if (c == "play") b.textContent = V3.toggle() ? "⏸" : "▶";
  else if (typeof c == "number") { V3.setSpeed(c); b.parentNode.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b || (x.classList.contains("on") && !/×/.test(x.textContent) && x !== b && false))); b.classList.add("on"); }
  else if (c == "rot") { b.classList.toggle("on"); V3.autoRotate(b.classList.contains("on")); }
  else V3.view(c);
}
function cm() {
  $("#xm").classList.remove("open", "mid");
  if (V3) { V3.dispose(); V3 = null; }
  ckClose();
}
async function aiex(j) {
  const e = U.routine[D].ex[j],
    o = $("#aiex");
  o.innerHTML = "<div class=card>Pensando…</div>";
  let s = null;
  try {
    s = await getAI();
  } catch (x) {}
  if (!s) {
    o.innerHTML = "<small>Inicia sesión para usar la IA.</small>";
    return;
  }
  try {
    const r = await s(
      `Explica el ejercicio "${e.n}" a una persona con objetivo ${GN[U.p.goal]}, nivel ${U.p.lv == "b" ? "principiante" : "intermedio"}, que entrena en ${{ gym: "gimnasio", home: "casa", park: "parque de calistenia" }[U.p.where]}. En español, claro y breve (máx 170 palabras): 1) cómo se hace en 4 pasos, 2) qué debería notar, 3) 3 errores comunes, 4) una variante más fácil y una más difícil. Molestias del usuario: ${(U.p.notes || []).join(", ") || "ninguna"}.`,
      {
        cache: false,
        onText: (u) => {
          o.innerHTML = `<div class=card>${md(u.text)}</div>`;
        },
      },
    );
    (U.exinfo = U.exinfo || {})[e.n] = r.text;
    sv();
  } catch (x) {
    o.innerHTML = "<small>No pude generarlo ahora, inténtalo otra vez.</small>";
  }
}
function cu() {
  document.querySelectorAll("[data-n]").forEach((el) => {
    const v = +el.dataset.n;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = v;
      return;
    }
    let t0 = null;
    const f = (ts) => {
      t0 = t0 || ts;
      const k = Math.min(1, (ts - t0) / 800);
      el.textContent = Math.round(v * k);
      if (k < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}
const TIPS = [
  "Duerme 7-9 h: es cuando tu cuerpo repara el músculo.",
  "Reparte tu proteína en 3-4 comidas, de 25 a 40 g cada una.",
  "Sube el peso o las repeticiones poco a poco: eso es progresar.",
  "Calienta 5-10 min antes de cargar peso.",
  "Si una repetición pierde la técnica, termina ahí la serie.",
  "Pésate siempre en ayunas y el mismo día para comparar bien.",
  "Deja al menos 48 h antes de volver a trabajar el mismo músculo.",
];
function streak(ds) {
  const S = new Set(ds),
    d = new Date();
  if (!S.has(dk(d))) d.setDate(d.getDate() - 1);
  let s = 0;
  while (S.has(dk(d))) {
    s++;
    d.setDate(d.getDate() - 1);
  }
  return s;
}
const ring = (p, c) => {
  const L = 2 * Math.PI * 34;
  return `<svg viewBox="0 0 80 80" width=84><circle cx=40 cy=40 r=34 fill=none stroke="var(--bd)" stroke-width=8 /><circle cx=40 cy=40 r=34 fill=none stroke="${c}" stroke-width=8 stroke-linecap=round stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - Math.min(1, p))}" transform="rotate(-90 40 40)" style="--L:${L};animation:ring 1.2s both"/></svg>`;
};
const PH = [
  "Hoy no tienes que ser perfecto, solo tienes que empezar.",
  "La constancia le gana al talento cuando el talento no es constante.",
  "Cada repetición cuenta, incluso las que cuestan.",
  "Tu yo de dentro de seis meses te lo agradecerá.",
  "No compites con nadie: solo con quien fuiste ayer.",
  "Los días que menos ganas tienes son los que más suman.",
  "El progreso es lento, pero abandonar es todavía más lento.",
  "Descansar también es parte del plan.",
  "Una serie bien hecha vale más que tres a medias.",
  "Si fuera fácil, todo el mundo lo haría. Tú sigues.",
  "Come para rendir, entrena para crecer, duerme para recuperar.",
  "No cuentes los días, haz que los días cuenten.",
  "Tu cuerpo aguanta mucho más de lo que tu mente cree.",
  "Pequeños hábitos hoy, grandes resultados mañana.",
  "Entrenar es el único rato del día en el que compites solo contigo.",
  "La disciplina es hacerlo aunque hoy no apetezca.",
  "Cada gota de sudor es una inversión.",
  "No hace falta ir rápido, hace falta no parar.",
  "Hoy suma un día más a tu racha.",
  "El mejor gimnasio es el que pisas, no el que sueñas.",
  "Sé paciente: el músculo se construye en meses, no en días.",
  "Muévete con intención, respira y disfruta el esfuerzo.",
  "Un mal entreno sigue siendo mejor que ninguno.",
  "Tu único rival es la excusa.",
  "Celebra cada pequeño avance: también es avance.",
  "Cuida tu cuerpo: es el único sitio donde vas a vivir siempre.",
  "Hoy puedes hacerlo un poquito mejor que ayer.",
  "Haz que tu yo del futuro se sienta orgulloso.",
  "La fuerza empieza en la cabeza y termina en el cuerpo.",
  "Más agua, más sueño, más constancia.",
  "Respira, aprieta y sigue.",
  "No busques motivación: crea el hábito.",
  "El esfuerzo de hoy es el orgullo de mañana.",
  "Una comida bien elegida también es un paso adelante.",
  "Fuerte no es quien nunca cae, sino quien vuelve a entrenar.",
  "Entrena con ganas, descansa con ganas, vuelve con ganas.",
  "Haz hoy lo que te acerca a quien quieres ser.",
  "Los resultados llegan a quien no se rinde en las semanas aburridas.",
  "Tu rutina es tu superpoder.",
  "A veces ganar es simplemente aparecer.",
];
const dayN = () =>
    Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 864e5),
  wdx = () => (new Date().getDay() + 6) % 7;
function nxt() {
  const ds = new Set(
    Object.values(U.logs)
      .flat()
      .map((x) => x.d),
  );
  return U.routine.length ? ds.size % U.routine.length : 0;
}
function dayStat(k) {
  const lg = [];
  for (const n in U.logs)
    U.logs[n].forEach((x) => {
      if (x.d == k) lg.push([n, x]);
    });
  return {
    lg,
    eat: (U.eat || {})[k] || [],
    w: (U.h || {})[k] || 0,
    sp: (U.tk || {})[k] || [],
    ph: (U.fl || {})[k] || [],
  };
}
function eaten(k) {
  const wd = (new Date(k + "T12:00:00").getDay() + 6) % 7, s = dayStat(k), dp = dayPlan(wd), o = { k: 0, p: 0, c: 0, f: 0 };
  for (const tp of s.eat) { const x = dp.meals.find((q) => q.tp == tp); if (!x) continue; o.k += x.k; o.p += x.M.p; o.c += x.M.c; o.f += x.M.f; }
  s.ph.forEach((x) => { o.k += x.k; o.p += x.p; o.c += x.c; o.f += x.f; });
  return o;
}
function eat(tp) {
  U.eat = U.eat || {};
  const td = today(),
    a = (U.eat[td] = U.eat[td] || []),
    i = a.indexOf(tp);
  i < 0 ? a.push(tp) : a.splice(i, 1);
  sv();
  app();
}
function fdel(i) {
  U.fl[today()].splice(i, 1);
  sv();
  app();
}
function splash() {
  $("#xm").innerHTML =
    `<div class="sheet" style="text-align:center"><small>Frase del día</small><div class=qt style="font-size:30px;line-height:1.15;margin:14px 0 20px">«${PH[dayN() % PH.length]}»</div><button class=btn onclick="cm()">A por el día 💪</button></div>`;
  $("#xm").classList.add("open", "mid");
}
const mb = (l, v, t) =>
  `<div style="margin-top:8px"><div class=row><small>${l}</small><small>${Math.round(v)} / ${t} g</small></div><div class=bar><i style="width:${Math.min(100, (v / t) * 100)}%"></i></div></div>`;
let CS = null,
  CM = 0;
function calh() {
  const now = new Date(),
    base = new Date(now.getFullYear(), now.getMonth() + CM, 1),
    y = base.getFullYear(),
    m = base.getMonth(),
    first = (base.getDay() + 6) % 7,
    days = new Date(y, m + 1, 0).getDate(),
    sel = CS || today(),
    hg = Math.ceil((bw() * 35) / 250),
    ne = Math.ceil(act().length / 2);
  let c = "";
  for (let i = 0; i < first; i++) c += "<i></i>";
  for (let d = 1; d <= days; d++) {
    const k = dk(new Date(y, m, d)),
      s = dayStat(k);
    c += `<button class="cd ${k == sel ? "sel" : ""} ${k == today() ? "tod" : ""}" onclick="CS='${k}';app()"><span>${d}</span><em><u class="${s.lg.length ? "a" : ""}"></u><u class="${s.eat.length >= ne || s.ph.length ? "b" : ""}"></u><u class="${s.w >= hg ? "c" : ""}"></u></em></button>`;
  }
  return `<div class=row><button class=lnk onclick="CM--;app()">◀</button><b>${base.toLocaleDateString("es", { month: "long", year: "numeric" })}</b><button class=lnk onclick="CM++;app()">▶</button></div><div class=cal>${["L", "M", "X", "J", "V", "S", "D"].map((x) => `<small style="text-align:center">${x}</small>`).join("")}${c}</div><div class=lg style="justify-content:flex-start"><span><i style="background:var(--btn)"></i>entreno</span><span><i style="background:#6a9a2f"></i>comidas</span><span><i style="background:#2f7fc0"></i>agua</span></div>${cdet(sel)}`;
}
function cdet(k) {
  const s = dayStat(k),
    wd = (new Date(k + "T12:00:00").getDay() + 6) % 7,
    E = eaten(k),
    g = {};
  s.lg.forEach(([n, x]) => (g[n] = g[n] || []).push(x));
  const meals = s.eat
    .map((tp) => {
      const m = pick(wd, tp);
      return m ? esc(m.n) : "";
    })
    .filter(Boolean)
    .concat(s.ph.map((x) => "📷 " + esc(x.n)));
  return `<div class=card style="margin:8px 0 0"><b>${new Date(k + "T12:00:00").toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</b><p style="margin:6px 0 2px"><b>🏋️ Entreno:</b> ${
    s.lg.length
      ? Object.entries(g)
          .map(
            ([n, a]) =>
              esc(n) +
              " (" +
              a
                .map((x) => (x.w ? x.w + " kg" : "PC") + "×" + x.r + "×" + x.s)
                .join(", ") +
              ")",
          )
          .join("; ")
      : "sin registros"
  }</p><p style="margin:2px 0"><b>🍽 Comidas:</b> ${meals.length ? meals.join("; ") + ` · ${Math.round(E.k)} kcal (P ${Math.round(E.p)} · C ${Math.round(E.c)} · G ${Math.round(E.f)})` : "sin marcar"}</p><p style="margin:2px 0"><b>💧 Agua:</b> ${(waterMl(k) / 1000).toFixed(2).replace(".", ",")} L</p><p style="margin:2px 0"><b>💊 Suplementos:</b> ${s.sp.length ? s.sp.join(", ") : "—"}</p></div>`;
}
function rurl(t) {
  const d = new Date(),
    ymd =
      d.getFullYear() +
      String(d.getMonth() + 1).padStart(2, "0") +
      String(d.getDate()).padStart(2, "0"),
    [h, m] = (t || "18:00").split(":"),
    e = String((+h + 1) % 24).padStart(2, "0");
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    encodeURIComponent("🏋️ Hora de FORJA") +
    "&details=" +
    encodeURIComponent(
      "Abre FORJA: mira tu rutina de hoy, marca tus comidas y registra tus series. ¡Tú puedes!",
    ) +
    `&dates=${ymd}T${h}${m}00/${ymd}T${e}${m}00&recur=RRULE:FREQ=DAILY`
  );
}
function rl() {
  $("#rla").href = rurl($("#rtm").value);
}
function ini() {
  const p = U.p,
    td = today(),
    wd = wdx(),
    t = tgt(),
    all = Object.values(U.logs).flat(),
    ds = [...new Set(all.map((x) => x.d))].sort(),
    sk = streak(ds),
    wk = ds.filter((d) => (new Date(td) - new Date(d)) / 864e5 < 7).length,
    xp = Math.round(
      all.reduce((s, x) => s + (x.w || bw()) * x.r * x.s, 0) / 50 +
        all.length * 10,
    ),
    lv = Math.floor(Math.sqrt(xp / 40)) + 1,
    lo = 40 * (lv - 1) ** 2,
    hi = 40 * lv ** 2,
    nd = nxt(),
    hn = (U.h || {})[td] || 0,
    hg = Math.ceil((bw() * 35) / 250),
    W = U.weights,
    dw = (W[W.length - 1].w - W[0].w).toFixed(1),
    done = all.some((x) => x.d == td),
    ea = (U.eat || {})[td] || [],
    E = eaten(td),
    fl = (U.fl || {})[td] || [];
  return `<div class=hero2><div class=row><div><small>${new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</small><h1 style="font-size:42px;margin:2px 0 0">Hola, ${esc(U.name)}</h1></div><div class=lvl><b data-n="${lv}">${lv}</b><small>nivel</small></div></div><div class=bar style="height:10px;margin-top:10px"><i style="width:${((xp - lo) / (hi - lo)) * 100}%"></i></div><small>${xp - lo} de ${hi - lo} XP para el nivel ${lv + 1}</small></div>
<div class="card" style="--i:1;background:var(--btn);border-color:var(--btn);color:var(--onbtn)"><small style="color:inherit;opacity:.8">Frase del día</small><div class=qt style="font-size:26px;line-height:1.15;margin-top:6px">«${PH[dayN() % PH.length]}»</div></div>
<div class=stats style="grid-template-columns:repeat(3,1fr);margin-top:12px"><div><b data-n="${sk}">${sk}</b><small>días seguidos</small></div><div>${ring(wk / p.days, "var(--btn)")}<small>${wk} de ${p.days} esta semana</small></div><div><b>${W[W.length - 1].w}</b><small>kg (${dw > 0 ? "+" : ""}${dw})</small></div></div>
<div class=card style="--i:2"><div class=row><div><b style="font-size:18px">${done ? "Hoy ya has entrenado ✅" : "Hoy toca"}</b><br><small>${esc(U.routine[nd].t)}</small></div><button class=btn style="width:auto" onclick="D=${nd};T='rut';app();scrollTo(0,0)">${done ? "Ver rutina" : "Empezar"}</button></div></div>
<div class=card style="--i:3"><div class=row><b>🍽 Comidas de hoy</b><small>${Math.round(E.k)} / ${t.k} kcal</small></div><div class=bar style="margin-bottom:6px"><i style="width:${Math.min(100, (E.k / t.k) * 100)}%"></i></div>${act()
    .map((tp) => {
      const m = pick(wd, tp);
      if (!m) return "";
      const x = dayPlan(wd).meals.find((q) => q.tp == tp) || { k: 0, M: { p: 0 } },
        on = ea.includes(tp), f = (window.FOTOS || {})[m.n];
      return `<div class="meal ${on ? "done" : ""}"><button class="ck ${on ? "on" : ""}" onclick="eat('${tp}')">✓</button>${f ? `<img class=mth src="${f.f}" alt="" loading=lazy>` : ""}<div style="flex:1"><b>${esc(m.n)}</b><br><small>${MT[tp][1]} ${MT[tp][0]} · ${Math.round(x.k)} kcal · ${f1(x.M.p)} g prot.</small></div></div>`;
    })
    .join(
      "",
    )}${fl.map((x, i) => `<div class="meal done"><button class="ck on" onclick="fdel(${i})">✕</button><div style="flex:1"><b>📷 ${esc(x.n)}</b><br><small>${Math.round(x.k)} kcal</small></div></div>`).join("")}${mb("Proteína", E.p, t.pr)}${mb("Hidratos", E.c, t.ca)}${mb("Grasas", E.f, t.fa)}<small style="display:block;margin-top:8px">Marca cada comida cuando la hagas. Las cantidades son aproximadas.</small></div>
<div class="card water" style="--i:4">${(() => { const wt = waterTarget(td), ml = waterMl(td), pc = Math.min(1, ml / wt.total); return `<div class=row><div><b>💧 Agua de hoy</b><br><small>Objetivo ${(wt.total / 1000).toFixed(2).replace(".", ",")} L = ${wt.base} ml (35 ml × ${bw()} kg)${wt.entreno ? " + 600 ml por entrenar" : ""}</small></div><div class=wring>${ring(pc, "#3aa7ff")}<b>${(ml / 1000).toFixed(2).replace(".", ",")} L</b></div></div><div class=wbtn>${[[250, "🥛 Vaso"], [330, "🥫 Lata"], [500, "🧴 Botella"], [750, "🍶 0,75 L"]].map(([v, l]) => `<button class="chip" onclick="hy(${v})">${l} <small>+${v}</small></button>`).join("")}<button class="chip" onclick="hy(-250)">−250</button></div><small>${ml >= wt.total ? "¡Objetivo cumplido! 🎉" : `Te faltan ${wt.total - ml} ml (${Math.ceil((wt.total - ml) / 250)} vasos).`}</small>`; })()}</div>
<div class=card style="--i:5"><b>📅 Tu registro diario</b>${calh()}</div>
<div class=card style="--i:6"><div class=row><b>Tu mapa muscular</b><button class=lnk onclick="T='prog';app();scrollTo(0,0)">Ver rangos →</button></div>${body(zm(), null, 1)}</div>
<div class=card style="--i:7"><b>⏰ Recordatorio diario</b><p style="margin:4px 0 8px"><small>Crea un evento que se repite cada día en Google Calendar para acordarte de entrenar. La frase del día aparece al abrir la web.</small></p><div class=row><input id=rtm type=time value="18:00" oninput="rl()" style="margin:0"><a id=rla class=vid target=_blank rel=noopener href="${rurl("18:00")}">Añadir a Google Calendar</a></div></div>`;
}
function hy(ml) {
  const td = today();
  U.hm = U.hm || {}; U.h = U.h || {};
  U.hm[td] = Math.max(0, waterMl(td) + ml);
  U.h[td] = Math.round(U.hm[td] / 250);
  sv();
  app();
}
let RTI = null;
const rsec = (e) => {
  const d = rcm(e).d;
  if (d == "—") return 0;
  const n = parseInt(d);
  return /min/.test(d) ? n * 60 : n;
};
function rest(s) {
  clearInterval(RTI);
  const el = $("#rt");
  if (!s) {
    el.classList.remove("on");
    return;
  }
  let t = s;
  const f = () => {
    el.textContent =
      t > 0
        ? `⏱ ${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")} de descanso · toca para saltar`
        : "¡A por la siguiente serie! 💪";
    if (t <= 0) {
      clearInterval(RTI);
      try {
        navigator.vibrate && navigator.vibrate(250);
      } catch (e) {}
      setTimeout(() => el.classList.remove("on"), 2500);
    }
    t--;
  };
  el.classList.add("on");
  f();
  RTI = setInterval(f, 1000);
}
function rs() {
  clearInterval(RTI);
  $("#rt").classList.remove("on");
}
const RTL = [
    ["HSN", "https://www.hsnstore.com/catalogsearch/result/?q="],
    ["MyProtein", "https://www.myprotein.es/search/?search="],
    ["Prozis", "https://www.prozis.com/es/es/search?term="],
    ["Amazon.es", "https://www.amazon.es/s?k="],
    ["Decathlon", "https://www.decathlon.es/search?Ntt="],
  ],
  EV = [
    ["Poca evidencia", "#ff4d6d"],
    ["Útil en casos concretos", "#ffc400"],
    ["Muy respaldado", "#2fa84f"],
  ];
const SUP = (w, p) => {
  const a = p.age,
    lac = p.al.includes("lactosa"),
    vg = p.dt == "vgn",
    cr = Math.min(5, Math.max(3, Math.round(w * 0.05 * 2) / 2)),
    cap = a >= 65 ? 200 : 400,
    mx = Math.min(cap, Math.round(6 * w)),
    mn = Math.min(cap, Math.round((a >= 65 ? 1 : 3) * w)),
    pg = Math.round((a < 18 ? 1.6 : a >= 60 ? 1.5 : 2) * w),
    ad = a >= 18;
  return [
    {
      k: "prot",
      n: "Proteína en polvo",
      ic: "🥤",
      ev: 2,
      ok: a >= 14,
      no: "A tu edad la proteína sale de la comida: carne, pescado, huevos, lácteos y legumbres cubren de sobra lo que necesitas.",
      q: "busca más de 75-80 g de proteína por cada 100 g, sin mezclas propietarias, con la cantidad por toma clara y un sello de análisis de terceros (Informed Sport o NSF Certified for Sport)",
      s: vg
        ? "proteína vegetal guisante arroz"
        : lac
          ? "proteína whey aislada sin lactosa"
          : "proteína whey aislada",
      d:
        a < 18
          ? `Solo si no llegas con la comida: una toma de 20-25 g, con el visto bueno de tu médico o pediatra. Tu objetivo diario total es de unos ${pg} g.`
          : `1-2 tomas de 25-30 g al día, solo si no llegas a tus ${pg} g de proteína diarios con la comida.`,
      w: "Después de entrenar o como snack.",
      n2: vg
        ? "Elige proteína vegetal (guisante y arroz)."
        : lac
          ? "Con lactosa: aislado de whey o proteína vegetal."
          : "Whey concentrado o aislado: sirve cualquiera si lo toleras bien.",
    },
    {
      k: "crea",
      n: "Creatina monohidrato",
      ic: "⚡",
      ev: 2,
      ok: a >= 14,
      no: "Por debajo de 14 años no se recomienda.",
      q: "creatina monohidrato pura, sin mezclas ni matrices; el sello Creapure o un análisis de terceros es buena señal",
      s: "creatina monohidrato",
      d:
        a < 18
          ? "3 g al día, todos los días, sin fase de carga y solo con el visto bueno de tu médico o pediatra y de tu familia."
          : `${cr} g al día (unos 0,05 g por kg), todos los días, también los de descanso. La fase de carga es opcional: 0,3 g/kg, unos ${Math.round(0.3 * w)} g al día repartidos en 4 tomas durante 5-7 días.`,
      w: "A cualquier hora, con agua o comida.",
      n2:
        a < 18
          ? "En adolescentes hay menos estudios que en adultos: no la uses a la ligera, bebe agua suficiente y para si notas molestias."
          : a >= 50
            ? "Revisa tu función renal con tu médico antes de empezar y bebe suficiente agua."
            : "Bebe suficiente agua. Si tienes problemas renales, consúltalo antes.",
    },
    {
      k: "caf",
      n: "Cafeína",
      ic: "☕",
      ev: 2,
      ok: ad,
      no: "Antes de los 18 años no se recomienda ninguna cafeína: afecta al sueño y al corazón. Evita también bebidas energéticas.",
      q: "un café normal (80-100 mg) sirve igual y sale más barato; si compras pastillas, que indiquen los mg por toma",
      s: "cafeína 200 mg",
      d:
        a >= 65
          ? `Con tu edad, dosis baja: ${mn}-${mx} mg (1-3 mg por kg), máximo 200 mg al día.`
          : `${mn}-${mx} mg entre 30 y 60 min antes de entrenar. Empieza por el mínimo y no pases de 400 mg al día.`,
      w: "Antes de entrenar, nunca en las 8 h previas a dormir.",
      n2: "Si tienes hipertensión, ansiedad, arritmias o duermes mal, habla antes con tu médico.",
    },
    {
      k: "omg",
      n: "Omega-3 (EPA y DHA)",
      ic: "🐟",
      ev: 1,
      ok: a >= 14,
      no: "Mejor come pescado azul un par de veces por semana; el suplemento solo si lo indica tu médico.",
      q: "mira los mg de EPA y DHA por toma, no solo el aceite total; un sello como IFOS o un análisis de terceros ayuda",
      s: "omega 3 epa dha",
      d:
        a < 18
          ? "Primero pescado azul 2 veces por semana. Si quieres suplemento, que lo pauten tu médico o pediatra."
          : "1-2 g de EPA y DHA al día, solo si comes menos de 2 raciones de pescado azul a la semana.",
      w: "Con una comida que lleve grasa.",
      n2: "Si tomas anticoagulantes, consúltalo.",
    },
    {
      k: "vitd",
      n: "Vitamina D",
      ic: "☀️",
      ev: 1,
      ok: ad,
      no: "En menores, solo con pauta de tu pediatra o médico tras una analítica.",
      q: "mejor en farmacia o parafarmacia, con las UI por gota o cápsula indicadas",
      s: "vitamina d3",
      d: "Solo si tu analítica lo indica. Las dosis habituales son 1000-2000 UI al día, pero la pauta la decide tu médico.",
      w: "Con una comida que lleve grasa.",
      n2:
        a >= 50
          ? "A partir de los 50 suele convenir revisar vitamina D y calcio con tu médico."
          : "No la tomes a ciegas a dosis altas.",
    },
    {
      k: "mag",
      n: "Magnesio",
      ic: "🌙",
      ev: 1,
      ok: ad,
      no: "En menores, solo si lo indica tu médico.",
      q: "busca citrato o glicinato y los mg de magnesio elemental, no del compuesto entero",
      s: "magnesio glicinato",
      d: "200-400 mg de magnesio elemental por la noche.",
      w: "30-60 min antes de dormir.",
      n2: "A dosis altas puede aflojar el intestino. Con problemas renales, consúltalo.",
    },
    ...(["musculo", "fuerza"].includes(p.goal)
      ? [
          {
            k: "case",
            n: "Caseína micelar",
            ic: "🛌",
            ev: 1,
            ok: ad,
            no: "En menores de edad la proteína debe salir de la comida.",
            q: "proteína de caseína micelar con el porcentaje de proteína claro; sello de terceros si lo tiene",
            s: "caseína micelar",
            d: "30-40 g antes de dormir, opcional si te cuesta llegar a tu proteína del día.",
            w: "Antes de dormir.",
            n2:
              lac || vg
                ? "Es de origen lácteo: no sirve para dietas veganas ni con intolerancia a la lactosa."
                : "Absorción lenta, ideal para la noche.",
          },
        ]
      : []),
  ];
};
function stg(k) {
  const a = (U.stk = U.stk || []),
    i = a.indexOf(k);
  i < 0 ? a.push(k) : a.splice(i, 1);
  sv();
  app();
}
function tick(k) {
  U.tk = U.tk || {};
  const td = today(),
    a = (U.tk[td] = U.tk[td] || []),
    i = a.indexOf(k);
  i < 0 ? a.push(k) : a.splice(i, 1);
  sv();
  app();
}
function pc() {
  const a = +v("cp1"),
    b = +v("cp2"),
    c = +v("cp3");
  if (a && b && c) {
    $("#cp4").textContent = Math.floor(b / c);
    $("#cp5").textContent = (a / (b / c)).toFixed(2) + " € por toma";
  }
}
function supl() {
  const p = U.p,
    w = bw(),
    L = SUP(w, p),
    ok = L.filter((s) => s.ok),
    stk = (U.stk || []).filter((k) => ok.some((s) => s.k == k)),
    td = today(),
    tk = (U.tk || {})[td] || [],
    dots = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const k = dk(d);
      return `<i class="${((U.tk || {})[k] || []).length ? "f" : ""}"></i>`;
    }).join("");
  return (
    `<h2>Suplementos</h2><div class=card style="--i:0"><small>Información general: no sustituye a un médico ni a un dietista. Si estás embarazada, tienes alguna enfermedad o tomas medicación, consúltalo antes. Las cantidades se calculan con tus ${w} kg y tus ${p.age} años.</small></div>` +
    (p.age < 18
      ? `<div class=card style="--i:1;border-color:var(--btn)"><b>Eres menor de edad</b><p style="margin:6px 0 0">Lo que más te hace progresar es comer bien, dormir 8-10 h y entrenar con buena técnica. Cualquier suplemento, habla antes con tu médico o pediatra y con tu familia. Aquí solo mostramos lo razonable a tu edad.</p></div>`
      : p.age >= 65
        ? `<div class=card style="--i:1"><small>A partir de los 65 las dosis de cafeína son más bajas, y conviene comentar con tu médico cualquier suplemento si tomas medicación.</small></div>`
        : "") +
    `<div class=card style="--i:1"><div class=row><b>💧 Lo básico: agua</b><b class=big>${((w * 35) / 1000).toFixed(1)} L</b></div><small>35 ml por kg al día, más unos 0,5 L por cada hora de entrenamiento.</small></div>` +
    (stk.length
      ? `<h2>Mi pila de hoy</h2><div class=card><div class=chips>${stk
          .map((k) => {
            const s = L.find((x) => x.k == k);
            return `<button class="chip ${tk.includes(k) ? "on" : ""}" onclick="tick('${k}')">${s.ic} ${s.n}</button>`;
          })
          .join(
            "",
          )}</div><div class=bar><i style="width:${(tk.filter((k) => stk.includes(k)).length / stk.length) * 100}%"></i></div><div class=dots>${dots}</div><small>Últimos 7 días</small></div>`
      : "") +
    L.map((s, i) =>
      !s.ok
        ? `<div class=card style="--i:${i + 2};opacity:.75"><div class=row><b>${s.ic} ${s.n}</b><span class=bdg style="--c:#ff4d6d">No recomendado a tu edad</span></div><p style="margin:8px 0 0">${s.no}</p></div>`
        : `<div class=card style="--i:${i + 2}"><div class=row><b>${s.ic} ${s.n}</b><span class=bdg style="--c:${EV[s.ev][1]}">${EV[s.ev][0]}</span></div><p style="margin:8px 0 4px"><b>Cuánto:</b> ${s.d}</p><p style="margin:4px 0"><b>Cuándo:</b> ${s.w}</p><small>${s.n2}</small><p style="margin:8px 0 4px"><b>Cómo elegir bien:</b> ${s.q}.</p><div class=chips>${RTL.map(([n, u]) => `<a class=vid target=_blank rel=noopener href="${u + encodeURIComponent(s.s)}">${n}</a>`).join("")}</div><button class="chip ${stk.includes(s.k) ? "on" : ""}" style="margin-top:8px" onclick="stg('${s.k}')">${stk.includes(s.k) ? "✓ En mi pila" : "＋ Añadir a mi pila"}</button></div>`,
    ).join("") +
    `<div class=card><b>Mejor ahorrártelo</b><p style="margin:6px 0 0">BCAA o EAA si ya llegas a tu proteína diaria, quemagrasas y potenciadores de testosterona: la evidencia es escasa y algunos llevan estimulantes. Gasta ese dinero en comida.</p></div>
<h2>Cómo comprar bien</h2><div class=card><ul style="margin:0;padding-left:18px"><li>Compra al fabricante, en una tienda conocida o en una farmacia: evita vendedores desconocidos de marketplaces.</li><li>Prefiere productos con sello de análisis de terceros (Informed Sport, NSF Certified for Sport).</li><li>Etiqueta transparente: cantidad por toma y sin mezclas propietarias.</li><li>Compara el precio por toma, no por bote.</li><li>Revisa caducidad y lote; desconfía de precios sospechosamente bajos.</li></ul><small>No puedo comprobar precios ni stock ahora mismo: los botones abren la búsqueda en cada tienda.</small></div>
<h2>Precio por toma</h2><div class=card><div class=g2><div><label>Precio (€)</label><input id=cp1 type=number oninput="pc()"></div><div><label>Contenido del bote (g)</label><input id=cp2 type=number oninput="pc()"></div><div><label>Dosis por toma (g)</label><input id=cp3 type=number oninput="pc()"></div><div><label>Tomas por bote</label><b class=big id=cp4>—</b></div></div><b class=big id=cp5></b></div>`
  );
}
let PHF = null,
  TS = "sup";
function foodcard() {
  return `<div class=card style="--i:1"><b>📷 Analiza tu comida con IA</b><p style="margin:4px 0 8px"><small>Haz una foto del plato y estimo calorías, hidratos, proteínas y grasas. Es una aproximación, no una medida exacta.${U.p.age < 18 ? " No hace falta contar calorías al milímetro: úsalo solo como orientación." : ""}</small></p><input id=fi type=file accept="image/*" onchange="fpv(this)" style="display:none"><label class=btn for=fi style="display:block;text-align:center;cursor:pointer">Elegir o hacer foto</label><div id=fprev></div><div id=fres></div></div>`;
}
function fpv(el) {
  PHF = el.files && el.files[0];
  if (!PHF) return;
  $("#fprev").innerHTML =
    `<img src="${URL.createObjectURL(PHF)}" style="width:100%;max-height:240px;object-fit:cover;border-radius:14px;margin-top:10px"><button class=btn style="margin-top:10px" onclick="fan()">Analizar con IA</button>`;
  $("#fres").innerHTML = "";
}
async function fan() {
  const o = $("#fres");
  if (!PHF) return;
  o.innerHTML = "<div class=card>Analizando tu plato…</div>";
  let s = null;
  try {
    s = await getAI();
  } catch (e) {}
  if (!s) {
    o.innerHTML = "<small>Inicia sesión para usar la IA.</small>";
    return;
  }
  let caps = null;
  try {
    caps = await s.limits();
  } catch (e) {}
  if (!caps || !caps.images) {
    o.innerHTML = "<small>Este visor no permite enviar fotos.</small>";
    return;
  }
  try {
    const r = await s(
      'Eres nutricionista deportivo. Mira la foto de comida: identifica cada alimento visible, estima su peso en gramos y calcula de forma aproximada kcal, hidratos, proteína y grasa. Si la imagen no es comida devuelve {"error":"no es comida"}. Responde SOLO con JSON, sin texto extra, con este formato: {"platos":[{"nombre":"","gramos":0,"kcal":0,"carbs":0,"proteina":0,"grasa":0}],"total":{"kcal":0,"carbs":0,"proteina":0,"grasa":0},"confianza":"baja|media|alta","consejo":"una frase amable y breve"}',
      { images: PHF, cache: false },
    );
    const j = JSON.parse(r.text.replace(/```json|```/g, "").trim());
    if (j.error || !j.total) {
      o.innerHTML =
        "<div class=card>No he reconocido comida en la foto. Prueba con otra más clara.</div>";
      return;
    }
    const T0 = j.total,
      t = tgt();
    window.LASTF = {
      n:
        (j.platos || [])
          .slice(0, 3)
          .map((x) => x.nombre)
          .join(", ") || "Comida",
      k: +T0.kcal || 0,
      c: +T0.carbs || 0,
      p: +T0.proteina || 0,
      f: +T0.grasa || 0,
    };
    o.innerHTML = `<div class=card style="margin-top:10px"><div class=stats style="grid-template-columns:repeat(4,1fr)"><div><b>${Math.round(T0.kcal)}</b><small>kcal</small></div><div><b>${Math.round(T0.carbs)}</b><small>C g</small></div><div><b>${Math.round(T0.proteina)}</b><small>P g</small></div><div><b>${Math.round(T0.grasa)}</b><small>G g</small></div></div>${(j.platos || []).map((x) => `<div class=row style="padding:6px 0;border-bottom:1px solid var(--bd)"><span>${esc(x.nombre)} · ${Math.round(x.gramos)} g</span><small>${Math.round(x.kcal)} kcal</small></div>`).join("")}${mb("Proteína (de tu objetivo diario)", T0.proteina, t.pr)}${mb("Hidratos", T0.carbs, t.ca)}${mb("Grasas", T0.grasa, t.fa)}<small style="display:block;margin-top:8px">Confianza: ${esc(j.confianza || "media")}. ${esc(j.consejo || "")}</small><button class=btn style="margin-top:10px" onclick="fadd()">Añadir a mi registro de hoy</button></div>`;
  } catch (e) {
    o.innerHTML =
      e && e.code == "limit"
        ? "<div class=card>Has llegado al límite diario de análisis. Vuelve mañana.</div>"
        : "<div class=card>No he podido analizar la foto ahora. Inténtalo de nuevo.</div>";
  }
}
function fadd() {
  if (!window.LASTF) return;
  U.fl = U.fl || {};
  (U.fl[today()] = U.fl[today()] || []).push(window.LASTF);
  window.LASTF = null;
  sv();
  toast("Añadido a tu registro de hoy ✅");
  app();
}
const ACRT = [
  ["Amazon.es", "https://www.amazon.es/s?k="],
  ["Decathlon", "https://www.decathlon.es/search?Ntt="],
  ["Google Shopping", "https://www.google.com/search?tbm=shop&q="],
];
const ACC = [
  {
    n: "Straps de agarre",
    ic: "🪢",
    r: /remo|dominad|jalón|peso muerto|encogimientos|pullover/i,
    why: "Cuando el agarre se agota antes que la espalda, te dejan terminar remos, peso muerto y dominadas.",
    tip: "Mejor de algodón o nylon de 40-60 cm. No los uses en todas las series para no descuidar el agarre.",
    s: "straps agarre gimnasio",
  },
  {
    n: "Cinturón de levantamiento",
    ic: "🥋",
    r: /sentadilla|peso muerto|press militar|buenos días|prensa/i,
    min: 16,
    why: "Ayuda a estabilizar el tronco con cargas muy altas en sentadilla, peso muerto y press militar.",
    tip: "Solo para series pesadas, no para todo el entreno. Mejor de velcro o palanca de 10 cm; tu core debe seguir trabajando.",
    s: "cinturón levantamiento pesas",
  },
  {
    n: "Muñequeras",
    ic: "🤜",
    r: /press|flexion|fondos|handstand|pike|curl|plancha/i,
    why: "Dan estabilidad a la muñeca en press, flexiones y fondos.",
    tip: "Ajustables con velcro, de 30-45 cm; que sujeten sin cortar la circulación.",
    s: "muñequeras gimnasio",
  },
  {
    n: "Rodilleras de neopreno",
    ic: "🦵",
    r: /sentadilla|prensa|zancada|búlgara|step|pistol/i,
    why: "Dan calor y sensación de estabilidad en sentadillas y zancadas.",
    tip: "Para sentirte seguro, no para arreglar una mala técnica. Elige bien la talla.",
    s: "rodilleras neopreno gimnasio",
  },
  {
    n: "Zapatillas planas de entreno",
    ic: "👟",
    r: /sentadilla|peso muerto|prensa|zancada|hip thrust/i,
    why: "Una suela plana y firme mejora el apoyo en sentadilla y peso muerto.",
    tip: "Evita suelas muy acolchadas para levantar pesado; para cardio sí conviene amortiguación.",
    s: "zapatillas entrenamiento fuerza suela plana",
  },
  {
    n: "Magnesio en polvo (tiza)",
    ic: "🧂",
    r: /dominad|remo|peso muerto|colgado|barra/i,
    why: "Mejora el agarre cuando las manos sudan.",
    tip: "La tiza líquida ensucia menos en el gimnasio.",
    s: "magnesio tiza escalada gimnasio",
  },
  {
    n: "Bandas elásticas",
    ic: "🎗️",
    r: /banda|glúteo|puente|clamshell|patada|hip thrust|face pull|pájaros/i,
    home: 1,
    why: "Sirven para activar el glúteo, calentar hombros y entrenar en casa o de viaje.",
    tip: "Compra un set de varias resistencias, mejor de tela para el glúteo.",
    s: "bandas elásticas resistencia set",
  },
  {
    n: "Tobilleras para polea",
    ic: "⛓️",
    r: /kickback|patada|abducción|abductor/i,
    why: "Necesarias para patadas y abducciones de glúteo en polea.",
    tip: "Con buen acolchado y cierre de velcro firme.",
    s: "tobillera polea gimnasio",
  },
  {
    n: "Anillas de gimnasia",
    ic: "⭕",
    r: /anillas|dominad|fondos|flexiones|barra baja|australian|invertido/i,
    why: "Convierten flexiones, remos y fondos en ejercicios mucho más completos.",
    tip: "De madera o plástico, con correas de al menos 4 m y hebillas numeradas.",
    s: "anillas gimnasia correas",
  },
  {
    n: "Barra de dominadas",
    ic: "🚪",
    r: /puerta|dominad|colgado/i,
    home: 1,
    why: "Te permite hacer dominadas y remos en casa.",
    tip: "Comprueba que sea compatible con tu marco de puerta y soporte tu peso.",
    s: "barra dominadas puerta",
  },
  {
    n: "Mancuernas ajustables",
    ic: "🏋️",
    home: 1,
    r: /mancuerna/i,
    why: "Una pareja ajustable sustituye a muchas mancuernas fijas en casa.",
    tip: "Mira el peso máximo, el sistema de cierre y el espacio que ocupan.",
    s: "mancuernas ajustables",
  },
  {
    n: "Esterilla",
    ic: "🧘",
    r: /plancha|crunch|abdominal|puente|superman|dead bug|hollow|bird|oruga/i,
    why: "Para ejercicios de suelo y core.",
    tip: "Antideslizante y de 8-10 mm.",
    s: "esterilla fitness antideslizante",
  },
  {
    n: "Kettlebell",
    ic: "🔔",
    r: /swing|goblet|kettlebell/i,
    home: 1,
    why: "Versátil para swings, goblet squats y trabajo de cadera.",
    tip: "Para empezar, 8-12 kg mujer y 12-16 kg hombre suelen valer.",
    s: "kettlebell hierro fundido",
  },
  {
    n: "Comba de velocidad",
    ic: "🪢",
    r: /comba|cardio|hiit|salto/i,
    why: "Cardio barato y portátil para calentar o hacer intervalos.",
    tip: "Con rodamientos y cable ajustable.",
    s: "comba velocidad rodamientos",
  },
  {
    n: "Reloj deportivo o pulsera de actividad",
    ic: "⌚",
    all: 1,
    why: "Mide pulsaciones, pasos, sueño y entrenos: útil en cardio y para controlar tu recuperación.",
    tip: "Busca sensor de pulso, GPS si corres, batería de 5 días o más y compatibilidad con tu móvil.",
    s: "reloj deportivo gps pulsómetro",
  },
  {
    n: "Banda de pulso",
    ic: "❤️",
    r: /cinta|carrera|hiit|sprint|comba|bicicleta|cardio/i,
    why: "Mide las pulsaciones con más precisión que una muñeca.",
    tip: "Con Bluetooth y ANT+ para conectar con relojes y apps.",
    s: "banda pulsómetro pecho bluetooth",
  },
  {
    n: "Báscula de cocina",
    ic: "⚖️",
    all: 1,
    why: "Para pesar los gramos de tus comidas como te indica la dieta.",
    tip: "Digital, con precisión de 1 g y función de tara.",
    s: "báscula cocina digital 1g",
  },
  {
    n: "Báscula de baño inteligente",
    ic: "🚶",
    all: 1,
    why: "Para tu pesaje semanal en ayunas y ver la evolución.",
    tip: "Pésate siempre el mismo día y a la misma hora; no te obsesiones con un solo dato.",
    s: "báscula baño inteligente",
  },
  {
    n: "Táperes herméticos",
    ic: "🍱",
    all: 1,
    why: "Para preparar tus comidas de la semana y llevarlas contigo.",
    tip: "Aptos para microondas y lavavajillas, de varios tamaños.",
    s: "táper hermético meal prep",
  },
  {
    n: "Botella de agua",
    ic: "🥤",
    all: 1,
    why: "Para llegar a tus litros de agua al día durante el día y el entreno.",
    tip: "De 1 litro y con marcas de nivel.",
    s: "botella agua 1 litro deporte",
  },
  {
    n: "Rodillo de espuma y pistola de masaje",
    ic: "💆",
    all: 1,
    why: "Ayudan a soltar los músculos y a recuperar después de entrenar.",
    tip: "El rodillo cumple de sobra; la pistola es un extra opcional.",
    s: "foam roller rodillo masaje",
  },
  {
    n: "Auriculares deportivos",
    ic: "🎧",
    all: 1,
    why: "Para entrenar con tu música sin cables molestos.",
    tip: "Con certificación de resistencia al sudor y buen ajuste al oído.",
    s: "auriculares deportivos bluetooth",
  },
];
function acc() {
  const p = U.p,
    rt = U.routine.flatMap((d) => d.ex.map((e) => e.n)).join(" | "),
    L = ACC.filter((a) => !a.min || p.age >= a.min)
      .map((a) => ({
        ...a,
        rel: !!(
          a.all ||
          (a.r && a.r.test(rt)) ||
          (a.home && p.where == "home")
        ),
      }))
      .sort((x, y) => y.rel - x.rel);
  return (
    `<h2>Complementos</h2><div class=card><small>Primero te marco lo que encaja con los ejercicios de tu rutina. Los botones abren la búsqueda en cada tienda; no puedo comprobar precios ni stock ahora mismo.</small></div>` +
    L.map(
      (a, i) =>
        `<div class=card style="--i:${Math.min(i, 8)}"><div class=row><b>${a.ic} ${a.n}</b><span class=bdg style="--c:${a.rel ? "#2fa84f" : "#8a949e"}">${a.rel ? "Para tu rutina" : "Opcional"}</span></div><p style="margin:8px 0 4px">${a.why}</p><small>${a.tip}</small><div class=chips style="margin-top:8px">${ACRT.map(([n, u]) => `<a class=vid target=_blank rel=noopener href="${u + encodeURIComponent(a.s)}">${n}</a>`).join("")}</div></div>`,
    ).join("")
  );
}
function sup() {
  return (
    `<div class=chips style="margin-top:12px"><button class="chip ${TS == "sup" ? "on" : ""}" onclick="TS='sup';app()">💊 Suplementos</button><button class="chip ${TS == "acc" ? "on" : ""}" onclick="TS='acc';app()">🎒 Complementos</button></div>` +
    (TS == "acc" ? acc() : supl())
  );
}
function perf() {
  const p = U.p;
  return `<h2>Perfil</h2><div class=card><b>${esc(U.name)}</b><br><small>${esc(ROOT.acc[ROOT.last].e)} · ${DBR ? "☁️ en la nube" : "💾 solo este navegador"}</small><hr style="border:0;border-top:1px solid var(--bd);margin:12px 0">${p.age} años · ${p.h} cm · ${bw()} kg<br>Objetivo: ${GN[p.goal]}<br>${p.days} días · ${{ gym: "Gimnasio", home: "Casa", park: "Parque" }[p.where]}</div>
${SB && !SBU ? `<div class=card><small>Estás sin cuenta: tus datos solo están en este navegador. Crea una cuenta para guardarlos en la nube y verlos desde cualquier dispositivo; tu plan actual se traslada solo.</small><button class=btn style="margin-top:10px" onclick="toReg()">Crear cuenta</button></div>` : ""}<button class=btn onclick="onb()" style="margin-bottom:10px">Editar datos y regenerar plan</button><button class=lnk onclick="logout()">Cerrar sesión</button><p class=mut style="font-size:12px;margin-top:16px">Modelo 3D: Xbot (three.js / Mixamo). Mapa muscular basado en react-body-highlighter (MIT). Fotos de platos: autores de Flickr con licencias Creative Commons (crédito en cada foto). Datos nutricionales: BEDCA y USDA.</p>`;
}
function app() {
  const V = { ini, rut, prog, diet, sup, perf },
    N = [
      ["ini", "🏠", "Inicio"],
      ["rut", "🏋️", "Rutina"],
      ["prog", "📈", "Progreso"],
      ["diet", "🥗", "Dieta"],
      ["sup", "🛒", "Tienda"],
      ["perf", "👤", "Perfil"],
    ];
  $("#cw").style.display = hasAI() ? "block" : "none";
  const zg = rankGlobal(zm());
  A.innerHTML = `<header><div class=wrap><span class=logo>FORJA<span>.</span></span><button class=rchip onclick="T='prog';app();scrollTo(0,0)">${badge(zg, 24)}<span>${zg >= 0 ? R[zg] : "Sin rango"}</span></button></div></header><main class=wrap>${V[T]()}</main><nav>${N.map(([k, i, t]) => `<button class="${T == k ? "on" : ""}" onclick="T='${k}';app();scrollTo(0,0)"><b>${i}</b>${t}</button>`).join("")}</nav>`;
  cu();
  if (T == "ini" && U.q != today()) {
    U.q = today();
    sv();
    splash();
  }
}
init();
