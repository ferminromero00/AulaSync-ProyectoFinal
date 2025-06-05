import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPerfil } from '../services/perfil';

/**
 * @typedef {Object} AvatarButtonProps
 * @property {number} [size=40] - Tamaño del avatar en píxeles
 * @property {boolean} [reload=false] - Indica si debe recargar el perfil al cambiar este valor
 */

/**
 * Componente de botón con avatar que muestra la imagen de perfil del usuario
 * y navega a la página de configuración al hacer clic.
 *
 * @param {AvatarButtonProps} props - Propiedades del componente
 * @param {number} [props.size=40] - Tamaño del avatar en píxeles
 * @param {boolean} [props.reload=false] - Si es true, fuerza la recarga del perfil
 * @returns {JSX.Element} Botón circular con la imagen de perfil del usuario
 */
const AvatarButton = ({ size = 40, reload = false }) => {
    const [perfil, setPerfil] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const role = localStorage.getItem('role');

    const fetchPerfil = async () => {
        setLoading(true);
        try {
            const data = await getPerfil();
            setPerfil(data);
        } catch (error) {
            console.error('Error al cargar el perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPerfil();
    }, [reload]);

    const handleClick = () => {
        navigate(`/${role}/configuracion`);
    };

    return (
        <button
            onClick={handleClick}
            className="rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all relative"
            title="Ver perfil"
        >
            {loading ? (
                <div className="animate-pulse bg-gray-200 rounded-full"
                    style={{ width: size, height: size }}></div>
            ) : (
                <img
                    src={perfil?.fotoPerfilUrl || '/uploads/perfiles/default.png'}
                    alt="Foto de perfil"
                    style={{ width: size, height: size }}
                    className="rounded-full object-cover"
                    onError={e => { e.target.src = '/uploads/perfiles/default.png'; }}
                />
            )}
        </button>
    );
};

export default AvatarButton;
