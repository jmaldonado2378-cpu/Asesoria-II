---
name: pdf_generator
description: Uso estandarizado de @react-pdf/renderer para generar documentos PDF con estilo corporativo y paginación
---

# Generador de PDFs con @react-pdf/renderer

Esta skill detalla cómo construir y exportar documentos PDF en la aplicación utilizando `@react-pdf/renderer`. 

**REGLA DE ORO:** Está terminantemente PROHIBIDO utilizar `jspdf`, `html2canvas` o `window.print()` para generar PDFs estructurados. Siempre debes usar este patrón.

## 1. Componentes Core

El sistema expone dos componentes principales ubicados en `frontend/src/components/pdf/`:

1.  **`MasterPDFTemplate`**: El envoltorio o layout base del documento. Define la estructura de página (A4), el encabezado corporativo (Logo + Fecha/Hora), márgenes estandarizados (30px), tipografía limpia (Helvetica) y un pie de página con paginación dinámica (`Página X de Y`).
2.  **`ExportPDFButton`**: Un botón reutilizable de UI que maneja la asincronía de generación y descarga usando `PDFDownloadLink`.

## 2. Cómo crear un nuevo Reporte

Para crear un reporte en PDF, debes definir el contenido como un componente de React usando las primitivas de `@react-pdf/renderer` (`<View>`, `<Text>`, `<Image>`, `<StyleSheet>`).

**NO USES HTML (div, span, p) DENTRO DE ESTE COMPONENTE.**  Solo se permiten las primitivas exportadas por `@react-pdf/renderer`.

### Ejemplo Práctico

1.  **Define el contenido del documento:**

```jsx
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import MasterPDFTemplate from '@/components/pdf/MasterPDFTemplate';

const styles = StyleSheet.create({
  table: { display: 'flex', flexDirection: 'column', marginTop: 10 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 5 },
  cell: { fontSize: 10, flex: 1, color: '#333' }
});

const ReporteEjemplo = ({ data }) => (
  <MasterPDFTemplate title="Reporte de Ventas">
     <View style={styles.table}>
        {data.map((item, index) => (
           <View key={index} style={styles.row}>
             <Text style={styles.cell}>{item.nombre}</Text>
             <Text style={styles.cell}>{item.monto}</Text>
           </View>
        ))}
     </View>
  </MasterPDFTemplate>
);

export default ReporteEjemplo;
```

2.  **Integra el botón de descarga en la Vista (UI):**

En cualquier página del frontend (Vite/React):

```jsx
import React from 'react';
import ReporteEjemplo from './ReporteEjemplo'; // Componente creado en el paso 1
import ExportPDFButton from '@/components/pdf/ExportPDFButton';

const PaginaVentas = () => {
   const dataVentas = [{ nombre: 'Producto A', monto: '$100' }, { nombre: 'Producto B', monto: '$200' }];

   return (
      <div className="p-6">
         <h1 className="text-2xl font-bold">Ventas del Mes</h1>
         
         <div className="mt-4">
            <ExportPDFButton 
              document={<ReporteEjemplo data={dataVentas} />} 
              fileName="reporte-ventas-mensual.pdf"
              buttonText="Descargar Reporte"
            />
         </div>
      </div>
   );
};

export default PaginaVentas;
```

## 3. Notas Técnicas

-   **Estilos Corporativos:** Usa siempre la gama de grises oscuros (ej. `#333333` o `#666666`) para los textos del pdf, en vez de negro puro (`#000`), para un look más industrial y profesional.
-   **Compatibilidad Next.js vs Vite:** Aunque `@react-pdf/renderer` menciona el uso de `'use client'` para Next.js, en entornos Vite puro (como este) la directiva no es necesaria y el código se ejecuta de forma natural del lado del cliente.
-   **Manejo Asíncrono:** `ExportPDFButton` maneja internamente el estado `loading`. El documento base no se renderizará bloqueando el hilo principal.
