export const getApiUrl = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    if (baseUrl) return baseUrl;
    
    // En desarrollo, usar localhost
    if (import.meta.env.DEV) return 'http://localhost:8000';
    
    // En producción, usar el mismo dominio y protocolo sin puerto
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}`;
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;