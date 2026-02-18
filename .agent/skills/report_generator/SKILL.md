---
name: report_generator
description: Úsalo cuando el usuario pida "generar reporte", "exportar PDF" o "imprimir vista".
---

# Reglas de Generación de Reportes

1. **Tecnología:** Usa siempre `jspdf` + `html2canvas` para mantener consistencia en la generación desde el cliente.
2. **Formato:** Los reportes deben incluir siempre:
   - Encabezado con Logo (Path: `/public/logo.png`).
   - Fecha de generación automática.
   - Tabla de datos con estilos minimalistas (blanco y negro para impresión).
3. **Manejo de Errores:**
   - Si la generación falla, no rompas la app. Muestra un "Toast" de error al usuario y loguea el fallo en la consola.
   - Nunca intentes generar el PDF en el servidor (Server Component) si la librería requiere acceso al DOM (window).
