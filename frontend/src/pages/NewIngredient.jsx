import { useState } from 'react';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Truck, DollarSign, FileText, Activity, Tag } from 'lucide-react';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};
const labelStyle = { color: 'var(--text-2)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' };

function FormLabel({ icon, children }) {
    return (
        <label className="flex items-center gap-2 mb-2" style={labelStyle}>
            {icon} {children}
        </label>
    );
}

export default function NewIngredient() {
    const navigate = useNavigate();
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
        if (!formData.name) return alert('El nombre del ingrediente es obligatorio');
        try {
            const res = await fetch(`${API_URL}/api/ingredients/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    default_price: parseFloat(formData.default_price) || 0
                })
            });
            if (res.ok) {
                navigate('/ingredients');
            } else {
                const errData = await res.json();
                alert('Error al crear: ' + JSON.stringify(errData));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con el servidor');
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

                        {/* Nombre */}
                        <div>
                            <FormLabel icon={<Package size={13} />}>Nombre del Insumo / Ingrediente</FormLabel>
                            <input name="name" required value={formData.name} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-base font-bold outline-none placeholder:text-slate-700"
                                style={inputStyle}
                                placeholder="Ej: Harina de Trigo 000 Extra" />
                        </div>

                        {/* Tipo + Marca */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <FormLabel icon={<Tag size={13} />}>Tipo de Insumo</FormLabel>
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
                            </div>
                            <div>
                                <FormLabel icon={<Truck size={13} />}>Marca / Proveedor</FormLabel>
                                <input name="brand" value={formData.brand} onChange={handleChange}
                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none placeholder:text-slate-700"
                                    style={inputStyle}
                                    placeholder="Ej: Molino Cañuelas" />
                            </div>
                        </div>

                        {/* Precio + Harina Base */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-end">
                            <div>
                                <FormLabel icon={<DollarSign size={13} />}>Costo Base por Kg</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono"
                                        style={{ color: 'var(--text-2)' }}>$</span>
                                    <input type="number" step="0.0001" name="default_price"
                                        value={formData.default_price} onChange={handleChange}
                                        className="w-full pl-7 pr-3 py-2.5 rounded-lg font-mono text-sm outline-none"
                                        style={inputStyle} />
                                </div>
                            </div>
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
                        <div>
                            <FormLabel icon={<FileText size={13} />}>Observaciones y Notas Técnicas</FormLabel>
                            <textarea name="observations" rows="4" value={formData.observations} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none placeholder:text-slate-700"
                                style={inputStyle}
                                placeholder="Dosificación, fecha de vencimiento, requisitos de almacenamiento..." />
                        </div>

                        {/* Buttons */}
                        <div className="pt-2 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/ingredients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> Registrar Insumo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
