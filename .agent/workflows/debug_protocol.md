---
description: Protocolo de Depuración (debug_protocol)
---

Si se detecta un error, sigue estrictamente este protocolo:

1. **Lectura**: Lee el error del terminal o logs detalladamente.
2. **Revisión**: Examina el código en los archivos afectados identificados en el stack trace.
3. **Análisis**: Propón 3 hipótesis distintas sobre la causa raíz del problema.
4. **Acción**: Aplica la solución más probable basada en el análisis.
5. **Verificación**: Ejecuta pruebas o verifica manualmente que el error haya desaparecido.
