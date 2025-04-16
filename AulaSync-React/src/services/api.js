const BASE_URL = 'http://localhost:8000/api';

const handleError = (error) => {
    if (error.message === 'Failed to fetch') {
        throw new Error('ERROR_DE_RED');
    }
    throw error;
};

export const handleRequest = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const tokenTimestamp = localStorage.getItem('tokenTimestamp');
    
    if (!token) {
        localStorage.clear();
        throw new Error('NO_TOKEN');
    }

    if (tokenTimestamp && Date.now() - parseInt(tokenTimestamp) > 3600000) {
        localStorage.clear();
        throw new Error('TOKEN_EXPIRED');
    }

    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${BASE_URL}${url}`, config);

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
        console.error('Request Error:', error);
        throw error;
    }
};

export const api = {
    async get(endpoint) {
        try {
            return await handleRequest(endpoint);
        } catch (error) {
            handleError(error);
        }
    },

    async post(endpoint, data) {
        try {
            return await handleRequest(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (error) {
            handleError(error);
        }
    }
};

export const registerStudent = async (data) => {
    return handleRequest('/registro', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export const registerTeacher = async (data) => {
    return handleRequest('/registro/profesor', {
        method: 'POST',
        body: JSON.stringify(data)
    });
};

export default api;
