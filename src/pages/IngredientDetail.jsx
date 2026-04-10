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
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin mr-3" size={20} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono uppercase tracking-widest">Recuperando Ficha #{id}...</span>
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-3xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/ingredients" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={15} /> Volver a Insumos
                    </Link>
                    <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Ficha de Insumo
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <div className="p-7 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                            <Package size={12} /> Ficha Maestro de Insumo
                        </div>
                        <h1 className="text-2xl font-bold text-white">{formData.name}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>SKU: RAW-{id}</span>
                            {formData.is_active !== false && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.2)' }}>En Stock</span>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-5">
                            <div className="col-span-2">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                    <Package size={13} /> Identificación del Insumo
                                </label>
                                <input name="name" required value={formData.name} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-lg font-bold outline-none"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                        <Tag size={13} /> Clasificación
                                    </label>
                                    <select name="type" value={formData.type} onChange={handleChange}
                                        className="w-full px-3 py-2.5 rounded-lg text-sm font-medium outline-none"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
                                        <option value="Harina">Harina</option>
                                        <option value="Ingrediente General">Ingrediente General</option>
                                        <option value="Aditivo">Aditivo</option>
                                        <option value="Mejorador">Mejorador</option>
                                        <option value="Enzimático">Enzimático</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                        <Truck size={13} /> Origen / Proveedor
                                    </label>
                                    <input name="brand" value={formData.brand || ''} onChange={handleChange}
                                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                        placeholder="Registrar proveedor..." />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                        <DollarSign size={13} /> Costeo por KG
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono" style={{ color: 'var(--text-2)' }}>$</span>
                                        <input type="number" step="0.0001" name="default_price" value={formData.default_price} onChange={handleChange}
                                            className="w-full pl-7 pr-3 py-2.5 rounded-lg font-mono text-sm outline-none"
                                            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--score-high)' }} />
                                    </div>
                                </div>

                                <div className="flex items-center pb-1">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className="relative">
                                            <input type="checkbox" name="is_base_flour" checked={formData.is_base_flour} onChange={handleChange} className="sr-only peer" />
                                            <div className="w-10 h-5 rounded-full transition-all" style={{ background: formData.is_base_flour ? 'var(--accent)' : 'var(--border)' }}>
                                                <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${formData.is_base_flour ? 'translate-x-5' : ''}`}></div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>Harina Base</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid var(--border)' }} className="pt-5">
                                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                    <FileText size={13} /> Dossier Técnico / Observaciones
                                </label>
                                <textarea name="observations" rows="4" value={formData.observations || ''} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none placeholder:text-slate-700"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                    placeholder="Especificaciones técnicas, dosificación límite o notas de calidad..." />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
                            <button type="button" onClick={handleDelete}
                                className="flex items-center gap-2 text-xs font-bold transition hover:text-red-400"
                                style={{ color: 'var(--text-2)' }}>
                                <Trash2 size={14} /> Eliminar Insumo
                            </button>
                            <div className="flex gap-3">
                                <Link to="/ingredients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>Cancelar</Link>
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                    style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
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
