"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Car, Save, CheckCircle, Edit3, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface Vehicle {
  make: string;
  model: string;
  color: string;
}

interface UserVehicleData {
  vehicles?: Vehicle[];
  selectedVehicleIndex?: number;
}

const emptyVehicle: Vehicle = { make: "", model: "", color: "" };

export default function VehicleProfilePage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);
  const [vehicle, setVehicle] = useState<Vehicle>(emptyVehicle);
  const [mode, setMode] = useState<"view" | "add" | "edit">("view");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserVehicleData;
          const savedVehicles = Array.isArray(data.vehicles) ? data.vehicles : [];

          setVehicles(savedVehicles);

          if (savedVehicles.length > 0) {
            const idx = Math.min(data.selectedVehicleIndex ?? 0, savedVehicles.length - 1);
            setSelectedVehicleIndex(idx);
            setVehicle(savedVehicles[idx]);
          } else {
            setVehicle(emptyVehicle);
          }
        }
      } catch (error) {
        console.error("Error loading vehicles:", error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, [user]);

  const handleInputChange = (field: keyof Vehicle, value: string) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const startAddVehicle = () => {
    setVehicle(emptyVehicle);
    setMode("add");
  };

  const startEditVehicle = (index: number) => {
    setSelectedVehicleIndex(index);
    setVehicle(vehicles[index]);
    setMode("edit");
  };

  const selectVehicle = (index: number) => {
    setSelectedVehicleIndex(index);
    setVehicle(vehicles[index]);
    setMode("view");
  };

  const saveVehicle = async () => {
    if (!user || !vehicle.make || !vehicle.model || !vehicle.color) return;
    if (saving) return;

    try {
      setSaving(true);

      let nextVehicles = [...vehicles];
      let nextSelectedIndex = selectedVehicleIndex;

      if (mode === "edit" && vehicles[selectedVehicleIndex]) {
        nextVehicles[selectedVehicleIndex] = vehicle;
        nextSelectedIndex = selectedVehicleIndex;
      } else if (mode === "add") {
        nextVehicles.push(vehicle);
        nextSelectedIndex = nextVehicles.length - 1;
      } else if (vehicles.length === 0) {
        nextVehicles.push(vehicle);
        nextSelectedIndex = 0;
      } else {
        nextVehicles[selectedVehicleIndex] = vehicle;
        nextSelectedIndex = selectedVehicleIndex;
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          vehicles: nextVehicles,
          selectedVehicleIndex: nextSelectedIndex,
        },
        { merge: true }
      );

      setVehicles(nextVehicles);
      setSelectedVehicleIndex(nextSelectedIndex);
      setVehicle(nextVehicles[nextSelectedIndex]);
      setMode("view");
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      alert("Failed to save vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async (indexToDelete: number) => {
    if (!user || !confirm("Delete this vehicle profile?")) return;

    try {
      const nextVehicles = vehicles.filter((_, index) => index !== indexToDelete);
      const nextSelectedIndex = nextVehicles.length === 0 ? 0 : Math.min(selectedVehicleIndex, nextVehicles.length - 1);

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          vehicles: nextVehicles,
          selectedVehicleIndex: nextSelectedIndex,
        },
        { merge: true }
      );

      setVehicles(nextVehicles);
      setSelectedVehicleIndex(nextSelectedIndex);
      setVehicle(nextVehicles[nextSelectedIndex] || emptyVehicle);
      setMode("view");
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      alert("Failed to delete vehicle.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center p-6">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasVehicles = vehicles.length > 0;
  const isFormVisible = mode === "add" || mode === "edit" || !hasVehicles;

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-3xl border p-10 bg-[#142a1e] border-[#2a5438] shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Car className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Vehicle Profile</h1>
              <p className="text-emerald-200/80 text-lg">
                {hasVehicles && mode === "view"
                  ? "Manage one or more vehicles linked to your account"
                  : "Add one or more vehicles for personalized parking sessions"}
              </p>
            </div>
          </div>

          <button
            onClick={startAddVehicle}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#132217] font-bold transition"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {hasVehicles && mode === "view" && (
          <div className="mb-8 grid gap-3">
            <p className="text-sm uppercase tracking-wide text-slate-300 font-semibold">
              Your Vehicles
            </p>

            <div className="grid gap-3">
              {vehicles.map((v, index) => (
                <div
                  key={`${v.make}-${v.model}-${index}`}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedVehicleIndex === index
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-[#2a5438] bg-[#0d2818] hover:border-emerald-400/50"
                  }`}
                  onClick={() => selectVehicle(index)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold">
                        {v.make} {v.model}
                      </h2>
                      <p className="text-emerald-300">{v.color}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditVehicle(index);
                        }}
                        className="px-3 py-2 rounded-xl border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteVehicle(index);
                        }}
                        className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isFormVisible && (
          <div className="space-y-6">
            {hasVehicles && mode !== "add" && mode !== "edit" ? null : null}

            <div>
              <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                Make *
              </label>
              <input
                className="w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium text-lg bg-[#0d2818] border-[#2a5438] placeholder-slate-500 focus:border-emerald-400 focus:outline-none text-white"
                placeholder="Toyota"
                value={vehicle.make}
                onChange={(e) => handleInputChange("make", e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                  Model *
                </label>
                <input
                  className="w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium bg-[#0d2818] border-[#2a5438] placeholder-slate-500 focus:border-emerald-400 focus:outline-none text-white"
                  placeholder="Camry"
                  value={vehicle.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                  Color *
                </label>
                <input
                  className="w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium bg-[#0d2818] border-[#2a5438] placeholder-slate-500 focus:border-emerald-400 focus:outline-none text-white"
                  placeholder="Silver"
                  value={vehicle.color}
                  onChange={(e) => handleInputChange("color", e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <button
              onClick={saveVehicle}
              disabled={saving || !vehicle.make || !vehicle.model || !vehicle.color}
              className={`mt-10 w-full py-5 px-8 rounded-3xl font-bold text-lg shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto ${
                !vehicle.make || !vehicle.model || !vehicle.color
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-1"
              } bg-gradient-to-r from-[#e0b83a] to-[#c9a227] hover:from-[#d4a737] hover:to-[#b89420] text-[#132217] shadow-yellow-500/50`}
            >
              {saving ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-[#132217] border-t-transparent rounded-full" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  {mode === "edit" ? "Update Vehicle Profile" : "Save Vehicle Profile"}
                </>
              )}
            </button>
          </div>
        )}

        {hasVehicles && mode === "view" && (
          <button
            onClick={() => startEditVehicle(selectedVehicleIndex)}
            className="mt-6 w-full py-4 px-8 rounded-2xl font-semibold transition-all border-2 flex items-center justify-center gap-3 border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-900/30 text-emerald-300 hover:text-emerald-200"
          >
            <Edit3 className="w-5 h-5" />
            Edit Selected Vehicle
          </button>
        )}

        {savedSuccess && (
          <div className="mt-8 p-8 rounded-3xl text-center font-bold shadow-2xl bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border-4 border-emerald-500/80 text-emerald-100 backdrop-blur-sm">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
            <div className="text-2xl mb-2">Vehicle Saved!</div>
            <div className="text-lg text-emerald-200">
              Your vehicle profile is now linked to your parking sessions
            </div>
          </div>
        )}
      </div>
    </div>
  );
}