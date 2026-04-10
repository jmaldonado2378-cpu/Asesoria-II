import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Briefcase, CheckCircle, Clock, Truck, Activity, Loader2, ChevronRight, XCircle, List, LayoutGrid, ChevronLeft } from 'lucide-react';

export default function VisitList() {
    const { data: rawVisits, isLoading } = useSWR(`${API_URL}/api/visits/`, fetcher);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Ordenar por fecha (más nuevas primero), memoizado
    const visits = useMemo(() => {
        if (!rawVisits) return [];
        return [...rawVisits].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [rawVisits]);

    const filtered = visits.filter(v =>
        v.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.objective && v.objective.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
        </div>
    );

    // --- LÓGICA DEL CALENDARIO ---
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const daysInMonth = getDaysInMonth(year, month);
    let firstDay = getFirstDayOfMonth(year, month);
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Ajuste para que Lunes sea 0

    const days = [];
    for (let i = 0; i < firstDay; i++) { days.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { days.push(i); }

    const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));

    const getVisitsForDay = (day) => {
        if (!day) return [];
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return filtered.filter(v => v.date === dateStr);
    };

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div className="min-h-screen p-8" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-7xl mx-auto">

                <header className="flex justify-between items-end mb-10 pb-6" style={{ borderBottom: '2px solid var(--border)' }}>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Calendar size={28} style={{ color: 'var(--accent)' }} /> Agenda Técnica
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Planificación de Visitas y Seguimiento de Campo</p>
                    </div>
                    <Link
                        to="/visits/new"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition active:scale-95"
                        style={{ background: 'var(--accent)', color: '#0f172a' }}
                    >
                        <Plus size={16} /> Agendar Visita
                    </Link>
                </header>

                {/* CONTROLES: BUSCADOR Y TABS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="relative w-full max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15} style={{ color: 'var(--text-2)' }} />
                        <input
                            type="text"
                            placeholder="Filtrar por cliente u objetivo..."
                            className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex p-1 rounded-lg gap-1" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setViewMode('list')}
                            className="flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all"
                            style={viewMode === 'list' ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : { color: 'var(--text-2)' }}
                        >
                            <List size={14} /> Lista
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className="flex items-center gap-2 px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all"
                            style={viewMode === 'calendar' ? { background: 'var(--accent-dim)', color: 'var(--accent)' } : { color: 'var(--text-2)' }}
                        >
                            <LayoutGrid size={14} /> Calendario
                        </button>
                    </div>
                </div>

                {/* VISTAS */}
                {viewMode === 'list' ? (
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        <table className="w-full text-left border-collapse">
                            <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                                <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                                    <th className="px-6 py-3">Fecha / Hora</th>
                                    <th className="px-4 py-3">Cliente</th>
                                    <th className="px-4 py-3">Tipo / Objetivo</th>
                                    <th className="px-4 py-3 text-center">Estado</th>
                                    <th className="px-4 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center italic text-sm" style={{ color: 'var(--text-2)' }}>Sin visitas agendadas</td>
                                    </tr>
                                ) : (
                                    filtered.map((visit, i) => {
                                        const badgeMap = {
                                            'Realizada': { bg: 'rgba(20,83,45,0.8)', color: '#4ade80' },
                                            'Cancelada': { bg: 'rgba(69,10,10,0.8)', color: '#f87171' },
                                            'Pendiente': { bg: 'rgba(67,20,7,0.8)', color: '#fb923c' },
                                            'Confirmada': { bg: 'rgba(30,58,95,0.8)', color: '#60a5fa' },
                                        };
                                        const badge = badgeMap[visit.status] || { bg: 'rgba(51,65,85,0.5)', color: '#94a3b8' };
                                        return (
                                            <tr key={visit.id}
                                                style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.3)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                                className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="font-semibold text-white text-sm">{visit.date}</div>
                                                    <div className="text-xs font-mono mt-0.5 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                                                        <Clock size={10} /> {visit.start_time?.substring(0, 5)} hs
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-white text-sm">{visit.client_name}</div>
                                                    {visit.project_name && <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{visit.project_name}</div>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs font-bold" style={{ color: 'var(--text-2)' }}>{visit.visit_type}</div>
                                                    <div className="text-xs italic mt-0.5 truncate max-w-[200px]" style={{ color: 'var(--text-2)' }}>{visit.objective || '—'}</div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                                        style={{ background: badge.bg, color: badge.color }}>
                                                        {visit.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link to={`/visits/${visit.id}`}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                        style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                        {visit.status === 'Pendiente' ? 'Gestionar' : 'Ver'}
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                        <div className="p-4 flex justify-between text-xs font-mono" style={{ background: '#0f172a', borderTop: '1px solid var(--border)', color: 'var(--text-2)' }}>
                            <span>Sistema activo</span>
                            <span>Total: {filtered.length} visitas</span>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                        <div className="flex justify-between items-center p-6" style={{ borderBottom: '1px solid var(--border)' }}>
                            <h2 className="text-xl font-bold text-white">
                                {monthNames[month]} <span style={{ color: 'var(--accent)' }}>{year}</span>
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 rounded-lg transition" style={{ background: 'var(--bg-hover)', color: 'var(--text-2)' }}><ChevronLeft size={16} /></button>
                                <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-lg text-xs font-bold transition" style={{ background: 'var(--bg-hover)', color: 'var(--text-2)' }}>Hoy</button>
                                <button onClick={nextMonth} className="p-2 rounded-lg transition" style={{ background: 'var(--bg-hover)', color: 'var(--text-2)' }}><ChevronRight size={16} /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)', background: '#0f172a' }}>
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                                <div key={d} className="p-3 text-center text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)', borderRight: '1px solid var(--border)' }}>{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 auto-rows-[minmax(110px,_min-content)]">
                            {days.map((day, idx) => {
                                const dayVisits = getVisitsForDay(day);
                                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                                return (
                                    <div key={idx} style={{
                                        background: !day ? 'rgba(0,0,0,0.2)' : 'transparent',
                                        borderRight: '1px solid var(--border)',
                                        borderBottom: '1px solid var(--border)',
                                        boxShadow: isToday ? 'inset 0 0 0 2px var(--accent)' : 'none'
                                    }} className="p-2 transition-colors hover:bg-white/5">
                                        {day && (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-bold w-6 h-6 flex items-center justify-center rounded-md"
                                                        style={{ background: isToday ? 'var(--accent)' : 'transparent', color: isToday ? '#0f172a' : 'var(--text-2)' }}>{day}</span>
                                                    {dayVisits.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}>{dayVisits.length}</span>}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {dayVisits.map(v => (
                                                        <Link key={v.id} to={`/visits/${v.id}`} className="block p-1.5 rounded text-left transition hover:-translate-y-0.5"
                                                            style={{
                                                                background: v.status === 'Realizada' ? 'rgba(20,83,45,0.5)' : v.status === 'Cancelada' ? 'rgba(69,10,10,0.5)' : 'rgba(30,58,95,0.5)',
                                                                border: `1px solid ${v.status === 'Realizada' ? '#166534' : v.status === 'Cancelada' ? '#7f1d1d' : '#1e3a8a'}`
                                                            }}>
                                                            <div className="text-[9px] font-mono font-bold" style={{ color: v.status === 'Realizada' ? '#4ade80' : v.status === 'Cancelada' ? '#f87171' : '#60a5fa' }}>{v.start_time?.substring(0, 5)} hs</div>
                                                            <div className="text-[10px] font-bold text-white truncate">{v.client_name}</div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
