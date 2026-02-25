import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Briefcase, CheckCircle, Clock, Truck, Activity, Loader2, ChevronRight, XCircle, List, LayoutGrid, ChevronLeft } from 'lucide-react';

export default function VisitList() {
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list');
    const [currentMonth, setCurrentMonth] = useState(new Date());
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

                {/* CONTROLES: BUSCADOR Y TABS */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="relative w-full max-w-xl group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Filtrar por cliente u objetivo..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-sm shadow-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-slate-200 p-1 rounded-sm border border-slate-300 w-full md:w-auto">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <List size={16} /> Lista
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-sm border border-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <LayoutGrid size={16} /> Calendario
                        </button>
                    </div>
                </div>

                {/* VISTAS */}
                {viewMode === 'list' ? (
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
                ) : (
                    <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                                {monthNames[month]} <span className="text-orange-600">{year}</span>
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={prevMonth} className="p-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-100 rounded-sm transition"><ChevronLeft size={18} className="text-slate-700" /></button>
                                <button onClick={() => setCurrentMonth(new Date())} className="px-4 py-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-100 rounded-sm transition text-xs font-bold uppercase tracking-widest text-slate-700">Hoy</button>
                                <button onClick={nextMonth} className="p-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-100 rounded-sm transition"><ChevronRight size={18} className="text-slate-700" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100">
                            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                                <div key={d} className="p-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-500 border-r last:border-r-0 border-slate-200">{d}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_min-content)]">
                            {days.map((day, idx) => {
                                const dayVisits = getVisitsForDay(day);
                                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();

                                return (
                                    <div key={idx} className={`border-r border-b border-slate-200 p-2 ${!day ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'} transition-colors ${isToday ? 'ring-2 ring-inset ring-orange-500' : ''}`}>
                                        {day && (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-sm ${isToday ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>{day}</span>
                                                    {dayVisits.length > 0 && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm font-black tracking-widest">{dayVisits.length}</span>}
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    {dayVisits.map(v => (
                                                        <Link key={v.id} to={`/visits/${v.id}`} className={`block p-2 rounded-sm border text-left transition hover:-translate-y-0.5 shadow-sm 
                                                        ${v.status === 'Realizada' ? 'bg-green-50 border-green-200 hover:border-green-400' :
                                                                v.status === 'Cancelada' ? 'bg-red-50 border-red-200 hover:border-red-400 opacity-60' :
                                                                    'bg-blue-50 border-blue-200 hover:border-blue-400'}`}
                                                        >
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${v.status === 'Realizada' ? 'bg-green-500' : v.status === 'Cancelada' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                                                <span className="text-[9px] font-mono font-bold text-slate-600 truncate">{v.start_time.substring(0, 5)} hs</span>
                                                            </div>
                                                            <div className="text-[10px] font-black uppercase text-slate-900 leading-tight line-clamp-2 truncate" title={v.client_name}>{v.client_name}</div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
