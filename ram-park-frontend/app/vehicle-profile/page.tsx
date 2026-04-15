"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Car, Save, CheckCircle, Edit3, Trash2 } from 'lucide-react';

interface Vehicle {
  make: string;
  model: string;
  color: string;
}

export default function VehicleProfilePage() {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle>({ make: '', model: '', color: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasVehicle, setHasVehicle] = useState(false);

  const pageBg = 'bg-[#0d2818]';
  const cardBg = 'bg-[#142a1e] border-[#2a5438]';
  const textColor = 'text-slate-50';
  const subtitleColor = 'text-emerald-200/80';
  const inputBg = 'bg-[#0d2818] border-[#2a5438] placeholder-slate-500 focus:border-emerald-400 focus:outline-none';
  const inputText = 'text-white';

  useEffect(() => {
    const loadVehicle = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.vehicle) {
            setVehicle(data.vehicle);
            setHasVehicle(true);
            setEditing(false);
          }
        }
      } catch (error) {
        console.error('Error loading vehicle:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicle();
  }, [user]);

  const handleInputChange = (field: keyof Vehicle, value: string) => {
    setVehicle(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const saveVehicle = async () => {
    if (!user || !vehicle.make || !vehicle.model || !vehicle.color) return;

    try {
      setSaving(true);
      
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { vehicle }, { merge: true });

      setSavedSuccess(true);
      setEditing(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Failed to save vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const deleteVehicle = async () => {
    if (!user || !confirm('Delete your vehicle profile?')) return;

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { vehicle: null });
      setVehicle({ make: '', model: '', color: '' });
      setHasVehicle(false);
      setEditing(false);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Failed to delete vehicle.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center p-6">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-50 p-6">
      <div className={`mx-auto max-w-2xl rounded-3xl border p-10 ${cardBg} shadow-2xl`}>
        <div className="flex items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vehicle Profile</h1>
            <p className={`${subtitleColor} text-lg`}>
              {hasVehicle && !editing 
                ? 'Your vehicle is saved and linked to parking sessions'
                : 'Add your vehicle details for personalized recommendations'
              }
            </p>
          </div>
        </div>

        {hasVehicle && !editing && (
          <div 
            className="mb-8 p-8 rounded-3xl bg-gradient-to-r border-2 border-dashed cursor-pointer group hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-2 transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(34,197,94,0.1) 100%)',
              borderColor: 'rgba(16,185,129,0.3)'
            }}
            onClick={() => setEditing(true)}
          >
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 bg-emerald-500/30 text-emerald-400 border-2 border-emerald-500/50">
                <Car className="w-10 h-10" />
              </div>
              <div className="flex-1 pt-2">
                <h2 className="text-2xl font-bold mb-1">
                  {vehicle.make} {vehicle.model}
                </h2>
                <p className="text-xl font-semibold mb-4 text-emerald-300">
                  {vehicle.color}
                </p>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <div className="px-3 py-1 rounded-full font-medium bg-emerald-900/50 text-emerald-200 border border-emerald-500/30">
                    Saved
                  </div>
                  <Edit3 className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`${hasVehicle && !editing ? 'hidden' : ''}`}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                Make *
              </label>
              <input
                className={`w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium text-lg ${inputBg} ${inputText}`}
                placeholder="Toyota"
                value={vehicle.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                  Model *
                </label>
                <input
                  className={`w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium ${inputBg} ${inputText}`}
                  placeholder="Camry"
                  value={vehicle.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 uppercase tracking-wide text-slate-300">
                  Color *
                </label>
                <input
                  className={`w-full p-5 rounded-2xl border-2 focus:ring-4 focus:ring-emerald-500/20 transition-all font-medium ${inputBg} ${inputText}`}
                  placeholder="Silver"
                  value={vehicle.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <button
            onClick={saveVehicle}
            disabled={saving || (!vehicle.make || !vehicle.model || !vehicle.color)}
            className={`mt-10 w-full py-5 px-8 rounded-3xl font-bold text-lg shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 mx-auto ${
              (!vehicle.make || !vehicle.model || !vehicle.color) 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:scale-[1.02] hover:shadow-3xl hover:-translate-y-1'
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
                Save Vehicle Profile
              </>
            )}
          </button>
        </div>

        {hasVehicle && !editing && (
          <button
            onClick={deleteVehicle}
            className="mt-6 w-full py-4 px-8 rounded-2xl font-semibold transition-all border-2 flex items-center justify-center gap-3 border-red-500/50 hover:border-red-400 hover:bg-red-900/30 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-5 h-5" />
            Remove Vehicle Profile
          </button>
        )}

        {savedSuccess && (
          <div className="mt-8 p-8 rounded-3xl text-center font-bold shadow-2xl bg-gradient-to-r from-emerald-900/80 to-emerald-800/80 border-4 border-emerald-500/80 text-emerald-100 backdrop-blur-sm">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-emerald-400" />
            <div className="text-2xl mb-2">Vehicle Saved!</div>
            <div className="text-lg text-emerald-200">
              Your {vehicle.make} {vehicle.model} ({vehicle.color}) is now linked to your parking sessions
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
