import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Building, MapPin, User, Mail, Eye, Activity, Loader2 } from 'lucide-react';

export default function Clients() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/clients/`)
            .then(res => res.json())
            .then(data => { setClients(data); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact_name && c.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-orange-600" size={40} />
        </div>
    );

    return (
        <div className="p-8 bg-slate-100 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* HEADER INDUSTRIAL */}
                <header className="flex justify-between items-end mb-10 border-b-2 border-slate-200 pb-6">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-slate-900 flex items-center gap-3 uppercase tracking-tighter leading-none">
                            <Building className="text-orange-600" size={32} /> Cartera de Clientes
                        </h1>
                        <p className="text-slate-500 mt-2 font-mono text-[10px] uppercase font-bold tracking-[0.2em]">Registro Centralizado de Cuentas y Agenda Técnica</p>
                    </div>
                    <Link
                        to="/clients/new"
                        className="bg-slate-900 text-white px-8 py-3.5 rounded-sm shadow-xl hover:bg-slate-800 transition transform active:scale-95 font-bold text-xs uppercase tracking-widest flex items-center gap-2 border border-slate-700"
                    >
                        <Plus size={18} /> Nuevo Cliente
                    </Link>
                </header>

                {/* BUSCADOR INDUSTRIAL */}
                <div className="mb-8 relative max-w-xl group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por Razón Social, Contacto o Email..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-sm shadow-sm outline-none focus:border-orange-600 focus:ring-4 focus:ring-orange-50 transition-all font-bold text-sm text-slate-700 placeholder:text-slate-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* TABLA DE CLIENTES TÉCNICA */}
                <div className="bg-white shadow-2xl rounded-sm border border-slate-300 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b-2 border-slate-200">
                            <tr>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><Building size={12} /> Razón Social</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><MapPin size={12} /> Ubicación de Planta</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100">
                                    <div className="flex items-center gap-2"><User size={12} /> Contacto Principal</div>
                                </th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 border-r border-slate-100 text-center">Estado</th>
                                <th className="p-4 text-[10px] uppercase tracking-widest font-black text-slate-500 text-right text-slate-400">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-20 text-center text-slate-400 font-mono text-xs uppercase tracking-[0.2em]">No se identificaron registros en el sistema</td>
                                </tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="hover:bg-orange-50/30 transition-colors group">
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <Link to={`/clients/${client.id}`} className="text-base font-serif font-black text-slate-900 uppercase tracking-tighter group-hover:text-orange-600 transition-colors">
                                                    {client.name}
                                                </Link>
                                                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">ID: PRO-CL-{client.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50 max-w-xs">
                                            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 truncate italic">
                                                {client.address || <span className="text-slate-300 font-normal">S/R - Revisar Expediente</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{client.contact_name || '--'}</span>
                                                {client.email && (
                                                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 font-mono italic">
                                                        <Mail size={12} className="text-slate-300" /> {client.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-r border-slate-50 text-center">
                                            <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border shadow-sm ${client.is_active !== false
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-slate-50 text-slate-400 border-slate-200'
                                                }`}>
                                                {client.is_active !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                to={`/clients/${client.id}`}
                                                className="bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white px-5 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition flex items-center gap-2 w-fit ml-auto border border-slate-200 group-hover:border-slate-900 shadow-sm shadow-slate-100"
                                            >
                                                <Eye size={14} /> Gestionar Dossier
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* FOOTER INDUSTRIAL */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Activity size={14} className="animate-pulse text-orange-500" /> Database Link: PRO-SYNC
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Registros Identificados: {filteredClients.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
