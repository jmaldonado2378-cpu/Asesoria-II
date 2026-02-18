---
description: Constructor de Módulos (scaffold_module)
---

Cuando se solicite "crear módulo X", sigue estos pasos:

1. **Base de Datos**: Generar la tabla en Supabase con los campos necesarios.
2. **Tipos**: Crear el tipo TypeScript correspondiente para el nuevo módulo.
3. **Interfaz de Lista**: Generar un componente de tabla (`Table`) para visualizar los registros.
4. **Formulario**: Crear el formulario de creación/edición con validaciones.
5. **Lógica de Servidor**: Implementar las Server Actions necesarias para CRUD.

// turbo
Usa `npx supabase migration new create_X_table` para preparar la estructura si corresponde.
