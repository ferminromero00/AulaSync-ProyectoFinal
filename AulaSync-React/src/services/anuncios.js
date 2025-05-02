import api from './api';

export const crearAnuncio = async (data) => {
    try {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        
        if (data.archivo) {
            formData.append('archivo', data.archivo);
        }

        const response = await api.post('/anuncios/crear', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        console.error('Error en crearAnuncio:', error);
        throw error.response?.data?.error || 'Error al crear el anuncio';
    }
};

export const obtenerAnuncios = async (claseId) => {
    try {
        const response = await api.get(`/anuncios/${claseId}`);
        console.log('Respuesta del servidor:', response); // Debug temporal

        // Si la respuesta ya es el objeto con anuncios, úsalo directamente
        const anuncios = response.anuncios || [];
        if (!Array.isArray(anuncios)) {
            throw new Error('Formato de respuesta inválido');
        }

        return anuncios;
    } catch (error) {
        console.error('Error en obtenerAnuncios:', error);
        throw error.response?.data?.error || error.message || 'Error al obtener los anuncios';
    }
};

export const eliminarAnuncio = async (anuncioId) => {
    try {
        const response = await api.delete(`/anuncios/${anuncioId}`);
        return response.data;
    } catch (error) {
        console.error('Error en eliminarAnuncio:', error);
        throw error.response?.data?.error || 'Error al eliminar el anuncio';
    }
};
