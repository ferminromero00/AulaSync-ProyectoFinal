import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherLayout from './layouts/TeacherLayout'
import TeacherDashboard from './pages/profesor/Dashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rutas del profesor */}
        <Route path="/profesor" element={<TeacherLayout />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
