import { useState } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '../config';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Loader2, Search, ArrowRight, Building, Calendar, Tag, Activity } from 'lucide-react';

export default function Projects() {
    const { data: projects, isLoading } = useSWR(`${API_URL}/api/projects/`, fetcher);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = (projects || []).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        const map = {
            'En Curso': { bg: 'rgba(30,58,95,0.8)', color: '#60a5fa' },
            'Terminado': { bg: 'rgba(20,83,45,0.8)', color: '#4ade80' },
            'Pendiente': { bg: 'rgba(67,20,7,0.8)', color: '#fb923c' },
            'Cancelado': { bg: 'rgba(51,65,85,0.4)', color: '#94a3b8' },
        };
        return map[status] || { bg: 'rgba(51,65,85,0.4)', color: '#94a3b8' };
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto" style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
            <header className="flex justify-between items-end mb-10 pb-8" style={{ borderBottom: '2px solid var(--border)' }}>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Briefcase size={28} style={{ color: 'var(--accent)' }} /> Proyectos
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Gestión Técnico-Comercial y Seguimiento de Cuentas</p>
                </div>
                <Link
                    to="/projects/new"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition active:scale-95"
                    style={{ background: 'var(--accent)', color: '#0f172a' }}
                >
                    <Plus size={16} /> Nuevo Proyecto
                </Link>
            </header>

            {/* BARRA DE BÚSQUEDA INDUSTRIAL */}
            <div className="mb-8 relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={16} style={{ color: 'var(--text-2)' }} />
                <input
                    type="text"
                    placeholder="Filtrar por cliente o proyecto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                />
            </div>

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                <table className="w-full text-left border-collapse">
                    <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                        <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                            <th className="px-6 py-3">Cliente</th>
                            <th className="px-4 py-3">Proyecto</th>
                            <th className="px-4 py-3 text-center">Estado</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Inicio</th>
                            <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-16 text-center italic text-sm" style={{ color: 'var(--text-2)' }}>No se encontraron proyectos</td>
                            </tr>
                        ) : (
                            filteredProjects.map((project, i) => {
                                const st = getStatusStyle(project.status);
                                return (
                                    <tr key={project.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.3)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                        className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3">
                                            <span className="font-semibold text-white text-sm">{project.client_name}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link to={`/projects/${project.id}`} className="text-sm font-bold flex items-center gap-1 hover:underline"
                                                style={{ color: 'var(--accent)' }}>
                                                {project.name} <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                                style={{ background: st.bg, color: st.color }}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-2)' }}>{project.project_type}</td>
                                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>
                                            {new Date(project.start_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/projects/${project.id}`}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                Ver
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
                <div className="p-4 flex justify-between items-center text-sm" style={{ background: '#0f172a', borderTop: '1px solid var(--border)' }}>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>Sistema activo</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-2)' }}>Total: {filteredProjects.length} proyectos</span>
                </div>
            </div>
        </div>
    );
}
