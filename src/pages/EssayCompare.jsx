import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Trophy, Printer, AlertTriangle, Award, Square } from 'lucide-react';

const COMPARE_FIELDS = [
    {
        section: 'Laboratorio', fields: [
            { k: 'humidity_pct', l: 'Humedad', u: '%' },
            { k: 'protein_pct', l: 'Proteínas', u: '%' },
            { k: 'gluten_wet_pct', l: 'Gluten Húmedo', u: '%' },
            { k: 'w_value', l: 'Fuerza (W)', u: '' },
            { k: 'pl_ratio', l: 'Relación P/L', u: '' },
            { k: 'falling_number_sec', l: 'Falling Number', u: 's' },
            { k: 'stability_min', l: 'Estabilidad', u: 'min' },
            { k: 'water_absorption_pct', l: 'Absorción', u: '%' },
        ]
    },
    {
        section: 'Proceso', fields: [
            { k: 'kneading_time_v1_min', l: 'Amasado V1', u: 'min' },
            { k: 'kneading_time_v2_min', l: 'Amasado V2', u: 'min' },
            { k: 'kneading_temp_c', l: 'Temp. Masa', u: '°C' },
            { k: 'fermentation_time_min', l: 'Fermentación', u: 'min' },
            { k: 'oven_temp_c', l: 'Temp. Horno', u: '°C' },
            { k: 'oven_time_min', l: 'Tiempo Horno', u: 'min' },
        ]
    },
    {
        section: 'Resultados', fields: [
            { k: 'final_volume_cc', l: 'Volumen Final', u: 'cc' },
            { k: 'final_weight_g', l: 'Peso Pan', u: 'g' },
            { k: 'scoring_score', l: 'Greñado', u: '/10' },
        ]
    }
];

export default function EssayCompare() {
    const [searchParams] = useSearchParams();
    const [essays, setEssays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uniqueIngredients, setUniqueIngredients] = useState([]);

    useEffect(() => {
        const ids = searchParams.get('ids')?.split(',') || [];
        if (ids.length === 0) { setLoading(false); return; }

        Promise.all(ids.map(id =>
            fetch(`${API_URL}/api/ensayos/${id}/`).then(r => {
                if (!r.ok) throw new Error('Error al cargar ensayo');
                return r.json();
            })
        ))
            .then(data => {
                setEssays(data);
                const allIngs = new Set();
                data.forEach(e => e.details?.forEach(d => allIngs.add(d.ingredient_name))); // Optional chaining vital
                setUniqueIngredients(Array.from(allIngs).sort());
            })
            .catch(err => console.error("Error en comparativa:", err))
            .finally(() => setLoading(false)); // Siempre quitar loading
    }, [searchParams]);

    const handlePrint = () => window.print();

    if (loading) return <div className="p-10 text-center font-mono animate-pulse uppercase tracking-widest text-slate-400">Cargando comparativa técnica...</div>;
    if (essays.length < 2) return <div className="p-10 text-center text-red-500 flex flex-col items-center"><AlertTriangle size={48} className="mb-2 text-red-400 font-bold uppercase tracking-widest text-sm" />Se necesitan al menos 2 ensayos válidos para comparar.</div>;

    // Calcular mejor score para resaltar
    const maxScore = Math.max(...essays.map(e => parseFloat(e.final_score || 0)));

    return (
        <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:bg-white print:p-0">

            {/* Estilos Impresión */}
            <style>{`
        @media print { 
            @page { size: landscape; margin: 10mm; } 
            body * { visibility: hidden; } 
            .printable-area, .printable-area * { visibility: visible; } 
            .printable-area { position: absolute; left: 0; top: 0; width: 100%; display: block !important; } 
            .no-print { display: none; } 
            body { background-color: white !important; }
        }
      `}</style>

            <div className="printable-area max-w-full mx-auto">
                <div className="mb-6 flex justify-between items-center no-print px-4">
                    <div className="flex items-center gap-4">
                        <Link to={-1} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition group">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Volver
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tighter">
                            <GitCompare className="text-indigo-600" size={24} /> Comparativa Técnica
                        </h1>
                    </div>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded shadow-lg hover:bg-slate-950 transition active:scale-95 font-bold text-xs uppercase tracking-widest">
                        <Printer size={18} /> Imprimir Comparativa
                    </button>
                </div>

                {/* HEADER IMPRESIÓN (Estandarizado Premium) */}
                <div className="hidden print:block mb-8 relative border-b-4 border-slate-900 pb-6">
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>
                    <div className="flex justify-between items-center pt-4">
                        <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-sm">
                                <GitCompare size={32} className="text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 uppercase tracking-tighter leading-none">
                                    Matriz Comparativa<br />
                                    <span className="text-indigo-600 text-2xl">Laboratorio de Calidad</span>
                                </h1>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 italic">Reporte Industrial Multivariable</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Copia Controlada I+D</div>
                            <div className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-sm border border-slate-200">
                                EMISIÓN: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-sm shadow-xl border border-slate-300 overflow-x-auto print:shadow-none print:border-none">
                    <table className="w-full text-sm text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-widest border-b border-slate-700">
                                <th className="p-4 w-56 sticky left-0 bg-slate-950 z-20 border-r border-slate-800 text-slate-400 print:static print:bg-white print:border-slate-300 print:text-slate-900 font-bold">Parámetros Críticos</th>
                                {essays.map(e => (
                                    <th key={e.id} className={`p-5 min-w-[200px] text-center border-r border-slate-800 align-top transition-colors ${parseFloat(e.final_score) === maxScore ? 'bg-indigo-950 print:bg-slate-100' : 'bg-slate-900 print:bg-white'}`}>
                                        <div className="text-[9px] text-slate-500 font-mono mb-1">{e.date}</div>
                                        <div className="text-lg font-bold text-white print:text-black mb-1 tracking-tight uppercase">{e.code || `ENS-${e.id}`}</div>
                                        <span className="px-2 py-0.5 rounded-sm text-[8px] uppercase font-bold border border-slate-700 print:border-slate-300 text-slate-400 print:text-slate-600 inline-block mb-3 tracking-widest">
                                            {e.baking_type}
                                        </span>
                                        <div className="mb-2"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 print:divide-slate-300 font-medium overflow-visible">

                            {/* SCORE FINAL */}
                            <tr className="bg-slate-50 font-bold print:bg-slate-100 border-b-2 border-slate-200">
                                <td className="p-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-300 text-slate-900 uppercase tracking-tighter text-sm print:static print:bg-transparent">PUNTAJE GLOBAL</td>
                                {essays.map(e => (
                                    <td key={e.id} className="p-4 text-center text-3xl border-r border-slate-200 print:border-slate-300">
                                        {e.final_score ? (
                                            <div className="flex flex-col items-center">
                                                <span className={parseFloat(e.final_score) >= 8 ? 'text-green-600' : 'text-orange-600 print:text-black'}>{e.final_score}</span>
                                                <span className="text-[10px] text-slate-300 uppercase tracking-tighter -mt-1 font-sans font-normal font-bold">/ 10</span>
                                            </div>
                                        ) : <span className="text-slate-200">-</span>}
                                    </td>
                                ))}
                            </tr>

                            {/* FORMULACIÓN DINÁMICA */}
                            <tr><td colSpan={essays.length + 1} className="bg-slate-800 text-slate-400 px-6 py-2 text-[10px] font-bold uppercase tracking-widest print:bg-slate-100 print:text-slate-900 print:border-y print:border-slate-300">Composición Industrial (% Panadero)</td></tr>
                            {uniqueIngredients.map(ingName => (
                                <tr key={ingName} className="hover:bg-slate-50 print:border-b print:border-slate-100 transition-colors">
                                    <td className="p-2.5 pl-8 sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-tight truncate print:static print:border-r-0" title={ingName}>{ingName}</td>
                                    {essays.map(e => {
                                        const detail = e.details?.find(d => d.ingredient_name === ingName);
                                        return (
                                            <td key={e.id} className="p-2.5 text-center border-r border-slate-100 font-mono text-slate-800 text-xs print:border-slate-200 print:text-black">
                                                {detail ? <span className="font-bold">{parseFloat(detail.panadero_pct).toFixed(4)}%</span> : <span className="text-slate-200">-</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* SECCIONES FIJAS */}
                            {COMPARE_FIELDS.map(section => (
                                <React.Fragment key={section.section}>
                                    <tr><td colSpan={essays.length + 1} className="bg-slate-800 text-slate-400 px-6 py-2 text-[10px] font-bold uppercase tracking-widest print:bg-slate-100 print:text-slate-900 print:border-y print:border-slate-300">{section.section}</td></tr>
                                    {section.fields.map(field => (
                                        <tr key={field.k} className="hover:bg-slate-50 print:border-b print:border-slate-100 transition-colors">
                                            <td className="p-2.5 pl-8 sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-tighter print:static print:border-r-0">{field.l}</td>
                                            {essays.map(e => (
                                                <td key={e.id} className="p-2.5 text-center border-r border-slate-100 font-mono font-bold text-slate-900 text-xs print:border-slate-200 print:text-black">
                                                    {e[field.k] !== null && e[field.k] !== undefined ? (
                                                        <div className="flex items-baseline justify-center gap-1">
                                                            <span>{e[field.k]}</span>
                                                            <span className="text-[9px] text-slate-400 font-normal uppercase">{field.u}</span>
                                                        </div>
                                                    ) : <span className="text-slate-200">-</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}

                            {/* EVALUACIÓN SENSORIAL */}
                            <tr><td colSpan={essays.length + 1} className="bg-slate-800 text-slate-400 px-6 py-2 text-[10px] font-bold uppercase tracking-widest print:bg-slate-100 print:text-slate-900 print:border-y print:border-slate-300">Evaluación Sensorial Seleccionada</td></tr>
                            {['Volumen', 'Corteza', 'Color Miga', 'Alveolado'].map(itemLabel => (
                                <tr key={itemLabel} className="hover:bg-slate-50 print:border-b print:border-slate-100 transition-colors">
                                    <td className="p-2.5 pl-8 sticky left-0 bg-white z-10 border-r border-slate-200 text-slate-600 font-medium text-[11px] uppercase tracking-tighter print:static print:border-r-0">{itemLabel}</td>
                                    {essays.map(e => {
                                        let score = '-';
                                        if (e.evaluation_data) {
                                            Object.values(e.evaluation_data).forEach(items => {
                                                const found = items.find(i => i.name === itemLabel);
                                                if (found && found.active) score = found.score;
                                            });
                                        }
                                        return (
                                            <td key={e.id} className="p-2.5 text-center border-r border-slate-100 font-mono font-bold text-slate-900 text-xs print:border-slate-200 print:text-black">
                                                {score !== '-' ? (
                                                    <div className="flex items-baseline justify-center gap-1">
                                                        <span>{score}</span>
                                                        <span className="text-[8px] text-slate-400 font-normal uppercase">pts</span>
                                                    </div>
                                                ) : <span className="text-slate-200">-</span>}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* CONCLUSIONES TÉCNICAS (Separadas para legibilidad en impresión) */}
                <div className="mt-8 bg-white border border-slate-300 p-6 rounded-sm shadow-inner print:border-black print:mt-10">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 border-b pb-2 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-indigo-600 no-print" /> Decisiones Técnicas y Conclusiones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {essays.map(e => (
                            <div key={e.id} className={`p-4 rounded border ${parseFloat(e.final_score) === maxScore ? 'bg-indigo-50/30 border-indigo-200' : 'bg-slate-50 border-slate-200'} print:bg-white print:border-slate-300`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">{e.code || `ENS-${e.id}`}</span>
                                    <span className="text-[9px] font-mono text-slate-400">{e.date}</span>
                                </div>
                                <p className="text-[11px] leading-relaxed italic text-slate-700 font-medium">
                                    {e.conclusion || 'Sin conclusiones técnicas registradas.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FOOTER COPIA CONTROLADA (Estandarizado) */}
                <div className="mt-12 border-t border-slate-300 py-6 flex justify-between text-[8px] text-slate-400 items-center font-bold uppercase tracking-widest print:mt-10 print:border-slate-800">
                    <div className="flex items-center gap-4">
                        <span className="text-slate-900">AsesoríaApp v2.0</span>
                        <span className="text-slate-300">/</span>
                        <span>Laboratorio Molinero I+D</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <span className="flex items-center gap-1.5 text-indigo-600">
                            <Square size={6} className="fill-indigo-600" /> Copia Controlada
                        </span>
                        <span className="text-slate-300">/</span>
                        <span>Identificativo de Calidad Nivel 4</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-mono">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
