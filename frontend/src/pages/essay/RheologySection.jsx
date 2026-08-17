import React, { useState, useRef, useEffect } from 'react';
import { FileText, Settings, CheckSquare, Square } from 'lucide-react';
import { WebProcessRow } from './FormulationTable';

const LAB_FIELDS = [
    { key: 'humidity_pct', label: 'Humedad', unit: '%' },
    { key: 'ash_pct', label: 'Cenizas', unit: '%' },
    { key: 'protein_pct', label: 'Proteínas', unit: '%' },
    { key: 'gluten_wet_pct', label: 'Gluten Húmedo', unit: '%' },
    { key: 'gluten_dry_pct', label: 'Gluten Seco', unit: '%' },
    { key: 'gluten_index_pct', label: 'Gluten Index', unit: '' },
    { key: 'falling_number_sec', label: 'Falling Number', unit: 's' },
    { key: 'w_value', label: 'W (Fuerza)', unit: '' },
    { key: 'pl_ratio', label: 'Relación P/L', unit: '' },
    { key: 'p_value', label: 'Tenacidad (P)', unit: '' },
    { key: 'l_value', label: 'Extensibilidad (L)', unit: 'mm' },
    { key: 'water_absorption_pct', label: 'Absorción Agua', unit: '%' },
    { key: 'stability_min', label: 'Estabilidad', unit: 'min' },
    { key: 'development_time_min', label: 'Desarrollo', unit: 'min' },
    { key: 'starch_damage_pct', label: 'Daño Almidón', unit: '%' },
    { key: 'zeleny_ml', label: 'Zeleny', unit: 'ml' },
    { key: 'color_l', label: 'Color L* (Luz)', unit: '' },
    { key: 'color_a', label: 'Color a* (Rojo/Verde)', unit: '' },
    { key: 'color_b', label: 'Color b* (Amarillo/Azul)', unit: '' },
];

export default function RheologySection({
    ensayo,
    formData,
    isEditing,
    visibleFields,
    toggleField,
    handleFieldChange,
    fmt
}) {
    const [showFieldSelector, setShowFieldSelector] = useState(false);
    const selectorRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target)) {
                setShowFieldSelector(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <section>
            <div className="flex justify-between items-center pb-2 mb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-1)' }}>
                    <FileText size={16} /> Análisis Reológico
                </h3>
                <div className="relative" ref={selectorRef}>
                    <button onClick={() => setShowFieldSelector(!showFieldSelector)} className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded hover:opacity-80 transition" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                        <Settings size={14} /> Configurar ({visibleFields.length})
                    </button>
                    {showFieldSelector && (
                        <div className="absolute right-0 top-full mt-2 w-64 shadow-xl rounded-lg z-50 p-2 max-h-80 overflow-y-auto" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                            <div className="text-xs font-bold px-2 py-1 uppercase mb-1" style={{ color: 'var(--text-2)' }}>Campos</div>
                            {LAB_FIELDS.map(f => (
                                <div key={f.key} onClick={() => toggleField(f.key)} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded text-sm" style={{ color: 'var(--text-1)' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    {visibleFields.includes(f.key) ? <CheckSquare size={16} style={{ color: 'var(--accent)' }} /> : <Square size={16} />} {f.label}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="rounded-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                {visibleFields.map((fieldKey) => {
                    const fieldDef = LAB_FIELDS.find(f => f.key === fieldKey);
                    if (!fieldDef) return null;
                    return (
                        <WebProcessRow
                            key={fieldKey}
                            label={fieldDef.label}
                            name={fieldKey}
                            unit={fieldDef.unit}
                            value={ensayo[fieldKey]}
                            onChange={handleFieldChange}
                            isEditing={isEditing}
                            formData={formData}
                        />
                    );
                })}
            </div>
        </section>
    );
}
