import { API_BASE_URL } from '../config/config';

export const login = async (credentials, role) => {
    try {
        const endpoint = role === 'profesor' ? '/profesor/login' : '/alumno/login';
        const response = await fetch(`${API_BASE_URL}/api/${role}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en el inicio de sesión');
        }

        // Almacenar en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', role);
        localStorage.setItem('user', JSON.stringify({
            ...data.user,
            clases: data.clases || [],
            invitaciones: data.invitaciones || []
        }));

        return {
            token: data.token,
            user: data.user,
            clases: data.clases || [],
            invitaciones: data.invitaciones || []
        };
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
};

export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

export const getUserRole = () => {
    return localStorage.getItem('role');
};
