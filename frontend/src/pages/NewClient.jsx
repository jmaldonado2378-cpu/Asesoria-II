import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Activity } from 'lucide-react';
import { createClient } from '../api/clients';
import { useApiMutation } from '../hooks/useApiMutation';
import { useToast } from '../components/ui/Toast';
import ClientForm from '../components/forms/ClientForm';

export default function NewClient() {
    const navigate = useNavigate();
    const { showSuccess } = useToast();
    const { loading, error, fieldErrors, execute } = useApiMutation(createClient);

    const handleSubmit = async (payload) => {
        try {
            await execute(payload);
            showSuccess('Cliente creado exitosamente');
            navigate('/clients');
        } catch (e) {
            // errors handled by useApiMutation
        }
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="w-full max-w-4xl">
                {/* Back nav - keep exact same style */}
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
                
                <ClientForm
                    onSubmit={handleSubmit}
                    loading={loading}
                    error={error}
                    fieldErrors={fieldErrors}
                />
            </div>
        </div>
    );
}
