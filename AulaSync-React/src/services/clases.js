const API_URL = 'http://localhost:8000/api';

export const getClasesProfesor = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases/profesor`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener las clases');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const crearClase = async (claseData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/clases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(claseData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear la clase');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};
