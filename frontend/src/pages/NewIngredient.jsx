import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Truck, DollarSign, FileText, Activity, Tag, AlertCircle } from 'lucide-react';
import { createIngredient } from '../api/ingredients';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import { FormField } from '../components/ui/FormField';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

export default function NewIngredient() {
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const { loading, error, fieldErrors, execute } = useApiMutation(createIngredient);

    const [formData, setFormData] = useState({
        name: '',
        type: 'Ingrediente General',
        brand: '',
        default_price: '0.0000',
        unit: 'KG',
        observations: '',
        is_base_flour: false
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return; // FormField will show the error via fieldErrors
        try {
            await execute({
                ...formData,
                default_price: parseFloat(formData.default_price) || 0
            });
            showSuccess('Ingrediente creado exitosamente');
            navigate('/ingredients');
        } catch (e) {
            // handled by useApiMutation
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-2xl">

                {/* Back */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/ingredients" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={15} /> Volver a Insumos
                    </Link>
                    <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Alta de Insumos
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-7 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1"
                            style={{ color: 'var(--accent)' }}>
                            <Package size={12} /> Gestión de Suministros
                        </div>
                        <h1 className="text-xl font-bold text-white">Nuevo Ingrediente</h1>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>Especificación Técnica y Costeo de Materia Prima</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-7 space-y-6">
                        
                        {error && (
                            <div className="p-4 rounded-lg flex items-center gap-3 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Nombre */}
                        <FormField label="Nombre del Insumo / Ingrediente" icon={<Package size={13} />} error={fieldErrors?.name}>
                            <input name="name" required value={formData.name} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-base font-bold outline-none placeholder:text-slate-700"
                                style={inputStyle}
                                placeholder="Ej: Harina de Trigo 000 Extra" />
                        </FormField>

                        {/* Tipo + Marca */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField label="Tipo de Insumo" icon={<Tag size={13} />} error={fieldErrors?.type}>
                                <select name="type" value={formData.type} onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm font-medium outline-none"
                                    style={inputStyle}>
                                    <option value="Harina">Harina</option>
                                    <option value="Ingrediente General">Ingrediente General</option>
                                    <option value="Aditivo">Aditivo</option>
                                    <option value="Mejorador">Mejorador</option>
                                    <option value="Enzimático">Enzimático</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </FormField>
                            <FormField label="Marca / Proveedor" icon={<Truck size={13} />} error={fieldErrors?.brand}>
                                <input name="brand" value={formData.brand} onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder:text-slate-700"
                                    style={inputStyle}
                                    placeholder="Ej: Molino Cañuelas" />
                            </FormField>
                        </div>

                        {/* Precio + Harina Base */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                            <FormField label="Costo Base por Kg" icon={<DollarSign size={13} />} error={fieldErrors?.default_price}>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono"
                                        style={{ color: 'var(--text-2)' }}>$</span>
                                    <input type="number" step="0.0001" name="default_price"
                                        value={formData.default_price} onChange={handleChange}
                                        className="w-full pl-7 pr-3 py-2.5 rounded-lg font-mono text-sm outline-none"
                                        style={inputStyle} />
                                </div>
                            </FormField>
                            <div className="pb-1">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input type="checkbox" name="is_base_flour"
                                            checked={formData.is_base_flour} onChange={handleChange}
                                            className="sr-only peer" />
                                        <div className="w-10 h-5 rounded-full transition-all peer-checked:bg-green-500"
                                            style={{ background: formData.is_base_flour ? 'var(--accent)' : 'var(--border)' }}>
                                            <div className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${formData.is_base_flour ? 'translate-x-5' : ''}`}></div>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest"
                                        style={{ color: 'var(--text-2)' }}>Definir como Harina Base</span>
                                </label>
                            </div>
                        </div>

                        {/* Observaciones */}
                        <FormField label="Observaciones y Notas Técnicas" icon={<FileText size={13} />} error={fieldErrors?.observations}>
                            <textarea name="observations" rows="4" value={formData.observations} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none placeholder:text-slate-700"
                                style={inputStyle}
                                placeholder="Dosificación, fecha de vencimiento, requisitos de almacenamiento..." />
                        </FormField>

                        {/* Buttons */}
                        <div className="pt-2 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/ingredients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit" disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> {loading ? 'Registrando...' : 'Registrar Insumo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
