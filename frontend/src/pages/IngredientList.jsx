import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, DollarSign, Truck, FileText, Activity, Loader2, Tag, ChevronRight } from 'lucide-react';

export default function IngredientList() {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/ingredients/`)
            .then(r => r.json())
            .then(d => {
                // Ordenar por nombre por defecto
                const sorted = d.sort((a, b) => a.name.localeCompare(b.name));
                setIngredients(sorted);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.brand && i.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-orange-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* HEADER INDUSTRIAL */}
                <header className="flex justify-between items-end mb-10 border-b-2 border-slate-200 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter leading-none">
                            <Package className="text-orange-600" size={32} /> Materias Primas
                        </h1>
                        <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Base de Datos de Insumos, Aditivos e Ingredientes</p>
                    </div>
                    <Link
                        to="/ingredients/new"
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-sm shadow-xl hover:bg-slate-800 transition transform active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700"
                    >
                        <Plus size={18} /> Nuevo Ingrediente
                    </Link>
                </header>

                {/* BUSCADOR INDUSTRIAL */}
                <div className="mb-8 relative max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Filtrar por nombre o marca/proveedor..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-sm shadow-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* TABLA TÉCNICA DE INGREDIENTES */}
                <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                            <tr>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100 w-1/3">
                                    <div className="flex items-center gap-2"><Package size={12} /> Insumo / Ingrediente</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Truck size={12} /> Marca / Proveedor</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100 text-right">
                                    <div className="flex items-center justify-end gap-2"><DollarSign size={12} /> Costo / Kg</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Tag size={12} /> Tipo</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right text-slate-400">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">Sin registros cargados en la base de datos</td>
                                </tr>
                            ) : (
                                filtered.map(ing => (
                                    <tr key={ing.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <Link to={`/ingredients/${ing.id}`} className="text-base font-serif font-black text-slate-900 uppercase tracking-tighter group-hover:text-orange-600 transition-colors">
                                                    {ing.name}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {ing.is_base_flour && (
                                                        <span className="bg-orange-100 text-orange-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-sm border border-orange-200 tracking-tighter">Harina Base</span>
                                                    )}
                                                    <span className="text-[10px] font-mono text-slate-400 uppercase">SKU: #{ing.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{ing.brand || <span className="text-slate-300 font-normal italic">No especificado</span>}</span>
                                        </td>
                                        <td className="p-4 border-r border-slate-50 text-right font-mono">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-green-700">${parseFloat(ing.default_price || 0).toFixed(4)}</span>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Precio Base</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50">
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-sm text-[9px] font-black uppercase tracking-widest">
                                                {ing.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/ingredients/${ing.id}`}
                                                className="bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 w-fit ml-auto border border-slate-200 group-hover:border-slate-900 shadow-sm"
                                            >
                                                Consultar <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* FOOTER INDUSTRIAL */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity size={14} className="animate-pulse text-orange-500" /> Kernel Link: RAW-MATERIALS-DB
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Insumos Registrados: {filtered.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
