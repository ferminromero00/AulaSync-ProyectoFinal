const API_URL = 'http://localhost:8000/api';

export const login = async (credentials, role) => {
    try {
        const endpoint = role === 'profesor' ? '/profesor/login' : '/alumno/login';
        const response = await fetch(`${API_URL}${endpoint}`, {
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

        // Guardamos el token y la información del usuario
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('role', role);
        }

        return data;
    } catch (error) {
        console.error('Error en la petición:', error);
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
