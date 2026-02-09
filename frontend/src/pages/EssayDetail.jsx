import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FlaskConical, Save, X, Edit3, Timer, Thermometer, ChefHat, Ruler, Scale, FileText, Image as ImageIcon, Trash2, Upload, Settings, CheckSquare, Square, ClipboardCheck, Plus, Printer, Wheat, Award } from 'lucide-react';

// --- COMPONENTES EXTERNOS (SOLUCIÓN AL PROBLEMA DE FOCO) ---
const WebProcessRow = ({ label, name, unit, value, onChange, isEditing, formData }) => {
    // Si isEditing es true, usamos el valor del form, si no, el del ensayo original
    const displayValue = isEditing ? (formData[name] !== undefined ? formData[name] : value) : value;

    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 hover:bg-slate-50 px-2 transition group">
            <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900">{label}</span>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <input
                        type="number"
                        step="any"
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

const PrintRow = ({ label, val, u }) => (
    <div className="flex justify-between py-1 border-b border-slate-100 items-baseline">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="flex items-baseline gap-1">
            <span className="font-mono font-bold text-slate-900">{val !== null && val !== undefined ? val : '-'}</span>
            <span className="text-[7px] text-slate-400 uppercase font-bold tracking-tighter">{u}</span>
        </span>
    </div>
);

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

    useEffect(() => {
        fetchData();
        fetch(`${import.meta.env.VITE_API_URL}/api/ingredients/`).then(res => res.json()).then(data => setAllIngredients(data)).catch(console.error);
        const handleClickOutside = (event) => { if (selectorRef.current && !selectorRef.current.contains(event.target)) setShowFieldSelector(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);

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
        fetch(`${import.meta.env.VITE_API_URL}/api/ensayos/${id}/`).then(res => res.json()).then(data => {
            setEnsayo(data); setFormData(data); setDetailsData(data.details); setImages(data.images || []);
            if (data.evaluation_data && Object.keys(data.evaluation_data).length > 0) setEvalData(data.evaluation_data); else setEvalData(INITIAL_EVALUATION);
            setLoading(false);
            const autoDetected = LAB_FIELDS.filter(f => data[f.key] !== null && data[f.key] !== undefined && data[f.key] !== 0).map(f => f.key);
            const combined = Array.from(new Set([...visibleFields, ...autoDetected]));
            if (combined.length > visibleFields.length) setVisibleFields(combined);
        }).catch(err => setLoading(false));
    };

    const handleInputChange = (e) => { const { name, value, type } = e.target; setFormData(prev => ({ ...prev, [name]: (type === 'number' && value === '') ? null : value })); };

    const handleDetailChange = (index, field, value) => {
        const updatedDetails = [...detailsData];
        const item = updatedDetails[index];
        if (!item) return;

        if (field === 'quantity_grams') {
            item.quantity_grams = value;
            item.quantity = (parseFloat(value) || 0) / 1000;
        } else if (field === 'price_per_kg') {
            item.price_per_kg = (value === '') ? null : value;
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
            await fetch(`${import.meta.env.VITE_API_URL}/api/ensayos/${id}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, evaluation_data: evalData, final_score: finalScore }) });
            const updatePromises = detailsData.map(detail => fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-details/${detail.id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: detail.quantity, price_per_kg: detail.price_per_kg || detail.cost_per_kg }) }));
            await Promise.all(updatePromises); fetchData(); setIsEditing(false); alert('Guardado correctamente');
        } catch (error) { alert('Error al guardar.'); }
    };

    const handleAddIngredient = async () => {
        if (!newIngredientId || !newIngredientGrams) return alert('Datos incompletos');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-details/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ensayo: id,
                    ingredient: newIngredientId,
                    quantity: parseFloat(newIngredientGrams) / 1000,
                    price_per_kg: parseFloat(newIngredientPrice) || 0
                })
            });
            if (res.ok) { setNewIngredientId(''); setNewIngredientGrams(''); setNewIngredientPrice(''); fetchData(); }
        } catch (e) { console.error(e); }
    };

    const handleDeleteIngredient = async (id) => { if (confirm('¿Borrar?')) { await fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-details/${id}/`, { method: 'DELETE' }); fetchData(); } };
    const handleFileUpload = async (e) => { const f = e.target.files[0]; if (!f) return; setUploading(true); const d = new FormData(); d.append('image', f); d.append('ensayo', id); d.append('caption', 'Sin título'); await fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-images/`, { method: 'POST', body: d }); fetchData(); setUploading(false); };
    const handleCaptionChange = (id, txt) => setImages(images.map(i => i.id === id ? { ...i, caption: txt } : i));
    const saveCaption = async (id, txt) => fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-images/${id}/`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption: txt }) });
    const handleDeleteImage = async (id) => { if (confirm('¿Borrar?')) { await fetch(`${import.meta.env.VITE_API_URL}/api/ensayo-images/${id}/`, { method: 'DELETE' }); setImages(images.filter(i => i.id !== id)); } };
    const handleEvalChange = (c, i, f, v) => { const n = { ...evalData }; n[c][i][f] = v; setEvalData(n); };
    const toggleField = (k) => setVisibleFields(prev => prev.includes(k) ? prev.filter(f => f !== k) : [...prev, k]);

    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanClient = (ensayo.client_name || 'Cliente').replace(/\s+/g, '_');
        const cleanCode = (ensayo.code || ensayo.id || 'Ref').toString().replace(/\s+/g, '_');
        document.title = `Reporte_${cleanClient}_${cleanCode}`;
        window.print();
        document.title = originalTitle;
    };

    if (loading) return <div className="p-10 text-center font-mono text-sm uppercase tracking-widest text-slate-400">Cargando Ensayo...</div>;
    if (!ensayo) return <div className="p-10 text-center text-red-600 font-bold uppercase tracking-tighter">Error: Ensayo no disponible en la base de datos.</div>;
    const isBatido = formData.baking_type === 'Batido';

    const baseFlourIndex = detailsData.findIndex(d =>
        d.is_base_flour === true ||
        d.is_base_flour === 1 ||
        d.is_base_flour === "1" ||
        d.ingredient_name?.toLowerCase().includes('harina base') ||
        parseFloat(d.panadero_pct) === 100
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 pb-20 print:p-0 print:bg-white">

            {/* --- ESTILO PARA VISIBILIDAD DE IMPRESIÓN --- */}
            <style>{`
            @media print {
                @page { size: A4; margin: 10mm; }
                body * { visibility: hidden; }
                .printable-content, .printable-content * { visibility: visible; }
                .printable-content { display: block !important; position: absolute; left: 0; top: 0; width: 100%; height: auto; }
                .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
                body { -webkit-print-color-adjust: exact; background-color: white !important; }
                .serif-print { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
                .mono-print { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
            }
        `}</style>

            {/* --- INTERFAZ WEB --- */}
            <div className="print:hidden">
                <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
                    <Link to="/essays" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition"><ArrowLeft size={18} /> Volver</Link>
                    <div className="flex gap-3">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 font-medium shadow-sm transition"><Printer size={16} /> Imprimir Reporte</button>
                        {!isEditing ? <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition"><Edit3 size={16} /> Editar Todo</button>
                            : <><button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 font-medium"><X size={16} /> Cancelar</button><button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium shadow-sm"><Save size={16} /> Guardar</button></>}
                    </div>
                </div>

                <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-sm overflow-hidden border border-slate-300">
                    <header className="border-b-4 border-slate-900 p-8 flex justify-between items-center bg-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                        <div className="z-10">
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">
                                <Award size={12} className="text-indigo-600" /> Copia Controlada I+D
                            </div>
                            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1 uppercase tracking-tighter">Reporte de Ensayo</h1>
                            <div className="flex items-center gap-4 text-slate-500 text-xs font-mono">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-800 font-bold">{ensayo.code || `ID: ${ensayo.id}`}</span>
                                <span>{ensayo.client_name}</span>
                                <span>•</span>
                                <span>{ensayo.date}</span>
                            </div>
                        </div>
                        <div className="text-right z-10">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Puntaje Global</div>
                            <div className="flex flex-col items-end">
                                <div className={`text-5xl font-serif font-bold leading-none ${finalScore >= 8 ? 'text-green-600' : finalScore >= 6 ? 'text-orange-600' : 'text-slate-400'}`}>
                                    {finalScore || '-'}
                                </div>
                                <div className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter mt-1">/ 10 PTS</div>
                            </div>
                        </div>
                    </header>
                    <div className="p-8 space-y-10">
                        <section><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><FlaskConical size={16} /> Formulación (Gramos)</h3>
                            <div className="overflow-hidden border border-slate-200 rounded-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
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
                                    <tbody className="divide-y divide-slate-100">
                                        {/* FILA DE HARINA BASE (Inteligente y Editable) */}
                                        <tr className="bg-white font-medium border-b border-slate-100">
                                            <td className="p-3 text-slate-800 font-bold">
                                                {detailsData[baseFlourIndex]?.ingredient_name || 'Harina Base'}
                                            </td>
                                            <td className="p-3 text-right font-mono text-blue-800 bg-blue-50/30 font-bold">
                                                {isEditing && baseFlourIndex >= 0 ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <input
                                                            type="number"
                                                            step="any"
                                                            value={detailsData[baseFlourIndex]?.quantity_grams || ''}
                                                            onChange={(e) => handleDetailChange(baseFlourIndex, 'quantity_grams', e.target.value)}
                                                            className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-indigo-600 focus:bg-white"
                                                        />
                                                        <span className="text-[10px]">g</span>
                                                    </div>
                                                ) : (
                                                    <span>{ensayo.total_harina_grams ? parseFloat(ensayo.total_harina_grams).toFixed(4) : '0.0000'} g</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-400">-</td>
                                            <td className="p-3 text-right font-mono font-bold text-blue-900 bg-blue-50/50 border-l border-slate-100">
                                                ${detailsData.filter(d => d.is_base_flour).reduce((acc, current) => acc + (parseFloat(current.quantity || 0) * parseFloat(current.price_per_kg || current.cost_per_kg || 0)), 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 text-right font-mono">100.0000%</td>
                                            <td className="p-3 text-right font-mono text-slate-300">-</td>
                                            <td className="p-3 text-right font-mono text-slate-400">25.0000 kg</td>
                                            {isEditing && <td></td>}
                                        </tr>
                                        {detailsData.map((row, idx) => (
                                            <tr key={row.id} className={((row.is_base_flour && idx === baseFlourIndex) || (!isEditing && row.is_base_flour)) ? 'hidden' : 'bg-white hover:bg-slate-50 transition'}>
                                                <td className="p-3 text-slate-700">{row.ingredient_name}</td>
                                                <td className="p-3 text-right font-mono font-bold text-blue-800 bg-blue-50/30">
                                                    {isEditing ? <input type="number" step="any" value={row.quantity_grams || ''} onChange={(e) => handleDetailChange(idx, 'quantity_grams', e.target.value)} className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-blue-500 focus:bg-white" /> : <span>{parseFloat(row.quantity_grams).toFixed(4)} g</span>}
                                                </td>
                                                <td className="p-3 text-right font-mono text-slate-600">
                                                    {isEditing ? <input type="number" step="any" value={row.price_per_kg || row.cost_per_kg || ''} onChange={(e) => handleDetailChange(idx, 'price_per_kg', e.target.value)} className="w-24 text-right p-1 border border-blue-200 rounded outline-none text-xs focus:border-green-400" /> : <span>${parseFloat(row.price_per_kg || row.cost_per_kg || 0).toFixed(2)}</span>}
                                                </td>
                                                <td className="p-3 text-right font-mono font-bold bg-slate-50/50 text-blue-900 border-l border-slate-100">
                                                    ${(parseFloat(row.quantity || 0) * parseFloat(row.price_per_kg || row.cost_per_kg || 0)).toFixed(2)}
                                                </td>
                                                <td className="p-3 text-right font-mono">{parseFloat(row.panadero_pct).toFixed(4)}%</td>
                                                <td className="p-3 text-right font-mono text-slate-600">{parseFloat(row.ppm_calc).toFixed(0)}</td>
                                                <td className="p-3 text-right font-mono font-bold text-blue-700">{parseFloat(row.dosis_25kg).toFixed(4)} g</td>
                                                {isEditing && <td className="p-3 text-center"><button onClick={() => handleDeleteIngredient(row.id)} className="text-slate-400 hover:text-red-600 transition"><Trash2 size={16} /></button></td>}
                                            </tr>
                                        ))}
                                        <tr className="bg-slate-800 text-white font-bold h-10 border-t-2 border-slate-900">
                                            <td className="p-3 text-right uppercase text-[10px] tracking-widest text-slate-400 font-bold" colSpan="3">Costo Total Formulacion (por Batch)</td>
                                            <td className="p-3 text-right font-mono text-lg text-green-400 border-r border-slate-700 font-bold">
                                                ${totalCost.toFixed(2)}
                                            </td>
                                            <td colSpan="4" className="bg-slate-900/50"></td>
                                        </tr>
                                        {isEditing && (
                                            <tr className="bg-blue-50/50">
                                                <td className="p-3">
                                                    <select value={newIngredientId} onChange={(e) => handleIngredientSelect(e.target.value)} className="w-full text-xs p-2 border border-blue-200 rounded outline-none focus:border-blue-400 pointer-cursor">
                                                        <option value="">+ Seleccionar </option>
                                                        {allIngredients.map(ing => (<option key={ing.id} value={ing.id}>{ing.name}</option>))}
                                                    </select>
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input type="number" step="any" placeholder="Gramos" value={newIngredientGrams} onChange={(e) => setNewIngredientGrams(e.target.value)} className="w-24 text-right p-2 border border-blue-200 rounded text-xs outline-none focus:border-blue-400" />
                                                </td>
                                                <td className="p-3 text-right">
                                                    <input type="number" step="any" placeholder="$/Kg" value={newIngredientPrice} onChange={(e) => setNewIngredientPrice(e.target.value)} className="w-20 text-right p-2 border border-green-200 rounded text-xs bg-green-50/20 outline-none focus:border-green-400" />
                                                </td>
                                                <td colSpan="2"></td>
                                                <td className="p-3 text-center"><button onClick={handleAddIngredient} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition active:scale-95"><Plus size={16} /></button></td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section><div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4"><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><FileText size={16} /> Análisis Reológico</h3><div className="relative" ref={selectorRef}><button onClick={() => setShowFieldSelector(!showFieldSelector)} className="flex items-center gap-2 text-xs font-bold bg-white border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-50 text-slate-700 transition"><Settings size={14} /> Configurar ({visibleFields.length})</button>{showFieldSelector && (<div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 p-2 max-h-80 overflow-y-auto"><div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase mb-1">Campos</div>{LAB_FIELDS.map(f => (<div key={f.key} onClick={() => toggleField(f.key)} className="flex items-center gap-2 px-2 py-1.5 hover:bg-blue-50 cursor-pointer rounded text-sm text-slate-700">{visibleFields.includes(f.key) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />} {f.label}</div>))}</div>)}</div></div>
                            <div className="bg-white border border-slate-200 rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
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

                        <section><div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4"><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><ChefHat size={16} /> Parámetros de Proceso</h3>{isEditing ? <select name="baking_type" value={formData.baking_type || 'Fermentado'} onChange={handleInputChange} className="text-xs font-bold uppercase bg-blue-50 border border-blue-200 text-blue-700 rounded px-2 py-1 outline-none pointer-cursor focus:border-blue-500"><option value="Fermentado">Panificado</option><option value="Batido">Pastelería</option></select> : <span className="text-xs font-bold uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">{formData.baking_type || 'Fermentado'}</span>}</div>
                            <div className="bg-white border border-slate-200 rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-8">
                                {!isBatido ? (
                                    <>
                                        <div><div className="mb-3 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Timer size={14} /> Amasado y Corte</h4></div>
                                            <WebProcessRow label="Amasado Vel. 1" name="kneading_time_v1_min" unit="min" value={ensayo.kneading_time_v1_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Amasado Vel. 2" name="kneading_time_v2_min" unit="min" value={ensayo.kneading_time_v2_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Masa Final" name="kneading_temp_c" unit="°C" value={ensayo.kneading_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Vueltas de Sobado" name="sobado_turns" unit="vts" value={ensayo.sobado_turns} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Peso Corte (Crudo)" name="piece_weight_g" unit="g" value={ensayo.piece_weight_g} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                        <div><div className="mb-3 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Thermometer size={14} /> Fermentación y Horno</h4></div>
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
                                            <div className="mb-3 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Timer size={14} /> Batido y Mezclado</h4></div>
                                            <div className="flex justify-between items-center py-2 border-b border-slate-50 px-2 group transition hover:bg-slate-50"><span className="text-sm text-slate-500 font-medium group-hover:text-slate-900">Velocidad</span>{isEditing ? <input type="text" name="batter_speed" value={formData.batter_speed || ''} onChange={handleInputChange} className="w-32 text-right border border-slate-300 rounded text-sm font-bold p-1 outline-none focus:border-blue-500" /> : <span className="font-mono font-bold text-slate-800">{ensayo.batter_speed || '-'}</span>}</div>
                                            <WebProcessRow label="Tiempo Total" name="batter_time_min" unit="min" value={ensayo.batter_time_min} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Densidad Batido" name="batter_density_g_cm3" unit="g/cc" value={ensayo.batter_density_g_cm3} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                        <div>
                                            <div className="mb-3 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2"><Ruler size={14} /> Molde y Horneado</h4></div>
                                            <WebProcessRow label="Diámetro Molde" name="mold_diameter_cm" unit="cm" value={ensayo.mold_diameter_cm} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Temp. Horno" name="oven_temp_c" unit="°C" value={ensayo.oven_temp_c} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Peso Crudo" name="raw_weight_g" unit="g" value={ensayo.raw_weight_g} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                            <WebProcessRow label="Altura Horneado" name="baked_volume_height" unit="cm" value={ensayo.baked_volume_height} onChange={handleInputChange} isEditing={isEditing} formData={formData} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>

                        <section><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4 flex items-center gap-2"><ClipboardCheck size={16} /> Evaluación de Calidad</h3>
                            <div className="bg-white border border-slate-200 rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                {Object.keys(evalData).map(cat => (<div key={cat} className="contents"><div className="col-span-2 mt-4 first:mt-0 mb-2 border-b border-slate-100 pb-1"><h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-bold tracking-tighter">{cat}</h4></div>
                                    {evalData[cat].map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-1.5 border-b border-slate-50 hover:bg-slate-50 px-2 rounded transition">
                                            <div className="flex gap-3"><button onClick={() => isEditing && handleEvalChange(cat, idx, 'active', !item.active)} className="transition hover:scale-110">{item.active ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} className="text-slate-300" />}</button><span className={`text-sm ${item.active ? 'text-slate-700 font-bold' : 'text-slate-400'}`}>{item.name}</span></div>
                                            {item.active && (<div className="flex items-center gap-2"><span className="text-[10px] text-slate-400 uppercase font-bold">Pto:</span>{isEditing ? <input type="number" step="any" className="w-12 text-center border p-1 rounded font-bold outline-none focus:border-blue-400" value={item.score} onChange={(e) => handleEvalChange(cat, idx, 'score', e.target.value)} /> : <span className="font-bold text-slate-800 bg-slate-100 px-2 rounded font-mono">{item.score || '-'}</span>}</div>)}
                                        </div>
                                    ))}</div>
                                ))}
                            </div>
                        </section>

                        <section><div className="flex justify-between border-b border-slate-200 pb-2 mb-4"><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><ImageIcon size={16} /> Galería Fotográfica</h3>{isEditing && <label className="cursor-pointer bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded flex gap-2 hover:bg-blue-700 transition active:scale-95 shadow-sm"><Upload size={14} /> Subir <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} /></label>}</div>{!images.length ? <div className="p-8 border border-dashed text-center text-slate-400 text-sm italic">No se han registrado fotografías para este ensayo todavía.</div> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{images.map(img => (<div key={img.id} className="bg-white rounded overflow-hidden shadow-sm border border-slate-200 group relative"><div className="h-48 overflow-hidden bg-slate-100 relative"><img src={img.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />{isEditing && <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 bg-red-600/90 text-white p-1.5 rounded shadow hover:bg-red-700 transition"><Trash2 size={14} /></button>}</div><div className="p-3">{isEditing ? <input type="text" value={img.caption || ''} onChange={(e) => handleCaptionChange(img.id, e.target.value)} onBlur={(e) => saveCaption(img.id, e.target.value)} className="w-full text-xs font-bold border-b outline-none focus:border-blue-400 py-1" /> : <p className="text-xs font-bold text-slate-700 truncate">{img.caption || 'Sin título'}</p>}</div></div>))}</div>}</section>

                        <section><h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Conclusiones Técnicas</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Objetivo / Problema Detectado</label>{isEditing ? <textarea className="w-full p-3 border rounded h-32 text-sm outline-none focus:border-blue-300 focus:bg-slate-50/30 transition shadow-inner" value={formData.description || ''} name="description" onChange={handleInputChange} /> : <div className="p-4 bg-slate-50 border rounded text-sm text-slate-700 min-h-[100px] leading-relaxed italic">{ensayo.description || 'Sin descripción técnica disponible.'}</div>}</div><div><label className="block text-xs font-bold text-slate-700 uppercase mb-2">Conclusión Final del Asesor</label>{isEditing ? <textarea className="w-full p-3 border-green-300 border rounded h-32 text-sm outline-none focus:border-green-400 focus:bg-green-50/10 transition shadow-inner" name="conclusion" value={formData.conclusion || ''} onChange={handleInputChange} /> : <div className="p-4 bg-green-50 border-green-100 border rounded text-sm text-slate-900 min-h-[100px] font-bold leading-relaxed">{ensayo.conclusion || 'Pendiente de validación final.'}</div>}</div></div></section>
                    </div>
                </div>
            </div>

            {/* --- LAYOUT IMPRESIÓN (SOLUCIÓN FLOW + VISIBILIDAD MÁGICA) --- */}
            <div className="printable-content hidden print:block bg-white text-black p-0 min-h-screen serif-print">
                {/* Header A4 Molinero Premium */}
                <div className="flex justify-between items-stretch border-b-4 border-slate-900 pb-6 mb-8 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                    <div className="flex gap-5 items-center pt-4">
                        <div className="w-20 h-20 bg-slate-900 text-white flex flex-col items-center justify-center rounded-sm shadow-sm">
                            <Wheat size={40} className="text-indigo-400" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tighter leading-none uppercase">
                                Reporte Técnico<br />
                                <span className="text-indigo-600">Laboratorio I+D</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Sistema de Gestión de Calidad Especializada</p>
                        </div>
                    </div>
                    <div className="text-right flex flex-col justify-between pt-4">
                        <div className="bg-slate-50 px-4 py-2 rounded-sm border-r-4 border-indigo-600">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Referencia Industrial</div>
                            <div className="text-xl font-mono font-bold text-slate-900 uppercase">{ensayo.code || `ENS-${ensayo.id}`}</div>
                        </div>
                        <div className="text-xs text-slate-600 font-mono space-y-0.5 mt-2 text-[9px]">
                            <p><span className="text-indigo-800 font-bold uppercase">Cliente:</span> {ensayo.client_name}</p>
                            <p><span className="text-indigo-800 font-bold uppercase">Proyecto:</span> {ensayo.project_name || "General"}</p>
                            <p><span className="text-indigo-800 font-bold uppercase">Emisión:</span> {ensayo.date}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Columna Izquierda (7/12) - Formulación y Proceso */}
                    <div className="col-span-7 space-y-8">
                        <div className="print-break-inside-avoid">
                            <h3 className="text-[10px] font-bold text-white bg-slate-900 px-3 py-1.5 mb-3 uppercase tracking-widest flex justify-between items-center rounded-sm">
                                <span>Composición Industrial de Batch</span>
                                <span className="font-mono text-[8px] opacity-70">Base 100.0000% Harina</span>
                            </h3>
                            <table className="w-full text-[10px] border-collapse mono-print">
                                <thead>
                                    <tr className="border-b-2 border-slate-300 text-slate-500 font-bold uppercase text-[8px]">
                                        <th className="text-left py-1.5 pl-1 italic">Componente</th>
                                        <th className="text-right py-1.5">% Pan.</th>
                                        <th className="text-right py-1.5">PPM</th>
                                        <th className="text-right py-1.5">Dosis</th>
                                        <th className="text-right py-1.5 pr-1">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    <tr className="font-bold bg-indigo-50/20 border-b border-indigo-100/50">
                                        <td className="py-2 pl-2 text-slate-900 uppercase tracking-tighter">
                                            {detailsData.find(d => d.is_base_flour === true || d.is_base_flour === 1 || d.is_base_flour === "1")?.ingredient_name || detailsData[0]?.ingredient_name || 'Harina Base'}
                                        </td>
                                        <td className="text-right text-indigo-700">100.0000%</td>
                                        <td className="text-right text-slate-300">-</td>
                                        <td className="text-right text-slate-900 font-bold">25.0000 kg</td>
                                        <td className="text-right text-slate-900 pr-1">${detailsData.filter(d => d.is_base_flour).reduce((acc, current) => acc + (parseFloat(current.quantity || 0) * parseFloat(current.price_per_kg || current.cost_per_kg || 0)), 0).toFixed(2)}</td>
                                    </tr>
                                    {detailsData.map(row => (
                                        <tr key={row.id} className={row.is_base_flour ? 'hidden' : 'hover:bg-slate-50 transition-colors'}>
                                            <td className="py-2 pl-2 text-slate-700 font-medium">{row.ingredient_name}</td>
                                            <td className="text-right text-slate-600 font-bold">{parseFloat(row.panadero_pct).toFixed(4)}%</td>
                                            <td className="text-right text-slate-400">{parseFloat(row.ppm_calc).toFixed(0)}</td>
                                            <td className="text-right text-indigo-600 font-bold">{parseFloat(row.dosis_25kg).toFixed(4)} g</td>
                                            <td className="text-right text-slate-900 pr-1">${(parseFloat(row.quantity || 0) * parseFloat(row.price_per_kg || row.cost_per_kg || 0)).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-slate-900 font-bold bg-slate-900 text-white">
                                        <td colSpan={4} className="py-2 text-right pr-4 text-[8px] uppercase tracking-[0.2em] opacity-70">Costo Total Formulacion (Batch)</td>
                                        <td className="text-right py-2 pr-2 text-sm text-indigo-300 tracking-tight font-serif">${totalCost.toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="print-break-inside-avoid">
                            <h3 className="text-[10px] font-bold text-white bg-indigo-800 px-3 py-1.5 mb-3 uppercase tracking-widest rounded-sm">Protocolo de Proceso Técnico</h3>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-6 text-[10px]">
                                {!isBatido ? (
                                    <>
                                        <div>
                                            <div className="font-bold text-indigo-900 border-b-2 border-indigo-100 mb-2 pb-1 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Timer size={10} /> Amasado y Formado
                                            </div>
                                            <PrintRow label="Amasado Vel. 1" val={ensayo.kneading_time_v1_min} u="min" />
                                            <PrintRow label="Amasado Vel. 2" val={ensayo.kneading_time_v2_min} u="min" />
                                            <PrintRow label="Temp. Masa Final" val={ensayo.kneading_temp_c} u="°C" />
                                            <PrintRow label="Vueltas Sobado" val={ensayo.sobado_turns} u="vts" />
                                            <PrintRow label="Peso de Corte" val={ensayo.piece_weight_g} u="g" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-indigo-900 border-b-2 border-indigo-100 mb-2 pb-1 uppercase tracking-tighter flex items-center gap-1.5">
                                                <Thermometer size={10} /> Fermentación y Horno
                                            </div>
                                            <PrintRow label="Tiempo Ferm." val={ensayo.fermentation_time_min} u="min" />
                                            <PrintRow label="Temp. Cámara" val={ensayo.fermentation_temp_c} u="°C" />
                                            <PrintRow label="Humedad Rel." val={ensayo.fermentation_humidity_pct} u="%" />
                                            <PrintRow label="Temp. Horno" val={ensayo.oven_temp_c} u="°C" />
                                            <PrintRow label="Tiempo Horno" val={ensayo.oven_time_min} u="min" />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="font-bold text-slate-900 border-b border-slate-200 mb-1 pb-1 uppercase tracking-widest text-[8px] opacity-60">Resultados Físicos del Producto</div>
                                            <div className="flex gap-16">
                                                <div className="flex-1"><PrintRow label="Peso Salida Horno" val={ensayo.final_weight_g} u="g" /></div>
                                                <div className="flex-1"><PrintRow label="Volumen de Pieza" val={ensayo.final_volume_cc} u="cc" /></div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <div className="font-bold text-indigo-900 border-b-2 border-indigo-100 mb-2 pb-1 uppercase tracking-tighter flex items-center gap-1.5"><Timer size={10} /> Batido y Mezclado</div>
                                            <div className="flex justify-between py-1 border-b border-slate-100 items-baseline"><span className="text-slate-500 font-medium">Velocidad Batido</span><span className="font-mono font-bold text-slate-800 uppercase text-[9px]">{ensayo.batter_speed || '-'}</span></div>
                                            <PrintRow label="Tiempo Total" val={ensayo.batter_time_min} u="min" />
                                            <PrintRow label="Densidad Batido" val={ensayo.batter_density_g_cm3} u="g/cc" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-indigo-900 border-b-2 border-indigo-100 mb-2 pb-1 uppercase tracking-tighter flex items-center gap-1.5"><Ruler size={10} /> Molde y Horneado</div>
                                            <PrintRow label="Diámetro Molde" val={ensayo.mold_diameter_cm} u="cm" />
                                            <PrintRow label="Temp. de Horno" val={ensayo.oven_temp_c} u="°C" />
                                            <PrintRow label="Altura Horneado" val={ensayo.baked_volume_height} u="cm" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha (5/12) - Análisis y Score */}
                    <div className="col-span-5 flex flex-col gap-8">
                        <div className="bg-slate-900 text-white p-6 rounded-sm text-center shadow-lg relative overflow-hidden flex flex-col items-center print-break-inside-avoid shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.3em] mb-2 opacity-80">Puntaje Global de Calidad</div>
                            <div className="flex items-baseline gap-1">
                                <div className="text-6xl font-serif font-bold tracking-tighter text-white">{finalScore}</div>
                                <div className="text-xl text-slate-500 font-serif font-normal opacity-50">/10</div>
                            </div>
                            <div className="mt-2 px-3 py-1 bg-indigo-600/20 border border-indigo-500/30 rounded-full text-[8px] font-bold uppercase tracking-widest text-indigo-300">
                                Certificación Molinero I+D
                            </div>
                        </div>

                        <div className="print-break-inside-avoid">
                            <h3 className="text-[10px] font-bold text-slate-800 border-b-2 border-indigo-600 pb-1 mb-3 uppercase tracking-widest">Análisis Reológico</h3>
                            <div className="grid grid-cols-1 gap-y-1 mono-print">
                                {visibleFields.map(k => {
                                    const f = LAB_FIELDS.find(field => field.key === k);
                                    return (
                                        <div key={k} className="flex justify-between text-[9px] border-b border-slate-50 py-1.5 hover:bg-slate-50 transition-colors">
                                            <span className="text-slate-500 font-medium italic">{f.label}</span>
                                            <span className="font-bold text-slate-900">
                                                {ensayo[k] !== null && ensayo[k] !== undefined ? ensayo[k] : '-'}
                                                <span className="text-[8px] text-slate-400 uppercase font-normal ml-1">{f.unit}</span>
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="print-break-inside-avoid">
                            <h3 className="text-[10px] font-bold text-slate-800 border-b-2 border-indigo-600 pb-1 mb-3 uppercase tracking-widest">Evaluación Sensorial</h3>
                            <div className="space-y-5">
                                {Object.keys(evalData).map(cat => {
                                    const activeItems = evalData[cat].filter(i => i.active);
                                    if (activeItems.length === 0) return null;
                                    return (
                                        <div key={cat} className="space-y-1.5">
                                            <div className="text-[9px] font-bold text-indigo-700 mb-1.5 uppercase tracking-tighter bg-indigo-50/50 px-2 py-0.5 border-l-2 border-indigo-300 shadow-sm">{cat}</div>
                                            <div className="grid grid-cols-1 gap-y-1">
                                                {activeItems.map((item, i) => (
                                                    <div key={i} className="flex justify-between items-baseline text-[9px] border-b border-slate-50 py-1 group">
                                                        <span className="text-slate-600 flex-grow relative overflow-hidden h-3 leading-none italic">
                                                            <span className="z-10 bg-white pr-2 relative font-medium group-hover:font-bold transition-all">{item.name}</span>
                                                            <span className="absolute bottom-0 left-0 w-full text-slate-100 font-serif leading-none opacity-50 select-none">....................................................................................................................................................</span>
                                                        </span>
                                                        <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded-sm ml-3 border border-slate-200">
                                                            {item.score || '0'} <span className="text-[7px] text-slate-400 uppercase font-normal ml-1">pts</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Galería en PDF (Optimizado A4) */}
                {images.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-slate-200 print-break-inside-avoid">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-5 tracking-[0.3em] text-center italic">Documentación Visual del Ensayo Taller</h3>
                        <div className="grid grid-cols-3 gap-8">
                            {images.map(img => (
                                <div key={img.id} className="border border-slate-300 rounded-sm p-1.5 bg-slate-50 shadow-sm">
                                    <div className="h-32 w-full overflow-hidden bg-white mb-2 flex items-center justify-center border border-slate-100">
                                        <img src={img.image} className="max-w-full max-h-full object-contain" alt={img.caption || 'Imagen'} />
                                    </div>
                                    <p className="text-[8px] text-center font-bold text-slate-800 uppercase tracking-tighter truncate leading-tight h-4 border-t pt-1 border-slate-200">{img.caption || 'Captura Técnica'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Conclusiones Finales de Alto Nivel */}
                <div className="mt-10 border-t-2 border-slate-900 pt-8 grid grid-cols-2 gap-12 print-break-inside-avoid">
                    <div className="relative">
                        <div className="absolute -top-1 left-0 w-8 h-1 bg-slate-400/30"></div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest flex items-center gap-1.5">
                            <Award size={12} className="text-slate-300" /> Análisis de Objetivo Técnico
                        </h3>
                        <p className="text-[10px] text-slate-800 leading-relaxed text-justify italic bg-slate-50/30 p-4 border border-slate-100 rounded-sm shadow-inner min-h-[80px]">
                            {ensayo.description || "Sin descripción técnica registrada."}
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute -top-1 left-0 w-8 h-1 bg-indigo-400/30"></div>
                        <h3 className="text-[10px] font-bold text-indigo-800 uppercase mb-3 tracking-widest flex items-center gap-1.5">
                            <ClipboardCheck size={12} className="text-indigo-400" /> Conclusión Industrial Molinero
                        </h3>
                        <p className="text-[10px] text-slate-900 leading-relaxed text-justify font-bold bg-indigo-50/30 p-4 border border-indigo-100 rounded-sm shadow-sm min-h-[80px]">
                            {ensayo.conclusion || "Pendiente de validación final por soporte técnico."}
                        </p>
                    </div>
                </div>

                {/* Footer Institucional de Seguridad y Control */}
                <div className="mt-16 border-t border-slate-300 py-6 flex justify-between text-[8px] text-slate-400 items-center font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-900">AsesoríaApp v2.0</span>
                        <span className="text-slate-300">/</span>
                        <span>Laboratorio Molinero de Innovación & Desarrollo</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-1.5 text-indigo-600">
                            <Square size={6} className="fill-indigo-600" /> Copia Controlada
                        </span>
                        <span className="text-slate-300">/</span>
                        <span>Confidencialidad Nivel 3</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}