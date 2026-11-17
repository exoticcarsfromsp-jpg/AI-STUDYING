// Rutinas: cada día es una lista de [idEjercicio, 'series×reps']
export const RUTINAS = [
  { id: 'fullbody-principiante', nombre: 'Full Body Principiante', nivel: 'Principiante', diasSemana: 3, objetivo: 'Base y técnica', duracion: '45 min', color: '#35c06a',
    desc: 'Tres días no consecutivos trabajando todo el cuerpo. Ideal para tus primeros 3–6 meses.',
    dias: [
      { nombre: 'Día A', ej: [['sentadilla', '3×8'], ['press-banca', '3×8'], ['remo-barra', '3×8'], ['elevaciones-laterales', '2×15'], ['plancha', '3×30 s']] },
      { nombre: 'Día B', ej: [['peso-muerto-rumano', '3×10'], ['press-militar', '3×8'], ['jalon', '3×10'], ['curl-mancuernas', '2×12'], ['crunch', '3×20']] },
      { nombre: 'Día C', ej: [['goblet', '3×12'], ['press-mancuernas', '3×10'], ['remo-mancuerna', '3×10'], ['hip-thrust', '3×10'], ['extension-polea', '2×12']] },
    ] },
  { id: 'fuerza-5x5', nombre: 'Fuerza 5×5', nivel: 'Intermedio', diasSemana: 3, objetivo: 'Fuerza máxima', duracion: '60 min', color: '#d8394b',
    desc: 'Básicos pesados alternando A/B. Sube 2,5 kg cada vez que completes las 5×5.',
    dias: [
      { nombre: 'Entreno A', ej: [['sentadilla', '5×5'], ['press-banca', '5×5'], ['remo-barra', '5×5']] },
      { nombre: 'Entreno B', ej: [['sentadilla', '5×5'], ['press-militar', '5×5'], ['peso-muerto', '1×5']] },
    ] },
  { id: 'torso-pierna', nombre: 'Torso / Pierna', nivel: 'Intermedio', diasSemana: 4, objetivo: 'Hipertrofia + fuerza', duracion: '60–70 min', color: '#2457d6',
    desc: 'Cuatro días: dos de torso y dos de pierna, uno de fuerza y uno de volumen.',
    dias: [
      { nombre: 'Torso Fuerza', ej: [['press-banca', '4×5'], ['remo-barra', '4×6'], ['press-militar', '3×6'], ['dominadas', '3×6'], ['press-frances', '3×10'], ['curl-barra', '3×10']] },
      { nombre: 'Pierna Fuerza', ej: [['sentadilla', '4×5'], ['peso-muerto-rumano', '3×8'], ['prensa', '3×10'], ['curl-femoral', '3×12'], ['gemelos-pie', '4×12']] },
      { nombre: 'Torso Volumen', ej: [['press-inclinado', '4×10'], ['remo-polea', '4×12'], ['press-mancuernas', '3×12'], ['jalon', '3×12'], ['elevaciones-laterales', '4×15'], ['extension-polea', '3×15'], ['curl-martillo', '3×12']] },
      { nombre: 'Pierna Volumen', ej: [['bulgara', '3×10'], ['hip-thrust', '4×10'], ['extension-cuadriceps', '3×15'], ['curl-femoral', '3×15'], ['gemelos-pie', '4×15'], ['elevacion-piernas', '3×12']] },
    ] },
  { id: 'ppl', nombre: 'Push / Pull / Legs', nivel: 'Intermedio', diasSemana: 6, objetivo: 'Hipertrofia', duracion: '60–75 min', color: '#8a6cf0',
    desc: 'Empuje, tirón y pierna dos veces por semana. Mucho volumen para crecer.',
    dias: [
      { nombre: 'Push', ej: [['press-banca', '4×6-8'], ['press-militar', '3×8'], ['press-inclinado', '3×10'], ['elevaciones-laterales', '4×15'], ['cruces-polea', '3×15'], ['extension-polea', '3×12']] },
      { nombre: 'Pull', ej: [['dominadas', '4×8'], ['remo-barra', '4×8'], ['remo-polea', '3×12'], ['face-pull', '3×15'], ['curl-barra', '3×10'], ['curl-martillo', '3×12']] },
      { nombre: 'Legs', ej: [['sentadilla', '4×6-8'], ['peso-muerto-rumano', '3×10'], ['prensa', '3×12'], ['curl-femoral', '3×12'], ['gemelos-pie', '4×15'], ['crunch', '3×20']] },
    ] },
  { id: 'arnold', nombre: 'Arnold Split', nivel: 'Avanzado', diasSemana: 6, objetivo: 'Hipertrofia', duracion: '75 min', color: '#e6bf2e',
    desc: 'Pecho+espalda, hombros+brazos y pierna, dos veces por semana. Clásico de la época dorada.',
    dias: [
      { nombre: 'Pecho y Espalda', ej: [['press-banca', '4×8'], ['dominadas', '4×8'], ['press-inclinado', '3×10'], ['remo-barra', '3×10'], ['aperturas', '3×12'], ['jalon', '3×12']] },
      { nombre: 'Hombros y Brazos', ej: [['press-arnold', '4×10'], ['elevaciones-laterales', '4×15'], ['pajaros', '3×15'], ['curl-barra', '4×10'], ['press-frances', '4×10'], ['curl-predicador', '3×12'], ['extension-polea', '3×12']] },
      { nombre: 'Pierna', ej: [['sentadilla', '4×8'], ['prensa', '3×12'], ['peso-muerto-rumano', '3×10'], ['extension-cuadriceps', '3×15'], ['curl-femoral', '3×15'], ['gemelos-pie', '5×12']] },
    ] },
  { id: 'weider', nombre: 'Weider (Bro Split)', nivel: 'Intermedio', diasSemana: 5, objetivo: 'Hipertrofia', duracion: '60 min', color: '#ff7a3d',
    desc: 'Un grupo muscular por día con mucho volumen.',
    dias: [
      { nombre: 'Pecho', ej: [['press-banca', '4×8'], ['press-inclinado', '4×10'], ['press-mancuernas', '3×10'], ['aperturas', '3×12'], ['fondos', '3×10']] },
      { nombre: 'Espalda', ej: [['peso-muerto', '3×5'], ['dominadas', '4×8'], ['remo-barra', '4×8'], ['remo-mancuerna', '3×10'], ['jalon', '3×12']] },
      { nombre: 'Hombros', ej: [['press-militar', '4×8'], ['elevaciones-laterales', '5×15'], ['face-pull', '3×15'], ['pajaros', '3×15'], ['encogimientos', '4×12']] },
      { nombre: 'Pierna', ej: [['sentadilla', '4×8'], ['prensa', '4×12'], ['bulgara', '3×10'], ['curl-femoral', '4×12'], ['gemelos-pie', '5×15']] },
      { nombre: 'Brazos', ej: [['curl-barra', '4×10'], ['press-cerrado', '4×8'], ['curl-martillo', '3×12'], ['press-frances', '3×10'], ['curl-predicador', '3×12'], ['extension-polea', '3×15']] },
    ] },
  { id: 'gluteo-pierna', nombre: 'Glúteo y Pierna Focus', nivel: 'Intermedio', diasSemana: 4, objetivo: 'Glúteos y piernas', duracion: '60 min', color: '#e8336d',
    desc: 'Prioriza glúteos e isquios con dos días de pierna y dos de torso de mantenimiento.',
    dias: [
      { nombre: 'Glúteo A', ej: [['hip-thrust', '4×8-10'], ['bulgara', '3×10'], ['peso-muerto-rumano', '3×10'], ['patada-gluteo', '3×15'], ['aductores-maquina', '3×15']] },
      { nombre: 'Torso A', ej: [['jalon', '3×10'], ['press-mancuernas', '3×10'], ['remo-polea', '3×12'], ['elevaciones-laterales', '3×15'], ['plancha', '3×45 s']] },
      { nombre: 'Glúteo B', ej: [['sentadilla', '4×8'], ['hip-thrust', '3×12'], ['zancadas', '3×12'], ['curl-femoral', '3×12'], ['swing', '3×15']] },
      { nombre: 'Torso B', ej: [['dominadas', '3×AMRAP'], ['press-arnold', '3×10'], ['remo-mancuerna', '3×10'], ['face-pull', '3×15'], ['russian-twist', '3×20']] },
    ] },
  { id: 'casa-mancuernas', nombre: 'En Casa con Mancuernas', nivel: 'Principiante', diasSemana: 3, objetivo: 'Entrenar sin gimnasio', duracion: '40 min', color: '#29c7c7',
    desc: 'Solo necesitas un par de mancuernas ajustables y, si puedes, un banco.',
    dias: [
      { nombre: 'Día 1', ej: [['goblet', '4×12'], ['press-mancuernas', '4×10'], ['remo-mancuerna', '4×10'], ['elevaciones-laterales', '3×15'], ['crunch', '3×20']] },
      { nombre: 'Día 2', ej: [['zancadas', '3×12'], ['flexiones', '3×AMRAP'], ['press-arnold', '3×10'], ['curl-mancuernas', '3×12'], ['plancha', '3×45 s']] },
      { nombre: 'Día 3', ej: [['bulgara', '3×10'], ['aperturas', '3×12'], ['pajaros', '3×15'], ['curl-martillo', '3×12'], ['russian-twist', '3×20']] },
    ] },
  { id: 'calistenia', nombre: 'Calistenia', nivel: 'Intermedio', diasSemana: 3, objetivo: 'Fuerza relativa', duracion: '45 min', color: '#9fc4c2',
    desc: 'Solo peso corporal y una barra. Progresa añadiendo repeticiones y luego lastre.',
    dias: [
      { nombre: 'Empuje + Core', ej: [['fondos', '4×AMRAP'], ['flexiones', '4×AMRAP'], ['plancha', '3×60 s'], ['rueda', '3×10']] },
      { nombre: 'Tirón + Core', ej: [['dominadas', '5×AMRAP'], ['elevacion-piernas', '4×10'], ['russian-twist', '3×20']] },
      { nombre: 'Pierna', ej: [['bulgara', '4×12'], ['zancadas', '3×15'], ['hiperextensiones', '3×15'], ['gemelos-pie', '4×20']] },
    ] },
  { id: 'express', nombre: 'Express 30 min', nivel: 'Todos', diasSemana: 3, objetivo: 'Poco tiempo', duracion: '30 min', color: '#b0703a',
    desc: 'Superseries para entrenar todo el cuerpo en media hora.',
    dias: [
      { nombre: 'Express A', ej: [['sentadilla', '3×8'], ['dominadas', '3×AMRAP'], ['press-mancuernas', '3×10'], ['swing', '3×15']] },
      { nombre: 'Express B', ej: [['peso-muerto', '3×5'], ['press-militar', '3×8'], ['remo-polea', '3×12'], ['plancha', '3×45 s']] },
    ] },
  { id: 'powerbuilding', nombre: 'Powerbuilding', nivel: 'Avanzado', diasSemana: 4, objetivo: 'Fuerza + estética', duracion: '80 min', color: '#6b7078',
    desc: 'Un básico pesado al principio de cada día y después accesorios de hipertrofia.',
    dias: [
      { nombre: 'Sentadilla', ej: [['sentadilla', '5×3'], ['prensa', '3×10'], ['curl-femoral', '3×12'], ['extension-cuadriceps', '3×15'], ['gemelos-pie', '4×12']] },
      { nombre: 'Banca', ej: [['press-banca', '5×3'], ['press-inclinado', '3×8'], ['remo-mancuerna', '4×10'], ['elevaciones-laterales', '4×15'], ['press-frances', '3×10']] },
      { nombre: 'Peso muerto', ej: [['peso-muerto', '5×2'], ['remo-barra', '4×8'], ['hip-thrust', '3×10'], ['dominadas', '3×8'], ['curl-barra', '3×10']] },
      { nombre: 'Press militar', ej: [['press-militar', '5×3'], ['press-cerrado', '3×8'], ['jalon', '3×12'], ['face-pull', '3×15'], ['curl-martillo', '3×12']] },
    ] },
  { id: 'core', nombre: 'Core de Acero', nivel: 'Todos', diasSemana: 2, objetivo: 'Abdomen y estabilidad', duracion: '20 min', color: '#7fbff2',
    desc: 'Complemento de 20 minutos que puedes añadir al final de cualquier rutina.',
    dias: [
      { nombre: 'Core A', ej: [['plancha', '3×60 s'], ['elevacion-piernas', '3×12'], ['russian-twist', '3×20']] },
      { nombre: 'Core B', ej: [['rueda', '3×10'], ['crunch', '3×25'], ['hiperextensiones', '3×15']] },
    ] },
];

// Planes completos: rutina + dieta + progresión semanal
export const PLANES = [
  { id: 'plan-iniciacion', nombre: 'Iniciación 12 semanas', semanas: 12, rutina: 'fullbody-principiante', dieta: 'recomposicion', color: '#35c06a', icono: '🌱',
    objetivo: 'Aprender técnica, crear hábito y ganar tus primeros kilos de fuerza.',
    fases: [
      { semanas: '1–4', titulo: 'Adaptación', texto: 'Pesos cómodos (RPE 6–7). Céntrate en la técnica y en grabarte. Camina 7000 pasos al día.' },
      { semanas: '5–8', titulo: 'Progresión lineal', texto: 'Sube 2,5 kg en básicos cada semana si completas todas las reps. Proteína: 1,6 g/kg.' },
      { semanas: '9–12', titulo: 'Consolidación', texto: 'RPE 8. Prueba tus repeticiones máximas en la semana 12 y mira tus nuevos rangos.' },
    ] },
  { id: 'plan-volumen', nombre: 'Volumen limpio 16 semanas', semanas: 16, rutina: 'ppl', dieta: 'volumen', color: '#8a6cf0', icono: '💪',
    objetivo: 'Ganar 0,25–0,5 % de peso corporal por semana con el mínimo de grasa.',
    fases: [
      { semanas: '1–4', titulo: 'Superávit suave', texto: '+250 kcal. Pésate a diario y mira la media semanal.' },
      { semanas: '5–12', titulo: 'Acumulación', texto: 'Añade una serie por grupo muscular cada 2 semanas. Prioriza el sueño (7–9 h).' },
      { semanas: '13', titulo: 'Descarga', texto: 'Mitad de series, mismo peso.' },
      { semanas: '14–16', titulo: 'Intensificación', texto: 'Menos volumen, más carga: series de 5–8 reps en los básicos.' },
    ] },
  { id: 'plan-definicion', nombre: 'Definición 12 semanas', semanas: 12, rutina: 'torso-pierna', dieta: 'definicion', color: '#29c7c7', icono: '🔥',
    objetivo: 'Perder grasa manteniendo toda la fuerza posible.',
    fases: [
      { semanas: '1–4', titulo: 'Déficit moderado', texto: '−400 kcal. Proteína a 2,2 g/kg. 8000–10000 pasos.' },
      { semanas: '5–8', titulo: 'Ajuste', texto: 'Si la media semanal no baja 0,5–1 %, quita 150 kcal más. Mantén las cargas.' },
      { semanas: '9–11', titulo: 'Recta final', texto: 'Añade 2 sesiones de cardio suave de 30 min.' },
      { semanas: '12', titulo: 'Dieta de mantenimiento', texto: 'Sube las calorías a mantenimiento para consolidar.' },
    ] },
  { id: 'plan-fuerza', nombre: 'Fuerza máxima 8 semanas', semanas: 8, rutina: 'fuerza-5x5', dieta: 'mediterranea', color: '#d8394b', icono: '🏋️',
    objetivo: 'Subir los básicos de rango a base de progresión lineal.',
    fases: [
      { semanas: '1–3', titulo: 'Carga', texto: '5×5 subiendo 2,5 kg (5 kg en peso muerto) por sesión.' },
      { semanas: '4–6', titulo: 'Intensidad', texto: 'Cuando falles dos veces, pasa a 3×5 con el mismo peso.' },
      { semanas: '7', titulo: 'Pico', texto: 'Series de 3 y 2 reps pesadas.' },
      { semanas: '8', titulo: 'Test', texto: 'Prueba de 1RM o de 3RM y registra tus marcas: comprueba tu rango.' },
    ] },
  { id: 'plan-gluteo', nombre: 'Glúteo de acero 10 semanas', semanas: 10, rutina: 'gluteo-pierna', dieta: 'recomposicion', color: '#e8336d', icono: '🍑',
    objetivo: 'Desarrollar glúteos e isquios con progresión en hip thrust.',
    fases: [
      { semanas: '1–5', titulo: 'Base', texto: 'Hip thrust 4×10. Sube peso cuando hagas 12.' },
      { semanas: '6–10', titulo: 'Intensificación', texto: 'Hip thrust 5×6–8 pesado y búlgaras con pausa.' },
    ] },
  { id: 'plan-casa', nombre: 'En forma desde casa 8 semanas', semanas: 8, rutina: 'casa-mancuernas', dieta: 'vegetariana', color: '#e6bf2e', icono: '🏠',
    objetivo: 'Ganar fuerza y perder algo de grasa sin pisar el gimnasio.',
    fases: [
      { semanas: '1–4', titulo: 'Volumen', texto: 'Llega a la parte alta de las reps y luego sube peso.' },
      { semanas: '5–8', titulo: 'Densidad', texto: 'Reduce descansos a 60 s y añade una ronda de comba de 5 min al final.' },
    ] },
];

export const rutinaById = (id) => RUTINAS.find(r => r.id === id);
export const planById = (id) => PLANES.find(p => p.id === id);
