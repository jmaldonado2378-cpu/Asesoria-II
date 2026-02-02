import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Calendar, FileText, User, Loader2, Beaker, Plus } from 'lucide-react';

export default function Essays() {
    const [ensayos, setEnsayos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // IMPORTANTE: Usamos la ruta en español 'ensayos'
        fetch(`${import.meta.env.VITE_API_URL}/api/ensayos/`)
            .then((res) => {
                if (!res.ok) throw new Error('Error al conectar con el servidor');
                return res.json();
            })
            .then((data) => {
                setEnsayos(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError('No se pudieron cargar los ensayos.');
                setLoading(false);
            });
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <header className="flex justify-between items-end mb-12 border-b-2 border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter">
                        <FlaskConical className="text-indigo-600" size={32} /> Historial de Ensayos
                    </h1>
                    <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Laboratorio Molinero I+D / Control de Calidad Especializado</p>
                </div>
                <Link
                    to="/essays/new"
                    className="bg-slate-900 text-white px-6 py-3 rounded shadow-xl hover:bg-slate-800 transition transform active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700"
                >
                    <Plus size={18} /> Crear Nuevo Registro
                </Link>
            </header>

            {error && (
                <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-lg border border-red-200">
                    ⚠️ {error}
                </div>
            )}

            <div className="bg-white rounded-sm shadow-xl border border-slate-300 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-800">
                        <tr>
                            <th className="p-5 pl-8 border-r border-slate-800">Fecha Emisión</th>
                            <th className="p-5 border-r border-slate-800">Identificación / Código</th>
                            <th className="p-5 border-r border-slate-800">Entidad Cliente</th>
                            <th className="p-5 border-r border-slate-800 text-center">Estado Valid.</th>
                            <th className="p-5 border-r border-slate-800 text-right pr-8">Costo Estim.</th>
                            <th className="p-5 text-right pr-8">Acciones Téc.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {ensayos.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-16 text-center text-slate-400 italic text-sm">
                                    No existen registros técnicos en la base de datos.
                                </td>
                            </tr>
                        ) : (
                            ensayos.map((ensayo) => (
                                <tr key={ensayo.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                                    <td className="p-4 pl-6 text-slate-500 font-mono text-xs font-bold border-r border-slate-50">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-400" />
                                            {ensayo.date || 'S/F'}
                                        </div>
                                    </td>
                                    <td className="p-4 font-serif font-bold text-slate-900 text-lg uppercase tracking-tight border-r border-slate-50">
                                        {ensayo.code || `ENS-${ensayo.id}`}
                                        <div className="text-[9px] text-slate-400 font-sans font-normal normal-case tracking-normal italic">{ensayo.name}</div>
                                    </td>
                                    <td className="p-4 text-slate-600 border-r border-slate-50">
                                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
                                            <User size={14} className="text-slate-300" />
                                            {ensayo.client_name || 'General Molinero'}
                                        </div>
                                    </td>
                                    <td className="p-4 border-r border-slate-50">
                                        <span className={`px-2.5 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest border ${ensayo.status === 'APROBADO' ? 'bg-green-50 text-green-700 border-green-200' :
                                            ensayo.status === 'RECHAZADO' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                                            }`}>
                                            {ensayo.status || 'En Proceso'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right border-r border-slate-50">
                                        <div className="font-mono font-bold text-slate-900 text-xs">
                                            ${parseFloat(ensayo.total_cost || 0).toFixed(2)}
                                        </div>
                                        <div className="text-[8px] text-slate-300 font-bold uppercase">Base Batch</div>
                                    </td>
                                    <td className="p-4 text-right pr-6">
                                        <Link to={`/essays/${ensayo.id}`} className="bg-slate-900 text-white hover:bg-indigo-600 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition shadow-lg inline-flex items-center gap-2">
                                            <FileText size={12} /> Consultar Informe
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
