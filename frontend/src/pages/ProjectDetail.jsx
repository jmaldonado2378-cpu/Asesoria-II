import { useState, useEffect, Fragment, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    Pipette, Save, FileSpreadsheet, FileText, ChevronRight,
    MessageSquare, Upload, Image as ImageIcon, Calendar,
    Activity, Building, ArrowLeft, Clock, GitCompare, TrendingUp,
    Plus, Trash2, Edit3, CheckSquare, Square, Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { API_URL } from '../config';

import ProjectEssaysTab from './project/ProjectEssaysTab';
import ProjectVisitsTab from './project/ProjectVisitsTab';
import ProjectComplaintsTab from './project/ProjectComplaintsTab';
import ProjectReportModal from './project/ProjectReportModal';

const PDFDownloadLink = lazy(() => import('@react-pdf/renderer').then(m => ({ default: m.PDFDownloadLink })));
const TechnicalReportPDF = lazy(() => import('../components/pdf/TechnicalReportPDF'));

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



    const fetchProject = () => {
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



            setLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            alert("⚠️ Error de conexión: " + err.message);
            setLoading(false);
        });
    };

    useEffect(() => {
        fetchProject();
    }, [id]);



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

    const handleDeleteProject = async () => {
        if (window.confirm('⚠️ ADVERTENCIA ABSOLUTA: Al eliminar este proyecto se borrarán de forma definitiva todos los ensayos de laboratorio, visitas agendadas, reclamos, presupuestos e informes asociados.\n\n¿Estás seguro de que deseas continuar?')) {
            try {
                const res = await fetch(`${API_URL}/api/projects/${id}/`, { method: 'DELETE' });
                if (res.ok) {
                    alert('Proyecto eliminado con éxito');
                    navigate('/projects');
                } else {
                    alert('Error al intentar eliminar el proyecto');
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión al eliminar el proyecto');
            }
        }
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
                    <div className="flex items-center gap-2 ml-4">
                        <Link to={`/projects/${id}/edit`}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest transition"
                            style={{ border: '1px solid var(--border)', color: 'var(--text-1)', background: 'var(--bg-main)' }}
                            title="Editar Proyecto"
                        >
                            <Edit3 size={14} /> Editar
                        </Link>
                        <button onClick={handleDeleteProject}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest transition hover:bg-red-950/40"
                            style={{ border: '1px solid rgb(239, 68, 68)', color: 'rgb(248, 113, 113)', background: 'transparent' }}
                            title="Eliminar Proyecto"
                        >
                            <Trash2 size={14} /> Eliminar
                        </button>
                        <button onClick={() => setShowReportForm(true)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-black text-[10px] uppercase tracking-widest transition"
                            style={{ background: 'var(--accent)', color: '#0f172a', border: 'none' }}>
                            <FileSpreadsheet size={15} /> Generar Informe Técnico
                        </button>
                    </div>
                </div>

                {/* GENERADOR DE INFORME MODAL — Fix 6: tema dark neon */}
                <ProjectReportModal
                    showReportForm={showReportForm}
                    setShowReportForm={setShowReportForm}
                    reportParams={reportParams}
                    setReportParams={setReportParams}
                    handleGenerateReport={handleGenerateReport}
                    savingObs={savingObs}
                />

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
                                                    <Suspense fallback={<span className="text-[8px] text-[var(--text-2)]">Cargando PDF...</span>}>
                                                        <PDFDownloadLink
                                                            document={
                                                                <TechnicalReportPDF
                                                                    project={project}
                                                                    essays={essays}
                                                                    visits={visits}
                                                                    complaints={complaints}
                                                                    financials={{ revenue: 0, visitExpenses: 0, materialExpensesTotal: 0, recipeTheoreticalCost: 0, realMargin: 0 }}
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
                                                    </Suspense>
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

                </div>

                {/* CONTENIDO TABS */}
                <div className="transition-all duration-300">
                    {/* --- TAB ENSAYOS --- */}
                    {activeTab === 'ensayos' && (
                        <ProjectEssaysTab
                            essays={essays}
                            selectedIds={selectedIds}
                            toggleSelection={toggleSelection}
                            handleCompare={handleCompare}
                            projectId={project.id}
                            clientId={project.client}
                        />
                    )}

                    {/* --- TAB VISITAS --- */}
                    {activeTab === 'visitas' && (
                        <ProjectVisitsTab visits={visits} />
                    )}

                    {/* --- TAB RECLAMOS --- */}
                    {activeTab === 'reclamos' && (
                        <ProjectComplaintsTab
                            complaints={complaints}
                            openNewComplaint={openNewComplaint}
                            handleDownloadTemplate={handleDownloadTemplate}
                            openEditComplaint={openEditComplaint}
                            handleUploadComplaintImage={handleUploadComplaintImage}
                            handleDeleteComplaintImage={handleDeleteComplaintImage}
                            uploadingComplaintId={uploadingComplaintId}
                        />
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

