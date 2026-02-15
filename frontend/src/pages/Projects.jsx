import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Loader2, Search, ArrowRight, Building, Calendar, Tag, Activity } from 'lucide-react';

export default function Projects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/projects/`)
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'En Curso': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Terminado': return 'bg-green-50 text-green-700 border-green-200';
            case 'Pendiente': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Cancelado': return 'bg-slate-50 text-slate-500 border-slate-200';
            default: return 'bg-slate-50 text-slate-600 border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <header className="flex justify-between items-end mb-10 border-b-2 border-slate-200 pb-8">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter leading-none">
                        <Briefcase className="text-indigo-600" size={32} /> Proyectos
                    </h1>
                    <p className="text-slate-500 mt-3 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Gestión Técnico-Comercial y Seguimiento de Cuentas</p>
                </div>
                <Link
                    to="/projects/new"
                    className="bg-slate-900 text-white px-8 py-3.5 rounded-sm shadow-xl hover:bg-slate-800 transition transform active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700"
                >
                    <Plus size={18} /> Iniciar Nuevo Proyecto
                </Link>
            </header>

            {/* BARRA DE BÚSQUEDA INDUSTRIAL */}
            <div className="mb-8 relative max-w-xl group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                    type="text"
                    placeholder="Filtrar por Cliente o Nombre de Proyecto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-sm shadow-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300 placeholder:font-normal"
                />
            </div>

            <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                        <tr>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                <div className="flex items-center gap-2"><Building size={12} /> Cliente</div>
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                <div className="flex items-center gap-2"><Briefcase size={12} /> Proyecto</div>
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100 text-center">Estado</th>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">Tipo</th>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500">
                                <div className="flex items-center gap-2"><Calendar size={12} /> Inicio</div>
                            </th>
                            <th className="p-5 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right pr-6">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredProjects.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-20 text-center text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">No se encontraron proyectos activos</td>
                            </tr>
                        ) : (
                            filteredProjects.map((project) => (
                                <tr key={project.id} className="hover:bg-indigo-50/30 transition-colors group">
                                    <td className="p-4 border-r border-slate-50">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-serif font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{project.client_name}</span>
                                            <span className="text-[9px] font-mono text-slate-400 uppercase">Account: #ID-{project.client}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-r border-slate-50">
                                        <Link to={`/projects/${project.id}`} className="text-sm font-bold text-slate-700 hover:underline flex items-center gap-2">
                                            {project.name}
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all text-indigo-600 -translate-x-2 group-hover:translate-x-0" />
                                        </Link>
                                    </td>
                                    <td className="p-4 border-r border-slate-50 text-center">
                                        <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)} shadow-sm`}>
                                            {project.status}
                                        </span>
                                    </td>
                                    <td className="p-4 border-r border-slate-50">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 italic">
                                            <Tag size={12} className="text-indigo-300" /> {project.project_type}
                                        </div>
                                    </td>
                                    <td className="p-4 border-r border-slate-50 font-mono text-[11px] text-slate-600">
                                        {new Date(project.start_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-right">
                                        <Link
                                            to={`/projects/${project.id}`}
                                            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit ml-auto border border-slate-200 group-hover:border-slate-900 shadow-sm"
                                        >
                                            Expediente <Activity size={12} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity size={14} className="animate-pulse text-indigo-500" /> Terminal: Activa
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Total Registros: {filteredProjects.length}</span>
                </div>
            </div>
        </div>
    );
}
