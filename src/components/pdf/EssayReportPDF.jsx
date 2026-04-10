// EssayReportPDF.jsx — v2
// Plantilla PDF de Reporte de Ensayo
// Fix 1: Encabezado institucional correcto
// Fix 2: Identificación con campos reales del API
// Fix 3: Valores sin redondear (fmtExact)
// Fix 4: Imágenes reciben base64 desde EssayDetail
// Fix 5: Parámetros de proceso con campos reales (baking_type)
// Solo primitivas @react-pdf/renderer. NO HTML.

import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// ─── Paleta B/N Corporativa ───────────────────────────────────────────────────
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
    accent: '#1a1a1a',
};

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    page: {
        paddingTop: 30,
        paddingBottom: 50,
        paddingHorizontal: 28,
        fontFamily: 'Helvetica',
        fontSize: 9,
        color: C.dark,
        backgroundColor: C.white,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 2,
        borderBottomColor: C.black,
        paddingBottom: 8,
        marginBottom: 14,
    },
    logoMain: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        color: C.black,
        letterSpacing: 0.5,
    },
    logoSub: {
        fontSize: 8,
        color: C.mid,
        letterSpacing: 0.3,
        marginTop: 2,
    },
    headerRight: { alignItems: 'flex-end' },
    docTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.black },
    docCode: { fontSize: 8, color: C.mid, marginTop: 2 },

    // ── Sección ──
    section: { marginBottom: 11 },
    sectionTitle: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        backgroundColor: C.accent,
        paddingHorizontal: 6,
        paddingVertical: 3,
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // ── Info Grid ──
    infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 4 },
    infoCell: { width: '24%', backgroundColor: C.bg, padding: 5, borderRadius: 2 },
    infoCellWide: { width: '49%', backgroundColor: C.bg, padding: 5, borderRadius: 2 },
    infoCellFull: { width: '100%', backgroundColor: C.bg, padding: 5, borderRadius: 2 },
    infoLabel: { fontSize: 6, color: C.light, textTransform: 'uppercase', marginBottom: 2, letterSpacing: 0.3 },
    infoValue: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: C.black },
    infoValueSmall: { fontSize: 8, color: C.dark },

    // ── Tabla ──
    table: { width: '100%' },
    tableHead: {
        flexDirection: 'row',
        backgroundColor: C.accent,
        paddingHorizontal: 4,
        paddingVertical: 3,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingHorizontal: 4,
        paddingVertical: 2.5,
    },
    tableRowAlt: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingHorizontal: 4,
        paddingVertical: 2.5,
        backgroundColor: C.bg,
    },
    th: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, flex: 1 },
    thRight: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: C.white, flex: 1, textAlign: 'right' },
    td: { fontSize: 8, color: C.dark, flex: 1 },
    tdBase: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black, flex: 1 },
    tdRight: { fontSize: 8, color: C.mid, flex: 1, textAlign: 'right' },
    tdBold: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black, flex: 1, textAlign: 'right' },

    // ── Fila total ──
    totalRow: {
        flexDirection: 'row',
        borderTopWidth: 2,
        borderTopColor: C.accent,
        paddingHorizontal: 4,
        paddingVertical: 4,
        backgroundColor: C.bgAlt,
    },

    // ── Lab ──
    labGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    labCell: {
        width: '23%',
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 2,
        padding: 4,
        alignItems: 'center',
    },
    labLabel: { fontSize: 6, color: C.light, textAlign: 'center', marginBottom: 2 },
    labValue: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: C.black },
    labUnit: { fontSize: 6, color: C.pale },

    // ── Proceso (tabla 2 columnas) ──
    processTable: { flexDirection: 'row', gap: 6 },
    processCol: { flex: 1 },
    processGrpTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        backgroundColor: C.mid,
        paddingHorizontal: 5,
        paddingVertical: 2,
        marginBottom: 3,
        textTransform: 'uppercase',
    },
    processRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingVertical: 2.5,
        paddingHorizontal: 4,
    },
    processRowAlt: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
        paddingVertical: 2.5,
        paddingHorizontal: 4,
        backgroundColor: C.bg,
    },
    processLabel: { fontSize: 7.5, color: C.mid },
    processValue: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black },

    // ── Evaluación sensorial ──
    evalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    evalCategory: { width: '31%', marginBottom: 4 },
    evalCatTitle: {
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        backgroundColor: C.mid,
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginBottom: 2,
    },
    evalItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 3 },
    evalName: { fontSize: 7.5, color: C.dark, flex: 1 },
    evalScore: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.black, width: 22, textAlign: 'right' },

    // ── Score ──
    scoreBox: {
        alignSelf: 'flex-start',
        borderWidth: 2,
        borderColor: C.accent,
        paddingHorizontal: 12,
        paddingVertical: 5,
        marginBottom: 8,
        alignItems: 'center',
    },
    scoreLbl: { fontSize: 6.5, color: C.mid, textTransform: 'uppercase', letterSpacing: 0.5 },
    scoreNum: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: C.black },

    // ── Imágenes ──
    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    imageBox: { width: '30%' },
    image: { width: '100%', height: 95, objectFit: 'cover', borderWidth: 1, borderColor: C.border },
    imgCaption: { fontSize: 6.5, color: C.light, textAlign: 'center', marginTop: 2 },
    imgPlaceholder: { width: '100%', height: 95, backgroundColor: C.bg, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
    imgPlaceholderText: { fontSize: 7, color: C.pale },

    // ── Observaciones ──
    obsBox: { borderWidth: 1, borderColor: C.border, padding: 8, backgroundColor: C.bg, minHeight: 36, borderRadius: 2 },
    obsText: { fontSize: 9, color: C.dark, lineHeight: 1.55 },

    // ── Footer ──
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 28,
        right: 28,
        borderTopWidth: 1,
        borderTopColor: C.border,
        paddingTop: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    footerText: { fontSize: 6.5, color: C.pale },
    pageNum: { fontSize: 6.5, color: C.mid },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Máx. 2 decimales, sin trailing zeros innecesarios, sin artefactos de float
const fmtExact = (val) => {
    if (val === null || val === undefined || val === '') return '-';
    const n = parseFloat(val);
    if (isNaN(n)) return '-';
    // Redondear a 2 decimales para evitar 0.240000000002, luego quitar ceros finales
    return String(parseFloat(n.toFixed(2)));
};

// Para laboratorio misma lógica
const fmtLab = fmtExact;


// Helper nombre laboratorio
const LAB_FIELDS = [
    { key: 'humidity_pct', label: 'Humedad', unit: '%' },
    { key: 'ash_pct', label: 'Cenizas', unit: '%' },
    { key: 'protein_pct', label: 'Proteínas', unit: '%' },
    { key: 'gluten_wet_pct', label: 'Gluten Húmedo', unit: '%' },
    { key: 'gluten_dry_pct', label: 'Gluten Seco', unit: '%' },
    { key: 'gluten_index_pct', label: 'Gluten Index', unit: '' },
    { key: 'falling_number_sec', label: 'Falling Number', unit: 's' },
    { key: 'w_value', label: 'W (Fuerza)', unit: '' },
    { key: 'pl_ratio', label: 'Relación P/L', unit: '' },
    { key: 'p_value', label: 'Tenacidad P', unit: '' },
    { key: 'l_value', label: 'Extensibilidad L', unit: 'mm' },
    { key: 'water_absorption_pct', label: 'Absorción Agua', unit: '%' },
    { key: 'stability_min', label: 'Estabilidad', unit: 'min' },
    { key: 'development_time_min', label: 'Desarrollo', unit: 'min' },
    { key: 'starch_damage_pct', label: 'Daño Almidón', unit: '%' },
    { key: 'zeleny_ml', label: 'Zeleny', unit: 'ml' },
    { key: 'color_l', label: 'Color L*', unit: '' },
    { key: 'color_a', label: 'Color a*', unit: '' },
    { key: 'color_b', label: 'Color b*', unit: '' },
];

// Fix 5: Parámetros reales de proceso, separados por baking_type
const PROCESO_FERMENTADO = [
    {
        grupo: 'Amasado y Corte',
        fields: [
            { key: 'kneading_time_v1_min', label: 'Amasado Vel. 1', unit: 'min' },
            { key: 'kneading_time_v2_min', label: 'Amasado Vel. 2', unit: 'min' },
            { key: 'kneading_temp_c', label: 'Temp. Masa Final', unit: '°C' },
            { key: 'sobado_turns', label: 'Vueltas de Sobado', unit: 'vts' },
            { key: 'piece_weight_g', label: 'Peso Corte Crudo', unit: 'g' },
        ]
    },
    {
        grupo: 'Fermentación y Horno',
        fields: [
            { key: 'fermentation_time_min', label: 'Tiempo Fermentación', unit: 'min' },
            { key: 'fermentation_temp_c', label: 'Temp. Cámara', unit: '°C' },
            { key: 'fermentation_humidity_pct', label: 'Humedad Cámara', unit: '%' },
            { key: 'oven_temp_c', label: 'Temp. Horno', unit: '°C' },
            { key: 'oven_time_min', label: 'Tiempo Horno', unit: 'min' },
            { key: 'scoring_score', label: 'Greñado (1-10)', unit: 'pts' },
        ]
    },
];

const PROCESO_BATIDO = [
    {
        grupo: 'Batido y Mezclado',
        fields: [
            { key: 'batter_speed', label: 'Velocidad', unit: '' },
            { key: 'batter_time_min', label: 'Tiempo Total', unit: 'min' },
            { key: 'batter_density_g_cm3', label: 'Densidad Batido', unit: 'g/cc' },
        ]
    },
    {
        grupo: 'Molde y Horneado',
        fields: [
            { key: 'mold_diameter_cm', label: 'Diámetro Molde', unit: 'cm' },
            { key: 'oven_temp_c', label: 'Temp. Horno', unit: '°C' },
            { key: 'raw_weight_g', label: 'Peso Crudo', unit: 'g' },
            { key: 'baked_volume_height', label: 'Altura Horneado', unit: 'cm' },
        ]
    },
];

// Sub-componente: fila de proceso
const ProcessRow = ({ label, value, unit, idx }) => {
    const RowStyle = idx % 2 === 0 ? s.processRow : s.processRowAlt;
    return (
        <View style={RowStyle}>
            <Text style={s.processLabel}>{label}</Text>
            <Text style={s.processValue}>{fmtExact(value)}{value !== null && value !== undefined && value !== '' && !isNaN(parseFloat(value)) ? ` ${unit}` : ''}</Text>
        </View>
    );
};

// ─── Componente Principal ─────────────────────────────────────────────────────
/**
 * EssayReportPDF - v2 (con campos reales del API)
 * @param {Object}  ensayo      - Objeto del ensayo desde API
 * @param {Array}   detailsData - Ingredientes/Formulación
 * @param {Object}  evalData    - { categoria: [{name, active, score}] }
 * @param {number}  finalScore  - Puntaje final calculado
 * @param {Array}   images      - Imágenes con base64: [{base64, caption}]
 */
const EssayReportPDF = ({ ensayo = {}, detailsData = [], evalData = {}, finalScore = 0, images = [] }) => {

    // Ordenar por peso mayor a menor
    const sorted = [...detailsData].sort((a, b) => parseFloat(b.quantity || 0) - parseFloat(a.quantity || 0));

    // Harina base para divisor panadero
    const baseIngredients = detailsData.filter(d => d.is_base_flour);
    const divisor = baseIngredients.reduce((s, d) => s + parseFloat(d.quantity || 0), 0) || 1;

    // Costo total
    const totalCost = detailsData.reduce((acc, item) => {
        const price = parseFloat(item.price_per_kg || item.cost_per_kg || 0);
        const qty = parseFloat(item.quantity || 0);
        return acc + price * qty;
    }, 0);

    // Total gramos
    const totalGrams = detailsData.reduce((acc, d) => acc + parseFloat(d.quantity || 0) * 1000, 0);

    // Lab con datos
    const labWithData = LAB_FIELDS.filter(f => {
        const v = ensayo[f.key];
        return v !== null && v !== undefined && v !== 0 && v !== '';
    });

    // Eval activos
    const evalCategories = Object.entries(evalData).filter(([, items]) => items.some(i => i.active));

    // Fix 5: proceso según baking_type
    const isBatido = (ensayo.baking_type || '').toLowerCase() === 'batido';
    const procesoGroups = isBatido ? PROCESO_BATIDO : PROCESO_FERMENTADO;
    const procesoConDatos = procesoGroups.map(g => ({
        ...g,
        fields: g.fields.filter(f => {
            const v = ensayo[f.key];
            return v !== null && v !== undefined && v !== '' && v !== 0;
        })
    })).filter(g => g.fields.length > 0);

    return (
        <Document title={`Reporte Ensayo ${ensayo.code || ensayo.id}`}>
            <Page size="A4" style={s.page}>

                {/* ══ HEADER ══ Fix 1 */}
                <View style={s.header} fixed>
                    <View>
                        {/* Fix 1: título institucional correcto */}
                        <Text style={s.logoMain}>GESTIÓN TÉCNICA Y DESARROLLO · Harinas y Panificados</Text>
                    </View>
                    <View style={s.headerRight}>
                        <Text style={s.docTitle}>REPORTE DE ENSAYO</Text>
                        {/* Fix 1: solo código, sin fecha/hora de generación */}
                        <Text style={s.docCode}>Código: {ensayo.code || `ENS-${ensayo.id}`}</Text>
                    </View>
                </View>

                {/* ══ IDENTIFICACIÓN ══ Fix 2: campos reales */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Identificación</Text>
                    <View style={s.infoGrid}>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Código</Text>
                            <Text style={s.infoValue}>{ensayo.code || `ENS-${ensayo.id}`}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Fecha</Text>
                            <Text style={s.infoValue}>{ensayo.date || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Tipo de Producción</Text>
                            {/* Fix 2: baking_type es el campo real (Fermentado / Batido) */}
                            <Text style={s.infoValue}>{ensayo.baking_type || '-'}</Text>
                        </View>
                        <View style={s.infoCell}>
                            <Text style={s.infoLabel}>Harina Total</Text>
                            <Text style={s.infoValue}>{fmtExact(ensayo.total_harina_grams)} g</Text>
                        </View>
                    </View>
                    <View style={s.infoGrid}>
                        <View style={s.infoCellFull}>
                            {/* Fix 2: description es el campo real del objetivo técnico */}
                            <Text style={s.infoLabel}>Objetivo / Descripción Técnica</Text>
                            <Text style={s.infoValueSmall}>{ensayo.description || '-'}</Text>
                        </View>
                    </View>
                    {ensayo.conclusion && (
                        <View style={s.infoGrid}>
                            <View style={s.infoCellFull}>
                                {/* Fix 2: conclusion es el campo real de cierre del asesor */}
                                <Text style={s.infoLabel}>Conclusión del Asesor</Text>
                                <Text style={s.infoValueSmall}>{ensayo.conclusion}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* ══ FORMULACIÓN ══ Fix 3: valores sin redondear */}
                {sorted.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Formulación</Text>
                        <View style={s.table}>
                            <View style={s.tableHead}>
                                <Text style={[s.th, { flex: 3 }]}>Ingrediente</Text>
                                <Text style={s.thRight}>Gramos</Text>
                                <Text style={s.thRight}>% Panadero</Text>
                                <Text style={s.thRight}>PPM</Text>
                                <Text style={s.thRight}>$/kg</Text>
                                <Text style={s.thRight}>Costo</Text>
                            </View>

                            {sorted.map((item, i) => {
                                const qty = parseFloat(item.quantity || 0);
                                const grams = qty * 1000;
                                const pct = divisor > 0 ? (qty / divisor) * 100 : 0;
                                const ppm = divisor > 0 ? (qty / divisor) * 1000000 : 0;
                                const price = parseFloat(item.price_per_kg || item.cost_per_kg || 0);
                                const lineCost = price * qty;
                                const RowStyle = i % 2 === 0 ? s.tableRow : s.tableRowAlt;
                                const isBase = item.is_base_flour;

                                return (
                                    <View key={item.id || i} style={RowStyle}>
                                        {/* Fix 3: sin toFixed, valores exactos */}
                                        <Text style={[isBase ? s.tdBase : s.td, { flex: 3 }]}>
                                            {item.ingredient_name || '-'}{isBase ? ' ★' : ''}
                                        </Text>
                                        <Text style={s.tdBold}>{fmtExact(grams)}</Text>
                                        <Text style={s.tdRight}>{fmtExact(pct)}%</Text>
                                        <Text style={s.tdRight}>
                                            {/* PPM solo para aditivos (< 10,000 ppm = < 1%) */}
                                            {pct < 99 ? fmtExact(ppm) : '-'}
                                        </Text>
                                        <Text style={s.tdRight}>{price > 0 ? `$${fmtExact(price)}` : '-'}</Text>
                                        <Text style={s.tdRight}>{lineCost > 0 ? `$${fmtExact(lineCost)}` : '-'}</Text>
                                    </View>
                                );
                            })}

                            <View style={s.totalRow}>
                                <Text style={[s.td, { flex: 3, fontFamily: 'Helvetica-Bold' }]}>TOTAL</Text>
                                <Text style={[s.tdBold]}>{fmtExact(totalGrams)}</Text>
                                <Text style={s.tdRight}>—</Text>
                                <Text style={s.tdRight}>—</Text>
                                <Text style={s.tdRight}>—</Text>
                                <Text style={[s.tdBold]}>
                                    {totalCost > 0 ? `$${fmtExact(totalCost)}` : '-'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* ══ PARÁMETROS DE PROCESO ══ Fix 5: campos reales */}
                {procesoConDatos.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>
                            Parámetros de Proceso — {isBatido ? 'Pastelería / Batido' : 'Panificados / Fermentado'}
                        </Text>
                        <View style={s.processTable}>
                            {procesoConDatos.map((grupo) => (
                                <View key={grupo.grupo} style={s.processCol}>
                                    <Text style={s.processGrpTitle}>{grupo.grupo}</Text>
                                    {grupo.fields.map((f, idx) => (
                                        <ProcessRow
                                            key={f.key}
                                            label={f.label}
                                            value={ensayo[f.key]}
                                            unit={f.unit}
                                            idx={idx}
                                        />
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ══ ANÁLISIS DE LABORATORIO ══ */}
                {labWithData.length > 0 && (
                    <View style={s.section}>
                        <Text style={s.sectionTitle}>Análisis de Laboratorio</Text>
                        <View style={s.labGrid}>
                            {labWithData.map((f, i) => (
                                <View key={i} style={s.labCell}>
                                    <Text style={s.labLabel}>{f.label}</Text>
                                    <Text style={s.labValue}>{fmtLab(ensayo[f.key])}</Text>
                                    {f.unit ? <Text style={s.labUnit}>{f.unit}</Text> : null}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ══ EVALUACIÓN SENSORIAL ══ */}
                {evalCategories.length > 0 && (
                    <View style={s.section} break>
                        <Text style={s.sectionTitle}>Evaluación Sensorial</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                            <View style={s.scoreBox}>
                                <Text style={s.scoreLbl}>Puntaje Final</Text>
                                <Text style={s.scoreNum}>{finalScore}</Text>
                                <Text style={s.scoreLbl}>/ 10</Text>
                            </View>
                        </View>
                        <View style={s.evalGrid}>
                            {evalCategories.map(([cat, items]) => (
                                <View key={cat} style={s.evalCategory}>
                                    <Text style={s.evalCatTitle}>{cat}</Text>
                                    {items.filter(i => i.active).map((item, idx) => (
                                        <View key={idx} style={s.evalItem}>
                                            <Text style={s.evalName}>{item.name}</Text>
                                            <Text style={s.evalScore}>{item.score || '-'}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* ══ GALERÍA FOTOGRÁFICA ══ Fix 4: usa base64 */}
                {images.length > 0 && (
                    <View style={s.section} break>
                        <Text style={s.sectionTitle}>Registro Fotográfico</Text>
                        <View style={s.imageGrid}>
                            {images.map((img, i) => {
                                const src = img.base64 || null;
                                return (
                                    <View key={i} style={s.imageBox}>
                                        {src
                                            ? <Image style={s.image} src={src} />
                                            : (
                                                <View style={s.imgPlaceholder}>
                                                    <Text style={s.imgPlaceholderText}>Sin imagen</Text>
                                                </View>
                                            )
                                        }
                                        <Text style={s.imgCaption}>{img.caption || `Foto ${i + 1}`}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* ══ FOOTER ══ */}
                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        GESTIÓN TÉCNICA Y DESARROLLO · {ensayo.code || `ENS-${ensayo.id}`} · Documento de uso interno
                    </Text>
                    <Text
                        style={s.pageNum}
                        render={({ pageNumber, totalPages }) => `Pág. ${pageNumber} / ${totalPages}`}
                    />
                </View>

            </Page>
        </Document>
    );
};

export default EssayReportPDF;
