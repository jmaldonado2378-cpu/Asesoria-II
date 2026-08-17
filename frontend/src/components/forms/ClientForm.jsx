import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Building, User, Mail, MapPin, Phone, Briefcase, Plus, Trash2, Loader2 } from 'lucide-react';
import { FormField } from '../ui/FormField';

import { useToast } from '../ui/Toast';

const inputStyle = {
    background: 'var(--bg-main)',
    border: '1px solid var(--border)',
    color: 'var(--text-1)',
};

export default function ClientForm({ initialData, onSubmit, loading, fieldErrors = {}, error }) {
    const isEdit = !!initialData;
    const { showError } = useToast();
    
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [contacts, setContacts] = useState([
        { name: '', position: 'Contacto Comercial', phone: '', email: '' },
        { name: '', position: 'Contacto Técnico', phone: '', email: '' },
        { name: '', position: 'Administración', phone: '', email: '' }
    ]);
    const [localErrors, setLocalErrors] = useState({});

    useEffect(() => {
        if (isEdit) {
            setFormData({ name: initialData.name || '', address: initialData.address || '' });
            if (initialData.contacts_data && initialData.contacts_data.length > 0) {
                setContacts(initialData.contacts_data);
            } else if (initialData.contact_name || initialData.email || initialData.phone) {
                setContacts([{
                    name: initialData.contact_name || '',
                    position: initialData.position || 'Responsable',
                    phone: initialData.phone || '',
                    email: initialData.email || ''
                }]);
            } else {
                setContacts([{ name: '', position: 'Responsable', phone: '', email: '' }]);
            }
        }
    }, [initialData, isEdit]);

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
        
        if (localErrors[`contact_${index}_${field}`]) {
            setLocalErrors(prev => ({ ...prev, [`contact_${index}_${field}`]: null }));
        }
    };

    const addContact = () => setContacts([...contacts, { name: '', position: '', phone: '', email: '' }]);
    const removeContact = (index) => {
        if (contacts.length <= 1) return showError('Debe haber al menos un contacto.');
        setContacts(contacts.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name.trim()) errors.name = "La Razón Social es obligatoria";
        
        contacts.forEach((c, i) => {
            if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) {
                errors[`contact_${i}_email`] = "Email inválido";
            }
        });

        setLocalErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const cleanContacts = contacts.filter(c => c.name || c.email || c.phone || c.position);
        
        const payload = {
            ...formData,
            contacts_data: cleanContacts,
            contact_name: cleanContacts[0]?.name || '',
            position: cleanContacts[0]?.position || '',
            phone: cleanContacts[0]?.phone || '',
            email: cleanContacts[0]?.email || ''
        };
        
        onSubmit(payload);
    };

    const mergedErrors = { ...localErrors, ...fieldErrors };

    return (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
            {!isEdit && (
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
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Datos empresa */}
                <div className="space-y-4">
                    <FormField 
                        label="Razón Social / Entidad Comercial" 
                        icon={<Building size={13} />} 
                        error={mergedErrors.name}
                    >
                        <input value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (localErrors.name) setLocalErrors(prev => ({ ...prev, name: null }));
                            }}
                            className="w-full px-4 py-3 rounded-lg text-lg font-bold outline-none transition-all placeholder:text-slate-700"
                            style={{ ...inputStyle, borderColor: mergedErrors.name ? '#ef4444' : inputStyle.border }}
                            placeholder="Ej: Molino Cañuelas S.A." />
                    </FormField>
                    
                    <FormField 
                        label="Dirección Física de Planta / Oficinas" 
                        icon={<MapPin size={13} />}
                        error={mergedErrors.address}
                    >
                        <div className="flex gap-2">
                            <input value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-all placeholder:text-slate-700"
                                style={{ ...inputStyle, borderColor: mergedErrors.address ? '#ef4444' : inputStyle.border }}
                                placeholder="Calle, Número, Localidad, Provincia..." />
                            
                            {isEdit && (
                                <button onClick={() => {
                                    if (!formData.address) return showError("Dirección no especificada.");
                                    const query = encodeURIComponent(formData.address);
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                                }} type="button"
                                    className="px-4 py-2.5 rounded-lg text-sm font-bold transition whitespace-nowrap"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                                    G-Maps
                                </button>
                            )}
                        </div>
                    </FormField>
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

                    <div className={isEdit ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
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
                                <div className={isEdit ? "space-y-3" : "grid grid-cols-1 md:grid-cols-4 gap-4"}>
                                    <FormField label="Área / Cargo" icon={<Briefcase size={12} />} error={mergedErrors[`contact_${index}_position`]}>
                                        <input value={contact.position}
                                            onChange={(e) => handleContactChange(index, 'position', e.target.value)}
                                            className={`w-full px-3 ${isEdit ? 'py-1.5' : 'py-2'} rounded-lg text-xs font-bold outline-none`}
                                            style={{ background: isEdit ? 'var(--bg-panel)' : 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                            placeholder="Ej: Calidad" />
                                    </FormField>
                                    <FormField label="Nombre" icon={<User size={12} />} error={mergedErrors[`contact_${index}_name`]}>
                                        <input value={contact.name}
                                            onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                                            className={`w-full px-3 ${isEdit ? 'py-1.5' : 'py-2'} rounded-lg text-xs font-bold outline-none`}
                                            style={{ background: isEdit ? 'var(--bg-panel)' : 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                            placeholder="Nombre completo" />
                                    </FormField>
                                    
                                    {isEdit ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField label="Teléfono" icon={<Phone size={12} />} error={mergedErrors[`contact_${index}_phone`]}>
                                                <input value={contact.phone}
                                                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                                    placeholder="+54 9 11..." />
                                            </FormField>
                                            <FormField label="Email" icon={<Mail size={12} />} error={mergedErrors[`contact_${index}_email`]}>
                                                <input value={contact.email}
                                                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-1.5 rounded-lg text-xs font-mono outline-none lowercase"
                                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', color: 'var(--text-1)', borderColor: mergedErrors[`contact_${index}_email`] ? '#ef4444' : 'var(--border)' }}
                                                    placeholder="correo@empresa.com" />
                                            </FormField>
                                        </div>
                                    ) : (
                                        <>
                                            <FormField label="Teléfono" icon={<Phone size={12} />} error={mergedErrors[`contact_${index}_phone`]}>
                                                <input value={contact.phone}
                                                    onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none"
                                                    style={inputStyle}
                                                    placeholder="+54 9 11..." />
                                            </FormField>
                                            <FormField label="Email" icon={<Mail size={12} />} error={mergedErrors[`contact_${index}_email`]}>
                                                <input value={contact.email}
                                                    onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                                                    className="w-full px-3 py-2 rounded-lg text-xs font-mono outline-none lowercase"
                                                    style={{ ...inputStyle, borderColor: mergedErrors[`contact_${index}_email`] ? '#ef4444' : inputStyle.border }}
                                                    placeholder="correo@empresa.com" />
                                            </FormField>
                                        </>
                                    )}
                                </div>
                                {isEdit && contacts.length > 1 && (
                                    <div className="mt-3">
                                        <button onClick={() => removeContact(index)} type="button"
                                            className="w-full py-1.5 rounded-lg text-xs font-bold transition hover:text-red-400"
                                            style={{ border: '1px dashed var(--border)', color: 'var(--text-2)' }}>
                                            Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className={`pt-4 flex ${isEdit ? 'justify-end' : 'justify-end'} gap-3`} style={{ borderTop: '1px solid var(--border)' }}>
                    <Link to="/clients" className="px-5 py-2.5 rounded-lg text-sm font-bold transition"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                        Cancelar
                    </Link>
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition active:scale-95 disabled:opacity-50"
                        style={{ background: 'var(--accent)', color: '#0f172a' }}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        {loading ? (isEdit ? 'Guardando...' : 'Creando...') : (isEdit ? 'Actualizar Expediente' : 'Guardar Cliente')}
                    </button>
                </div>
            </form>
        </div>
    );
}
