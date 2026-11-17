# FORJA Gym

Web app de gimnasio en español. Es HTML, CSS y JavaScript sin paso de compilación, así que se puede publicar tal cual en Netlify.

## Qué incluye

- **Mapa muscular con rangos**: figura frontal y posterior. Cada músculo se colorea con su rango: Bronce, Hierro, Plata, Oro, Platino, Diamante, Esmeralda, Campeón o Simétrico.
- **Rangos justos**: se calculan con el 1RM estimado (Epley) dividido entre tu peso corporal. Para mujeres hay estándares adaptados. Cada ejercicio muestra el objetivo concreto para llegar al siguiente rango.
- **42 ejercicios**: cada uno tiene un **modelo 3D animado** (girable y con velocidad ajustable) con los músculos iluminados, un enlace a YouTube, tips, errores comunes, accesorios recomendados, historial, gráfica y récords.
- **Registro de pesos mejorado**: botones +/− para cambiar el peso, pesos de la última sesión ya rellenados, RPE, aviso de récord en vivo, calculadora de discos y temporizador de descanso automático con sonido.
- **12 rutinas, 6 planes y modo entreno** guiado con cronómetro y resumen final.
- **20 recetas**: cada una tiene su ilustración, macros, un selector de raciones y el modo **"Cocínalo tú mismo"**. Ese modo muestra una animación 3D por paso (cortar, hervir, saltear, plancha, horno, batir, emplatar…), temporizadores y lectura en voz alta.
- **6 dietas y calculadora de calorías y macros** (Mifflin-St Jeor).
- **Suplementos y accesorios** con imagen, explicación, dosis y nivel de evidencia.
- Datos guardados en el navegador (localStorage), con exportar e importar en JSON.

## Fotos reales de los platos

Por defecto los platos usan ilustraciones generadas. Para poner una foto real:

1. Guárdala en `assets/img/recetas/`.
2. Añade `foto: 'assets/img/recetas/mi-plato.jpg'` a la receta en `js/data/recipes.js`.

## Probar en local

```bash
python3 -m http.server 8000
```

Después abre http://localhost:8000.

## Estructura

- `js/data/`: ejercicios, rutinas y planes, recetas y dietas, suplementos y accesorios, rangos
- `js/three/mannequin.js`: el maniquí 3D y las poses de cada ejercicio
- `js/three/kitchen.js`: la cocina 3D
- `js/bodymap.js`: el mapa muscular SVG
- `js/app.js`: las pantallas
- `js/ui.js`: los componentes reutilizables (registro de series, temporizador, gráficas)
