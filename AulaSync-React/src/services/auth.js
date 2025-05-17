import { API_BASE_URL } from '../config/config';

export const login = async (credentials) => {
    try {
        // Asegura que credentials.role existe
        const role = credentials.role;
        if (!role) {
            throw new Error('Role no especificado');
        }

        const response = await fetch(`${API_BASE_URL}/api/${role}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password
            }),
        });

        if (!response.ok) {
            throw new Error('Credenciales inválidas');
        }

        const data = await response.json();
        
        // Guardar el token y otros datos
        localStorage.setItem('token', data.token);
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        localStorage.setItem('role', role);
        
        return {
            ...data,
            role
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
