import api from './api';

export const crearAnuncio = async (anuncioData) => {
    try {
        const response = await api.post('/anuncios/crear', anuncioData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al crear el anuncio';
    }
};

export const obtenerAnuncios = async (claseId) => {
    try {
        const response = await api.get(`/anuncios/${claseId}`);
        console.log('Respuesta anuncios:', response); // Debug
        return response.anuncios || [];
    } catch (error) {
        console.error('Error en obtenerAnuncios:', error);
        throw error.response?.data?.error || 'Error al obtener los anuncios';
    }
};
