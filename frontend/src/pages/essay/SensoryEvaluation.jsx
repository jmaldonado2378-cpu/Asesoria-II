import React from 'react';
import { ClipboardCheck, CheckSquare, Square } from 'lucide-react';

export default function SensoryEvaluation({ evalData, handleEvalChange, finalScore, isEditing }) {
    return (
        <section className="print:break-inside-avoid print:mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4 flex items-center gap-2" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}>
                <ClipboardCheck size={16} /> Evaluación de Calidad
            </h3>
            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-x-12 gap-y-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                {Object.keys(evalData).map(cat => (
                    <div key={cat} className="contents">
                        <div className="col-span-2 mt-4 first:mt-0 mb-2 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>{cat}</h4>
                        </div>
                        {evalData[cat].map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1.5 border-b px-2 rounded transition" style={{ borderColor: 'var(--border)' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <div className="flex gap-3">
                                    <button onClick={() => isEditing && handleEvalChange(cat, idx, 'active', !item.active)} className="transition hover:scale-110">
                                        {item.active ? <CheckSquare size={18} style={{ color: 'var(--accent)' }} /> : <Square size={18} style={{ color: 'var(--text-2)' }} />}
                                    </button>
                                    <span className={`text-sm ${item.active ? 'font-bold' : ''}`} style={{ color: item.active ? 'var(--text-1)' : 'var(--text-2)' }}>{item.name}</span>
                                </div>
                                {item.active && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--text-2)' }}>Pto:</span>
                                        {isEditing ? (
                                            <input type="text" inputMode="decimal" className="w-12 text-center border p-1 rounded font-bold outline-none" style={{ background: 'var(--bg-main)', borderColor: 'var(--border)', color: 'var(--text-1)' }} value={item.score} onChange={(e) => handleEvalChange(cat, idx, 'score', String(e.target.value).replace(/,/g, '.'))} />
                                        ) : (
                                            <span className="font-bold px-2 rounded font-mono" style={{ background: 'var(--bg-main)', color: 'var(--text-1)' }}>{item.score || '-'}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    );
}
