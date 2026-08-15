import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, Briefcase, Users, Activity, FileText, Tag, Loader2, AlertCircle } from 'lucide-react';
import { createVisit } from '../api/visits';
import { getClients } from '../api/clients';
import { getProjects } from '../api/projects';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import { FormField } from '../components/ui/FormField';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

export default function NewVisit() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const { loading: submitting, error, fieldErrors, execute } = useApiMutation(createVisit);

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
            getClients(),
            getProjects()
        ]).then(([cData, pData]) => {
            setClients(cData);
            setProjects(pData);
            setLoading(false);
        }).catch(() => { showError('Error cargando datos'); setLoading(false); });
    }, [showError]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await execute(formData);
            showSuccess('Visita agendada exitosamente');
            navigate('/visits');
        } catch (e) {
            // handled by useApiMutation
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'project' && value) {
            const selectedProject = projects.find(p => p.id === parseInt(value));
            if (selectedProject) {
                setFormData(prev => ({ ...prev, project: value, client: selectedProject.client }));
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
            Sincronizando base de datos...
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-3xl">

                {/* Back */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/visits" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Agenda
                    </Link>
                    <div className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2"
                        style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Planificador Técnico
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-8 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--accent)' }}>
                            <Calendar size={12} /> Logística de Campo
                        </div>
                        <h1 className="text-2xl font-bold text-white">Agendar Nueva Visita</h1>
                        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                            Planificación de Intervención Técnica / Comercial
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {error && (
                            <div className="p-4 rounded-lg flex items-center gap-3 text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Entidad */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6"
                            style={{ borderBottom: '1px solid var(--border)' }}>
                            <FormField label="Cliente / Empresa" icon={<Users size={14} />} error={fieldErrors?.client}>
                                <select name="client" value={formData.client} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}>
                                    <option value="">Seleccionar Cliente...</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </FormField>
                            <FormField label="Proyecto Asociado (Opcional)" icon={<Briefcase size={14} />} error={fieldErrors?.project}>
                                <select name="project" value={formData.project} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}>
                                    <option value="">Sin Proyecto Específico</option>
                                    {projects
                                        .filter(p => !formData.client || p.client === parseInt(formData.client))
                                        .map(p => <option key={p.id} value={p.id}>{p.name}</option>)
                                    }
                                </select>
                            </FormField>
                        </div>

                        {/* Temporal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField label="Fecha Programada" icon={<Calendar size={14} />} error={fieldErrors?.date}>
                                <input type="date" name="date" value={formData.date} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                                    style={inputStyle} />
                            </FormField>
                            <FormField label="Hora de Inicio" icon={<Clock size={14} />} error={fieldErrors?.start_time}>
                                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                                    style={inputStyle} />
                            </FormField>
                            <FormField label="Hora de Fin" icon={<Clock size={14} />} error={fieldErrors?.end_time}>
                                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                                    style={inputStyle} />
                            </FormField>
                        </div>

                        {/* Detalles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Tipo de Intervención" icon={<Tag size={14} />} error={fieldErrors?.visit_type}>
                                <select name="visit_type" value={formData.visit_type} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}>
                                    <option value="Técnica">Técnica (Ensayo/Labs)</option>
                                    <option value="Comercial">Comercial / Relevamiento</option>
                                    <option value="Seguimiento">Seguimiento / Calidad</option>
                                    <option value="Otro">Otro / Administrativo</option>
                                </select>
                            </FormField>
                            <FormField label="Objetivo de la Visita" icon={<FileText size={14} />} error={fieldErrors?.objective}>
                                <input name="objective" value={formData.objective} onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={inputStyle}
                                    placeholder="Ej: Ajuste de dosificación amilasas..." />
                            </FormField>
                        </div>

                        {/* Notas */}
                        <FormField label="Notas Previas / Preparación" icon={<FileText size={14} />} error={fieldErrors?.description}>
                            <textarea name="description" rows="3"
                                value={formData.description || ''} onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none italic"
                                style={inputStyle}
                                placeholder="Herramientas necesarias, muestras a llevar..." />
                        </FormField>

                        {/* Buttons */}
                        <div className="pt-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/visits" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit" disabled={submitting}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> {submitting ? 'Agendando...' : 'Confirmar Agenda'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
