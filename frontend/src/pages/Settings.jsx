import { useState, useEffect } from 'react';
import { Save, Building, Settings as SettingsIcon, DollarSign, Package, Activity, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Settings() {
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

    const handleSave = () => {
        localStorage.setItem('appSettings', JSON.stringify(config));
        alert('Configuración guardada correctamente. Los reportes y cálculos ahora usarán estos parámetros.');
    };

    const handleChange = (e) => setConfig({ ...config, [e.target.name]: e.target.value });

    const clearCache = () => {
        if (window.confirm('¿Desea restablecer los valores de fábrica? Esto no borrará datos del servidor.')) {
            localStorage.removeItem('appSettings');
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 pl-28 flex flex-col items-center">
            <div className="w-full max-w-4xl">

                <header className="mb-10 flex justify-between items-end border-b-2 border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-orange-600 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                            <Activity size={14} /> Nucleus Kernel Config v3.1
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">Configuración <span className="text-orange-600">Global</span></h1>
                    </div>
                    <button onClick={handleSave} className="bg-slate-900 text-white px-8 py-3.5 rounded-sm shadow-xl hover:bg-orange-600 transition transform active:scale-95 font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700">
                        <Save size={18} /> Guardar Cambios
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* LADO IZQ: NAVEGACIÓN RÁPIDA / INFO */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-sm shadow-xl border border-slate-300">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Estado del Sistema</h3>
                            <div className="space-y-4 font-mono">
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">Versión Entorno</span>
                                    <span className="text-slate-900 font-bold">Stable 3.1.0</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">Modo Reportes</span>
                                    <span className="text-green-600 font-bold uppercase tracking-tight">Optimizado A4</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-500 uppercase">Persistencia</span>
                                    <span className="text-orange-600 font-bold underline">LocalStorage</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 p-6 rounded-sm shadow-xl border border-slate-800 text-white group cursor-pointer overflow-hidden relative" onClick={clearCache}>
                            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform">
                                <Trash2 size={80} />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Zona de Peligro</h3>
                            <p className="text-[10px] font-bold uppercase text-slate-100 group-hover:text-red-400 transition-colors">Restablecer Aplicación</p>
                            <p className="text-[9px] text-slate-400 mt-2 font-medium italic">Vuelve a los valores por defecto del sistema.</p>
                        </div>
                    </div>

                    {/* CENTRO/DER: FORMULARIO */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                            <div className="p-10 space-y-10">
                                {/* SECCIÓN EMPRESA */}
                                <section className="space-y-6">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                        <Building size={16} className="text-orange-600" /> Identidad Corporativa
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre de la Empresa / Asesoría</label>
                                            <input name="companyName" value={config.companyName} onChange={handleChange} className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-bold text-sm outline-none focus:border-orange-600 shadow-inner" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">CUIT / TAX ID</label>
                                                <input name="companyCuit" value={config.companyCuit} onChange={handleChange} className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-mono text-xs font-bold outline-none focus:border-orange-600 shadow-inner" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Dirección Fiscal / Legal</label>
                                                <input name="companyAddress" value={config.companyAddress} onChange={handleChange} className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-bold text-sm outline-none focus:border-orange-600 shadow-inner" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del Consultor / Usuario (Encabezado)</label>
                                            <input name="userName" value={config.userName} onChange={handleChange} placeholder="Tu Nombre" className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-bold text-sm outline-none focus:border-orange-600 shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">URL del Logo (Opcional)</label>
                                            <input name="logoUrl" value={config.logoUrl} onChange={handleChange} placeholder="https://miempresa.com/logo.png" className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-mono text-[10px] outline-none focus:border-orange-600 shadow-inner" />
                                        </div>
                                    </div>
                                </section>

                                {/* SECCIÓN TÉCNICA Y MONETARIA */}
                                <section className="space-y-6 pt-6">
                                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 border-b-2 border-slate-100 pb-4">
                                        <DollarSign size={16} className="text-orange-600" /> Parámetros de Operación
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                                                <Package size={14} className="text-slate-300" /> Bolsa Estándar (Kg)
                                            </label>
                                            <input type="number" name="defaultBagWeight" value={config.defaultBagWeight} onChange={handleChange} className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-mono text-lg font-black outline-none focus:border-orange-600 shadow-inner" />
                                            <p className="text-[9px] text-slate-400 mt-2 italic font-medium">Usado para el cálculo de dosis por bolsa en reportes.</p>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor Hora de Asesoría</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-300">$</span>
                                                    <input type="number" name="hourlyRate" value={config.hourlyRate} onChange={handleChange} className="w-full p-4 pl-10 border border-slate-200 bg-slate-50 rounded-sm font-mono text-lg font-black outline-none focus:border-orange-600 shadow-inner" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Divisa del Sistema</label>
                                                <select name="currency" value={config.currency} onChange={handleChange} className="w-full p-4 border border-slate-200 bg-slate-50 rounded-sm font-black text-xs uppercase tracking-widest outline-none focus:border-orange-600 shadow-inner">
                                                    <option value="$">Peso Argentino ($)</option>
                                                    <option value="USD">Dólar Estadounidense (USD)</option>
                                                    <option value="€">Euro (€)</option>
                                                    <option value="MXN">Peso Mexicano (MXN)</option>
                                                    <option value="CLP">Peso Chileno (CLP)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
