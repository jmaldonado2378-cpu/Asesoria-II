import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Save, Calendar, Clock, Briefcase, Users, Activity,
    FileText, Tag, Loader2, CheckCircle, XCircle, Trash2, MapPin, DollarSign
} from 'lucide-react';

export default function VisitDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/visits/${id}/`)
            .then(r => r.json())
            .then(d => {
                setFormData(d);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visits/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert('Visita actualizada correctamente');
                navigate('/visits');
            } else {
                const errData = await res.json();
                alert('Error al actualizar: ' + JSON.stringify(errData));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAsRealizada = async () => {
        if (!formData.description) return alert('Debe completar el reporte de visita (bitácora) antes de finalizar.');

        setSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visits/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Realizada', description: formData.description })
            });
            if (res.ok) {
                alert('Visita finalizada con éxito.');
                navigate('/visits');
            }
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Confirmar eliminación definitiva de este registro de agenda?')) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/visits/${id}/`, { method: 'DELETE' });
                if (res.ok) navigate('/visits');
            } catch (e) { console.error(e); }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center font-mono text-[10px] uppercase text-slate-400 tracking-widest">
            <Loader2 className="animate-spin mr-2 text-orange-600" size={18} /> Recuperando Ficha de Visita #{id}...
        </div>
    );

    const isRealizada = formData.status === 'Realizada';
    const isCancelada = formData.status === 'Cancelada';

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/visits" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Agenda
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> Gestión de Intervenciones v2.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* Industrial Header */}
                    <div className={`p-10 text-white relative overflow-hidden transition-colors ${isRealizada ? 'bg-green-900' : isCancelada ? 'bg-slate-700' : 'bg-slate-900'
                        }`}>
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${isRealizada ? 'bg-green-500' : 'bg-orange-600'}`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border border-white/20 flex items-center gap-2 ${isRealizada ? 'bg-green-600/20' : 'bg-white/10'
                                    }`}>
                                    {isRealizada ? <CheckCircle size={10} /> : (isCancelada ? <XCircle size={10} /> : <Clock size={10} />)}
                                    Visita {formData.status}
                                </span>
                                <span className="text-white/40 text-[9px] font-mono uppercase tracking-widest">ID: LOG-{id}</span>
                            </div>
                            <h1 className="text-4xl font-serif font-black uppercase tracking-tighter leading-none mb-2">{formData.client_name}</h1>
                            <div className="flex flex-wrap items-center gap-6 mt-6">
                                <div className="flex items-center gap-2 text-orange-400 font-mono text-xs font-bold uppercase tracking-widest">
                                    <Calendar size={14} /> {formData.date}
                                </div>
                                <div className="flex items-center gap-2 text-white/60 font-mono text-xs font-bold uppercase tracking-widest">
                                    <Clock size={14} /> {formData.start_time.substring(0, 5)} - {formData.end_time.substring(0, 5)} hs
                                </div>
                                {formData.project_name && (
                                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-sm border border-white/5 text-[10px] font-bold uppercase tracking-widest text-orange-200">
                                        <Briefcase size={12} /> {formData.project_name}
                                    </div>
                                )}
                            </div>
                        </div>
                        <MapPin size={120} className="text-white/5 absolute -right-10 -bottom-10 pointer-events-none" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* COLUMNA IZQ: DATOS TÉCNICOS */}
                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Tag size={14} className="text-orange-600" /> Clasificación de Visita
                                    </label>
                                    <select
                                        name="visit_type"
                                        disabled={isRealizada}
                                        value={formData.visit_type}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 font-black text-xs uppercase tracking-widest outline-none focus:border-slate-900 transition-all shadow-inner disabled:opacity-60"
                                    >
                                        <option value="Técnica">Técnica (Ensayo/Labs)</option>
                                        <option value="Comercial">Comercial / Relevamiento</option>
                                        <option value="Seguimiento">Seguimiento / Calidad</option>
                                        <option value="Otro">Otro / Administrativo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <FileText size={14} className="text-orange-600" /> Objetivo Principal
                                    </label>
                                    <input
                                        name="objective"
                                        disabled={isRealizada}
                                        value={formData.objective || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 font-bold text-sm outline-none focus:border-orange-600 transition-all shadow-inner disabled:opacity-60"
                                        placeholder="Definir objetivo..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Fecha</label>
                                        <input type="date" name="date" disabled={isRealizada} value={formData.date} onChange={handleChange} className="w-full p-3 border border-slate-100 rounded-sm font-mono text-xs font-bold outline-none focus:border-slate-400 bg-slate-50/50 disabled:opacity-50" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Kilómetros Recorridos</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="kilometers"
                                                disabled={isRealizada}
                                                value={formData.kilometers || 0}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-slate-100 rounded-sm font-mono text-xs font-bold outline-none focus:border-orange-600 bg-slate-50/50 disabled:opacity-50"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase">KM</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Estado</label>
                                    <select name="status" disabled={isRealizada} value={formData.status} onChange={handleChange} className="w-full p-3 border border-slate-100 rounded-sm font-bold text-xs uppercase bg-slate-50/50 outline-none focus:border-slate-400 disabled:opacity-50">
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Realizada">Realizada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            {/* COLUMNA DER: BITÁCORA / REPORTE */}
                            <div className="space-y-8">
                                <div className="bg-slate-50 p-6 border border-slate-200 rounded-sm relative">
                                    <div className="absolute -top-3 left-4 bg-white px-3 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        <Activity size={10} className="text-orange-600" /> Bitácora de Campo
                                    </div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 mt-2">Relato Técnico y Conclusiones de la Intervención</label>
                                    <textarea
                                        name="description"
                                        rows="8"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 border-b border-orange-500/20 rounded-sm outline-none focus:border-orange-600 font-medium text-sm bg-transparent shadow-none resize-none leading-relaxed placeholder:italic placeholder:text-slate-300"
                                        placeholder="Describir aquí lo observado en planta, resultados preliminares, problemas detectados y próximos pasos a seguir..."
                                    />
                                    {isRealizada && (
                                        <div className="mt-4 flex items-center gap-2 text-green-700 font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle size={14} /> Reporte Cerrado y Validado
                                        </div>
                                    )}
                                </div>

                                {/* SECCIÓN ECONÓMICA */}
                                <div className="bg-white p-6 border-l-4 border-indigo-600 shadow-xl space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <DollarSign size={14} className="text-indigo-600" /> Liquidación de la Visita
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Gastos / Viáticos</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    name="expenses"
                                                    value={formData.expenses || 0}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-7 border border-slate-100 bg-slate-50 rounded-sm font-mono text-xs font-bold outline-none focus:border-indigo-600"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter block mb-1">Honorarios / Facturable</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-300 text-xs">$</span>
                                                <input
                                                    type="number"
                                                    name="fees"
                                                    value={formData.fees || 0}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-7 border border-slate-100 bg-slate-50 rounded-sm font-mono text-xs font-bold outline-none focus:border-green-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Margen de Contribución:</span>
                                        <span className={`text-sm ${(parseFloat(formData.fees || 0) - parseFloat(formData.expenses || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            $ {(parseFloat(formData.fees || 0) - parseFloat(formData.expenses || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ACCIONES */}
                        <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="text-[10px] font-black text-slate-300 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 transition active:scale-95"
                            >
                                <Trash2 size={16} /> Depurar Registro
                            </button>
                            <div className="flex gap-4">
                                <Link to="/visits" className="px-8 py-4 bg-white border border-slate-300 text-slate-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                    Cancelar
                                </Link>

                                {!isRealizada && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAsRealizada}
                                        disabled={saving}
                                        className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-8 rounded-sm shadow-xl transition active:scale-95 text-[10px] uppercase tracking-widest"
                                    >
                                        <CheckCircle size={18} /> Finalizar Visita
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-black py-4 px-12 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={20} />}
                                    Actualizar Ficha
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
