// FORJA · Datos: catálogo de ejercicios, estilos de rutina y menús (código original de FORJA)
const $ = (s) => document.querySelector(s),
  A = $("#app");
const GX = {
  pecho: [
    "Press banca con barra|Press banca inclinado con barra|Press banca declinado|Press con mancuernas|Press inclinado con mancuernas|Aperturas con mancuernas|Aperturas en polea|Cruces en polea alta|Cruces en polea baja|Press en máquina|Peck deck|Fondos en paralelas|Pullover con mancuerna|Press Svend",
    "Flexiones|Flexiones declinadas|Flexiones diamante|Flexiones arqueras|Flexiones con palmada|Flexiones inclinadas|Flexiones con pausa|Press suelo con mochila|Aperturas con bandas|Flexiones en pica",
    "Fondos en paralelas|Flexiones|Flexiones declinadas|Flexiones arqueras|Fondos en anillas|Flexiones en paralelas|Flexiones pseudo planche|Flexiones con palmada",
  ],
  espalda: [
    "Dominadas|Dominadas supinas|Remo con barra|Remo con mancuerna|Remo en polea baja|Jalón al pecho|Jalón agarre cerrado|Remo en T|Remo en máquina|Peso muerto|Pullover en polea|Remo Pendlay|Hiperextensiones|Jalón a una mano",
    "Remo con mochila|Remo invertido bajo mesa|Superman|Dominadas en puerta con toalla|Remo con banda elástica|Buenos días con mochila|Remo a una mano con garrafa|Pullover con mochila",
    "Dominadas|Dominadas supinas|Dominadas agarre neutro|Remo invertido|Remo en anillas|Dominadas arqueras|Australian pull-up|Muscle-up|Front lever progresión|Dominadas con pausa",
  ],
  pierna: [
    "Sentadilla con barra|Sentadilla frontal|Prensa de piernas|Peso muerto rumano|Zancadas con mancuernas|Sentadilla búlgara|Extensión de cuádriceps|Curl femoral tumbado|Curl femoral sentado|Hack squat|Sentadilla goblet|Elevación de gemelos de pie|Gemelos sentado|Peso muerto sumo|Abductores en máquina|Step up con mancuernas|Sentadilla en máquina Smith",
    "Sentadilla|Sentadilla búlgara|Zancadas|Zancadas caminando|Sentadilla sumo|Sentadilla con salto|Peso muerto a una pierna|Elevación de gemelos|Sentadilla isométrica en pared|Step up en silla|Curl femoral con toalla",
    "Sentadilla pistol asistida|Zancadas|Salto al cajón|Sentadilla con salto|Zancada lateral|Elevación de gemelos en escalón|Step up en banco|Sentadilla búlgara en banco|Nordic curl asistido|Sprint corto",
  ],
  hombro: [
    "Press militar con barra|Press con mancuernas sentado|Press Arnold|Elevaciones laterales|Elevaciones frontales|Pájaros con mancuernas|Face pull|Remo al mentón|Elevaciones laterales en polea|Press en máquina de hombro|Encogimientos con mancuernas|Pájaros en peck deck",
    "Pike push-up|Elevaciones laterales con botellas|Plancha con toque de hombro|Press con mochila|Elevaciones frontales con mochila|Pájaros con bandas|Face pull con banda|Handstand en pared",
    "Pike push-up|Handstand en pared|Fondos en paralelas|Pike push-up elevado|Handstand push-up asistido|Planche lean",
  ],
  brazo: [
    "Curl con barra|Curl con mancuernas alterno|Curl martillo|Curl predicador|Curl en polea|Curl concentrado|Press francés|Extensión de tríceps en polea|Fondos en banco|Patada de tríceps|Extensión sobre la cabeza|Curl de muñeca",
    "Fondos en silla|Curl con mochila|Flexiones diamante|Curl con banda|Extensión de tríceps con mochila|Curl martillo con garrafas|Flexiones cerradas",
    "Dominadas supinas|Fondos en paralelas|Flexiones diamante|Curl con anillas|Extensión de tríceps en barra baja|Fondos en banco|Dominadas agarre cerrado",
  ],
  core: [
    "Plancha|Elevación de piernas|Rueda abdominal|Crunch en polea|Russian twist|Elevación de piernas colgado|Plancha lateral|Crunch inverso|Leñador en polea|Dead bug|Pallof press|Hollow hold",
    "Plancha|Crunch|Mountain climbers|Plancha lateral|Dead bug|Bicicleta abdominal|Elevación de piernas tumbado|Superman|Hollow hold|V-ups",
    "Elevación de piernas colgado|Plancha|L-sit|Rodillas al pecho colgado|Dragon flag progresión|Plancha lateral|Toes to bar|Windshield wipers",
  ],
  glúteo: [
    "Hip thrust con barra|Puente de glúteo con barra|Patada de glúteo en polea|Abducción en máquina|Peso muerto rumano|Sentadilla sumo|Zancada reversa|Good morning|Hiperextensión de glúteo|Patada en máquina",
    "Puente de glúteo|Puente a una pierna|Patada de burro|Hidrantes|Sentadilla sumo|Hip thrust en sofá|Clamshell con banda|Zancada reversa",
    "Hip thrust en banco|Zancada reversa|Step up en banco|Sentadilla búlgara|Salto al cajón|Puente de glúteo",
  ],
  cardio: [
    "Cinta de correr|Bicicleta estática|Elíptica|Remo en máquina|Escaladora|Battle ropes|Comba|HIIT en cinta|Assault bike",
    "Comba|Burpees|Jumping jacks|Rodillas altas|Caminata rápida|Escaladores|Skipping|Shadow boxing|Saltos de tijera",
    "Carrera continua|Sprints|Cuestas|Burpees|Comba|Circuito calistenia|Caminata rápida|Intervalos de carrera",
  ],
};
const G = Object.fromEntries(
  Object.entries(GX).map(([k, v]) => [
    k,
    { gym: v[0].split("|"), home: v[1].split("|"), park: v[2].split("|") },
  ]),
);
const X2 = {
  pecho: [
    "Press banca agarre cerrado|Floor press con mancuernas|Press landmine|Press en Smith|Cruces en polea a una mano|Aperturas inclinadas con mancuernas|Press con mancuernas neutro",
    "Flexiones con pies elevados|Flexiones tempo lento|Flexiones isométricas|Flexiones espartanas|Press con garrafas",
    "Flexiones en barra baja|Fondos negativos|Flexiones con anillas|Fondos con pausa|Flexiones planche lean",
  ],
  espalda: [
    "Remo agarre neutro|Remo Meadows|Remo en polea a una mano|Dominadas lastradas|Dominadas asistidas|Remo con pecho apoyado|Jalón agarre neutro",
    "Remo con toalla en puerta|Remo con mochila a una mano|Superman con pausa|Pullover con banda|Remo inclinado con garrafas",
    "Dominadas lastradas|Dominadas negativas|Remo invertido con pies elevados|Tuck front lever|Dominadas con toalla",
  ],
  pierna: [
    "Sentadilla a cajón|Sentadilla con pausa|Peso muerto piernas rígidas|Prensa a una pierna|Zancada lateral|Sissy squat|Hiperextensión inversa",
    "Sentadilla con pausa|Sentadilla tempo|Zancada lateral|Sentadilla skater|Puente de isquios con toalla",
    "Sentadilla a cajón|Zancada con salto|Sentadilla shrimp|Saltos de rana|Escaleras a saltos",
  ],
  hombro: [
    "Press landmine|Elevación en Y|Press con kettlebell|Elevaciones laterales inclinado|Press Z|Pájaros en polea|Face pull con cuerda",
    "Elevación en Y con banda|Press con botellas|Círculos con mochila|Elevaciones en Y tumbado|Plancha a pica",
    "Pike en anillas|Handstand hold|Flexiones en pica elevado|Fondos negativos en paralelas|Elevaciones de escápulas",
  ],
  brazo: [
    "Curl Zottman|Curl inclinado|Curl spider|Press cerrado|Extensión de tríceps con cuerda|Curl inverso|Curl con barra Z",
    "Curl isométrico con toalla|Extensión de tríceps tumbado|Curl con mochila lento|Fondos con pies elevados|Curl inverso con garrafas",
    "Dominadas australianas supinas|Flexiones arqueras cerradas|Curl en barra baja|Fondos negativos|Extensión en anillas",
  ],
  core: [
    "Plancha con carga|Abdominal con rodillo|Giro ruso con disco|Elevación de rodillas|Crunch con carga|Oblicuos en polea|Bird dog",
    "Bird dog|Plancha con elevación de pierna|Tijeras|Abdominal en bicicleta lenta|Oruga",
    "Plancha en anillas|Levantamiento de piernas en barra|Abdominal en banco inclinado|Giros colgado|Plancha lateral con elevación",
  ],
  glúteo: [
    "Hip thrust a una pierna|Peso muerto rumano a una pierna|Sentadilla en Smith|Abducción en polea|Kickback en máquina|Elevación de cadera con mancuerna|Zancada búlgara glúteo",
    "Hip thrust con mochila|Puente con banda|Patada lateral con banda|Sentadilla sumo con pausa|Peso muerto a una pierna sin peso",
    "Hip thrust a una pierna|Zancada lateral|Salto lateral|Step down|Sentadilla sumo",
  ],
  cardio: [
    "Cinta en cuesta|Intervalos en bicicleta|Trineo|Remo intervalos|Saltos al cajón|Kettlebell swing|Circuito metabólico",
    "Jump squats|Burpees sin salto|Patadas de boxeo|Baile|Circuito tabata|Plank jacks",
    "Fartlek|Carrera de tempo|Subida de escaleras|Circuito de calistenia rápido|Bicicleta",
  ],
};
for (const k in X2) {
  ["gym", "home", "park"].forEach((e, i) =>
    G[k][e].push(...X2[k][i].split("|")),
  );
}
const X3 = {
  pecho: [
    "Press en máquina convergente|Aperturas en máquina|Fondos asistidos en máquina|Press inclinado en Smith",
    "Flexiones hindú|Flexiones con rotación|Flexiones Superman",
    "Flexiones arqueras en anillas|Fondos en paralelas con pausa|Flexiones explosivas",
  ],
  espalda: [
    "Remo en máquina agarre ancho|Jalón agarre supino|Remo Yates|Pullover con barra",
    "Remo con toalla en suelo|Dominadas isométricas en puerta|Remo con botellas",
    "Dominadas con pausa arriba|Remo invertido agarre supino|Dominadas explosivas",
  ],
  pierna: [
    "Prensa horizontal|Zancada caminando con barra|Curl nórdico|Sentadilla sobre banco",
    "Zancada con mochila|Sentadilla frontal con mochila|Gemelos a una pierna",
    "Sentadilla en un escalón|Zancada diagonal|Elevaciones de talón a una pierna",
  ],
  hombro: [
    "Press unilateral con mancuerna|Elevaciones laterales a una mano|Remo alto con cuerda|Press con barra sentado",
    "Elevaciones laterales isométricas|Pike isométrico|Press con garrafa",
    "Flexiones en pica con pies altos|Hold de pino|Swing de hombros en barra",
  ],
  brazo: [
    "Curl con cuerda|Press francés con mancuernas|Curl en banco inclinado|Fondos entre bancos",
    "Curl con toalla|Fondos en silla a una pierna|Extensión con banda",
    "Curl en anillas supino|Fondos en paralelas cerrados|Flexiones diamante elevadas",
  ],
  core: [
    "Elevación de piernas en banco|Plancha con disco|Leñador con mancuerna|Crunch en máquina",
    "Plancha con toque de hombro|Crunch lateral|Escaladores lentos",
    "Elevación de piernas en paralelas|Plancha en barra|Giros de cadera colgado",
  ],
  glúteo: [
    "Hip thrust en máquina|Prensa con pies altos|Sentadilla sumo con mancuerna|Patada en polea con tobillera",
    "Patada atrás con banda|Puente de glúteo con pausa|Zancada reversa con mochila",
    "Step up lateral|Sentadilla búlgara glúteo|Puente a una pierna elevado",
  ],
  cardio: [
    "Remo ergómetro 500 m|Cinta con intervalos 30-30|Bicicleta de spinning|Escalera de cuerda",
    "Salto de comba doble|Sprint en sitio|Subir y bajar escalón",
    "Intervalos 400 m|Series de cuestas|Circuito de pesas corporales",
  ],
};
for (const k in X3) {
  ["gym", "home", "park"].forEach((e, i) =>
    G[k][e].push(...X3[k][i].split("|")),
  );
}
const X4 = {
  pecho: [
    "Press con agarre en pausa|Aperturas con banda en pie",
    "Flexiones con banda|Flexiones con apoyo en cojín",
    "Fondos con cambio de agarre|Flexiones en paralelas con pausa",
  ],
  espalda: [
    "Remo con barra agarre supino|Face pull sentado en polea",
    "Remo con banda sentado|Remo con mochila en banco",
    "Dominadas en L|Remo invertido en anillas bajo",
  ],
  pierna: [
    "Sentadilla hack inversa|Extensión de cadera en máquina",
    "Sentadilla copa con mochila|Zancada alterna con salto",
    "Sentadilla con salto en escalón|Sprints en cuesta",
  ],
  hombro: [
    "Elevaciones laterales con banda|Press militar con mancuernas de pie",
    "Press Arnold con garrafas|Elevaciones posteriores con banda",
    "Pike push-up con pausa|Handstand shoulder tap",
  ],
  brazo: [
    "Curl alterno sentado|Press francés en polea",
    "Curl concentrado con garrafa|Extensión tras nuca con garrafa",
    "Dominadas supinas con pausa|Curl isométrico en barra",
  ],
  core: [
    "Plancha en máquina Smith|Abdominal en polea alta",
    "Plancha reptante|Crunch con piernas elevadas",
    "Rodillas al pecho en barra|Plancha con anillas inestables",
  ],
  glúteo: [
    "Peso muerto rumano con mancuernas|Hip thrust con banda",
    "Hip thrust a una pierna en suelo|Sentadilla sumo con salto",
    "Zancada reversa con salto|Step up con rodilla alta",
  ],
  cardio: [
    "Remo en máquina a ritmo|Jumping jacks con comba",
    "Escalador lateral|Salto de patinador",
    "Circuito de sprints|Trote ligero 20 min",
  ],
};
for (const k in X4) {
  ["gym", "home", "park"].forEach((e, i) =>
    G[k][e].push(...X4[k][i].split("|")),
  );
}
const X5 = {
  pecho: [
    "Press en banco con agarre ancho|Aperturas en banco inclinado con polea",
    "Flexiones con toalla|Flexiones con pausa abajo",
    "Fondos explosivos|Flexiones en anillas inestables",
  ],
  espalda: [
    "Remo en polea alta|Jalón tras nuca ligero",
    "Remo a una mano con mochila apoyada|Superman con remo",
    "Dominadas con agarre ancho lento|Remo invertido a una mano",
  ],
  pierna: [
    "Sentadilla con mancuernas|Zancada en Smith",
    "Sentadilla con pausa de 3 s|Zancada lateral con mochila",
    "Sentadilla en banco a una pierna|Zancada saltando alterna",
  ],
  hombro: [
    "Elevaciones laterales con pausa|Press Arnold de pie",
    "Elevaciones laterales lentas|Press con banda",
    "Handstand con apoyo|Fondos en paralelas inclinado",
  ],
  brazo: [
    "Curl 21|Press francés tumbado",
    "Curl con toalla y resistencia|Fondos en silla lentos",
    "Dominadas supinas lentas|Fondos en banco con pies elevados",
  ],
  core: [
    "Plancha con arrastre|Elevación de piernas en paralelas",
    "Plancha con elevación de brazo|Abdominal con pausa",
    "Plancha lateral en barra|Elevación de rodillas colgado",
  ],
  glúteo: [
    "Hip thrust con pausa|Sentadilla goblet con pausa",
    "Puente de glúteo con mochila|Patada de glúteo a cuatro apoyos",
    "Sentadilla sumo con salto|Zancada reversa en banco",
  ],
  cardio: [
    "Remo 2000 m|Intervalos en elíptica",
    "Skipping rápido|Shuffle lateral",
    "Carrera por cuestas|Intervalos 200 m",
  ],
};
for (const k in X5) {
  ["gym", "home", "park"].forEach((e, i) =>
    G[k][e].push(...X5[k][i].split("|")),
  );
}
const GI = {};
for (const k in G)
  for (const e of ["gym", "home", "park"])
    G[k][e].forEach((n) => (GI[n] = GI[n] || k));
const STY = {
  fb: [
    ["pecho", "espalda", "pierna", "hombro", "core"],
    ["espalda", "pecho", "pierna", "brazo", "core"],
    ["pierna", "hombro", "pecho", "espalda", "core"],
  ],
  ul: [
    ["pecho", "espalda", "hombro", "brazo"],
    ["pierna", "glúteo", "core"],
  ],
  ppl: [
    ["pecho", "hombro", "brazo"],
    ["espalda", "brazo", "core"],
    ["pierna", "glúteo", "core"],
  ],
  bro: [
    ["pecho"],
    ["espalda"],
    ["pierna"],
    ["hombro"],
    ["brazo", "core"],
    ["glúteo", "cardio"],
  ],
  glu: [
    ["glúteo", "pierna"],
    ["espalda", "hombro"],
    ["glúteo", "core"],
    ["pierna", "glúteo"],
    ["pecho", "brazo"],
    ["cardio", "core"],
  ],
  def: [
    ["pierna", "cardio"],
    ["pecho", "espalda", "cardio"],
    ["core", "cardio"],
    ["hombro", "brazo", "cardio"],
    ["glúteo", "pierna", "cardio"],
    ["cardio", "core"],
  ],
};
Object.assign(STY, {
  pplul: [
    ["pecho", "hombro", "brazo"],
    ["espalda", "brazo", "core"],
    ["pierna", "glúteo"],
    ["pecho", "espalda", "hombro", "brazo"],
    ["pierna", "glúteo", "core"],
  ],
  sal: [
    ["pierna", "pecho", "espalda", "core"],
    ["cardio", "core", "hombro"],
    ["glúteo", "espalda", "brazo", "cardio"],
  ],
  arn: [
    ["pecho", "espalda"],
    ["hombro", "brazo"],
    ["pierna", "glúteo"],
  ],
  sup: [
    ["pecho", "espalda", "hombro"],
    ["brazo", "core", "pecho"],
    ["espalda", "hombro", "brazo"],
    ["pierna", "core"],
  ],
  inf: [
    ["pierna", "glúteo"],
    ["pecho", "espalda"],
    ["pierna", "core"],
    ["glúteo", "pierna", "cardio"],
    ["hombro", "brazo"],
  ],
  cal: [
    ["pecho", "espalda", "core"],
    ["pierna", "hombro", "brazo"],
    ["espalda", "pecho", "core"],
  ],
  hiit: [
    ["cardio", "core"],
    ["pierna", "cardio"],
    ["cardio", "hombro", "pecho"],
  ],
});
const SP = {
  2: [
    ["pecho", "espalda", "pierna", "core"],
    ["hombro", "brazo", "pierna", "core"],
  ],
  3: [
    ["pecho", "espalda", "pierna"],
    ["hombro", "brazo", "core", "pierna"],
    ["espalda", "pecho", "pierna", "core"],
  ],
  4: [
    ["pecho", "espalda"],
    ["pierna", "core"],
    ["hombro", "brazo"],
    ["pierna", "espalda", "pecho"],
  ],
  5: [
    ["pecho", "hombro"],
    ["espalda", "brazo"],
    ["pierna", "core"],
    ["pecho", "espalda"],
    ["pierna", "hombro", "brazo"],
  ],
  6: [
    ["pecho", "brazo"],
    ["espalda", "core"],
    ["pierna"],
    ["hombro", "brazo"],
    ["pecho", "espalda"],
    ["pierna", "core"],
  ],
};
const SR = {
  grasa: [3, "12-15"],
  musculo: [4, "8-12"],
  fuerza: [5, "3-5"],
  mantener: [3, "10-12"],
};
const GN = {
  grasa: "Perder grasa",
  musculo: "Ganar músculo",
  fuerza: "Ganar fuerza",
  mantener: "Mantenerme",
};
const ING = {
  avena: 370,
  leche: 48,
  plátano: 90,
  huevo: 145,
  claras: 50,
  "pan integral": 250,
  "yogur griego": 100,
  nueces: 650,
  fruta: 55,
  aguacate: 160,
  tomate: 20,
  chía: 490,
  "bebida de avena": 45,
  "tortita de arroz": 380,
  pavo: 110,
  "queso fresco": 90,
  pollo: 120,
  arroz: 360,
  brócoli: 35,
  "pasta integral": 350,
  atún: 130,
  ternera: 150,
  patata: 77,
  ensalada: 15,
  lentejas: 350,
  zanahoria: 40,
  espinacas: 25,
  salmón: 200,
  quinoa: 370,
  espárragos: 20,
  boniato: 86,
  "judías verdes": 31,
  garbanzos: 340,
  merluza: 80,
  calabaza: 26,
  wrap: 310,
  gambas: 85,
  champiñón: 22,
  tofu: 120,
  maíz: 85,
  manzana: 52,
  almendras: 600,
  requesón: 100,
  miel: 300,
  "crema de cacahuete": 600,
  hummus: 230,
  "proteína en polvo": 380,
  "aceite de oliva": 880,
};
const MR = {
  d: [
    "Avena con plátano y leche;gluten,lactosa;avena:60,leche:250,plátano:100",
    "Tortilla de claras y tostada integral;huevo,gluten;huevo:60,claras:150,pan integral:60,aceite de oliva:5",
    "Yogur griego con fruta y nueces;lactosa,frutos secos;yogur griego:250,fruta:150,nueces:20",
    "Tostada de aguacate y huevo;gluten,huevo;pan integral:70,aguacate:60,huevo:60,tomate:50",
    "Bowl de avena, chía y fruta (vegetal);gluten;avena:50,bebida de avena:250,chía:10,fruta:150",
    "Tortitas de arroz con pavo y queso fresco;lactosa;tortita de arroz:40,pavo:60,queso fresco:80,fruta:100",
  ],
  c: [
    "Pollo con arroz y brócoli;;pollo:180,arroz:80,brócoli:150,aceite de oliva:10",
    "Pasta integral con atún y tomate;gluten,pescado;pasta integral:90,atún:100,tomate:150,aceite de oliva:10",
    "Ternera con patata y ensalada;;ternera:180,patata:250,ensalada:100,aceite de oliva:10",
    "Lentejas con verduras;;lentejas:90,zanahoria:80,espinacas:100,aceite de oliva:10",
    "Salmón con quinoa y espárragos;pescado;salmón:160,quinoa:80,espárragos:150,aceite de oliva:5",
    "Pavo con boniato y judías verdes;;pavo:180,boniato:250,judías verdes:150,aceite de oliva:10",
    "Garbanzos con espinacas y arroz;;garbanzos:90,espinacas:150,arroz:50,aceite de oliva:10",
  ],
  n: [
    "Tortilla francesa con ensalada;huevo,gluten;huevo:180,ensalada:150,pan integral:40,aceite de oliva:10",
    "Merluza al horno con verduras;pescado;merluza:220,patata:150,calabaza:150,aceite de oliva:10",
    "Wrap de pollo y verduras;gluten;wrap:70,pollo:120,ensalada:100,tomate:80",
    "Crema de calabaza con pollo;;calabaza:300,pollo:150,patata:100,aceite de oliva:5",
    "Revuelto de gambas y champiñón;huevo,marisco;gambas:150,huevo:120,champiñón:150,aceite de oliva:10",
    "Tofu salteado con arroz;soja;tofu:200,arroz:70,brócoli:150,aceite de oliva:10",
    "Ensalada de atún, huevo y maíz;pescado,huevo;atún:100,huevo:120,maíz:80,ensalada:150,aceite de oliva:10",
  ],
  s: [
    "Manzana con almendras;frutos secos;manzana:180,almendras:25",
    "Requesón con miel;lactosa;requesón:200,miel:15",
    "Tortitas de arroz con pavo;;tortita de arroz:30,pavo:60",
    "Plátano con crema de cacahuete;frutos secos;plátano:120,crema de cacahuete:20",
    "Hummus con zanahoria;;hummus:80,zanahoria:150",
    "Batido de proteína con leche;lactosa;proteína en polvo:30,leche:250",
  ],
};
Object.assign(ING, {
  "cerdo magro": 140,
  cuscús: 360,
  calabacín: 17,
  bacalao: 82,
  "judías blancas": 340,
  pimiento: 25,
  cebolla: 40,
  "salsa de tomate": 40,
  "ternera picada": 180,
  mejillones: 85,
  edamame: 120,
  sardinas: 180,
  berenjena: 25,
  pulpo: 80,
  "mozzarella light": 170,
  caballa: 200,
  sepia: 80,
  guisantes: 80,
  pepino: 15,
  kéfir: 55,
  "queso cottage": 90,
  arándanos: 45,
  fresas: 32,
  granola: 450,
  "mantequilla de almendra": 610,
  "pan de centeno": 230,
  "jamón serrano": 200,
});
MR.d.push(
  "Porridge de avena con arándanos y almendra;gluten,lactosa,frutos secos;avena:50,leche:250,arándanos:80,mantequilla de almendra:15",
  "Queso cottage con fresas y granola;lactosa,gluten,frutos secos;queso cottage:200,fresas:150,granola:30",
  "Kéfir con plátano y avena;lactosa,gluten;kéfir:250,plátano:100,avena:40",
  "Tostada de centeno con jamón y tomate;gluten;pan de centeno:80,jamón serrano:40,tomate:80,aceite de oliva:5",
  "Huevos revueltos con espinacas;huevo,gluten;huevo:180,espinacas:80,pan integral:50,aceite de oliva:5",
  "Tortitas de avena y plátano;gluten,huevo;avena:60,plátano:120,huevo:60,miel:10",
);
MR.c.push(
  "Cerdo magro con cuscús y calabacín;gluten;cerdo magro:170,cuscús:80,calabacín:150,aceite de oliva:10",
  "Bacalao con judías blancas y pimiento;pescado;bacalao:200,judías blancas:80,pimiento:100,aceite de oliva:10",
  "Pollo guisado con tomate y arroz;;pollo:180,arroz:80,cebolla:80,salsa de tomate:80,aceite de oliva:10",
  "Boloñesa de ternera con pasta integral;gluten;ternera picada:150,pasta integral:90,salsa de tomate:120,cebolla:50",
  "Mejillones con patata y ensalada;marisco;mejillones:250,patata:250,ensalada:100,aceite de oliva:10",
  "Edamame, quinoa y verduras salteadas;soja;edamame:120,quinoa:80,pimiento:100,calabacín:100,aceite de oliva:10",
  "Sardinas con boniato y pepino;pescado;sardinas:150,boniato:250,pepino:100,aceite de oliva:5",
);
MR.n.push(
  "Berenjena rellena de pavo;;berenjena:300,pavo:150,cebolla:50,salsa de tomate:60",
  "Pulpo con patata y pimiento;marisco;pulpo:200,patata:200,pimiento:80,aceite de oliva:10",
  "Pizza fit con wrap, mozzarella y pavo;gluten,lactosa;wrap:80,mozzarella light:60,pavo:60,salsa de tomate:60",
  "Caballa con ensalada y pan de centeno;pescado,gluten;caballa:150,ensalada:150,pan de centeno:50,tomate:80",
  "Sepia a la plancha con guisantes;marisco;sepia:220,guisantes:150,patata:100,aceite de oliva:10",
  "Pechuga rellena de espinacas y queso;lactosa;pollo:200,espinacas:100,queso fresco:50,calabacín:150",
  "Hamburguesa de ternera con ensalada;gluten;ternera picada:150,ensalada:150,pan integral:50,tomate:50",
);
MR.s.push(
  "Kéfir con fresas;lactosa;kéfir:200,fresas:150",
  "Edamame;soja;edamame:150",
  "Pan de centeno con jamón;gluten;pan de centeno:50,jamón serrano:30",
  "Queso cottage con arándanos;lactosa;queso cottage:150,arándanos:80",
  "Yogur griego con miel y nueces;lactosa,frutos secos;yogur griego:170,miel:10,nueces:15",
  "Tortita de arroz con crema de almendra;frutos secos;tortita de arroz:30,mantequilla de almendra:15",
);
Object.assign(ING, {
  tempeh: 190,
  coliflor: 25,
  remolacha: 43,
  dátiles: 280,
  "cacao puro": 350,
  aceitunas: 150,
  "semillas de calabaza": 560,
});
MR.d.push(
  "Bowl de avena, cacao y plátano;gluten,frutos secos;avena:60,bebida de avena:250,plátano:100,cacao puro:8,crema de cacahuete:15",
  "Tostada de hummus y tomate;gluten;pan integral:70,hummus:50,tomate:80,semillas de calabaza:10",
  "Yogur con avena y dátiles;lactosa,gluten;yogur griego:200,avena:40,dátiles:30",
  "Tofu revuelto con espinacas y pan;soja,gluten;tofu:180,espinacas:80,pan integral:60,aceite de oliva:5",
  "Smoothie bowl de fresas y arándanos;gluten,frutos secos;fresas:150,arándanos:80,plátano:100,bebida de avena:150,granola:30",
);
MR.c.push(
  "Tempeh salteado con arroz y brócoli;soja;tempeh:150,arroz:80,brócoli:150,aceite de oliva:10",
  "Curry de garbanzos y coliflor;;garbanzos:90,coliflor:150,salsa de tomate:80,cebolla:50,arroz:50,aceite de oliva:10",
  "Pollo con quinoa y remolacha;;pollo:180,quinoa:80,remolacha:150,aceite de oliva:10",
  "Lentejas estofadas con arroz;;lentejas:90,arroz:40,zanahoria:80,cebolla:50,aceite de oliva:10",
  "Atún con pasta, aceitunas y tomate;gluten,pescado;atún:100,pasta integral:90,aceitunas:20,tomate:120",
  "Merluza con cuscús y pimiento;gluten,pescado;merluza:200,cuscús:80,pimiento:100,aceite de oliva:10",
);
MR.n.push(
  "Crema de coliflor con tofu a la plancha;soja;coliflor:300,tofu:150,patata:100,aceite de oliva:5",
  "Tempeh con calabacín y boniato;soja;tempeh:150,calabacín:200,boniato:200,aceite de oliva:5",
  "Ensalada de lentejas, remolacha y huevo;huevo;lentejas:70,remolacha:100,huevo:60,ensalada:100,aceite de oliva:10",
  "Pollo con champiñones y puré de patata;lactosa;pollo:180,champiñón:150,patata:200,leche:50",
  "Tortilla de calabacín y cebolla;huevo;huevo:180,calabacín:150,cebolla:50,aceite de oliva:10",
  "Salmón al horno con coliflor;pescado;salmón:150,coliflor:200,patata:100,aceite de oliva:5",
);
MR.s.push(
  "Dátiles con crema de cacahuete;frutos secos;dátiles:30,crema de cacahuete:15",
  "Tostada de aguacate;gluten;pan integral:40,aguacate:50",
  "Remolacha con hummus;;remolacha:100,hummus:60",
  "Aceitunas y zanahoria;;aceitunas:30,zanahoria:100",
  "Pavo y queso fresco en tortita;lactosa;pavo:50,queso fresco:50,tortita de arroz:20",
  "Fruta con semillas de calabaza;;fruta:200,semillas de calabaza:15",
);
Object.assign(ING, {
  lubina: 97,
  dorada: 100,
  "pasta de legumbres": 330,
  "tortilla de maíz": 330,
  "pavo picado": 120,
});
MR.d.push(
  "Tortilla de avena con fresas;gluten,huevo;avena:50,huevo:60,claras:100,fresas:120",
  "Tostada de queso fresco y fresas;gluten,lactosa;pan integral:70,queso fresco:80,fresas:100,miel:8",
  "Gachas de quinoa con manzana;gluten;quinoa:50,bebida de avena:250,manzana:100,miel:10",
);
MR.c.push(
  "Lubina al horno con patata y verduras;pescado;lubina:200,patata:200,calabacín:100,aceite de oliva:10",
  "Pasta de legumbres con pollo y brócoli;;pasta de legumbres:90,pollo:150,brócoli:150,aceite de oliva:10",
  "Tacos de pavo con maíz y aguacate;;tortilla de maíz:80,pavo picado:150,aguacate:50,tomate:80,maíz:50",
);
MR.n.push(
  "Dorada con ensalada y boniato;pescado;dorada:200,ensalada:150,boniato:150,aceite de oliva:10",
  "Revuelto de champiñón y espinacas con pan;huevo,gluten;huevo:180,champiñón:120,espinacas:80,pan integral:40,aceite de oliva:5",
  "Crema de calabacín con tofu;soja;calabacín:300,tofu:150,patata:80,aceite de oliva:5",
);
MR.s.push(
  "Yogur griego con cacao y plátano;lactosa;yogur griego:170,cacao puro:5,plátano:80",
  "Manzana con crema de cacahuete;frutos secos;manzana:180,crema de cacahuete:15",
  "Hummus con tortita de arroz;;hummus:60,tortita de arroz:30",
);
MR.r = [
  "Yogur griego natural;lactosa;yogur griego:200,miel:5",
  "Queso cottage con fruta;lactosa;queso cottage:150,fruta:100",
  "Tortilla de claras con tomate;huevo;claras:200,tomate:60,aceite de oliva:5",
  "Kéfir con arándanos;lactosa;kéfir:200,arándanos:60",
  "Tofu a la plancha con pepino;soja;tofu:120,pepino:100",
  "Batido de proteína con leche;lactosa;proteína en polvo:30,leche:200",
  "Requesón con nueces;lactosa,frutos secos;requesón:150,nueces:10",
  "Hummus con pepino;;hummus:60,pepino:150",
  "Pavo con tomate;;pavo:80,tomate:100",
];
MR.d.push(
  "Tortilla de espinacas y queso fresco;huevo,lactosa;huevo:180,espinacas:80,queso fresco:50,aceite de oliva:5",
  "Yogur griego con nueces y arándanos;lactosa,frutos secos;yogur griego:250,nueces:20,arándanos:60",
  "Huevos revueltos con aguacate;huevo;huevo:180,aguacate:80,tomate:60,aceite de oliva:5",
  "Pudin de chía con leche y fresas;lactosa;chía:30,leche:200,fresas:100,miel:5",
);
MR.c.push(
  "Ensalada de pollo, aguacate y huevo;huevo;pollo:160,aguacate:80,huevo:60,ensalada:150,tomate:80,aceite de oliva:10",
  "Ternera salteada con brócoli y champiñón;;ternera:170,brócoli:150,champiñón:100,aceite de oliva:10",
  "Salmón al horno con espárragos y aguacate;pescado;salmón:170,espárragos:150,aguacate:60,aceite de oliva:5",
  "Pollo mediterráneo con garbanzos y pimiento;;pollo:160,garbanzos:70,pimiento:100,cebolla:50,aceite de oliva:10",
  "Bacalao con coliflor y aceitunas;pescado;bacalao:200,coliflor:200,aceitunas:20,aceite de oliva:10",
);
MR.n.push(
  "Calabacín relleno de pollo y queso;lactosa;calabacín:300,pollo:150,mozzarella light:50,salsa de tomate:50",
  "Huevos al plato con champiñón;huevo;huevo:180,champiñón:150,salsa de tomate:80,aceite de oliva:5",
  "Ensalada de atún, aguacate y tomate;pescado;atún:100,aguacate:60,tomate:120,ensalada:100,aceite de oliva:10",
  "Pavo con coliflor gratinada;lactosa;pavo:170,coliflor:250,queso fresco:50",
  "Dorada con verduras al horno;pescado;dorada:200,calabacín:150,pimiento:100,cebolla:50,aceite de oliva:10",
);
MR.s.push(
  "Pepino con atún;pescado;pepino:150,atún:60",
  "Huevo cocido y tomate;huevo;huevo:120,tomate:100",
  "Aguacate con tomate;;aguacate:80,tomate:60",
  "Queso fresco con nueces;lactosa,frutos secos;queso fresco:100,nueces:15",
);

// ───── Recetas nuevas (FORJA 3) ─────
MR.d.push(
  "Overnight oats de cacao y plátano;gluten,lactosa;avena:60,leche:200,cacao puro:8,plátano:100,chía:10",
  "Tostada de salmón ahumado y aguacate;gluten,pescado;pan integral:70,salmón:60,aguacate:50,tomate:40",
  "Shakshuka con pan integral;huevo,gluten;huevo:120,salsa de tomate:200,pimiento:80,cebolla:50,pan integral:50,aceite de oliva:5",
  "Tortitas de proteína con arándanos;gluten,lactosa,huevo;avena:50,proteína en polvo:30,claras:100,arándanos:80",
  "Tostada de crema de cacahuete y plátano;gluten,frutos secos;pan integral:60,crema de cacahuete:20,plátano:80",
);
MR.c.push(
  "Paella de pollo y verduras;;arroz:80,pollo:150,judías verdes:80,pimiento:60,salsa de tomate:40,aceite de oliva:10",
  "Fajitas de pollo;gluten;wrap:80,pollo:160,pimiento:120,cebolla:60,aceite de oliva:5",
  "Poke bowl de salmón;pescado,soja;arroz:70,salmón:130,aguacate:50,edamame:50,pepino:80,salsa de soja:10",
  "Pasta con pollo al pesto;gluten,lactosa,frutos secos;pasta integral:90,pollo:140,queso parmesano:15,nueces:10,espinacas:60,aceite de oliva:8",
  "Arroz con pollo al curry;;arroz:80,pollo:160,leche de coco light:80,cebolla:60,pimiento:60",
  "Garbanzos con bacalao y espinacas;pescado;garbanzos:80,bacalao:150,espinacas:120,aceite de oliva:10",
  "Albóndigas de pavo en salsa de tomate;;pavo picado:170,salsa de tomate:150,arroz:70,cebolla:40",
  "Burrito bowl de ternera;;arroz:70,ternera picada:140,judías blancas:40,maíz:60,tomate:80,aguacate:40",
  "Pad thai de gambas;marisco,huevo,frutos secos,soja;fideos de arroz:80,gambas:150,huevo:60,cebolla:40,salsa de soja:15,almendras:10",
  "Lentejas a la riojana fit;;lentejas:90,pimiento:60,cebolla:50,zanahoria:60,jamón serrano:20,aceite de oliva:8",
  "Bowl de quinoa y garbanzos asados;;quinoa:70,garbanzos:70,pimiento:80,pepino:80,aceite de oliva:8",
);
MR.n.push(
  "Ensalada César con pollo;gluten,lactosa;pollo:150,ensalada:150,queso parmesano:15,pan integral:30,yogur griego:40",
  "Tortilla de patatas fit;huevo;huevo:180,patata:200,cebolla:50,aceite de oliva:10",
  "Pisto con huevo;huevo;calabacín:150,pimiento:100,berenjena:100,salsa de tomate:100,huevo:120,aceite de oliva:8",
  "Salmón al papillote con verduras;pescado;salmón:150,calabacín:150,zanahoria:80,cebolla:40",
  "Hamburguesa de pollo en pan integral;gluten,lactosa;pollo:150,pan integral:70,tomate:60,ensalada:50,queso fresco:30",
  "Sopa de pollo con fideos;gluten;pollo:130,pasta integral:40,zanahoria:80,cebolla:40",
  "Revuelto de tofu y verduras;soja;tofu:200,pimiento:80,espinacas:80,cebolla:40,aceite de oliva:5",
  "Tacos veganos de lentejas;;tortilla de maíz:80,lentejas:70,aguacate:50,tomate:60",
);
MR.s.push(
  "Skyr con frutos rojos;lactosa;yogur griego:200,arándanos:60,fresas:60",
  "Barritas caseras de avena y dátiles;gluten,frutos secos;avena:40,dátiles:30,almendras:15",
  "Batido verde de proteína;lactosa;proteína en polvo:30,espinacas:40,plátano:100,leche:200",
  "Sándwich de pavo y queso fresco;gluten,lactosa;pan integral:60,pavo:60,queso fresco:40,tomate:40",
);
const MEAT = [
    "pollo",
    "ternera",
    "pavo",
    "cerdo magro",
    "ternera picada",
    "jamón serrano",
    "atún",
    "salmón",
    "merluza",
    "bacalao",
    "sardinas",
    "caballa",
    "gambas",
    "mejillones",
    "pulpo",
    "sepia",
  ],
  ANI = [
    "leche",
    "huevo",
    "claras",
    "yogur griego",
    "queso fresco",
    "requesón",
    "miel",
    "kéfir",
    "queso cottage",
    "mozzarella light",
    "proteína en polvo",
    "queso parmesano",
  ];
const MEALS = Object.fromEntries(
  Object.entries(MR).map(([k, a]) => [
    k,
    a.map((s) => {
      const [n, al, it] = s.split(";");
      return {
        n,
        al: al ? al.split(",") : [],
        it: it.split(",").map((x) => {
          const [a, g] = x.split(":");
          return [a, +g];
        }),
      };
    }),
  ]),
);
const MT = {
    d: ["Desayuno", "🌅", 0.22],
    m: ["Media mañana", "🍎", 0.08],
    c: ["Comida", "🍽", 0.3],
    s: ["Merienda", "🥪", 0.1],
    n: ["Cena", "🌙", 0.24],
    r: ["Recena", "🌜", 0.06],
  },
  MS = {
    grasa: ["d", "c", "s", "n"],
    musculo: ["d", "m", "c", "s", "n", "r"],
    fuerza: ["d", "m", "c", "s", "n"],
    mantener: ["d", "c", "s", "n"],
  },
  act = () => (U.p.dt == "ayuno" ? ["c", "s", "n"] : MS[U.p.goal]),
  sh = (t) => MT[t][2] / act().reduce((x, y) => x + MT[y][2], 0),
  DN = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

