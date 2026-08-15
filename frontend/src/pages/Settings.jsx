import { useState, useEffect } from 'react';
import { Save, Building, DollarSign, Package, Activity, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { useToast } from '../components/ui/Toast';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

export default function Settings() {
    const { showSuccess } = useToast();
    const [config, setConfig] = useState({
        companyName: 'Asesoría Técnica Panadera',
        companyAddress: 'Av. Corrientes 1234, CABA',
        companyCuit: '30-12345678-9',
        defaultBagWeight: 25,
        hourlyRate: 5000,
        currency: '$',
        logoUrl: '',
        userName: 'Consultor'
    });

    useEffect(() => {
        const saved = localStorage.getItem('appSettings');
        if (saved) setConfig(JSON.parse(saved));
    }, []);

    const handleSave = (e) => {
        if (e) e.preventDefault();
        localStorage.setItem('appSettings', JSON.stringify(config));
        showSuccess('Configuración guardada correctamente');
    };

    const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

    const clearCache = () => {
        if (window.confirm('¿Desea restablecer los valores de fábrica? Esto no borrará datos del servidor.')) {
            localStorage.removeItem('appSettings');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">

                {/* Back / Header nav */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Volver al Inicio
                    </Link>
                    <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Nucleus Kernel Config v3.1
                    </div>
                </div>

                {/* Main Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-8 relative overflow-hidden flex justify-between items-center" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1"
                                style={{ color: 'var(--accent)' }}>
                                <Building size={12} /> Parámetros del Sistema
                            </div>
                            <h1 className="text-2xl font-bold text-white">Configuración Global</h1>
                            <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                                Identidad Corporativa y Parámetros de Operación Panadera
                            </p>
                        </div>
                        <button onClick={handleSave} type="button"
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                            style={{ background: 'var(--accent)', color: '#0f172a' }}>
                            <Save size={16} /> Guardar Cambios
                        </button>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* 1. SECCIÓN EMPRESA */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                                style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <Building size={16} style={{ color: 'var(--accent)' }} /> Identidad Corporativa
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField label="Nombre de la Empresa / Asesoría" icon={<Building size={13} />}>
                                    <input name="companyName" value={config.companyName} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg text-sm font-bold outline-none"
                                        style={inputStyle} />
                                </FormField>
                                <FormField label="CUIT / TAX ID">
                                    <input name="companyCuit" value={config.companyCuit} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg text-xs font-mono font-bold outline-none"
                                        style={inputStyle} />
                                </FormField>
                                <FormField label="Dirección Fiscal / Legal">
                                    <input name="companyAddress" value={config.companyAddress} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg text-sm outline-none"
                                        style={inputStyle} />
                                </FormField>
                                <FormField label="Nombre del Consultor / Usuario">
                                    <input name="userName" value={config.userName} onChange={handleChange} placeholder="Tu Nombre"
                                        className="w-full px-4 py-3 rounded-lg text-sm font-bold outline-none"
                                        style={inputStyle} />
                                </FormField>
                                <div className="md:col-span-2">
                                    <FormField label="URL del Logo (Opcional)">
                                        <input name="logoUrl" value={config.logoUrl} onChange={handleChange} placeholder="https://miempresa.com/logo.png"
                                            className="w-full px-4 py-3 rounded-lg text-xs font-mono outline-none"
                                            style={inputStyle} />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* 2. SECCIÓN OPERACIÓN Y PARÁMETROS */}
                        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2"
                                style={{ color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                                <DollarSign size={16} style={{ color: 'var(--accent)' }} /> Parámetros de Operación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <FormField label="Bolsa Estándar (Kg)" icon={<Package size={13} />}>
                                    <input type="number" name="defaultBagWeight" value={config.defaultBagWeight} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg font-mono text-lg font-bold outline-none"
                                        style={inputStyle} />
                                    <p className="text-[10px] mt-1 italic" style={{ color: 'var(--text-2)' }}>Usado para el cálculo de dosis por bolsa en reportes.</p>
                                </FormField>
                                <FormField label="Valor Hora de Asesoría">
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                                        <input type="number" name="hourlyRate" value={config.hourlyRate} onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-3 rounded-lg font-mono text-lg font-bold outline-none"
                                            style={inputStyle} />
                                    </div>
                                </FormField>
                                <FormField label="Divisa del Sistema">
                                    <select name="currency" value={config.currency} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg text-xs font-bold uppercase outline-none"
                                        style={inputStyle}>
                                        <option value="$">Peso Argentino ($)</option>
                                        <option value="USD">Dólar Estadounidense (USD)</option>
                                        <option value="€">Euro (€)</option>
                                        <option value="MXN">Peso Mexicano (MXN)</option>
                                        <option value="CLP">Peso Chileno (CLP)</option>
                                    </select>
                                </FormField>
                            </div>
                        </div>

                        {/* 3. ZONA DE PELIGRO */}
                        <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="rounded-lg p-5 flex justify-between items-center"
                                style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                                        <ShieldAlert size={14} /> Restablecer Valores de Fábrica
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
                                        Vuelve a los parámetros por defecto de la aplicación (no afecta datos de la base de datos).
                                    </p>
                                </div>
                                <button type="button" onClick={clearCache}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition">
                                    <Trash2 size={14} /> Restablecer
                                </button>
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <button type="button" onClick={handleSave}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
