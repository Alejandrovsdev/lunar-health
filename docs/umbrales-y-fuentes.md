# Umbrales y fuentes

Todos los umbrales de la demo están en un solo lugar del código y son **configurables**. Son referencias clínicas generales o valores de ejemplo: un equipo médico de vuelo debe validarlos antes de cualquier uso real.

Cada parámetro muestra en la app su fuente, por qué importa en la Luna y qué hacer en cada estado (pestaña *Signos vitales* o *Evolución* de la ficha).

Escala de estados: **Normal** (verde) · **Atención** (ámbar) · **Alerta** (rojo) · **Sin datos** (gris).

## Parámetros diarios (en la base)

Código: [`src/modules/monitoring/domain/parameters.ts`](../src/modules/monitoring/domain/parameters.ts)

| Parámetro | Normal | Atención | Alerta | Fuente |
| --- | --- | --- | --- | --- |
| Sueño | 7 a 9 h | 6 a 7 h, o más de 9 h | menos de 6 h | Referencia clínica general (adultos: 7 h o más) · NASA Standard Measures: actigrafía |
| Ánimo (1 a 5) | 4 o 5 | 3 | 1 o 2 | NASA Standard Measures: PANAS y GHQ |
| Convivencia (1 a 5) | 3,75 o más | 2,5 a 3,75 | menos de 2,5 | NASA Standard Measures: cuestionario de sueño y equipo |
| Glucosa en ayunas | 70 a 99 mg/dL | 100 a 125 mg/dL | menos de 70 o 126 mg/dL o más | Criterios clínicos generales (ADA) · NASA Standard Measures: bioquímica |
| Ejercicio | 90 min o más | 45 a 89 min | menos de 45 min | Indicación de ejercicio de NASA para la ISS (1,5 h por día) · Standard Measures: fuerza y VO2máx |
| Presión arterial | menos de 120/80 | 120/80 a 139/89 | 140/90 o más, o menos de 90/60 | Categorías clínicas generales (AHA/ACC 2017) |
| Pulso en reposo | 60 a 100 lpm | 50 a 59 o 101 a 120 lpm | menos de 50 o más de 120 lpm | Referencia clínica general |
| Temperatura | 36,1 a 37,2 °C | 35 a 36,0 o 37,3 a 37,9 °C | menos de 35 o 38 °C o más | Referencia clínica general · riesgo HRP: sistema inmune |
| Oxígeno en sangre | 95 % o más | 90 a 94 % | menos de 90 % | Referencia clínica general · riesgo HRP: hipoxia (hábitat a 8,2 psi) |
| Test cognitivo (PVT) | menos de 300 ms y 0 o 1 lapsos | 300 a 359 ms o 2 lapsos | 360 ms o más, o 3 lapsos o más | NASA Standard Measures: Cognition (PVT) · umbrales de ejemplo |
| Hidratación | 2.000 mL o más por día | por debajo de lo esperable a esa hora, o 75 % a 99 % al cierre del día | menos del 75 % al cierre | NASA-STD-3001: requerimientos nutricionales (líquidos ≥ 2.000 mL/día) |
| Alimentación | 90 % a 125 % de la meta de calorías | atrasada, o más del 125 % | menos del 75 % al cierre | NASA-STD-3001 · meta de energía con las ecuaciones de la OMS |
| Estrés percibido (PSS-14, mensual) | 0 a 18 | 19 a 37 | 38 a 56 | Cohen, Kamarck & Mermelstein (1983), adaptación de E. Remor |

### Seguimiento post-salida (después del check-in)

| Parámetro | Normal | Atención | Alerta | Fuente |
| --- | --- | --- | --- | --- |
| Descompresión | sin síntomas | 1 síntoma | 2 síntomas o más | Riesgo HRP: enfermedad por descompresión |
| Ojos y respiración (polvo lunar) | sin irritación | irritación leve | irritación fuerte | Riesgo HRP: lesiones en EVA |

## Datos básicos de la ficha

Código: [`src/modules/monitoring/domain/anthropometrics.ts`](../src/modules/monitoring/domain/anthropometrics.ts)

| Dato | Regla | Fuente |
| --- | --- | --- |
| Cambio de peso desde el pre-vuelo | estable entre −5 % y +5 % · atención desde 5 % · alerta desde −10 % | Valores de ejemplo. NASA Standard Measures registra la masa corporal y en vuelo se compara siempre contra el pre-vuelo |
| IMC | menos de 18,5 bajo · 18,5 a 24,9 normal · 25 a 29,9 alto · 30 o más muy alto | Categorías de la OMS (orientativo en personas muy entrenadas) |

## Durante la salida (telemetría del traje, simulada)

Código: [`src/modules/telemetry/domain/suit.ts`](../src/modules/telemetry/domain/suit.ts) y [`radiation.ts`](../src/modules/telemetry/domain/radiation.ts)

| Canal | Atención | Alerta | Nota |
| --- | --- | --- | --- |
| Presión del traje (nominal 4,3 psi) | menos de 4,1 psi | 3,9 psi o menos | Hábitat a 8,2 psi y traje a 4,3 psi: valores de referencia de la arquitectura de exploración de NASA |
| Pulso | más de 145 lpm | 165 lpm o más | Valores de ejemplo para esfuerzo en EVA |
| Temperatura corporal | desde 37,3 °C | 38 °C o más | Igual que en la base |
| Respiración | más de 30 rpm | 35 rpm o más | Valores de ejemplo |
| Radiación (tasa) | 150 µSv/h o más | 500 µSv/h o más | Fondo lunar ≈ 57 µSv/h (Chang'e 4, Zhang et al. 2020). Límite de carrera de NASA: 600 mSv (NASA-STD-3001). Los umbrales de aviso de evento solar son de ejemplo |

## Esclusa

Código: [`src/modules/airlock/domain/rules.ts`](../src/modules/airlock/domain/rules.ts)

- **Check-out:**
  - Cualquier punto en *Alerta* bloquea la salida: dolor articular, falla en la prueba de fuga del traje, consumibles incompletos o signos vitales en rojo.
  - Cualquier punto en *Atención* permite salir con precaución: salida acortada y revisión del oficial médico.
  - Los signos vitales se evalúan con los mismos umbrales de la base.
- **Check-in:** los síntomas de descompresión y de irritación por polvo generan el seguimiento post-salida, con controles a las 2 h y a las 24 h.
- Las salidas son siempre en pareja, como en las EVA de Artemis.
