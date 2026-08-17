import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, X, Check, Loader2, ArrowRight, FlaskConical, AlertCircle, Building } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiGet, apiPost } from '../../api/httpClient';
import { useToast } from './Toast';
import { clearCache } from '../../api/dataCache';

export default function GoogleSheetsImporter({ isOpen, onClose, preselectedProject = null }) {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();

    const [sheetUrl, setSheetUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(preselectedProject || '');
    const [previewData, setPreviewData] = useState(null);
    const [bakingType, setBakingType] = useState('Fermentado');

    useEffect(() => {
        if (isOpen) {
            apiGet('/api/projects/').then(setProjects).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Helper to extract spreadsheet ID and GID from URL
    const parseSheetUrl = (url) => {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
        return {
            id: idMatch ? idMatch[1] : null,
            gid: gidMatch ? gidMatch[1] : null
        };
    };

    // Helper fuzzy label matcher
    const matchLabel = (str, keywords) => {
        if (!str) return false;
        const norm = String(str).toLowerCase().trim();
        return keywords.some(kw => norm.includes(kw));
    };

    const handleFetchSheet = async () => {
        if (!sheetUrl.trim()) {
            showError('Ingrese un enlace válido de Google Sheets');
            return;
        }

        const { id: sheetId, gid } = parseSheetUrl(sheetUrl);
        if (!sheetId) {
            showError('El enlace no parece tener un ID de Google Sheets válido');
            return;
        }

        setLoading(true);
        setPreviewData(null);

        // Try standard CSV export URL, fallback to Google Viz API CSV
        const exportUrls = [
            `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gid ? `&gid=${gid}` : ''}`,
            `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${gid ? `&gid=${gid}` : ''}`
        ];

        let csvBuffer = null;
        let fetchErr = null;

        for (const url of exportUrls) {
            try {
                const resp = await fetch(url);
                if (resp.ok) {
                    csvBuffer = await resp.arrayBuffer();
                    break;
                }
            } catch (err) {
                fetchErr = err;
            }
        }

        if (!csvBuffer) {
            setLoading(false);
            showError('No se pudo acceder a la planilla. Asegúrese de que la planilla esté en modo "Cualquier persona con el enlace puede ver".');
            return;
        }

        try {
            const workbook = XLSX.read(csvBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            if (!rawRows || rawRows.length === 0) {
                showError('La planilla parece estar vacía.');
                setLoading(false);
                return;
            }

            // Parse detected data
            const parsed = parseRawSheetRows(rawRows);
            setPreviewData(parsed);
        } catch (err) {
            console.error(err);
            showError('Error al leer la estructura de la planilla.');
        } finally {
            setLoading(false);
        }
    };

    const parseRawSheetRows = (rows) => {
        const labFields = {};
        const processFields = {};
        const ingredients = [];
        let baseFlourGrams = 1000;
        let ensayoDescription = 'Ensayo Importado desde Google Sheets';

        // Flatten rows to inspect key-value pairs and tables
        rows.forEach((row) => {
            if (!Array.isArray(row) || row.length === 0) return;
            const c0 = String(row[0] || '').trim();
            const c1 = String(row[1] || '').trim();
            const c2 = String(row[2] || '').trim();
            const valNum = parseFloat(c1) || parseFloat(c2) || null;

            // Description / Title
            if (matchLabel(c0, ['ensayo', 'código', 'codigo', 'protocolo', 'descripción', 'descripcion', 'título', 'titulo'])) {
                if (c1) ensayoDescription = c1;
            }

            // Lab Rheology fields
            if (matchLabel(c0, ['humedad'])) labFields.humidity_pct = valNum;
            if (matchLabel(c0, ['ceniza'])) labFields.ash_pct = valNum;
            if (matchLabel(c0, ['proteí', 'protei'])) labFields.protein_pct = valNum;
            if (matchLabel(c0, ['gluten húmedo', 'gluten humedo'])) labFields.gluten_wet_pct = valNum;
            if (matchLabel(c0, ['gluten seco'])) labFields.gluten_dry_pct = valNum;
            if (matchLabel(c0, ['gluten index'])) labFields.gluten_index_pct = valNum;
            if (matchLabel(c0, ['fuerza w', ' valor w', 'w (', 'w:'])) labFields.w_value = valNum;
            if (matchLabel(c0, ['tenacidad p', 'p (', 'p:'])) labFields.p_value = valNum;
            if (matchLabel(c0, ['extensibilidad l', 'l (', 'l:'])) labFields.l_value = valNum;
            if (matchLabel(c0, ['p/l', 'relación p/l', 'relacion p/l'])) labFields.pl_ratio = valNum;
            if (matchLabel(c0, ['falling number', 'fn (', 'hagberg'])) labFields.falling_number_sec = parseInt(valNum);
            if (matchLabel(c0, ['absorción agua', 'absorcion agua', 'absorción', 'absorcion'])) labFields.water_absorption_pct = valNum;
            if (matchLabel(c0, ['desarrollo', 'tiempo desarrollo'])) labFields.development_time_min = valNum;
            if (matchLabel(c0, ['estabilidad'])) labFields.stability_min = valNum;
            if (matchLabel(c0, ['zeleny'])) labFields.zeleny_ml = valNum;
            if (matchLabel(c0, ['daño almidón', 'daño almidon', 'almidon'])) labFields.starch_damage_pct = valNum;
            if (matchLabel(c0, ['granulometría', 'granulometria'])) labFields.granulometry_pct = valNum;
            if (matchLabel(c0, ['color l'])) labFields.color_l = valNum;
            if (matchLabel(c0, ['color a'])) labFields.color_a = valNum;
            if (matchLabel(c0, ['color b'])) labFields.color_b = valNum;

            // Process fields
            if (matchLabel(c0, ['amasado vel 1', 'vel 1', 'vel1'])) processFields.kneading_time_v1_min = valNum;
            if (matchLabel(c0, ['amasado vel 2', 'vel 2', 'vel2'])) processFields.kneading_time_v2_min = valNum;
            if (matchLabel(c0, ['temp masa', 'temperatura masa'])) processFields.kneading_temp_c = valNum;
            if (matchLabel(c0, ['vueltas sobado', 'sobado'])) processFields.sobado_turns = parseInt(valNum);
            if (matchLabel(c0, ['peso pieza', 'corte crudo'])) processFields.piece_weight_g = valNum;
            if (matchLabel(c0, ['fermentación', 'fermentacion'])) processFields.fermentation_time_min = valNum;
            if (matchLabel(c0, ['temp cámara', 'temp camara'])) processFields.fermentation_temp_c = valNum;
            if (matchLabel(c0, ['humedad cámara', 'humedad camara'])) processFields.fermentation_humidity_pct = valNum;
            if (matchLabel(c0, ['temp horno', 'temperatura horno'])) processFields.oven_temp_c = valNum;
            if (matchLabel(c0, ['tiempo horno'])) processFields.oven_time_min = valNum;
            if (matchLabel(c0, ['greñado', 'grena'])) processFields.scoring_score = parseInt(valNum);

            // Formulation / Ingredients detector
            const isFlour = matchLabel(c0, ['harina', 'base', 'harina base', '000', '0000']);
            const isIng = matchLabel(c0, ['ingrediente', 'aditivo', 'mejorador', 'sal', 'agua', 'levadura', 'azúcar', 'azucar', 'grasa', 'aceite', 'mantequilla', 'emulsionante', 'enzima']);
            
            if ((isFlour || isIng || (c0 && valNum > 0)) && !matchLabel(c0, ['total', 'costo', 'fecha', 'cliente', 'proyecto'])) {
                if (valNum > 0) {
                    if (isFlour) baseFlourGrams = valNum;
                    ingredients.push({
                        name: c0,
                        grams: valNum,
                        is_base: isFlour,
                        price: parseFloat(row[3]) || parseFloat(row[2]) || 0
                    });
                }
            }
        });

        // Ensure at least Harina Base exists
        if (!ingredients.some(i => i.is_base)) {
            ingredients.unshift({ name: 'Harina Base (Harina 000)', grams: baseFlourGrams, is_base: true, price: 0 });
        }

        return {
            description: ensayoDescription,
            labFields,
            processFields,
            ingredients
        };
    };

    const handleConfirmImport = async () => {
        if (!selectedProject) {
            showError('Por favor seleccione un Proyecto para vincular el ensayo.');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Ensayo
            const ensayoPayload = {
                project: parseInt(selectedProject),
                date: new Date().toISOString().split('T')[0],
                baking_type: bakingType,
                description: previewData?.description || 'Ensayo Importado desde Google Sheets',
                conclusion: 'Importado automáticamente desde Google Sheets',
                ...previewData?.labFields,
                ...previewData?.processFields,
            };

            const createdEnsayo = await apiPost('/api/ensayos/', ensayoPayload);

            // 2. Fetch catalog ingredients to match IDs
            const allIngs = await apiGet('/api/ingredients/');

            // 3. Create EnsayoDetail lines
            if (previewData?.ingredients && previewData.ingredients.length > 0) {
                for (const ingItem of previewData.ingredients) {
                    // Match or find ingredient by name
                    let matchedIng = allIngs.find(i => i.name.toLowerCase().trim() === ingItem.name.toLowerCase().trim());
                    if (!matchedIng) {
                        // Fallback to base flour or general ingredient
                        matchedIng = ingItem.is_base 
                            ? allIngs.find(i => i.is_base_flour) 
                            : allIngs.find(i => !i.is_base_flour);
                    }

                    if (matchedIng) {
                        await apiPost('/api/ensayo-details/', {
                            ensayo: createdEnsayo.id,
                            ingredient: matchedIng.id,
                            quantity: (ingItem.grams / 1000).toFixed(9), // convert g to kg
                            price_per_kg: ingItem.price || matchedIng.default_price || 0
                        });
                    }
                }
            }

            clearCache('/api/ensayos/');
            showSuccess('🎉 Ensayo importado exitosamente desde Google Sheets!');
            onClose();
            navigate(`/essays/${createdEnsayo.id}`);
        } catch (err) {
            console.error(err);
            showError('Error al crear el ensayo en la base de datos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md z-[120] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            <div className="w-full max-w-3xl rounded-xl shadow-2xl p-8 space-y-6 overflow-y-auto max-h-[90vh]" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                {/* Header */}
                <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', color: 'var(--accent)' }}>
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold uppercase tracking-tight" style={{ color: 'var(--text-1)' }}>Importar Ensayo desde Google Sheets</h2>
                            <p className="text-xs" style={{ color: 'var(--text-2)' }}>Pegue el enlace público de su planilla para autocompletar la receta y análisis</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color: 'var(--text-2)' }} className="hover:text-white transition"><X size={20} /></button>
                </div>

                {/* Step 1: Input URL */}
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest block" style={{ color: 'var(--text-2)' }}>
                        Enlace de la Planilla (Google Sheets)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="https://docs.google.com/spreadsheets/d/1ABC.../edit#gid=0"
                            value={sheetUrl}
                            onChange={(e) => setSheetUrl(e.target.value)}
                            className="flex-1 p-3 rounded-lg text-sm font-mono outline-none transition focus:border-green-400"
                            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                        />
                        <button
                            onClick={handleFetchSheet}
                            disabled={loading || !sheetUrl.trim()}
                            className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition flex items-center gap-2 disabled:opacity-40"
                            style={{ background: 'var(--accent)', color: '#0f172a' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                            {loading ? 'Analizando...' : 'Analizar Planilla'}
                        </button>
                    </div>
                    <p className="text-[11px] italic" style={{ color: 'var(--text-2)' }}>
                        💡 Asegúrese de que la planilla esté en modo "Cualquier persona con el enlace puede ver" en Google Sheets.
                    </p>
                </div>

                {/* Step 2: Preview detected data */}
                {previewData && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center bg-green-950/20 border border-green-500/30 p-4 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Check size={20} className="text-green-400" />
                                <div>
                                    <h4 className="text-sm font-bold text-green-400">Planilla Analizada Correctamente</h4>
                                    <p className="text-xs" style={{ color: 'var(--text-2)' }}>Se detectaron {previewData.ingredients.length} ingredientes y {Object.keys(previewData.labFields).length} parámetros de laboratorio.</p>
                                </div>
                            </div>
                        </div>

                        {/* Project selector */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-2)' }}>
                                    Vincular a Proyecto *
                                </label>
                                <select
                                    value={selectedProject}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    className="w-full p-3 rounded-lg text-xs font-bold uppercase outline-none"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                >
                                    <option value="">-- Seleccionar Proyecto --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.client_name} - {p.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest block mb-2" style={{ color: 'var(--text-2)' }}>
                                    Tipo de Proceso
                                </label>
                                <select
                                    value={bakingType}
                                    onChange={(e) => setBakingType(e.target.value)}
                                    className="w-full p-3 rounded-lg text-xs font-bold uppercase outline-none"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                >
                                    <option value="Fermentado">Panificado (Fermentado)</option>
                                    <option value="Batido">Pastelería (Batido)</option>
                                </select>
                            </div>
                        </div>

                        {/* Ingredients Table Preview */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                                <FlaskConical size={14} /> Formulación Detectada
                            </h4>
                            <div className="rounded-lg overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                                <table className="w-full text-xs text-left font-mono">
                                    <thead className="bg-slate-900 text-slate-400 text-[10px] font-bold uppercase">
                                        <tr>
                                            <th className="p-3">Ingrediente</th>
                                            <th className="p-3 text-right">Cantidad (g)</th>
                                            <th className="p-3 text-center">Tipo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800" style={{ background: 'var(--bg-main)' }}>
                                        {previewData.ingredients.map((ing, i) => (
                                            <tr key={i}>
                                                <td className="p-3 font-bold" style={{ color: 'var(--text-1)' }}>{ing.name}</td>
                                                <td className="p-3 text-right font-bold" style={{ color: 'var(--accent)' }}>{ing.grams} g</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${ing.is_base ? 'bg-green-900/40 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                                                        {ing.is_base ? 'Harina Base' : 'Insumo'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition"
                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={loading || !selectedProject}
                                className="px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition shadow-lg flex items-center gap-2 disabled:opacity-40"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                Confirmar e Importar Ensayo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
