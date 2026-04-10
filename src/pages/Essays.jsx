import { useState } from 'react';
import useSWR from 'swr';
import { Link } from 'react-router-dom';
import { FlaskConical, Calendar, FileText, User, Loader2, Beaker, Plus } from 'lucide-react';
import { API_URL, fetcher } from '../config';

export default function Essays() {
    // SWR: caché reactiva — los datos aparecen instantáneamente en revisitas
    const { data: ensayos, error, isLoading } = useSWR(`${API_URL}/api/ensayos/`, fetcher);

    if (isLoading) return (
        <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
        </div>
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto" style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
            <header className="flex justify-between items-end mb-10 pb-8" style={{ borderBottom: '2px solid var(--border)' }}>
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <FlaskConical size={28} style={{ color: 'var(--accent)' }} /> Historial de Ensayos
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Laboratorio Molinero · Control de Calidad</p>
                </div>
                <Link
                    to="/essays/new"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition active:scale-95"
                    style={{ background: 'var(--accent)', color: '#0f172a' }}
                >
                    <Plus size={16} /> Nuevo Registro
                </Link>
            </header>

            {error && (
                <div className="p-4 mb-6 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                    ⚠️ No se pudieron cargar los ensayos.
                </div>
            )}

            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                <table className="w-full text-left border-collapse">
                    <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                        <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                        </tr>
                    </thead>
                    <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                        <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-4 py-3">Código</th>
                            <th className="px-4 py-3">Cliente</th>
                            <th className="px-4 py-3 text-center">Score</th>
                            <th className="px-4 py-3 text-right">Costo</th>
                            <th className="px-4 py-3 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(!ensayos || ensayos.length === 0) ? (
                            <tr>
                                <td colSpan="6" className="p-16 text-center italic text-sm" style={{ color: 'var(--text-2)' }}>
                                    No existen registros técnicos.
                                </td>
                            </tr>
                        ) : (
                            ensayos.map((ensayo, i) => {
                                const score = ensayo.final_score ? parseFloat(ensayo.final_score) : null;
                                const scoreColor = score === null ? 'var(--text-2)' : score >= 8 ? 'var(--score-high)' : score >= 6 ? 'var(--score-mid)' : 'var(--score-low)';
                                return (
                                    <tr key={ensayo.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.3)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                        className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-3 font-mono text-xs" style={{ color: 'var(--text-2)' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-indigo-400" />
                                                {ensayo.date || 'S/F'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
                                                {ensayo.code || `ENS-${ensayo.id}`}
                                            </span>
                                            <div className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{ensayo.name}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-sm">
                                                <User size={13} style={{ color: 'var(--text-2)' }} />
                                                <span className="font-semibold text-white">{ensayo.client_name || 'General'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {score !== null ? (
                                                <span className="text-xl font-black" style={{ color: scoreColor }}>{score.toFixed(1)}</span>
                                            ) : (
                                                <span className="text-xs" style={{ color: 'var(--text-2)' }}>—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="font-mono font-bold text-sm" style={{ color: 'var(--text-2)' }}>
                                                ${parseFloat(ensayo.total_cost || 0).toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/essays/${ensayo.id}`}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                Ver Informe
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
