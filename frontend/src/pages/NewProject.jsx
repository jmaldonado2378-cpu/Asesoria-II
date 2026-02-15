import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, Calendar, FileText, Briefcase, Settings, Activity } from 'lucide-react';

export default function NewProject() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        client: '',
        name: '',
        project_type: 'Desarrollo',
        status: 'En Curso',
        frequency: 'Mensual',
        start_date: new Date().toISOString().split('T')[0],
        objective: ''
    });

    useEffect(() => {
        fetch(`${API_URL}/api/clients/`)
            .then(r => r.json())
            .then(d => {
                setClients(d);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.client || !formData.name) return alert('Cliente y Nombre requeridos');

        try {
            const res = await fetch(`${API_URL}/api/projects/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const newP = await res.json();
                navigate(`/projects/${newP.id}`);
            } else {
                const errData = await res.json();
                alert('Error al crear: ' + JSON.stringify(errData));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión con la API');
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    if (loading) return (
        <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center">
            <div className="text-slate-400 font-mono text-xs uppercase tracking-widest animate-pulse">
                Inicializando Configuración Técnica...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-8 flex justify-between items-center">
                    <Link to="/projects" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Portafolio
                    </Link>
                    <div className="flex items-center gap-2 text-indigo-600 text-[10px] font-bold uppercase tracking-[0.3em]">
                        <Activity size={14} /> Módulo de Planificación v2.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* Header Industrial */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                    <Settings size={12} /> Alta de Proyecto Técnico
                                </div>
                                <h1 className="text-4xl font-serif font-bold uppercase tracking-tighter leading-none">Nuevo Registro</h1>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Apertura de Gestión Industrial Molinera</p>
                            </div>
                            <Briefcase size={60} className="text-slate-800 absolute -right-4 -bottom-4" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Building size={14} className="text-indigo-600" /> Entidad Cliente
                                    </label>
                                    <select
                                        name="client"
                                        value={formData.client}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                                    >
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Briefcase size={14} className="text-indigo-600" /> Identificador del Proyecto
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Desarrollo Panettone 2026 Premium"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm outline-none focus:border-indigo-600 font-bold text-sm placeholder:text-slate-300 placeholder:font-normal transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Categoría de Proyecto</label>
                                        <select name="project_type" value={formData.project_type} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-indigo-600">
                                            <option>Desarrollo</option>
                                            <option>Consulta</option>
                                            <option>Seguimiento</option>
                                            <option>Optimización</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Frecuencia Control</label>
                                        <select name="frequency" value={formData.frequency} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-indigo-600">
                                            <option>Mensual</option>
                                            <option>Semanal</option>
                                            <option>Única</option>
                                            <option>Bimensual</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Estado Operativo</label>
                                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2.5 border border-slate-200 rounded-sm bg-slate-50 font-bold text-xs outline-none focus:border-indigo-600">
                                            <option>En Curso</option>
                                            <option>Pendiente</option>
                                            <option>Suspendido</option>
                                            <option>Finalizado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Calendar size={14} className="text-indigo-600" /> Fecha Inicio
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border border-slate-200 rounded-sm outline-none focus:border-indigo-600 font-mono text-xs font-bold"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <FileText size={14} className="text-indigo-600" /> Objetivo Técnico y Alcance
                            </label>
                            <textarea
                                name="objective"
                                rows="4"
                                placeholder="Describa el objetivo técnico del proyecto..."
                                value={formData.objective}
                                onChange={handleInputChange}
                                className="w-full p-4 border border-slate-200 rounded-sm outline-none focus:border-indigo-600 bg-slate-50/30 text-sm font-medium italic transition-all shadow-inner"
                            />
                        </div>

                        <div className="pt-8 flex justify-end gap-4">
                            <Link to="/projects" className="px-8 py-3 bg-white border border-slate-300 text-slate-600 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95 flex items-center">
                                Descartar
                            </Link>
                            <button type="submit" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-sm shadow-xl transition active:scale-95 text-[10px] uppercase tracking-widest">
                                <Save size={16} /> Inicializar Proyecto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
