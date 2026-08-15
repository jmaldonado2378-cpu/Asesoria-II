import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, Calendar, FileText, Briefcase, Settings, Activity, Loader2 } from 'lucide-react';

import { updateProject, getProject } from '../api/projects';
import { getClients } from '../api/clients';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import { FormField } from '../components/ui/FormField';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

export default function EditProject() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    
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

    const mutation = useApiMutation((data) => updateProject(id, data));

    useEffect(() => {
        setLoading(true);
        Promise.all([
            getClients(),
            getProject(id)
        ])
        .then(([clientsData, projectData]) => {
            setClients(clientsData);
            setFormData({
                client: projectData.client || '',
                name: projectData.name || '',
                project_type: projectData.project_type || 'Desarrollo',
                status: projectData.status || 'En Curso',
                frequency: projectData.frequency || 'Mensual',
                start_date: projectData.start_date || new Date().toISOString().split('T')[0],
                objective: projectData.objective || ''
            });
            setLoading(false);
        })
        .catch(err => {
            console.error('Error cargando datos del proyecto:', err);
            showError('Error al cargar la información.');
            setLoading(false);
            navigate('/projects');
        });
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await mutation.execute(formData);
            showSuccess('Proyecto actualizado con éxito');
            navigate(`/projects/${id}`);
        } catch (error) {
            // Handled by mutation
        }
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
            Recuperando configuración técnica del proyecto...
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">

                {/* Back */}
                <div className="mb-8 flex justify-between items-center">
                    <Link to={`/projects/${id}`} className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Volver al Detalle
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
                        style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Módulo de Planificación
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-8 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--accent)' }}>
                            <Settings size={12} /> Editar Proyecto Técnico
                        </div>
                        <h1 className="text-2xl font-bold text-white">Editar Registro de Proyecto</h1>
                        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                            ID Proyecto: #{id} | Gestión Industrial Molinera
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {mutation.error && (
                            <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200 text-sm">
                                {mutation.error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Columna izquierda */}
                            <div className="space-y-6">
                                <FormField label="Entidad Cliente" icon={<Building size={14} />} error={mutation.fieldErrors.client}>
                                    <select name="client" value={formData.client} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                        style={inputStyle}>
                                        <option value="">— Seleccionar Cliente —</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Identificador del Proyecto" icon={<Briefcase size={14} />} error={mutation.fieldErrors.name}>
                                    <input type="text" name="name"
                                        placeholder="Ej: Desarrollo Panettone 2026 Premium"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all placeholder:text-slate-600"
                                        style={inputStyle} />
                                </FormField>
                            </div>

                            {/* Columna derecha */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Categoría" icon={null} error={mutation.fieldErrors.project_type}>
                                        <select name="project_type" value={formData.project_type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>Desarrollo</option>
                                            <option>Consulta</option>
                                            <option>Seguimiento</option>
                                            <option>Optimización</option>
                                            <option>Capacitación</option>
                                            <option>Control</option>
                                            <option>Reclamo</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Frecuencia" icon={null} error={mutation.fieldErrors.frequency}>
                                        <select name="frequency" value={formData.frequency}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>Mensual</option>
                                            <option>Semanal</option>
                                            <option>Quincenal</option>
                                            <option>Única</option>
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Estado" icon={null} error={mutation.fieldErrors.status}>
                                        <select name="status" value={formData.status} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>En Curso</option>
                                            <option>Pendiente</option>
                                            <option>Terminado</option>
                                            <option>Finalizado</option>
                                            <option>Cancelado</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Fecha Inicio" icon={<Calendar size={14} />} error={mutation.fieldErrors.start_date}>
                                        <input type="date" name="start_date" value={formData.start_date}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none"
                                            style={inputStyle} />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Objetivo */}
                        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <FormField label="Objetivo Técnico y Alcance" icon={<FileText size={14} />} error={mutation.fieldErrors.objective}>
                                <textarea name="objective" rows="4"
                                    placeholder="Describa el objetivo técnico del proyecto..."
                                    value={formData.objective || ''}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none italic placeholder:text-slate-600"
                                    style={inputStyle} />
                            </FormField>
                        </div>

                        {/* Buttons */}
                        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to={`/projects/${id}`} className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit" disabled={mutation.loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                {mutation.loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {mutation.loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
