import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherLayout from './layouts/TeacherLayout'
import StudentLayout from './layouts/StudentLayout'
import TeacherDashboard from './pages/profesor/Dashboard'
import DashboardAlumno from './pages/alumno/DashboardAlumno'
import Clases from './pages/profesor/Clases'
import Configuracion from './pages/profesor/Configuracion'
import ClaseDashboard from './pages/profesor/ClaseDashboard'
import ConfiguracionAlumno from './pages/alumno/Configuracion'
import TareasAlumno from './pages/alumno/TareasAlumno';
import { Toaster } from 'react-hot-toast';
import { createContext, useState, useEffect } from 'react';
import { getPerfil } from './services/perfil';
import { getClasesAlumno } from './services/clases';
import { obtenerInvitacionesPendientes } from './services/invitaciones';

export const GlobalContext = createContext();

export function GlobalProvider({ children }) {
    const [userData, setUserData] = useState({
        user: null,
        clases: [],
        invitaciones: [],
        loading: true
    });

    useEffect(() => {
        const cargarDatos = async () => {
            if (!localStorage.getItem('token')) {
                setUserData({ user: null, clases: [], invitaciones: [], loading: false });
                return;
            }
            try {
                const [user, clases, invitaciones] = await Promise.all([
                    getPerfil(),
                    getClasesAlumno(),
                    obtenerInvitacionesPendientes()
                ]);
                setUserData({ user, clases, invitaciones, loading: false });
            } catch {
                setUserData({ user: null, clases: [], invitaciones: [], loading: false });
            }
        };
        cargarDatos();
    }, []);

    return (
        <GlobalContext.Provider value={{ userData, setUserData }}>
            {children}
        </GlobalContext.Provider>
    );
}

function App() {
  return (
    <GlobalProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas de profesor */}
          <Route path="/profesor/*" element={
            <ProtectedRoute allowedRole="profesor">
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="clases" element={<Clases />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="clase/:id" element={<ClaseDashboard />} />
            {/* ...otras rutas de profesor... */}
          </Route>

          {/* Rutas protegidas de alumno */}
          <Route path="/alumno/*" element={
            <ProtectedRoute allowedRole="alumno">
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardAlumno />} />
            <Route path="clase/:id" element={<ClaseDashboard />} />
            <Route path="configuracion" element={<ConfiguracionAlumno />} />
            <Route path="tareas" element={<TareasAlumno />} />
            {/* ...otras rutas de alumno... */}
          </Route>
        </Routes>
      </BrowserRouter>
    </GlobalProvider>
  )
}

export default App
