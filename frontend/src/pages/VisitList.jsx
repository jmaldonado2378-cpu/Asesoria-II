import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Briefcase, CheckCircle, Clock, Truck, Activity, Loader2, ChevronRight, XCircle } from 'lucide-react';

export default function VisitList() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/visits/`)
            .then(r => r.json())
            .then(d => {
                // Ordenar por fecha (más nuevas primero)
                const sorted = d.sort((a, b) => new Date(b.date) - new Date(a.date));
                setVisits(sorted);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, []);

    const filtered = visits.filter(v =>
        v.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.objective && v.objective.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-orange-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-7xl mx-auto">

                {/* HEADER INDUSTRIAL */}
                <header className="flex justify-between items-end mb-10 border-b-2 border-slate-200 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter leading-none">
                            <Calendar className="text-orange-600" size={32} /> Agenda Técnica
                        </h1>
                        <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Planificación de Visitas y Seguimiento de Campo</p>
                    </div>
                    <Link
                        to="/visits/new"
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-sm shadow-xl hover:bg-slate-800 transition transform active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700"
                    >
                        <Plus size={18} /> Agendar Visita
                    </Link>
                </header>

                {/* BUSCADOR INDUSTRIAL */}
                <div className="mb-8 relative max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Filtrar por cliente u objetivo..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-sm shadow-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* TABLA DE VISITAS */}
                <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                            <tr>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Calendar size={12} /> Fecha / Hora</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Briefcase size={12} /> Cliente / Proyecto</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Activity size={12} /> Tipo / Objetivo</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100 text-center">Estado</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right text-slate-400">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">Sin visitas agendadas en el sistema</td>
                                </tr>
                            ) : (
                                filtered.map(visit => (
                                    <tr key={visit.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 uppercase tracking-tighter">{visit.date}</span>
                                                <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={10} className="text-orange-400" /> {visit.start_time.substring(0, 5)} hs
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{visit.client_name}</span>
                                                {visit.project_name && (
                                                    <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider mt-1 flex items-center gap-1 bg-orange-50 w-fit px-1 rounded-sm border border-orange-100">
                                                        <Briefcase size={8} /> {visit.project_name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">{visit.visit_type}</span>
                                                <span className="text-xs font-medium text-slate-400 italic mt-1 truncate max-w-[200px]">{visit.objective || 'Sin objetivo definido'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50 text-center">
                                            <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center justify-center gap-2 w-fit mx-auto ${visit.status === 'Realizada' ? 'bg-green-50 text-green-700 border-green-200' :
                                                visit.status === 'Cancelada' ? 'bg-red-50 text-red-700 border-red-200 text-slate-400' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {visit.status === 'Realizada' ? <CheckCircle size={10} /> : (visit.status === 'Cancelada' ? <XCircle size={10} /> : <Clock size={10} />)}
                                                {visit.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/visits/${visit.id}`}
                                                className="bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 w-fit ml-auto border border-slate-200 group-hover:border-slate-900 shadow-sm"
                                            >
                                                {visit.status === 'Pendiente' ? 'Gestionar' : 'Ver Reporte'} <ChevronRight size={14} />
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
                            <Activity size={14} className="animate-pulse text-orange-500" /> Agenda Kernel System v2.0
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Registros Totales: {filtered.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
