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

function App() {
  return (
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
          {/* ...otras rutas de alumno... */}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
