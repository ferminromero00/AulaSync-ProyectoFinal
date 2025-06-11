import { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { subirFotoPerfil, getPerfil, actualizarPerfil, cambiarPasswordAlumno } from "../../services/perfil";
import { Camera, X, User, Mail, Lock, Briefcase, BookOpen, Loader2, Settings } from "lucide-react";

const ConfiguracionAlumno = () => {
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoFile, setFotoFile] = useState(null);
  const [editData, setEditData] = useState({ firstName: "", lastName: "", email: "", especialidad: "", departamento: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", repeatPassword: "" });
  const fileInputRef = useRef();

  // Animación de ticks progresivos para la carga (estilo alumno)
  const steps = [
    { label: "Cargando perfil...", icon: <User className="h-6 w-6 text-green-400" /> },
    { label: "Cargando foto de perfil...", icon: <Camera className="h-6 w-6 text-green-400" /> },
    { label: "Cargando configuración...", icon: <Settings className="h-6 w-6 text-green-400" /> }
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
        setPerfil(data);
        setFotoPreview(data?.fotoPerfilUrl || null);
        setEditData({
          firstName: data?.firstName || "",
          lastName: data?.lastName || "",
          email: data?.email || "",
          especialidad: data?.especialidad || "",
          departamento: data?.departamento || ""
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
        email: perfil.email || "",
        especialidad: perfil.especialidad || "",
        departamento: perfil.departamento || ""
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

  // Cartel de carga responsive y centrado
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <div
          className={`
            bg-white rounded-3xl shadow-2xl flex flex-col items-center border border-green-100 animate-fade-in-up
            ${window.innerWidth < 640 ? "px-4 py-6 max-w-[320px] w-full" : "sm:px-16 sm:py-12 px-8 py-8"}
          `}
          style={{
            minWidth: window.innerWidth < 640 ? 0 : 340,
            maxWidth: window.innerWidth < 640 ? 320 : 420,
            width: window.innerWidth < 640 ? '95vw' : '100%',
            margin: "0 auto"
          }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Loader2 className={`h-12 w-12 text-green-500 animate-spin ${window.innerWidth < 640 ? "h-8 w-8" : ""}`} />
            <span className={`text-2xl font-bold text-green-900 ${window.innerWidth < 640 ? "text-lg" : ""}`}>AulaSync</span>
          </div>
          <div className={`flex flex-col gap-3 min-w-[200px] ${window.innerWidth < 640 ? "min-w-0 items-center text-center w-full" : ""}`}>
            {steps.map((s, idx) => (
              <div className={`flex items-center gap-3 ${window.innerWidth < 640 ? "justify-center w-full" : ""}`} key={s.label}>
                <span className="w-4 h-4 flex items-center justify-center">
                  {s.icon}
                </span>
                <span className={`text-green-800 ${window.innerWidth < 640 ? "text-sm" : ""}`}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className={`mt-8 text-green-700 text-sm flex items-center gap-2 ${window.innerWidth < 640 ? "mt-4 text-xs justify-center w-full text-center" : ""}`}>
            Un momento, cargando configuración de perfil
            <span className={`inline-block w-6 text-green-700 font-bold ${window.innerWidth < 640 ? "w-4" : ""}`} style={{ letterSpacing: 1 }}>
              {".".repeat(3)}
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
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-50">
      <div 
        className={`bg-white rounded-xl shadow-lg animate-fadeIn
          ${window.innerWidth < 640 ? 'w-[95%] my-2' : 'max-w-2xl m-8'}`}
        style={{
          maxWidth: window.innerWidth < 640 ? '360px' : '42rem',
          minHeight: window.innerWidth < 640 ? 'calc(100vh - 16px)' : 'auto',
          padding: window.innerWidth < 640 ? '16px' : '32px',
          overflowY: 'auto',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <h2 className={`text-green-900 flex items-center gap-3 mb-6 ${window.innerWidth < 640 ? "text-lg" : "text-2xl font-extrabold mb-8"}`}>
          <User className={`${window.innerWidth < 640 ? "h-5 w-5" : "h-7 w-7"} text-green-500`} />
          Configuración de Perfil
        </h2>
        {/* Foto de perfil */}
        <form onSubmit={handleFotoUpload} className="mb-8">
          <div className="flex items-center gap-8">
            <div className="relative group">
              <img
                src={fotoPreview || perfil?.fotoPerfilUrl || '/uploads/perfiles/default.png'}
                alt="Foto de perfil"
                className="rounded-full object-cover border-2 border-green-200 shadow"
                style={{
                  width: window.innerWidth < 640 ? 88 : 120,
                  height: window.innerWidth < 640 ? 88 : 120,
                  minWidth: window.innerWidth < 640 ? 88 : 120,
                  minHeight: window.innerWidth < 640 ? 88 : 120,
                  maxWidth: window.innerWidth < 640 ? 88 : 120,
                  maxHeight: window.innerWidth < 640 ? 88 : 120,
                  aspectRatio: "1/1",
                  objectFit: "cover"
                }}
                onError={e => { e.target.src = '/uploads/perfiles/default.png'; }}
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
              <div className="font-bold text-xl text-green-900">{perfil?.firstName} {perfil?.lastName}</div>
            </div>
          </div>
          {fotoFile && (
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition font-semibold"
            >
              Guardar foto de perfil
            </button>
          )}
        </form>

        {/* Formulario de datos personales */}
        <form onSubmit={handlePerfilSubmit} className="space-y-6 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-green-900">
                <User className="h-4 w-4 text-green-400" /> Nombre
              </label>
              <input
                type="text"
                name="firstName"
                value={editData.firstName}
                onChange={handleInputChange}
                className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-green-900">
                <User className="h-4 w-4 text-green-400" /> Apellidos
              </label>
              <input
                type="text"
                name="lastName"
                value={editData.lastName}
                onChange={handleInputChange}
                className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-green-900">
              <Mail className="h-4 w-4 text-green-400" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={editData.email}
              disabled
              className="w-full border border-green-100 rounded-lg px-4 py-2 bg-gray-50 text-gray-600 cursor-not-allowed"
              title="No puedes modificar el correo electrónico"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-green-900">
                <BookOpen className="h-4 w-4 text-green-400" /> Especialidad
              </label>
              <input
                type="text"
                name="especialidad"
                value={editData.especialidad}
                onChange={handleInputChange}
                className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                placeholder="(opcional)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-1 text-green-900">
                <Briefcase className="h-4 w-4 text-green-400" /> Departamento
              </label>
              <input
                type="text"
                name="departamento"
                value={editData.departamento}
                onChange={handleInputChange}
                className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                placeholder="(opcional)"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition font-semibold text-lg"
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
            <label className="block text-sm font-semibold mb-1 text-green-900">Contraseña actual</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-900">Nueva contraseña</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-green-900">Repetir nueva contraseña</label>
            <input
              type="password"
              name="repeatPassword"
              value={passwords.repeatPassword}
              onChange={handlePasswordChange}
              className="w-full border border-green-100 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow transition font-semibold text-lg"
          >
            Cambiar contraseña
          </button>
        </form>
        <style>{`
          @media (max-width: 640px) {
            div::-webkit-scrollbar {
              display: none;
            }
          }
          @keyframes fadeSlideIn {
            0% { opacity: 0; transform: translateY(20px);}
            100% { opacity: 1; transform: none;}
          }
          .animate-fadeIn {
            animation: fadeSlideIn 0.7s cubic-bezier(.4,1.4,.6,1) forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ConfiguracionAlumno;
