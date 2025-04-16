const API_URL = 'http://localhost:8000/api';

export const handleRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');

    // Verificar si hay token y si no es una ruta pública
    if (!token && !endpoint.includes('/register') && !endpoint.includes('/login')) {
        throw new Error('NO_TOKEN');
    }

    // Verificar si el token ha expirado (1 hora)
    if (tokenTimestamp && Date.now() - parseInt(tokenTimestamp) > 3600000) {
        localStorage.clear();
        throw new Error('TOKEN_EXPIRED');
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    // Añadir el token solo si existe
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        if (response.status === 401) {
            localStorage.clear();
            throw new Error('UNAUTHORIZED');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.message || 'Error en la petición');
        }

        return response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

const api = {
    get: async (url) => {
        return handleRequest(url);
    },

    put: async (url, data) => {
        return handleRequest(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    post: async (url, data) => {
        return handleRequest(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
};

export const registerStudent = async (data) => {
    return api.post('/register/student', data);
};

export const registerTeacher = async (data) => {
    return api.post('/register/teacher', data);
};

export default api;
