import api from './api';

export const crearAnuncio = async (anuncioData) => {
    try {
        const response = await api.post('/api/anuncios/crear', anuncioData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.error || 'Error al crear el anuncio';
    }
};
