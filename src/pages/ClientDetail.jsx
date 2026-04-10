import { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, User, Mail, MapPin, Phone, Briefcase, Map, ExternalLink, Activity, Loader2, Trash2, Plus } from 'lucide-react';

export default function ClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch(`${API_URL}/api/clients/${id}/`)
            .then(r => r.json())
            .then(d => {
                setClient(d);
                // Cargar contactos desde JSONField, si no existe inicializar con esquema v3.0
                setContacts(d.contacts_data && d.contacts_data.length > 0 ? d.contacts_data : [
                    { name: d.contact_name || '', position: d.position || 'Responsable', phone: d.phone || '', email: d.email || '' }
                ]);
                setLoading(false);
            })
            .catch(e => {
                console.error(e);
                setLoading(false);
            });
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        // Limpiamos contactos antes de guardar
        const cleanContacts = contacts.filter(c => c.name || c.email || c.phone);

        const payload = {
            ...client,
            contacts_data: cleanContacts,
            // Mantenemos legacy fields sincronizados con el primer contacto para compatibilidad
            contact_name: cleanContacts[0]?.name || '',
            position: cleanContacts[0]?.position || '',
            phone: cleanContacts[0]?.phone || '',
            email: cleanContacts[0]?.email || ''
        };

        try {
            const res = await fetch(`${API_URL}/api/clients/${id}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                alert('Expediente actualizado correctamente');
                navigate('/clients');
            } else {
                alert('Error en persistencia de datos');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Confirmar eliminación absoluta de esta cuenta?')) {
            try {
                const res = await fetch(`${API_URL}/api/clients/${id}/`, { method: 'DELETE' });
                if (res.ok) navigate('/clients');
            } catch (e) { console.error(e); }
        }
    };

    const handleClientChange = (e) => setClient({ ...client, [e.target.name]: e.target.value });

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const addContact = () => setContacts([...contacts, { name: '', position: '', phone: '', email: '' }]);
    const removeContact = (index) => {
        if (contacts.length <= 1) return alert("Debe existir al menos un contacto técnico.");
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const openGoogleMaps = () => {
        if (!client.address) return alert("Dirección no especificada.");
        const query = encodeURIComponent(client.address);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin mr-3" size={20} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono uppercase tracking-widest">Recuperando Expediente #{id}...</span>
        </div>
    );

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/clients" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={15} /> Volver a Cartera
                    </Link>
                    <div className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> Expediente de Cliente
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <div className="p-7 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>
                            <Building size={12} /> Expediente Maestro de Cliente
                        </div>
                        <h1 className="text-2xl font-bold text-white">{client.name}</h1>
                        <div className="flex items-center gap-3 mt-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${client.is_active !== false ? 'text-green-400' : 'text-red-400'}`}
                                style={{ background: client.is_active !== false ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${client.is_active !== false ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                {client.is_active !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                            </span>
                            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: 'var(--text-2)', border: '1px solid var(--border)' }}>UID: PRO-CL-{id}</span>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-2)' }}>
                                <MapPin size={13} /> Dirección de Planta
                            </label>
                            <div className="flex gap-2">
                                <input name="address" value={client.address || ''} onChange={handleClientChange}
                                    className="flex-1 px-4 py-3 rounded-lg text-sm outline-none"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                    placeholder="Dirección de planta..." />
                                <button onClick={openGoogleMaps} type="button"
                                    className="px-4 py-2.5 rounded-lg text-sm font-bold transition"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>G-Maps</button>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
                                    <User size={16} style={{ color: 'var(--accent)' }} /> Agenda de Contactos ({contacts.length})
                                </h3>
                                <button onClick={addContact} type="button"
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                    <Plus size={13} /> Agregar
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="rounded-lg p-4 relative"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-2)' }}>Contacto #{index + 1}</div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-2)', fontSize: '10px' }}>Cargo</label>
                                                <input value={contact.position} onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-bold outline-none"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                                    placeholder="Ej: Gerente de Calidad" />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-2)', fontSize: '10px' }}>Nombre</label>
                                                <input value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-bold outline-none"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-2)', fontSize: '10px' }}>Teléfono</label>
                                                    <input value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
                                                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-2)', fontSize: '10px' }}>Email</label>
                                                    <input value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                        className="w-full px-3 py-1.5 rounded-lg text-xs font-mono outline-none lowercase"
                                                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }} />
                                                </div>
                                            </div>
                                            {contacts.length > 1 && (
                                                <button onClick={() => removeContact(index)} type="button"
                                                    className="w-full py-1.5 rounded-lg text-xs font-bold transition hover:text-red-400"
                                                    style={{ border: '1px dashed var(--border)', color: 'var(--text-2)' }}>
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--border)' }}>
                            <button onClick={handleDelete} type="button"
                                className="flex items-center gap-2 text-xs font-bold transition hover:text-red-400"
                                style={{ color: 'var(--text-2)' }}>
                                <Trash2 size={14} /> Eliminar Cliente
                            </button>
                            <div className="flex gap-3">
                                <Link to="/clients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                    style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>Cancelar</Link>
                                <button onClick={handleSave} type="button" disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                                    style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    {saving ? 'Guardando...' : 'Actualizar Expediente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
