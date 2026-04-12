"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getValetRequests } from "@/lib/api";
import {
  Bell, History, User as UserIcon, MapPin, Car, Trophy,
  Moon, Sun, LogOut, Trash2, ChevronRight, Settings,
  Camera, Clock, CheckCircle, XCircle, AlertCircle,
  Type, Globe, Loader2
} from "lucide-react";

function formatStatus(status: string) {
  return status.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
function statusIcon(status: string) {
  if (status === "completed") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (["cancelled", "rejected"].includes(status)) return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertCircle className="w-4 h-4 text-yellow-400" />;
}
function statusColor(status: string) {
  if (status === "completed") return "text-emerald-400";
  if (["cancelled", "rejected"].includes(status)) return "text-red-400";
  return "text-yellow-400";
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    settings: "Settings", manageAccount: "Manage your account and preferences",
    profile: "Profile", addProfilePicture: "Add Profile Picture",
    uploadPhoto: "Upload a photo for your account", editDisplayName: "Edit Display Name",
    changeNameDesc: "Change how your name appears", general: "General",
    notifications: "Notifications", manageAlerts: "Manage your alerts",
    parkingHistory: "Parking History", viewPast: "View past parking sessions",
    vehicleProfile: "Vehicle Profile", manageVehicle: "Manage your vehicle info",
    favoriteSpots: "Favorite Spots", savedSpots: "Your saved parking spots",
    campusValet: "Campus Valet", requestValet: "Request a valet service",
    valetLeaderboard: "Valet Leaderboard", topValetUsers: "Top valet users on campus",
    valetHistory: "Valet History", noValet: "No valet requests yet.",
    appearance: "Appearance", darkMode: "Dark Mode", lightMode: "Light Mode",
    toggleApp: "Toggle app appearance", fontSize: "Font Size",
    fontSizeDesc: "Adjust text size across the app", language: "Language",
    languageDesc: "Choose your preferred language", account: "Account",
    logOut: "Log Out", deleteAccount: "Delete Account",
    save: "Save", cancel: "Cancel", saving: "Saving...", uploading: "Uploading...",
    small: "Small", medium: "Medium", large: "Large", saveChanges: "Save Changes",
    changesSaved: "Appearance saved successfully!",
  },
  es: {
    settings: "Configuración", manageAccount: "Administra tu cuenta y preferencias",
    profile: "Perfil", addProfilePicture: "Agregar Foto de Perfil",
    uploadPhoto: "Sube una foto para tu cuenta", editDisplayName: "Editar Nombre",
    changeNameDesc: "Cambia cómo aparece tu nombre", general: "General",
    notifications: "Notificaciones", manageAlerts: "Administra tus alertas",
    parkingHistory: "Historial de Estacionamiento", viewPast: "Ver sesiones pasadas",
    vehicleProfile: "Perfil del Vehículo", manageVehicle: "Administra tu vehículo",
    favoriteSpots: "Lugares Favoritos", savedSpots: "Tus lugares guardados",
    campusValet: "Valet del Campus", requestValet: "Solicitar servicio de valet",
    valetLeaderboard: "Tabla de Líderes", topValetUsers: "Mejores usuarios de valet",
    valetHistory: "Historial de Valet", noValet: "Aún no hay solicitudes de valet.",
    appearance: "Apariencia", darkMode: "Modo Oscuro", lightMode: "Modo Claro",
    toggleApp: "Cambiar apariencia", fontSize: "Tamaño de Fuente",
    fontSizeDesc: "Ajusta el tamaño del texto", language: "Idioma",
    languageDesc: "Elige tu idioma preferido", account: "Cuenta",
    logOut: "Cerrar Sesión", deleteAccount: "Eliminar Cuenta",
    save: "Guardar", cancel: "Cancelar", saving: "Guardando...", uploading: "Subiendo...",
    small: "Pequeño", medium: "Mediano", large: "Grande", saveChanges: "Guardar Cambios",
    changesSaved: "¡Apariencia guardada!",
  }
};

export default function SettingsPage() {
  const [fontSize, setFontSize] = useState("medium");
  const [language, setLanguage] = useState("en");
  const [pendingFontSize, setPendingFontSize] = useState("medium");
  const [pendingLanguage, setPendingLanguage] = useState("en");

  const [user] = useAuthState(auth);
  const router = useRouter();
  const [valetHistory, setValetHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [profileName, setProfileName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedFont = localStorage.getItem("rp_fontSize") || "medium";
    const savedLang = localStorage.getItem("rp_language") || "en";
    const savedPhoto = user?.uid ? localStorage.getItem(`rp_photo_${user.uid}`) : null;

    setFontSize(savedFont);
    setLanguage(savedLang);
    setPendingFontSize(savedFont);
    setPendingLanguage(savedLang);
    if (savedPhoto) setPhotoURL(savedPhoto);
  }, [user?.uid]);

  // Load valet history
  useEffect(() => {
    async function load() {
      try {
        const all = await getValetRequests();
        const mine = all.filter((item: any) =>
          item.userEmail?.toLowerCase() === user?.email?.toLowerCase()
        );
        setValetHistory(mine.sort((a: any, b: any) =>
          (b.createdAt || "").localeCompare(a.createdAt || "")
        ));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingHistory(false);
      }
    }
    if (user) load();
  }, [user]);

  // Save appearance — no theme, just font size and language
  const handleSaveAppearance = () => {
    localStorage.setItem("rp_fontSize", pendingFontSize);
    localStorage.setItem("rp_language", pendingLanguage);

    document.documentElement.setAttribute("data-fontsize", pendingFontSize);
    document.documentElement.style.fontSize =
      pendingFontSize === "small" ? "13px" :
      pendingFontSize === "large" ? "17px" : "15px";

    setFontSize(pendingFontSize);
    setLanguage(pendingLanguage);

    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  // Profile photo
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        localStorage.setItem(`rp_photo_${user.uid}`, base64);
        setPhotoURL(base64);
        setUploadingPhoto(false);
      };
      reader.readAsDataURL(file);
    } catch {
      alert("Failed to upload photo.");
      setUploadingPhoto(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("http://127.0.0.1:8000/user/account", {
        method: "DELETE",
        headers: { authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alert("Account deleted successfully.");
        router.push("/sign-in");
      } else {
        alert("Failed to delete account. Please try again.");
      }
    } catch {
      alert("An error occurred. Please try again.");
    }
  };

  const handleSaveName = async () => {
    if (!auth.currentUser || !profileName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: profileName.trim() });
      setEditingName(false);
    } catch {
      alert("Failed to update name.");
    } finally {
      setSavingName(false);
    }
  };

  const navLinks = [
    { href: "/notifications", icon: Bell, label: t.notifications, desc: t.manageAlerts },
    { href: "/history", icon: History, label: t.parkingHistory, desc: t.viewPast },
    { href: "/vehicle-profile", icon: UserIcon, label: t.vehicleProfile, desc: t.manageVehicle },
    { href: "/favorite-spots", icon: MapPin, label: t.favoriteSpots, desc: t.savedSpots },
    { href: "/valet", icon: Car, label: t.campusValet, desc: t.requestValet },
    { href: "/leaderboard", icon: Trophy, label: t.valetLeaderboard, desc: t.topValetUsers },
  ];

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <div className="min-h-screen bg-[#0d2818] text-white">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

      {savedBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-[#02140a] font-bold px-6 py-3 rounded-2xl shadow-xl">
          ✓ {t.changesSaved}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#142a1e] border border-[#2a5438] flex items-center justify-center">
            <Settings className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{t.settings}</h1>
            <p className="text-sm text-emerald-200/60">{t.manageAccount}</p>
          </div>
        </div>

        {/* Profile */}
        {user && (
          <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a5438]">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{t.profile}</p>
            </div>
            <div className="px-4 py-4 flex items-center gap-4 border-b border-[#2a5438]/50">
              <div className="relative">
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-300 flex items-center justify-center text-[#02140a] font-bold text-xl">
                    {initials}
                  </div>
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="bg-[#0d2818] border border-[#2a5438] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-400 flex-1"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Enter your name"
                      autoFocus
                    />
                    <button onClick={handleSaveName} disabled={savingName}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-[#02140a] text-xs font-bold rounded-lg transition">
                      {savingName ? t.saving : t.save}
                    </button>
                    <button onClick={() => setEditingName(false)}
                      className="px-3 py-1.5 bg-[#1a3d28] text-emerald-200 text-xs rounded-lg transition">
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="font-semibold text-white">{user.displayName || user.email?.split("@")[0]}</div>
                    <div className="text-xs text-emerald-200/60">{user.email}</div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-[#1a3d28] transition-colors border-b border-[#2a5438]/50 disabled:opacity-50">
              <div className="flex items-center gap-3">
                {uploadingPhoto ? <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" /> : <Camera className="w-4 h-4 text-emerald-300" />}
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{t.addProfilePicture}</div>
                  <div className="text-xs text-emerald-200/50">{uploadingPhoto ? t.uploading : t.uploadPhoto}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/40" />
            </button>

            <button onClick={() => { setProfileName(user.displayName || ""); setEditingName(true); }}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-[#1a3d28] transition-colors">
              <div className="flex items-center gap-3">
                <UserIcon className="w-4 h-4 text-emerald-300" />
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{t.editDisplayName}</div>
                  <div className="text-xs text-emerald-200/50">{t.changeNameDesc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/40" />
            </button>
          </div>
        )}

        {/* General */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a5438]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{t.general}</p>
          </div>
          {navLinks.map((item, i) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center justify-between px-4 py-3 hover:bg-[#1a3d28] transition-colors ${i < navLinks.length - 1 ? "border-b border-[#2a5438]/50" : ""}`}>
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-emerald-300" />
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-emerald-200/50">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/40" />
            </Link>
          ))}
        </div>

        {/* Valet History */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a5438] flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-300" />
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{t.valetHistory}</p>
          </div>
          {loadingHistory ? (
            <div className="px-4 py-6 text-center text-xs text-emerald-200/50">Loading...</div>
          ) : valetHistory.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-emerald-200/50">{t.noValet}</div>
          ) : (
            valetHistory.map((item, i) => (
              <div key={item.id} className={`px-4 py-3 ${i < valetHistory.length - 1 ? "border-b border-[#2a5438]/50" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusIcon(item.status)}
                    <div>
                      <div className="text-sm font-medium text-white">{item.pickupLocation || "Campus"}</div>
                      <div className="text-xs text-emerald-200/50">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                        {item.requestedTime ? ` · ${item.requestedTime}` : ""}
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold ${statusColor(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Appearance — no theme toggle, just font size and language */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a5438]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{t.appearance}</p>
          </div>

          {/* Font size */}
          <div className="px-4 py-3 border-b border-[#2a5438]/50">
            <div className="flex items-center gap-3 mb-3">
              <Type className="w-4 h-4 text-emerald-300" />
              <div>
                <div className="text-sm font-medium text-white">{t.fontSize}</div>
                <div className="text-xs text-emerald-200/50">{t.fontSizeDesc}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((size) => (
                <button key={size} onClick={() => setPendingFontSize(size)}
                  className={`flex-1 py-2 rounded-xl border font-semibold text-sm transition-all ${
                    pendingFontSize === size
                      ? "bg-emerald-500 border-emerald-400 text-[#02140a]"
                      : "bg-[#0d2818] border-[#2a5438] text-emerald-200 hover:border-emerald-400"
                  }`}>
                  {t[size as keyof typeof t]}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="px-4 py-3 border-b border-[#2a5438]/50">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="w-4 h-4 text-emerald-300" />
              <div>
                <div className="text-sm font-medium text-white">{t.language}</div>
                <div className="text-xs text-emerald-200/50">{t.languageDesc}</div>
              </div>
            </div>
            <div className="flex gap-2">
              {[{ code: "en", label: "🇺🇸 English" }, { code: "es", label: "🇪🇸 Español" }].map((lang) => (
                <button key={lang.code} onClick={() => setPendingLanguage(lang.code)}
                  className={`flex-1 py-2 rounded-xl border font-semibold text-sm transition-all ${
                    pendingLanguage === lang.code
                      ? "bg-emerald-500 border-emerald-400 text-[#02140a]"
                      : "bg-[#0d2818] border-[#2a5438] text-emerald-200 hover:border-emerald-400"
                  }`}>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Changes */}
          <div className="px-4 py-3">
            <button onClick={handleSaveAppearance}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#02140a] font-bold text-sm transition-all shadow-lg">
              {t.saveChanges}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="bg-[#142a1e] border border-[#2a5438] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a5438]">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">{t.account}</p>
          </div>
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-[#1a3d28] transition-colors border-b border-[#2a5438]/50">
            <LogOut className="w-4 h-4 text-red-400" />
            <div className="text-sm font-medium text-red-400">{t.logOut}</div>
          </button>
          <button onClick={handleDeleteAccount}
            className="flex w-full items-center gap-3 px-4 py-3 hover:bg-red-900/20 transition-colors">
            <Trash2 className="w-4 h-4 text-red-600" />
            <div className="text-sm font-medium text-red-600">{t.deleteAccount}</div>
          </button>
        </div>

      </div>
    </div>
  );
}