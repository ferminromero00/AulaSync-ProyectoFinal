import { useContext, useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, FileText, Settings, LogOut, GraduationCap } from 'lucide-react'
import { logout } from '../services/auth'
import NotificationButton from '../components/NotificationButton'
import AvatarButton from '../components/AvatarButton'
import { GlobalContext } from '../App'
import IaChatWidget from '../components/IaChatWidget'

const StudentLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()
    const { userData } = useContext(GlobalContext);
    const clases = userData.clases || [];

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Overlay para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar rediseñado - más parecido al de profesor */}
            <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex h-full flex-col bg-gradient-to-b from-green-900 via-green-800 to-emerald-900 text-white shadow-2xl">
                    {/* Logo y título */}
                    <div className="flex h-16 items-center gap-2 px-6 border-b border-green-700/50">
                        <BookOpen className="h-7 w-7 text-green-300 animate-sidebarIcon" />
                        <span className="text-xl font-bold tracking-wider text-white/90 animate-sidebarTitle">AulaSync</span>
                    </div>

                    {/* Navegación principal */}
                    <nav className="flex-1 space-y-2 px-3 py-4">
                        <SidebarLink
                            to="/alumno/dashboard"
                            icon={<BarChart2 className="h-5 w-5" />}
                            label="Dashboard"
                        />
                        <SidebarLink
                            to="/alumno/tareas"
                            icon={<FileText className="h-5 w-5" />}
                            label="Tareas"
                        />
                        <SidebarLink
                            to="/alumno/configuracion"
                            icon={<Settings className="h-5 w-5" />}
                            label="Configuración"
                        />
                        
                        {/* Lista de clases */}
                        <div className="mt-6 px-3">
                            <span className="px-4 text-xs font-medium uppercase tracking-wider text-green-300/80">
                                Mis Clases
                            </span>
                            <div className="mt-2 space-y-1">
                                {clases.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-green-300/60 italic">
                                        No hay clases disponibles
                                    </div>
                                ) : (
                                    clases.map(clase => (
                                        <div
                                            key={clase.id}
                                            onClick={() => navigate(`/alumno/clase/${clase.id}`)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all 
                                                text-green-100 hover:bg-green-700/40 group font-medium text-sm"
                                        >
                                            <GraduationCap className="h-5 w-5 text-green-400 group-hover:text-white" />
                                            <span className="truncate flex-1">{clase.nombre}</span>
                                            <span className="bg-green-800/50 px-2 py-0.5 rounded text-xs font-medium">
                                                {clase.numEstudiantes}👥
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="border-t border-green-700/50 p-4">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2 text-red-100 rounded-lg 
                                     border border-red-700/20 bg-red-900/10 hover:bg-red-500/20 hover:border-red-400 
                                     hover:text-white transition-all duration-200 group"
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
                        color: #d1fae5;
                        background: transparent;
                        border: 2px solid transparent;
                        transition: all 0.2s;
                    }
                    .sidebar-link-active, .sidebar-link:hover {
                        background: linear-gradient(90deg, #059669 0%, #10b981 100%);
                        color: #fff !important;
                        border-color: #34d399;
                        box-shadow: 0 4px 24px 0 rgba(16,185,129,0.10);
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
                <header className="sticky top-0 z-20 bg-white border-b">
                    <div className="flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="inline-flex lg:hidden items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
                            >
                                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <span className="text-lg font-semibold">AulaSync</span>
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
function SidebarLink({ to, icon, label }) {
    const location = useLocation();
    const isActive = location.pathname.startsWith(to);
    return (
        <Link
            to={to}
            className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
        >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export default StudentLayout;
