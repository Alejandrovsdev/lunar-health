# Monitoreo de salud · Base lunar Artemis

Demo para **NASA Space Apps Challenge 2026** · desafío *Create Health Monitoring Software for Astronauts on Space Missions*.

Una app para que la tripulación de una base lunar Artemis vea su estado de salud de un vistazo y sepa qué hacer: en la base (interior), durante una salida (exterior, con la telemetría del traje en vivo) y al pasar por la esclusa (check-out y check-in).

> Todos los nombres, valores y umbrales son **de ejemplo**. Los umbrales siguen la tabla 3.2 del documento del equipo (referencias clínicas generales, a validar) y las variables de [NASA Standard Measures](https://nlsp.nasa.gov/resources/standard-measures).

## Cómo correrla

```bash
npm install
npm run dev        # http://localhost:3000
```

Producción: `npm run build && npm start`. Chequeo de tipos: `npm run typecheck`.

Requiere Node 20 o superior.

## Recorrido sugerido para la demo

1. **Tripulación** (`/`): cada astronauta en una fila. En la base, un solo indicador: *parámetros a atender X / N*. Afuera, los datos del traje en vivo y el botón de distancia que lleva al mapa.
2. **Ficha de M. Sato** (interior): los 5 parámetros a atender, cada uno con su evolución, por qué importa en la Luna y qué hacer.
3. **Ficha de A. Okafor** (exterior): presión del traje, pulso, temperatura y respiración en tiempo real, recursos del traje y tiempo para volver. **Mapa** con el recorrido en vivo y las paradas.
4. **Esclusa** (`/esclusa`): check-out de Sato por pasos (incluye el test cognitivo y el de equilibrio) y check-in de Okafor. El check-in deja seguimiento post-salida en la ficha.
5. **Tests** (`/tests`): check-in diario, test cognitivo (PVT), cuestionario semanal (PANAS breve, salud general, convivencia) y equilibrio.

El botón **Reiniciar demo** vuelve a los datos iniciales.

## Principios de diseño

- **No dar por sentado que el astronauta sabe interpretar datos médicos:** primero una palabra simple (*Normal, Alta, Muy poco…*) y después, más chico, el valor con su unidad y el rango normal.
- El estado siempre se muestra con **color y texto**.
- Si hay N parámetros a atender, se ven los N.
- Salir y entrar no son estados: son **procesos de la esclusa**.

## Arquitectura: monolito modular

```
src/
├── app/                      # Rutas de Next (finas: solo componen módulos)
├── core/                     # Store de la demo, hidratación y layout general
├── shared/                   # UI base (estilo shadcn), estados, formatos
└── modules/
    ├── monitoring/           # Tablero e información de los astronautas
    ├── telemetry/            # Telemetría del traje y ubicación en EVA (simuladas)
    ├── airlock/              # Esclusa: check-out y check-in con sus formularios
    ├── assessments/          # Tests: fisiológicos, cognitivos, psicológicos, sensoriomotores
    └── labs/                 # Resultados periódicos (Standard Measures)
```

Cada módulo tiene la misma forma:

```
modules/<módulo>/
├── domain/     # Tipos y reglas puras (sin React ni store). Fácil de testear.
├── data/       # Semilla y slice del store (estado + acciones del módulo)
├── ui/         # Componentes y hooks
└── index.ts    # API pública: lo único que importan los demás
```

Reglas:

- Las rutas de `app/` y otros módulos importan **solo desde `index.ts`** de cada módulo.
- Los slices de un módulo pueden usar el **dominio puro** de otro (`@/modules/monitoring/domain`) y sus acciones a través del store, nunca su UI.
- Dependencias: `airlock → monitoring, telemetry, assessments` · `assessments → monitoring` · `monitoring → telemetry` · `labs` y `telemetry` no dependen de nadie.

### Datos

La demo no tiene backend. `core/store.ts` es el **repositorio**: un store de Zustand compuesto por los slices de cada módulo y guardado en `localStorage`.

- La semilla (`modules/monitoring/data/seed.ts`) genera 14 días de historial relativos a *ahora*.
- La telemetría del traje es **determinística según el tiempo** (`modules/telemetry/domain/suit.ts`), así el tablero, la ficha y el mapa muestran lo mismo.
- Para conectar un backend: reemplazar las acciones de los slices por llamadas a una API (o a Server Actions). La UI no cambia porque usa los hooks de cada módulo.

### Agregar cosas

- **Un parámetro:** sumarlo a `modules/monitoring/domain/parameters.ts` (umbrales, textos, fuente) y a la semilla.
- **Un test:** definirlo en `modules/assessments/domain/catalog.ts`, crear su componente en `ui/tests/` y registrarlo en `ui/test-runner.tsx`.
- **Una regla de la esclusa:** `modules/airlock/domain/rules.ts`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · componentes estilo shadcn/ui (Radix) · Recharts · Zustand · lucide-react.
