import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import {
    Calendar,
    FolderKanban,
    FlaskConical,
    ArrowRight,
    Clock,
    CheckCircle,
    Activity,
    TrendingUp,
    LayoutDashboard,
    AlertCircle,
    Package
} from 'lucide-react';

export default function Home() {
    const [stats, setStats] = useState({ projects: 0, visits: 0, essays: 0 });
    const [upcomingVisits, setUpcomingVisits] = useState([]);
    const [recentEssays, setRecentEssays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/projects/`).then(r => r.json()),
            fetch(`${API_URL}/api/visits/`).then(r => r.json()),
            fetch(`${API_URL}/api/ensayos/`).then(r => r.json())
        ]).then(([proj, visits, essays]) => {
            // Stats
            const activeProjs = proj.filter(p => p.status === 'En Curso').length;
            const pendingVisits = visits.filter(v => v.status === 'Pendiente').length;
            const totalEssays = essays.length;
            setStats({ projects: activeProjs, visits: pendingVisits, essays: totalEssays });

            // Próximas Visitas (Filtrar pendientes y ordenar por fecha asc)
            const next = visits
                .filter(v => v.status === 'Pendiente')
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 3);
            setUpcomingVisits(next);

            // Ensayos Recientes (Ordenar por fecha desc)
            const recent = essays
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 3);
            setRecentEssays(recent);

            setLoading(false);
        }).catch(e => {
            console.error(e);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400 pl-20">
            <Activity className="animate-spin mr-3 text-orange-600" size={20} /> Inicializando Centro de Control...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 pl-28"> {/* pl-28 para dejar espacio al sidebar */}
            <div className="max-w-7xl mx-auto">

                {/* HEADER PANEL */}
                <header className="mb-12 border-b-2 border-slate-200 pb-8 relative overflow-hidden">
                    <div className="flex items-center gap-3 text-orange-600 text-[10px] font-black uppercase tracking-[0.4em] mb-3">
                        <LayoutDashboard size={18} /> Operaciones Globales I+D v3.1
                    </div>
                    <h1 className="text-5xl font-serif font-black text-slate-900 uppercase tracking-tight leading-none">
                        Dashboard de <br />
                        <span className="text-orange-600">Control Técnico</span>
                    </h1>
                    <TrendingUp size={120} className="absolute -right-10 -bottom-10 text-slate-200 opacity-50 pointer-events-none" />
                </header>

                {/* KPIs INDUSTRIALES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <StatCard
                        label="Proyectos Activos"
                        val={stats.projects}
                        icon={<FolderKanban size={24} />}
                        color="border-orange-600"
                        bg="bg-orange-600"
                    />
                    <StatCard
                        label="Agenda Pendiente"
                        val={stats.visits}
                        icon={<Calendar size={24} />}
                        color="border-indigo-600"
                        bg="bg-indigo-600"
                    />
                    <StatCard
                        label="Ensayos Realizados"
                        val={stats.essays}
                        icon={<FlaskConical size={24} />}
                        color="border-slate-900"
                        bg="bg-slate-900"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* PRÓXIMAS VISITAS */}
                    <section className="bg-white rounded-sm shadow-2xl border border-slate-300 overflow-hidden">
                        <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                                <Clock size={16} className="text-orange-600" /> Próximas Visitas de Campo
                            </h3>
                            <Link to="/visits" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-orange-600 transition-colors flex items-center gap-1 group">
                                Ver Agenda <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="divide-y-2 divide-slate-50 font-mono">
                            {upcomingVisits.length === 0 ? (
                                <div className="p-12 text-center text-slate-300 uppercase text-[10px] font-bold tracking-[0.2em] italic">
                                    No se detectan intervenciones programadas.
                                </div>
                            ) : (
                                upcomingVisits.map(v => (
                                    <div key={v.id} className="p-6 flex justify-between items-center hover:bg-orange-50 transition-colors group">
                                        <div className="space-y-1">
                                            <div className="font-serif font-black text-slate-900 uppercase tracking-tight text-sm group-hover:text-orange-600 transition-colors">{v.client_name}</div>
                                            <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-300" /> {v.date} — <Clock size={12} className="text-slate-300" /> {v.start_time?.substring(0, 5)} hs
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 rounded-sm border border-slate-800 shadow-lg group-hover:bg-orange-600 group-hover:border-orange-500 transition-colors">
                                                {v.visit_type}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* ENSAYOS RECIENTES */}
                    <section className="bg-slate-900 rounded-sm shadow-2xl border border-slate-800 overflow-hidden text-white">
                        <div className="p-6 border-b-2 border-slate-800 flex justify-between items-center bg-slate-800/50">
                            <h3 className="font-black text-white uppercase tracking-widest text-xs flex items-center gap-2">
                                <FlaskConical size={16} className="text-orange-500" /> Registro Reciente de Ensayos
                            </h3>
                            <Link to="/essays" className="text-[10px] font-black text-orange-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 group">
                                Ver Todos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="divide-y-2 divide-slate-800 font-mono">
                            {recentEssays.length === 0 ? (
                                <div className="p-12 text-center text-slate-600 uppercase text-[10px] font-bold tracking-[0.2em] italic">
                                    Archivo histórico vacío o en proceso de carga.
                                </div>
                            ) : (
                                recentEssays.map(e => (
                                    <Link key={e.id} to={`/essays/${e.id}`} className="p-6 flex justify-between items-center hover:bg-slate-800 transition-all group block">
                                        <div className="space-y-1">
                                            <div className="font-serif font-black text-white uppercase tracking-tighter text-base group-hover:text-orange-400 transition-colors">
                                                {e.code || `ENS-${e.id.toString().padStart(3, '0')}`}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-400 transition-colors">
                                                <Users size={12} /> {e.client_name || 'Sin Cliente Asignado'}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {e.final_score ? (
                                                <div className="text-right">
                                                    <div className={`text-2xl font-black ${parseFloat(e.final_score) >= 8 ? 'text-green-500' : 'text-orange-500'}`}>
                                                        {parseFloat(e.final_score).toFixed(1)}
                                                    </div>
                                                    <div className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Quality Score</div>
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border-2 border-slate-700 flex items-center justify-center text-slate-700">
                                                    <AlertCircle size={16} />
                                                </div>
                                            )}
                                            <ChevronRight size={16} className="text-slate-700 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* ACCESS DOCK */}
                <div className="mt-12 p-8 bg-white border border-slate-300 rounded-sm shadow-xl flex flex-wrap justify-between items-center gap-8">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Acceso Rápido</div>
                        <div className="text-2xl font-serif font-black text-slate-900 uppercase tracking-tighter">Terminal de Datos</div>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <DockButton to="/essays/new" label="Nuevo Ensayo" icon={<FlaskConical size={18} />} />
                        <DockButton to="/visits/new" label="Agendar Visita" icon={<Calendar size={18} />} />
                        <DockButton to="/ingredients" label="Insumos" icon={<Package size={18} />} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, val, icon, color, bg }) {
    return (
        <div className={`bg-white p-8 rounded-sm shadow-2xl border border-slate-300 border-l-[6px] ${color} relative overflow-hidden group hover:bg-slate-50 transition-colors`}>
            <div className={`absolute -right-6 -bottom-6 text-slate-100 transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                {icon && typeof icon === 'object' ? Object.assign({}, icon, { props: { ...icon.props, size: 140 } }) : null}
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <span className="text-orange-600">{icon}</span> {label}
                </div>
                <div className="text-6xl font-serif font-black text-slate-900 leading-none tracking-tighter">{val}</div>
            </div>
        </div>
    );
}

function DockButton({ to, label, icon }) {
    return (
        <Link
            to={to}
            className="flex items-center gap-3 px-6 py-3 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white border border-slate-200 hover:border-slate-800 rounded-sm transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
        >
            {icon} {label}
        </Link>
    );
}

