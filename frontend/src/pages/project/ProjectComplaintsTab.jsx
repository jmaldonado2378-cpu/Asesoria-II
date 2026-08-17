import { Fragment } from 'react';
import { Plus, FileSpreadsheet, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { API_URL } from '../../config';

export default function ProjectComplaintsTab({
    complaints,
    openNewComplaint,
    handleDownloadTemplate,
    openEditComplaint,
    handleUploadComplaintImage,
    handleDeleteComplaintImage,
    uploadingComplaintId
}) {
    return (
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
    );
}
