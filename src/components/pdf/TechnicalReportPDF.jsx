// TechnicalReportPDF.jsx
// Plantilla de Informe Técnico de Proyecto para @react-pdf/renderer
// Paleta B/N corporativa optimizada para impresión.
// NO usa HTML, solo primitivas de @react-pdf/renderer.

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// ─── Paleta Blanco & Negro Corporativa ────────────────────────────────────────
const C = {
    black: '#111111',
    dark: '#333333',
    mid: '#555555',
    light: '#888888',
    pale: '#bbbbbb',
    border: '#cccccc',
    bg: '#f4f4f4',
    bgAlt: '#ebebeb',
    white: '#ffffff',
    accent: '#222222',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        paddingTop: 32,
        paddingBottom: 52,
        paddingHorizontal: 30,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: C.dark,
        backgroundColor: C.white,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottomWidth: 2,
        borderBottomColor: C.black,
        paddingBottom: 8,
        marginBottom: 14,
    },
    logoText: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: C.black, letterSpacing: 1 },
    logoSub: { fontSize: 7, color: C.mid, letterSpacing: 0.5 },
    headerRight: { alignItems: 'flex-end', gap: 2 },
    docTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: C.black },
    docMeta: { fontSize: 7, color: C.mid },

    // ── Section ──
    section: { marginBottom: 12 },
    sectionTitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        backgroundColor: C.accent,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    sectionSubtitle: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        backgroundColor: C.bgAlt,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginBottom: 4,
        marginTop: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ── Info Grid ──
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
    infoCell: { width: '24%', backgroundColor: C.bg, padding: 5, borderRadius: 2 },
    infoCellWide: { width: '49%', backgroundColor: C.bg, padding: 5, borderRadius: 2 },
    infoCellFull: { width: '100%', backgroundColor: C.bg, padding: 6, borderRadius: 2 },
    infoLabel: { fontSize: 6.5, color: C.light, textTransform: 'uppercase', marginBottom: 2 },
    infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.black },

    // ── KPI Row ──
    kpiRow: { flexDirection: 'row', gap: 4, marginBottom: 8 },
    kpiCell: {
        flex: 1,
        borderWidth: 1,
        borderColor: C.border,
        padding: 8,
        alignItems: 'center',
        borderRadius: 2,
    },
    kpiLabel: { fontSize: 6.5, color: C.light, textTransform: 'uppercase', textAlign: 'center', marginBottom: 3 },
    kpiValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: C.black, textAlign: 'center' },
    kpiUnit: { fontSize: 7, color: C.pale, textAlign: 'center' },
    kpiPos: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.black },
    kpiNeg: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.mid },

    // ── Table ──
    table: { width: '100%' },
    tableHead: { flexDirection: 'row', backgroundColor: C.accent, paddingHorizontal: 4, paddingVertical: 3 },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 4, paddingVertical: 3 },
    tableRowAlt: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 4, paddingVertical: 3, backgroundColor: C.bg },
    th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, flex: 1 },
    td: { fontSize: 8, color: C.dark, flex: 1 },
    tdBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black, flex: 1 },
    tdRight: { fontSize: 8, color: C.mid, flex: 1, textAlign: 'right' },
    tdMono: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black, flex: 1, textAlign: 'right' },

    // ── Total Row ──
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: C.accent,
        paddingHorizontal: 4,
        paddingVertical: 4,
        backgroundColor: C.bg,
    },

    // ── Badge ──
    badge: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.dark,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 2,
    },

    // ── Observations ──
    obsBox: { borderWidth: 1, borderColor: C.border, padding: 8, backgroundColor: C.bg, minHeight: 50, borderRadius: 2 },
    obsText: { fontSize: 9, color: C.dark, lineHeight: 1.6 },

    // ── Signature ──
    sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
    sigBox: { width: '44%', borderTopWidth: 1, borderTopColor: C.accent, paddingTop: 6, alignItems: 'center' },
    sigLabel: { fontSize: 8, color: C.mid, textAlign: 'center' },
    sigName: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.black, textAlign: 'center', marginTop: 2 },

    // ── Footer ──
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: { fontSize: 7, color: C.pale },
    pageNum: { fontSize: 7, color: C.mid },
});

// ─── Helper ──────────────────────────────────────────────────────────────────
const fmt = (val, dec = 2) => {
    const n = parseFloat(val);
    return isNaN(n) ? '-' : parseFloat(n.toFixed(dec)).toString();
};
const fmtCurrency = (val) => {
    const n = parseFloat(val);
    if (isNaN(n)) return '-';
    return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// ─── Componente Principal ─────────────────────────────────────────────────────
/**
 * TechnicalReportPDF
 * @param {Object}  project       - Datos del proyecto {name, client_name, status, start_date, ...}
 * @param {Array}   essays        - Lista de ensayos del proyecto en el período
 * @param {Array}   visits        - Lista de visitas del proyecto en el período
 * @param {Array}   complaints    - Lista de reclamos del proyecto
 * @param {Object}  financials    - { revenue, visitExpenses, materialExpensesTotal, realMargin }
 * @param {string}  startDate     - Fecha inicio del período (ISO)
 * @param {string}  endDate       - Fecha fin del período (ISO)
 * @param {string}  reportDate    - Fecha del informe (ISO)
 * @param {string}  conclusions   - Observaciones técnicas redactadas por el asesor
 * @param {string}  advisorName   - Nombre del asesor/firmante
 */
const TechnicalReportPDF = ({
    project = {},
    essays = [],
    visits = [],
    complaints = [],
    financials = {},
    startDate = '',
    endDate = '',
    reportDate = '',
    conclusions = '',
    advisorName = 'Asesor Técnico',
}) => {
    const generated = new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

    const visitsInRange = visits.filter(v => {
        if (!startDate || !endDate) return true;
        const d = v.date || v.scheduled_date || '';
        return d >= startDate && d <= endDate;
    });

    const essaysInRange = essays.filter(e => {
        if (!startDate || !endDate) return true;
        const d = e.date || '';
        return d >= startDate && d <= endDate;
    });

    const revenue = parseFloat(financials.revenue || 0);
    const expenses = parseFloat(financials.visitExpenses || 0) + parseFloat(financials.materialExpensesTotal || 0);
    const margin = parseFloat(financials.realMargin ?? (revenue - expenses));

    return (
        <Document title={`Informe Técnico — ${project.name}`}>
            <Page size="A4" style={s.page}>

                {/* ── HEADER ── Fix: título institucional */}
                <View style={s.header} fixed>
                    <View>
                        <Text style={s.logoText}>GESTIÓN TÉCNICA Y DESARROLLO</Text>
                        <Text style={s.logoSub}>Harinas y Panificados</Text>
                    </View>
                    <View style={s.headerRight}>
                        <Text style={s.docTitle}>INFORME TÉCNICO</Text>
                        <Text style={s.docMeta}>Período: {startDate} — {endDate}</Text>
                        <Text style={s.docMeta}>Fecha Informe: {reportDate || new Date().toLocaleDateString('es-AR')}</Text>
                    </View>
                </View>

                {/* ── IDENTIFICACIÓN DEL PROYECTO ── */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Identificación del Proyecto</Text>
                    <View style={s.infoGrid}>
                        <View style={s.infoCellWide}>
                            <Text style={s.infoLabel}>Proyecto</Text>
                            <Text style={s.infoValue}>{project.name || '-'}</Text>
                        </View>
                        <View style={s.infoCellWide}>
                            <Text style={s.infoLabel}>Cliente</Text>
                            <Text style={s.infoValue}>{project.client_name || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Estado</Text>
                            <Text style={s.infoValue}>{project.status || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Tipo</Text>
                            <Text style={s.infoValue}>{project.project_type || project.type || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Inicio Proyecto</Text>
                            <Text style={s.infoValue}>{project.start_date || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Asesor</Text>
                            <Text style={s.infoValue}>{advisorName}</Text>
                        </View>
                    </View>
                </View>

                {/* ── KPIs DEL PERÍODO — sin info financiera */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Resumen del Período</Text>
                    <View style={s.kpiRow}>
                        <View style={s.kpiCell}>
                            <Text style={s.kpiLabel}>Visitas Realizadas</Text>
                            <Text style={s.kpiValue}>{visitsInRange.filter(v => v.status === 'Realizada').length}</Text>
                            <Text style={s.kpiUnit}>de {visitsInRange.length} totales</Text>
                        </View>
                        <View style={s.kpiCell}>
                            <Text style={s.kpiLabel}>Ensayos Técnicos</Text>
                            <Text style={s.kpiValue}>{essaysInRange.length}</Text>
                            <Text style={s.kpiUnit}>formulaciones</Text>
                        </View>
                        <View style={s.kpiCell}>
                            <Text style={s.kpiLabel}>Reclamos</Text>
                            <Text style={s.kpiValue}>{complaints.length}</Text>
                            <Text style={s.kpiUnit}>registrados</Text>
                        </View>
                    </View>
                </View>


                {/* ── ESTADO FINANCIERO: ELIMINADO por solicitud del usuario ── */}


                {/* ── ENSAYOS DEL PERÍODO ── */}
                {essaysInRange.length > 0 && (
                    <View style={s.section} break>
                        <Text style={s.sectionTitle}>Ensayos Técnicos del Período</Text>
                        <View style={s.table}>
                            <View style={s.tableHead}>
                                <Text style={[s.th, { flex: 1.5 }]}>Código</Text>
                                <Text style={[s.th, { flex: 2 }]}>Fecha</Text>
                                <Text style={[s.th, { flex: 3 }]}>Producto</Text>
                                <Text style={[s.th, { flex: 2 }]}>Tipo</Text>
                                <Text style={[s.th, { textAlign: 'right' }]}>Puntaje</Text>
                            </View>
                            {essaysInRange.map((e, i) => (
                                <View key={e.id || i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                                    <Text style={[s.tdBold, { flex: 1.5 }]}>{e.code || `ENS-${e.id}`}</Text>
                                    <Text style={[s.td, { flex: 2 }]}>{e.date || '-'}</Text>
                                    <Text style={[s.td, { flex: 3 }]}>{e.product || '-'}</Text>
                                    <Text style={[s.td, { flex: 2 }]}>{e.essay_type || '-'}</Text>
                                    <Text style={[s.tdRight]}>{e.final_score ? `${e.final_score}/10` : '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── VISITAS DEL PERÍODO — sin columna honorario */}
                {visitsInRange.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Agenda de Visitas del Período</Text>
                        <View style={s.table}>
                            <View style={s.tableHead}>
                                <Text style={[s.th, { flex: 1.5 }]}>Fecha</Text>
                                <Text style={[s.th, { flex: 3 }]}>Objetivo</Text>
                                <Text style={[s.th, { flex: 2 }]}>Tipo</Text>
                                <Text style={[s.th, { flex: 1.5 }]}>Estado</Text>
                            </View>
                            {visitsInRange.map((v, i) => (
                                <View key={v.id || i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                                    <Text style={[s.tdBold, { flex: 1.5 }]}>{v.date || v.scheduled_date || '-'}</Text>
                                    <Text style={[s.td, { flex: 3 }]}>{v.objective || v.title || '-'}</Text>
                                    <Text style={[s.td, { flex: 2 }]}>{v.visit_type || '-'}</Text>
                                    <Text style={[s.td, { flex: 1.5 }]}>{v.status || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── RECLAMOS ── */}
                {complaints.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Reclamos Registrados</Text>
                        <View style={s.table}>
                            <View style={s.tableHead}>
                                <Text style={[s.th, { flex: 1.5 }]}>Fecha</Text>
                                <Text style={[s.th, { flex: 3 }]}>Descripción</Text>
                                <Text style={[s.th, { flex: 2 }]}>Estado</Text>
                                <Text style={[s.th, { flex: 2 }]}>Tipo</Text>
                            </View>
                            {complaints.map((c, i) => (
                                <View key={c.id || i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                                    <Text style={[s.td, { flex: 1.5 }]}>{c.date || '-'}</Text>
                                    <Text style={[s.td, { flex: 3 }]}>{c.description || '-'}</Text>
                                    <Text style={[s.td, { flex: 2 }]}>{c.status || '-'}</Text>
                                    <Text style={[s.td, { flex: 2 }]}>{c.complaint_type || '-'}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ── CONCLUSIONES Y OBSERVACIONES ── */}
                <View style={s.section} break={conclusions && conclusions.length > 200}>
                    <Text style={s.sectionTitle}>Conclusiones y Observaciones Técnicas</Text>
                    <View style={s.obsBox}>
                        {conclusions
                            ? <Text style={s.obsText}>{conclusions}</Text>
                            : <Text style={[s.obsText, { color: C.pale }]}>Sin observaciones redactadas para este período.</Text>
                        }
                    </View>
                </View>

                {/* ── FIRMAS ── */}
                <View style={s.sigRow}>
                    <View style={s.sigBox}>
                        <Text style={s.sigLabel}>Asesor Técnico</Text>
                        <Text style={s.sigName}>{advisorName}</Text>
                    </View>
                    <View style={s.sigBox}>
                        <Text style={s.sigLabel}>Representante del Cliente</Text>
                        <Text style={s.sigName}>{project.client_name || '________________________'}</Text>
                    </View>
                </View>

                {/* ── FOOTER ── */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>GESTIÓN TÉCNICA Y DESARROLLO · {project.name} · Documento de uso interno</Text>
                    <Text
                        style={s.pageNum}
                        render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}`}
                    />
                </View>

            </Page>
        </Document>
    );
};

export default TechnicalReportPDF;
