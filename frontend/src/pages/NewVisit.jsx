import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, Briefcase, Users, Activity, FileText, Tag, Loader2 } from 'lucide-react';

export default function NewVisit() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        client: '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:00',
        visit_type: 'Técnica',
        objective: '',
        status: 'Pendiente'
    });

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/clients/`).then(r => r.json()),
            fetch(`${API_URL}/api/projects/`).then(r => r.json())
        ]).then(([cData, pData]) => {
            setClients(cData);
            setProjects(pData);
            setLoading(false);
        }).catch(e => {
            console.error(e);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.client && !formData.project) return alert('Debe seleccionar un cliente o un proyecto');

        try {
            const res = await fetch(`${API_URL}/api/visits/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                navigate('/visits');
            } else {
                const errData = await res.json();
                alert('Error al agendar: ' + JSON.stringify(errData));
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Si cambia el cliente y hay un proyecto seleccionado, verificar si el proyecto pertenece al cliente
        // O si selecciona un proyecto, auto-seleccionar el cliente
        if (name === 'project' && value) {
            const selectedProject = projects.find(p => p.id === parseInt(value));
            if (selectedProject) {
                setFormData(prev => ({ ...prev, project: value, client: selectedProject.client }));
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-mono text-[10px] uppercase text-slate-400 tracking-widest">
            <Loader2 className="animate-spin mr-2 text-orange-600" size={18} /> Sincronizando Base de Datos de Clientes...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-3xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/visits" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Agenda
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> Planificador Tech-Log v2.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* Header Industrial */}
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                <Calendar size={12} /> Logística de Campo
                            </div>
                            <h1 className="text-3xl font-serif font-bold uppercase tracking-tighter leading-none">Agendar Nueva Visita</h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 px-1 border-l border-slate-700 ml-1">Planificación de Intervención Técnica / Comercial</p>
                        </div>
                        <Users size={100} className="text-slate-800 absolute -right-4 -bottom-4 opacity-30 pointer-events-none" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-8">
                        <div className="space-y-6">
                            {/* SECCIÓN ENTIDAD */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-l-4 border-orange-500/20 pl-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Users size={14} className="text-orange-600" /> Cliente / Empresa
                                    </label>
                                    <select
                                        name="client"
                                        value={formData.client}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-black text-sm outline-none focus:border-orange-600 transition-all shadow-inner"
                                    >
                                        <option value="">Seleccionar Cliente...</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Briefcase size={14} className="text-orange-400" /> Proyecto Asociado (Opcional)
                                    </label>
                                    <select
                                        name="project"
                                        value={formData.project}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-bold text-sm outline-none focus:border-orange-600 transition-all shadow-inner"
                                    >
                                        <option value="">Sin Proyecto Específico</option>
                                        {projects
                                            .filter(p => !formData.client || p.client === parseInt(formData.client))
                                            .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                        }
                                    </select>
                                </div>
                            </div>

                            {/* SECCIÓN TEMPORAL */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-400" /> Fecha Programada
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-mono font-bold text-sm outline-none focus:border-slate-900 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Clock size={14} className="text-slate-400" /> Hora de Inicio
                                    </label>
                                    <input
                                        type="time"
                                        name="start_time"
                                        value={formData.start_time}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-mono font-bold text-sm outline-none focus:border-slate-900 transition-all shadow-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Clock size={14} className="text-slate-400" /> Hora de Fin
                                    </label>
                                    <input
                                        type="time"
                                        name="end_time"
                                        value={formData.end_time}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-mono font-bold text-sm outline-none focus:border-slate-900 transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            {/* SECCIÓN DETALLES */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Tag size={14} className="text-slate-400" /> Tipo de Intervención
                                    </label>
                                    <select
                                        name="visit_type"
                                        value={formData.visit_type}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-black text-[10px] uppercase tracking-widest outline-none focus:border-slate-900 transition-all shadow-sm"
                                    >
                                        <option value="Técnica">Técnica (Ensayo/Labs)</option>
                                        <option value="Comercial">Comercial / Relevamiento</option>
                                        <option value="Seguimiento">Seguimiento / Calidad</option>
                                        <option value="Otro">Otro / Administrativo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText size={14} className="text-orange-600" /> Objetivo de la Visita
                                    </label>
                                    <input
                                        name="objective"
                                        value={formData.objective}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-slate-200 rounded-sm bg-white font-bold text-xs outline-none focus:border-orange-600 transition-all shadow-sm"
                                        placeholder="Ej: Ajuste de dosificación amilasas en línea"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <FileText size={14} className="text-slate-400" /> Notas Previas / Preparación
                                </label>
                                <textarea
                                    name="description"
                                    rows="3"
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    className="w-full p-4 border border-slate-200 rounded-sm outline-none focus:border-slate-900 font-medium text-sm bg-slate-50 shadow-inner resize-none italic"
                                    placeholder="Especificar herramientas necesarias, muestras a llevar o dudas técnicas a resolver..."
                                />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                            <Link to="/visits" className="px-8 py-3 bg-white border border-slate-300 text-slate-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-orange-600 text-white font-black py-3 px-10 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-widest"
                            >
                                <Save size={18} /> Confirmar Agenda
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
