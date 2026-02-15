import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Truck, DollarSign, FileText, Activity, Tag, Loader2, Trash2 } from 'lucide-react';

export default function IngredientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/ingredients/${id}/`)
            .then(r => r.json())
            .then(d => {
                setFormData(d);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${API_URL}/api/ingredients/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    default_price: parseFloat(formData.default_price) || 0
                })
            });
            if (res.ok) {
                alert('Ingrediente actualizado correctamente');
                navigate('/ingredients');
            } else {
                const errData = await res.json();
                alert('Error al actualizar: ' + JSON.stringify(errData));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Confirmar baja definitiva de este insumo del sistema?')) {
            try {
                const res = await fetch(`${API_URL}/api/ingredients/${id}/`, { method: 'DELETE' });
                if (res.ok) navigate('/ingredients');
            } catch (e) { console.error(e); }
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <Loader2 className="animate-spin mr-3 text-orange-600" size={20} /> Recuperando Ficha Técnica #SKU-{id}...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/ingredients" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Insumos
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> Gestión de Kernels v2.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* Header Industrial */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                                <Package size={12} /> Ficha Maestro de Insumo
                            </div>
                            <h1 className="text-4xl font-serif font-black text-white leading-none uppercase tracking-tighter">{formData.name}</h1>
                            <div className="flex items-center gap-4 mt-6">
                                <span className="bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 border border-slate-700 rounded-sm italic">SKU: RAW-{id}</span>
                                {formData.is_active !== false && (
                                    <span className="bg-green-600/10 text-green-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 border border-green-600/20 rounded-sm">En Stock / Activo</span>
                                )}
                            </div>
                        </div>
                        <Package size={120} className="text-slate-800 absolute -right-10 -bottom-10 opacity-30 pointer-events-none" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="space-y-8">
                            {/* SECCIÓN DATOS CLAVE */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start border-l-4 border-slate-100 pl-6">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Package size={14} className="text-orange-600" /> Identificación del Insumo
                                    </label>
                                    <input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-black text-xl outline-none focus:border-orange-600 focus:bg-white transition-all shadow-inner uppercase tracking-tight"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Tag size={14} className="text-orange-400" /> Clasificación Técnica
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-orange-600 shadow-sm"
                                    >
                                        <option value="Harina">Harina</option>
                                        <option value="Ingrediente General">Ingrediente General</option>
                                        <option value="Aditivo">Aditivo</option>
                                        <option value="Mejorador">Mejorador</option>
                                        <option value="Enzimático">Enzimático</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Truck size={14} className="text-orange-400" /> Origen / Proveedor
                                    </label>
                                    <input
                                        name="brand"
                                        value={formData.brand || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-orange-600 shadow-sm"
                                        placeholder="Registrar proveedor aquí..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <DollarSign size={14} className="text-green-600" /> Costeo por KG (Base)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            name="default_price"
                                            value={formData.default_price}
                                            onChange={handleChange}
                                            className="w-full p-3 pl-8 border border-slate-200 rounded-sm font-mono text-sm font-black outline-none focus:border-green-600 shadow-sm text-green-700"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative">
                                            <input
                                                type="checkbox"
                                                name="is_base_flour"
                                                checked={formData.is_base_flour}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-orange-600 transition-colors tracking-widest">Insumo: Harina Base</span>
                                    </label>
                                </div>
                            </div>

                            {/* SECCIÓN OBSERVACIONES */}
                            <div className="border-t border-slate-100 pt-8">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText size={14} className="text-orange-400" /> Dossier Técnico / Observaciones
                                </label>
                                <textarea
                                    name="observations"
                                    rows="4"
                                    value={formData.observations || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-slate-200 rounded-sm outline-none focus:border-orange-600 font-medium text-sm bg-slate-50 shadow-inner resize-none"
                                    placeholder="Cargar aquí especificaciones técnicas, dosificación límite o notas de calidad..."
                                />
                            </div>
                        </div>

                        {/* ACCIONES FINALES */}
                        <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-[10px] font-black text-slate-300 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 transition active:scale-95"
                            >
                                <Trash2 size={16} /> Depurar Insumo
                            </button>
                            <div className="flex gap-4">
                                <Link to="/ingredients" className="px-8 py-4 bg-white border border-slate-300 text-slate-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                    Descartar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={20} />}
                                    {saving ? 'Guardando...' : 'Actualizar Ficha'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
