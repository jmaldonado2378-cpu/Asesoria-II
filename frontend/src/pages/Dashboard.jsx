import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Users,
    Briefcase,
    FlaskConical,
    TrendingUp,
    Clock,
    Award,
    ChevronRight,
    Activity,
    DollarSign,
    ShoppingBag,
    PieChart,
    BarChart3,
    Pipette
} from 'lucide-react';
import { API_URL } from '../config';

export default function Dashboard() {
    const [stats, setStats] = useState({
        clients: 0,
        projects: 0,
        essays: 0,
        avgScore: 0
    });
    const [financials, setFinancials] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        totalMargin: 0,
        projectBreakdown: []
    });
    const [recentEssays, setRecentEssays] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/clients/`).then(r => r.json()),
            fetch(`${API_URL}/api/projects/`).then(r => r.json()),
            fetch(`${API_URL}/api/ensayos/`).then(r => r.json()),
            fetch(`${API_URL}/api/visits/`).then(r => r.json())
        ]).then(([clientsData, projectsData, essaysData, visitsData]) => {
            // Safety checks
            const clients = Array.isArray(clientsData) ? clientsData : [];
            const projects = Array.isArray(projectsData) ? projectsData : [];
            const essays = Array.isArray(essaysData) ? essaysData : [];
            const visits = Array.isArray(visitsData) ? visitsData : [];

            // 1. Basic Stats
            const activeProjects = projects.filter(p => p.status === 'En Curso').length;
            const scores = essays.filter(e => e.final_score).map(e => parseFloat(e.final_score));
            const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;

            setStats({
                clients: clients.length,
                projects: activeProjects,
                essays: essays.length,
                avgScore: avg
            });

            // 2. Financial Aggregation
            let globalRevenue = 0;
            let globalExpenses = 0;

            const breakdown = projects.map(proj => {
                const projVisits = visits.filter(v => v.project === proj.id);

                // Revenue & Visit Expenses
                const pRevenue = projVisits.reduce((acc, v) => acc + parseFloat(v.fees || 0), 0);
                const pVisitExp = projVisits.reduce((acc, v) => acc + parseFloat(v.expenses || 0), 0);

                // Material Expenses (from LocalStorage)
                const savedExpenses = JSON.parse(localStorage.getItem(`proj_expenses_${proj.id}`)) || [];
                const pMatExp = savedExpenses.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);

                const totalPExp = pVisitExp + pMatExp;
                const pMargin = pRevenue - totalPExp;

                globalRevenue += pRevenue;
                globalExpenses += totalPExp;

                return {
                    id: proj.id,
                    name: proj.name,
                    client: proj.client_name,
                    revenue: pRevenue,
                    expenses: totalPExp,
                    margin: pMargin
                };
            });

            setFinancials({
                totalRevenue: globalRevenue,
                totalExpenses: globalExpenses,
                totalMargin: globalRevenue - globalExpenses,
                projectBreakdown: breakdown.filter(b => b.revenue > 0 || b.expenses > 0)
            });

            // 3. Recent Activity
            setRecentEssays(essays.slice(0, 5));
            setLoading(false);
        }).catch(err => {
            console.error("Dashboard error:", err);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <Clock className="animate-spin mr-3 text-indigo-600" size={20} /> Sincronizando Red Molinera...
        </div>
    );

    return (
        <div className="p-8 pb-20 bg-slate-100 min-h-screen pl-28 transition-all duration-500">
            <header className="mb-12 border-b-2 border-slate-200 pb-8 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
                        <Activity size={16} /> Sistema de Inteligencia Técnica v4.1
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                        Dashboard<br />
                        <span className="text-indigo-600">Financiero & Técnico</span>
                    </h1>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance Consolidado</div>
                    <div className={`text-3xl font-mono font-black ${financials.totalMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        $ {financials.totalMargin.toLocaleString()}
                    </div>
                </div>
            </header>

            {/* KPIs PRINCIPALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard icon={<Users />} label="Clientes" val={stats.clients} color="text-slate-900" />
                <StatCard icon={<Briefcase />} label="En Curso" val={stats.projects} color="text-slate-900" />
                <StatCard icon={<FlaskConical />} label="Ensayos" val={stats.essays} color="text-indigo-600" />
                <StatCard icon={<Award />} label="Calidad Ø" val={stats.avgScore} color="text-green-600" />
            </div>

            {/* RESUMEN FINANCIERO GLOBAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 bg-white p-8 rounded-sm shadow-2xl border border-slate-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BarChart3 size={18} className="text-indigo-600" /> Rendimiento por Proyecto
                        </h2>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valores en $</div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-[11px]">
                            <thead className="bg-slate-50 text-slate-400 uppercase font-black tracking-widest border-b border-slate-200">
                                <tr>
                                    <th className="p-4 pl-0">Proyecto / Cliente</th>
                                    <th className="p-4 text-right">Ingresos</th>
                                    <th className="p-4 text-right">Gastos</th>
                                    <th className="p-4 text-right">Margen</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {financials.projectBreakdown.length === 0 ? (
                                    <tr><td colSpan="4" className="p-8 text-center text-slate-300 italic">No hay datos financieros registrados.</td></tr>
                                ) : (
                                    financials.projectBreakdown.map(p => (
                                        <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="p-4 pl-0">
                                                <Link to={`/projects/${p.id}`} className="block">
                                                    <div className="font-bold text-slate-900 uppercase group-hover:text-indigo-600 tracking-tight">{p.name}</div>
                                                    <div className="text-[9px] text-slate-400 font-bold uppercase">{p.client}</div>
                                                </Link>
                                            </td>
                                            <td className="p-4 text-right font-black text-slate-600">$ {p.revenue.toLocaleString()}</td>
                                            <td className="p-4 text-right font-black text-red-500">$ {p.expenses.toLocaleString()}</td>
                                            <td className={`p-4 text-right font-black ${p.margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                $ {p.margin.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 p-8 rounded-sm shadow-2xl text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6">Estado Consolidado</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Ingresos</span>
                                <span className="text-xl font-mono font-black text-slate-100">$ {financials.totalRevenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Gastos</span>
                                <span className="text-xl font-mono font-black text-red-400">$ {financials.totalExpenses.toLocaleString()}</span>
                            </div>
                            <div className="pt-2">
                                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Margen Operativo</span>
                                <div className={`text-4xl font-mono font-black ${financials.totalMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    $ {financials.totalMargin.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-sm shadow-xl border border-slate-300">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Activity size={14} className="text-indigo-600" /> Accesos Directos
                        </h3>
                        <div className="space-y-3">
                            <QuickActionLink to="/essays/new" label="Nuevo Ensayo" desc="Registro técnico." />
                            <QuickActionLink to="/visits/new" label="Nueva Visita" desc="Agenda técnica." />
                            <QuickActionLink to="/projects/new" label="Abrir Proyecto" desc="Nuevo cliente/cuenta." />
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTIVIDAD RECIENTE */}
            <div className="bg-white p-8 rounded-sm shadow-2xl border border-slate-300">
                <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Clock size={14} className="text-orange-600" /> Últimos Protocolos Ejecutados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentEssays.map(e => (
                        <Link key={e.id} to={`/essays/${e.id}`} className="p-4 border border-slate-100 hover:border-orange-600 transition-all flex justify-between items-center group">
                            <div>
                                <div className="text-[11px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-orange-600">{e.code || `ENS-${e.id}`}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{e.description || 'Sin título'}</div>
                            </div>
                            <div className="text-[10px] font-mono font-bold text-slate-300">{e.date}</div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, val, color }) {
    return (
        <div className="bg-white p-6 rounded-sm shadow-lg border border-slate-200 relative overflow-hidden group hover:translate-y-[-4px] transition-all">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 100 }) : null}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1.5 relative z-10">
                <span className="text-indigo-600">{icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 12 }) : null}</span> {label}
            </div>
            <div className={`text-4xl font-black ${color} relative z-10`}>{val}</div>
        </div>
    );
}

function QuickActionLink({ to, label, desc }) {
    return (
        <Link to={to} className="group p-4 border border-slate-100 rounded-sm hover:border-indigo-600 hover:bg-indigo-50/30 transition-all flex items-center justify-between">
            <div>
                <div className="text-[11px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600">{label}</div>
                <div className="text-[9px] text-slate-400 font-medium italic">{desc}</div>
            </div>
            <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
        </Link>
    );
}
