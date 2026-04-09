# k6 API Test

Pruebas de carga sobre el endpoint de login de la API usando [k6](https://k6.io/).

---

## Requisitos

### 1. Instalar Chocolatey

Chocolatey es el gestor de paquetes para Windows que usaremos para instalar k6.

Guía completa: https://www.mostapha.dev/blog/guia-completa-instalar-configurar-chocolatey-windows

### 2. Instalar k6

Una vez instalado Chocolatey, ejecuta en PowerShell como administrador:

```powershell
choco install k6
```

---

## Correr la prueba

```powershell
k6 run api-test.js
```

---

## Ver el reporte HTML

Al terminar la prueba se genera el reporte en `reports/summary.html`. Para abrirlo:

```powershell
start reports/summary.html
```
