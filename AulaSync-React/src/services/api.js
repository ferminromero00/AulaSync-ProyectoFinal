const API_URL = 'http://localhost:8000/api';

const api = {
    get: async (url) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Error en la petición');
        return response.json();
    },

    put: async (url, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error en la petición');
        return response.json();
    },

    post: async (url, data) => {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Error en la petición');
        return response.json();
    }
};

export const registerStudent = async (data) => {
    return api.post('/register/student', data);
};

export const registerTeacher = async (data) => {
    return api.post('/register/teacher', data);
};

export default api;
