import { useState } from 'react';
import useSWR from 'swr';
import { API_URL, fetcher } from '../config';
import { Link } from 'react-router-dom';
import { Plus, Search, Building, MapPin, User, Mail, Eye, Activity, Loader2 } from 'lucide-react';

export default function Clients() {
    const { data: clients, isLoading } = useSWR(`${API_URL}/api/clients/`, fetcher);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = (clients || []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact_name && c.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={40} style={{ color: 'var(--accent)' }} />
        </div>
    );

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }} className="p-8">
            <div className="max-w-7xl mx-auto">

                <header className="flex justify-between items-end mb-10 pb-6" style={{ borderBottom: '2px solid var(--border)' }}>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Building size={28} style={{ color: 'var(--accent)' }} /> Cartera de Clientes
                        </h1>
                        <p className="mt-1 text-sm" style={{ color: 'var(--text-2)' }}>Registro Centralizado de Cuentas y Agenda Técnica</p>
                    </div>
                    <Link
                        to="/clients/new"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition active:scale-95"
                        style={{ background: 'var(--accent)', color: '#0f172a' }}
                    >
                        <Plus size={16} /> Nuevo Cliente
                    </Link>
                </header>

                <div className="mb-8 relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={15}
                        style={{ color: 'var(--text-2)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por Razón Social, Contacto o Email..."
                        className="w-full pl-11 pr-4 py-3 rounded-lg text-sm outline-none transition-all"
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <table className="w-full text-left border-collapse">
                        <thead style={{ background: '#0f172a', borderBottom: '1px solid var(--border)' }}>
                            <tr className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-2)' }}>
                                <th className="px-6 py-3">Razón Social</th>
                                <th className="px-4 py-3">Ubicación</th>
                                <th className="px-4 py-3">Contacto</th>
                                <th className="px-4 py-3 text-center">Estado</th>
                                <th className="px-4 py-3 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-16 text-center italic text-sm"
                                        style={{ color: 'var(--text-2)' }}>No se identificaron registros</td>
                                </tr>
                            ) : (
                                filteredClients.map((client, i) => (
                                    <tr key={client.id}
                                        style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(37,51,71,0.3)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}
                                        className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-3">
                                            <Link to={`/clients/${client.id}`}
                                                className="font-bold text-sm hover:underline transition"
                                                style={{ color: 'var(--accent)' }}>
                                                {client.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 text-xs italic max-w-xs truncate"
                                            style={{ color: 'var(--text-2)' }}>
                                            {client.address || <span className="opacity-40">S/R</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-white">{client.contact_name || '—'}</div>
                                            {client.email && (
                                                <div className="text-xs mt-0.5 flex items-center gap-1 font-mono" style={{ color: 'var(--text-2)' }}>
                                                    <Mail size={10} /> {client.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                                                style={client.is_active !== false
                                                    ? { background: 'rgba(20,83,45,0.8)', color: '#4ade80' }
                                                    : { background: 'rgba(51,65,85,0.5)', color: '#94a3b8' }}>
                                                {client.is_active !== false ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link to={`/clients/${client.id}`}
                                                className="text-xs font-bold px-3 py-1.5 rounded-lg transition"
                                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                                Ver Dossier
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    <div className="p-4 flex justify-between text-xs font-mono"
                        style={{ background: '#0f172a', borderTop: '1px solid var(--border)', color: 'var(--text-2)' }}>
                        <span>Sistema activo</span>
                        <span>Total: {filteredClients.length} clientes</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
