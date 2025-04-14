import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import RegisterForm from '../components/register-form'

export default function RegisterPage() {
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'alumno';

  const titles = {
    alumno: {
      title: "Registro de nuevo alumno",
      description: "Comienza tu viaje educativo con nosotros. Accede a tus clases, tareas y calificaciones en un solo lugar.",
      gradientClass: "from-green-600 to-green-400",
      textColor: "text-green-100",
      linkColor: "text-green-600 hover:text-green-500"
    },
    profesor: {
      title: "Registro de nuevo profesor",
      description: "Únete a nuestra plataforma educativa. Gestiona tus clases, estudiantes y evaluaciones en un solo lugar.",
      gradientClass: "from-blue-600 to-blue-400",
      textColor: "text-blue-100",
      linkColor: "text-blue-600 hover:text-blue-500"
    }
  };

  const currentTitle = titles[role];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-gray-800">AulaSync</h1>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              {currentTitle.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link to="/" className={`font-medium ${currentTitle.linkColor}`}>
                Inicia sesión
              </Link>
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>

      <div className="relative hidden w-0 flex-1 lg:block">
        <div className={`absolute inset-0 h-full w-full bg-gradient-to-r ${currentTitle.gradientClass}`}>
          <div className="flex h-full flex-col items-center justify-center p-12 text-white">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
              {role === 'profesor' ? <TeacherIcon className="h-8 w-8" /> : <StudentIcon className="h-8 w-8" />}
            </div>
            <h2 className="text-3xl font-bold">Únete a AulaSync</h2>
            <p className={`mt-4 max-w-md text-center text-lg ${currentTitle.textColor}`}>
              {currentTitle.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
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
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <path d="M12 6a6 6 0 0 0-6 6h12a6 6 0 0 0-6-6z" />
    </svg>
  )
}
