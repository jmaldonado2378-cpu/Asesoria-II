import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, User, Mail, MapPin, Phone, Briefcase, Plus, Trash2, Activity } from 'lucide-react';

export default function NewClient() {
    const navigate = useNavigate();
    // Estado inicial con 3 ranuras de contacto por defecto
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [contacts, setContacts] = useState([
        { name: '', position: 'Contacto Comercial', phone: '', email: '' },
        { name: '', position: 'Contacto Técnico', phone: '', email: '' },
        { name: '', position: 'Administración', phone: '', email: '' }
    ]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return alert('La Razón Social es obligatoria');

        // Filtramos contactos vacíos por si el usuario borró campos manualmente pero dejó la fila
        const cleanContacts = contacts.filter(c => c.name || c.email || c.phone);

        const payload = {
            ...formData,
            contact_name: cleanContacts[0]?.name || '', // Legacy support
            email: cleanContacts[0]?.email || '',       // Legacy support
            phone: cleanContacts[0]?.phone || '',       // Legacy support
            position: cleanContacts[0]?.position || '', // Legacy support
            contacts_data: cleanContacts                // Full data para backend moderno
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
        if (contacts.length <= 1) return alert("Debe haber al menos un contacto.");
        setContacts(contacts.filter((_, i) => i !== index));
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-6 flex justify-between items-center">
                    <Link to="/clients" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Cartera
                    </Link>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                        <Activity size={12} /> CRM Multi-Contacto v3.0
                    </div>
                </div>

                <div className="bg-white shadow-2xl rounded-sm overflow-hidden border border-slate-300">
                    <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 text-orange-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
                                <Building size={12} /> Alta Corporativa
                            </div>
                            <h1 className="text-3xl font-serif font-bold uppercase tracking-tighter leading-none">Nuevo Cliente</h1>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">Registro Centralizado de Entidades y Agenda Técnica</p>
                        </div>
                        <Building size={80} className="text-slate-800 absolute -right-6 -bottom-6 opacity-30" />
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-10">

                        {/* DATOS EMPRESA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex gap-2 items-center">
                                    <Building size={14} className="text-orange-600" /> Razón Social / Entidad Comercial
                                </label>
                                <input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-4 border border-slate-200 rounded-sm bg-slate-50 text-slate-900 font-black text-xl outline-none focus:border-orange-600 focus:bg-white transition-all shadow-inner"
                                    placeholder="Ej: Molino Cañuelas S.A."
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex gap-2 items-center">
                                    <MapPin size={14} className="text-orange-600" /> Dirección Física de Planta / Oficinas
                                </label>
                                <input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-sm outline-none focus:border-orange-600 font-bold text-sm bg-white shadow-sm"
                                    placeholder="Calle, Número, Localidad, Provincia..."
                                />
                            </div>
                        </div>

                        {/* AGENDA CONTACTOS */}
                        <div className="border-t border-slate-100 pt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[10px] font-bold text-slate-900 uppercase tracking-[0.2em] flex gap-3 items-center">
                                    <User size={18} className="text-orange-600" /> Agenda de Contactos Estratégicos ({contacts.length})
                                </h3>
                                <button
                                    type="button"
                                    onClick={addContact}
                                    className="bg-orange-50 text-orange-600 px-4 py-2 border border-orange-200 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-orange-600 hover:text-white transition flex items-center gap-2 shadow-sm active:scale-95"
                                >
                                    <Plus size={14} /> Agregar Ficha
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {contacts.map((contact, index) => (
                                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-sm p-6 relative group hover:border-orange-400 transition shadow-sm">
                                        <div className="absolute top-4 right-4 text-[10px] font-black text-slate-200 select-none tracking-widest uppercase">Nodo #{index + 1}</div>
                                        {contacts.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeContact(index)}
                                                className="absolute bottom-4 right-4 text-slate-300 hover:text-red-600 p-2 transition"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="md:col-span-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Responsabilidad / Área</label>
                                                <div className="flex items-center gap-2 border-b border-slate-300 pb-1 group-hover:border-orange-400 transition-colors">
                                                    <Briefcase size={14} className="text-slate-400 group-hover:text-orange-600" />
                                                    <input
                                                        value={contact.position}
                                                        onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                                        className="w-full bg-transparent outline-none text-xs font-black text-slate-700 uppercase tracking-tight"
                                                        placeholder="Ej: Calidad / Producción"
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identidad</label>
                                                <input
                                                    value={contact.name}
                                                    onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                                    className="w-full p-2.5 border border-slate-200 rounded-sm text-xs font-bold outline-none focus:border-orange-500 bg-white transition shadow-sm"
                                                    placeholder="Nombre completo"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Línea Directa</label>
                                                <div className="flex items-center gap-2 border border-slate-200 rounded-sm px-2 bg-white focus-within:border-orange-500 transition shadow-sm">
                                                    <Phone size={14} className="text-slate-300" />
                                                    <input
                                                        value={contact.phone}
                                                        onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                        className="w-full p-2 outline-none text-xs font-bold font-mono"
                                                        placeholder="+54 9 11..."
                                                    />
                                                </div>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Corporativo</label>
                                                <div className="flex items-center gap-2 border border-slate-200 rounded-sm px-2 bg-white focus-within:border-orange-500 transition shadow-sm">
                                                    <Mail size={14} className="text-slate-300" />
                                                    <input
                                                        value={contact.email}
                                                        onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                        className="w-full p-2 outline-none text-xs font-bold font-mono lowercase"
                                                        placeholder="correo@empresa.com"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
                            <Link to="/clients" className="px-10 py-4 bg-white border border-slate-300 text-slate-500 rounded-sm font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition active:scale-95">
                                Cancelar
                            </Link>
                            <button
                                type="submit"
                                className="flex items-center gap-3 bg-green-600 hover:bg-slate-900 text-white font-black py-4 px-12 rounded-sm shadow-2xl transition active:scale-95 text-[10px] uppercase tracking-[0.1em]"
                            >
                                <Save size={20} /> Persistir Cliente y Agenda
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
