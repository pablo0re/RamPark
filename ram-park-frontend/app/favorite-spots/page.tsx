"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Star, MapPin, Plus, Trash2, Search } from 'lucide-react';

export default function FavoriteSpotsPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const pageBg = 'bg-[#0d2818]';
  const cardBg = 'bg-[#142a1e] border-[#2a5438]';
  const textColor = 'text-slate-50';
  const subtitleColor = 'text-emerald-200/80';
  const inputBg = 'bg-[#0d2818] border-[#2a5438] placeholder-slate-500 focus:border-emerald-400 focus:outline-none';

  const mockLots = [
    { id: 'lot15', name: 'Lot 15 - Student', spots: 51 },
    { id: 'lot15a', name: 'Lot 15A - Staff', spots: 46 },
    { id: 'lot18', name: 'Lot 18 - Student', spots: 120 },
     { id: 'lot20', name: 'Lot 20 - Visitor', spots: 32 },

    { id: 'slot1', name: 'Student Lot #1', spots: 51 },
    { id: 'slot2', name: 'Student Lot #2', spots: 45 },
    { id: 'slot3', name: 'Student Lot #3', spots: 44 },
    { id: 'slot4b', name: 'Student Lot #4b', spots: 50 },

    { id: 'slot5', name: 'Student Lot #5', spots: 51 },
    { id: 'slot5a', name: 'Student Lot #5a', spots: 46 },
    { id: 'slot6', name: 'Student Lot #6', spots: 100 },
    { id: 'slot7', name: 'Student Lot #7', spots: 39 },

    { id: 'spl9', name: 'Student Parking Lot #9', spots: 60 },
    { id: 'pls1', name: 'Parking Lot Staff', spots: 49 },
    { id: 'pls2', name: 'Parking Lot Staff #2', spots: 101 },
    { id: 'pls4a', name: 'Parking Lot Staff #4a', spots: 40 },

    { id: 'pls7a', name: 'Parking Lot Staff #7a', spots: 67 },
    { id: 'rsl10', name: 'Resident Student Lot #10', spots: 47 },
    { id: 'rsl11', name: 'Resident Student Lot #11', spots: 35 },
    { id: 'stpl12', name: 'Staff Parking Lot #12', spots: 99 },
    { id: 'stpl18', name: 'Staff Parking Lot #8', spots: 45 },
  ];

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data()?.favorites) {
          setFavorites(userDoc.data().favorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const addFavorite = async (lotId: string) => {
    if (!user || favorites.includes(lotId) || saving) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: arrayUnion(lotId)
      });
      setFavorites(prev => [...prev, lotId]);
    } catch (error) {
      console.error('Error adding favorite:', error);
      alert('Failed to add favorite');
    } finally {
      setSaving(false);
    }
  };

  const removeFavorite = async (lotId: string) => {
    if (!user || saving) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', user.uid), {
        favorites: arrayRemove(lotId)
      });
      setFavorites(prev => prev.filter(id => id !== lotId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    } finally {
      setSaving(false);
    }
  };

  const filteredLots = mockLots.filter(lot => 
    !favorites.includes(lot.id) && 
    lot.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteLots = mockLots.filter(lot => favorites.includes(lot.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d2818] flex items-center justify-center p-8">
        <div className="animate-spin w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${pageBg} ${textColor} p-6`}>
      <div className={`mx-auto max-w-4xl rounded-3xl border p-8 ${cardBg} shadow-2xl`}>
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-dashed border-[#2a5438]/50">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl bg-gradient-to-br from-yellow-500/30 to-amber-500/30 border-2 border-yellow-500/40">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Favorite Spots</h1>
            <p className={`${subtitleColor} text-lg`}>
              {favorites.length} {favorites.length === 1 ? 'favorite' : 'favorites'} saved
            </p>
          </div>
        </div>

        {favoriteLots.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400" />
              Your Favorites ({favoriteLots.length})
            </h2>
            
            <div className="space-y-4">
              {favoriteLots.map((lot, index) => (
                <div 
                  key={`${lot.id}-${index}`}
                  className="flex items-center justify-between p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/30 hover:border-yellow-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-yellow-500/20 border border-yellow-500/40">
                      <MapPin className="w-8 h-8 text-yellow-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl">
                        {lot.name}
                      </h3>
                      <p className="text-lg font-semibold text-amber-300">
                        {lot.spots} spots
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFavorite(lot.id)}
                    disabled={saving}
                    className="p-3 rounded-2xl hover:scale-110 transition-all text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-red-500/30"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center gap-3 mb-6">
            <Plus className="w-8 h-8 p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" />
            <h2 className="text-2xl font-bold">Add New Favorite</h2>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 font-medium text-lg ${inputBg} transition-all`}
              placeholder="Search lots (Lot 15, Lot 15A...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredLots.length > 0 ? (
            <div className="space-y-4">
              {filteredLots.map((lot, index) => (
                <div 
                  key={`${lot.id}-${index}`}
                  className="p-6 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer border group bg-gradient-to-r from-emerald-900/30 to-green-900/30 border-emerald-500/40 hover:border-emerald-400"
                  onClick={() => addFavorite(lot.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">
                          {lot.name}
                        </h3>
                        <p className="text-lg font-semibold text-emerald-300">
                          {lot.spots} spots
                        </p>
                      </div>
                    </div>
                    <button 
                      disabled={saving}
                      className={`px-6 py-3 rounded-2xl font-bold text-sm shadow-lg flex items-center gap-2 transition-all ${
                        saving 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/50'
                      } bg-emerald-500 hover:bg-emerald-600 text-slate-900`}
                    >
                      {saving ? (
                        <div className="animate-spin w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : searchTerm ? (
            <div className="p-12 text-center rounded-3xl border-2 border-dashed border-[#2a5438] bg-[#1a3d28]/50">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-bold mb-2">No lots found</h3>
              <p className={subtitleColor}>Try a different search</p>
            </div>
          ) : null}
        </div>

        {favorites.length === 0 && (
          <div className="mt-12 p-16 text-center rounded-3xl border-2 border-dashed border-[#2a5438] bg-[#1a3d28]/50">
            <Star className="w-20 h-20 mx-auto mb-6 text-slate-400" />
            <h3 className="text-2xl font-bold mb-4">No favorites yet</h3>
            <p className={`${subtitleColor} mb-8`}>
              Search for lots above to add your favorites
            </p>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-6 py-3 border border-emerald-500/30 text-emerald-300">
              <Plus className="w-4 h-4" />
              Start by searching lots
            </div>
          </div>
        )}
      </div>
    </div>
  );
}