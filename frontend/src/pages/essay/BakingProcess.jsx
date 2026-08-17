import React from 'react';
import { ChefHat, Timer, Thermometer, Ruler } from 'lucide-react';
import { WebProcessRow } from './FormulationTable';

export default function BakingProcess({ ensayo, formData, isEditing, handleFieldChange, fmt }) {
    const isBatido = formData.baking_type === 'Batido';

    return (
        <section>
            <div className="flex justify-between items-center pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    <ChefHat size={16} /> Parámetros de Proceso
                </h3>
                {isEditing ? (
                    <select name="baking_type" value={formData.baking_type || 'Fermentado'} onChange={handleFieldChange} className="text-xs font-bold uppercase rounded px-2 py-1 outline-none pointer-cursor" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                        <option value="Fermentado">Panificado</option>
                        <option value="Batido">Pastelería</option>
                    </select>
                ) : (
                    <span className="text-xs font-bold uppercase px-2 py-1 rounded" style={{ background: 'var(--bg-main)', color: 'var(--text-2)', border: '1px solid var(--accent)' }}>
                        {formData.baking_type || 'Fermentado'}
                    </span>
                )}
            </div>
            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-8" style={{ background: 'var(--bg-main)', border: '1px solid var(--accent)' }}>
                {!isBatido ? (
                    <>
                        <div>
                            <div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                    <Timer size={14} /> Amasado y Corte
                                </h4>
                            </div>
                            <WebProcessRow label="Amasado Vel. 1" name="kneading_time_v1_min" unit="min" value={ensayo.kneading_time_v1_min} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Amasado Vel. 2" name="kneading_time_v2_min" unit="min" value={ensayo.kneading_time_v2_min} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Temp. Masa Final" name="kneading_temp_c" unit="°C" value={ensayo.kneading_temp_c} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Vueltas de Sobado" name="sobado_turns" unit="vts" value={ensayo.sobado_turns} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Peso Corte (Crudo)" name="piece_weight_g" unit="g" value={ensayo.piece_weight_g} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                        </div>
                        <div>
                            <div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                    <Thermometer size={14} /> Fermentación y Horno
                                </h4>
                            </div>
                            <WebProcessRow label="Tiempo Fermentación" name="fermentation_time_min" unit="min" value={ensayo.fermentation_time_min} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Temp. Cámara" name="fermentation_temp_c" unit="°C" value={ensayo.fermentation_temp_c} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Humedad Cámara" name="fermentation_humidity_pct" unit="%" value={ensayo.fermentation_humidity_pct} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Temp. Horno" name="oven_temp_c" unit="°C" value={ensayo.oven_temp_c} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Tiempo Horno" name="oven_time_min" unit="min" value={ensayo.oven_time_min} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Greñado (1-10)" name="scoring_score" unit="pts" value={ensayo.scoring_score} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                    <Timer size={14} /> Batido y Mezclado
                                </h4>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b px-2 group transition" style={{ borderColor: 'var(--border)' }}>
                                <span className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Velocidad</span>
                                {isEditing ? (
                                    <input type="text" name="batter_speed" value={formData.batter_speed || ''} onChange={handleFieldChange} className="w-32 text-right rounded text-sm font-bold p-1 outline-none" style={{ border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-1)' }} />
                                ) : (
                                    <span className="font-mono font-bold" style={{ color: 'var(--text-1)' }}>{ensayo.batter_speed || '-'}</span>
                                )}
                            </div>
                            <WebProcessRow label="Tiempo Total" name="batter_time_min" unit="min" value={ensayo.batter_time_min} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Densidad Batido" name="batter_density_g_cm3" unit="g/cc" value={ensayo.batter_density_g_cm3} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                        </div>
                        <div>
                            <div className="mb-3 pb-1" style={{ borderBottom: '1px solid var(--border)' }}>
                                <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                    <Ruler size={14} /> Molde y Horneado
                                </h4>
                            </div>
                            <WebProcessRow label="Diámetro Molde" name="mold_diameter_cm" unit="cm" value={ensayo.mold_diameter_cm} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Temp. Horno" name="oven_temp_c" unit="°C" value={ensayo.oven_temp_c} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Peso Crudo" name="raw_weight_g" unit="g" value={ensayo.raw_weight_g} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                            <WebProcessRow label="Altura Horneado" name="baked_volume_height" unit="cm" value={ensayo.baked_volume_height} onChange={handleFieldChange} isEditing={isEditing} formData={formData} />
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
