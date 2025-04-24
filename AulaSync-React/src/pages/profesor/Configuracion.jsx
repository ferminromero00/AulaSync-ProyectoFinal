import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { subirFotoPerfil, getPerfil, actualizarPerfil, cambiarPassword } from "../../services/perfil";
import { Camera, X } from "lucide-react";

export default function ConfiguracionProfesor() {
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    especialidad: "",
    departamento: ""
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: ""
  });
  const fileInputRef = useRef();
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      console.log("[Configuracion.jsx] Iniciando fetchPerfil");
      try {
        const data = await getPerfil();
        console.log("[Configuracion.jsx] Datos perfil recibidos:", data);
        if (data) {
          setPerfil(data);
          setFotoPreview(data.fotoPerfilUrl || null);
          setEditData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            especialidad: data.especialidad || '',
            departamento: data.departamento || ''
          });
        }
      } catch (error) {
        console.error("[Configuracion.jsx] Error fetching perfil:", error);
        toast.error("Error al cargar perfil. Por favor, inténtalo de nuevo.");
      }
      setIsLoading(false);
    };
    fetchPerfil();
  }, []);

  // Sincronizar editData si cambia perfil
  useEffect(() => {
    if (perfil) {
      setEditData({
        firstName: perfil.firstName || '',
        lastName: perfil.lastName || '',
        email: perfil.email || '',
        especialidad: perfil.especialidad || '',
        departamento: perfil.departamento || ''
      });
    }
  }, [perfil]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
    setFoto(e.target.files[0]);
  };

  const handleFotoUpload = async (e) => {
    e.preventDefault();
    if (!fotoFile) {
        toast.error("No se ha seleccionado ningún archivo");
        return;
    }

    const formData = new FormData();
    formData.append('foto', fotoFile);

    try {
        const response = await subirFotoPerfil(formData);
        if (response.fotoPerfilUrl) {
            toast.success("Foto de perfil actualizada correctamente");
            // Recargar la página después de una pequeña pausa para asegurar que 
            // la transacción se complete y el toast se muestre
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            throw new Error('No se recibió la URL de la imagen');
        }
    } catch (error) {
        console.error('Error en subida:', error);
        toast.error(error.message || "Error al subir la foto");
        setFotoFile(null);
    }
};

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview(perfil?.fotoPerfilUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.repeatPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await cambiarPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cambiar la contraseña");
    }
  };

  const handlePerfilSubmit = async (e) => {
    e.preventDefault();
    try {
        if (!editData.firstName || !editData.lastName || !editData.email) {
            toast.error("Todos los campos son obligatorios");
            return;
        }

        console.log('Enviando datos:', editData); // Debug
        const response = await actualizarPerfil(editData);
        
        if (response.success) {
            setPerfil(prev => ({ ...prev, ...editData }));
            toast.success(response.message || "Perfil actualizado correctamente");
        } else {
            throw new Error(response.error || "Error al actualizar el perfil");
        }
    } catch (error) {
        console.error('Error en handlePerfilSubmit:', error);
        toast.error(error.message || "Error al actualizar el perfil");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6">Configuración de Perfil</h2>
      
      {/* Foto de perfil */}
      <form onSubmit={handleFotoUpload}>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <img
              src={fotoPreview || (perfil?.fotoPerfilUrl || "/default-avatar.png")}
              alt="Foto de perfil"
              className="w-24 h-24 rounded-full object-cover border"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
              onClick={() => fileInputRef.current.click()}
              title="Cambiar foto"
            >
              <Camera className="h-5 w-5" />
            </button>
            {fotoFile && (
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                onClick={handleRemoveFoto}
                title="Quitar selección"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFotoChange}
          />
          <div>
            <div className="font-medium">
              {perfil ? `${perfil.firstName} ${perfil.lastName}` : ''}
            </div>
            <div className="text-gray-500 text-sm">
              {perfil?.email || ''}
            </div>
          </div>
        </div>
        {fotoFile && (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar foto de perfil
          </button>
        )}
      </form>

      {/* Formulario de datos personales */}
      <form onSubmit={handlePerfilSubmit} className="space-y-4 mt-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <input
              type="text"
              name="firstName"
              value={editData.firstName}
              onChange={e => setEditData({ ...editData, firstName: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Apellidos</label>
            <input
              type="text"
              name="lastName"
              value={editData.lastName}
              onChange={e => setEditData({ ...editData, lastName: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={e => setEditData({ ...editData, email: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Especialidad</label>
          <input
            type="text"
            name="especialidad"
            value={editData.especialidad}
            onChange={e => setEditData({ ...editData, especialidad: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Departamento</label>
          <input
            type="text"
            name="departamento"
            value={editData.departamento}
            onChange={e => setEditData({ ...editData, departamento: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Guardar cambios
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-8">
        <h3 className="font-semibold text-lg mb-2">Cambiar contraseña</h3>
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña actual</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nueva contraseña</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Repetir nueva contraseña</label>
          <input
            type="password"
            name="repeatPassword"
            value={passwords.repeatPassword}
            onChange={handlePasswordChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};
