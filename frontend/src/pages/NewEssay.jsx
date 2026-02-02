import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Building, FolderKanban, Calendar, ChefHat } from 'lucide-react';

export default function NewEssay() {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [projects, setProjects] = useState([]);

    // Form State
    const [selectedClient, setSelectedClient] = useState(location.state?.preselectedClient || '');
    const [formData, setFormData] = useState({
        project: location.state?.preselectedProject || '',
        date: new Date().toISOString().split('T')[0],
        baking_type: 'Fermentado',
        description: '',
        conclusion: ''
    });

    useEffect(() => {
        // Cargar Clientes y Proyectos en paralelo
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/clients/`).then(res => res.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/projects/`).then(res => res.json())
        ]).then(([clientsData, projectsData]) => {
            setClients(clientsData);
            setProjects(projectsData);
            setLoading(false);
        }).catch(err => alert('Error cargando datos iniciales'));
    }, []);

    // Filtrar proyectos según cliente seleccionado
    const filteredProjects = selectedClient
        ? projects.filter(p => p.client === parseInt(selectedClient))
        : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.project) return alert('Debes seleccionar un Proyecto');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ensayos/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Error al crear');

            const newEssay = await res.json();
            // Redirigir a la ficha para empezar a cargar la receta
            navigate(`/essays/${newEssay.id}`);

        } catch (error) {
            alert('Error creando el ensayo. Verifica los datos.');
        }
    };

    if (loading) return <div className="p-10 text-center font-mono text-sm">Cargando formulario...</div>;

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <div className="mb-6">
                    <Link to="/essays" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium transition">
                        <ArrowLeft size={18} /> Cancelar y Volver
                    </Link>
                </div>

                <div className="bg-white shadow-xl rounded-sm overflow-hidden border border-slate-300">
                    <div className="bg-slate-900 p-8 text-white relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
                        <h1 className="text-3xl font-serif font-bold uppercase tracking-tighter">Apertura de Ensayo</h1>
                        <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-mono font-bold">Laboratorio Molinero I+D / Protocolo de Inicio</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* SELECCIÓN DE CLIENTE */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <Building size={14} /> Cliente
                            </label>
                            <select
                                value={selectedClient}
                                onChange={(e) => { setSelectedClient(e.target.value); setFormData({ ...formData, project: '' }); }}
                                className="w-full p-4 border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition uppercase text-xs font-bold tracking-tight shadow-inner"
                            >
                                <option value="">-- Seleccione un Cliente --</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        {/* SELECCIÓN DE PROYECTO */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                <FolderKanban size={14} /> Proyecto Asociado
                            </label>
                            <select
                                disabled={!selectedClient}
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                                className="w-full p-4 border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none transition disabled:opacity-50 uppercase text-xs font-bold tracking-tight shadow-inner"
                            >
                                <option value="">-- Seleccione un Proyecto --</option>
                                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            {!selectedClient && <p className="text-[10px] text-orange-600 mt-2 font-bold uppercase tracking-tighter">* Primero debe seleccionar un cliente.</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* FECHA */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <Calendar size={14} /> Fecha de Ensayo
                                </label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full p-4 border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none font-mono font-bold text-sm shadow-inner"
                                />
                            </div>

                            {/* TIPO DE PROCESO */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                    <ChefHat size={14} /> Tipo de Proceso
                                </label>
                                <select
                                    value={formData.baking_type}
                                    onChange={(e) => setFormData({ ...formData, baking_type: e.target.value })}
                                    className="w-full p-4 border border-slate-300 rounded-sm bg-slate-50 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm shadow-inner"
                                >
                                    <option value="Fermentado">📦 PANIFICACIÓN</option>
                                    <option value="Batido">🧁 PASTELERÍA</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-12 rounded shadow-2xl transform active:scale-95 transition text-xs uppercase tracking-widest border border-slate-700"
                            >
                                <Save size={18} className="text-indigo-400" /> Iniciar Protocolo Técnico
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
