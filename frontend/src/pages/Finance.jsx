import React, { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '../api/httpClient';
import { useToast } from '../components/ui/Toast';
import { DollarSign, Trash2, Plus, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';

export default function Finance() {
    const { showToast } = useToast();
    const [summary, setSummary] = useState({ revenue: 0, expenses: 0, margin: 0, active_projects: 0, project_stats: [] });
    const [projects, setProjects] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter
    const [filterProject, setFilterProject] = useState('');

    // New expense form
    const [newExpense, setNewExpense] = useState({
        project: '',
        description: '',
        amount: '',
        category: 'Viáticos',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sumRes, projRes, expRes] = await Promise.all([
                apiGet('/api/financial-summary/'),
                apiGet('/api/projects/'),
                apiGet('/api/project-expenses/')
            ]);
            if (sumRes) setSummary(sumRes);
            if (projRes) setProjects(projRes);
            if (expRes) setExpenses(expRes);
        } catch (error) {
            console.error("Error fetching finance data:", error);
            showToast("Error al cargar datos financieros", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!newExpense.project || !newExpense.amount || !newExpense.description) {
            showToast("Complete los campos obligatorios", "warning");
            return;
        }

        try {
            const res = await apiPost('/api/project-expenses/', {
                ...newExpense,
                amount: parseFloat(newExpense.amount)
            });
            if (res && !res.error) {
                showToast("Gasto registrado", "success");
                setNewExpense({ ...newExpense, description: '', amount: '' });
                fetchData();
            } else {
                showToast(res.error || "Error al registrar gasto", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("¿Eliminar este gasto?")) return;
        try {
            const res = await apiDelete(`/api/project-expenses/${id}/`);
            if (res && !res.error) {
                showToast("Gasto eliminado", "success");
                fetchData();
            } else {
                showToast(res.error || "Error al eliminar gasto", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        }
    };

    const formatMoney = (val) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);
    };

    const filteredExpenses = filterProject 
        ? expenses.filter(e => e.project_id === parseInt(filterProject) || e.project === parseInt(filterProject))
        : expenses;

    return (
        <div className="p-4 sm:p-6" style={{ background: 'var(--bg-main)', minHeight: '100vh', color: 'var(--text-1)' }}>
            <h1 className="text-xl font-bold mb-6 flex items-center gap-2">
                <DollarSign size={24} style={{ color: 'var(--accent)' }} />
                Panel Financiero
            </h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Ingresos Totales</span>
                    <span className="text-lg font-bold" style={{ color: '#10b981' }}>{formatMoney(summary.revenue)}</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Egresos Totales</span>
                    <span className="text-lg font-bold" style={{ color: '#ef4444' }}>{formatMoney(summary.expenses)}</span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Margen Neto</span>
                    <span className="text-lg font-bold" style={{ color: summary.margin >= 0 ? '#10b981' : '#ef4444' }}>
                        {formatMoney(summary.margin)}
                    </span>
                </div>
                <div className="p-4 rounded-xl border flex flex-col gap-1" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-2)' }}>Proyectos Activos</span>
                    <span className="text-lg font-bold flex items-center gap-2">
                        <Briefcase size={18} />
                        {summary.active_projects}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Projects & Expenses Form */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Project Financial Table */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                        <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
                            <TrendingUp size={16} style={{ color: 'var(--accent)' }} />
                            Finanzas por Proyecto
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }} className="text-xs">
                                        <th className="pb-2 font-medium">Proyecto</th>
                                        <th className="pb-2 font-medium">Estado</th>
                                        <th className="pb-2 font-medium text-right">Ingresos</th>
                                        <th className="pb-2 font-medium text-right">Egresos</th>
                                        <th className="pb-2 font-medium text-right">Margen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.project_stats?.map((ps, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }} className="text-xs">
                                            <td className="py-3">
                                                <div className="font-bold">{ps.name}</div>
                                                <div className="text-[10px]" style={{ color: 'var(--text-2)' }}>{ps.client_name}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className="px-2 py-1 rounded text-[9px] font-bold" style={{
                                                    background: ps.status === 'Completado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: ps.status === 'Completado' ? '#10b981' : '#3b82f6'
                                                }}>
                                                    {ps.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-[#10b981] font-semibold">{formatMoney(ps.revenue)}</td>
                                            <td className="py-3 text-right text-[#ef4444] font-semibold">{formatMoney(ps.expenses)}</td>
                                            <td className="py-3 text-right font-bold" style={{ color: ps.margin >= 0 ? '#10b981' : '#ef4444' }}>
                                                {formatMoney(ps.margin)}
                                            </td>
                                        </tr>
                                    ))}
                                    {!summary.project_stats?.length && (
                                        <tr>
                                            <td colSpan="5" className="py-4 text-center text-xs" style={{ color: 'var(--text-2)' }}>
                                                No hay datos financieros de proyectos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Expenses List */}
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <h2 className="text-sm font-bold flex items-center gap-2">
                                <TrendingDown size={16} className="text-red-500" />
                                Registro de Egresos
                            </h2>
                            <select 
                                value={filterProject} 
                                onChange={(e) => setFilterProject(e.target.value)}
                                className="px-3 py-1.5 rounded-lg text-xs outline-none"
                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            >
                                <option value="">Todos los proyectos</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-2)' }} className="text-xs">
                                        <th className="pb-2 font-medium">Fecha</th>
                                        <th className="pb-2 font-medium">Descripción</th>
                                        <th className="pb-2 font-medium">Proyecto</th>
                                        <th className="pb-2 font-medium">Categoría</th>
                                        <th className="pb-2 font-medium text-right">Monto</th>
                                        <th className="pb-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map(exp => (
                                        <tr key={exp.id} style={{ borderBottom: '1px solid var(--border)' }} className="text-xs">
                                            <td className="py-2">{exp.date}</td>
                                            <td className="py-2 font-medium">{exp.description}</td>
                                            <td className="py-2" style={{ color: 'var(--text-2)' }}>
                                                {projects.find(p => p.id === exp.project)?.name || 'N/A'}
                                            </td>
                                            <td className="py-2">
                                                <span className="px-2 py-0.5 rounded-full text-[9px]" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="py-2 text-right font-semibold text-[#ef4444]">{formatMoney(exp.amount)}</td>
                                            <td className="py-2 text-right">
                                                <button onClick={() => handleDeleteExpense(exp.id)} className="p-1 rounded hover:bg-red-500/10 text-red-500 transition" title="Eliminar">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredExpenses.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="py-4 text-center text-xs" style={{ color: 'var(--text-2)' }}>
                                                No se encontraron gastos
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Add Expense Form */}
                <div className="flex flex-col gap-6">
                    <form onSubmit={handleAddExpense} className="p-4 rounded-xl border flex flex-col gap-4 sticky top-4" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border)' }}>
                        <h2 className="text-sm font-bold">Añadir Gasto</h2>
                        
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>Proyecto *</label>
                            <select 
                                required
                                value={newExpense.project}
                                onChange={(e) => setNewExpense({...newExpense, project: e.target.value})}
                                className="px-3 py-2 rounded-lg text-sm outline-none transition"
                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            >
                                <option value="" disabled>Seleccione un proyecto</option>
                                {projects.filter(p => p.status !== 'Cancelado').map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>Descripción *</label>
                            <input 
                                required type="text"
                                placeholder="Ej: Pasajes, Insumos..."
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                                className="px-3 py-2 rounded-lg text-sm outline-none transition"
                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>Monto *</label>
                                <input 
                                    required type="number" min="0" step="0.01"
                                    placeholder="0.00"
                                    value={newExpense.amount}
                                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                                    className="px-3 py-2 rounded-lg text-sm outline-none transition"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>Fecha *</label>
                                <input 
                                    required type="date"
                                    value={newExpense.date}
                                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                                    className="px-3 py-2 rounded-lg text-sm outline-none transition"
                                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-semibold" style={{ color: 'var(--text-2)' }}>Categoría</label>
                            <select 
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                                className="px-3 py-2 rounded-lg text-sm outline-none transition"
                                style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-1)' }}
                            >
                                <option value="Viáticos">Viáticos</option>
                                <option value="Materiales">Materiales</option>
                                <option value="Servicios">Servicios</option>
                                <option value="Otros">Otros</option>
                            </select>
                        </div>

                        <button type="submit" className="mt-2 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition hover:opacity-90 text-white" style={{ background: 'var(--accent)' }}>
                            <Plus size={16} />
                            Registrar Gasto
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
