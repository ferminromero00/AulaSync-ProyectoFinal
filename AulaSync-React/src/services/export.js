import { API_BASE_URL } from '../config/config';

/**
 * Descarga el informe CSV de una clase por su ID.
 * 
 * @param {number|string} claseId - ID de la clase a exportar
 * @returns {Promise<void>} Descarga el archivo CSV
 * @throws {Error} Si ocurre un error al descargar el archivo
 */
export const downloadClaseCSV = async (claseId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/export/clase/${claseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `clase-${claseId}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

/**
 * Descarga el informe CSV de una tarea por su ID.
 * 
 * @param {number|string} tareaId - ID de la tarea a exportar
 * @returns {Promise<void>} Descarga el archivo CSV
 * @throws {Error} Si ocurre un error al descargar el archivo
 */
export const downloadTareaCSV = async (tareaId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/export/tarea/${tareaId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al descargar el archivo');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tarea-${tareaId}-report.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
