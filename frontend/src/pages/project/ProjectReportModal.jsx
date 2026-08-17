import { ArrowLeft } from 'lucide-react';

export default function ProjectReportModal({ showReportForm, setShowReportForm, reportParams, setReportParams, handleGenerateReport, savingObs }) {
    if (!showReportForm) return null;

    return (
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
    );
}
