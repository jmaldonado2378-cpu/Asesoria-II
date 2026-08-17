import React from 'react';
import { FlaskConical, Trash2, Plus } from 'lucide-react';

export const WebProcessRow = ({ label, name, unit, value, onChange, isEditing, formData }) => {
    const displayValue = isEditing ? (formData[name] !== undefined ? formData[name] : value) : value;

    return (
        <div className="flex justify-between items-center py-2 border-b border-slate-50 hover:bg-slate-50 px-2 transition group">
            <span className="text-sm text-slate-500 font-medium group-hover:text-slate-900">{label}</span>
            <div className="flex items-center gap-2">
                {isEditing ? (
                    <input
                        type="text"
                        inputMode="decimal"
                        name={name}
                        value={displayValue !== null && displayValue !== undefined ? displayValue : ''}
                        onChange={onChange}
                        className="w-24 text-right border border-slate-300 rounded text-sm font-bold p-1 outline-none focus:border-blue-500 focus:bg-blue-50 transition-colors"
                    />
                ) : (
                    <span className="font-mono font-bold text-slate-800">{value !== null && value !== undefined ? value : '-'}</span>
                )}
                <span className="text-xs text-slate-400 w-8">{unit}</span>
            </div>
        </div>
    );
};

export default function FormulationTable({
    ensayo,
    detailsData,
    sortedDetails,
    baseFlourIndex,
    totalCost,
    fmt,
    isEditing,
    handleDetailChange,
    handleDeleteDetail,
    allIngredients,
    newIngredientId,
    newIngredientGrams,
    newIngredientPrice,
    handleIngredientSelect,
    setNewIngredientGrams,
    setNewIngredientPrice,
    handleAddIngredient
}) {
    return (
        <section>
            <h3 className="text-sm font-bold uppercase tracking-wider pb-2 mb-4 flex items-center gap-2" style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)' }}>
                <FlaskConical size={16} /> Formulación (Gramos)
            </h3>
            <div className="overflow-hidden rounded-sm" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-sm text-left">
                    <thead className="font-bold uppercase text-xs" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
                        <tr>
                            <th className="p-3">Ingrediente</th>
                            <th className="p-3 text-right">Peso (gr)</th>
                            <th className="p-3 text-right">$/Kg</th>
                            <th className="p-3 text-right">Subtotal</th>
                            <th className="p-3 text-right">% Pan.</th>
                            <th className="p-3 text-right">PPM</th>
                            <th className="p-3 text-right">Dosis 25kg</th>
                            {isEditing && <th className="p-3 w-10"></th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                        <tr className="font-medium" style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
                            <td className="p-3 font-bold" style={{ color: 'var(--text-1)' }}>
                                {detailsData[baseFlourIndex]?.ingredient_name || 'Harina Base'}
                            </td>
                            <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)' }}>
                                {isEditing && baseFlourIndex >= 0 ? (
                                    <div className="flex items-center justify-end">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={detailsData[baseFlourIndex]?.quantity_grams || ''}
                                            onChange={(e) => handleDetailChange(baseFlourIndex, 'quantity_grams', e.target.value)}
                                            className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-indigo-600 focus:bg-white"
                                        />
                                    </div>
                                ) : (
                                    <span>{ensayo.total_harina_grams ? fmt(ensayo.total_harina_grams) : '0'} g</span>
                                )}
                            </td>
                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>-</td>
                            <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)', borderLeft: '1px solid var(--border)' }}>
                                ${detailsData.filter(d => d.is_base_flour).reduce((acc, current) => acc + (parseFloat(current.quantity || 0) * parseFloat(current.price_per_kg || current.cost_per_kg || 0)), 0).toFixed(2)}
                            </td>
                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-1)' }}>100%</td>
                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>-</td>
                            <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>25 kg</td>
                            {isEditing && <td></td>}
                        </tr>
                        {sortedDetails.map((row) => {
                            const idx = detailsData.findIndex(d => d.id === row.id);
                            const isBaseRow = row.is_base_flour && idx === baseFlourIndex;
                            const hideRow = isBaseRow || (!isEditing && row.is_base_flour);
                            return (
                                <tr key={row.id} className={hideRow ? 'hidden' : 'transition'} style={{ background: 'var(--bg-panel)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
                                >
                                    <td className="p-3" style={{ color: 'var(--text-1)' }}>{row.ingredient_name}</td>
                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)' }}>
                                        {isEditing ? <input type="text" inputMode="decimal" value={row.quantity_grams || ''} onChange={(e) => handleDetailChange(idx, 'quantity_grams', e.target.value)} className="w-24 text-right p-1 border border-blue-300 rounded outline-none font-bold focus:border-blue-500 focus:bg-white" /> : <span>{fmt(row.quantity_grams)} g</span>}
                                    </td>
                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>
                                        {isEditing ? <input type="text" inputMode="decimal" value={row.price_per_kg || row.cost_per_kg || ''} onChange={(e) => handleDetailChange(idx, 'price_per_kg', e.target.value)} className="w-24 text-right p-1 border border-blue-200 rounded outline-none text-xs focus:border-green-400" /> : <span>${fmt(row.price_per_kg || row.cost_per_kg || 0, 2)}</span>}
                                    </td>
                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)', background: 'rgba(74,222,128,0.05)', borderLeft: '1px solid var(--border)' }}>
                                        ${fmt(parseFloat(row.quantity || 0) * parseFloat(row.price_per_kg || row.cost_per_kg || 0), 2)}
                                    </td>
                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-1)' }}>{fmt(row.panadero_pct)}%</td>
                                    <td className="p-3 text-right font-mono" style={{ color: 'var(--text-2)' }}>{fmt(row.ppm_calc, 0)}</td>
                                    <td className="p-3 text-right font-mono font-bold" style={{ color: 'var(--accent)' }}>{fmt(row.dosis_25kg)} g</td>
                                    {isEditing && <td className="p-3 text-center"><button onClick={() => handleDeleteDetail(row.id)} className="text-slate-400 hover:text-red-600 transition"><Trash2 size={16} /></button></td>}
                                </tr>
                            );
                        })}
                        <tr className="bg-slate-800 text-white font-bold h-10 border-t-2 border-slate-900">
                            <td className="p-3 text-right uppercase text-[10px] tracking-widest text-slate-400 font-bold" colSpan="3">Costo Total Formulacion (por Batch)</td>
                            <td className="p-3 text-right font-mono text-lg text-green-400 border-r border-slate-700 font-bold">
                                ${totalCost.toFixed(2)}
                            </td>
                            <td colSpan="4" className="bg-slate-900/50"></td>
                        </tr>
                        {isEditing && (
                            <tr style={{ background: 'rgba(74,222,128,0.04)' }}>
                                <td className="p-3">
                                    <select value={newIngredientId} onChange={(e) => handleIngredientSelect(e.target.value)} className="w-full text-xs p-2 rounded outline-none pointer-cursor" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
                                        <option value="">+ Seleccionar </option>
                                        {allIngredients.map(ing => (<option key={ing.id} value={ing.id}>{ing.name}</option>))}
                                    </select>
                                </td>
                                <td className="p-3 text-right">
                                    <input type="text" inputMode="decimal" placeholder="Gramos" value={newIngredientGrams} onChange={(e) => setNewIngredientGrams(e.target.value)} className="w-24 text-right p-2 rounded text-xs outline-none" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                </td>
                                <td className="p-3 text-right">
                                    <input type="text" inputMode="decimal" placeholder="$/Kg" value={newIngredientPrice} onChange={(e) => setNewIngredientPrice(e.target.value)} className="w-20 text-right p-2 rounded text-xs outline-none" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                </td>
                                <td colSpan="2"></td>
                                <td className="p-3 text-center"><button onClick={handleAddIngredient} className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition active:scale-95"><Plus size={16} /></button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
