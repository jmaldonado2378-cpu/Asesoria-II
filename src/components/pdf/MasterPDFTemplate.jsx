import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Nota: Puedes registrar fuentes aquí si lo necesitas. Helvetica es estándar y no requiere carga,
// pero si usaras otra, se usaría Font.register({ family: '...', src: '...' })

// Estilos corporativos base
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333333',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        paddingBottom: 60, // Espacio para el footer
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#666666',
        borderBottomStyle: 'solid',
    },
    logoPlaceholder: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
    },
    headerRight: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    dateText: {
        fontSize: 8,
        color: '#666666',
    },
    contentContainer: {
        flexGrow: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#666666',
        fontSize: 8,
        borderTopWidth: 1,
        borderTopColor: '#e5e5e5',
        borderTopStyle: 'solid',
        paddingTop: 10,
    }
});

/**
 * Plantilla Maestra para generación de PDFs
 * @param {Object} props
 * @param {string} props.title - Título del documento a mostrar en el encabezado
 * @param {React.ReactNode} props.children - Contenido dinámico del reporte
 */
const MasterPDFTemplate = ({ title = "Reporte", children }) => {
    const currentDate = new Date().toLocaleString('es-AR', {
        dateStyle: 'short',
        timeStyle: 'short'
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header Estandarizado */}
                <View style={styles.header} fixed>
                    <View>
                        <Text style={styles.logoPlaceholder}>LOGO SISTEMA</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.dateText}>Generado: {currentDate}</Text>
                    </View>
                </View>

                {/* Contenido Dinámico */}
                <View style={styles.contentContainer}>
                    {children}
                </View>

                {/* Footer con Paginación Dinámica */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) => (
                        `Página ${pageNumber} de ${totalPages}`
                    )}
                    fixed
                />
            </Page>
        </Document>
    );
};

export default MasterPDFTemplate;
