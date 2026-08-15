import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building, Activity, Loader2, Trash2 } from 'lucide-react';
import { getClient, updateClient, deleteClient } from '../api/clients';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import ClientForm from '../components/forms/ClientForm';

export default function ClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    
    const [client, setClient] = useState(null);
    const [loadingFetch, setLoadingFetch] = useState(true);

    const { loading: saving, error, fieldErrors, execute: executeUpdate } = useApiMutation((data) => updateClient(id, data));
    const { loading: deleting, execute: executeDelete } = useApiMutation(() => deleteClient(id));

    useEffect(() => {
        getClient(id)
            .then(d => {
                setClient(d);
                setLoadingFetch(false);
            })
            .catch(e => {
                console.error(e);
                setLoadingFetch(false);
            });
    }, [id]);

    const handleSave = async (payload) => {
        try {
            await executeUpdate(payload);
            showSuccess('Expediente actualizado correctamente');
            navigate('/clients');
        } catch (e) {
            // handled by mutation
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Confirmar eliminación absoluta de esta cuenta?')) {
            try {
                await executeDelete();
                showSuccess('Cliente eliminado');
                navigate('/clients');
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (loadingFetch) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin mr-3" size={20} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-mono uppercase tracking-widest">Recuperando Expediente #{id}...</span>
        </div>
    );

    if (!client) return (
        <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-2)' }}>
            <span className="text-xs font-mono uppercase tracking-widest">Cliente no encontrado</span>
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

                <div className="rounded-xl overflow-hidden mb-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)' }}>
                    <div className="p-7 relative overflow-hidden" style={{ background: '#020617' }}>
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
                </div>

                <ClientForm
                    initialData={client}
                    onSubmit={handleSave}
                    loading={saving}
                    error={error}
                    fieldErrors={fieldErrors}
                />

                <div className="mt-6 flex justify-center">
                    <button onClick={handleDelete} type="button" disabled={deleting}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition hover:text-red-400 disabled:opacity-50"
                        style={{ border: '1px solid var(--border)', color: 'var(--text-2)', background: 'var(--bg-panel)' }}>
                        {deleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                        Eliminar Cliente
                    </button>
                </div>
            </div>
        </div>
    );
}
