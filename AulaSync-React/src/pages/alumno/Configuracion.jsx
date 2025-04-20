import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { subirFotoPerfil, getPerfil, actualizarPerfil, cambiarPasswordAlumno } from "../../services/perfil";
import { Camera, X } from "lucide-react";

const ConfiguracionAlumno = () => {
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", repeatPassword: "" });
  const fileInputRef = useRef();

  // Cargar datos del perfil al montar
  useEffect(() => {
    const fetchPerfil = async () => {
      console.log("[ConfiguracionAlumno.jsx] Iniciando fetchPerfil");
      try {
        const data = await getPerfil();
        console.log("[ConfiguracionAlumno.jsx] Datos perfil recibidos:", data);
        setPerfil(data);
        // Check if fotoPerfilUrl exists before setting it
        setFotoPreview(data?.fotoPerfilUrl || null);
        setEditData({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || ""
        });
      } catch (error) {
        console.error("[ConfiguracionAlumno.jsx] Error fetching perfil:", error);
        toast.error("Error al cargar perfil");
      }
      setIsLoading(false);
    };
    fetchPerfil();
  }, []);

  // Sincronizar editData si cambia perfil
  useEffect(() => {
    if (perfil) {
      setEditData({
        firstName: perfil.firstName || "",
        lastName: perfil.lastName || "",
        email: perfil.email || ""
      });
    }
  }, [perfil]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleFotoUpload = async (e) => {
    e.preventDefault();
    if (!fotoFile) return;
    try {
      const formData = new FormData();
      formData.append("foto", fotoFile);
      const data = await subirFotoPerfil(formData);
      setPerfil((prev) => ({ ...prev, fotoPerfilUrl: data.fotoPerfilUrl }));
      toast.success("Foto de perfil actualizada");
      setFotoFile(null);
    } catch {
      toast.error("Error al subir la foto");
    }
  };

  const handleRemoveFoto = () => {
    setFotoFile(null);
    setFotoPreview(perfil?.fotoPerfilUrl || null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePerfilSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarPerfil(editData);
      setPerfil((prev) => ({ ...prev, ...editData }));
      toast.success("Perfil actualizado correctamente");
    } catch {
      toast.error("Error al actualizar perfil");
    }
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
    try {
      await cambiarPasswordAlumno({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (err) {
      toast.error("Error al cambiar la contraseña");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
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
              className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 hover:bg-green-700"
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
            <div className="font-medium">{perfil?.firstName} {perfil?.lastName}</div>
            <div className="text-gray-500 text-sm">{perfil?.email}</div>
          </div>
        </div>
        {fotoFile && (
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
              onChange={handleInputChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Apellidos</label>
            <input
              type="text"
              name="lastName"
              value={editData.lastName}
              onChange={handleInputChange}
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
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};

export default ConfiguracionAlumno;
