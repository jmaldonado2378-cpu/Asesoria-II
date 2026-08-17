import { useState, useEffect, useRef, useMemo, lazy, Suspense, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, FlaskConical, Save, X, Edit3, Timer, Thermometer,
    ChefHat, Ruler, Scale, FileText, Image as ImageIcon,
    Trash2, Upload, Settings, CheckSquare, Square,
    ClipboardCheck, Plus, Printer, Wheat, Award
} from 'lucide-react';
const EssayReportPDF = lazy(() => import('../components/pdf/EssayReportPDF'));
const ExportPDFButton = lazy(() => import('../components/pdf/ExportPDFButton'));
const SheetsExportButton = lazy(() => import('../components/ui/SheetsExportButton'));
import { API_URL } from '../config';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../api/httpClient';
import { useToast } from '../components/ui/Toast';
import FormulationTable from './essay/FormulationTable';
import RheologySection from './essay/RheologySection';
import BakingProcess from './essay/BakingProcess';
import SensoryEvaluation from './essay/SensoryEvaluation';
import PhotoGallery from './essay/PhotoGallery';

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
    const { showSuccess, showError } = useToast();
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
        apiGet('/api/ingredients/').then(data => setAllIngredients(data)).catch(console.error);
        const handleClickOutside = (event) => { if (selectorRef.current && !selectorRef.current.contains(event.target)) setShowFieldSelector(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);

    // Fix 4: Convertir imágenes a base64 sólo bajo demanda (al exportar PDF)
    const convertImagesForPDF = useCallback(async () => {
        if (!images || images.length === 0) {
            setImagesForPDF([]);
            setIsPdfReady(true);
            return;
        }
        setIsPdfReady(false);
        const results = await Promise.all(images.map(async (img) => {
            try {
                const res = await fetch(img.image);
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

    const fetchData = async () => {
        try {
            const data = await apiGet(`/api/ensayos/${id}/`);
            if (!data || data.detail) {
                console.error("Essay not found or API error", data);
                setEnsayo(null);
                setLoading(false);
                return;
            }
            setEnsayo(data);
            setFormData(data);
            setDetailsData(Array.isArray(data.details) ? data.details : []);
            setImages(Array.isArray(data.images) ? data.images : []);
            if (data.evaluation_data && Object.keys(data.evaluation_data).length > 0) {
                setEvalData(data.evaluation_data);
            } else {
                setEvalData(INITIAL_EVALUATION);
            }
            if (data.final_score) setFinalScore(data.final_score);
            
            setLoading(false);
            const autoDetected = LAB_FIELDS.filter(f => data[f.key] !== null && data[f.key] !== undefined && data[f.key] !== 0).map(f => f.key);
            const combined = Array.from(new Set([...visibleFields, ...autoDetected]));
            if (combined.length > visibleFields.length) setVisibleFields(combined);
        } catch (err) {
            console.error("Fetch error:", err);
            setLoading(false);
        }
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
            await apiPut(`/api/ensayos/${id}/`, { ...formData, evaluation_data: evalData, final_score: finalScore });
            const updatePromises = detailsData.map(async detail => {
                const qValue = parseFloat(detail.quantity) || 0;
                const pValue = parseFloat(detail.price_per_kg || detail.cost_per_kg) || 0;
                return apiPatch(`/api/ensayo-details/${detail.id}/`, { quantity: qValue.toFixed(9), price_per_kg: pValue.toFixed(4) });
            });
            await Promise.all(updatePromises);
            await fetchData();
            setIsEditing(false);
            showSuccess('Guardado correctamente');
        } catch (error) {
            showError(`Error al guardar: ${error.message || 'Error de conexión'}`);
        }
    };

    const handleAddIngredient = async () => {
        if (!newIngredientId || !newIngredientGrams) return showError('Datos incompletos');
        try {
            await apiPost('/api/ensayo-details/', {
                ensayo: id,
                ingredient: newIngredientId,
                quantity: (parseFloat(String(newIngredientGrams).replace(/,/g, '.')) / 1000).toFixed(9),
                price_per_kg: (parseFloat(String(newIngredientPrice).replace(/,/g, '.')) || 0).toFixed(4)
            });
            setNewIngredientId(''); setNewIngredientGrams(''); setNewIngredientPrice('');
            await fetchData();
            showSuccess('Ingrediente agregado');
        } catch (e) {
            showError(`Error al agregar ingrediente: ${e.message || 'Error de conexión'}`);
        }
    };

    const handleDeleteIngredient = async (detailId) => {
        if (confirm('¿Borrar ingrediente?')) {
            try {
                await apiDelete(`/api/ensayo-details/${detailId}/`);
                await fetchData();
                showSuccess('Ingrediente eliminado');
            } catch (e) {
                showError('Error al eliminar ingrediente');
            }
        }
    };

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
            showSuccess('Imagen subida exitosamente');
        } catch (err) {
            console.error("Upload error:", err);
            showError(`❌ Error al subir imagen: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCaptionChange = (id, txt) => setImages(images.map(i => i.id === id ? { ...i, caption: txt } : i));
    const saveCaption = async (imgId, txt) => {
        try {
            await apiPatch(`/api/ensayo-images/${imgId}/`, { caption: txt });
        } catch (e) {
            console.error('Error saving caption', e);
        }
    };
    const handleDeleteImage = async (imgId) => {
        if (confirm('¿Borrar imagen?')) {
            try {
                await apiDelete(`/api/ensayo-images/${imgId}/`);
                setImages(images.filter(i => i.id !== imgId));
                showSuccess('Imagen eliminada');
            } catch (e) {
                showError('Error al eliminar imagen');
            }
        }
    };
    const handleEvalChange = (c, i, f, v) => { const n = { ...evalData }; n[c][i][f] = v; setEvalData(n); };
    const toggleField = (k) => setVisibleFields(prev => prev.includes(k) ? prev.filter(f => f !== k) : [...prev, k]);

    // Smart number formatter: removes trailing zeros. 40.0000 → 40, 0.2400 → 0.24
    const fmt = (val, maxDecimals = 4) => {
        const n = parseFloat(val);
        if (isNaN(n)) return '-';
        return parseFloat(n.toFixed(maxDecimals)).toString();
    };

    // Sort ingredients by weight descending (heaviest first) — memoized
    const sortedDetails = useMemo(() => 
        [...detailsData].sort((a, b) => parseFloat(b.quantity || 0) - parseFloat(a.quantity || 0)),
        [detailsData]
    );

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
                            <button onClick={convertImagesForPDF}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition hover:opacity-80"
                                style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                <Printer size={14} /> Preparar PDF
                            </button>
                        ) : (
                            <Suspense fallback={<span className="text-xs" style={{ color: 'var(--text-2)' }}>Cargando...</span>}>
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
                            </Suspense>
                        )}
                        <Suspense fallback={<span className="text-xs" style={{ color: 'var(--text-2)' }}>Cargando...</span>}>
                            <SheetsExportButton 
                                ensayo={ensayo} 
                                detailsData={detailsData} 
                                evalData={evalData} 
                            />
                        </Suspense>
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
                        <FormulationTable
                            ensayo={ensayo}
                            detailsData={detailsData}
                            sortedDetails={sortedDetails}
                            baseFlourIndex={baseFlourIndex}
                            totalCost={totalCost}
                            fmt={fmt}
                            isEditing={isEditing}
                            handleDetailChange={handleDetailChange}
                            handleDeleteDetail={handleDeleteIngredient}
                            allIngredients={allIngredients}
                            newIngredientId={newIngredientId}
                            newIngredientGrams={newIngredientGrams}
                            newIngredientPrice={newIngredientPrice}
                            handleIngredientSelect={handleIngredientSelect}
                            setNewIngredientGrams={setNewIngredientGrams}
                            setNewIngredientPrice={setNewIngredientPrice}
                            handleAddIngredient={handleAddIngredient}
                        />

                        <RheologySection
                            ensayo={ensayo}
                            formData={formData}
                            isEditing={isEditing}
                            visibleFields={visibleFields}
                            toggleField={toggleField}
                            handleFieldChange={handleInputChange}
                            fmt={fmt}
                        />

                        <BakingProcess
                            ensayo={ensayo}
                            formData={formData}
                            isEditing={isEditing}
                            handleFieldChange={handleInputChange}
                            fmt={fmt}
                        />

                        <SensoryEvaluation
                            evalData={evalData}
                            handleEvalChange={handleEvalChange}
                            finalScore={finalScore}
                            isEditing={isEditing}
                        />

                        <PhotoGallery
                            images={images}
                            uploading={uploading}
                            handleUploadImage={handleFileUpload}
                            handleDeleteImage={handleDeleteImage}
                            handleCaptionChange={handleCaptionChange}
                            saveCaption={saveCaption}
                            isEditing={isEditing}
                        />


                        <section className="print:break-inside-avoid print:mt-6"><h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}>Conclusiones Técnicas</h3><div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6"><div><label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-2)' }}>Objetivo / Problema Detectado</label>{isEditing ? <textarea className="w-full p-3 border rounded h-32 text-sm outline-none transition shadow-inner" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-1)' }} value={formData.description || ''} name="description" onChange={handleInputChange} /> : <div className="p-4 border rounded text-sm min-h-[100px] leading-relaxed italic print:border-slate-300" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>{ensayo.description || 'Sin descripción técnica disponible.'}</div>}</div><div><label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-2)' }}>Conclusión Final del Asesor</label>{isEditing ? <textarea className="w-full p-3 border rounded h-32 text-sm outline-none transition shadow-inner" style={{ background: 'var(--bg-main)', borderColor: 'var(--accent)', color: 'var(--text-1)' }} name="conclusion" value={formData.conclusion || ''} onChange={handleInputChange} /> : <div className="p-4 border rounded text-sm min-h-[100px] font-bold leading-relaxed print:border-slate-300" style={{ background: 'rgba(74,222,128,0.05)', borderColor: 'rgba(74,222,128,0.2)', color: 'var(--text-1)' }}>{ensayo.conclusion || 'Pendiente de validación final.'}</div>}</div></div></section>
                    </div>
                </div>
            </div>

        </div>
    );
}
