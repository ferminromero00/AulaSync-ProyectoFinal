import { Navigate } from 'react-router-dom';

/**
 * @typedef {Object} ProtectedRouteProps
 * @property {React.ReactNode} children - Componentes hijos a renderizar si la ruta está permitida
 * @property {'profesor'|'alumno'} allowedRole - Rol permitido para acceder a la ruta
 */

/**
 * Componente que protege rutas basado en autenticación y roles de usuario.
 *
 * @param {ProtectedRouteProps} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Elementos hijos que se mostrarán si el usuario tiene acceso
 * @param {'profesor'|'alumno'} props.allowedRole - Rol necesario para acceder a la ruta protegida
 * @returns {JSX.Element} Componentes hijos o redirección según autenticación
 */
export default function ProtectedRoute({ children, allowedRole }) {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
        return <Navigate to="/" replace />;
    }

    if (userRole !== allowedRole) {
        return <Navigate to={`/${userRole}/dashboard`} replace />;
    }

    return children;
}
