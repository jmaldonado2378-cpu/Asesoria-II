import * as XLSX from 'xlsx';

export default function SheetsExportButton({ ensayo, detailsData, evalData }) {
    const handleExport = () => {
        // Create workbook with 4 sheets:
        // 1. Formulación (ingredients table)
        // 2. Análisis Reológico (lab fields)
        // 3. Proceso (baking params)
        // 4. Evaluación (scores)
        
        const wb = XLSX.utils.book_new();
        
        // Sheet 1: Formulación
        const formData = detailsData.map(d => ({
            'Ingrediente': d.ingredient_name,
            'Peso (g)': parseFloat(d.quantity_grams || 0),
            '% Panadero': parseFloat(d.panadero_pct || 0),
            'PPM': parseFloat(d.ppm_calc || 0),
            'Dosis/25kg (g)': parseFloat(d.dosis_25kg || 0),
            '$/Kg': parseFloat(d.price_per_kg || 0),
            'Subtotal': parseFloat(d.quantity || 0) * parseFloat(d.price_per_kg || 0),
        }));
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(formData), 'Formulación');
        
        // Sheet 2: Análisis Reológico
        const labData = [
            { Campo: 'Humedad', Valor: ensayo.humidity_pct, Unidad: '%' },
            { Campo: 'Cenizas', Valor: ensayo.ash_pct, Unidad: '%' },
            { Campo: 'Proteínas', Valor: ensayo.protein_pct, Unidad: '%' },
            { Campo: 'Gluten Húmedo', Valor: ensayo.gluten_wet_pct, Unidad: '%' },
            { Campo: 'Gluten Seco', Valor: ensayo.gluten_dry_pct, Unidad: '%' },
            { Campo: 'Gluten Index', Valor: ensayo.gluten_index_pct, Unidad: '%' },
            { Campo: 'W (Fuerza)', Valor: ensayo.w_value, Unidad: 'J×10⁻⁴' },
            { Campo: 'P (Tenacidad)', Valor: ensayo.p_value, Unidad: 'mm' },
            { Campo: 'L (Extensibilidad)', Valor: ensayo.l_value, Unidad: 'mm' },
            { Campo: 'P/L', Valor: ensayo.pl_ratio, Unidad: '' },
            { Campo: 'Falling Number', Valor: ensayo.falling_number_sec, Unidad: 's' },
            { Campo: 'Absorción Agua', Valor: ensayo.water_absorption_pct, Unidad: '%' },
            { Campo: 'Tiempo Desarrollo', Valor: ensayo.development_time_min, Unidad: 'min' },
            { Campo: 'Estabilidad', Valor: ensayo.stability_min, Unidad: 'min' },
            { Campo: 'Zeleny', Valor: ensayo.zeleny_ml, Unidad: 'ml' },
            { Campo: 'Daño Almidón', Valor: ensayo.starch_damage_pct, Unidad: '%' },
            { Campo: 'Granulometría', Valor: ensayo.granulometry_pct, Unidad: '%' },
            { Campo: 'Color L*', Valor: ensayo.color_l, Unidad: '' },
            { Campo: 'Color a*', Valor: ensayo.color_a, Unidad: '' },
            { Campo: 'Color b*', Valor: ensayo.color_b, Unidad: '' },
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(labData), 'Análisis Reológico');
        
        // Sheet 3: Proceso
        const processData = ensayo.baking_type === 'Batido' ? [
            { Parámetro: 'Velocidad Batido', Valor: ensayo.batter_speed, Unidad: '' },
            { Parámetro: 'Tiempo Batido', Valor: ensayo.batter_time_min, Unidad: 'min' },
            { Parámetro: 'Densidad Batido', Valor: ensayo.batter_density_g_cm3, Unidad: 'g/cm³' },
            { Parámetro: 'Diámetro Molde', Valor: ensayo.mold_diameter_cm, Unidad: 'cm' },
            { Parámetro: 'Peso Crudo', Valor: ensayo.raw_weight_g, Unidad: 'g' },
            { Parámetro: 'Peso Horneado', Valor: ensayo.baked_weight_g, Unidad: 'g' },
            { Parámetro: 'Altura', Valor: ensayo.baked_volume_height, Unidad: 'cm' },
        ] : [
            { Parámetro: 'Amasado Vel. 1', Valor: ensayo.kneading_time_v1_min, Unidad: 'min' },
            { Parámetro: 'Amasado Vel. 2', Valor: ensayo.kneading_time_v2_min, Unidad: 'min' },
            { Parámetro: 'Temp. Masa', Valor: ensayo.kneading_temp_c, Unidad: '°C' },
            { Parámetro: 'Vueltas Sobado', Valor: ensayo.sobado_turns, Unidad: '' },
            { Parámetro: 'Peso Pieza', Valor: ensayo.piece_weight_g, Unidad: 'g' },
            { Parámetro: 'Tiempo Fermentación', Valor: ensayo.fermentation_time_min, Unidad: 'min' },
            { Parámetro: 'Temp. Cámara', Valor: ensayo.fermentation_temp_c, Unidad: '°C' },
            { Parámetro: 'Humedad Cámara', Valor: ensayo.fermentation_humidity_pct, Unidad: '%' },
            { Parámetro: 'Temp. Horno', Valor: ensayo.oven_temp_c, Unidad: '°C' },
            { Parámetro: 'Tiempo Horno', Valor: ensayo.oven_time_min, Unidad: 'min' },
            { Parámetro: 'Greñado', Valor: ensayo.scoring_score, Unidad: 'pts' },
            { Parámetro: 'Volumen Final', Valor: ensayo.final_volume_cc, Unidad: 'cc' },
            { Parámetro: 'Peso Final', Valor: ensayo.final_weight_g, Unidad: 'g' },
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processData), 'Proceso');
        
        // Sheet 4: Evaluación
        if (evalData && Object.keys(evalData).length > 0) {
            const evalRows = [];
            Object.entries(evalData).forEach(([cat, items]) => {
                items.forEach(item => {
                    if (item.active) {
                        evalRows.push({ Categoría: cat, Criterio: item.name, Puntaje: item.score || '-' });
                    }
                });
            });
            if (evalRows.length > 0) {
                XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(evalRows), 'Evaluación');
            }
        }
        
        XLSX.writeFile(wb, `Ensayo_${ensayo.code || ensayo.id}_Planilla.xlsx`);
    };
    
    return (
        <button onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition hover:opacity-80"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
            title="Exportar a Google Sheets (.xlsx)">
            📊 Exportar Planilla
        </button>
    );
}
