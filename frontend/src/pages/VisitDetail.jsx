import { useState, useEffect } from 'react';
import { API_URL } from '../config';
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
        fetch(`${API_URL}/api/visits/${id}/`)
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
            const res = await fetch(`${API_URL}/api/visits/${id}/`, {
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
            const res = await fetch(`${API_URL}/api/visits/${id}/`, {
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
                const res = await fetch(`${API_URL}/api/visits/${id}/`, { method: 'DELETE' });
                if (res.ok) navigate('/visits');
            } catch (e) { console.error(e); }
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin mr-3" size={18} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono uppercase tracking-widest">Cargando Visita #{id}...</span>
        </div>
    );

    const isRealizada = formData.status === 'Realizada';
    const isCancelada = formData.status === 'Cancelada';

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/visits" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={15} /> Volver a Agenda
                    </Link>
                    <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Gestión de Visitas
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
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
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                        <Tag size={14} className="text-orange-400" /> Clasificación de Visita
                                    </label>
                                    <select
                                        name="visit_type"
                                        disabled={isRealizada}
                                        value={formData.visit_type}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-sm font-black text-xs uppercase tracking-widest outline-none transition-all disabled:opacity-60"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                    >
                                        <option value="Técnica">Técnica (Ensayo/Labs)</option>
                                        <option value="Comercial">Comercial / Relevamiento</option>
                                        <option value="Seguimiento">Seguimiento / Calidad</option>
                                        <option value="Otro">Otro / Administrativo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                        <FileText size={14} className="text-orange-400" /> Objetivo Principal
                                    </label>
                                    <input
                                        name="objective"
                                        disabled={isRealizada}
                                        value={formData.objective || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 rounded-sm font-bold text-sm outline-none transition-all disabled:opacity-60"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                        placeholder="Definir objetivo..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-2)' }}>Fecha</label>
                                        <input type="date" name="date" disabled={isRealizada} value={formData.date} onChange={handleChange} className="w-full p-3 rounded-sm font-mono text-xs font-bold outline-none disabled:opacity-50" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-2)' }}>Kilómetros Recorridos</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="kilometers"
                                                disabled={isRealizada}
                                                value={formData.kilometers || 0}
                                                onChange={handleChange}
                                                className="w-full p-3 rounded-sm font-mono text-xs font-bold outline-none disabled:opacity-50"
                                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black uppercase" style={{ color: 'var(--text-2)' }}>KM</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-2)' }}>Estado</label>
                                    <select name="status" disabled={isRealizada} value={formData.status} onChange={handleChange} className="w-full p-3 rounded-sm font-bold text-xs uppercase outline-none disabled:opacity-50" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Realizada">Realizada</option>
                                        <option value="Cancelada">Cancelada</option>
                                    </select>
                                </div>
                            </div>

                            {/* COLUMNA DER: BITÁCORA / REPORTE */}
                            <div className="space-y-8">
                                <div className="p-6 rounded-sm relative" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                    <div className="absolute -top-3 left-4 px-3 border text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)', color: 'var(--text-2)' }}>
                                        <Activity size={10} className="text-orange-400" /> Bitácora de Campo
                                    </div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest mb-4 mt-2" style={{ color: 'var(--text-2)' }}>Relato Técnico y Conclusiones de la Intervención</label>
                                    <textarea
                                        name="description"
                                        rows="8"
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 border-b border-orange-500/20 rounded-sm outline-none focus:border-orange-500 font-medium text-sm bg-transparent shadow-none resize-none leading-relaxed placeholder:italic"
                                        style={{ color: 'var(--text-1)' }}
                                        placeholder="Describir aquí lo observado en planta, resultados preliminares, problemas detectados y próximos pasos a seguir..."
                                    />
                                    {isRealizada && (
                                        <div className="mt-4 flex items-center gap-2 text-green-400 font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle size={14} /> Reporte Cerrado y Validado
                                        </div>
                                    )}
                                </div>

                                {/* SECCIÓN ECONÓMICA */}
                                <div className="p-6 border-l-4 border-indigo-500 space-y-6" style={{ background: 'var(--bg-main)' }}>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                                        <DollarSign size={14} className="text-indigo-400" /> Liquidación de la Visita
                                    </h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-tighter block mb-1" style={{ color: 'var(--text-2)' }}>Gastos / Viáticos</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs" style={{ color: 'var(--text-2)' }}>$</span>
                                                <input
                                                    type="number"
                                                    name="expenses"
                                                    value={formData.expenses || 0}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-7 rounded-sm font-mono text-xs font-bold outline-none"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-tighter block mb-1" style={{ color: 'var(--text-2)' }}>Honorarios / Facturable</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs" style={{ color: 'var(--text-2)' }}>$</span>
                                                <input
                                                    type="number"
                                                    name="fees"
                                                    value={formData.fees || 0}
                                                    onChange={handleChange}
                                                    className="w-full p-3 pl-7 rounded-sm font-mono text-xs font-bold outline-none"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest" style={{ borderTop: '1px solid var(--border)' }}>
                                        <span style={{ color: 'var(--text-2)' }}>Margen de Contribución:</span>
                                        <span className={`text-sm ${(parseFloat(formData.fees || 0) - parseFloat(formData.expenses || 0)) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            $ {(parseFloat(formData.fees || 0) - parseFloat(formData.expenses || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
                            <button type="button" onClick={handleDelete}
                                className="flex items-center gap-2 text-xs font-bold transition hover:text-red-400"
                                style={{ color: 'var(--text-2)' }}>
                                <Trash2 size={14} /> Eliminar Registro
                            </button>
                            <div className="flex gap-2">
                                <Link to="/visits"
                                    className="px-4 py-2.5 rounded-lg text-sm font-bold transition"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>Cancelar</Link>
                                {!isRealizada && (
                                    <button type="button" onClick={handleMarkAsRealizada} disabled={saving}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                                        style={{ background: 'rgba(34,197,94,0.15)', color: 'var(--accent)', border: '1px solid rgba(34,197,94,0.3)' }}>
                                        <CheckCircle size={15} /> Finalizar Visita
                                    </button>
                                )}
                                <button type="submit" disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                    style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                    {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
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
