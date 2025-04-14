import React, { useState, useEffect } from "react"
import LoginForm from "../components/login-form"
import { Link, useLocation } from "react-router-dom"

export default function LoginPage() {
  const [role, setRole] = useState('profesor')
  const [message, setMessage] = useState('')
  const location = useLocation()

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam) {
        setRole(roleParam);
    }
    if (location.state?.message) {
        setMessage(location.state.message);
    }
  }, [location])

  const descriptions = {
    profesor: {
      title: "Portal del Profesor",
      description: "Accede a tus clases, gestiona tareas y calificaciones de estudiantes en un solo lugar.",
      features: [
        { icon: <UsersIcon className="h-6 w-6" />, title: "Gestionar Estudiantes" },
        { icon: <ClipboardIcon className="h-6 w-6" />, title: "Seguimiento de Tareas" },
        { icon: <ChartIcon className="h-6 w-6" />, title: "Revisar Calificaciones" },
        { icon: <MessageIcon className="h-6 w-6" />, title: "Comunicarse" },
      ]
    },
    alumno: {
      title: "Portal del Estudiante",
      description: "Accede a tus clases, revisa tus tareas y calificaciones desde cualquier lugar.",
      features: [
        { icon: <BookIcon className="h-6 w-6" />, title: "Ver Materias" },
        { icon: <ClipboardIcon className="h-6 w-6" />, title: "Entregar Tareas" },
        { icon: <ChartIcon className="h-6 w-6" />, title: "Consultar Notas" },
        { icon: <MessageIcon className="h-6 w-6" />, title: "Mensajes" },
      ]
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Left side - Login form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-800">AulaSync</h1>
            
            {message && (
              <div className="mt-4 p-4 rounded-md bg-green-50 text-green-700">
                <p>{message}</p>
              </div>
            )}
            
            {/* Role selector */}
            <div className="mt-4 flex space-x-4 mb-6">
              <button
                onClick={() => setRole('profesor')}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                  role === 'profesor'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Profesor
              </button>
              <button
                onClick={() => setRole('alumno')}
                className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 ${
                  role === 'alumno'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Alumno
              </button>
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Inicia sesión como {role}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {role === 'alumno' ? (
                <>
                  O{" "}
                  <Link to="/register?role=alumno" className="font-medium text-blue-600 hover:text-blue-500">
                    regístrate como nuevo alumno
                  </Link>
                </>
              ) : (
                <>
                  O{" "}
                  <Link to="/register?role=profesor" className="font-medium text-blue-600 hover:text-blue-500">
                    regístrate como nuevo profesor
                  </Link>
                </>
              )}
            </p>
          </div>

          <LoginForm role={role} />
        </div>
      </div>

      {/* Right side - Dynamic content based on role */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className={`absolute inset-0 h-full w-full transition-all duration-500 ${
          role === 'profesor' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-400'
            : 'bg-gradient-to-r from-green-600 to-green-400'
        }`}>
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
              {role === 'profesor' ? <TeacherIcon className="h-8 w-8" /> : <StudentIcon className="h-8 w-8" />}
            </div>
            <h2 className="text-3xl font-bold transition-all duration-300">
              {descriptions[role].title}
            </h2>
            <p className="mt-4 max-w-md text-center text-lg text-blue-100 transition-all duration-300">
              {descriptions[role].description}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-6">
              {descriptions[role].features.map((feature, index) => (
                <FeatureCard key={index} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BookIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  )
}

function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ClipboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}

function ChartIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  )
}

function MessageIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function FeatureCard({ icon, title }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-white bg-opacity-10 p-4 text-center">
      <div className="mb-2">{icon}</div>
      <h3 className="text-sm font-medium">{title}</h3>
    </div>
  )
}

function TeacherIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <circle cx="12" cy="8" r="3" />
      <path d="M12 11v8" />
    </svg>
  )
}

function StudentIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  )
}

