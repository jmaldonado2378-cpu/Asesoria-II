import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '../config';
import { Link } from 'react-router-dom';
import {
    Calendar, FolderKanban, FlaskConical, ArrowRight,
    Clock, Activity, TrendingUp, AlertCircle, Package,
    Plus, ChevronRight
} from 'lucide-react';

export default function Home() {
    // SWR: carga paralela con caché reactiva para el dashboard
    const { data: proj, isLoading: loadProj } = useSWR(`${API_URL}/api/projects/`, fetcher);
    const { data: visitData, isLoading: loadVisits } = useSWR(`${API_URL}/api/visits/`, fetcher);
    const { data: essayData, isLoading: loadEssays } = useSWR(`${API_URL}/api/ensayos/`, fetcher);

    const [userName, setUserName] = useState('Consultor');
    const hour = new Date().getHours();
    const greeting = hour < 13 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
    const today = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    useEffect(() => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            const cfg = JSON.parse(savedSettings);
            if (cfg.userName) setUserName(cfg.userName);
        }
    }, []);

    const loading = loadProj || loadVisits || loadEssays;

    // Derivar estadísticas a partir de los datos cacheados
    const projects = Array.isArray(proj) ? proj : [];
    const visits = Array.isArray(visitData) ? visitData : [];
    const essays = Array.isArray(essayData) ? essayData : [];

    const stats = {
        projects: projects.filter(p => p.status === 'En Curso').length,
        visits: visits.filter(v => v.status === 'Pendiente').length,
        essays: essays.length,
    };

    const upcomingVisits = visits
        .filter(v => v.status === 'Pendiente')
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

    const recentEssays = [...essays]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-2)' }}>
            <Activity className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
            Inicializando sistema...
        </div>
    );

    return (
        <div className="min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-7xl mx-auto space-y-8">

                {/* ── HEADER ── */}
                <header className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-2)' }}>
                            {today}
                        </p>
                        <h1 className="text-3xl font-bold text-white">
                            {greeting},{' '}
                            <span style={{ color: 'var(--accent)' }}>{userName}</span>
                        </h1>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>
                            Resumen de actividad técnica y visitas programadas
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/essays/new"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                            style={{ background: 'var(--accent)', color: '#0f172a' }}>
                            <Plus size={16} /> Nuevo Ensayo
                        </Link>
                        <Link to="/visits/new"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
                            style={{ background: 'var(--accent-2)', color: 'white' }}>
                            <Plus size={16} /> Agregar Visita
                        </Link>
                    </div>
                </header>

                {/* ── KPI CARDS ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KpiCard label="Proyectos Activos" value={stats.projects} sub="+0 este mes" icon={<FolderKanban size={18} />} accent="var(--accent)" />
                    <KpiCard label="Visitas Pendientes" value={stats.visits} sub="próximas en agenda" icon={<Calendar size={18} />} accent="#fb923c" />
                    <KpiCard label="Ensayos Realizados" value={stats.essays} sub="total histórico" icon={<FlaskConical size={18} />} accent="#60a5fa" />
                    <KpiCard label="Score Promedio" value="—" sub="promedio general" icon={<TrendingUp size={18} />} accent="#c084fc" />
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid lg:grid-cols-5 gap-6">

                    {/* Próximas visitas (60%) */}
                    <section className="lg:col-span-3 rounded-xl overflow-hidden"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center px-6 py-4"
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                                <Clock size={14} style={{ color: 'var(--accent)' }} /> Próximas Visitas
                            </h2>
                            <Link to="/visits" className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-colors hover:text-white"
                                style={{ color: 'var(--accent)' }}>
                                Ver todas <ArrowRight size={12} />
                            </Link>
                        </div>

                        {/* Tabla */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-[11px] font-bold uppercase tracking-wider"
                                        style={{ color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
                                        <th className="px-6 py-3">Cliente</th>
                                        <th className="px-4 py-3">Fecha</th>
                                        <th className="px-4 py-3">Tipo</th>
                                        <th className="px-4 py-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingVisits.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-10 text-center text-sm italic"
                                                style={{ color: 'var(--text-2)' }}>
                                                No hay visitas pendientes
                                            </td>
                                        </tr>
                                    ) : upcomingVisits.map((v, i) => (
                                        <tr key={v.id}
                                            style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.4)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                            className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-3 font-semibold text-white">{v.client_name}</td>
                                            <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-2)' }}>{v.date}</td>
                                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{v.visit_type}</td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={v.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Ensayos recientes (40%) */}
                    <section className="lg:col-span-2 rounded-xl overflow-hidden"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center px-6 py-4"
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <h2 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-white">
                                <FlaskConical size={14} style={{ color: 'var(--accent)' }} /> Ensayos Recientes
                            </h2>
                            <Link to="/essays" className="text-xs font-bold uppercase tracking-wide flex items-center gap-1 transition-colors hover:text-white"
                                style={{ color: 'var(--accent)' }}>
                                Ver todos <ArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                            {recentEssays.length === 0 ? (
                                <div className="px-6 py-10 text-center text-sm italic" style={{ color: 'var(--text-2)' }}>
                                    No hay ensayos registrados
                                </div>
                            ) : recentEssays.map(e => {
                                const score = e.final_score ? parseFloat(e.final_score) : null;
                                const scoreColor = score === null ? 'var(--text-2)'
                                    : score >= 8 ? 'var(--score-high)'
                                        : score >= 6 ? 'var(--score-mid)'
                                            : 'var(--score-low)';
                                return (
                                    <Link key={e.id} to={`/essays/${e.id}`}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors group">
                                        <div className="space-y-0.5">
                                            <div className="font-bold text-sm font-mono group-hover:text-green-400 transition-colors"
                                                style={{ color: 'var(--accent)' }}>
                                                {e.code || `ENS-${String(e.id).padStart(3, '0')}`}
                                            </div>
                                            <div className="text-xs" style={{ color: 'var(--text-2)' }}>
                                                {e.client_name || 'Sin cliente'} · {e.date}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {score !== null ? (
                                                <span className="text-2xl font-black" style={{ color: scoreColor }}>
                                                    {score.toFixed(1)}
                                                </span>
                                            ) : (
                                                <AlertCircle size={16} style={{ color: 'var(--text-2)' }} />
                                            )}
                                            <ChevronRight size={14} style={{ color: 'var(--text-2)' }} className="group-hover:text-white transition-colors" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* ── ACCESO RÁPIDO ── */}
                <section className="rounded-xl p-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-2)' }}>
                        Acceso Rápido
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <QuickBtn to="/essays/new" label="Nuevo Ensayo" icon={<FlaskConical size={16} />} />
                        <QuickBtn to="/visits/new" label="Agendar Visita" icon={<Calendar size={16} />} />
                        <QuickBtn to="/ingredients" label="Insumos" icon={<Package size={16} />} />
                        <QuickBtn to="/projects" label="Ver Proyectos" icon={<FolderKanban size={16} />} />
                    </div>
                </section>

            </div>
        </div>
    );
}

/* ── Sub-components ── */
function KpiCard({ label, value, sub, icon, accent }) {
    return (
        <div className="rounded-xl p-5 relative overflow-hidden transition-transform hover:-translate-y-1"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>{label}</span>
                <span style={{ color: accent }}>{icon}</span>
            </div>
            <div className="text-4xl font-black text-white leading-none mb-1">{value}</div>
            <div className="text-[11px] font-medium" style={{ color: 'var(--text-2)' }}>{sub}</div>
            {/* Accent glow corner */}
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10"
                style={{ background: accent }} />
        </div>
    );
}

function StatusBadge({ status }) {
    const map = {
        'Pendiente': { bg: 'rgba(67,20,7,0.8)', text: '#fb923c' },
        'Realizada': { bg: 'rgba(20,83,45,0.8)', text: '#4ade80' },
        'Confirmada': { bg: 'rgba(30,58,95,0.8)', text: '#60a5fa' },
        'Cancelada': { bg: 'rgba(69,10,10,0.8)', text: '#f87171' },
    };
    const s = map[status] || { bg: 'rgba(51,65,85,0.5)', text: '#94a3b8' };
    return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
            style={{ background: s.bg, color: s.text }}>
            {status}
        </span>
    );
}

function QuickBtn({ to, label, icon }) {
    return (
        <Link to={to}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all active:scale-95 hover:bg-opacity-100"
            style={{ border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            {icon} {label}
        </Link>
    );
}
