import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { FileDown, Loader2 } from 'lucide-react';

/**
 * Botón genérico para exportar PDFs usando @react-pdf/renderer
 * @param {Object} props
 * @param {React.ReactElement} props.document - Instancia de componente <Document> (ej. MasterPDFTemplate con hijos)
 * @param {string} props.fileName - Nombre del archivo a descargar (ej. "reporte-visita.pdf")
 * @param {string} props.buttonText - Texto a mostrar (default: "Exportar PDF")
 * @param {string} props.className - Clases CSS adicionales para Tailwind
 */
const ExportPDFButton = ({
    document,
    fileName = 'reporte.pdf',
    buttonText = 'Exportar PDF',
    className = ''
}) => {
    return (
        <PDFDownloadLink
            document={document}
            fileName={fileName}
        >
            {({ blob, url, loading, error }) => (
                <button
                    disabled={loading || error}
                    className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Generando documento...</span>
                        </>
                    ) : (
                        <>
                            <FileDown className="w-4 h-4" />
                            <span>{buttonText}</span>
                        </>
                    )}
                </button>
            )}
        </PDFDownloadLink>
    );
};

export default ExportPDFButton;
