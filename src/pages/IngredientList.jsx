import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Package, DollarSign, Truck, FileText, Activity, Loader2, Tag, ChevronRight } from 'lucide-react';

export default function IngredientList() {
    const { data: rawIngredients, isLoading } = useSWR(`${API_URL}/api/ingredients/`, fetcher);
    const [searchTerm, setSearchTerm] = useState('');

    // Ordenar por nombre por defecto (memoizado para evitar re-sorts innecesarios)
    const ingredients = useMemo(() => {
        if (!rawIngredients) return [];
        return [...rawIngredients].sort((a, b) => a.name.localeCompare(b.name));
    }, [rawIngredients]);

    const filtered = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.brand && i.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }} className="p-8">
            <div className="max-w-7xl mx-auto">

                <header className="flex justify-between items-end mb-10 pb-6" style={{ borderBottom: '2px solid var(--border)' }}>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Package size={28} style={{ color: 'var(--accent)' }} /> Materias Primas
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Base de Datos de Insumos, Aditivos e Ingredientes</p>
                    </div>
                    <Link to="/ingredients/new"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition active:scale-95"
                        style={{ background: 'var(--accent)', color: '#0f172a' }}>
                        <Plus size={16} /> Nuevo Ingrediente
                    </Link>
                </header>

                <div className="mb-8 relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15}
                        style={{ color: 'var(--text-2)' }} />
                    <input type="text"
                        placeholder="Filtrar por nombre o marca/proveedor..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <table className="w-full text-left border-collapse">
                        <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                            <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                                <th className="px-6 py-3 w-1/3">Insumo / Ingrediente</th>
                                <th className="px-4 py-3">Marca / Proveedor</th>
                                <th className="px-4 py-3 text-right">Costo / Kg</th>
                                <th className="px-4 py-3">Tipo</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center italic text-sm"
                                        style={{ color: 'var(--text-2)' }}>Sin registros en la base de datos</td>
                                </tr>
                            ) : (
                                filtered.map((ing, i) => (
                                    <tr key={ing.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.3)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                        className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3">
                                            <Link to={`/ingredients/${ing.id}`}
                                                className="font-bold text-sm hover:underline transition"
                                                style={{ color: 'var(--accent)' }}>
                                                {ing.name}
                                            </Link>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {ing.is_base_flour && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest"
                                                        style={{ background: 'rgba(234,179,8,0.15)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }}>
                                                        Harina Base
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-mono" style={{ color: 'var(--text-2)' }}>#{ing.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--text-2)' }}>
                                            {ing.brand || <span className="opacity-40 italic">No especificado</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            <span className="text-sm font-bold" style={{ color: 'var(--score-high)' }}>
                                                ${parseFloat(ing.default_price || 0).toFixed(4)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                {ing.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/ingredients/${ing.id}`}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                Consultar
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="p-4 flex justify-between text-xs font-mono"
                        style={{ background: '#0f172a', borderTop: '1px solid var(--border)', color: 'var(--text-2)' }}>
                        <span>Inventario activo</span>
                        <span>Insumos registrados: {filtered.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
