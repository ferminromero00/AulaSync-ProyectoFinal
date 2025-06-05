import { api } from './api';

/**
 * Obtiene todos los anuncios de una clase específica.
 * 
 * @param {number|string} claseId - ID de la clase
 * @returns {Promise<Array>} Lista de anuncios de la clase
 * @throws {Error} Si hay un error al obtener los anuncios
 */
export const obtenerAnuncios = async (claseId) => {
    try {
        const response = await api.get(`/anuncios/clase/${claseId}`);
        return response.anuncios;
    } catch (error) {
        console.error('Error al obtener anuncios:', error);
        return [];
    }
};

/**
 * Crea un nuevo anuncio en una clase.
 * 
 * @param {Object} data - Datos del anuncio
 * @param {number|string} data.claseId - ID de la clase
 * @param {string} data.contenido - Contenido del anuncio
 * @param {'anuncio'|'tarea'} data.tipo - Tipo de anuncio
 * @param {string} [data.titulo] - Título opcional para tareas
 * @param {Date} [data.fechaEntrega] - Fecha límite opcional para tareas
 * @param {File} [data.archivo] - Archivo adjunto opcional
 * @returns {Promise<Object>} Anuncio creado
 * @throws {Error} Si hay un error al crear el anuncio
 */
export const crearAnuncio = async (data) => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
        claseId: data.claseId,
        contenido: data.contenido,
        tipo: data.tipo,
        titulo: data.titulo || null,
        fechaEntrega: data.fechaEntrega || null
    }));

    if (data.archivo) {
        formData.append('archivo', data.archivo);
    }

    return api.post('/anuncios', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

/**
 * Elimina un anuncio específico.
 * 
 * @param {number|string} id - ID del anuncio a eliminar
 * @returns {Promise<void>}
 * @throws {Error} Si hay un error al eliminar el anuncio
 */
export const eliminarAnuncio = async (id) => {
    return api.delete(`/anuncios/${id}`);
};
