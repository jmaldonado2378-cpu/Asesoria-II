import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, Calendar, FileText, Briefcase, Settings, Activity, Loader2 } from 'lucide-react';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

function FormField({ label, icon, children }) {
    return (
        <div>
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-2)' }}>
                {icon} {label}
            </label>
            {children}
        </div>
    );
}

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
            .then(d => { setClients(d); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
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
        <div className="min-h-screen flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
            Inicializando configuración técnica...
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">

                {/* Back */}
                <div className="mb-8 flex justify-between items-center">
                    <Link to="/projects" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Volver al Portafolio
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
                            <Settings size={12} /> Alta de Proyecto Técnico
                        </div>
                        <h1 className="text-2xl font-bold text-white">Nuevo Registro de Proyecto</h1>
                        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                            Apertura de Gestión Industrial Molinera
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Columna izquierda */}
                            <div className="space-y-6">
                                <FormField label="Entidad Cliente" icon={<Building size={14} />}>
                                    <select name="client" value={formData.client} onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                        style={inputStyle}>
                                        <option value="">— Seleccionar Cliente —</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Identificador del Proyecto" icon={<Briefcase size={14} />}>
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
                                    <FormField label="Categoría" icon={null}>
                                        <select name="project_type" value={formData.project_type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>Desarrollo</option>
                                            <option>Consulta</option>
                                            <option>Seguimiento</option>
                                            <option>Optimización</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Frecuencia" icon={null}>
                                        <select name="frequency" value={formData.frequency}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>Mensual</option>
                                            <option>Semanal</option>
                                            <option>Única</option>
                                            <option>Bimensual</option>
                                        </select>
                                    </FormField>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Estado" icon={null}>
                                        <select name="status" value={formData.status} onChange={handleInputChange}
                                            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                                            style={inputStyle}>
                                            <option>En Curso</option>
                                            <option>Pendiente</option>
                                            <option>Suspendido</option>
                                            <option>Finalizado</option>
                                        </select>
                                    </FormField>
                                    <FormField label="Fecha Inicio" icon={<Calendar size={14} />}>
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
                            <FormField label="Objetivo Técnico y Alcance" icon={<FileText size={14} />}>
                                <textarea name="objective" rows="4"
                                    placeholder="Describa el objetivo técnico del proyecto..."
                                    value={formData.objective}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none italic placeholder:text-slate-600"
                                    style={inputStyle} />
                            </FormField>
                        </div>

                        {/* Buttons */}
                        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/projects" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Descartar
                            </Link>
                            <button type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> Inicializar Proyecto
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
