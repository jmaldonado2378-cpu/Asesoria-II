import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Building, FolderKanban, Calendar, ChefHat, Loader2 } from 'lucide-react';

import { createEssay } from '../api/essays';
import { getClients } from '../api/clients';
import { getProjects } from '../api/projects';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import { FormField } from '../components/ui/FormField';

/* ── Design System helpers ── */
const input = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

import { FileSpreadsheet } from 'lucide-react';
import GoogleSheetsImporter from '../components/ui/GoogleSheetsImporter';

export default function NewEssay() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showSuccess, showError } = useToast();
    const [showImporter, setShowImporter] = useState(false);

    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    const [selectedClient, setSelectedClient] = useState(location.state?.preselectedClient || '');
    const [formData, setFormData] = useState({
        project: location.state?.preselectedProject || '',
        date: new Date().toISOString().split('T')[0],
        baking_type: 'Fermentado',
        description: '',
        conclusion: ''
    });

    const mutation = useApiMutation(createEssay);

    useEffect(() => {
        Promise.all([
            getClients(),
            getProjects()
        ]).then(([clientsData, projectsData]) => {
            setClients(clientsData);
            setProjects(projectsData);
            setLoading(false);
        }).catch(() => {
            showError('Error cargando datos iniciales');
            setLoading(false);
        });
    }, []);

    const filteredProjects = selectedClient
        ? projects.filter(p => p.client === parseInt(selectedClient))
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const newEssay = await mutation.execute(formData);
            showSuccess('Ensayo creado exitosamente');
            navigate(`/essays/${newEssay.id}`);
        } catch (error) {
            // handled by mutation
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
            style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={18} style={{ color: 'var(--accent)' }} />
            Cargando formulario...
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <GoogleSheetsImporter isOpen={showImporter} onClose={() => setShowImporter(false)} preselectedProject={formData.project} />

            <div className="w-full max-w-2xl">

                {/* Back link */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/essays" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Cancelar y Volver
                    </Link>
                    <button
                        type="button"
                        onClick={() => setShowImporter(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition border"
                        style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--accent)' }}
                    >
                        <FileSpreadsheet size={16} /> Importar desde Google Sheets
                    </button>
                </div>

                {/* Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-8 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        {/* Accent top bar */}
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <h1 className="text-2xl font-bold text-white">Apertura de Ensayo</h1>
                        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                            Laboratorio Molinero I+D · Protocolo de Inicio
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {mutation.error && (
                            <div className="p-4 rounded-lg bg-red-900/30 border border-red-800 text-red-200 text-sm">
                                {mutation.error}
                            </div>
                        )}

                        {/* Cliente */}
                        <FormField label="Cliente" icon={<Building size={14} />}>
                            <select value={selectedClient}
                                onChange={(e) => { setSelectedClient(e.target.value); setFormData({ ...formData, project: '' }); }}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                style={input}>
                                <option value="">— Seleccione un Cliente —</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </FormField>

                        {/* Proyecto */}
                        <FormField label="Proyecto Asociado" icon={<FolderKanban size={14} />} error={mutation.fieldErrors.project}>
                            <select disabled={!selectedClient}
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all disabled:opacity-40"
                                style={input}>
                                <option value="">— Seleccione un Proyecto —</option>
                                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {!selectedClient && (
                                <p className="text-xs mt-1.5" style={{ color: '#fb923c' }}>
                                    * Seleccione primero un cliente.
                                </p>
                            )}
                        </FormField>

                        {/* Fecha + Tipo */}
                        <div className="grid grid-cols-2 gap-6">
                            <FormField label="Fecha de Ensayo" icon={<Calendar size={14} />} error={mutation.fieldErrors.date}>
                                <input type="date" value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                                    style={input} />
                            </FormField>
                            <FormField label="Tipo de Proceso" icon={<ChefHat size={14} />} error={mutation.fieldErrors.baking_type}>
                                <select value={formData.baking_type}
                                    onChange={(e) => setFormData({ ...formData, baking_type: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                                    style={input}>
                                    <option value="Fermentado">📦 Panificación</option>
                                    <option value="Batido">🧁 Pastelería</option>
                                </select>
                            </FormField>
                        </div>

                        {/* Submit */}
                        <div className="pt-6 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/essays" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit" disabled={mutation.loading}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                {mutation.loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {mutation.loading ? 'Iniciando...' : 'Iniciar Protocolo'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
