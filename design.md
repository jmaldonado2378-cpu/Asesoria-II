# Sistema de Diseño - App Asesor

Este documento define la identidad visual y los estándares de interfaz del proyecto.

## Colores Principales (Tailwind / CSS Variables)

- **Fondo**: `Zinc-950` (Dark Mode) / `White` (Light Mode)
- **Primario**: `Orange-600` (Vibrant Orange)
- **Secundario**: `Zinc-800`
- **Acento**: `Orange-500`
- **Texto**: `Zinc-100` (Dark) / `Zinc-900` (Light)

## Componentes

Se utiliza **Shadcn/UI** como base para todos los componentes de interfaz.

- **Botones**: Siempre deben incluir un estado visual de carga (`isLoading`).
- **Tablas**: Uso de `DataTable` con paginación y filtros.
- **Formularios**: Validados con `React Hook Form` y `Zod`.

## Tipografía

- **Sans**: `Inter` o `Outfit` (fuentes modernas y limpias).

## Responsive

- Estrategia **Mobile First**. Todas las vistas deben ser funcionales en tablets y móviles antes que en desktop.
