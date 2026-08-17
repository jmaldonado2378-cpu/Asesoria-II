import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

export default function ProjectVisitsTab({ visits }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-end mb-6">
                <Link to="/visits/new" className="flex items-center gap-2 bg-[var(--bg-panel)] text-white px-6 py-3 rounded-sm shadow-xl transition font-black text-[10px] uppercase tracking-widest border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                    <Plus size={16} /> Agendar Visita Técnica
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {visits.length === 0 ? (
                    <div className="md:col-span-2 bg-[var(--bg-panel)] border-2 border-dashed border-[var(--border)] p-20 text-center rounded-sm">
                        <Calendar size={48} className="mx-auto text-[var(--border)] mb-4" />
                        <p className="text-[var(--text-2)] font-bold uppercase text-xs tracking-widest">No hay visitas de campo programadas.</p>
                    </div>
                ) : (
                    visits.map(v => (
                        <Link key={v.id} to={`/visits/${v.id}`} className="bg-[var(--bg-panel)] border border-[var(--border)] shadow-xl hover:border-[var(--accent)] transition-all p-8 flex justify-between items-center group relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${v.status === 'Realizada' ? 'bg-[var(--accent)]' : 'bg-orange-500'}`}></div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm text-[#0f172a] ${v.status === 'Realizada' ? 'bg-[var(--accent)]' : 'bg-orange-500'}`}>{v.status}</span>
                                    <span className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-widest">{v.visit_type}</span>
                                </div>
                                <div>
                                    <div className="text-xl font-black text-[var(--text-1)] uppercase tracking-tighter group-hover:text-[var(--accent)] transition-colors">{v.objective || 'Visita Técnica'}</div>
                                    <div className="text-[10px] font-bold text-[var(--text-2)] flex items-center gap-4 mt-1">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {v.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12} /> {v.start_time?.substring(0, 5)} hs</span>
                                        {v.kilometers > 0 && <span className="flex items-center gap-1 text-[var(--accent)]"><TrendingUp size={12} /> {v.kilometers} KM</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-[var(--bg-main)] px-4 py-2 rounded-sm group-hover:bg-[var(--accent)] transition-colors">
                                <span className="text-xs font-black text-[var(--text-2)] uppercase tracking-widest group-hover:text-[#0f172a]">Gestionar</span>
                                <ArrowLeft size={14} className="rotate-180 text-[var(--accent)] group-hover:text-[#0f172a]" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
