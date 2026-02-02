import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Package, Truck, DollarSign, FileText, Activity, Tag, Info } from 'lucide-react';

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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ingredients/`, {
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
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/ingredients" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Insumos
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> Alta de Insumos v2.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* Industrial Header */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                <Package size={12} /> Gestión de Suministros
                            </div>
                            <h1 className="text-3xl font-serif font-bold uppercase tracking-tighter leading-none">Nuevo Ingrediente</h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Especificación Técnica y Costeo de Materia Prima</p>
                        </div>
                        <Package size={80} className="text-slate-800 absolute -right-6 -bottom-6 opacity-30" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="space-y-6">
                            {/* SECCIÓN BÁSICA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Package size={14} className="text-orange-600" /> Nombre del Insumo / Ingrediente
                                    </label>
                                    <input
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-black text-xl outline-none focus:border-orange-600 focus:bg-white transition-all shadow-inner"
                                        placeholder="Ej: Harina de Trigo 000 Extra"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Tag size={14} className="text-orange-400" /> Tipo de Insumo
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
                                        <Truck size={14} className="text-orange-400" /> Marca / Proveedor
                                    </label>
                                    <input
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-orange-600 shadow-sm"
                                        placeholder="Ej: Molino Cañuelas"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <DollarSign size={14} className="text-green-600" /> Costo Base por Kg
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            name="default_price"
                                            value={formData.default_price}
                                            onChange={handleChange}
                                            className="w-full p-3 pl-8 border border-slate-200 rounded-sm font-mono text-sm font-black outline-none focus:border-green-600 shadow-sm"
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
                                        <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-orange-600 transition-colors tracking-widest">Definir como Harina Base</span>
                                    </label>
                                </div>
                            </div>

                            {/* SECCIÓN NOTAS TÉCNICAS */}
                            <div className="border-t border-slate-100 pt-8">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText size={14} className="text-orange-400" /> Observaciones y Notas Técnicas
                                </label>
                                <textarea
                                    name="observations"
                                    rows="4"
                                    value={formData.observations}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-slate-200 rounded-sm outline-none focus:border-orange-600 font-medium text-sm bg-slate-50 shadow-inner resize-none"
                                    placeholder="Especificar aquí detalles sobre dosificación, fecha de vencimiento o requisitos de almacenamiento..."
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                            <Link to="/ingredients" className="px-8 py-3 bg-white border border-slate-300 text-slate-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-green-600 hover:bg-slate-900 text-white font-black py-3 px-10 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-widest"
                            >
                                <Save size={18} /> Registrar Insumo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
