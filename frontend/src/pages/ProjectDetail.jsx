import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Pipette, Calculator, Save, FileSpreadsheet, FileText, ChevronRight,
    MessageSquare, Upload, Image as ImageIcon, Calendar, DollarSign,
    Activity, Building, ArrowLeft, Clock, GitCompare, TrendingUp,
    ShoppingBag, PieChart, Plus, Trash2, AlertCircle, CheckSquare, Square, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [essays, setEssays] = useState([]);
    const [visits, setVisits] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [activeTab, setActiveTab] = useState('ensayos');
    const [observations, setObservations] = useState('');
    const [reports, setReports] = useState([]);
    const [showReportForm, setShowReportForm] = useState(false);
    const [reportParams, setReportParams] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        conclusions: ""
    });
    const [savingObs, setSavingObs] = useState(false);

    // Phase 2: Complaints enhancements
    const [showComplaintForm, setShowComplaintForm] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState(null);
    const [complaintForm, setComplaintForm] = useState({
        loading_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        batch: '',
        flour_type: '',
        contact: '',
        product_made: '',
        process_type: '',
        description: '',
        status: 'Abierto',
        technical_conclusion: '',
        corrective_action: ''
    });

    // Estado para Gastos de Materiales (Simulado en localStorage por simplicidad)
    const [materialExpenses, setMaterialExpenses] = useState([]);
    const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

    // Finanzas Calculadas
    const [financials, setFinancials] = useState({
        revenue: 0,
        visitExpenses: 0,
        materialExpensesTotal: 0,
        recipeTheoreticalCost: 0,
        realMargin: 0
    });

    useEffect(() => {
        Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/ensayos/`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/visits/`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/technical-reports/?project=${id}`).then(r => r.json()),
            fetch(`${import.meta.env.VITE_API_URL}/api/complaints/?project=${id}`).then(r => r.json())
        ]).then(([projData, essaysData, visitsData, reportsData, complaintsData]) => {
            if (!projData || projData.detail) {
                console.error("Project not found or API error", projData);
                setProject(null);
                setLoading(false);
                return;
            }

            setProject(projData);
            setObservations(projData.technical_observations || '');
            setReportParams(prev => ({ ...prev, conclusions: projData.technical_observations || '' }));

            // Filtros con seguridad
            const pEssays = Array.isArray(essaysData) ? essaysData.filter(e => e.project === parseInt(id)) : [];
            const pVisits = Array.isArray(visitsData) ? visitsData.filter(v => v.project === parseInt(id)) : [];

            setEssays(pEssays);
            setVisits(pVisits);
            setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
            setReports(Array.isArray(reportsData) ? reportsData : []);

            // Cargar gastos materiales guardados localmente
            try {
                const savedExpenses = JSON.parse(localStorage.getItem(`proj_expenses_${id}`)) || [];
                setMaterialExpenses(savedExpenses);
                calculateFinancials(pEssays, pVisits, savedExpenses);
            } catch (e) {
                console.error("Error parsing local expenses", e);
                setMaterialExpenses([]);
                calculateFinancials(pEssays, pVisits, []);
            }

            setLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setLoading(false);
        });
    }, [id]);

    const calculateFinancials = (pEssays, pVisits, pMatExpenses) => {
        // 1. Ingresos (Honorarios Visitas) -> Corregido a 'fees'
        const revenue = pVisits.reduce((acc, v) => acc + parseFloat(v.fees || 0), 0);

        // 2. Egresos Reales (Viáticos) -> Corregido a 'expenses'
        const visitExp = pVisits.reduce((acc, v) => acc + parseFloat(v.expenses || 0), 0);

        // 3. Egresos Materiales (Lista Manual)
        const matExp = pMatExpenses.reduce((acc, m) => acc + parseFloat(m.amount || 0), 0);

        // 4. Costo Teórico Recetas (Informativo)
        const recipeCost = pEssays.reduce((acc, curr) => acc + parseFloat(curr.total_cost || 0), 0);

        setFinancials({
            revenue: revenue,
            visitExpenses: visitExp,
            materialExpensesTotal: matExp,
            recipeTheoreticalCost: recipeCost,
            realMargin: revenue - (visitExp + matExp)
        });
    };

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!newExpense.description || !newExpense.amount) return;

        const updatedExpenses = [...materialExpenses, { id: Date.now(), description: newExpense.description, amount: parseFloat(newExpense.amount), date: new Date().toISOString() }];
        setMaterialExpenses(updatedExpenses);
        localStorage.setItem(`proj_expenses_${id}`, JSON.stringify(updatedExpenses));

        // Recalcular
        calculateFinancials(essays, visits, updatedExpenses);
        setNewExpense({ description: '', amount: '' });
    };

    const handleDeleteExpense = (expId) => {
        const updated = materialExpenses.filter(e => e.id !== expId);
        setMaterialExpenses(updated);
        localStorage.setItem(`proj_expenses_${id}`, JSON.stringify(updated));
        calculateFinancials(essays, visits, updated);
    };

    const toggleSelection = (eid) => setSelectedIds(prev => prev.includes(eid) ? prev.filter(i => i !== eid) : [...prev, eid]);
    const handleCompare = () => selectedIds.length >= 2 && navigate(`/essays/compare?ids=${selectedIds.join(',')}`);

    const handleImportComplaints = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', id);

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/import-complaints/`, {
                method: 'POST',
                body: formData
            });
            if (resp.ok) {
                const result = await resp.json();
                alert(result.message);
                // Recargar reclamos
                const freshReclamos = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(freshReclamos);
            } else {
                alert('Error al importar Excel.');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión.');
        }
    };

    const [uploadingComplaintId, setUploadingComplaintId] = useState(null);

    const handleUploadComplaintImage = async (complaintId, file) => {
        if (!file) return;
        setUploadingComplaintId(complaintId);
        const formData = new FormData();
        formData.append('complaint', complaintId);
        formData.append('image', file);

        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/complaint-images/`, {
                method: 'POST',
                body: formData
            });
            if (resp.ok) {
                // Recargar reclamos para ver la imagen
                const freshReclamos = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(freshReclamos);
            } else {
                alert('Error al subir imagen.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingComplaintId(null);
        }
    };

    const handleDeleteComplaintImage = async (imageId) => {
        if (!confirm('¿Eliminar esta fotografía?')) return;
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/complaint-images/${imageId}/`, {
                method: 'DELETE'
            });
            if (resp.ok) {
                const freshReclamos = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(freshReclamos);
            }
        } catch (err) { console.error(err); }
    };

    const handleDownloadTemplate = async () => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints-template/?project=${id}`);
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = "Plantilla_Reclamos_Tecnicos.xlsx";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveComplaint = async (e) => {
        e.preventDefault();
        const method = editingComplaint ? 'PATCH' : 'POST';
        const url = editingComplaint
            ? `${import.meta.env.VITE_API_URL}/api/complaints/${editingComplaint.id}/`
            : `${import.meta.env.VITE_API_URL}/api/complaints/`;

        const payload = { ...complaintForm, project: id };

        try {
            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (resp.ok) {
                setShowComplaintForm(false);
                setEditingComplaint(null);
                // Refresh
                const fresh = await fetch(`${import.meta.env.VITE_API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(fresh);
            } else {
                alert('Error al guardar el reclamo.');
            }
        } catch (err) { console.error(err); }
    };

    const openEditComplaint = (c) => {
        setEditingComplaint(c);
        setComplaintForm({
            loading_date: c.loading_date,
            delivery_date: c.delivery_date || '',
            batch: c.batch || '',
            flour_type: c.flour_type || '',
            product_made: c.product_made || '',
            process_type: c.process_type || '',
            description: c.description || '',
            status: c.status || 'Abierto',
            technical_conclusion: c.technical_conclusion || '',
            corrective_action: c.corrective_action || ''
        });
        setShowComplaintForm(true);
    };

    const openNewComplaint = () => {
        setEditingComplaint(null);
        setComplaintForm({
            loading_date: new Date().toISOString().split('T')[0],
            delivery_date: '',
            batch: '',
            flour_type: '',
            product_made: '',
            process_type: '',
            description: '',
            status: 'Abierto',
            technical_conclusion: '',
            corrective_action: ''
        });
        setShowComplaintForm(true);
    };

    const handleSaveObservations = async () => {
        setSavingObs(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ technical_observations: observations })
            });
            if (response.ok) {
                const updatedProj = await response.json();
                setProject(updatedProj);
                alert('Observaciones guardadas con éxito.');
            } else {
                alert('Error al guardar observaciones.');
            }
        } catch (error) {
            console.error(error);
            alert('Error de conexión.');
        } finally {
            setSavingObs(false);
        }
    };

    const handleGenerateReport = async () => {
        if (!reportParams.startDate || !reportParams.endDate) {
            alert('Por favor seleccione ambas fechas.');
            return;
        }
        setSavingObs(true);
        try {
            await downloadBackendReport({
                project: id,
                start_date: reportParams.startDate,
                end_date: reportParams.endDate,
                technical_observations: reportParams.conclusions,
                save_to_history: true,
                format: 'pdf'
            });
            setShowReportForm(false);
            fetchProject(); // Refrescar historial
        } finally {
            setSavingObs(false);
        }
    };

    const downloadBackendReport = async (reportData, targetFormat = 'excel') => {
        try {
            const resp = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-technical-report/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...reportData, format: targetFormat })
            });
            if (resp.ok) {
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const clientName = project?.client_name?.replace(/\s+/g, '_') || 'Sin_Cliente';
                const projectName = project?.name?.replace(/\s+/g, '_') || 'Sin_Proyecto';
                const extension = targetFormat === 'pdf' ? 'pdf' : 'xlsx';
                a.download = `IT_${clientName}_${projectName}_${reportData.report_date}.${extension}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                let errorMessage = 'Error al descargar el archivo.';
                let trace = '';
                try {
                    const errorData = await resp.json();
                    errorMessage = errorData.error || errorData.detail || JSON.stringify(errorData);
                    trace = errorData.traceback || '';
                } catch (e) {
                    errorMessage = `Servidor respondió con código ${resp.status} (${resp.statusText})`;
                }
                alert(`DETALLE TÉCNICO:\n${errorMessage}\n\nTRACEBACK:\n${trace.substring(0, 500)}...`);
            }
        } catch (err) {
            console.error(err);
            alert(`Error de conexión: ${err.message}`);
        }
    };

    const exportTechnicalExcel = (report) => {
        downloadBackendReport({
            project: report.project,
            start_date: report.start_date,
            end_date: report.end_date,
            report_date: report.report_date,
            technical_observations: report.technical_observations,
            save_to_history: false,
            format: 'excel'
        }, 'excel');
    };

    const exportTechnicalPDF = (report) => {
        downloadBackendReport({
            project: report.project,
            start_date: report.start_date,
            end_date: report.end_date,
            report_date: report.report_date,
            technical_observations: report.technical_observations,
            save_to_history: false,
            format: 'pdf'
        }, 'pdf');
    };

    const handleExportExcel = () => {
        // Obsoleto, pero mantenemos por compatibilidad interna si fuera necesario un dump rápido.
        // El usuario pidió reestructurar hacia TechnicalReport.
        setShowReportForm(true);
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <Clock className="animate-spin mr-3 text-orange-600" size={20} /> Desencriptando Hub de Proyecto...
        </div>
    );
    if (!project) return <div className="p-10 text-center text-red-600 font-bold uppercase tracking-tighter">Proyecto no encontrado</div>;

    return (
        <div className="min-h-screen bg-slate-100 p-8 pl-28 pb-20">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to="/projects" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold uppercase text-[10px] tracking-widest transition-all">
                        <ArrowLeft size={16} /> Volver a Proyectos
                    </Link>
                </div>

                {/* HEADER PROYECTO */}
                <div className="bg-white shadow-2xl border border-slate-300 rounded-sm p-8 mb-8 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="flex items-center gap-6">
                        <div className="bg-slate-900 text-white p-4 rounded-sm shadow-xl">
                            <Building size={32} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-widest mb-1">
                                <Activity size={12} /> Project Hub v4.1 Expert
                            </div>
                            <h1 className="text-4xl font-serif font-black text-slate-900 uppercase tracking-tighter leading-none">{project.name}</h1>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{project.client_name}</div>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase border-2 ${project.status === 'En Curso' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {project.status}
                    </div>
                    <button onClick={() => setShowReportForm(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-sm shadow-xl hover:bg-orange-600 transition font-black text-[10px] uppercase tracking-widest border border-slate-700 ml-4">
                        <FileSpreadsheet size={16} /> Generar Informe Técnico
                    </button>
                </div>

                {/* GENERADOR DE INFORME (MODAL SIMULADO) */}
                {showReportForm && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tighter italic">Configurar Informe Técnico</h2>
                                <button onClick={() => setShowReportForm(false)} className="text-slate-400 hover:text-slate-900 transition"><ArrowLeft size={24} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={reportParams.startDate}
                                        onChange={e => setReportParams({ ...reportParams, startDate: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-sm outline-none focus:border-orange-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={reportParams.endDate}
                                        onChange={e => setReportParams({ ...reportParams, endDate: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-sm outline-none focus:border-orange-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Conclusiones & Observaciones</label>
                                <textarea
                                    value={reportParams.conclusions}
                                    onChange={e => setReportParams({ ...reportParams, conclusions: e.target.value })}
                                    placeholder="Redacte las conclusiones técnicas para este periodo..."
                                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-sm text-sm outline-none focus:border-orange-600"
                                />
                            </div>

                            <button onClick={handleGenerateReport} disabled={savingObs} className="w-full bg-slate-900 text-white py-5 rounded-sm font-black text-sm uppercase tracking-[0.3em] hover:bg-orange-600 transition shadow-2xl disabled:bg-slate-200">
                                {savingObs ? 'Procesando...' : 'Generar y Guardar Informe'}
                            </button>
                        </div>
                    </div>
                )}

                {/* HISTORIAL DE INFORMES */}
                <div className="bg-white shadow-2xl border border-slate-300 rounded-sm p-8 mb-8">
                    <h2 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-6 text-indigo-600">
                        <Clock size={18} /> Historial de Informes Generados
                    </h2>

                    <div className="overflow-hidden border border-slate-100 rounded-sm">
                        <table className="w-full text-left font-mono">
                            <thead className="bg-slate-50 p-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100">
                                <tr>
                                    <th className="p-4">FECHA REPORTE</th>
                                    <th className="p-4">PERIODO</th>
                                    <th className="p-4">OBSERVACIONES</th>
                                    <th className="p-4 text-right">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(!Array.isArray(reports) || reports.length === 0) ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-slate-300 uppercase text-[9px] font-bold tracking-widest italic">No hay informes generados todavía.</td></tr>
                                ) : (
                                    reports.map(rep => (
                                        <tr key={rep.id} className="hover:bg-indigo-50/30 transition-colors group">
                                            <td className="p-4 text-[10px] font-black text-slate-900 uppercase tracking-tighter">{rep.report_date}</td>
                                            <td className="p-4 text-[9px] text-slate-400 font-bold uppercase tracking-widest">{rep.start_date} <ArrowLeft size={10} className="rotate-180 inline mx-1" /> {rep.end_date}</td>
                                            <td className="p-4 text-[9px] font-bold text-slate-500 uppercase truncate max-w-[200px]">{rep.technical_observations}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => exportTechnicalExcel({
                                                            project: id,
                                                            start_date: rep.start_date,
                                                            end_date: rep.end_date,
                                                            technical_observations: rep.technical_observations,
                                                            report_date: rep.report_date,
                                                            save_to_history: false,
                                                            format: 'excel'
                                                        })}
                                                        className="bg-slate-800 text-white px-3 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 transition flex items-center gap-2 shadow-lg"
                                                    >
                                                        <FileSpreadsheet size={12} /> Excel
                                                    </button>
                                                    <button
                                                        onClick={() => exportTechnicalPDF({
                                                            project: id,
                                                            start_date: rep.start_date,
                                                            end_date: rep.end_date,
                                                            technical_observations: rep.technical_observations,
                                                            report_date: rep.report_date,
                                                            save_to_history: false,
                                                            format: 'pdf'
                                                        })}
                                                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 transition flex items-center gap-2 shadow-lg"
                                                    >
                                                        <FileText size={12} /> PDF
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* TABS NAVEGACIÓN */}
                <div className="flex gap-1 mb-8">
                    <TabButton active={activeTab === 'ensayos'} onClick={() => setActiveTab('ensayos')} icon={<Pipette size={16} />} label={`Ensayos Técs. (${essays.length})`} />
                    <TabButton active={activeTab === 'visitas'} onClick={() => setActiveTab('visitas')} icon={<Calendar size={16} />} label={`Agenda / Visitas (${visits.length})`} />
                    <TabButton active={activeTab === 'reclamos'} onClick={() => setActiveTab('reclamos')} icon={<MessageSquare size={16} />} label={`Reclamos (${complaints.length})`} />
                    <TabButton active={activeTab === 'finanzas'} onClick={() => setActiveTab('finanzas')} icon={<DollarSign size={16} />} label="Estado de Resultados" />
                </div>

                {/* CONTENIDO TABS */}
                <div className="transition-all duration-300">
                    {/* --- TAB ENSAYOS --- */}
                    {activeTab === 'ensayos' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-end gap-4">
                                {selectedIds.length >= 2 && (
                                    <button onClick={handleCompare} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-sm shadow-xl hover:bg-indigo-700 transition font-black text-[10px] uppercase tracking-widest border border-indigo-500">
                                        <GitCompare size={16} /> Comparar ({selectedIds.length})
                                    </button>
                                )}
                                <Link to="/essays/new" state={{ preselectedProject: project.id, preselectedClient: project.client }} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-sm shadow-xl hover:bg-orange-600 transition font-black text-[10px] uppercase tracking-widest border border-slate-700">
                                    <Plus size={16} /> Iniciar Protocolo
                                </Link>
                            </div>

                            <div className="bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden">
                                <table className="w-full text-left border-collapse font-mono">
                                    <thead className="bg-slate-900 p-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-800">
                                        <tr>
                                            <th className="p-5 w-16 text-center border-r border-slate-800">SEL.</th>
                                            <th className="p-5">PROTÓCOLO / CÓDIGO</th>
                                            <th className="p-5">DESCRIPCIÓN TÉCNICA</th>
                                            <th className="p-5 text-right">SCORE</th>
                                            <th className="p-5 text-right pr-8">EXPEDIENTE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {essays.length === 0 ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-slate-300 uppercase text-[10px] font-bold tracking-widest italic">Sin registros técnicos vinculados.</td></tr>
                                        ) : (
                                            essays.map(e => (
                                                <tr key={e.id} className="hover:bg-orange-50/50 transition-colors group">
                                                    <td className="p-5 text-center border-r border-slate-100">
                                                        <button onClick={() => toggleSelection(e.id)} className="transition transform active:scale-90">
                                                            {selectedIds.includes(e.id) ? <CheckSquare size={20} className="text-orange-600" /> : <Square size={20} className="text-slate-100" />}
                                                        </button>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-serif font-black text-slate-900 text-lg uppercase tracking-tighter group-hover:text-orange-600 transition-colors">{e.code || `ENS-${e.id}`}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{e.date}</div>
                                                    </td>
                                                    <td className="p-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate max-w-xs">{e.description || 'Sin descripción'}</td>
                                                    <td className="p-5 text-right">
                                                        {e.final_score ? (
                                                            <div className={`text-xl font-black ${parseFloat(e.final_score) >= 8 ? 'text-green-600' : 'text-orange-600'}`}>{parseFloat(e.final_score).toFixed(1)}</div>
                                                        ) : <span className="text-slate-200">--</span>}
                                                    </td>
                                                    <td className="p-5 text-right pr-8">
                                                        <Link to={`/essays/${e.id}`} className="bg-slate-900 text-white p-2 rounded-sm hover:bg-orange-600 transition inline-block shadow-md">
                                                            <Eye size={16} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- TAB VISITAS --- */}
                    {activeTab === 'visitas' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-end mb-6">
                                <Link to="/visits/new" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-sm shadow-xl hover:bg-orange-600 transition font-black text-[10px] uppercase tracking-widest border border-slate-700">
                                    <Plus size={16} /> Agendar Visita Técnica
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {visits.length === 0 ? (
                                    <div className="md:col-span-2 bg-white border-2 border-dashed border-slate-300 p-20 text-center rounded-sm">
                                        <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No hay visitas de campo programadas.</p>
                                    </div>
                                ) : (
                                    visits.map(v => (
                                        <Link key={v.id} to={`/visits/${v.id}`} className="bg-white border border-slate-200 shadow-xl hover:border-orange-600 transition-all p-8 flex justify-between items-center group relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${v.status === 'Realizada' ? 'bg-green-600' : 'bg-orange-500'}`}></div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm text-white ${v.status === 'Realizada' ? 'bg-green-600' : 'bg-slate-900'}`}>{v.status}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{v.visit_type}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-serif font-black text-slate-900 uppercase tracking-tighter group-hover:text-orange-600 transition-colors">{v.objective || 'Visita Técnica'}</div>
                                                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {v.date}</span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {v.start_time?.substring(0, 5)} hs</span>
                                                        {v.kilometers > 0 && <span className="flex items-center gap-1 text-orange-600"><TrendingUp size={12} /> {v.kilometers} KM</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-sm group-hover:bg-slate-900 transition-colors">
                                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Gestionar</span>
                                                <ArrowLeft size={14} className="rotate-180 text-orange-600" />
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* --- TAB RECLAMOS --- */}
                    {activeTab === 'reclamos' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-between items-center bg-white p-6 shadow-xl border border-slate-300 rounded-sm">
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest italic">Gestión de Reclamos Técnicos</h3>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={openNewComplaint} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition shadow-inner">
                                            <Plus size={14} /> Nuevo Reclamo Manual
                                        </button>
                                        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest border border-slate-300 hover:bg-slate-50 transition shadow-sm">
                                            <FileSpreadsheet size={14} /> Descargar Plantilla
                                        </button>
                                    </div>
                                </div>
                                {/* Botón de Update Masivo oculto temporalmente por priorización de carga manual */}
                                <div className="hidden">
                                    <label className="flex items-center gap-2 bg-slate-900/5 text-slate-400 px-6 py-4 rounded-sm hover:bg-orange-600 hover:text-white transition font-black text-[10px] uppercase tracking-widest cursor-pointer border-2 border-dashed border-slate-200">
                                        <Upload size={16} /> Update Masivo (Excel)
                                        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImportComplaints} />
                                    </label>
                                </div>
                            </div>

                            <div className="bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden">
                                <table className="w-full text-left font-mono">
                                    <thead className="bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-800">
                                        <tr>
                                            <th className="p-5">DATOS / FECHA</th>
                                            <th className="p-5">ESTADO / LOTE</th>
                                            <th className="p-5">HARINA / PRODUCTO</th>
                                            <th className="p-5">DESCRIPCIÓN</th>
                                            <th className="p-5 text-right">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {complaints.length === 0 ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-slate-300 uppercase text-[10px] font-bold tracking-widest italic">No se han registrado reclamos técnicos.</td></tr>
                                        ) : (
                                            complaints.map(c => (
                                                <tr key={c.id} className="hover:bg-red-50/30 transition-colors group">
                                                    <td className="p-5">
                                                        <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic">{c.loading_date}</div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase">Ent: {c.delivery_date || '-'}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${c.status === 'Cerrado' ? 'bg-green-100 text-green-700' :
                                                                c.status === 'En Proceso' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {c.status}
                                                            </span>
                                                        </div>
                                                        <div className="text-[9px] font-bold text-slate-900 uppercase tracking-tighter">Lote: {c.batch || 'S/N'}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="text-[10px] font-bold text-orange-600 uppercase mb-0.5">{c.flour_type || '-'}</div>
                                                        <div className="text-[8px] text-slate-400 font-bold uppercase">{c.product_made || '-'}</div>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="text-[9px] font-bold text-slate-500 uppercase max-w-xs">{c.description?.substring(0, 40)}...</div>
                                                        {c.technical_conclusion && (
                                                            <div className="mt-1 text-[8px] px-2 py-1 bg-slate-100 text-slate-600 rounded-sm italic border-l-2 border-indigo-500">
                                                                {c.technical_conclusion.substring(0, 30)}...
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            {uploadingComplaintId === c.id ? (
                                                                <div className="text-[8px] font-black text-orange-600 animate-pulse uppercase tracking-widest px-2">Subiendo...</div>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => openEditComplaint(c)} className="p-2 bg-slate-900 text-white rounded-sm hover:bg-indigo-600 transition shadow-md">
                                                                        <FileText size={14} />
                                                                    </button>
                                                                    <label className="bg-slate-100 p-2 rounded-sm text-slate-400 hover:bg-orange-600 hover:text-white transition cursor-pointer shadow-sm">
                                                                        <ImageIcon size={14} />
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept="image/*"
                                                                            onChange={(e) => handleUploadComplaintImage(c.id, e.target.files[0])}
                                                                        />
                                                                    </label>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                {/* GALERÍA DE MINIATURAS PARA RECLAMO */}
                                                {c.images && c.images.length > 0 && (
                                                    <tr className="bg-white/50">
                                                        <td colSpan="5" className="p-4 pt-1">
                                                            <div className="flex flex-wrap gap-4 border-t border-slate-50 pt-3">
                                                                {c.images.map(img => (
                                                                    <div key={img.id} className="relative group w-24 h-24 bg-slate-100 rounded-sm overflow-hidden border border-slate-200 shadow-sm">
                                                                        <img 
                                                                            src={img.image} 
                                                                            alt="Previsualización" 
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                        />
                                                                        <button 
                                                                            onClick={() => handleDeleteComplaintImage(img.id)}
                                                                            className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700"
                                                                        >
                                                                            <Trash2 size={10} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* --- TAB FINANZAS (EXPERTO) --- */}
                    {activeTab === 'finanzas' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
                            {/* 1. KPIs FINANCIEROS */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <FinanceCard label="Ingresos (Honorarios)" val={financials.revenue} icon={<DollarSign size={14} />} border="border-slate-300" />
                                <FinanceCard label="Viáticos (Egresos)" val={financials.visitExpenses} icon={<TrendingUp size={14} />} border="border-red-400" text="text-red-500" />
                                <FinanceCard label="Materiales (Consultor)" val={financials.materialExpensesTotal} icon={<ShoppingBag size={14} />} border="border-orange-400" text="text-orange-700" />
                                <FinanceCard label="Margen Real Bruto" val={financials.realMargin} icon={<PieChart size={14} />} border="border-orange-600" text={financials.realMargin >= 0 ? "text-green-500" : "text-red-500"} bg="bg-slate-900 text-white shadow-orange-900/20" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* 2. GESTIÓN DE GASTOS DE MATERIALES */}
                                <div className="bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden flex flex-col">
                                    <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center gap-3">
                                        <ShoppingBag size={18} className="text-orange-600" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex-grow">Compras y Gastos Out-of-Pocket</h3>
                                    </div>

                                    {/* Formulario Agregar Gasto */}
                                    <form onSubmit={handleAddExpense} className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Concepto / Descripción</label>
                                                <input
                                                    placeholder="Ej: Muestras Competencia"
                                                    value={newExpense.description}
                                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                                    className="w-full p-3 bg-white border border-slate-200 rounded-sm text-[10px] font-bold uppercase outline-none focus:border-indigo-600"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Monto ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={newExpense.amount}
                                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                    className="w-full p-3 bg-white border border-slate-200 rounded-sm text-[10px] font-mono font-black outline-none focus:border-indigo-600"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-orange-600 transition flex items-center justify-center gap-2">
                                            <Plus size={14} /> Registrar Gasto Real
                                        </button>
                                    </form>

                                    {/* Lista de Gastos */}
                                    <div className="p-0 flex-grow max-h-[400px] overflow-y-auto">
                                        {materialExpenses.length === 0 ? (
                                            <div className="p-20 text-center text-slate-300 uppercase text-[9px] font-bold tracking-widest italic">Archivo de gastos vacío.</div>
                                        ) : (
                                            <table className="w-full font-mono text-xs">
                                                <tbody className="divide-y-2 divide-slate-50">
                                                    {materialExpenses.map(exp => (
                                                        <tr key={exp.id} className="group hover:bg-orange-50/30 transition-colors">
                                                            <td className="p-4 pl-6">
                                                                <div className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{exp.description}</div>
                                                                <div className="text-[8px] text-slate-400 font-bold uppercase">{new Date(exp.date).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="p-4 text-right font-black text-orange-700">$ {parseFloat(exp.amount).toFixed(2)}</td>
                                                            <td className="p-4 w-12 text-center">
                                                                <button onClick={() => handleDeleteExpense(exp.id)} className="text-slate-200 hover:text-red-600 transition p-2">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>

                                {/* 3. COSTOS TEÓRICOS & CALCULADORA */}
                                <div className="space-y-8">
                                    {/* Costo Teórico Informativo */}
                                    <div className="bg-white border-l-8 border-indigo-600 shadow-2xl p-8 rounded-sm relative overflow-hidden group">
                                        <AlertCircle className="absolute top-4 right-4 text-indigo-100 group-hover:text-indigo-600 transition-colors" size={64} />
                                        <div className="space-y-4 relative z-10">
                                            <div>
                                                <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-1">Costo Teórico de Recetas</h4>
                                                <div className="text-[10px] text-slate-400 font-bold uppercase leading-tight max-w-[250px]">
                                                    Suma informativa de ingredientes en ensayos. Usualmente cubierto por el cliente final.
                                                </div>
                                            </div>
                                            <div className="text-4xl font-serif font-black text-slate-900">$ {financials.recipeTheoreticalCost.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    {/* Simulador de Presupuesto */}
                                    <div className="bg-white shadow-2xl border border-slate-300 rounded-sm overflow-hidden">
                                        <div className="p-6 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                                <Calculator size={18} className="text-orange-500" /> Simulador de Cotización Rápida
                                            </h3>
                                        </div>
                                        <div className="p-8 grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Horas Técnicas Est.</label>
                                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xl font-black outline-none focus:border-orange-600" placeholder="0" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Valor Hora ($)</label>
                                                <input type="number" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xl font-black outline-none focus:border-orange-600" defaultValue="5000" />
                                            </div>
                                        </div>
                                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic tracking-tighter">Inversión Recomendada</div>
                                            <div className="text-3xl font-serif font-black text-slate-900">$ 0.00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL RECLAMO (NUEVO/EDITAR) */}
                {showComplaintForm && (
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-4xl rounded-sm shadow-2xl p-10 space-y-8 animate-in slide-in-from-bottom-5 duration-300 overflow-y-auto max-h-[90vh]">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-serif font-black text-slate-900 uppercase tracking-tighter italic">
                                    {editingComplaint ? `Editar Reclamo #${editingComplaint.id}` : 'Registrar Nuevo Reclamo'}
                                </h2>
                                <button onClick={() => setShowComplaintForm(false)} className="text-slate-400 hover:text-slate-900 transition"><ArrowLeft size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveComplaint} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha Carga</label>
                                            <input type="date" value={complaintForm.loading_date} onChange={e => setComplaintForm({ ...complaintForm, loading_date: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs outline-none focus:border-indigo-600" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha Entrega</label>
                                            <input type="date" value={complaintForm.delivery_date} onChange={e => setComplaintForm({ ...complaintForm, delivery_date: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs outline-none focus:border-indigo-600" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lote / Partida</label>
                                            <input value={complaintForm.batch} onChange={e => setComplaintForm({ ...complaintForm, batch: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold uppercase outline-none focus:border-indigo-600" placeholder="Ej: L-450" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status del Caso</label>
                                            <select value={complaintForm.status} onChange={e => setComplaintForm({ ...complaintForm, status: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-black uppercase outline-none focus:border-orange-600">
                                                <option value="Abierto">🔴 Abierto</option>
                                                <option value="En Proceso">🟡 En Proceso</option>
                                                <option value="Cerrado">🟢 Cerrado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contacto (Nombre/Tel)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 border-none p-3 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                            placeholder="Ej: Juan Pérez - 11 5432..."
                                            value={complaintForm.contact}
                                            onChange={(e) => setComplaintForm({ ...complaintForm, contact: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tipo de Harina</label>
                                        <input value={complaintForm.flour_type} onChange={e => setComplaintForm({ ...complaintForm, flour_type: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold uppercase outline-none focus:border-indigo-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Descripción del Problema</label>
                                        <textarea value={complaintForm.description} onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs outline-none focus:border-indigo-600" required />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Producto Elaborado</label>
                                        <input value={complaintForm.product_made} onChange={e => setComplaintForm({ ...complaintForm, product_made: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs font-bold uppercase outline-none focus:border-indigo-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conclusión Técnica</label>
                                        <textarea value={complaintForm.technical_conclusion} onChange={e => setComplaintForm({ ...complaintForm, technical_conclusion: e.target.value })} className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs outline-none border-l-4 border-indigo-600" placeholder="Redacte el dictamen técnico..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Acción Correctiva Sugerida</label>
                                        <textarea value={complaintForm.corrective_action} onChange={e => setComplaintForm({ ...complaintForm, corrective_action: e.target.value })} className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-sm text-xs outline-none focus:border-green-600" />
                                    </div>
                                </div>

                                <div className="md:col-span-2 flex justify-end gap-4 border-t border-slate-100 pt-6">
                                    <button type="button" onClick={() => setShowComplaintForm(false)} className="px-8 py-3 bg-slate-100 text-slate-400 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition">Cancelar</button>
                                    <button type="submit" className="px-12 py-3 bg-slate-900 text-white rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition shadow-xl">
                                        {editingComplaint ? 'Actualizar Registro' : 'Crear Registro Técnico'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-componentes
function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 rounded-t-sm shadow-md ${active
                ? 'bg-white border-orange-600 text-orange-600 translate-y-[-2px]'
                : 'bg-slate-100 border-transparent text-slate-400 hover:bg-slate-50'
                }`}
        >
            {icon} {label}
        </button>
    );
}

function FinanceCard({ label, val, icon, border, text = "", bg = "bg-white" }) {
    return (
        <div className={`${bg} p-6 border-l-4 ${border} shadow-xl rounded-sm group relative overflow-hidden transition-all hover:translate-y-[-4px]`}>
            <div className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2 ${bg.includes('slate-900') ? 'text-slate-500' : ''}`}>
                {icon} {label}
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter ${text}`}>
                $ {parseFloat(val || 0).toLocaleString()}
            </div>
        </div>
    );
}

