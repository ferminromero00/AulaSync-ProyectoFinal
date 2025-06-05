/**
 * Determina y devuelve la URL base de la API según el entorno.
 * En desarrollo usa localhost, en producción usa el dominio actual.
 *
 * @returns {string} URL base de la API formateada, sin punto final
 */
export const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (baseUrl) return baseUrl.replace(/\.$/, ''); // Eliminar punto final si existe
    
    // En desarrollo, usar localhost
    if (import.meta.env.DEV) return 'http://localhost:8000';
    
    // En producción, usar el mismo dominio y protocolo sin puerto
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}`;
};

/**
 * URL base de la API determinada dinámicamente
 * @type {string}
 */
export const API_BASE_URL = getApiUrl();

/**
 * URL completa del endpoint API
 * @type {string}
 */
export const API_URL = `${API_BASE_URL}/api`;