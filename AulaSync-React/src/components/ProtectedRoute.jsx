import { Navigate } from 'react-router-dom';

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
