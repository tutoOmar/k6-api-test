================================================================================
  EJERCICIO 1 - PRUEBA DE CARGA: SERVICIO DE LOGIN
  k6 Load Test | fakestoreapi.com/auth/login
================================================================================

TECNOLOGÍAS Y VERSIONES
------------------------
  - k6          v0.54.0   https://github.com/grafana/k6/releases/tag/v0.54.0
  - k6-reporter v2.3.0    https://github.com/benc-uk/k6-reporter (cargado en runtime)
  - papaparse   v5.1.1    https://jslib.k6.io/papaparse/5.1.1/index.js (cargado en runtime)
  - SO          Windows 10/11 (64-bit) | Linux | macOS

ESTRUCTURA DEL PROYECTO
------------------------
  k6-api-test/
  ├── login-test.js       → Script principal de k6
  ├── users.csv           → Datos de usuarios parametrizados
  ├── reports/            → Reportes generados al ejecutar la prueba
  │   ├── summary.html    → Reporte HTML interactivo
  │   └── summary.json    → Resumen en JSON
  ├── README.txt          → Este archivo
  └── conclusiones.txt    → Hallazgos y conclusiones

================================================================================
  PASO 1 - INSTALAR k6
================================================================================

  Windows (Chocolatey) — requiere Chocolatey instalado:
    choco install k6

  Windows (Winget):
    winget install k6 --source winget

  Windows (instalador MSI — descarga directa):
    1. Ir a https://github.com/grafana/k6/releases/tag/v0.54.0
    2. Descargar: k6-v0.54.0-windows-amd64.msi
    3. Ejecutar el instalador y seguir las instrucciones.
    4. Reiniciar la terminal para que el PATH se actualice.

  Linux (Debian/Ubuntu):
    sudo gpg --no-default-keyring \
      --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
      --keyserver hkp://keyserver.ubuntu.com:80 \
      --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
    echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] \
      https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
    sudo apt-get update
    sudo apt-get install k6

  macOS (Homebrew):
    brew install k6

================================================================================
  PASO 2 - VERIFICAR INSTALACIÓN
================================================================================

  Ejecutar en terminal:
    k6 version

  Salida esperada (ejemplo):
    k6 v0.54.0 (go1.22.x, ...)

================================================================================
  PASO 3 - CLONAR O DESCARGAR EL REPOSITORIO
================================================================================

  Opción A — clonar con Git:
    git clone https://github.com/<usuario>/k6-api-test.git
    cd k6-api-test

  Opción B — descargar ZIP:
    1. Ir al repositorio en GitHub.
    2. Clic en "Code" → "Download ZIP".
    3. Descomprimir y abrir la carpeta resultante en la terminal.

================================================================================
  PASO 4 - VERIFICAR ARCHIVOS REQUERIDOS
================================================================================

  Confirmar que los siguientes archivos existen en la raíz del proyecto:
    - login-test.js
    - users.csv

  En Windows (PowerShell):
    Get-ChildItem

  En Linux/macOS:
    ls -la

================================================================================
  PASO 5 - EJECUTAR LA PRUEBA DE CARGA
================================================================================

  Ejecución estándar (reporte en consola + HTML + JSON en reports/):
    k6 run login-test.js

  Ejecución con salida JSON detallada por iteración:
    k6 run --out json=reports/raw-results.json login-test.js

  NOTA: El script descarga automáticamente las siguientes dependencias al iniciar
        (requiere acceso a internet):
          - https://jslib.k6.io/papaparse/5.1.1/index.js
          - https://jslib.k6.io/k6-summary/0.0.1/index.js
          - https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js

================================================================================
  PASO 6 - INTERPRETAR RESULTADOS EN CONSOLA
================================================================================

  Al finalizar la prueba, k6 imprime un resumen con las métricas clave.
  Preste atención a las siguientes líneas:

    http_req_duration  → Tiempos de respuesta (p90, p95, p99)
    http_req_failed    → Porcentaje de peticiones fallidas
    login_errors       → Tasa de errores de negocio (checks fallidos)
    iterations         → Total de iteraciones ejecutadas
    http_reqs          → Total de peticiones y TPS alcanzados

  Umbrales configurados (PASS / FAIL):
    ✔ http_req_duration p(95) < 1500 ms
    ✔ http_req_duration p(99) < 1500 ms
    ✔ http_req_failed   rate  < 3 %
    ✔ login_errors      rate  < 3 %

  Si todos los umbrales pasan, la línea final mostrará:
    ✓ all checks passed

================================================================================
  PASO 7 - REVISAR EL REPORTE HTML
================================================================================

  Tras la ejecución, abrir en el navegador:
    reports/summary.html

  El reporte incluye gráficas de:
    - Tiempo de respuesta por percentil
    - Tasa de peticiones (TPS) en el tiempo
    - Distribución de errores HTTP

================================================================================
  PARÁMETROS DEL ESCENARIO
================================================================================

  Executor : ramping-arrival-rate (controla TPS directamente)
  Fases    :
    1. Rampa       →  0 a 20 TPS en 30 segundos
    2. Sostenido   → 20 TPS durante 90 segundos
    3. Descenso    → 20 a  0 TPS en 10 segundos
  Duración total    : ~130 segundos
  VUs preasignados  : 50  |  VUs máximos: 150
  Datos de entrada  : 5 usuarios del archivo users.csv (ciclo round-robin)

================================================================================
  SOLUCIÓN DE PROBLEMAS COMUNES
================================================================================

  Error: "k6: command not found"
    → k6 no está en el PATH. Reiniciar la terminal o agregar k6 al PATH manualmente.

  Error: "open ./users.csv: no such file or directory"
    → Asegurarse de ejecutar el comando desde la carpeta raíz del proyecto.

  Error de red / timeout hacia fakestoreapi.com
    → Verificar conectividad a internet. La API es pública y no requiere autenticación
      previa más allá del propio login.

  Umbral http_req_duration FAIL con tiempos altos
    → Puede indicar saturación del servidor externo o latencia de red elevada.
      Es un resultado válido de la prueba de carga.
