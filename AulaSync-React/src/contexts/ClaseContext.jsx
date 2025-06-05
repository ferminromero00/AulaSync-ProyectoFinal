import { createContext, useState, useContext } from 'react';

/**
 * @typedef {Object} ClaseContextType
 * @property {Object|null} claseData - Datos de la clase actual
 * @property {Function} setClaseData - Función para actualizar datos de la clase
 * @property {Array} anuncios - Lista de anuncios de la clase
 * @property {Function} setAnuncios - Función para actualizar anuncios
 */

/**
 * Contexto para gestionar el estado de una clase y sus anuncios.
 * Proporciona acceso a los datos de la clase actual en toda la aplicación.
 * 
 * @type {React.Context<ClaseContextType>}
 */
const ClaseContext = createContext();

/**
 * Proveedor del contexto de clase.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componentes hijos
 * @returns {JSX.Element} Proveedor del contexto
 */
export function ClaseProvider({ children }) {
    const [claseData, setClaseData] = useState(null);
    const [anuncios, setAnuncios] = useState([]);

    return (
        <ClaseContext.Provider value={{ 
            claseData, 
            setClaseData, 
            anuncios, 
            setAnuncios
        }}>
            {children}
        </ClaseContext.Provider>
    );
}

/**
 * Hook personalizado para acceder al contexto de clase.
 * 
 * @returns {ClaseContextType} Contexto de la clase actual
 * @throws {Error} Si se usa fuera de ClaseProvider
 */
export function useClase() {
    const context = useContext(ClaseContext);
    if (!context) {
        throw new Error('useClase debe usarse dentro de ClaseProvider');
    }
    return context;
}
