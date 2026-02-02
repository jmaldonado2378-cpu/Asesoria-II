import { useState, useEffect } from 'react';
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
        fetch(`${import.meta.env.VITE_API_URL}/api/clients/${id}/`)
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
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${id}/`, {
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
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/clients/${id}/`, { method: 'DELETE' });
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
        <div className="min-h-screen bg-slate-100 p-8 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400">
            <Loader2 className="animate-spin mr-3 text-orange-600" size={20} /> Recuperando Expediente #ID-{id}...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center font-sans">
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/clients" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Cartera
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> Gestión Avanzada de Cuentas v3.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    {/* HEADER INDUSTRIAL */}
                    <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                                    <Building size={12} /> Expediente Maestro de Cliente
                                </div>
                                <h1 className="text-4xl font-serif font-black text-white leading-none uppercase tracking-tighter">{client.name}</h1>
                                <div className="flex items-center gap-4 mt-6">
                                    <span className={`px-3 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border-2 ${client.is_active !== false ? 'bg-green-600/10 text-green-400 border-green-600/20' : 'bg-red-600/10 text-red-400 border-red-600/20'}`}>
                                        {client.is_active !== false ? 'Cuenta Activa' : 'Cuenta Inactiva'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest bg-slate-800 px-3 py-1 border border-slate-700 rounded-sm italic">UID: PRO-CL-{id}</span>
                                </div>
                            </div>
                            <div className="bg-white p-4 shadow-2xl transform rotate-2 border-2 border-slate-200">
                                <Building size={48} className="text-slate-900" />
                            </div>
                        </div>
                        <Building size={120} className="text-slate-800 absolute -right-10 -bottom-10 opacity-30 pointer-events-none" />
                    </div>

                    <div className="p-10 space-y-12">

                        {/* SECCIÓN GEOLOCALIZACIÓN */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex gap-2 items-center">
                                    <MapPin size={14} className="text-orange-600" /> Dirección de Planta / Oficina Central
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        name="address"
                                        value={client.address || ''}
                                        onChange={handleClientChange}
                                        className="flex-1 p-4 border border-slate-200 rounded-sm focus:border-orange-600 outline-none bg-slate-50 font-bold text-sm transition focus:bg-white shadow-inner uppercase tracking-tight"
                                        placeholder="Cargar dirección para activar mapa..."
                                    />
                                    <button
                                        onClick={openGoogleMaps}
                                        className="bg-slate-900 text-white px-8 rounded-sm border border-slate-800 hover:bg-orange-600 transition flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95"
                                        title="Abrir en Google Maps"
                                    >
                                        <Map size={20} className="text-orange-400" /> G-MAPS
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">CUIT / VAT Number</label>
                                <input
                                    name="cuit"
                                    value={client.cuit || ''}
                                    onChange={handleClientChange}
                                    className="w-full p-4 border border-slate-200 rounded-sm outline-none focus:border-orange-600 font-mono font-black text-sm bg-white shadow-sm"
                                    placeholder="XX-XXXXXXXX-X"
                                />
                            </div>
                        </div>

                        {/* SECCIÓN ESTRATÉGICA: CONTACTOS */}
                        <div className="border-t-2 border-slate-100 pt-10">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex gap-3 items-center">
                                        <User size={20} className="text-orange-600" /> Agenda de Contactos ({contacts.length})
                                    </h3>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Responsables de Área y Comunicación Técnica</p>
                                </div>
                                <button
                                    onClick={addContact}
                                    className="bg-orange-50 text-orange-600 px-6 py-2.5 border border-orange-200 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition flex items-center gap-3 shadow-sm"
                                >
                                    <Plus size={16} /> Nuevo Nodo
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="bg-slate-50 border-2 border-slate-100 rounded-sm p-6 relative group hover:border-orange-400 hover:bg-white transition shadow-sm">
                                        <div className="absolute top-4 right-4 text-[9px] font-black text-slate-300 tracking-[0.1em] uppercase bg-slate-100 px-2 py-0.5 rounded-sm">Punto de Contacto #{index + 1}</div>

                                        <div className="space-y-4 pt-4">
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Cargo / Función</label>
                                                <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-1 group-hover:border-orange-300">
                                                    <Briefcase size={14} className="text-orange-400" />
                                                    <input
                                                        value={contact.position}
                                                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                                        className="w-full bg-transparent outline-none text-[11px] font-black text-slate-800 uppercase"
                                                        placeholder="Ej: Gerente de Calidad"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4">
                                                <div>
                                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nombre y Apellido</label>
                                                    <input
                                                        value={contact.name}
                                                        onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                        className="w-full p-2.5 border border-slate-200 rounded-sm text-xs font-bold font-serif outline-none focus:border-orange-500 shadow-sm"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Teléfono Directo</label>
                                                        <div className="flex items-center gap-2 border border-slate-200 rounded-sm px-2 bg-white focus-within:border-orange-500">
                                                            <Phone size={14} className="text-orange-300" />
                                                            <input
                                                                value={contact.phone}
                                                                onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                                className="w-full p-2 outline-none text-[10px] font-black font-mono"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email corporativo</label>
                                                        <div className="flex items-center gap-2 border border-slate-200 rounded-sm px-2 bg-white focus-within:border-orange-500">
                                                            <Mail size={14} className="text-orange-300" />
                                                            <input
                                                                value={contact.email}
                                                                onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                                className="w-full p-2 outline-none text-[10px] font-bold font-mono lowercase"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {contacts.length > 1 && (
                                            <button
                                                onClick={() => removeContact(index)}
                                                className="mt-6 w-full py-2 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition text-[9px] font-black uppercase tracking-widest border border-slate-200 border-dashed rounded-sm"
                                            >
                                                Eliminar de Agenda
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ACCIONES DE EXPEDIENTE */}
                        <div className="pt-12 border-t-2 border-slate-100 flex justify-between items-center">
                            <button
                                onClick={handleDelete}
                                className="text-[10px] font-black text-slate-300 hover:text-red-600 uppercase tracking-[0.2em] flex items-center gap-2 transition"
                            >
                                <Trash2 size={16} /> Depurar Registro
                            </button>
                            <div className="flex gap-4">
                                <Link to="/clients" className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-500 rounded-sm font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                    Descartar
                                </Link>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-4 bg-orange-600 hover:bg-slate-900 text-white font-black py-4 px-12 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={20} />}
                                    {saving ? 'Persistiendo...' : 'Actualizar Expediente'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
