# FORJA — Entrena, come y progresa

Web app de gimnasio y nutrición: HTML, CSS y JavaScript sin compilación, lista para publicar en Netlify.
Está construida sobre la versión original de FORJA y conserva sus cuentas (Supabase), el modo invitado, el coach IA, el análisis de fotos de comida, el calendario, los suplementos y el formato de los datos guardados.

## Novedades

- **Alta en 5 pasos** (sobre ti, objetivo, entreno, comida y tu plan). FORJA elige el estilo de rutina más adecuado y explica por qué. Calcula kcal, macros y agua con tu peso, altura, edad, actividad diaria y días de entreno.
- **Mapa muscular nuevo** con 15 zonas, manos y pies, y **9 rangos**: Bronce, Hierro, Plata, Oro, Platino, Diamante, Esmeralda, Campeón y Simétrico.
- **Ejercicios en 3D profesional**: un modelo humano riggeado (Xbot) hace cada ejercicio, con los músculos trabajados coloreados, controles de velocidad y vista, y accesorios recomendados.
- **Dieta al gramo**: valores BEDCA/USDA por 100 g y kcal según el etiquetado europeo. Las raciones del día se ajustan gramo a gramo para cuadrar kcal, proteína, hidratos y grasa (normalmente a menos de un 2 %). Si con raciones razonables no se llega, se añade un "extra" marcado.
- **Foto real de cada plato** (Flickr, licencias Creative Commons con uso comercial; autor y enlace en cada foto).
- **"Cocínalo tú"**: pasos generados con tus gramos exactos (incluida la conversión de crudo a cocido), animados en una cocina 3D, con temporizador y lectura en voz alta.
- **Compra**: cada ingrediente y la lista semanal enlazan a Mercadona, Lidl, Carrefour, Dia, Alcampo, Condis, Eroski, El Corte Inglés, Consum, bonÀrea y Amazon. La lista se puede copiar o enviar por WhatsApp.
- **Agua exacta**: 35 ml por kg + 600 ml los días de entreno, con botones de vaso, lata y botella.
- **5 idiomas**: español, inglés, catalán, francés y portugués (botón 🌍 arriba o en Perfil → Ajustes). Toda la interfaz, los platos, los ingredientes y los pasos de cocina están traducidos.
- **Cuentas que siempre funcionan**: si el servidor de Supabase no responde, las cuentas se crean en el propio dispositivo (contraseña cifrada con PBKDF2) en vez de fallar con "Load failed". Los datos se pueden exportar e importar desde Perfil.
- **10 programas por semanas** (iniciación, hipertrofia, fuerza, PHUL, definición, glúteo, calistenia, exprés, vuelta tras un parón y estilo Arnold) con fases, series y repeticiones que cambian cada semana.
- **Más dietas**: omnívora, mediterránea, alta en proteína, vegetariana, vegana, baja en hidratos, ayuno 16:8, económica y sin gluten, con más de 140 recetas.
- **Gimnasio 3D**: suelo de caucho, espejo, rack de mancuernas, cámara automática y contador de repeticiones.
- **Diseño de escritorio** con barra lateral, y tema claro, oscuro o automático.
- **Nueva paleta** (tinta + brasa naranja + azul eléctrico), con modo claro automático.

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html`, `config.js` | Página y configuración pública de Supabase |
| `css/forja.css` | Estilos y paleta |
| `js/datos.js` | Catálogo de ejercicios, estilos de rutina y menús |
| `js/nutricion.js` | Tabla nutricional, ajuste de raciones, agua, supermercados |
| `js/cuerpo.js`, `js/cuerpo-datos.js` | Rangos y mapa muscular |
| `js/cocina.js` | Generador de pasos del modo cocina |
| `js/fotos.js`, `assets/img/comidas/` | Fotos de los platos y sus créditos |
| `js/programas.js` | Programas por semanas |
| `js/i18n.js`, `js/i18n-datos.js` | Idiomas y diccionario de traducciones |
| `js/forja.js` | La aplicación |
| `supabase/schema.sql`, `supabase/functions/ai/` | Base de datos y función del coach IA |
| `js/three/humano.js`, `assets/3d/Xbot.glb` | Visor 3D de ejercicios |
| `js/three/cocina.js` | Cocina 3D |

## Probar en local

```bash
python3 -m http.server 8000
```

Después abre http://localhost:8000.

## Activar las cuentas en la nube y el coach IA

El proyecto de Supabase de `config.js` ya no responde, así que las cuentas se guardan en cada dispositivo. Para tener sincronización entre dispositivos:

1. Crea un proyecto en supabase.com.
2. En el editor SQL, ejecuta `supabase/schema.sql`.
3. Despliega la función `supabase/functions/ai` y añade el secreto `ANTHROPIC_API_KEY`.
4. Pon la URL y la clave pública (anon) del proyecto en `config.js`.

## Créditos

- Modelo 3D Xbot: ejemplos de three.js (Mixamo).
- Geometría del mapa muscular: react-body-highlighter (licencia MIT).
- Fotos: autores de Flickr indicados en cada imagen.
