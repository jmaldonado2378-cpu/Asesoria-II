import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FlaskConical, Save, X, Edit3, Timer, Thermometer,
    ChefHat, Ruler, Scale, FileText, Image as ImageIcon,
    Trash2, Upload, Settings, CheckSquare, Square,
    ClipboardCheck, Plus, Printer, Wheat, Award
} from 'lucide-react';
import EssayReportPDF from '../components/pdf/EssayReportPDF';
import ExportPDFButton from '../components/pdf/ExportPDFButton';
import { API_URL } from '../config';

// --- COMPONENTES EXTERNOS (SOLUCIÓN AL PROBLEMA DE FOCO) ---
const WebProcessRow = ({ label, name, unit, value, onChange, isEditing, formData }) => {
    const displayValue = isEditing ? (formData[name] !== undefined ? formData[name] : value) : value;

    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 hover:bg-slate-50 px-2 transition group">
            <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900">{label}</span>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <input
                        type="text"
                        inputMode="decimal"
                        name={name}
                        value={displayValue !== null ? displayValue : ''}
                        onChange={onChange}
                        className="w-24 text-right border border-slate-300 rounded text-sm font-bold p-1 outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors"
                    />
                ) : (
                    <span className="font-mono font-bold text-slate-800">{value !== null && value !== undefined ? value : '-'}</span>
                )}
                <span className="text-xs text-slate-400 w-8">{unit}</span>
            </div>
        </div>
    );
};


// --- CONSTANTES ---
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
    { key: 'p_value', label: 'Tenacidad (P)', unit: '' },
    { key: 'l_value', label: 'Extensibilidad (L)', unit: 'mm' },
    { key: 'water_absorption_pct', label: 'Absorción Agua', unit: '%' },
    { key: 'stability_min', label: 'Estabilidad', unit: 'min' },
    { key: 'development_time_min', label: 'Desarrollo', unit: 'min' },
    { key: 'starch_damage_pct', label: 'Daño Almidón', unit: '%' },
    { key: 'zeleny_ml', label: 'Zeleny', unit: 'ml' },
    { key: 'color_l', label: 'Color L* (Luz)', unit: '' },
    { key: 'color_a', label: 'Color a* (Rojo/Verde)', unit: '' },
    { key: 'color_b', label: 'Color b* (Amarillo/Azul)', unit: '' },
];

const INITIAL_EVALUATION = {
    "AMASADO": [
        { name: "Amasado Vel. 1", active: false, score: "" },
        { name: "Amasado Vel. 2", active: false, score: "" },
        { name: "Temp. Final", active: false, score: "" },
        { name: "Textura/Pegaj.", active: false, score: "" },
        { name: "Consistencia", active: false, score: "" },
    ],
    "REBOLLADO": [{ name: "Textura/Pegaj.", active: false, score: "" }],
    "ARMADO": [{ name: "Firmeza", active: false, score: "" }, { name: "Pegajosidad", active: false, score: "" }],
    "FERMENTACIÓN": [{ name: "Firmeza", active: false, score: "" }, { name: "Pegajosidad", active: false, score: "" }],
    "CARAC. EXTERNAS": [{ name: "Color", active: false, score: "" }, { name: "Corteza", active: false, score: "" }, { name: "Volumen", active: false, score: "" }],
    "CARAC. INTERNAS": [{ name: "Color Miga", active: false, score: "" }, { name: "Alveolado", active: false, score: "" }]
};

export default function EssayDetail() {
    const { id } = useParams();
    const [ensayo, setEnsayo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [detailsData, setDetailsData] = useState([]);
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [evalData, setEvalData] = useState(INITIAL_EVALUATION);
    const [finalScore, setFinalScore] = useState(0);
    const [visibleFields, setVisibleFields] = useState(['humidity_pct', 'gluten_wet_pct', 'w_value', 'pl_ratio']);
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const selectorRef = useRef(null);
    const [allIngredients, setAllIngredients] = useState([]);
    const [newIngredientId, setNewIngredientId] = useState('');
    const [newIngredientGrams, setNewIngredientGrams] = useState('');
    const [newIngredientPrice, setNewIngredientPrice] = useState('');
    // Fix 4: Estado para imágenes convertidas a base64 (para @react-pdf/renderer)
    const [imagesForPDF, setImagesForPDF] = useState([]);
    const [isPdfReady, setIsPdfReady] = useState(false);


    useEffect(() => {
        fetchData();
        fetch(`${API_URL}/api/ingredients/`).then(res => res.json()).then(data => setAllIngredients(data)).catch(console.error);
        const handleClickOutside = (event) => { if (selectorRef.current && !selectorRef.current.contains(event.target)) setShowFieldSelector(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);

    // Fix 4: Convertir imágenes a base64 cuando cambian
    useEffect(() => {
        if (!images || images.length === 0) {
            setImagesForPDF([]);
            setIsPdfReady(true);
            return;
        }
        setIsPdfReady(false);
        const convertAll = async () => {
            const results = await Promise.all(images.map(async (img) => {
                try {
                    const url = img.image;
                    const res = await fetch(url);
                    const blob = await res.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve({ ...img, base64: reader.result });
                        reader.onerror = () => resolve({ ...img, base64: null });
                        reader.readAsDataURL(blob);
                    });
                } catch {
                    return { ...img, base64: null };
                }
            }));
            setImagesForPDF(results);
            setIsPdfReady(true);
        };
        convertAll();
    }, [images]);

    useEffect(() => {
        let total = 0; let count = 0;
        Object.keys(evalData).forEach(category => { evalData[category].forEach(item => { if (item.active && item.score !== "") { total += parseFloat(item.score); count++; } }); });
        setFinalScore(count > 0 ? (total / count).toFixed(2) : 0);
    }, [evalData]);

    const totalCost = useMemo(() => {
        return detailsData.reduce((acc, item) => {
            const price = parseFloat(item.price_per_kg || item.cost_per_kg || 0); const qty = parseFloat(item.quantity || 0); return acc + (price * qty);
        }, 0);
    }, [detailsData]);

    const fetchData = () => {
        fetch(`${API_URL}/api/ensayos/${id}/`).then(res => res.json()).then(data => {
            if (!data || data.detail) {
                console.error("Essay not found or API error", data);
                setEnsayo(null);
                setLoading(false);
                return;
            }
            setEnsayo(data);
            setFormData(data);
            setDetailsData(Array.isArray(data.details) ? data.details : []);
            setImages(data.images || []);
            if (data.evaluation_data && Object.keys(data.evaluation_data).length > 0) setEvalData(data.evaluation_data); else setEvalData(INITIAL_EVALUATION);
            setLoading(false);
            const autoDetected = LAB_FIELDS.filter(f => data[f.key] !== null && data[f.key] !== undefined && data[f.key] !== 0).map(f => f.key);
            const combined = Array.from(new Set([...visibleFields, ...autoDetected]));
            if (combined.length > visibleFields.length) setVisibleFields(combined);
        }).catch(err => {
            console.error("Fetch error:", err);
            setLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            alert("⚠️ Error de conexión: " + err.message);
            setLoading(false);
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const isDecimal = e.target.getAttribute('inputmode') === 'decimal';
        const finalValue = isDecimal ? String(value).replace(/,/g, '.') : value;
        setFormData(prev => ({ ...prev, [name]: (type === 'number' && value === '') ? null : finalValue }));
    };

    const handleDetailChange = (index, field, value) => {
        const updatedDetails = [...detailsData];
        const item = updatedDetails[index];
        if (!item) return;

        if (field === 'quantity_grams') {
            item.quantity_grams = value;
            item.quantity = ((parseFloat(String(value).replace(/,/g, '.')) || 0) / 1000).toFixed(9);
        } else if (field === 'price_per_kg') {
            item.price_per_kg = (value === '') ? null : parseFloat(String(value).replace(/,/g, '.')).toFixed(4);
        }

        // 1. Calcular el Sumatorio de Harinas Base (Divisor Panadero)
        const sumBase = updatedDetails.reduce((sum, d) => {
            // Consideramos base si tiene el flag is_base_flour o si es el primer item que identificamos como harina
            const isBase = d.is_base_flour === true || d.is_base_flour === 1 || Boolean(d.is_base_flour);
            return isBase ? sum + (parseFloat(d.quantity) || 0) : sum;
        }, 0);

        let divisor = sumBase;
        if (divisor === 0) {
            // Si no hay nada marcado como base, buscamos el primer ingrediente con "harina" en el nombre
            const fallback = updatedDetails.find(d => d.ingredient_name?.toLowerCase().includes('harina'));
            divisor = fallback ? (parseFloat(fallback.quantity) || 0) : (parseFloat(formData.total_harina) || 1);
        }

        // 2. Sincronizar estados globales si el divisor ha cambiado o si estamos editando una harina
        if (divisor > 0) {
            setFormData(prev => ({ ...prev, total_harina: divisor, total_harina_grams: divisor * 1000 }));
            setEnsayo(prev => ({ ...prev, total_harina: divisor, total_harina_grams: divisor * 1000 }));
        }

        // 3. Recalcular métricas de todos los ingredientes basándose en el divisor actual
        updatedDetails.forEach(d => {
            if (divisor > 0) {
                const q = parseFloat(d.quantity) || 0;
                d.panadero_pct = (q / divisor) * 100;
                d.ppm_calc = (q / divisor) * 1000000;
                d.dosis_25kg = (q / divisor) * 25000;
            }
        });

        setDetailsData(updatedDetails);
    };

    const handleIngredientSelect = (id) => {
        setNewIngredientId(id);
        const selected = allIngredients.find(ing => ing.id === parseInt(id));
        if (selected) setNewIngredientPrice(selected.default_price || '0.0000');
    };

    const handleSave = async () => {
        try {
            await fetch(`${API_URL}/api/ensayos/${id}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, evaluation_data: evalData, final_score: finalScore }) });
            const updatePromises = detailsData.map(async detail => {
                const qValue = parseFloat(detail.quantity) || 0;
                const pValue = parseFloat(detail.price_per_kg || detail.cost_per_kg) || 0;
                const r = await fetch(`${API_URL}/api/ensayo-details/${detail.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: qValue.toFixed(9), price_per_kg: pValue.toFixed(4) }) });
                if (!r.ok) { throw new Error(await r.text()); }
                return r;
            });
            await Promise.all(updatePromises); fetchData(); setIsEditing(false); alert('Guardado correctamente');
        } catch (error) { alert(`Error al guardar: ${error.message}`); }
    };

    const handleAddIngredient = async () => {
        if (!newIngredientId || !newIngredientGrams) return alert('Datos incompletos');
        try {
            const res = await fetch(`${API_URL}/api/ensayo-details/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ensayo: id,
                    ingredient: newIngredientId,
                    quantity: (parseFloat(String(newIngredientGrams).replace(/,/g, '.')) / 1000).toFixed(9),
                    price_per_kg: (parseFloat(String(newIngredientPrice).replace(/,/g, '.')) || 0).toFixed(4)
                })
            });
            if (res.ok) {
                setNewIngredientId(''); setNewIngredientGrams(''); setNewIngredientPrice(''); fetchData();
            } else {
                const errText = await res.text();
                alert(`Error backend: ${res.status} - ${errText}`);
            }
        } catch (e) { alert(`Exception: ${e.message}`); console.error(e); }
    };

    const handleDeleteIngredient = async (id) => { if (confirm('¿Borrar?')) { await fetch(`${API_URL}/api/ensayo-details/${id}/`, { method: 'DELETE' }); fetchData(); } };
    const handleFileUpload = async (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setUploading(true);
        try {
            const d = new FormData();
            d.append('image', f);
            d.append('ensayo', id);
            d.append('caption', 'Sin título');
            const res = await fetch(`${API_URL}/api/ensayo-images/`, {
                method: 'POST',
                body: d
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Error ${res.status}: ${errText}`);
            }
            await fetchData();
        } catch (err) {
            console.error("Upload error:", err);
            alert(`❌ Error al subir imagen: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };
    const handleCaptionChange = (id, txt) => setImages(images.map(i => i.id === id ? { ...i, caption: txt } : i));
    const saveCaption = async (id, txt) => fetch(`${API_URL}/api/ensayo-images/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: txt }) });
    const handleDeleteImage = async (id) => { if (confirm('¿Borrar?')) { await fetch(`${API_URL}/api/ensayo-images/${id}/`, { method: 'DELETE' }); setImages(images.filter(i => i.id !== id)); } };
    const handleEvalChange = (c, i, f, v) => { const n = { ...evalData }; n[c][i][f] = v; setEvalData(n); };
    const toggleField = (k) => setVisibleFields(prev => prev.includes(k) ? prev.filter(f => f !== k) : [...prev, k]);

    // Smart number formatter: removes trailing zeros. 40.0000 → 40, 0.2400 → 0.24
    const fmt = (val, maxDecimals = 4) => {
        const n = parseFloat(val);
        if (isNaN(n)) return '-';
        return parseFloat(n.toFixed(maxDecimals)).toString();
    };

    // Sort ingredients by weight descending (heaviest first)
    const sortedDetails = [...detailsData].sort((a, b) => parseFloat(b.quantity || 0) - parseFloat(a.quantity || 0));

    // handlePrint reemplazado por ExportPDFButton + EssayReportPDF (ver sección de UI)


    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <span className="text-sm font-mono uppercase tracking-widest">Cargando Ensayo...</span>
        </div>
    );
    if (!ensayo) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Error: Ensayo no disponible.</span>
        </div>
    );
    const isBatido = formData.baking_type === 'Batido';


    const baseFlourIndex = detailsData.findIndex(d =>
        d.is_base_flour === true ||
        d.is_base_flour === 1 ||
        d.is_base_flour === "1" ||
        d.ingredient_name?.toLowerCase().includes('harina base') ||
        parseFloat(d.panadero_pct) === 100
    );

    return (
        <div className="min-h-screen p-6 pb-20 print:p-0 print:bg-white print:min-h-0 print:block print:h-auto"
            style={{ background: 'var(--bg-main)' }}>


            {/* --- INTERFAZ WEB --- */}
            <div>
                <div className="max-w-5xl mx-auto mb-5 flex justify-between items-center print:hidden">
                    <Link to="/essays" className="flex items-center gap-2 text-sm font-medium transition"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Volver
                    </Link>
                    <div className="flex gap-2">
                        {!isPdfReady ? (
                            <span className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold opacity-50"
                                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                ⏳ Preparando imágenes...
                            </span>
                        ) : (
                            <ExportPDFButton
                                document={
                                    <EssayReportPDF
                                        ensayo={ensayo}
                                        detailsData={detailsData}
                                        evalData={evalData}
                                        finalScore={finalScore}
                                        images={imagesForPDF}
                                    />
                                }
                                fileName={`Reporte_Ensayo_${ensayo?.code || ensayo?.id}.pdf`}
                                buttonText="Exportar PDF"
                                className="text-sm"
                                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                            />
                        )}
                        {!isEditing
                            ? <button onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition"
                                style={{ background: 'var(--accent-2)', color: '#fff' }}>
                                <Edit3 size={15} /> Editar Todo
                            </button>
                            : <>
                                <button onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                    <X size={15} /> Cancelar
                                </button>
                                <button onClick={handleSave}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition"
                                    style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                    <Save size={15} /> Guardar
                                </button>
                            </>
                        }
                    </div>
                </div>

                <div id="report-content" className="max-w-5xl mx-auto shadow-xl rounded-sm overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    {/* === HEADER INSTITUCIONAL (estilo unificado con informe técnico) === */}
                    <header className="bg-slate-900 px-8 pt-6 pb-5 flex justify-between items-start relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                        <div className="z-10">
                            <div className="text-slate-400 text-[9px] font-bold uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                                <Award size={11} className="text-indigo-400" /> GESTIÓN TÉCNICA Y DESARROLLO · Harinas y Panificados
                            </div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight leading-none mb-3">Reporte de Ensayo</h1>
                            <div className="flex flex-wrap items-center gap-3 text-[11px]">
                                <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-sm font-bold font-mono tracking-wider">{ensayo.code || `ID: ${ensayo.id}`}</span>
                                <span className="text-slate-300 font-medium">{ensayo.client_name}</span>
                                <span className="text-slate-600">·</span>
                                <span className="text-slate-400">{ensayo.date}</span>
                                {ensayo.product && <><span className="text-slate-600">·</span><span className="text-slate-300">{ensayo.product}</span></>}
                            </div>
                        </div>
                        <div className="text-right z-10 ml-6 flex-shrink-0">
                            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Puntaje Global</div>
                            <div className={`text-6xl font-bold leading-none ${finalScore >= 8 ? 'text-green-400' : finalScore >= 6 ? 'text-orange-400' : 'text-slate-500'}`}>
                                {finalScore || '—'}
                            </div>
                            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-1">/ 10 PTS</div>
                        </div>
                    </header>
                    <div className="p-8 space-y-10">
                        <section><h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4 flex items-center gap-2" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}><FlaskConical size={16} /> Formulación (Gramos)</h3>
                            <div className="overflow-hidden rounded-sm" style={{ border: '1px solid var(--border)' }}>
                                <table className="w-full text-sm text-left">
                                    <thead className="font-bold uppercase text-xs" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
                                        <tr>
                                            <th className="p-3">Ingrediente</th>
                                            <th className="p-3 text-right">Peso (gr)</th>
                                            <th className="p-3 text-right">$/Kg</th>
                                            <th className="p-3 text-right">Subtotal</th>
                                            <th className="p-3 text-right">% Pan.</th>
                                            <th className="p-3 text-right">PPM</th>
                                            <th className="p-3 text-right">Dosis 25kg</th>
                                            {isEditing && <th className="p-3 w-10"></th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                                        {/* FILA DE HARINA BASE */}
                                        <tr className="font-medium" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
                                            <td className="p-3 font-bold" style={{ color: 'var(--text-1)' }}>
                                                {detailsData[baseFlourIndex]?.ingredient_name || 'Harina Base'}
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)' }}>
                                                {isEditing && baseFlourIndex >= 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={detailsData[baseFlourIndex]?.quantity_grams || ''}
                                                            onChange={(e) => handleDetailChange(baseFlourIndex, 'quantity_grams', e.target.value)}
                                                            className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-indigo-600 focus:bg-white"
                                                        />
                                                        <span className="text-[10px]">g</span>
                                                    </div>
                                                ) : (
                                                    <span>{ensayo.total_harina_grams ? fmt(ensayo.total_harina_grams) : '0'} g</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>-</td>
                                            <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)', borderLeft: '1px solid var(--border)' }}>
                                                ${detailsData.filter(d => d.is_base_flour).reduce((acc, current) => acc + (parseFloat(current.quantity || 0) * parseFloat(current.price_per_kg || current.cost_per_kg || 0)), 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-1)' }}>100%</td>
                                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>-</td>
                                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>25 kg</td>
                                            {isEditing && <td></td>}
                                        </tr>
                                        {sortedDetails.map((row) => {
                                            // Find the original index in detailsData for edit handlers
                                            const idx = detailsData.findIndex(d => d.id === row.id);
                                            const isBaseRow = row.is_base_flour && idx === baseFlourIndex;
                                            const hideRow = isBaseRow || (!isEditing && row.is_base_flour);
                                            return (
                                                <tr key={row.id} className={hideRow ? 'hidden' : 'transition'} style={{ background: 'var(--bg-panel)' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                                                >
                                                    <td className="p-3" style={{ color: 'var(--text-1)' }}>{row.ingredient_name}</td>
                                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)' }}>
                                                        {isEditing ? <input type="text" inputMode="decimal" value={row.quantity_grams || ''} onChange={(e) => handleDetailChange(idx, 'quantity_grams', e.target.value)} className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-blue-500 focus:bg-white" /> : <span>{fmt(row.quantity_grams)} g</span>}
                                                    </td>
                                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>
                                                        {isEditing ? <input type="text" inputMode="decimal" value={row.price_per_kg || row.cost_per_kg || ''} onChange={(e) => handleDetailChange(idx, 'price_per_kg', e.target.value)} className="w-24 text-right p-1 border border-blue-200 rounded outline-none text-xs focus:border-green-400" /> : <span>${fmt(row.price_per_kg || row.cost_per_kg || 0, 2)}</span>}
                                                    </td>
                                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)', borderLeft: '1px solid var(--border)' }}>
                                                        ${fmt(parseFloat(row.quantity || 0) * parseFloat(row.price_per_kg || row.cost_per_kg || 0), 2)}
                                                    </td>
                                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-1)' }}>{fmt(row.panadero_pct)}%</td>
                                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>{fmt(row.ppm_calc, 0)}</td>
                                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)' }}>{fmt(row.dosis_25kg)} g</td>
                                                    {isEditing && <td className="p-3 text-center"><button onClick={() => handleDeleteIngredient(row.id)} className="text-slate-400 hover:text-red-600 transition"><Trash2 size={16} /></button></td>}
                                                </tr>
                                            );
                                        })}
                                        <tr className="bg-slate-800 text-white font-bold h-10 border-t-2 border-slate-900">
                                            <td className="p-3 text-right uppercase text-[10px] tracking-widest text-slate-400 font-bold" colSpan="3">Costo Total Formulacion (por Batch)</td>
                                            <td className="p-3 text-right font-mono text-lg text-green-400 border-r border-slate-700 font-bold">
                                                ${totalCost.toFixed(2)}
                                            </td>
                                            <td colSpan="4" className="bg-slate-900/50"></td>
                                        </tr>
                                        {isEditing && (
                                            <tr style={{ background: 'rgba(74,222,128,0.04)' }}>
                                                <td className="p-3">
                                                    <select value={newIngredientId} onChange={(e) => handleIngredientSelect(e.target.value)} className="w-full text-xs p-2 rounded outline-none pointer-cursor" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
                                                        <option value="">+ Seleccionar </option>
                                                        {allIngredients.map(ing => (<option key={ing.id} value={ing.id}>{ing.name}</option>))}
                                                    </select>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input type="text" inputMode="decimal" placeholder="Gramos" value={newIngredientGrams} onChange={(e) => setNewIngredientGrams(e.target.value)} className="w-24 text-right p-2 rounded text-xs outline-none" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input type="text" inputMode="decimal" placeholder="$/Kg" value={newIngredientPrice} onChange={(e) => setNewIngredientPrice(e.target.value)} className="w-20 text-right p-2 rounded text-xs outline-none" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                                </td>
                                                <td colSpan="2"></td>
                                                <td className="p-3 text-center"><button onClick={handleAddIngredient} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition active:scale-95"><Plus size={16} /></button></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section><div className="flex justify-between items-center pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-1)' }}><FileText size={16} /> Análisis Reológico</h3><div className="relative" ref={selectorRef}><button onClick={() => setShowFieldSelector(!showFieldSelector)} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded hover:opacity-80 transition" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}><Settings size={14} /> Configurar ({visibleFields.length})</button>{showFieldSelector && (<div className="absolute right-0 top-full mt-2 w-64 shadow-xl rounded-lg z-50 p-2 max-h-80 overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}><div className="text-xs font-bold px-2 py-1 uppercase mb-1" style={{ color: 'var(--text-2)' }}>Campos</div>{LAB_FIELDS.map(f => (<div key={f.key} onClick={() => toggleField(f.key)} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded text-sm" style={{ color: 'var(--text-1)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>{visibleFields.includes(f.key) ? <CheckSquare size={16} style={{ color: 'var(--accent)' }} /> : <Square size={16} />} {f.label}</div>))}</div>)}</div></div>
                            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                {visibleFields.map((fieldKey) => {
                                    const fieldDef = LAB_FIELDS.find(f => f.key === fieldKey);
                                    if (!fieldDef) return null;
                                    return (
                                        <WebProcessRow
                                            key={fieldKey}
                                            label={fieldDef.label}
                                            name={fieldKey}
                                            unit={fieldDef.unit}
                                            value={ensayo[fieldKey]}
                                            onChange={handleInputChange}
                                            isEditing={isEditing}
                                            formData={formData}
                                        />
                                    );
                                })}
                            </div>
                        </section>

                        <section><div className="flex justify-between items-center pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)' }}><h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-1)' }}><ChefHat size={16} /> Parámetros de Proceso</h3>{isEditing ? <select name="baking_type" value={formData.baking_type || 'Fermentado'} onChange={handleInputChange} className="text-xs font-bold uppercase rounded px-2 py-1 outline-none pointer-cursor" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)' }}><option value="Fermentado">Panificado</option><option value="Batido">Pastelería</option></select> : <span className="text-xs font-bold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-main)', color: 'var(--text-2)', border: '1px solid var(--accent)' }}>{formData.baking_type || 'Fermentado'}</span>}</div>
                            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-8" style={{ background: 'var(--bg-main)', border: '1px solid var(--accent)' }}>
                                {!isBatido ? (
                                    <>
                                        <div><div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}><h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Timer size={14} /> Amasado y Corte</h4></div>
                                            <WebProcessRow label="Amasado Vel. 1" name="kneading_time_v1_min" unit="min" value={ensayo.kneading_time_v1_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Amasado Vel. 2" name="kneading_time_v2_min" unit="min" value={ensayo.kneading_time_v2_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Masa Final" name="kneading_temp_c" unit="°C" value={ensayo.kneading_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Vueltas de Sobado" name="sobado_turns" unit="vts" value={ensayo.sobado_turns} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Peso Corte (Crudo)" name="piece_weight_g" unit="g" value={ensayo.piece_weight_g} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                        <div><div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}><h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Thermometer size={14} /> Fermentación y Horno</h4></div>
                                            <WebProcessRow label="Tiempo Fermentación" name="fermentation_time_min" unit="min" value={ensayo.fermentation_time_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Cámara" name="fermentation_temp_c" unit="°C" value={ensayo.fermentation_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Humedad Cámara" name="fermentation_humidity_pct" unit="%" value={ensayo.fermentation_humidity_pct} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Horno" name="oven_temp_c" unit="°C" value={ensayo.oven_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Tiempo Horno" name="oven_time_min" unit="min" value={ensayo.oven_time_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Greñado (1-10)" name="scoring_score" unit="pts" value={ensayo.scoring_score} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}><h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Timer size={14} /> Batido y Mezclado</h4></div>
                                            <div className="flex justify-between items-center py-2 border-b px-2 group transition" style={{ borderColor: 'var(--border)' }}><span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Velocidad</span>{isEditing ? <input type="text" name="batter_speed" value={formData.batter_speed || ''} onChange={handleInputChange} className="w-32 text-right rounded text-sm font-bold p-1 outline-none" style={{ border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-1)' }} /> : <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>{ensayo.batter_speed || '-'}</span>}</div>
                                            <WebProcessRow label="Tiempo Total" name="batter_time_min" unit="min" value={ensayo.batter_time_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Densidad Batido" name="batter_density_g_cm3" unit="g/cc" value={ensayo.batter_density_g_cm3} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                        <div><div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}><h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}><Ruler size={14} /> Molde y Horneado</h4></div>
                                            <WebProcessRow label="Diámetro Molde" name="mold_diameter_cm" unit="cm" value={ensayo.mold_diameter_cm} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Horno" name="oven_temp_c" unit="°C" value={ensayo.oven_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Peso Crudo" name="raw_weight_g" unit="g" value={ensayo.raw_weight_g} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Altura Horneado" name="baked_volume_height" unit="cm" value={ensayo.baked_volume_height} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section className="print:break-inside-avoid print:mt-6"><h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4 flex items-center gap-2" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}><ClipboardCheck size={16} /> Evaluación de Calidad</h3>
                            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-12 gap-y-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                {Object.keys(evalData).map(cat => (<div key={cat} className="contents"><div className="col-span-2 mt-4 first:mt-0 mb-2 pb-1" style={{ borderBottom: '1px solid var(--border)' }}><h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>{cat}</h4></div>
                                    {evalData[cat].map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-1.5 border-b px-2 rounded transition" style={{ borderColor: 'var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <div className="flex gap-3"><button onClick={() => isEditing && handleEvalChange(cat, idx, 'active', !item.active)} className="transition hover:scale-110">{item.active ? <CheckSquare size={18} style={{ color: 'var(--accent)' }} /> : <Square size={18} style={{ color: 'var(--text-2)' }} />}</button><span className={`text-sm ${item.active ? 'font-bold' : ''}`} style={{ color: item.active ? 'var(--text-1)' : 'var(--text-2)' }}>{item.name}</span></div>
                                            {item.active && (<div className="flex items-center gap-2"><span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-2)' }}>Pto:</span>{isEditing ? <input type="text" inputMode="decimal" className="w-12 text-center border p-1 rounded font-bold outline-none" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-1)' }} value={item.score} onChange={(e) => handleEvalChange(cat, idx, 'score', String(e.target.value).replace(/,/g, '.'))} /> : <span className="font-bold px-2 rounded font-mono" style={{ background: 'var(--bg-main)', color: 'var(--text-1)' }}>{item.score || '-'}</span>}</div>)}
                                        </div>
                                    ))}</div>
                                ))}
                            </div>
                        </section>

                        <section style={{ pageBreakInside: 'avoid' }}><div className="flex justify-between border-b border-slate-200 pb-2 mb-4"><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><ImageIcon size={16} /> Galería Fotográfica</h3>{isEditing && <label className="cursor-pointer bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded flex gap-2 hover:bg-blue-700 transition active:scale-95 shadow-sm"><Upload size={14} /> Subir <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} /></label>}</div>{!images.length ? <div className="p-8 border border-dashed text-center text-slate-400 text-sm italic">No se han registrado fotografías para este ensayo todavía.</div> : <div className="grid grid-cols-3 gap-4">{images.map(img => (<div key={img.id} className="bg-white border border-slate-200 group relative" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}><div className="overflow-hidden bg-slate-100 relative" style={{ height: '180px' }}><img src={img.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" crossOrigin="anonymous" />{isEditing && <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded shadow hover:bg-red-700 transition"><Trash2 size={14} /></button>}</div><div className="p-2">{isEditing ? <input type="text" value={img.caption || ''} onChange={(e) => handleCaptionChange(img.id, e.target.value)} onBlur={(e) => saveCaption(img.id, e.target.value)} className="w-full text-xs font-bold border-b outline-none focus:border-blue-400 py-1" /> : <p className="text-xs font-bold text-slate-700 truncate">{img.caption || 'Sin título'}</p>}</div></div>))}</div>}</section>


                        <section className="print:break-inside-avoid print:mt-6"><h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}>Conclusiones Técnicas</h3><div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6"><div><label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-2)' }}>Objetivo / Problema Detectado</label>{isEditing ? <textarea className="w-full p-3 border rounded h-32 text-sm outline-none transition shadow-inner" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-1)' }} value={formData.description || ''} name="description" onChange={handleInputChange} /> : <div className="p-4 border rounded text-sm min-h-[100px] leading-relaxed italic print:border-slate-300" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>{ensayo.description || 'Sin descripción técnica disponible.'}</div>}</div><div><label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-2)' }}>Conclusión Final del Asesor</label>{isEditing ? <textarea className="w-full p-3 border rounded h-32 text-sm outline-none transition shadow-inner" style={{ background: 'var(--bg-main)', borderColor: 'var(--accent)', color: 'var(--text-1)' }} name="conclusion" value={formData.conclusion || ''} onChange={handleInputChange} /> : <div className="p-4 border rounded text-sm min-h-[100px] font-bold leading-relaxed print:border-slate-300" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)', color: 'var(--text-1)' }}>{ensayo.conclusion || 'Pendiente de validación final.'}</div>}</div></div></section>
                    </div>
                </div>
            </div>

        </div>
    );
}
