import { useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { Menu, X, BookOpen, BarChart2, FileText, Settings, LogOut } from 'lucide-react'
import { logout } from '../services/auth'

export default function StudentLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()

    const handleLogout = () => {
        logout();
        navigate('/')
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-300 ease-in-out 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col bg-green-900 text-white">
                    <div className="flex h-16 items-center justify-between px-4">
                        <Link to="/alumno/dashboard" className="flex items-center space-x-2">
                            <BookOpen className="h-6 w-6" />
                            <span className="text-xl font-bold">AulaSync</span>
                        </Link>
                    </div>
                    <nav className="flex-1 space-y-1 px-2 py-4">
                        <Link to="/alumno/dashboard" 
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <BarChart2 className="h-5 w-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link to="/alumno/tareas"
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <FileText className="h-5 w-5" />
                            <span>Tareas</span>
                        </Link>
                    </nav>
                    <div className="border-t border-green-800 p-4 space-y-2">
                        <Link to="/alumno/configuracion"
                              className="flex items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800">
                            <Settings className="h-5 w-5" />
                            <span>Configuración</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center space-x-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-green-800"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className={`min-h-screen transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
                <header className="sticky top-0 z-20 bg-white border-b">
                    <div className="flex h-16 items-center gap-4 px-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100"
                        >
                            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                        <span className="text-lg font-semibold">AulaSync</span>
                    </div>
                </header>
                
                <main className="container mx-auto px-4 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
