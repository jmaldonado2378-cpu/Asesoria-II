import { useState } from 'react';
import { API_URL } from '../config';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, User, Mail, MapPin, Phone, Briefcase, Plus, Trash2, Activity } from 'lucide-react';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};
const labelStyle = { color: 'var(--text-2)' };

function FormLabel({ icon, children }) {
    return (
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"
            style={labelStyle}>
            {icon} {children}
        </label>
    );
}

export default function NewClient() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [contacts, setContacts] = useState([
        { name: '', position: 'Contacto Comercial', phone: '', email: '' },
        { name: '', position: 'Contacto Técnico', phone: '', email: '' },
        { name: '', position: 'Administración', phone: '', email: '' }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return alert('La Razón Social es obligatoria');
        const cleanContacts = contacts.filter(c => c.name || c.email || c.phone);
        const payload = {
            ...formData,
            contact_name: cleanContacts[0]?.name || '',
            email: cleanContacts[0]?.email || '',
            phone: cleanContacts[0]?.phone || '',
            position: cleanContacts[0]?.position || '',
            contacts_data: cleanContacts
        };
        try {
            const res = await fetch(`${API_URL}/api/clients/`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (res.ok) navigate('/clients'); else alert('Error al guardar cliente');
        } catch (error) { console.error(error); }
    };

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const addContact = () => setContacts([...contacts, { name: '', position: '', phone: '', email: '' }]);
    const removeContact = (index) => {
        if (contacts.length <= 1) return alert('Debe haber al menos un contacto.');
        setContacts(contacts.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">

                {/* Back */}
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/clients" className="flex items-center gap-2 text-sm font-medium transition hover:text-white"
                        style={{ color: 'var(--text-2)' }}>
                        <ArrowLeft size={16} /> Volver a Cartera
                    </Link>
                    <div className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        style={{ color: 'var(--accent)' }}>
                        <Activity size={12} /> CRM Multi-Contacto
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>

                    {/* Header */}
                    <div className="p-8 relative overflow-hidden" style={{ background: '#020617', borderBottom: '1px solid var(--border)' }}>
                        <div className="absolute top-0 left-0 w-full h-1" style={{ background: 'var(--accent)' }} />
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2"
                            style={{ color: 'var(--accent)' }}>
                            <Building size={12} /> Alta Corporativa
                        </div>
                        <h1 className="text-2xl font-bold text-white">Nuevo Cliente</h1>
                        <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-2)' }}>
                            Registro Centralizado de Entidades y Agenda Técnica
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">

                        {/* Datos empresa */}
                        <div className="space-y-4">
                            <div>
                                <FormLabel icon={<Building size={13} />}>Razón Social / Entidad Comercial</FormLabel>
                                <input value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-lg font-bold outline-none transition-all placeholder:text-slate-700"
                                    style={inputStyle}
                                    placeholder="Ej: Molino Cañuelas S.A." />
                            </div>
                            <div>
                                <FormLabel icon={<MapPin size={13} />}>Dirección Física de Planta / Oficinas</FormLabel>
                                <input value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all placeholder:text-slate-700"
                                    style={inputStyle}
                                    placeholder="Calle, Número, Localidad, Provincia..." />
                            </div>
                        </div>

                        {/* Contactos */}
                        <div className="pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-sm font-bold flex items-center gap-2"
                                    style={{ color: 'var(--text-2)' }}>
                                    <User size={16} style={{ color: 'var(--accent)' }} />
                                    Agenda de Contactos ({contacts.length})
                                </h3>
                                <button type="button" onClick={addContact}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition active:scale-95"
                                    style={{ border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                                    <Plus size={13} /> Agregar Ficha
                                </button>
                            </div>

                            <div className="space-y-4">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="rounded-lg p-5 relative"
                                        style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-2)' }}>
                                            Contacto #{index + 1}
                                        </div>
                                        {contacts.length > 1 && (
                                            <button type="button" onClick={() => removeContact(index)}
                                                className="absolute top-4 right-4 transition"
                                                style={{ color: 'var(--text-2)' }}>
                                                <Trash2 size={14} className="hover:text-red-400" />
                                            </button>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <FormLabel icon={<Briefcase size={12} />}>Área</FormLabel>
                                                <input value={contact.position}
                                                    onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                                                    style={inputStyle}
                                                    placeholder="Ej: Calidad" />
                                            </div>
                                            <div>
                                                <FormLabel icon={<User size={12} />}>Nombre</FormLabel>
                                                <input value={contact.name}
                                                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-bold outline-none"
                                                    style={inputStyle}
                                                    placeholder="Nombre completo" />
                                            </div>
                                            <div>
                                                <FormLabel icon={<Phone size={12} />}>Teléfono</FormLabel>
                                                <input value={contact.phone}
                                                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
                                                    style={inputStyle}
                                                    placeholder="+54 9 11..." />
                                            </div>
                                            <div>
                                                <FormLabel icon={<Mail size={12} />}>Email</FormLabel>
                                                <input value={contact.email}
                                                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none lowercase"
                                                    style={inputStyle}
                                                    placeholder="correo@empresa.com" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="pt-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                            <Link to="/clients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                                style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                Cancelar
                            </Link>
                            <button type="submit"
                                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95"
                                style={{ background: 'var(--accent)', color: '#0f172a' }}>
                                <Save size={16} /> Guardar Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
