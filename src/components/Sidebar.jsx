import { Link, useLocation } from 'react-router-dom';
import {
    Home, FolderKanban, FlaskConical, Users,
    Calendar, Package, Settings, ChevronRight
} from 'lucide-react';

const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/projects', label: 'Proyectos', icon: FolderKanban },
    { path: '/essays', label: 'Ensayos', icon: FlaskConical },
    { path: '/clients', label: 'Clientes', icon: Users },
    { path: '/visits', label: 'Agenda', icon: Calendar },
    { path: '/ingredients', label: 'Insumos', icon: Package },
];

export default function Sidebar() {
    const location = useLocation();
    const isActive = (path) =>
        location.pathname === path ||
        (path !== '/' && location.pathname.startsWith(path));

    return (
        <div className="h-screen w-[72px] flex flex-col items-center py-5 fixed left-0 top-0 z-50 print:hidden"
            style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>

            {/* Logo */}
            <div className="mb-8 flex flex-col items-center group cursor-pointer">
                <div className="w-10 h-10 rounded-xl overflow-hidden border-2 flex items-center justify-center bg-white/5"
                    style={{ borderColor: 'var(--border)' }}>
                    <img
                        src={`${import.meta.env.VITE_API_URL || 'https://app-asesoria.onrender.com'}/static/images/logo_institucional.png`}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                    />
                </div>
                {/* Tooltip */}
                <span className="mt-1 text-[7px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-60 transition-opacity"
                    style={{ color: 'var(--text-2)' }}>
                    App Asesor
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 w-full flex flex-col gap-1">
                {navItems.map(({ path, label, icon: Icon }) => {
                    const active = isActive(path);
                    return (
                        <Link
                            key={path}
                            to={path}
                            title={label}
                            className="relative flex flex-col items-center justify-center py-3 w-full transition-all duration-200 group"
                            style={{
                                color: active ? 'var(--accent)' : 'var(--text-2)',
                                background: active ? 'var(--accent-dim)' : 'transparent',
                            }}
                            onMouseEnter={e => {
                                if (!active) e.currentTarget.style.background = 'rgba(74,222,128,0.06)';
                                if (!active) e.currentTarget.style.color = '#e2e8f0';
                            }}
                            onMouseLeave={e => {
                                if (!active) e.currentTarget.style.background = 'transparent';
                                if (!active) e.currentTarget.style.color = 'var(--text-2)';
                            }}
                        >
                            {/* Barra indicador activo */}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r"
                                    style={{ background: 'var(--accent)', boxShadow: '0 0 8px rgba(74,222,128,0.5)' }} />
                            )}

                            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            <span className="text-[9px] mt-1 font-bold uppercase tracking-tight leading-none">
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer — Settings + versión */}
            <div className="w-full flex flex-col items-center gap-3 pt-4"
                style={{ borderTop: '1px solid var(--border)' }}>
                <Link
                    to="/settings"
                    title="Configuración"
                    className="flex flex-col items-center py-2 w-full transition-colors"
                    style={{ color: isActive('/settings') ? 'var(--accent)' : 'var(--text-2)' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e2e8f0'}
                    onMouseLeave={e => e.currentTarget.style.color = isActive('/settings') ? 'var(--accent)' : 'var(--text-2)'}
                >
                    <Settings size={18} strokeWidth={1.8} />
                    <span className="text-[9px] mt-1 font-bold uppercase tracking-tight">Config</span>
                </Link>
                <div className="text-[8px] font-mono font-bold tracking-widest opacity-30 pb-1"
                    style={{ color: 'var(--text-2)' }}>
                    v4.0
                </div>
            </div>
        </div>
    );
}
