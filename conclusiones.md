# Conclusiones

## Objetivo vs resultado

La prueba tenía como meta alcanzar 20 TPS (transacciones por segundo). El promedio general obtenido fue de 17 TPS, lo cual se explica por las etapas de subida y bajada del escenario. En la meseta los 20 TPS sí se alcanzaron sin problema.

## Uso de VUs

Se dejaron 50 VUs pre-asignados, pero la prueba solo necesitó usar 8. Esto indica que la API responde con suficiente rapidez como para no requerir más usuarios virtuales concurrentes.

## Tiempos de respuesta

El percentil 95 se ubicó alrededor de 350 ms, casi 4.6 veces más rápido que el límite definido de 1500 ms. Hay bastante margen antes de que la API empiece a comprometer los tiempos establecidos.

## Tasa de error

0% de errores. Para casos donde se requiere precisión absoluta en cada petición, este resultado es muy fiable.

## Proyección

Con 8 VUs se lograron ~20 TPS. Aplicando la misma proporción, para alcanzar el límite de 1500 ms se estima que se podrían manejar aproximadamente 40 TPS. Sin embargo, esto es solo una estimación lineal; para validarlo correctamente habría que ejecutar pruebas de estrés bajo esa condición.
