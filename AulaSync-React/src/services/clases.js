const API_URL = 'http://localhost:8000/api';

export const getClasesProfesor = async (token) => {
    try {
        const response = await fetch(`${API_URL}/clases/profesor`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener las clases');
        }

        return data;
    } catch (error) {
        throw error;
    }
};

export const crearClase = async (claseData, token) => {
    try {
        const response = await fetch(`${API_URL}/clases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(claseData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error al crear la clase');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
