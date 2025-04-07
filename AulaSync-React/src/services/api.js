const API_URL = 'http://localhost:8000/api';

export const registerStudent = async (studentData) => {
    try {
        const response = await fetch(`${API_URL}/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error en el registro');
        }

        return data;
    } catch (error) {
        throw error;
    }
};
