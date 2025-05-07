import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { subirFotoPerfil, getPerfil, actualizarPerfil, cambiarPasswordAlumno } from "../../services/perfil";
import { Camera, X, User, Mail, Lock } from "lucide-react";

const ConfiguracionAlumno = () => {
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", repeatPassword: "" });
  const fileInputRef = useRef();
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await getPerfil();
        setPerfil(data);
        setFotoPreview(data?.fotoPerfilUrl || null);
        setEditData({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || ""
        });
      } catch (error) {
        toast.error("Error al cargar perfil");
      }
      setIsLoading(false);
    };
    fetchPerfil();
  }, []);

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
        if (response.success) {
            window.location.reload();
        } else {
            throw new Error('Error al actualizar la foto de perfil');
        }
    } catch (error) {
        toast.error(error.message || "Error al subir la foto");
        setFotoFile(null);
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
    if (!editData.firstName.trim() || !editData.lastName.trim() || !editData.email.trim()) {
      toast.error("Todos los campos son obligatorios");
      return;
    }
    try {
      await actualizarPerfil(editData);
      setPerfil(prev => ({ ...prev, ...editData }));
      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al actualizar el perfil");
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
    if (passwords.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    try {
      await cambiarPasswordAlumno({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      toast.success("Contraseña actualizada correctamente");
      setPasswords({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al cambiar la contraseña");
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
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeIn"
      style={{ animation: "fadeSlideIn 0.7s cubic-bezier(.4,1.4,.6,1) forwards", opacity: 0 }}>
      <h2 className="text-2xl font-extrabold mb-8 text-green-900 flex items-center gap-3">
        <User className="h-7 w-7 text-green-500" />
        Configuración de Perfil
      </h2>
      {/* Foto de perfil */}
      <form onSubmit={handleFotoUpload} className="mb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={fotoPreview || (perfil?.fotoPerfilUrl || "/default-avatar.png")}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-green-100 shadow-lg transition-all duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 hover:bg-green-700 shadow"
              onClick={() => fileInputRef.current.click()}
              title="Cambiar foto"
            >
              <Camera className="h-5 w-5" />
            </button>
            {fotoFile && (
              <button
                type="button"
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow"
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
            <div className="font-semibold text-lg text-green-900">
              {perfil?.firstName} {perfil?.lastName}
            </div>
            <div className="text-gray-500 text-sm">{perfil?.email}</div>
          </div>
        </div>
        {fotoFile && (
          <button
            type="submit"
            className="mt-4 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition"
          >
            Guardar foto de perfil
          </button>
        )}
      </form>

      {/* Formulario de datos personales */}
      <form onSubmit={handlePerfilSubmit} className="space-y-5 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
              <User className="h-4 w-4 text-green-400" /> Nombre
            </label>
            <input
              type="text"
              name="firstName"
              value={editData.firstName}
              onChange={handleInputChange}
              className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
              <User className="h-4 w-4 text-green-400" /> Apellidos
            </label>
            <input
              type="text"
              name="lastName"
              value={editData.lastName}
              onChange={handleInputChange}
              className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
            <Mail className="h-4 w-4 text-green-400" /> Email
          </label>
          <input
            type="email"
            name="email"
            value={editData.email}
            onChange={handleInputChange}
            className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition font-semibold"
        >
          Guardar cambios
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-green-900">
          <Lock className="h-5 w-5 text-green-400" /> Cambiar contraseña
        </h3>
        <div>
          <label className="block text-sm font-semibold mb-1">Contraseña actual</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Nueva contraseña</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Repetir nueva contraseña</label>
          <input
            type="password"
            name="repeatPassword"
            value={passwords.repeatPassword}
            onChange={handlePasswordChange}
            className="w-full border border-green-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition font-semibold"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
};

export default ConfiguracionAlumno;
