import { Link, useLocation } from 'react-router-dom';
import { Home, FolderKanban, FlaskConical, Users, Calendar, Package, Wheat, Settings } from 'lucide-react';

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    const navItems = [
        { path: '/', label: 'Inicio', icon: Home },
        { path: '/projects', label: 'Proyectos', icon: FolderKanban },
        { path: '/essays', label: 'Ensayos', icon: FlaskConical },
        { path: '/clients', label: 'Clientes', icon: Users },
        { path: '/visits', label: 'Agenda', icon: Calendar },
        { path: '/ingredients', label: 'Insumos', icon: Package },
        { path: '/settings', label: 'Config', icon: Settings },
    ];

    return (
        <div className="h-screen w-20 bg-slate-900 flex flex-col items-center py-6 fixed left-0 top-0 border-r border-slate-800 z-50 print:hidden shadow-2xl">
            <div className="mb-10 flex flex-col items-center gap-2 group cursor-pointer transition-transform hover:scale-110">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-700 p-1 bg-white shadow-lg">
                    <img src={`${import.meta.env.VITE_API_URL || 'https://app-asesoria.onrender.com'}/static/images/logo_institucional.png`} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-[6px] text-slate-400 font-bold text-center leading-tight uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    Gestión Técnica<br />& Desarrollo
                </div>
            </div>

            <nav className="flex-1 w-full space-y-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center justify-center py-4 w-full transition-all relative group ${active ? 'text-orange-500 bg-slate-800/30' : 'text-slate-500 hover:text-white hover:bg-slate-800/50'
                                }`}
                        >
                            <item.icon size={22} strokeWidth={active ? 2.5 : 1.5} className="transition-all" />
                            <span className={`text-[10px] mt-1 font-bold uppercase tracking-tighter transition-opacity ${active ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                                {item.label}
                            </span>

                            {/* Indicador Activo */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-orange-500 rounded-r shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800 w-full flex flex-col items-center gap-4">
                <div className="text-[9px] text-slate-700 font-mono font-bold tracking-widest uppercase rotate-90 mb-4 whitespace-nowrap">Kernel v3.1</div>
            </div>
        </div>
    );
}
