import { useState, useEffect, Fragment } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Pipette, Calculator, Save, FileSpreadsheet, FileText, ChevronRight,
    MessageSquare, Upload, Image as ImageIcon, Calendar, DollarSign,
    Activity, Building, ArrowLeft, Clock, GitCompare, TrendingUp,
    ShoppingBag, PieChart, Plus, Trash2, AlertCircle, CheckSquare, Square, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_URL } from '../config';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TechnicalReportPDF from '../components/pdf/TechnicalReportPDF';

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
            fetch(`${API_URL}/api/projects/${id}/`).then(r => r.json()),
            fetch(`${API_URL}/api/ensayos/`).then(r => r.json()),
            fetch(`${API_URL}/api/visits/`).then(r => r.json()),
            fetch(`${API_URL}/api/technical-reports/?project=${id}`).then(r => r.json()),
            fetch(`${API_URL}/api/complaints/?project=${id}`).then(r => r.json())
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
            alert("⚠️ Error de conexión: " + err.message);
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
            const resp = await fetch(`${API_URL}/api/import-complaints/`, {
                method: 'POST',
                body: formData
            });
            if (resp.ok) {
                const result = await resp.json();
                alert(result.message);
                // Recargar reclamos
                const freshReclamos = await fetch(`${API_URL}/api/complaints/?project=${id}`).then(r => r.json());
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
            const resp = await fetch(`${API_URL}/api/complaint-images/`, {
                method: 'POST',
                body: formData
            });
            if (resp.ok) {
                // Recargar reclamos para ver la imagen
                const freshReclamos = await fetch(`${API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(freshReclamos);
                // Actualizar el reclamo que se está editando para que el modal se refresque
                const updated = freshReclamos.find(c => c.id === complaintId);
                if (updated) setEditingComplaint(updated);
            } else {
                // Mostrar el error real del servidor para facilitar el diagnóstico
                let errMsg = `Error HTTP ${resp.status}`;
                try {
                    const errData = await resp.json();
                    errMsg = errData.error || errData.detail || JSON.stringify(errData);
                } catch (_) {
                    errMsg = await resp.text().then(t => t.substring(0, 300));
                }
                alert(`Error al subir imagen:\n${errMsg}`);
            }
        } catch (err) {
            console.error(err);
            alert(`Error de red: ${err.message}`);
        } finally {
            setUploadingComplaintId(null);
        }
    };


    const handleDeleteComplaintImage = async (imageId) => {
        if (!confirm('¿Eliminar esta fotografía?')) return;
        try {
            const resp = await fetch(`${API_URL}/api/complaint-images/${imageId}/`, {
                method: 'DELETE'
            });
            if (resp.ok) {
                const freshReclamos = await fetch(`${API_URL}/api/complaints/?project=${id}`).then(r => r.json());
                setComplaints(freshReclamos);
                if (editingComplaint && editingComplaint.id) {
                    const updated = freshReclamos.find(c => c.id === editingComplaint.id);
                    if (updated) setEditingComplaint(updated);
                }
            }
        } catch (err) { console.error(err); }
    };

    const handleDownloadTemplate = async () => {
        try {
            const resp = await fetch(`${API_URL}/api/generar-reporte-reclamo-estandar/?project=${id}`);
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
            ? `${API_URL}/api/complaints/${editingComplaint.id}/`
            : `${API_URL}/api/complaints/`;

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
                const fresh = await fetch(`${API_URL}/api/complaints/?project=${id}`).then(r => r.json());
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
            corrective_action: c.corrective_action || '',
            direct_client: c.direct_client || '',
            contact: c.contact || ''
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
            corrective_action: '',
            direct_client: '',
            contact: ''
        });
        setShowComplaintForm(true);
    };

    const handleSaveObservations = async () => {
        setSavingObs(true);
        try {
            const response = await fetch(`${API_URL}/api/projects/${id}/`, {
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
            const resp = await fetch(`${API_URL}/api/generar-informe-tecnico-estandar/`, {
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
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Clock className="animate-spin mr-3" size={20} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono uppercase tracking-widest">Cargando Proyecto...</span>
        </div>
    );
    if (!project) return <div className="p-10 text-center font-bold text-red-400 uppercase tracking-tighter">Proyecto no encontrado</div>;

    return (
        <div className="min-h-screen p-8 pl-28 pb-20" style={{ background: 'var(--bg-main)' }}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to="/projects" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={15} /> Volver a Proyectos
                    </Link>
                </div>

                {/* HEADER PROYECTO — Fix 6: tema dark neon */}
                <div className="rounded-sm p-7 mb-8 flex justify-between items-center relative overflow-hidden"
                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-5">
                        <div className="p-3 rounded-sm shadow-lg" style={{ background: 'var(--accent)', color: '#0f172a' }}>
                            <Building size={28} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-1"
                                style={{ color: 'var(--accent)' }}>
                                <Activity size={11} /> Project Hub
                            </div>
                            <h1 className="text-3xl font-serif font-black uppercase tracking-tighter leading-none"
                                style={{ color: 'var(--text-1)' }}>{project.name}</h1>
                            <div className="text-[10px] font-bold uppercase tracking-widest mt-1"
                                style={{ color: 'var(--text-2)' }}>{project.client_name}</div>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-sm text-[10px] font-black uppercase border`}
                        style={{
                            borderColor: project.status === 'En Curso' ? 'var(--accent)' : 'var(--border)',
                            color: project.status === 'En Curso' ? 'var(--accent)' : 'var(--text-2)',
                            background: 'transparent'
                        }}>
                        {project.status}
                    </div>
                    <button onClick={() => setShowReportForm(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest transition ml-4"
                        style={{ background: 'var(--accent)', color: '#0f172a', border: 'none' }}>
                        <FileSpreadsheet size={15} /> Generar Informe Técnico
                    </button>
                </div>

                {/* GENERADOR DE INFORME MODAL — Fix 6: tema dark neon */}
                {showReportForm && (
                    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.75)' }}>
                        <div className="w-full max-w-2xl rounded-sm shadow-2xl p-8 space-y-6"
                            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h2 className="text-lg font-serif font-black uppercase tracking-tighter italic"
                                    style={{ color: 'var(--text-1)' }}>Configurar Informe Técnico</h2>
                                <button onClick={() => setShowReportForm(false)}
                                    style={{ color: 'var(--text-2)' }}><ArrowLeft size={22} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em]"
                                        style={{ color: 'var(--text-2)' }}>Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={reportParams.startDate}
                                        onChange={e => setReportParams({ ...reportParams, startDate: e.target.value })}
                                        className="w-full p-3 rounded-sm font-mono text-sm outline-none"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em]"
                                        style={{ color: 'var(--text-2)' }}>Fecha Fin</label>
                                    <input
                                        type="date"
                                        value={reportParams.endDate}
                                        onChange={e => setReportParams({ ...reportParams, endDate: e.target.value })}
                                        className="w-full p-3 rounded-sm font-mono text-sm outline-none"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em]"
                                    style={{ color: 'var(--text-2)' }}>Conclusiones &amp; Observaciones</label>
                                <textarea
                                    value={reportParams.conclusions}
                                    onChange={e => setReportParams({ ...reportParams, conclusions: e.target.value })}
                                    placeholder="Redacte las conclusiones técnicas para este periodo..."
                                    className="w-full h-36 p-3 rounded-sm text-sm outline-none"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                />
                            </div>
                            <button onClick={handleGenerateReport} disabled={savingObs}
                                className="w-full py-4 rounded-sm font-black text-sm uppercase tracking-[0.3em] transition disabled:opacity-40"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                {savingObs ? 'Procesando...' : 'Generar y Guardar Informe'}
                            </button>
                        </div>
                    </div>
                )}

                {/* HISTORIAL DE INFORMES — Fix 6: tema dark neon */}
                <div className="rounded-sm p-6 mb-8" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-5"
                        style={{ color: 'var(--accent)' }}>
                        <Clock size={16} /> Historial de Informes Generados
                    </h2>

                    <div className="overflow-hidden rounded-sm" style={{ border: '1px solid var(--border)' }}>
                        <table className="w-full text-left font-mono">
                            <thead className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ background: 'var(--bg-main)', color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
                                <tr>
                                    <th className="p-3">FECHA REPORTE</th>
                                    <th className="p-3">PERIODO</th>
                                    <th className="p-3">OBSERVACIONES</th>
                                    <th className="p-3 text-right">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {(!Array.isArray(reports) || reports.length === 0) ? (
                                    <tr><td colSpan="4" className="p-10 text-center text-slate-300 uppercase text-[9px] font-bold tracking-widest italic">No hay informes generados todavía.</td></tr>
                                ) : (
                                    reports.map(rep => (
                                        <tr key={rep.id} className="transition-colors group"
                                            style={{ borderBottom: '1px solid var(--border)' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-main)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                            <td className="p-3 text-[10px] font-black uppercase tracking-tighter" style={{ color: 'var(--text-1)' }}>{rep.report_date}</td>
                                            <td className="p-3 text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>{rep.start_date} <ArrowLeft size={10} className="rotate-180 inline mx-1" /> {rep.end_date}</td>
                                            <td className="p-3 text-[9px] font-bold uppercase truncate max-w-[200px]" style={{ color: 'var(--text-2)' }}>{rep.technical_observations}</td>
                                            <td className="p-3 text-right">
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
                                                        className="px-3 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest transition flex items-center gap-1.5"
                                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                                                    >
                                                        <FileSpreadsheet size={12} /> Excel
                                                    </button>
                                                    <PDFDownloadLink
                                                        document={
                                                            <TechnicalReportPDF
                                                                project={project}
                                                                essays={essays}
                                                                visits={visits}
                                                                complaints={complaints}
                                                                financials={financials}
                                                                startDate={rep.start_date}
                                                                endDate={rep.end_date}
                                                                reportDate={rep.report_date}
                                                                conclusions={rep.technical_observations || ''}
                                                                advisorName="Asesor Técnico"
                                                            />
                                                        }
                                                        fileName={`IT_${project?.client_name?.replace(/\s/g, '_') || 'cliente'}_${project?.name?.replace(/\s/g, '_') || 'proyecto'}_${rep.report_date}.pdf`}
                                                    >
                                                        {({ loading: pdfLoading }) => (
                                                            <button
                                                                disabled={pdfLoading}
                                                                className="flex items-center gap-2 px-3 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-widest transition shadow-lg disabled:opacity-50"
                                                                style={{ background: 'var(--accent-2)', color: '#fff' }}
                                                            >
                                                                <FileText size={12} /> {pdfLoading ? '...' : 'PDF'}
                                                            </button>
                                                        )}
                                                    </PDFDownloadLink>
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
                                <Link to="/essays/new" state={{ preselectedProject: project.id, preselectedClient: project.client }} className="flex items-center gap-2 bg-[var(--bg-panel)] text-white px-6 py-3 rounded-sm shadow-xl transition font-black text-[10px] uppercase tracking-widest border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                                    <Plus size={16} /> Iniciar Protocolo
                                </Link>
                            </div>

                            <div className="bg-[var(--bg-panel)] shadow-2xl border border-[var(--border)] rounded-sm overflow-hidden">
                                <table className="w-full text-left border-collapse font-mono">
                                    <thead className="bg-[var(--bg-main)] p-4 text-[9px] font-black text-[var(--text-2)] uppercase tracking-[0.3em] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="p-5 w-16 text-center border-r border-[var(--border)]">SEL.</th>
                                            <th className="p-5">PROTÓCOLO / CÓDIGO</th>
                                            <th className="p-5">DESCRIPCIÓN TÉCNICA</th>
                                            <th className="p-5 text-right">SCORE</th>
                                            <th className="p-5 text-right pr-8">EXPEDIENTE</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {essays.length === 0 ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-[var(--text-2)] uppercase text-[10px] font-bold tracking-widest italic">Sin registros técnicos vinculados.</td></tr>
                                        ) : (
                                            essays.map(e => (
                                                <tr key={e.id} className="hover:bg-[var(--bg-hover)] transition-colors group">
                                                    <td className="p-5 text-center border-r border-[var(--border)]">
                                                        <button onClick={() => toggleSelection(e.id)} className="transition transform active:scale-90">
                                                            {selectedIds.includes(e.id) ? <CheckSquare size={20} className="text-[var(--accent)]" /> : <Square size={20} className="text-[var(--border)]" />}
                                                        </button>
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="font-black text-[var(--text-1)] text-lg uppercase tracking-tighter group-hover:text-[var(--accent)] transition-colors">{e.code || `ENS-${e.id}`}</div>
                                                        <div className="text-[9px] text-[var(--text-2)] font-bold uppercase tracking-widest">{e.date}</div>
                                                    </td>
                                                    <td className="p-5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-2)] truncate max-w-xs">{e.description || 'Sin descripción'}</td>
                                                    <td className="p-5 text-right">
                                                        {e.final_score ? (
                                                            <div className={`text-xl font-black ${parseFloat(e.final_score) >= 8 ? 'text-[var(--accent)]' : 'text-orange-600'}`}>{parseFloat(e.final_score).toFixed(1)}</div>
                                                        ) : <span className="text-[var(--border)]">--</span>}
                                                    </td>
                                                    <td className="p-5 text-right pr-8">
                                                        <Link to={`/essays/${e.id}`} className="bg-[var(--bg-main)] text-white p-2 rounded-sm hover:bg-[var(--accent)] hover:text-[#0f172a] transition inline-block shadow-md border border-[var(--border)]">
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
                                <Link to="/visits/new" className="flex items-center gap-2 bg-[var(--bg-panel)] text-white px-6 py-3 rounded-sm shadow-xl transition font-black text-[10px] uppercase tracking-widest border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
                                    <Plus size={16} /> Agendar Visita Técnica
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {visits.length === 0 ? (
                                    <div className="md:col-span-2 bg-[var(--bg-panel)] border-2 border-dashed border-[var(--border)] p-20 text-center rounded-sm">
                                        <Calendar size={48} className="mx-auto text-[var(--border)] mb-4" />
                                        <p className="text-[var(--text-2)] font-bold uppercase text-xs tracking-widest">No hay visitas de campo programadas.</p>
                                    </div>
                                ) : (
                                    visits.map(v => (
                                        <Link key={v.id} to={`/visits/${v.id}`} className="bg-[var(--bg-panel)] border border-[var(--border)] shadow-xl hover:border-[var(--accent)] transition-all p-8 flex justify-between items-center group relative overflow-hidden">
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${v.status === 'Realizada' ? 'bg-[var(--accent)]' : 'bg-orange-500'}`}></div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-sm text-[#0f172a] ${v.status === 'Realizada' ? 'bg-[var(--accent)]' : 'bg-orange-500'}`}>{v.status}</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-2)] uppercase tracking-widest">{v.visit_type}</span>
                                                </div>
                                                <div>
                                                    <div className="text-xl font-black text-[var(--text-1)] uppercase tracking-tighter group-hover:text-[var(--accent)] transition-colors">{v.objective || 'Visita Técnica'}</div>
                                                    <div className="text-[10px] font-bold text-[var(--text-2)] flex items-center gap-4 mt-1">
                                                        <span className="flex items-center gap-1"><Calendar size={12} /> {v.date}</span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {v.start_time?.substring(0, 5)} hs</span>
                                                        {v.kilometers > 0 && <span className="flex items-center gap-1 text-[var(--accent)]"><TrendingUp size={12} /> {v.kilometers} KM</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 bg-[var(--bg-main)] px-4 py-2 rounded-sm group-hover:bg-[var(--accent)] transition-colors">
                                                <span className="text-xs font-black text-[var(--text-2)] uppercase tracking-widest group-hover:text-[#0f172a]">Gestionar</span>
                                                <ArrowLeft size={14} className="rotate-180 text-[var(--accent)] group-hover:text-[#0f172a]" />
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
                            <div className="flex justify-between items-center bg-[var(--bg-panel)] p-6 shadow-xl border border-[var(--border)] rounded-sm">
                                <div>
                                    <h3 className="text-sm font-black text-[var(--text-1)] uppercase tracking-widest italic">Gestión de Reclamos Técnicos</h3>
                                    <div className="flex gap-4 mt-2">
                                        <button onClick={openNewComplaint} className="flex items-center gap-2 bg-[var(--bg-main)] text-white px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest hover:border-[var(--accent)] hover:text-[var(--accent)] transition shadow-inner border border-[var(--border)]">
                                            <Plus size={14} /> Nuevo Reclamo Manual
                                        </button>
                                        <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-transparent text-[var(--text-2)] px-4 py-2 rounded-sm text-[9px] font-black uppercase tracking-widest border border-[var(--border)] hover:bg-[var(--bg-hover)] transition shadow-sm">
                                            <FileSpreadsheet size={14} /> Descargar Plantilla
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[var(--bg-panel)] shadow-2xl border border-[var(--border)] rounded-sm overflow-hidden">
                                <table className="w-full text-left font-mono">
                                    <thead className="bg-[var(--bg-main)] text-[9px] font-black text-[var(--text-2)] uppercase tracking-[0.3em] border-b border-[var(--border)]">
                                        <tr>
                                            <th className="p-5">DATOS / FECHA</th>
                                            <th className="p-5">ESTADO / LOTE</th>
                                            <th className="p-5">HARINA / PRODUCTO</th>
                                            <th className="p-5">DESCRIPCIÓN</th>
                                            <th className="p-5 text-right">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {complaints.length === 0 ? (
                                            <tr><td colSpan="5" className="p-20 text-center text-[var(--text-2)] uppercase text-[10px] font-bold tracking-widest italic">No se han registrado reclamos técnicos.</td></tr>
                                        ) : (
                                            complaints.map(c => (
                                                <Fragment key={c.id}>
                                                    <tr className="hover:bg-[var(--bg-hover)] transition-colors group">
                                                        <td className="p-5">
                                                            <div className="text-[10px] font-black text-[var(--text-1)] uppercase tracking-tight italic">{c.loading_date}</div>
                                                            <div className="text-[8px] text-[var(--text-2)] font-bold uppercase">Ent: {c.delivery_date || '-'}</div>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${c.status === 'Cerrado' ? 'bg-green-900/40 text-green-400' :
                                                                    c.status === 'En Proceso' ? 'bg-amber-900/40 text-amber-400' : 'bg-red-900/40 text-red-400'
                                                                    }`}>
                                                                    {c.status}
                                                                </span>
                                                                {c.images && c.images.length > 0 && (
                                                                    <span className="text-[8px] font-black text-[var(--accent)] bg-[var(--accent-dim)] px-1 rounded-sm">
                                                                        {c.images.length} FOTOS
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-[9px] font-bold text-[var(--text-1)] uppercase tracking-tighter">Lote: {c.batch || 'S/N'}</div>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="text-[10px] font-bold text-orange-400 uppercase mb-0.5">{c.flour_type || '-'}</div>
                                                            <div className="text-[8px] text-[var(--text-2)] font-bold uppercase">{c.product_made || '-'}</div>
                                                        </td>
                                                        <td className="p-5">
                                                            <div className="text-[9px] font-bold text-[var(--text-2)] uppercase max-w-xs">{c.description?.substring(0, 40)}...</div>
                                                            {c.technical_conclusion && (
                                                                <div className="mt-1 text-[8px] px-2 py-1 bg-[var(--bg-main)] text-[var(--text-2)] rounded-sm italic border-l-2 border-[var(--accent)]">
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
                                                                        <button onClick={() => openEditComplaint(c)} className="p-2 bg-[var(--bg-main)] text-white rounded-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition shadow-md border border-[var(--border)]">
                                                                            <FileText size={14} />
                                                                        </button>
                                                                        <label className="bg-[var(--bg-main)] p-2 rounded-sm text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition cursor-pointer shadow-sm border border-[var(--border)]">
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
                                                    {/* GALERÍA DE MINIATURAS PARA RECLAMO (ESPEJO ENSAYOS) */}
                                                    {c.images && c.images.length > 0 && (
                                                        <tr className="bg-[var(--bg-main)]/30">
                                                            <td colSpan="5" className="p-4 pt-1">
                                                                <div className="flex flex-wrap gap-4 border-t border-[var(--border)] pt-3 pl-5">
                                                                    {c.images.map(img => (
                                                                        <div key={img.id} className="relative group w-20 h-20 bg-[var(--bg-panel)] rounded-sm overflow-hidden border border-[var(--border)] shadow-sm transition hover:shadow-md">
                                                                            <img
                                                                                src={img.image?.startsWith('http') ? img.image : `${API_URL}${img.image}`}
                                                                                alt="Reclamo"
                                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                                            />
                                                                            <button
                                                                                onClick={() => handleDeleteComplaintImage(img.id)}
                                                                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-700 active:scale-90"
                                                                                title="Eliminar Foto"
                                                                            >
                                                                                <Trash2 size={10} />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </Fragment>
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
                                <FinanceCard label="Ingresos (Honorarios)" val={financials.revenue} icon={<DollarSign size={14} />} border="border-[var(--border)]" />
                                <FinanceCard label="Viáticos (Egresos)" val={financials.visitExpenses} icon={<TrendingUp size={14} />} border="border-red-500" />
                                <FinanceCard label="Materiales (Consultor)" val={financials.materialExpensesTotal} icon={<ShoppingBag size={14} />} border="border-orange-500" />
                                <FinanceCard label="Margen Real Bruto" val={financials.realMargin} icon={<PieChart size={14} />} border="border-[var(--accent)]" bg="bg-[var(--bg-panel)]" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                {/* 2. GESTIÓN DE GASTOS DE MATERIALES */}
                                <div className="bg-[var(--bg-panel)] shadow-2xl border border-[var(--border)] rounded-sm overflow-hidden flex flex-col">
                                    <div className="p-6 bg-[var(--bg-main)] text-white border-b border-[var(--border)] flex items-center gap-3">
                                        <ShoppingBag size={18} className="text-[var(--accent)]" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex-grow" style={{ color: 'var(--text-1)' }}>Compras y Gastos Out-of-Pocket</h3>
                                    </div>

                                    {/* Formulario Agregar Gasto */}
                                    <form onSubmit={handleAddExpense} className="p-6 bg-[var(--bg-main)]/50 border-b border-[var(--border)] grid grid-cols-1 gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest block ml-1">Concepto / Descripción</label>
                                                <input
                                                    placeholder="Ej: Muestras Competencia"
                                                    value={newExpense.description}
                                                    onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                                                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-[10px] font-bold uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest block ml-1">Monto ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="0.00"
                                                    value={newExpense.amount}
                                                    onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })}
                                                    className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-[10px] font-mono font-black outline-none focus:border-[var(--accent)] text-[var(--text-1)]"
                                                />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-[var(--accent)] text-[#0f172a] py-3 rounded-sm font-black text-[9px] uppercase tracking-widest transition flex items-center justify-center gap-2">
                                            <Plus size={14} /> Registrar Gasto Real
                                        </button>
                                    </form>

                                    {/* Lista de Gastos */}
                                    <div className="p-0 flex-grow max-h-[400px] overflow-y-auto">
                                        {materialExpenses.length === 0 ? (
                                            <div className="p-20 text-center text-[var(--text-2)] uppercase text-[9px] font-bold tracking-widest italic">Archivo de gastos vacío.</div>
                                        ) : (
                                            <table className="w-full font-mono text-xs">
                                                <tbody className="divide-y-2 divide-[var(--border)]">
                                                    {materialExpenses.map(exp => (
                                                        <tr key={exp.id} className="group hover:bg-[var(--bg-hover)] transition-colors">
                                                            <td className="p-4 pl-6">
                                                                <div className="text-[10px] font-black text-[var(--text-1)] uppercase tracking-tight">{exp.description}</div>
                                                                <div className="text-[8px] text-[var(--text-2)] font-bold uppercase">{new Date(exp.date).toLocaleDateString()}</div>
                                                            </td>
                                                            <td className="p-4 text-right font-black text-[var(--accent)]">$ {parseFloat(exp.amount).toFixed(2)}</td>
                                                            <td className="p-4 w-12 text-center">
                                                                <button onClick={() => handleDeleteExpense(exp.id)} className="text-[var(--text-2)] hover:text-red-500 transition p-2">
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
                                    <div className="bg-[var(--bg-panel)] border-l-8 border-[var(--accent)] shadow-2xl p-8 rounded-sm relative overflow-hidden group border border-[var(--border)]">
                                        <AlertCircle className="absolute top-4 right-4 text-[var(--accent-dim)] group-hover:text-[var(--accent)] transition-colors" size={64} />
                                        <div className="space-y-4 relative z-10">
                                            <div>
                                                <h4 className="text-[11px] font-black text-[var(--accent)] uppercase tracking-[0.3em] mb-1">Costo Teórico de Recetas</h4>
                                                <div className="text-[10px] text-[var(--text-2)] font-bold uppercase leading-tight max-w-[250px]">
                                                    Suma informativa de ingredientes en ensayos. Usualmente cubierto por el cliente final.
                                                </div>
                                            </div>
                                            <div className="text-4xl font-black text-[var(--text-1)]">$ {financials.recipeTheoreticalCost.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    {/* Simulador de Presupuesto */}
                                    <div className="bg-[var(--bg-panel)] shadow-2xl border border-[var(--border)] rounded-sm overflow-hidden">
                                        <div className="p-6 bg-[var(--bg-main)] text-white border-b border-[var(--border)] flex items-center justify-between">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                                                <Calculator size={18} className="text-[var(--accent)]" /> Simulador de Cotización Rápida
                                            </h3>
                                        </div>
                                        <div className="p-8 grid grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest block">Horas Técnicas Est.</label>
                                                <input type="number" className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm font-mono text-xl font-black outline-none focus:border-[var(--accent)] text-[var(--text-1)]" placeholder="0" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest block">Valor Hora ($)</label>
                                                <input type="number" className="w-full p-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm font-mono text-xl font-black outline-none focus:border-[var(--accent)] text-[var(--text-1)]" defaultValue="5000" />
                                            </div>
                                        </div>
                                        <div className="p-8 bg-[var(--bg-main)] border-t border-[var(--border)] flex justify-between items-center">
                                            <div className="text-[10px] font-black text-[var(--text-2)] uppercase tracking-widest italic tracking-tighter">Inversión Recomendada</div>
                                            <div className="text-3xl font-black text-[var(--text-1)]">$ 0.00</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODAL RECLAMO (NUEVO/EDITAR) */}
                {showComplaintForm && (
                    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                        <div className="bg-[var(--bg-panel)] w-full max-w-4xl rounded-sm shadow-2xl p-10 space-y-8 animate-in slide-in-from-bottom-5 duration-300 overflow-y-auto max-h-[90vh] border border-[var(--border)]">
                            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4">
                                <h2 className="text-xl font-black text-[var(--text-1)] uppercase tracking-tighter italic">
                                    {editingComplaint ? `Editar Reclamo #${editingComplaint.id}` : 'Registrar Nuevo Reclamo'}
                                </h2>
                                <button onClick={() => setShowComplaintForm(false)} className="text-[var(--text-2)] hover:text-white transition"><ArrowLeft size={24} /></button>
                            </div>

                            <form onSubmit={handleSaveComplaint} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Fecha Carga</label>
                                            <input type="date" value={complaintForm.loading_date} onChange={e => setComplaintForm({ ...complaintForm, loading_date: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm font-mono text-xs outline-none focus:border-[var(--accent)] text-[var(--text-1)]" required />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Fecha Entrega</label>
                                            <input type="date" value={complaintForm.delivery_date} onChange={e => setComplaintForm({ ...complaintForm, delivery_date: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm font-mono text-xs outline-none focus:border-[var(--accent)] text-[var(--text-1)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Cliente Directo (Opcional)</label>
                                        <input value={complaintForm.direct_client} onChange={e => setComplaintForm({ ...complaintForm, direct_client: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs font-bold uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]" placeholder="Ej: Panadería Santa Margarita" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Lote / Partida</label>
                                            <input value={complaintForm.batch} onChange={e => setComplaintForm({ ...complaintForm, batch: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs font-bold uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]" placeholder="Ej: L-450" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Status del Caso</label>
                                            <select value={complaintForm.status} onChange={e => setComplaintForm({ ...complaintForm, status: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs font-black uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]">
                                                <option value="Abierto" className="bg-[#0f172a]">🔴 Abierto</option>
                                                <option value="En Proceso" className="bg-[#0f172a]">🟡 En Proceso</option>
                                                <option value="Cerrado" className="bg-[#0f172a]">🟢 Cerrado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-2)]">Contacto (Nombre/Tel)</label>
                                        <input
                                            type="text"
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border)] p-3 rounded-sm text-sm text-[var(--text-1)] focus:border-[var(--accent)] outline-none font-medium"
                                            placeholder="Ej: Juan Pérez - 11 5432..."
                                            value={complaintForm.contact}
                                            onChange={(e) => setComplaintForm({ ...complaintForm, contact: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Tipo de Harina</label>
                                        <input value={complaintForm.flour_type} onChange={e => setComplaintForm({ ...complaintForm, flour_type: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs font-bold uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Descripción del Problema</label>
                                        <textarea value={complaintForm.description} onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })} className="w-full h-32 p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs outline-none focus:border-[var(--accent)] text-[var(--text-1)]" required />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Producto Elaborado</label>
                                        <input value={complaintForm.product_made} onChange={e => setComplaintForm({ ...complaintForm, product_made: e.target.value })} className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs font-bold uppercase outline-none focus:border-[var(--accent)] text-[var(--text-1)]" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Conclusión Técnica</label>
                                        <textarea value={complaintForm.technical_conclusion} onChange={e => setComplaintForm({ ...complaintForm, technical_conclusion: e.target.value })} className="w-full h-32 p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs outline-none focus:border-[var(--accent)] text-[var(--text-1)] border-l-4 border-[var(--accent)]" placeholder="Redacte el dictamen técnico..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[9px] font-black text-[var(--text-2)] uppercase tracking-widest">Acción Correctiva Sugerida</label>
                                        <textarea value={complaintForm.corrective_action} onChange={e => setComplaintForm({ ...complaintForm, corrective_action: e.target.value })} className="w-full h-32 p-3 bg-[var(--bg-main)] border border-[var(--border)] rounded-sm text-xs outline-none focus:border-green-500 text-[var(--text-1)]" />
                                    </div>
                                </div>

                                {/* SECCIÓN DE FOTOS (DENTRO DEL MODAL) */}
                                {editingComplaint && (
                                    <div className="md:col-span-2 space-y-4 border-t border-[var(--border)] pt-6">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-xs font-black text-[var(--text-1)] uppercase tracking-widest flex items-center gap-2">
                                                <ImageIcon size={16} /> Evidencia Fotográfica (Gestión Manual)
                                            </h3>
                                            <div className="flex items-center gap-4">
                                                {uploadingComplaintId === editingComplaint.id && (
                                                    <span className="text-[8px] font-black text-[var(--accent)] animate-pulse uppercase tracking-widest">Sincronizando Archivo...</span>
                                                )}
                                                <label className="cursor-pointer bg-[var(--bg-main)] text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-sm flex items-center gap-2 hover:border-[var(--accent)] hover:text-[var(--accent)] transition shadow-lg border border-[var(--border)]">
                                                    <Upload size={14} /> Cargar Foto Individual
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleUploadComplaintImage(editingComplaint.id, e.target.files[0])}
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {editingComplaint.images && editingComplaint.images.length > 0 ? (
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                {editingComplaint.images.map(img => (
                                                    <div key={img.id} className="relative group aspect-square bg-[var(--bg-main)] rounded-sm overflow-hidden border border-[var(--border)] shadow-xl transition hover:border-[var(--accent)]">
                                                        <img
                                                            src={img.image?.startsWith('http') ? img.image : `${API_URL}${img.image}`}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            alt="Evidencia"
                                                        />
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteComplaintImage(img.id)}
                                                                className="bg-red-600 text-white p-2 rounded-full shadow-2xl hover:bg-red-700 active:scale-90 transition-all font-bold"
                                                                title="Eliminar Permanente"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 border-2 border-dashed border-[var(--border)] text-center text-[var(--text-2)] text-[10px] font-black uppercase tracking-widest italic">
                                                No se han vinculado evidencias fotográficas a este reporte todavía.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="md:col-span-2 flex justify-end gap-4 border-t border-[var(--border)] pt-6">
                                    <button type="button" onClick={() => setShowComplaintForm(false)} className="px-8 py-3 bg-[var(--bg-main)] text-[var(--text-2)] rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition border border-[var(--border)]">Cancelar</button>
                                    <button type="submit" className="px-12 py-3 bg-[var(--accent)] text-[#0f172a] rounded-sm text-[10px] font-black uppercase tracking-widest transition shadow-xl border border-[var(--accent)]">
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
                ? 'bg-[var(--bg-panel)] border-[var(--accent)] text-[var(--accent)] translate-y-[-2px]'
                : 'bg-[var(--bg-main)] border-transparent text-[var(--text-2)] hover:bg-[var(--bg-hover)]'
                }`}
        >
            {icon} {label}
        </button>
    );
}

function FinanceCard({ label, val, icon, border, text = "", bg = "bg-[var(--bg-panel)]" }) {
    return (
        <div className={`${bg} p-6 border-l-4 ${border} shadow-xl rounded-sm group relative overflow-hidden transition-all hover:translate-y-[-4px]`} style={{ border: '1px solid var(--border)', borderLeft: `4px solid ${border.includes('accent') ? 'var(--accent)' : border.replace('border-', '')}` }}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2`} style={{ color: 'var(--text-2)' }}>
                {icon} {label}
            </div>
            <div className={`text-2xl font-black font-mono tracking-tighter`} style={{ color: 'var(--text-1)' }}>
                $ {parseFloat(val || 0).toLocaleString()}
            </div>
        </div>
    );
}

