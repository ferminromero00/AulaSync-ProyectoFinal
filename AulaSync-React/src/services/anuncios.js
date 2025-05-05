import { api } from './api';

export const obtenerAnuncios = async (claseId) => {
    try {
        const response = await api.get(`/anuncios/clase/${claseId}`);
        return response.anuncios;
    } catch (error) {
        console.error('Error al obtener anuncios:', error);
        return [];
    }
};

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

export const eliminarAnuncio = async (id) => {
    return api.delete(`/anuncios/${id}`);
};
