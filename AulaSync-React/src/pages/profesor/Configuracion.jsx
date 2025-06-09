import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { subirFotoPerfil, getPerfil, actualizarPerfil, cambiarPassword } from "../../services/perfil";
import { Camera, X, User, Mail, Briefcase, Building2, Lock, Loader2, Settings } from "lucide-react";

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

  // Animación de ticks progresivos para la carga
  const steps = [
    { label: "Cargando perfil...", icon: <User className="h-6 w-6 text-blue-400" /> },
    { label: "Cargando foto de perfil...", icon: <Camera className="h-6 w-6 text-blue-400" /> },
    { label: "Cargando configuración...", icon: <Settings className="h-6 w-6 text-blue-400" /> }
  ];
  const [step, setStep] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const intervalRef = useRef();
  const dotIntervalRef = useRef();

  useEffect(() => {
    if (isLoading) {
      setStep(0);
      intervalRef.current = setInterval(() => {
        setStep(prev => (prev < steps.length ? prev + 1 : prev));
      }, 500);
      dotIntervalRef.current = setInterval(() => {
        setDotCount(prev => (prev + 1) % 3);
      }, 400);
    }
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(dotIntervalRef.current);
    };
  }, [isLoading]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const data = await getPerfil();
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
        toast.error("Error al cargar perfil. Por favor, inténtalo de nuevo.");
      }
      setIsLoading(false);
    };
    fetchPerfil();
  }, []);

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
            setTimeout(() => {
                window.location.reload();
            }, 500);
        } else {
            throw new Error('No se recibió la URL de la imagen');
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
        const response = await actualizarPerfil(editData);
        if (response.success) {
            setPerfil(prev => ({ ...prev, ...editData }));
            toast.success(response.message || "Perfil actualizado correctamente");
        } else {
            throw new Error(response.error || "Error al actualizar el perfil");
        }
    } catch (error) {
        toast.error(error.message || "Error al actualizar el perfil");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div
          className="bg-white rounded-3xl shadow-2xl flex flex-col items-center border border-blue-100 animate-fade-in-up"
          style={{
            padding: "4rem 4.5rem",
            minWidth: 420,
            maxWidth: 520,
            width: "100%",
            boxShadow: "0 10px 48px 0 rgba(59,130,246,0.10)",
            margin: "0 auto"
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
            <span className="text-2xl font-bold text-blue-900">AulaSync</span>
          </div>
          <div className="flex flex-col gap-3 min-w-[300px]">
            {steps.map((s, idx) => (
              <div className="flex items-center gap-3" key={s.label}>
                {step > idx ? (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <svg className="text-blue-500 animate-pop" width="18" height="18" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="#dbeafe"/>
                      <path d="M7 13l3 3 7-7" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                ) : step === idx ? (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></span>
                  </span>
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent"></span>
                  </span>
                )}
                <span className={`text-blue-800 ${step > idx ? "line-through text-blue-700" : ""}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-blue-700 text-sm flex items-center gap-2">
            Un momento, cargando configuración de perfil
            <span className="inline-block w-6 text-blue-700 font-bold" style={{ letterSpacing: 1 }}>
              {".".repeat(dotCount + 1)}
            </span>
          </div>
          <style>{`
            @keyframes fade-in-up {
              0% { opacity: 0; transform: translateY(20px);}
              100% { opacity: 1; transform: translateY(0);}
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.7s cubic-bezier(.4,1.4,.6,1) both;
            }
            @keyframes pop {
              0% { transform: scale(0.7); opacity: 0.5;}
              60% { transform: scale(1.2);}
              100% { transform: scale(1); opacity: 1;}
            }
            .animate-pop { animation: pop 0.4s; }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 mt-8 animate-fadeIn"
      style={{ animation: "fadeSlideIn 0.7s cubic-bezier(.4,1.4,.6,1) forwards", opacity: 0 }}>
      <h2 className="text-2xl font-extrabold mb-8 text-blue-900 flex items-center gap-3">
        <User className="h-7 w-7 text-blue-500" />
        Configuración de Perfil
      </h2>
      
      {/* Foto de perfil */}
      <form onSubmit={handleFotoUpload} className="mb-10">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <img
              src={fotoPreview || (perfil?.fotoPerfilUrl || "/default-avatar.png")}
              alt="Foto de perfil"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-100 shadow-lg transition-all duration-300 group-hover:scale-105"
            />
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 shadow"
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
            <div className="font-semibold text-lg text-blue-900">
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
            className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition"
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
              <User className="h-4 w-4 text-blue-400" /> Nombre
            </label>
            <input
              type="text"
              name="firstName"
              value={editData.firstName}
              onChange={e => setEditData({ ...editData, firstName: e.target.value })}
              className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
              <User className="h-4 w-4 text-blue-400" /> Apellidos
            </label>
            <input
              type="text"
              name="lastName"
              value={editData.lastName}
              onChange={e => setEditData({ ...editData, lastName: e.target.value })}
              className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
            <Mail className="h-4 w-4 text-blue-400" /> Email
          </label>
          <input
            type="email"
            name="email"
            value={editData.email}
            disabled
            className="w-full border border-blue-100 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
            title="No puedes modificar el correo electrónico"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
            <Briefcase className="h-4 w-4 text-blue-400" /> Especialidad
          </label>
          <input
            type="text"
            name="especialidad"
            value={editData.especialidad}
            onChange={e => setEditData({ ...editData, especialidad: e.target.value })}
            className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1 flex items-center gap-1">
            <Building2 className="h-4 w-4 text-blue-400" /> Departamento
          </label>
          <input
            type="text"
            name="departamento"
            value={editData.departamento}
            onChange={e => setEditData({ ...editData, departamento: e.target.value })}
            className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition font-semibold"
        >
          Guardar cambios
        </button>
      </form>

      {/* Cambiar contraseña */}
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-blue-900">
          <Lock className="h-5 w-5 text-blue-400" /> Cambiar contraseña
        </h3>
        <div>
          <label className="block text-sm font-semibold mb-1">Contraseña actual</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Nueva contraseña</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Repetir nueva contraseña</label>
          <input
            type="password"
            name="repeatPassword"
            value={passwords.repeatPassword}
            onChange={handlePasswordChange}
            className="w-full border border-blue-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <button
          type="submit"
          className="w-full mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition font-semibold"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}
