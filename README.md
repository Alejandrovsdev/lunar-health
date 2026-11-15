# Monitoreo de salud · Base lunar Artemis

Demo para **NASA Space Apps Challenge 2026** · desafío *Create Health Monitoring Software for Astronauts on Space Missions*.

Una app para que la tripulación de una base lunar Artemis vea su estado de salud de un vistazo y sepa qué hacer en cada momento de la misión:

- **En la base:** parámetros diarios, tests, alimentación y estudios periódicos.
- **Afuera (EVA):** la telemetría del traje y la radiación en vivo, y el mapa del recorrido.
- **En la esclusa:** check-out antes de salir y check-in al volver, que deja seguimiento post-salida en la ficha.

> Todos los nombres, valores y umbrales son **de ejemplo**. Los umbrales son referencias clínicas generales, a validar por un equipo médico. La tabla completa, con la fuente de cada valor, está en [docs/umbrales-y-fuentes.md](docs/umbrales-y-fuentes.md).

## El problema

En la Luna no hay un médico al lado. La tripulación tiene que detectar a tiempo los problemas de salud y decidir sola qué hacer, porque la comunicación con Tierra tiene demora. Hoy esos datos están dispersos y en lenguaje técnico.

## La solución

- **Un tablero de toda la tripulación**, ordenado por gravedad: lo urgente aparece primero.
- **Lenguaje simple primero:** cada dato se muestra con una palabra (*Normal, Alta, Muy poco…*) y después, más chico, el valor con su unidad y el rango normal. No da por sentado que el astronauta sabe interpretar datos médicos.
- **Siempre un próximo paso:** cada parámetro fuera de rango dice qué hacer, y el escalamiento sigue este orden: autocuidado → tripulación → médico de vuelo en Tierra.
- **Salir y entrar son procesos guiados de la esclusa**, no estados: el check-out bloquea la salida si hay un punto crítico, y el check-in genera controles a las 2 h y a las 24 h.

## Cómo correrla

```bash
npm install
npm run dev        # http://localhost:3000
```

- **Producción:** `npm run build && npm start`.
- **Chequeo de tipos:** `npm run typecheck`.
- Requiere Node 20 o superior.

No hay backend: los datos viven en el navegador. El botón **Reiniciar demo** vuelve a los datos iniciales.

**Idioma:** el selector **ES / EN** del encabezado cambia toda la app, incluida la voz de los tests (usa una voz del sistema en el idioma elegido). Arranca en inglés; la elección queda guardada en el navegador. Para abrirla directamente en español: `http://localhost:3000/?lang=es` (o `?lang=en` para inglés).

## Recorrido sugerido para la demo (≈ 3 minutos)

1. **Tripulación** (`/`):
   - Cada astronauta aparece en una fila, agrupado por ubicación y ordenado por gravedad.
   - En la base, cada fila tiene un solo indicador (*X / N a atender*) y el próximo paso.
   - En EVA, la fila muestra presión del traje, pulso, temperatura y radiación en vivo, y la distancia a la base.
2. **Ficha de M. Sato** (en la base, en alerta):
   - Arriba están los datos básicos: sexo, edad, altura, peso contra el pre-vuelo, IMC, grupo sanguíneo y alergias.
   - Abajo, sus parámetros a atender, cada uno con su evolución, por qué importa en la Luna y qué hacer.
   - Las pestañas siguen la misma lógica:
     - **Cuerpo:** un mapa del cuerpo con los estudios de cada zona.
     - **Signos vitales y Evolución:** cada parámetro y su historial.
     - **Alimentación:** registro de comidas y bebidas contra la meta.
     - **Estudios:** resultados de laboratorio e imágenes, basados en las variables de NASA Standard Measures.
3. **Ficha de A. Okafor** (en EVA):
   - **Traje en vivo:** presión, pulso, temperatura, respiración, radiación y dosis de la salida, recursos del traje y tiempo para volver.
   - **Mapa:** el recorrido sobre una imagen real del polo sur lunar (LRO) y las paradas de la salida.
4. **Esclusa** (`/esclusa`):
   - El check-out de Sato se hace por pasos: plan, síntomas, signos vitales, test cognitivo, equilibrio y traje. La salida siempre es en pareja.
   - El check-in de Okafor (descompresión y polvo lunar) deja el seguimiento post-salida en su ficha. J. Varga ya muestra uno.
5. **Tests** (`/tests`):
   - Check-in diario.
   - Test cognitivo (PVT).
   - Cuestionario semanal: PANAS breve, salud general y convivencia.
   - Estrés percibido (PSS-14, mensual).
   - Equilibrio.

## Datos y recursos de NASA usados

| Recurso | Para qué se usa |
| --- | --- |
| [NASA Standard Measures](https://nlsp.nasa.gov/resources/standard-measures) | Qué se mide y cómo: actigrafía, bioquímica, Cognition (PVT), PANAS y GHQ, cuestionario de sueño y equipo, sensoriomotor, cIMT, microbioma. Son la base de los parámetros, los tests y la pestaña *Estudios* |
| [NASA Human Research Program: riesgos](https://humanresearchroadmap.nasa.gov/) | Por qué importa cada parámetro en la Luna: descompresión, lesiones en EVA y polvo, hipoxia, sistema inmune, hueso y músculo, aislamiento |
| [NASA-STD-3001](https://www.nasa.gov/ochmo/human-systems-integration-standards/) | Líquidos (al menos 2.000 mL por día), requerimientos nutricionales y límite de radiación de carrera (600 mSv) |
| [LRO / LROC](https://data.lroc.im-ldi.com/) y ShadowCam | Mapa del polo sur lunar (cresta Shackleton–de Gerlache) e imágenes de las paradas |
| [NASA Image and Video Library](https://images.nasa.gov/) | Fotos de Apollo para las paradas y retratos para la tripulación ficticia (ver `public/crew/CREDITS.md` y `public/eva/CREDITS.md`) |
| Artemis: arquitectura de EVA | Salidas en pareja, hábitat a 8,2 psi y traje a 4,3 psi, y pre-respirado de oxígeno |

**Otras referencias:**

- Chang'e 4 LND (Zhang et al., 2020): radiación en la superficie lunar.
- UNSCEAR: radiación natural en la Tierra, para comparar.
- PANAS (Watson, Clark & Tellegen, 1988).
- PSS-14 (Cohen et al., 1983).
- OMS: IMC y ecuaciones de energía.
- Criterios clínicos generales (ADA, AHA/ACC).

Las fotos son de NASA y de dominio público. Los nombres y datos de salud son ficticios y no representan a las personas retratadas. Su uso no implica respaldo de NASA.

## Principios de diseño

- **Primero la palabra, después el número:** el valor técnico siempre está, pero en segundo plano.
- El estado siempre se muestra con **color y texto**, nunca solo con color.
- **Lo urgente primero:** el tablero ordena por gravedad, y si hay N parámetros a atender, la ficha muestra los N.
- **Divulgación progresiva:** el tablero muestra un indicador, la ficha el detalle y cada parámetro su historial y su fuente.
- Salir y entrar no son estados: son **procesos de la esclusa**.

## Arquitectura: monolito modular

```text
src/
├── app/                      # Rutas de Next (finas: solo componen módulos)
├── core/                     # Store de la demo, hidratación y layout general
├── shared/                   # UI base (estilo shadcn), escala de estados, formatos
└── modules/
    ├── monitoring/           # Tablero, ficha y datos básicos de los astronautas
    ├── telemetry/            # Telemetría del traje, radiación y ubicación en EVA (simuladas)
    ├── airlock/              # Esclusa: check-out y check-in con sus formularios
    ├── assessments/          # Tests: fisiológicos, cognitivos, psicológicos, sensoriomotores
    ├── nutrition/            # Alimentación e hidratación: registro, metas y lecturas diarias
    └── labs/                 # Resultados periódicos (Standard Measures)
```

Todos los módulos tienen la misma forma:

```text
modules/<módulo>/
├── domain/     # Tipos y reglas puras (sin React ni store)
├── data/       # Semilla y slice del store (estado + acciones del módulo)
├── ui/         # Componentes y hooks
└── index.ts    # API pública: lo único que importan los demás
```

Reglas:

- Las rutas de `app/` y la UI de otros módulos importan **solo desde `index.ts`** de cada módulo.
- Los slices y las semillas de un módulo pueden usar el **dominio puro** de otro (por ejemplo, `@/modules/monitoring/domain`) y sus acciones a través del store, pero nunca su UI.
- Dependencias:
  - `airlock` → `monitoring`, `telemetry`, `assessments`, `nutrition` (para registrar el agua del traje).
  - `assessments` → `monitoring`.
  - `nutrition` ↔ `monitoring`: alimentación publica sus lecturas diarias como parámetros, y la semilla de monitoring usa sus metas.
  - `monitoring` → `telemetry`.
  - `labs` y `telemetry` no dependen de nadie.

### Datos

La demo no tiene backend. `core/store.ts` es el **repositorio**: un store de Zustand compuesto por los slices de cada módulo y guardado en `localStorage`.

- **Semilla:** la de `modules/monitoring/data/seed.ts` genera 14 días de historial relativos a *ahora*.
- **Telemetría:** la del traje y la radiación es **determinística según el tiempo**, así el tablero, la ficha y el mapa muestran lo mismo.
- **Legajo:** los datos básicos (altura, peso pre-vuelo, grupo sanguíneo, alergias) son fijos y están en `modules/monitoring/data/profiles.ts`. El peso actual sale del mismo dato que usa Alimentación.
- **Para conectar un backend:** reemplazar las acciones de los slices por llamadas a una API (o a Server Actions). La UI no cambia porque usa los hooks de cada módulo.

### Idiomas

`src/shared/i18n/` traduce al estilo gettext: el texto en español es la clave (`t("Texto")`) y `en.ts` tiene el inglés.

- Los textos fijos del dominio (parámetros, estudios, comidas) quedan en español y se traducen donde se muestran.
- Lo que se guarda en el navegador (resultados, registro de la esclusa) también se guarda en español; al mostrarlo se traduce, incluso si tiene números, con claves que llevan `{variables}`.
- En desarrollo, la consola avisa cada texto sin traducción.

### Agregar cosas

- **Un parámetro:** sumarlo a `modules/monitoring/domain/parameters.ts` (umbrales, textos, fuente), a la semilla, a [docs/umbrales-y-fuentes.md](docs/umbrales-y-fuentes.md) y sus textos a `shared/i18n/en.ts`.
- **Un test:** definirlo en `modules/assessments/domain/catalog.ts`, crear su componente en `ui/tests/` y registrarlo en `ui/test-runner.tsx`.
- **Una regla de la esclusa:** `modules/airlock/domain/rules.ts`.

## Stack

- Next.js 16 (App Router), React 19 y TypeScript.
- Tailwind CSS 4 y componentes estilo shadcn/ui (Radix).
- Recharts, Zustand y lucide-react.

## Uso de IA

El código se desarrolló con asistencia de herramientas de IA (Claude Code). El diseño del problema, las decisiones de producto y la revisión de las fuentes son del equipo.
