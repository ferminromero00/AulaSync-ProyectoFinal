import { handleRequest } from './api';

/**
 * Busca alumnos por un término de búsqueda (nombre, email, etc).
 * 
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Lista de alumnos que coinciden con la búsqueda
 * @throws {Error} Si ocurre un error en la búsqueda
 */
export const searchAlumnos = async (query) => {
    try {
        console.log('searchAlumnos - Iniciando búsqueda con query:', query);
        console.log('searchAlumnos - Token actual:', localStorage.getItem('token'));
        console.log('searchAlumnos - Rol actual:', localStorage.getItem('role'));
        
        // Cambiamos la ruta para que coincida con la configuración del backend
        return await handleRequest(`/profesor/alumnos/search?query=${encodeURIComponent(query)}`);
    } catch (error) {
        console.error('Error en searchAlumnos:', error);
        console.error('Error completo:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};
