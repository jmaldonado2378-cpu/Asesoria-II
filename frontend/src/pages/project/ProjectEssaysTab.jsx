import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GitCompare, Eye, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';
import GoogleSheetsImporter from '../../components/ui/GoogleSheetsImporter';

export default function ProjectEssaysTab({ essays, selectedIds, toggleSelection, handleCompare, projectId, clientId }) {
    const [showImporter, setShowImporter] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <GoogleSheetsImporter isOpen={showImporter} onClose={() => setShowImporter(false)} preselectedProject={projectId} />

            <div className="flex justify-end gap-4">
                {selectedIds.length >= 2 && (
                    <button onClick={handleCompare} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-sm shadow-xl hover:bg-indigo-700 transition font-black text-[10px] uppercase tracking-widest border border-indigo-500">
                        <GitCompare size={16} /> Comparar ({selectedIds.length})
                    </button>
                )}
                <button
                    onClick={() => setShowImporter(true)}
                    className="flex items-center gap-2 bg-[var(--bg-panel)] text-white px-6 py-3 rounded-sm shadow-xl transition font-black text-[10px] uppercase tracking-widest border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                    <FileSpreadsheet size={16} style={{ color: 'var(--accent)' }} /> Importar Google Sheets
                </button>
                <Link to="/essays/new" state={{ preselectedProject: projectId, preselectedClient: clientId }} className="flex items-center gap-2 bg-[var(--bg-panel)] text-white px-6 py-3 rounded-sm shadow-xl transition font-black text-[10px] uppercase tracking-widest border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]">
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
    );
}
