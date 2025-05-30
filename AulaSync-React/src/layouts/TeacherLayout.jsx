import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, Users, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '../services/auth';
import NotificationButton from '../components/NotificationButton'
import AvatarButton from '../components/AvatarButton'
import IaChatWidget from '../components/IaChatWidget'

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Overlay solo para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex h-full flex-col bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl">
                    {/* Logo y título */}
                    <div className="flex h-16 items-center gap-2 px-6 border-b border-blue-700/50">
                        <BookOpen className="h-7 w-7 text-blue-300 animate-sidebarIcon" />
                        <span className="text-xl font-bold tracking-wider text-white/90 animate-sidebarTitle">AulaSync</span>
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex-1 space-y-2 px-3 py-4">
                        <SidebarLink
                            to="/profesor/dashboard"
                            icon={<BarChart2 className="h-5 w-5" />}
                            label="Dashboard"
                        />
                        <SidebarLink
                            to="/profesor/clases"
                            icon={<Users className="h-5 w-5" />}
                            label="Clases"
                        />
                        <SidebarLink
                            to="/profesor/tareas"
                            icon={<FileText className="h-5 w-5" />}
                            label="Tareas"
                        />
                    </nav>

                    {/* Footer navigation - ajustado para coincidir con el estilo del alumno */}
                    <div className="border-t border-blue-700/50 p-4">
                        <SidebarLink
                            to="/profesor/configuracion"
                            icon={<Settings className="h-5 w-5" />}
                            label="Configuración"
                        />
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2 text-red-100 rounded-lg 
                                     border border-red-700/20 bg-red-900/10 hover:bg-red-500/20 hover:border-red-400 
                                     hover:text-white transition-all duration-200 group mt-2"
                        >
                            <LogOut className="h-5 w-5 text-red-400 group-hover:text-white transition-colors" />
                            <span className="font-medium text-sm">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                <style>{`
                    .sidebar-link {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.5rem 1rem;
                        border-radius: 0.75rem;
                        font-weight: 500;
                        font-size: 0.875rem;
                        color: #dbeafe;
                        background: transparent;
                        border: 2px solid transparent;
                        transition: all 0.2s;
                    }
                    .sidebar-link-active, .sidebar-link:hover {
                        background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
                        color: #fff !important;
                        border-color: #60a5fa;
                        box-shadow: 0 4px 24px 0 rgba(59,130,246,0.10);
                    }
                    .sidebar-link .sidebar-icon {
                        transition: transform 0.2s;
                    }
                    .sidebar-link:hover .sidebar-icon, .sidebar-link-active .sidebar-icon {
                        transform: scale(1.1);
                    }
                `}</style>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                <header className="sticky top-0 z-20 bg-white border-b w-full">
                    <div className="flex h-16 items-center gap-4 px-4 justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            >
                                <span className="sr-only">Toggle menú</span>
                                {isSidebarOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationButton />
                            <AvatarButton size={40} />
                        </div>
                    </div>
                </header>
                
                <main className="flex-1 p-4">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
            <IaChatWidget />
        </div>
    )
}

// Nuevo componente para los enlaces del sidebar con animación y active
import { useLocation } from 'react-router-dom'
function SidebarLink({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={`sidebar-link flex items-center gap-3 px-4 py-3 text-blue-100 font-medium rounded-xl border border-transparent
                ${isActive ? 'sidebar-link-active' : 'hover:sidebar-link-active'}`}
        >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export default TeacherLayout;
